import { describe, it, expect } from 'vitest';
import { calculateGoalProgress, cosineSimilarity } from '../goal-taxonomy';

describe('Goal Taxonomy', () => {
  describe('calculateGoalProgress', () => {
    it('should calculate goal progress', () => {
      const progress = calculateGoalProgress(
        'st-trauma-001',
        ['q1', 'q2'],
        ['q1', 'q2', 'q3', 'q4', 'q5']
      );

      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });

    it('should return 1 for completed goals', () => {
      const progress = calculateGoalProgress(
        'st-trauma-001',
        ['q1', 'q2', 'q3'],
        ['q1', 'q2', 'q3']
      );

      expect(progress).toBe(1);
    });
  });

  describe('cosineSimilarity', () => {
    it('should calculate cosine similarity', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [1, 0, 0];

      const similarity = cosineSimilarity(vec1, vec2);

      expect(similarity).toBe(1);
    });

    it('should return 0 for orthogonal vectors', () => {
      const vec1 = [1, 0];
      const vec2 = [0, 1];

      const similarity = cosineSimilarity(vec1, vec2);

      expect(similarity).toBe(0);
    });
  });
});
