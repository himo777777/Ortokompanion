/**
 * Tests for retention-analysis.ts
 * Testing retention rate calculation and analysis
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRetentionRate,
  analyzeRetentionTrends,
  identifyWeakAreas,
} from '../retention-analysis';

describe('Retention Analysis', () => {
  describe('calculateRetentionRate', () => {
    it('should calculate correct retention rate', () => {
      const reviews = [
        { correct: true },
        { correct: true },
        { correct: false },
        { correct: true },
      ];

      const rate = calculateRetentionRate(reviews);

      expect(rate).toBe(0.75); // 3/4
    });

    it('should return 0 for all incorrect reviews', () => {
      const reviews = [
        { correct: false },
        { correct: false },
      ];

      const rate = calculateRetentionRate(reviews);

      expect(rate).toBe(0);
    });

    it('should return 1 for all correct reviews', () => {
      const reviews = [
        { correct: true },
        { correct: true },
      ];

      const rate = calculateRetentionRate(reviews);

      expect(rate).toBe(1);
    });

    it('should handle empty array', () => {
      const rate = calculateRetentionRate([]);

      expect(rate).toBe(0);
    });
  });

  describe('analyzeRetentionTrends', () => {
    it('should identify improving trend', () => {
      const sessions = [
        { date: new Date('2025-01-01'), correctRate: 0.6 },
        { date: new Date('2025-01-02'), correctRate: 0.7 },
        { date: new Date('2025-01-03'), correctRate: 0.8 },
      ];

      const trend = analyzeRetentionTrends(sessions);

      expect(trend.direction).toBe('improving');
    });

    it('should identify declining trend', () => {
      const sessions = [
        { date: new Date('2025-01-01'), correctRate: 0.8 },
        { date: new Date('2025-01-02'), correctRate: 0.7 },
        { date: new Date('2025-01-03'), correctRate: 0.6 },
      ];

      const trend = analyzeRetentionTrends(sessions);

      expect(trend.direction).toBe('declining');
    });

    it('should identify stable trend', () => {
      const sessions = [
        { date: new Date('2025-01-01'), correctRate: 0.75 },
        { date: new Date('2025-01-02'), correctRate: 0.74 },
        { date: new Date('2025-01-03'), correctRate: 0.76 },
      ];

      const trend = analyzeRetentionTrends(sessions);

      expect(trend.direction).toBe('stable');
    });
  });

  describe('identifyWeakAreas', () => {
    it('should identify domains with low retention', () => {
      const domainStats = [
        { domain: 'trauma', retentionRate: 0.9 },
        { domain: 'höft', retentionRate: 0.5 },
        { domain: 'knä', retentionRate: 0.85 },
      ];

      const weak = identifyWeakAreas(domainStats, 0.7);

      expect(weak).toContain('höft');
      expect(weak).not.toContain('trauma');
      expect(weak).not.toContain('knä');
    });

    it('should return empty array if all areas are strong', () => {
      const domainStats = [
        { domain: 'trauma', retentionRate: 0.9 },
        { domain: 'höft', retentionRate: 0.85 },
      ];

      const weak = identifyWeakAreas(domainStats, 0.7);

      expect(weak).toHaveLength(0);
    });
  });
});
