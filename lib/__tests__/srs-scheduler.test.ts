/**
 * Tests for srs-scheduler.ts
 * Testing SRS scheduling algorithm
 */

import { describe, it, expect } from 'vitest';
import { scheduleNextReview, updateCardAfterReview, getDueCards } from '../srs-scheduler';
import { createMockSRSCard } from './mocks/mockData';

describe('SRS Scheduler', () => {
  describe('scheduleNextReview', () => {
    it('should schedule next review based on grade', () => {
      const card = createMockSRSCard();
      const nextReview = scheduleNextReview(card, 4); // Good

      expect(nextReview).toBeInstanceOf(Date);
      expect(nextReview.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it('should schedule sooner for failed cards', () => {
      const card = createMockSRSCard();
      const failedReview = scheduleNextReview(card, 1); // Fail
      const goodReview = scheduleNextReview(card, 4); // Good

      expect(failedReview.getTime()).toBeLessThan(goodReview.getTime());
    });

    it('should increase interval for perfect recalls', () => {
      const card = createMockSRSCard({ interval: 7 });
      const perfect = scheduleNextReview(card, 5); // Perfect

      const daysDiff = (perfect.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThan(7);
    });
  });

  describe('updateCardAfterReview', () => {
    it('should update ease factor based on performance', () => {
      const card = createMockSRSCard({ easeFactor: 2.5 });
      const updated = updateCardAfterReview(card, 4);

      expect(updated.easeFactor).toBeDefined();
      expect(updated.lastReviewed).toBeInstanceOf(Date);
    });

    it('should increment review count', () => {
      const card = createMockSRSCard({ reviewCount: 5 });
      const updated = updateCardAfterReview(card, 4);

      expect(updated.reviewCount).toBe(6);
    });

    it('should mark as leech after multiple failures', () => {
      const card = createMockSRSCard({ failCount: 7 });
      const updated = updateCardAfterReview(card, 1); // Fail again

      expect(updated.isLeech).toBe(true);
    });
  });

  describe('getDueCards', () => {
    it('should return cards due today or earlier', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const cards = [
        createMockSRSCard({ id: 'card-1', dueDate: pastDate }),
        createMockSRSCard({ id: 'card-2', dueDate: new Date() }),
      ];

      const due = getDueCards(cards);

      expect(due.length).toBe(2);
    });

    it('should not return future cards', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const cards = [
        createMockSRSCard({ id: 'card-1', dueDate: futureDate }),
      ];

      const due = getDueCards(cards);

      expect(due).toHaveLength(0);
    });

    it('should sort by due date (oldest first)', () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const cards = [
        createMockSRSCard({ id: 'card-today', dueDate: today }),
        createMockSRSCard({ id: 'card-week', dueDate: lastWeek }),
        createMockSRSCard({ id: 'card-yesterday', dueDate: yesterday }),
      ];

      const due = getDueCards(cards);

      expect(due[0].id).toBe('card-week');
      expect(due[1].id).toBe('card-yesterday');
      expect(due[2].id).toBe('card-today');
    });
  });
});
