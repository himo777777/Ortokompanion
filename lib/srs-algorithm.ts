/**
 * Spaced Repetition System (SRS) Algorithm
 * SM-2 inspired implementation for OrtoKompanion
 *
 * Core functions:
 * - Calculate next interval based on grade
 * - Update ease factor
 * - Detect leeches
 * - Prioritize due cards
 */

import {
  SRSCard,
  SRSGrade,
  SRSReviewResult,
  SRS_CONSTANTS,
  SRSCardType,
  SubCompetency,
} from '@/types/progression';
import { Domain } from '@/types/onboarding';
import { toDomain, toSRSCardType, toSubCompetencies } from '@/lib/ai-utils';

/**
 * Calculate next interval and ease factor based on user grade
 *
 * Algorithm (SM-2 inspired):
 * 1. Update ease factor: EF' = clamp(EF + (0.1 - (5 - grade)*(0.08 + (5 - grade)*0.02)), MIN_EF, MAX_EF)
 * 2. For new cards: use fixed intervals [1, 3, 7]
 * 3. For reviewed cards: I_next = I * EF'
 * 4. Update stability based on grade and interval
 *
 * @param card - Current SRS card
 * @param grade - User grade (0-5)
 * @returns Updated card with new interval, ease factor, and due date
 */
export function calculateNextReview(
  card: SRSCard,
  grade: SRSGrade
): {
  easeFactor: number;
  interval: number;
  dueDate: Date;
  stability: number;
} {
  const { easeFactor: currentEF, interval: currentInterval, reviewCount } = card;

  // Calculate new ease factor
  // Formula: EF' = EF + (0.1 - (5 - grade)*(0.08 + (5 - grade)*0.02))
  const efDelta = 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
  let newEF = currentEF + efDelta;

  // Clamp ease factor to valid range
  newEF = Math.max(SRS_CONSTANTS.MIN_EASE_FACTOR, Math.min(SRS_CONSTANTS.MAX_EASE_FACTOR, newEF));

  // Calculate new interval
  let newInterval: number;

  if (reviewCount < 3) {
    // New card - use fixed intervals
    if (grade >= 3) {
      // Correct answer - advance to next stage
      newInterval = SRS_CONSTANTS.NEW_CARD_INTERVALS[reviewCount] || 7;
    } else {
      // Incorrect - restart from day 1
      newInterval = SRS_CONSTANTS.NEW_CARD_INTERVALS[0];
    }
  } else {
    // Established card - use ease factor
    if (grade >= 3) {
      // Correct - multiply by ease factor
      newInterval = Math.round(currentInterval * newEF);
    } else if (grade === 2) {
      // Barely correct - keep same interval
      newInterval = currentInterval;
    } else {
      // Incorrect - reset to short interval
      newInterval = 1;
    }
  }

  // Ensure minimum interval of 1 day
  newInterval = Math.max(1, newInterval);

  // Calculate new due date
  const newDueDate = new Date();
  newDueDate.setDate(newDueDate.getDate() + newInterval);

  // Update stability based on grade and interval
  // Stability increases with correct answers and longer intervals
  let newStability = card.stability;

  if (grade >= 4) {
    // Strong recall - increase stability significantly
    newStability = Math.min(1.0, newStability + 0.15);
  } else if (grade === 3) {
    // Good recall - moderate increase
    newStability = Math.min(1.0, newStability + 0.08);
  } else if (grade === 2) {
    // Barely correct - small increase
    newStability = Math.min(1.0, newStability + 0.03);
  } else {
    // Incorrect - decrease stability
    newStability = Math.max(0.1, newStability - 0.15);
  }

  // Stability also increases with successful long intervals
  if (grade >= 3 && currentInterval >= 7) {
    newStability = Math.min(1.0, newStability + 0.05);
  }

  return {
    easeFactor: newEF,
    interval: newInterval,
    dueDate: newDueDate,
    stability: newStability,
  };
}

/**
 * Process a review and update the card
 *
 * @param card - SRS card being reviewed
 * @param grade - User grade (0-5)
 * @param timeSpent - Time spent on review (seconds)
 * @param hintsUsed - Number of hints used
 * @returns Updated card and review result
 */
export function processReview(
  card: SRSCard,
  grade: SRSGrade,
  timeSpent: number,
  hintsUsed: number = 0
): {
  updatedCard: SRSCard;
  reviewResult: SRSReviewResult;
} {
  const now = new Date();

  // Calculate next review parameters
  const { easeFactor, interval, dueDate, stability } = calculateNextReview(card, grade);

  // Check for leech (repeated failures)
  let isLeech = card.isLeech;
  let failCount = card.failCount;

  if (grade < 2) {
    // Failed or barely passed
    failCount++;
    if (failCount >= SRS_CONSTANTS.LEECH_THRESHOLD) {
      isLeech = true;
    }
  } else if (grade >= 3) {
    // Successful review - reset fail count
    failCount = 0;
    isLeech = false;
  }

  // Create updated card
  const updatedCard: SRSCard = {
    ...card,
    easeFactor,
    stability,
    interval,
    dueDate,
    lastGrade: grade,
    lastReviewed: now,
    reviewCount: card.reviewCount + 1,
    isLeech,
    failCount,
  };

  // Create review result
  const reviewResult: SRSReviewResult = {
    cardId: card.id,
    grade,
    timeSpent,
    hintsUsed,
    timestamp: now,
    newEaseFactor: easeFactor,
    newInterval: interval,
    newDueDate: dueDate,
  };

  return {
    updatedCard,
    reviewResult,
  };
}

/**
 * Calculate urgency score for a card
 * Used to prioritize which cards to review first
 *
 * Urgency = dueSoon * lowStability * domainRecency
 *
 * @param card - SRS card
 * @param primaryDomain - User's current primary domain
 * @param recentDomains - Recently studied domains
 * @returns Urgency score (higher = more urgent)
 */
export function calculateUrgency(
  card: SRSCard,
  primaryDomain: string,
  recentDomains: string[] = []
): number {
  const now = new Date();
  const dueTime = card.dueDate.getTime();
  const nowTime = now.getTime();

  // How overdue is the card? (in days)
  const daysOverdue = Math.max(0, (nowTime - dueTime) / (1000 * 60 * 60 * 24));

  // dueSoon factor (0-1, higher if more overdue)
  const dueSoon = Math.min(1.0, daysOverdue / 7); // Caps at 1 week overdue

  // lowStability factor (0-1, higher if less stable)
  const lowStability = 1.0 - card.stability;

  // domainRecency factor (0-1, higher if in primary or recent domains)
  let domainRecency = 0.5; // default
  if (card.domain === primaryDomain) {
    domainRecency = 1.0;
  } else if (recentDomains.includes(card.domain)) {
    domainRecency = 0.7;
  }

  // Calculate urgency
  const urgency = dueSoon * lowStability * domainRecency;

  return urgency;
}

/**
 * Get cards due for review today
 *
 * @param cards - All SRS cards
 * @returns Cards that are due today or overdue
 */
export function getDueCards(cards: SRSCard[]): SRSCard[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today

  return cards
    .filter((card) => {
      const dueDate = new Date(card.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate <= now;
    })
    .sort((a, b) => {
      // Sort by due date (oldest first)
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return dateA - dateB;
    });
}

/**
 * Prioritize cards for review
 * Returns cards sorted by urgency (most urgent first)
 *
 * @param cards - Cards to prioritize
 * @param primaryDomain - User's primary domain
 * @param recentDomains - Recently studied domains
 * @param limit - Maximum number of cards to return
 * @returns Sorted and limited list of cards
 */
export function prioritizeCards(
  cards: SRSCard[],
  primaryDomain: string,
  recentDomains: string[] = [],
  limit?: number
): SRSCard[] {
  // Calculate urgency for each card
  const cardsWithUrgency = cards.map((card) => ({
    card,
    urgency: calculateUrgency(card, primaryDomain, recentDomains),
  }));

  // Sort by urgency (descending)
  cardsWithUrgency.sort((a, b) => b.urgency - a.urgency);

  // Extract cards
  let sortedCards = cardsWithUrgency.map((item) => item.card);

  // Apply limit if specified
  if (limit !== undefined && limit > 0) {
    sortedCards = sortedCards.slice(0, limit);
  }

  return sortedCards;
}

/**
 * Detect leech cards (problematic cards that need remedial work)
 *
 * @param cards - All SRS cards
 * @returns Cards marked as leeches
 */
export function detectLeeches(cards: SRSCard[]): SRSCard[] {
  return cards.filter((card) => card.isLeech);
}

/**
 * Get average stability for a set of cards
 * Used for domain gate requirements
 *
 * @param cards - Cards to analyze
 * @returns Average stability (0-1)
 */
export function getAverageStability(cards: SRSCard[]): number {
  if (cards.length === 0) return 0;

  const totalStability = cards.reduce((sum, card) => sum + card.stability, 0);
  return totalStability / cards.length;
}

/**
 * Get cards for a specific domain
 *
 * @param cards - All SRS cards
 * @param domain - Domain to filter by
 * @returns Cards in the specified domain
 */
export function getCardsByDomain(cards: SRSCard[], domain: string): SRSCard[] {
  return cards.filter((card) => card.domain === domain);
}

/**
 * Get the last N reviewed cards for a domain
 * Used for gate stability check (last 10 cards)
 *
 * @param cards - All SRS cards
 * @param domain - Domain to filter by
 * @param count - Number of cards to return (default 10)
 * @returns Last N reviewed cards, sorted by review date (most recent first)
 */
export function getLastReviewedCards(
  cards: SRSCard[],
  domain: string,
  count: number = 10
): SRSCard[] {
  // Filter by domain and only include reviewed cards
  const domainCards = cards.filter(
    (card) => card.domain === domain && card.lastReviewed !== null
  );

  // Sort by last reviewed date (most recent first)
  domainCards.sort((a, b) => {
    if (!a.lastReviewed || !b.lastReviewed) return 0;
    return b.lastReviewed.getTime() - a.lastReviewed.getTime();
  });

  // Return top N
  return domainCards.slice(0, count);
}

/**
 * Create a new SRS card
 *
 * @param params - Card parameters
 * @returns New SRS card with default values
 */
export function createSRSCard(params: {
  id: string;
  domain: string;
  type: string;
  contentId: string;
  difficulty?: number;
  relatedGoals?: string[];
  competencies: string[];
}): SRSCard {
  // Safely convert types
  const validDomain = toDomain(params.domain);
  const validType = toSRSCardType(params.type);
  const validCompetencies = toSubCompetencies(params.competencies);

  // Use fallback values if conversion fails
  return {
    id: params.id,
    domain: (validDomain as Domain) || 'trauma', // Default fallback
    type: (validType as SRSCardType) || 'quiz', // Default fallback
    contentId: params.contentId,
    easeFactor: SRS_CONSTANTS.INITIAL_EASE_FACTOR,
    stability: SRS_CONSTANTS.INITIAL_STABILITY,
    interval: SRS_CONSTANTS.INITIAL_INTERVAL,
    dueDate: new Date(), // Due today for new cards
    difficulty: params.difficulty || 0.5,
    lastGrade: null,
    lastReviewed: null,
    reviewCount: 0,
    createdAt: new Date(),
    relatedGoals: params.relatedGoals,
    competencies: validCompetencies as SubCompetency[],
    isLeech: false,
    failCount: 0,
  };
}

/**
 * Convert behavioral signals to SRS grade
 * Maps user behavior (correct/incorrect, hints used, time taken) to 0-5 grade
 *
 * @param params - Behavioral signals
 * @returns SRS grade (0-5)
 */
export function behaviorToGrade(params: {
  correct: boolean;
  hintsUsed: number;
  timeRatio: number; // actual time / expected time (0.5 = fast, 2.0 = slow)
  confidence?: number; // 0-1, self-reported or inferred
}): SRSGrade {
  const { correct, hintsUsed, timeRatio, confidence = 0.5 } = params;

  if (!correct) {
    // Failed
    if (confidence < 0.3) {
      return 0; // No idea
    } else if (hintsUsed >= 2) {
      return 1; // Wrong but learned something
    } else {
      return 2; // Wrong but close
    }
  } else {
    // Correct
    if (hintsUsed === 0 && timeRatio < 0.8) {
      // Fast and no hints
      return 5; // Perfect
    } else if (hintsUsed <= 1 && timeRatio < 1.2) {
      // Good performance
      return 4; // Good
    } else {
      // Correct but struggled
      return 3; // Okay
    }
  }
}
