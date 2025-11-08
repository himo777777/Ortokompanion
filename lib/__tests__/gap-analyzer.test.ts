import { describe, it, expect, beforeEach } from 'vitest';
import { GapAnalyzer } from '../gap-analyzer';

describe('Gap Analyzer', () => {
  let analyzer: GapAnalyzer;

  beforeEach(() => {
    analyzer = new GapAnalyzer();
  });

  describe('analyzeCoverage', () => {
    it('should analyze content coverage', () => {
      const metrics = analyzer.analyzeCoverage();

      expect(metrics).toHaveProperty('total');
      expect(metrics).toHaveProperty('byDomain');
      expect(metrics).toHaveProperty('gaps');
      expect(Array.isArray(metrics.gaps)).toBe(true);
    });

    it('should identify gaps by domain', () => {
      const metrics = analyzer.analyzeCoverage();

      expect(metrics.byDomain).toBeInstanceOf(Map);
      expect(metrics.byDomain.size).toBeGreaterThan(0);
    });
  });

  describe('createGenerationPlan', () => {
    it('should create generation plan', () => {
      const plan = analyzer.createGenerationPlan(50);

      expect(plan).toHaveProperty('totalItems');
      expect(plan).toHaveProperty('breakdown');
      expect(Array.isArray(plan.breakdown)).toBe(true);
    });

    it('should respect target count', () => {
      const targetCount = 25;
      const plan = analyzer.createGenerationPlan(targetCount);

      const totalGenerated = plan.breakdown.reduce((sum, item) => sum + item.count, 0);
      expect(totalGenerated).toBeLessThanOrEqual(targetCount);
    });
  });
});
