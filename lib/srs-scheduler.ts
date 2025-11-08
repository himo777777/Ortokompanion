/**
 * SRS Scheduler - Wrapper for SRS Algorithm
 * 
 * Re-exports core SRS scheduling functions with test-friendly names.
 * The actual implementation is in srs-algorithm.ts
 */

import {
  calculateNextReview,
  processReview,
  getDueCards as getDueCardsFromAlgorithm,
} from './srs-algorithm';
import type { SRSCard, SRSGrade } from '@/types/progression';

/**
 * Schedule the next review date for an SRS card based on performance grade
 * 
 * @param card - The SRS card to schedule
 * @param grade - Performance grade (1-5)
 * @returns Next review date
 */
export function scheduleNextReview(card: SRSCard, grade: SRSGrade): Date {
  const result = calculateNextReview(card, grade);
  return result.dueDate;
}

/**
 * Update an SRS card after a review session
 *
 * @param card - The SRS card to update
 * @param grade - Performance grade (1-5)
 * @returns Updated SRS card with new stats
 */
export function updateCardAfterReview(card: SRSCard, grade: SRSGrade): SRSCard {
  const result = processReview(card, grade, 60); // Default 60 seconds
  return result.updatedCard;
}

/**
 * Get all cards that are due for review, sorted by due date (oldest first)
 * 
 * @param cards - Array of SRS cards
 * @returns Array of cards due for review
 */
export function getDueCards(cards: SRSCard[]): SRSCard[] {
  return getDueCardsFromAlgorithm(cards);
}
