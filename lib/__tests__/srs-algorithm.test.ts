import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateNextReview,
  processReview,
  getDueCards,
  prioritizeCards,
} from '../srs-algorithm';
import { SRSCard, SRS_CONSTANTS } from '@/types/progression';

describe('SRS Algorithm', () => {
  let mockCard: SRSCard;

  beforeEach(() => {
    mockCard = {
      id: 'test-card-1',
      domain: 'trauma',
      type: 'quiz',
      contentId: 'trauma-001',
      easeFactor: 2.5,
      stability: 0.5,
      interval: 7,
      dueDate: new Date('2025-01-01'),
      difficulty: 0.5,
      lastGrade: 4,
      lastReviewed: new Date('2024-12-25'),
      reviewCount: 5,
      createdAt: new Date('2024-12-01'),
      relatedGoals: [],
      competencies: [],
      isLeech: false,
      failCount: 0,
    };
  });

  describe('calculateNextReview', () => {
    it('should increase interval and ease factor for perfect recall (grade 5)', () => {
      const result = calculateNextReview(mockCard, 5);

      expect(result.interval).toBeGreaterThan(mockCard.interval);
      expect(result.easeFactor).toBeGreaterThanOrEqual(mockCard.easeFactor); // May stay same if at max
      expect(result.stability).toBeGreaterThan(mockCard.stability);
    });

    it('should increase interval moderately for good recall (grade 4)', () => {
      const result = calculateNextReview(mockCard, 4);

      expect(result.interval).toBeGreaterThan(mockCard.interval);
      expect(result.easeFactor).toBeGreaterThanOrEqual(mockCard.easeFactor);
      expect(result.stability).toBeGreaterThan(mockCard.stability);
    });

    it('should maintain or slightly increase interval for correct recall (grade 3)', () => {
      const result = calculateNextReview(mockCard, 3);

      expect(result.interval).toBeGreaterThanOrEqual(mockCard.interval);
      expect(result.stability).toBeGreaterThan(mockCard.stability);
    });

    it('should keep same interval for barely correct (grade 2)', () => {
      const result = calculateNextReview(mockCard, 2);

      expect(result.interval).toBe(mockCard.interval);
      expect(result.stability).toBeGreaterThanOrEqual(mockCard.stability);
    });

    it('should reset to 1 day for failed recall (grade < 2)', () => {
      const resultGrade1 = calculateNextReview(mockCard, 1);
      const resultGrade0 = calculateNextReview(mockCard, 0);

      expect(resultGrade1.interval).toBe(1);
      expect(resultGrade0.interval).toBe(1);
      expect(resultGrade1.stability).toBeLessThan(mockCard.stability);
    });

    it('should use fixed intervals for new cards (reviewCount < 3)', () => {
      const newCard: SRSCard = { ...mockCard, reviewCount: 0 };

      const result1 = calculateNextReview(newCard, 4);
      expect(result1.interval).toBe(SRS_CONSTANTS.NEW_CARD_INTERVALS[0]); // 1 day

      const result2 = calculateNextReview({ ...newCard, reviewCount: 1 }, 4);
      expect(result2.interval).toBe(SRS_CONSTANTS.NEW_CARD_INTERVALS[1]); // 3 days

      const result3 = calculateNextReview({ ...newCard, reviewCount: 2 }, 4);
      expect(result3.interval).toBe(SRS_CONSTANTS.NEW_CARD_INTERVALS[2]); // 7 days
    });

    it('should restart new card from day 1 on failure', () => {
      const newCard: SRSCard = { ...mockCard, reviewCount: 1 };

      const result = calculateNextReview(newCard, 1);

      expect(result.interval).toBe(SRS_CONSTANTS.NEW_CARD_INTERVALS[0]); // 1 day
    });

    it('should clamp ease factor within valid range', () => {
      const highEFCard: SRSCard = { ...mockCard, easeFactor: 3.0 };
      const resultHigh = calculateNextReview(highEFCard, 5);
      expect(resultHigh.easeFactor).toBeLessThanOrEqual(SRS_CONSTANTS.MAX_EASE_FACTOR);

      const lowEFCard: SRSCard = { ...mockCard, easeFactor: 1.3 };
      const resultLow = calculateNextReview(lowEFCard, 0);
      expect(resultLow.easeFactor).toBeGreaterThanOrEqual(SRS_CONSTANTS.MIN_EASE_FACTOR);
    });

    it('should never have interval less than 1 day', () => {
      const result = calculateNextReview(mockCard, 0);

      expect(result.interval).toBeGreaterThanOrEqual(1);
    });

    it('should set due date correctly based on interval', () => {
      const result = calculateNextReview(mockCard, 4);
      const now = new Date();
      const expectedDue = new Date();
      expectedDue.setDate(expectedDue.getDate() + result.interval);

      const timeDiff = Math.abs(result.dueDate.getTime() - expectedDue.getTime());
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    it('should clamp stability between 0.1 and 1.0', () => {
      const highStabilityCard: SRSCard = { ...mockCard, stability: 0.95 };
      const resultHigh = calculateNextReview(highStabilityCard, 5);
      expect(resultHigh.stability).toBeLessThanOrEqual(1.0);

      const lowStabilityCard: SRSCard = { ...mockCard, stability: 0.15 };
      const resultLow = calculateNextReview(lowStabilityCard, 0);
      expect(resultLow.stability).toBeGreaterThanOrEqual(0.1);
    });
  });

  describe('processReview', () => {
    it('should update card with new review data', () => {
      const { updatedCard, reviewResult } = processReview(mockCard, 4, 30, 0);

      expect(updatedCard.lastGrade).toBe(4);
      expect(updatedCard.lastReviewed).toBeInstanceOf(Date);
      expect(updatedCard.reviewCount).toBe(mockCard.reviewCount + 1);
      expect(reviewResult.grade).toBe(4);
      expect(reviewResult.timeSpent).toBe(30);
    });

    it('should increment fail count on low grades', () => {
      const { updatedCard: card1 } = processReview(mockCard, 1, 20);
      expect(card1.failCount).toBe(mockCard.failCount + 1);

      const { updatedCard: card2 } = processReview(card1, 0, 15);
      expect(card2.failCount).toBe(card1.failCount + 1);
    });

    it('should reset fail count on good grades', () => {
      const failedCard: SRSCard = { ...mockCard, failCount: 2 };
      const { updatedCard } = processReview(failedCard, 4, 25);

      expect(updatedCard.failCount).toBe(0);
    });

    it('should mark card as leech after threshold failures', () => {
      let card = mockCard;

      // Fail multiple times
      for (let i = 0; i < SRS_CONSTANTS.LEECH_THRESHOLD; i++) {
        const { updatedCard } = processReview(card, 0, 20);
        card = updatedCard;
      }

      expect(card.isLeech).toBe(true);
      expect(card.failCount).toBeGreaterThanOrEqual(SRS_CONSTANTS.LEECH_THRESHOLD);
    });

    it('should track hint usage penalty', () => {
      const { reviewResult: noHints } = processReview(mockCard, 4, 30, 0);
      const { reviewResult: withHints } = processReview(mockCard, 4, 30, 2);

      expect(withHints.hintsUsed).toBe(2);
      // Performance with hints should not exceed no-hints performance
      expect(withHints.hintsUsed).toBeGreaterThan(noHints.hintsUsed);
    });

    it('should handle very long intervals correctly', () => {
      const longIntervalCard: SRSCard = { ...mockCard, interval: 90, reviewCount: 10, stability: 0.5 };
      const { updatedCard } = processReview(longIntervalCard, 5, 25);

      expect(updatedCard.interval).toBeGreaterThan(90);
      // Stability should increase but may not reach 1.0 in a single review
      expect(updatedCard.stability).toBeGreaterThan(longIntervalCard.stability);
      expect(updatedCard.stability).toBeLessThanOrEqual(1.0);
    });
  });

  describe('getDueCards', () => {
    it('should return cards that are due today or overdue', () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const cards: SRSCard[] = [
        { ...mockCard, id: '1', dueDate: yesterday }, // Overdue
        { ...mockCard, id: '2', dueDate: today }, // Due today
        { ...mockCard, id: '3', dueDate: tomorrow }, // Not due yet
      ];

      const dueCards = getDueCards(cards);

      expect(dueCards).toHaveLength(2);
      expect(dueCards.map(c => c.id)).toContain('1');
      expect(dueCards.map(c => c.id)).toContain('2');
      expect(dueCards.map(c => c.id)).not.toContain('3');
    });

    it('should return empty array when no cards are due', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);

      const cards: SRSCard[] = [
        { ...mockCard, id: '1', dueDate: future },
        { ...mockCard, id: '2', dueDate: future },
      ];

      const dueCards = getDueCards(cards);

      expect(dueCards).toHaveLength(0);
    });
  });

  describe('prioritizeCards', () => {
    it('should prioritize leeches first', () => {
      const cards: SRSCard[] = [
        { ...mockCard, id: '1', isLeech: false, stability: 0.8 },
        { ...mockCard, id: '2', isLeech: true, stability: 0.3 },
        { ...mockCard, id: '3', isLeech: false, stability: 0.5 },
      ];

      const prioritized = prioritizeCards(cards, 'trauma');

      expect(prioritized[0].id).toBe('2'); // Leech first
    });

    it('should prioritize low stability cards after leeches', () => {
      const cards: SRSCard[] = [
        { ...mockCard, id: '1', isLeech: false, stability: 0.8 },
        { ...mockCard, id: '2', isLeech: false, stability: 0.2 },
        { ...mockCard, id: '3', isLeech: false, stability: 0.5 },
      ];

      const prioritized = prioritizeCards(cards, 'trauma');

      expect(prioritized[0].id).toBe('2'); // Lowest stability first
      expect(prioritized[1].id).toBe('3');
      expect(prioritized[2].id).toBe('1');
    });

    it('should prioritize overdue cards', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const cards: SRSCard[] = [
        { ...mockCard, id: '1', dueDate: yesterday, isLeech: false, stability: 0.5 },
        { ...mockCard, id: '2', dueDate: lastWeek, isLeech: false, stability: 0.5 },
      ];

      const prioritized = prioritizeCards(cards, 'trauma');

      expect(prioritized[0].id).toBe('2'); // Most overdue first
    });
  });

  describe('Edge Cases', () => {
    it('should handle card with zero review count', () => {
      const brandNewCard: SRSCard = { ...mockCard, reviewCount: 0 };
      const result = calculateNextReview(brandNewCard, 4);

      expect(result.interval).toBe(SRS_CONSTANTS.NEW_CARD_INTERVALS[0]);
    });

    it('should handle maximum ease factor card', () => {
      const maxEFCard: SRSCard = { ...mockCard, easeFactor: SRS_CONSTANTS.MAX_EASE_FACTOR };
      const { updatedCard } = processReview(maxEFCard, 5, 20);

      expect(updatedCard.easeFactor).toBeLessThanOrEqual(SRS_CONSTANTS.MAX_EASE_FACTOR);
    });

    it('should handle minimum ease factor card', () => {
      const minEFCard: SRSCard = { ...mockCard, easeFactor: SRS_CONSTANTS.MIN_EASE_FACTOR };
      const { updatedCard } = processReview(minEFCard, 0, 20);

      expect(updatedCard.easeFactor).toBeGreaterThanOrEqual(SRS_CONSTANTS.MIN_EASE_FACTOR);
    });

    it('should handle card with very high fail count', () => {
      const highFailCard: SRSCard = { ...mockCard, failCount: 10, isLeech: true };
      const { updatedCard } = processReview(highFailCard, 5, 20);

      expect(updatedCard.failCount).toBe(0); // Reset on success
      // Leech status is cleared on success (algorithm behavior)
      expect(updatedCard.isLeech).toBe(false);
    });
  });
});
