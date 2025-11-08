/**
 * Tests for level-calculator.ts
 * Testing level progression and XP requirements
 */

import { describe, it, expect } from 'vitest';
import { calculateLevel, getXPForLevel, getXPToNextLevel } from '../level-calculator';

describe('Level Calculator', () => {
  describe('calculateLevel', () => {
    it('should return level 1 for 0 XP', () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it('should return level 2 for 100 XP', () => {
      expect(calculateLevel(100)).toBe(2);
    });

    it('should increase level as XP increases', () => {
      const level1 = calculateLevel(50);
      const level2 = calculateLevel(500);
      const level3 = calculateLevel(5000);

      expect(level3).toBeGreaterThan(level2);
      expect(level2).toBeGreaterThan(level1);
    });

    it('should handle large XP values', () => {
      const level = calculateLevel(1000000);

      expect(level).toBeGreaterThan(50);
      expect(typeof level).toBe('number');
    });
  });

  describe('getXPForLevel', () => {
    it('should return 0 XP for level 1', () => {
      expect(getXPForLevel(1)).toBe(0);
    });

    it('should return increasing XP requirements', () => {
      const xpLevel2 = getXPForLevel(2);
      const xpLevel5 = getXPForLevel(5);
      const xpLevel10 = getXPForLevel(10);

      expect(xpLevel10).toBeGreaterThan(xpLevel5);
      expect(xpLevel5).toBeGreaterThan(xpLevel2);
    });

    it('should use exponential scaling', () => {
      const xpLevel1to2 = getXPForLevel(2) - getXPForLevel(1);
      const xpLevel9to10 = getXPForLevel(10) - getXPForLevel(9);

      expect(xpLevel9to10).toBeGreaterThan(xpLevel1to2);
    });
  });

  describe('getXPToNextLevel', () => {
    it('should return correct XP needed for next level', () => {
      const currentXP = 150;
      const currentLevel = calculateLevel(currentXP);
      const xpNeeded = getXPToNextLevel(currentXP);

      expect(xpNeeded).toBeGreaterThan(0);
      expect(calculateLevel(currentXP + xpNeeded)).toBe(currentLevel + 1);
    });

    it('should handle level boundaries correctly', () => {
      const xpForLevel5 = getXPForLevel(5);
      const xpNeeded = getXPToNextLevel(xpForLevel5);

      expect(calculateLevel(xpForLevel5 + xpNeeded)).toBe(6);
    });
  });
});
