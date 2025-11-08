/**
 * Tests for goal-validator.ts
 * Testing goal validation and compatibility
 */

import { describe, it, expect } from 'vitest';
import { validateGoals, isGoalCompatible, getGoalDependencies } from '../goal-validator';

describe('Goal Validator', () => {
  describe('validateGoals', () => {
    it('should validate compatible goals', () => {
      const result = validateGoals(['st-trauma-001', 'st-trauma-002'], 'st3');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject goals above user level', () => {
      const result = validateGoals(['specialist-advanced-001'], 'st1');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should allow empty goal list', () => {
      const result = validateGoals([], 'st3');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect duplicate goals', () => {
      const result = validateGoals(
        ['st-trauma-001', 'st-trauma-001'],
        'st3'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('duplicate'))).toBe(true);
    });
  });

  describe('isGoalCompatible', () => {
    it('should return true for level-appropriate goals', () => {
      expect(isGoalCompatible('st-trauma-001', 'st3')).toBe(true);
      expect(isGoalCompatible('bt-basics-001', 'at')).toBe(true);
    });

    it('should return false for advanced goals with basic users', () => {
      expect(isGoalCompatible('specialist-advanced-001', 'student')).toBe(false);
    });
  });

  describe('getGoalDependencies', () => {
    it('should return prerequisites for advanced goals', () => {
      const deps = getGoalDependencies('st-trauma-advanced-001');

      expect(Array.isArray(deps)).toBe(true);
    });

    it('should return empty array for basic goals', () => {
      const deps = getGoalDependencies('bt-basics-001');

      expect(deps).toHaveLength(0);
    });
  });
});
