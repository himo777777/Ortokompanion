/**
 * Tests for adaptive-difficulty.ts
 * Testing the adaptive difficulty adjustment algorithm
 */

import { describe, it, expect } from 'vitest';
import { adjustDifficulty, calculateOptimalBand } from '../adaptive-difficulty';
import { createMockProfile } from './mocks/mockData';

describe('Adaptive Difficulty', () => {
  describe('adjustDifficulty', () => {
    it('should increase difficulty after consistent success', () => {
      const profile = createMockProfile({
        progression: {
          ...createMockProfile().progression,
          bandStatus: {
            currentBand: 'C',
            bandHistory: [],
            streakAtBand: 5,
            recentPerformance: {
              correctRate: 0.9,
              hintUsage: 0.2,
              timeEfficiency: 0.9,
              confidence: 0.8,
            },
          },
        },
      });

      const result = adjustDifficulty(profile, {
        questionsAnswered: 10,
        correctAnswers: 9,
        hintsUsed: 1,
        avgTimePerQuestion: 60,
      });

      expect(result.shouldAdjust).toBe(true);
      expect(result.newBand).toBe('D');
      expect(result.reason).toContain('performance');
    });

    it('should decrease difficulty after consistent struggle', () => {
      const profile = createMockProfile({
        progression: {
          ...createMockProfile().progression,
          bandStatus: {
            currentBand: 'D',
            bandHistory: [],
            streakAtBand: 3,
            recentPerformance: {
              correctRate: 0.4,
              hintUsage: 3.5,
              timeEfficiency: 0.3,
              confidence: 0.2,
            },
          },
        },
      });

      const result = adjustDifficulty(profile, {
        questionsAnswered: 10,
        correctAnswers: 4,
        hintsUsed: 8,
        avgTimePerQuestion: 180,
      });

      expect(result.shouldAdjust).toBe(true);
      expect(result.newBand).toBe('C');
    });

    it('should not adjust if performance is average', () => {
      const profile = createMockProfile();

      const result = adjustDifficulty(profile, {
        questionsAnswered: 10,
        correctAnswers: 7,
        hintsUsed: 3,
        avgTimePerQuestion: 90,
      });

      expect(result.shouldAdjust).toBe(false);
    });
  });

  describe('calculateOptimalBand', () => {
    it('should recommend appropriate band for ST3 level', () => {
      const profile = createMockProfile({
        role: 'st3',
        stYear: 3,
      });

      const band = calculateOptimalBand(profile);

      expect(['C', 'D']).toContain(band);
    });

    it('should recommend easier band for students', () => {
      const profile = createMockProfile({
        role: 'student',
        stYear: null,
      });

      const band = calculateOptimalBand(profile);

      expect(['A', 'B']).toContain(band);
    });

    it('should recommend harder band for specialists', () => {
      const profile = createMockProfile({
        role: 'specialist',
        stYear: null,
      });

      const band = calculateOptimalBand(profile);

      expect(['D', 'E']).toContain(band);
    });
  });
});
