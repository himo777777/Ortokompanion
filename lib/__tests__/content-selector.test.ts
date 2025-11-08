/**
 * Tests for content-selector.ts
 * Testing content selection and filtering logic
 */

import { describe, it, expect } from 'vitest';
import {
  selectQuestions,
  filterByBand,
  filterByDomain,
  prioritizeByGoals,
} from '../content-selector';

describe('Content Selector', () => {
  describe('selectQuestions', () => {
    it('should select requested number of questions', () => {
      const questions = selectQuestions({
        domain: 'trauma',
        band: 'C',
        count: 5,
        goals: [],
      });

      expect(questions.length).toBeLessThanOrEqual(5);
    });

    it('should respect domain filter', () => {
      const questions = selectQuestions({
        domain: 'trauma',
        band: 'C',
        count: 10,
        goals: [],
      });

      questions.forEach((q) => {
        expect(q.domain).toBe('trauma');
      });
    });

    it('should respect band filter', () => {
      const questions = selectQuestions({
        domain: 'trauma',
        band: 'C',
        count: 10,
        goals: [],
      });

      questions.forEach((q) => {
        expect(q.band).toBe('C');
      });
    });
  });

  describe('filterByBand', () => {
    it('should filter questions by exact band', () => {
      const mockQuestions = [
        { id: '1', band: 'A' },
        { id: '2', band: 'B' },
        { id: '3', band: 'C' },
      ];

      const filtered = filterByBand(mockQuestions as any, 'B');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].band).toBe('B');
    });

    it('should include adjacent bands when specified', () => {
      const mockQuestions = [
        { id: '1', band: 'A' },
        { id: '2', band: 'B' },
        { id: '3', band: 'C' },
        { id: '4', band: 'D' },
      ];

      const filtered = filterByBand(mockQuestions as any, 'C', true);

      expect(filtered.length).toBeGreaterThan(1);
      expect(filtered.some((q) => q.band === 'B' || q.band === 'D')).toBe(true);
    });
  });

  describe('filterByDomain', () => {
    it('should filter questions by domain', () => {
      const mockQuestions = [
        { id: '1', domain: 'trauma' },
        { id: '2', domain: 'höft' },
        { id: '3', domain: 'trauma' },
      ];

      const filtered = filterByDomain(mockQuestions as any, 'trauma');

      expect(filtered).toHaveLength(2);
      filtered.forEach((q) => {
        expect(q.domain).toBe('trauma');
      });
    });
  });

  describe('prioritizeByGoals', () => {
    it('should prioritize questions related to user goals', () => {
      const mockQuestions = [
        { id: '1', relatedGoals: ['st-trauma-001'] },
        { id: '2', relatedGoals: ['st-höft-001'] },
        { id: '3', relatedGoals: ['st-trauma-002'] },
      ];

      const prioritized = prioritizeByGoals(
        mockQuestions as any,
        ['st-trauma-001', 'st-trauma-002']
      );

      // First questions should be goal-related
      expect(prioritized[0].relatedGoals.some((g: string) =>
        ['st-trauma-001', 'st-trauma-002'].includes(g)
      )).toBe(true);
    });

    it('should still include non-goal questions at end', () => {
      const mockQuestions = [
        { id: '1', relatedGoals: ['st-trauma-001'] },
        { id: '2', relatedGoals: ['other-goal'] },
      ];

      const prioritized = prioritizeByGoals(mockQuestions as any, ['st-trauma-001']);

      expect(prioritized).toHaveLength(2);
    });
  });
});
