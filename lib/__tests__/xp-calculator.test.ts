/**
 * Tests for xp-calculator.ts
 * Testing XP calculation logic
 */

import { describe, it, expect } from 'vitest';
import { calculateXP, getXPMultipliers } from '../xp-calculator';

describe('XP Calculator', () => {
  describe('calculateXP', () => {
    it('should calculate base XP for correct answer', () => {
      const xp = calculateXP({
        correct: true,
        band: 'C',
        hintsUsed: 0,
        timeSpent: 60,
      });

      expect(xp).toBeGreaterThan(0);
      expect(xp).toBe(10); // Base XP for band C
    });

    it('should apply band multiplier correctly', () => {
      const xpBandA = calculateXP({ correct: true, band: 'A', hintsUsed: 0, timeSpent: 60 });
      const xpBandE = calculateXP({ correct: true, band: 'E', hintsUsed: 0, timeSpent: 60 });

      expect(xpBandE).toBeGreaterThan(xpBandA);
    });

    it('should reduce XP for hints used', () => {
      const xpNoHints = calculateXP({ correct: true, band: 'C', hintsUsed: 0, timeSpent: 60 });
      const xpWithHints = calculateXP({ correct: true, band: 'C', hintsUsed: 2, timeSpent: 60 });

      expect(xpWithHints).toBeLessThan(xpNoHints);
    });

    it('should give minimal XP for incorrect answers', () => {
      const xp = calculateXP({ correct: false, band: 'C', hintsUsed: 0, timeSpent: 60 });

      expect(xp).toBeLessThan(5);
      expect(xp).toBeGreaterThanOrEqual(0);
    });

    it('should bonus for speed', () => {
      const xpSlow = calculateXP({ correct: true, band: 'C', hintsUsed: 0, timeSpent: 180 });
      const xpFast = calculateXP({ correct: true, band: 'C', hintsUsed: 0, timeSpent: 30 });

      expect(xpFast).toBeGreaterThan(xpSlow);
    });
  });

  describe('getXPMultipliers', () => {
    it('should return multipliers for all bands', () => {
      const multipliers = getXPMultipliers();

      expect(multipliers).toHaveProperty('A');
      expect(multipliers).toHaveProperty('B');
      expect(multipliers).toHaveProperty('C');
      expect(multipliers).toHaveProperty('D');
      expect(multipliers).toHaveProperty('E');
    });

    it('should have increasing multipliers from A to E', () => {
      const multipliers = getXPMultipliers();

      expect(multipliers.A).toBeLessThan(multipliers.B);
      expect(multipliers.B).toBeLessThan(multipliers.C);
      expect(multipliers.C).toBeLessThan(multipliers.D);
      expect(multipliers.D).toBeLessThan(multipliers.E);
    });
  });
});
