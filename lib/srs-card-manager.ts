/**
 * SRS Card Manager
 * Converts questions, cases, and other content into SRS cards
 * Manages card lifecycle and integration with question bank
 */

import { SRSCard, SubCompetency } from '@/types/progression';
import { CaseStudy } from '@/types/education';
import { MCQQuestion } from '@/data/questions';
import { Domain } from '@/types/onboarding';
import { createSRSCard } from './srs-algorithm';

/**
 * Creates an SRS card from an MCQ question
 *
 * @param question - MCQ question to convert
 * @param userAnswered - Whether user answered correctly
 * @param hintsUsed - Number of hints used (for tutor mode)
 * @param timeSpent - Time spent answering (seconds)
 * @returns New SRS card
 */
export function createCardFromQuestion(
  question: MCQQuestion,
  userAnswered?: boolean,
  hintsUsed: number = 0,
  timeSpent: number = 60
): SRSCard {
  const competencies = extractCompetenciesFromQuestion(question);

  return createSRSCard({
    id: `card-q-${question.id}-${Date.now()}`,
    domain: question.domain as Domain,
    type: 'quiz',
    contentId: question.id,
    difficulty: getDifficultyFromBand(question.band),
    relatedGoals: question.relatedGoals || [],
    competencies,
  });
}

/**
 * Creates an SRS card from a case study
 *
 * @param caseStudy - Case study to convert
 * @param performance - User's performance on the case
 * @returns New SRS card
 */
export function createCardFromCase(
  caseStudy: CaseStudy,
  performance?: {
    questionsCorrect: number;
    totalQuestions: number;
    timeSpent: number;
  }
): SRSCard {
  const competencies = extractCompetenciesFromCase(caseStudy);

  return createSRSCard({
    id: `card-case-${caseStudy.id}-${Date.now()}`,
    domain: caseStudy.domain as Domain || 'trauma',
    type: 'microcase',
    contentId: caseStudy.id,
    difficulty: getDifficultyFromLevel(caseStudy.level),
    relatedGoals: caseStudy.relatedGoals || [],
    competencies,
  });
}

/**
 * Creates multiple SRS cards from a session's completed content
 *
 * @param questions - Questions answered in session
 * @param cases - Cases completed in session
 * @param performance - Per-item performance data
 * @returns Array of new SRS cards
 */
export function createCardsFromSession(params: {
  questions: Array<{
    question: MCQQuestion;
    correct: boolean;
    hintsUsed: number;
    timeSpent: number;
  }>;
  cases?: Array<{
    caseStudy: CaseStudy;
    questionsCorrect: number;
    totalQuestions: number;
    timeSpent: number;
  }>;
}): SRSCard[] {
  const cards: SRSCard[] = [];

  // Create cards from questions
  params.questions.forEach((item) => {
    const card = createCardFromQuestion(
      item.question,
      item.correct,
      item.hintsUsed,
      item.timeSpent
    );
    cards.push(card);
  });

  // Create cards from cases
  if (params.cases) {
    params.cases.forEach((item) => {
      const card = createCardFromCase(item.caseStudy, {
        questionsCorrect: item.questionsCorrect,
        totalQuestions: item.totalQuestions,
        timeSpent: item.timeSpent,
      });
      cards.push(card);
    });
  }

  return cards;
}

/**
 * Extracts competencies from MCQ question
 * Maps question tags and competency field to SubCompetency types
 */
function extractCompetenciesFromQuestion(
  question: MCQQuestion
): SubCompetency[] {
  const competencies: SubCompetency[] = [];

  // Map from question competency type
  const competencyMap: Record<string, SubCompetency> = {
    'medicinsk-kunskap': 'diagnostik',
    'klinisk-färdighet': 'akuta-flöden',
    'kommunikation': 'kommunikation',
  };

  if (question.competency && competencyMap[question.competency]) {
    competencies.push(competencyMap[question.competency]);
  }

  // Extract from tags
  if (question.tags) {
    if (
      question.tags.some((tag) =>
        ['akut', 'trauma', 'fraktur', 'emergency'].includes(tag.toLowerCase())
      )
    ) {
      competencies.push('akuta-flöden');
    }
    if (
      question.tags.some((tag) =>
        ['operation', 'kirurgi', 'surgical', 'orif'].includes(tag.toLowerCase())
      )
    ) {
      competencies.push('operativa-principer');
    }
    if (
      question.tags.some((tag) =>
        ['komplikation', 'complication', 'risk'].includes(tag.toLowerCase())
      )
    ) {
      competencies.push('komplikationer');
    }
    if (
      question.tags.some((tag) =>
        ['röntgen', 'ct', 'mri', 'imaging', 'radiologi'].includes(
          tag.toLowerCase()
        )
      )
    ) {
      competencies.push('bildtolkning');
    }
    if (
      question.tags.some((tag) =>
        ['evidens', 'studie', 'rct', 'guidelines'].includes(tag.toLowerCase())
      )
    ) {
      competencies.push('evidens');
    }
  }

  // Default to diagnostik if no competencies found
  return competencies.length > 0 ? [...new Set(competencies)] : ['diagnostik'];
}

/**
 * Extracts competencies from case study
 */
function extractCompetenciesFromCase(caseStudy: CaseStudy): SubCompetency[] {
  const competencies: SubCompetency[] = [];

  // Cases always involve diagnostik
  competencies.push('diagnostik');

  // Check scenario for keywords
  const scenarioText = caseStudy.scenario.toLowerCase();

  if (
    scenarioText.includes('akut') ||
    scenarioText.includes('trauma') ||
    scenarioText.includes('emergency')
  ) {
    competencies.push('akuta-flöden');
  }

  if (
    scenarioText.includes('operation') ||
    scenarioText.includes('kirurgi') ||
    scenarioText.includes('surgical')
  ) {
    competencies.push('operativa-principer');
  }

  if (
    scenarioText.includes('komplikation') ||
    scenarioText.includes('complication')
  ) {
    competencies.push('komplikationer');
  }

  // Cases often involve communication
  competencies.push('kommunikation');

  return [...new Set(competencies)];
}

/**
 * Converts difficulty band (A-E) to difficulty score (0-1)
 */
function getDifficultyFromBand(
  band: 'A' | 'B' | 'C' | 'D' | 'E'
): number {
  const scores: Record<string, number> = {
    A: 0.2,
    B: 0.4,
    C: 0.6,
    D: 0.8,
    E: 1.0,
  };
  return scores[band] || 0.5;
}

/**
 * Converts education level to difficulty score
 */
function getDifficultyFromLevel(
  level: string
): number {
  const scores: Record<string, number> = {
    student: 0.2,
    at: 0.3,
    st1: 0.4,
    st2: 0.5,
    st3: 0.6,
    st4: 0.7,
    st5: 0.8,
    specialist: 0.9,
  };
  return scores[level] || 0.5;
}

/**
 * Checks if a card should be created for content
 * Avoids duplicates and respects user preferences
 *
 * @param contentId - Content ID to check
 * @param existingCards - User's existing SRS cards
 * @returns True if card should be created
 */
export function shouldCreateCard(
  contentId: string,
  existingCards: SRSCard[]
): boolean {
  // Don't create duplicate cards
  const exists = existingCards.some((card) => card.contentId === contentId);
  return !exists;
}

/**
 * Gets all content IDs that have SRS cards
 * Useful for marking content as "reviewed" in UI
 *
 * @param cards - User's SRS cards
 * @returns Set of content IDs
 */
export function getReviewedContentIds(cards: SRSCard[]): Set<string> {
  return new Set(cards.map((card) => card.contentId));
}

/**
 * Filters cards by domain
 *
 * @param cards - All SRS cards
 * @param domain - Domain to filter by
 * @returns Filtered cards
 */
export function getCardsByDomain(
  cards: SRSCard[],
  domain: Domain
): SRSCard[] {
  return cards.filter((card) => card.domain === domain);
}

/**
 * Gets cards related to specific Socialstyrelsen goals
 *
 * @param cards - All SRS cards
 * @param goalIds - Goal IDs to match
 * @returns Cards related to these goals
 */
export function getCardsByGoals(
  cards: SRSCard[],
  goalIds: string[]
): SRSCard[] {
  return cards.filter((card) =>
    card.relatedGoals?.some((goalId) => goalIds.includes(goalId))
  );
}

/**
 * Gets statistics about user's SRS card collection
 *
 * @param cards - User's SRS cards
 * @returns Statistics object
 */
export function getCardStatistics(cards: SRSCard[]): {
  total: number;
  byDomain: Record<Domain, number>;
  byType: Record<string, number>;
  avgStability: number;
  avgInterval: number;
  leeches: number;
} {
  const stats = {
    total: cards.length,
    byDomain: {} as Record<Domain, number>,
    byType: {} as Record<string, number>,
    avgStability: 0,
    avgInterval: 0,
    leeches: 0,
  };

  if (cards.length === 0) return stats;

  // Count by domain
  cards.forEach((card) => {
    stats.byDomain[card.domain] = (stats.byDomain[card.domain] || 0) + 1;
    stats.byType[card.type] = (stats.byType[card.type] || 0) + 1;
    if (card.isLeech) stats.leeches++;
  });

  // Calculate averages
  stats.avgStability =
    cards.reduce((sum, card) => sum + card.stability, 0) / cards.length;
  stats.avgInterval =
    cards.reduce((sum, card) => sum + card.interval, 0) / cards.length;

  return stats;
}
