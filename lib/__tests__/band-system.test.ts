import { describe, it, expect, beforeEach } from 'vitest';
import {
  BAND_DEFINITIONS,
  getStartingBand,
  getEasierBand,
  getHarderBand,
  shouldPromoteBand,
  shouldDemoteBand,
  calculateBandAdjustment,
  applyBandAdjustment,
  createInitialBandStatus,
  getDayOneBand,
  hasTwoDifficultDaysInRow,
  generateRecoveryMix,
  updatePerformanceMetrics,
  getBandDescription,
} from '../band-system';
import { UserBandStatus, BAND_THRESHOLDS } from '@/types/progression';
import { EducationLevel } from '@/types/education';

describe('Band System', () => {
  describe('BAND_DEFINITIONS', () => {
    it('should have definitions for all 5 bands', () => {
      expect(BAND_DEFINITIONS.A).toBeDefined();
      expect(BAND_DEFINITIONS.B).toBeDefined();
      expect(BAND_DEFINITIONS.C).toBeDefined();
      expect(BAND_DEFINITIONS.D).toBeDefined();
      expect(BAND_DEFINITIONS.E).toBeDefined();
    });

    it('should have increasing decision points from A to E', () => {
      expect(BAND_DEFINITIONS.A.decisionPoints).toBe(1);
      expect(BAND_DEFINITIONS.B.decisionPoints).toBe(2);
      expect(BAND_DEFINITIONS.C.decisionPoints).toBe(3);
      expect(BAND_DEFINITIONS.D.decisionPoints).toBe(4);
      expect(BAND_DEFINITIONS.E.decisionPoints).toBe(5);
    });

    it('should have decreasing support level from A to E', () => {
      expect(BAND_DEFINITIONS.A.supportLevel).toBe('high');
      expect(BAND_DEFINITIONS.B.supportLevel).toBe('medium');
      expect(BAND_DEFINITIONS.E.supportLevel).toBe('low');
    });
  });

  describe('getStartingBand', () => {
    it('should return A for students', () => {
      expect(getStartingBand('student' as EducationLevel)).toBe('A');
    });

    it('should return B for AT level', () => {
      expect(getStartingBand('at' as EducationLevel)).toBe('B');
    });

    it('should return C for ST1-ST2', () => {
      expect(getStartingBand('st1' as EducationLevel)).toBe('C');
      expect(getStartingBand('st2' as EducationLevel)).toBe('C');
    });

    it('should return D for ST3-ST4 and ST specialties', () => {
      expect(getStartingBand('st3' as EducationLevel)).toBe('D');
      expect(getStartingBand('st4' as EducationLevel)).toBe('D');
      expect(getStartingBand('st-allmänmedicin' as EducationLevel)).toBe('D');
      expect(getStartingBand('st-akutsjukvård' as EducationLevel)).toBe('D');
    });

    it('should return E for ST5 and specialists', () => {
      expect(getStartingBand('st5' as EducationLevel)).toBe('E');
      expect(getStartingBand('specialist-ortopedi' as EducationLevel)).toBe('E');
      expect(getStartingBand('specialist-allmänmedicin' as EducationLevel)).toBe('E');
      expect(getStartingBand('specialist-akutsjukvård' as EducationLevel)).toBe('E');
    });
  });

  describe('getEasierBand', () => {
    it('should return one band easier', () => {
      expect(getEasierBand('E')).toBe('D');
      expect(getEasierBand('D')).toBe('C');
      expect(getEasierBand('C')).toBe('B');
      expect(getEasierBand('B')).toBe('A');
    });

    it('should return A when already at A (cannot go easier)', () => {
      expect(getEasierBand('A')).toBe('A');
    });
  });

  describe('getHarderBand', () => {
    it('should return one band harder', () => {
      expect(getHarderBand('A')).toBe('B');
      expect(getHarderBand('B')).toBe('C');
      expect(getHarderBand('C')).toBe('D');
      expect(getHarderBand('D')).toBe('E');
    });

    it('should return E when already at E (cannot go harder)', () => {
      expect(getHarderBand('E')).toBe('E');
    });
  });

  describe('shouldPromoteBand', () => {
    let mockBandStatus: UserBandStatus;

    beforeEach(() => {
      mockBandStatus = {
        currentBand: 'C',
        bandHistory: [],
        streakAtBand: 3,
        recentPerformance: {
          correctRate: 0.8,
          hintUsage: 1.0,
          timeEfficiency: 0.8,
          confidence: 0.7,
        },
      };
    });

    it('should return true when all promotion criteria are met', () => {
      expect(shouldPromoteBand(mockBandStatus)).toBe(true);
    });

    it('should return false when streak is insufficient', () => {
      mockBandStatus.streakAtBand = 2; // Less than PROMOTION_STREAK (3)
      expect(shouldPromoteBand(mockBandStatus)).toBe(false);
    });

    it('should return false when correct rate is too low', () => {
      mockBandStatus.recentPerformance.correctRate = 0.7; // Less than PROMOTION_CORRECT_RATE (0.75)
      expect(shouldPromoteBand(mockBandStatus)).toBe(false);
    });

    it('should return false when hint usage is too high', () => {
      mockBandStatus.recentPerformance.hintUsage = 2.0; // More than PROMOTION_MAX_HINT_USAGE (1.5)
      expect(shouldPromoteBand(mockBandStatus)).toBe(false);
    });

    it('should handle exactly at threshold values', () => {
      mockBandStatus.streakAtBand = BAND_THRESHOLDS.PROMOTION_STREAK;
      mockBandStatus.recentPerformance.correctRate = BAND_THRESHOLDS.PROMOTION_CORRECT_RATE;
      mockBandStatus.recentPerformance.hintUsage = BAND_THRESHOLDS.PROMOTION_MAX_HINT_USAGE;

      expect(shouldPromoteBand(mockBandStatus)).toBe(true);
    });
  });

  describe('shouldDemoteBand', () => {
    it('should return true when too many difficult days', () => {
      const recentDays = [
        { correctRate: 0.4, difficult: true },
        { correctRate: 0.45, difficult: true },
        { correctRate: 0.6, difficult: false },
      ];

      expect(shouldDemoteBand(recentDays)).toBe(true);
    });

    it('should return true when average correct rate is very poor', () => {
      const recentDays = [
        { correctRate: 0.4, difficult: true },
        { correctRate: 0.45, difficult: false },
        { correctRate: 0.48, difficult: false },
      ];

      expect(shouldDemoteBand(recentDays)).toBe(true);
    });

    it('should return false when performance is acceptable', () => {
      const recentDays = [
        { correctRate: 0.7, difficult: false },
        { correctRate: 0.75, difficult: false },
        { correctRate: 0.68, difficult: false },
      ];

      expect(shouldDemoteBand(recentDays)).toBe(false);
    });

    it('should return false with only one difficult day', () => {
      const recentDays = [
        { correctRate: 0.4, difficult: true },
        { correctRate: 0.7, difficult: false },
        { correctRate: 0.75, difficult: false },
      ];

      expect(shouldDemoteBand(recentDays)).toBe(false);
    });
  });

  describe('calculateBandAdjustment', () => {
    let mockBandStatus: UserBandStatus;
    let mockRecentDays: Array<{ date: Date; correctRate: number; hintUsage: number; difficult: boolean }>;

    beforeEach(() => {
      mockBandStatus = {
        currentBand: 'C',
        bandHistory: [],
        streakAtBand: 3,
        recentPerformance: {
          correctRate: 0.8,
          hintUsage: 1.0,
          timeEfficiency: 0.8,
          confidence: 0.7,
        },
      };

      const today = new Date();
      mockRecentDays = [
        { date: new Date(today.getTime() - 0 * 24 * 60 * 60 * 1000), correctRate: 0.8, hintUsage: 1.0, difficult: false },
        { date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), correctRate: 0.78, hintUsage: 1.2, difficult: false },
        { date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), correctRate: 0.82, hintUsage: 0.8, difficult: false },
      ];
    });

    it('should return promotion adjustment when criteria met', () => {
      const adjustment = calculateBandAdjustment(mockBandStatus, mockRecentDays);

      expect(adjustment).not.toBeNull();
      expect(adjustment?.fromBand).toBe('C');
      expect(adjustment?.toBand).toBe('D');
      expect(adjustment?.reason).toContain('Stark prestanda');
    });

    it('should not promote from band E', () => {
      mockBandStatus.currentBand = 'E';

      const adjustment = calculateBandAdjustment(mockBandStatus, mockRecentDays);

      expect(adjustment).toBeNull();
    });

    it('should return demotion adjustment when performance is poor', () => {
      mockBandStatus.streakAtBand = 1; // Low streak to prevent promotion
      mockBandStatus.recentPerformance.correctRate = 0.4;

      const poorDays = [
        { date: new Date(), correctRate: 0.4, hintUsage: 2.0, difficult: true },
        { date: new Date(), correctRate: 0.45, hintUsage: 2.5, difficult: true },
        { date: new Date(), correctRate: 0.48, hintUsage: 2.0, difficult: false },
      ];

      const adjustment = calculateBandAdjustment(mockBandStatus, poorDays);

      expect(adjustment).not.toBeNull();
      expect(adjustment?.fromBand).toBe('C');
      expect(adjustment?.toBand).toBe('B');
      expect(adjustment?.reason).toContain('steg tillbaka');
    });

    it('should not demote from band A', () => {
      mockBandStatus.currentBand = 'A';
      mockBandStatus.streakAtBand = 1;
      mockBandStatus.recentPerformance.correctRate = 0.4;

      const poorDays = [
        { date: new Date(), correctRate: 0.4, hintUsage: 2.0, difficult: true },
        { date: new Date(), correctRate: 0.45, hintUsage: 2.5, difficult: true },
      ];

      const adjustment = calculateBandAdjustment(mockBandStatus, poorDays);

      expect(adjustment).toBeNull();
    });

    it('should return null if already promoted today', () => {
      const today = new Date();
      mockBandStatus.lastPromotion = today;

      const adjustment = calculateBandAdjustment(mockBandStatus, mockRecentDays);

      expect(adjustment).toBeNull();
    });

    it('should return null if already demoted today', () => {
      const today = new Date();
      mockBandStatus.lastDemotion = today;
      mockBandStatus.streakAtBand = 1;
      mockBandStatus.recentPerformance.correctRate = 0.4;

      const poorDays = [
        { date: new Date(), correctRate: 0.4, hintUsage: 2.0, difficult: true },
        { date: new Date(), correctRate: 0.45, hintUsage: 2.5, difficult: true },
      ];

      const adjustment = calculateBandAdjustment(mockBandStatus, poorDays);

      expect(adjustment).toBeNull();
    });

    it('should include performance metrics in adjustment', () => {
      const adjustment = calculateBandAdjustment(mockBandStatus, mockRecentDays);

      expect(adjustment?.performanceMetrics).toBeDefined();
      expect(adjustment?.performanceMetrics.streak).toBe(3);
      expect(adjustment?.performanceMetrics.avgCorrectRate).toBeCloseTo(0.8, 1);
      expect(adjustment?.performanceMetrics.avgHintUsage).toBeCloseTo(1.0, 1);
    });
  });

  describe('applyBandAdjustment', () => {
    let mockBandStatus: UserBandStatus;

    beforeEach(() => {
      mockBandStatus = {
        currentBand: 'C',
        bandHistory: [
          { band: 'C', date: new Date('2025-01-01'), reason: 'Starting band' }
        ],
        streakAtBand: 3,
        recentPerformance: {
          correctRate: 0.8,
          hintUsage: 1.0,
          timeEfficiency: 0.8,
          confidence: 0.7,
        },
      };
    });

    it('should update current band on promotion', () => {
      const adjustment = {
        fromBand: 'C' as const,
        toBand: 'D' as const,
        reason: 'Good performance',
        date: new Date(),
        performanceMetrics: { streak: 3, avgCorrectRate: 0.8, avgHintUsage: 1.0 },
      };

      const updated = applyBandAdjustment(mockBandStatus, adjustment);

      expect(updated.currentBand).toBe('D');
      expect(updated.lastPromotion).toEqual(adjustment.date);
      expect(updated.lastDemotion).toBeUndefined();
    });

    it('should update current band on demotion', () => {
      const adjustment = {
        fromBand: 'C' as const,
        toBand: 'B' as const,
        reason: 'Struggling',
        date: new Date(),
        performanceMetrics: { streak: 0, avgCorrectRate: 0.4, avgHintUsage: 2.5 },
      };

      const updated = applyBandAdjustment(mockBandStatus, adjustment);

      expect(updated.currentBand).toBe('B');
      expect(updated.lastDemotion).toEqual(adjustment.date);
      expect(updated.lastPromotion).toBeUndefined();
    });

    it('should reset streak at new band', () => {
      const adjustment = {
        fromBand: 'C' as const,
        toBand: 'D' as const,
        reason: 'Good performance',
        date: new Date(),
        performanceMetrics: { streak: 3, avgCorrectRate: 0.8, avgHintUsage: 1.0 },
      };

      const updated = applyBandAdjustment(mockBandStatus, adjustment);

      expect(updated.streakAtBand).toBe(0);
    });

    it('should add to band history', () => {
      const adjustment = {
        fromBand: 'C' as const,
        toBand: 'D' as const,
        reason: 'Good performance',
        date: new Date(),
        performanceMetrics: { streak: 3, avgCorrectRate: 0.8, avgHintUsage: 1.0 },
      };

      const updated = applyBandAdjustment(mockBandStatus, adjustment);

      expect(updated.bandHistory).toHaveLength(2);
      expect(updated.bandHistory[1].band).toBe('D');
      expect(updated.bandHistory[1].reason).toBe('Good performance');
    });

    it('should preserve recent performance', () => {
      const adjustment = {
        fromBand: 'C' as const,
        toBand: 'D' as const,
        reason: 'Good performance',
        date: new Date(),
        performanceMetrics: { streak: 3, avgCorrectRate: 0.8, avgHintUsage: 1.0 },
      };

      const updated = applyBandAdjustment(mockBandStatus, adjustment);

      expect(updated.recentPerformance).toEqual(mockBandStatus.recentPerformance);
    });
  });

  describe('createInitialBandStatus', () => {
    it('should create initial status for student', () => {
      const status = createInitialBandStatus('student' as EducationLevel);

      expect(status.currentBand).toBe('A');
      expect(status.streakAtBand).toBe(0);
      expect(status.bandHistory).toHaveLength(1);
      expect(status.bandHistory[0].band).toBe('A');
      expect(status.recentPerformance.correctRate).toBe(0.7);
    });

    it('should create initial status for specialist', () => {
      const status = createInitialBandStatus('specialist-ortopedi' as EducationLevel);

      expect(status.currentBand).toBe('E');
      expect(status.bandHistory[0].band).toBe('E');
    });

    it('should have reasonable default performance metrics', () => {
      const status = createInitialBandStatus('st3' as EducationLevel);

      expect(status.recentPerformance.correctRate).toBe(0.7);
      expect(status.recentPerformance.hintUsage).toBe(1.5);
      expect(status.recentPerformance.timeEfficiency).toBe(0.8);
      expect(status.recentPerformance.confidence).toBe(0.6);
    });
  });

  describe('getDayOneBand', () => {
    it('should return one band easier for Day 1', () => {
      expect(getDayOneBand('E')).toBe('D');
      expect(getDayOneBand('D')).toBe('C');
      expect(getDayOneBand('C')).toBe('B');
      expect(getDayOneBand('B')).toBe('A');
    });

    it('should return A when calculated band is A', () => {
      expect(getDayOneBand('A')).toBe('A');
    });
  });

  describe('hasTwoDifficultDaysInRow', () => {
    it('should return true when last two days were difficult', () => {
      const recentDays = [
        { difficult: true },
        { difficult: true },
        { difficult: false },
      ];

      expect(hasTwoDifficultDaysInRow(recentDays)).toBe(true);
    });

    it('should return false when only one recent difficult day', () => {
      const recentDays = [
        { difficult: true },
        { difficult: false },
        { difficult: true },
      ];

      expect(hasTwoDifficultDaysInRow(recentDays)).toBe(false);
    });

    it('should return false when no recent difficult days', () => {
      const recentDays = [
        { difficult: false },
        { difficult: false },
        { difficult: false },
      ];

      expect(hasTwoDifficultDaysInRow(recentDays)).toBe(false);
    });

    it('should return false with less than 2 days of data', () => {
      const recentDays = [{ difficult: true }];

      expect(hasTwoDifficultDaysInRow(recentDays)).toBe(false);
    });
  });

  describe('generateRecoveryMix', () => {
    it('should provide easier band for recovery', () => {
      const recovery = generateRecoveryMix('C');

      expect(recovery.targetBand).toBe('B');
      expect(recovery.extraHints).toBe(true);
      expect(recovery.encouragement).toContain('lugnare');
    });

    it('should provide encouraging message', () => {
      const recovery = generateRecoveryMix('D');

      expect(recovery.encouragement).toContain('självförtroende');
      expect(recovery.encouragement).toContain('klarar');
    });

    it('should stay at A for recovery from A', () => {
      const recovery = generateRecoveryMix('A');

      expect(recovery.targetBand).toBe('A');
      expect(recovery.extraHints).toBe(true);
    });
  });

  describe('updatePerformanceMetrics', () => {
    it('should use exponential moving average to update metrics', () => {
      const currentMetrics = {
        correctRate: 0.7,
        hintUsage: 1.5,
        timeEfficiency: 0.8,
        confidence: 0.6,
      };

      const todayResults = {
        correctRate: 0.9,
        hintUsage: 1.0,
        timeEfficiency: 0.9,
        confidence: 0.8,
      };

      const updated = updatePerformanceMetrics(currentMetrics, todayResults);

      // With alpha = 0.3: new = 0.3 * today + 0.7 * current
      expect(updated.correctRate).toBeCloseTo(0.3 * 0.9 + 0.7 * 0.7, 2);
      expect(updated.hintUsage).toBeCloseTo(0.3 * 1.0 + 0.7 * 1.5, 2);
      expect(updated.timeEfficiency).toBeCloseTo(0.3 * 0.9 + 0.7 * 0.8, 2);
      expect(updated.confidence).toBeCloseTo(0.3 * 0.8 + 0.7 * 0.6, 2);
    });

    it('should weight recent performance appropriately', () => {
      const currentMetrics = {
        correctRate: 0.5,
        hintUsage: 2.0,
        timeEfficiency: 0.5,
        confidence: 0.4,
      };

      const todayResults = {
        correctRate: 1.0,
        hintUsage: 0.0,
        timeEfficiency: 1.0,
        confidence: 1.0,
      };

      const updated = updatePerformanceMetrics(currentMetrics, todayResults);

      // Updated values should be between current and today
      expect(updated.correctRate).toBeGreaterThan(currentMetrics.correctRate);
      expect(updated.correctRate).toBeLessThan(todayResults.correctRate);
      expect(updated.hintUsage).toBeLessThan(currentMetrics.hintUsage);
      expect(updated.hintUsage).toBeGreaterThan(todayResults.hintUsage);
    });
  });

  describe('getBandDescription', () => {
    it('should return description for each band', () => {
      const descA = getBandDescription('A');
      const descE = getBandDescription('E');

      expect(descA).toContain('Grundläggande');
      expect(descA).toContain('grund');
      expect(descE).toContain('Expert');
      expect(descE).toContain('Exceptionellt');
    });

    it('should include encouraging message', () => {
      const desc = getBandDescription('C');

      expect(desc).toContain('framsteg');
    });

    it('should include band label and description', () => {
      const desc = getBandDescription('B');

      expect(desc).toContain('Utvecklande');
      expect(desc).toContain('beslutspunkter');
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle rapid progression through bands', () => {
      let status = createInitialBandStatus('student' as EducationLevel);
      expect(status.currentBand).toBe('A');

      // Simulate promotion to B
      const adjustment1 = {
        fromBand: 'A' as const,
        toBand: 'B' as const,
        reason: 'Promotion',
        date: new Date(),
        performanceMetrics: { streak: 3, avgCorrectRate: 0.8, avgHintUsage: 1.0 },
      };
      status = applyBandAdjustment(status, adjustment1);
      expect(status.currentBand).toBe('B');

      // Simulate promotion to C
      const adjustment2 = {
        fromBand: 'B' as const,
        toBand: 'C' as const,
        reason: 'Promotion',
        date: new Date(),
        performanceMetrics: { streak: 3, avgCorrectRate: 0.8, avgHintUsage: 1.0 },
      };
      status = applyBandAdjustment(status, adjustment2);
      expect(status.currentBand).toBe('C');
      expect(status.bandHistory).toHaveLength(3);
    });

    it('should handle band oscillation (up then down)', () => {
      let status = createInitialBandStatus('st2' as EducationLevel);
      expect(status.currentBand).toBe('C');

      // Promote to D
      const promotionAdjustment = {
        fromBand: 'C' as const,
        toBand: 'D' as const,
        reason: 'Promotion',
        date: new Date('2025-01-01'),
        performanceMetrics: { streak: 3, avgCorrectRate: 0.8, avgHintUsage: 1.0 },
      };
      status = applyBandAdjustment(status, promotionAdjustment);
      expect(status.currentBand).toBe('D');

      // Demote back to C
      const demotionAdjustment = {
        fromBand: 'D' as const,
        toBand: 'C' as const,
        reason: 'Struggling',
        date: new Date('2025-01-05'),
        performanceMetrics: { streak: 0, avgCorrectRate: 0.4, avgHintUsage: 2.5 },
      };
      status = applyBandAdjustment(status, demotionAdjustment);
      expect(status.currentBand).toBe('C');
      expect(status.lastPromotion).toEqual(new Date('2025-01-01'));
      expect(status.lastDemotion).toEqual(new Date('2025-01-05'));
    });

    it('should prevent more than one adjustment per day', () => {
      const today = new Date();
      const mockBandStatus: UserBandStatus = {
        currentBand: 'C',
        bandHistory: [],
        streakAtBand: 3,
        lastPromotion: today,
        recentPerformance: {
          correctRate: 0.8,
          hintUsage: 1.0,
          timeEfficiency: 0.8,
          confidence: 0.7,
        },
      };

      const goodDays = [
        { date: new Date(), correctRate: 0.8, hintUsage: 1.0, difficult: false },
        { date: new Date(), correctRate: 0.78, hintUsage: 1.2, difficult: false },
        { date: new Date(), correctRate: 0.82, hintUsage: 0.8, difficult: false },
      ];

      const adjustment = calculateBandAdjustment(mockBandStatus, goodDays);
      expect(adjustment).toBeNull(); // Should prevent second promotion today
    });

    it('should handle zero streak correctly', () => {
      const status: UserBandStatus = {
        currentBand: 'C',
        bandHistory: [],
        streakAtBand: 0,
        recentPerformance: {
          correctRate: 0.8,
          hintUsage: 1.0,
          timeEfficiency: 0.8,
          confidence: 0.7,
        },
      };

      expect(shouldPromoteBand(status)).toBe(false);
    });
  });
});
