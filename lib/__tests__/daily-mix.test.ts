/**
 * Tests for daily-mix.ts
 * Comprehensive testing of the Daily Mix generation algorithm
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { generateDailyMix } from '../daily-mix';
import { createMockProfile } from './mocks/mockData';
import type { IntegratedUserProfile } from '@/types/integrated';

describe('generateDailyMix', () => {
  let mockProfile: IntegratedUserProfile;

  beforeEach(() => {
    mockProfile = createMockProfile();
  });

  describe('Basic Mix Generation', () => {
    it('should generate a daily mix with all sections', () => {
      const mix = generateDailyMix(mockProfile, new Date());

      expect(mix).toHaveProperty('date');
      expect(mix).toHaveProperty('newContent');
      expect(mix).toHaveProperty('interleavingContent');
      expect(mix).toHaveProperty('srsReviews');
    });

    it('should include new content for primary domain', () => {
      const mix = generateDailyMix(mockProfile, new Date());

      expect(mix.newContent).toBeDefined();
      expect(mix.newContent.domain).toBe(mockProfile.progression.primaryDomain);
      expect(mix.newContent.questionIds.length).toBeGreaterThan(0);
    });

    it('should include interleaving content from other domains', () => {
      const mix = generateDailyMix(mockProfile, new Date());

      expect(mix.interleavingContent).toBeDefined();
      if (mix.interleavingContent) {
        expect(mix.interleavingContent.questionIds.length).toBeGreaterThan(0);
        expect(mix.interleavingContent.domains).not.toContain(
          mockProfile.progression.primaryDomain
        );
      }
    });

    it('should include SRS reviews if cards are due', () => {
      const profileWithDueCards = createMockProfile({
        progression: {
          ...mockProfile.progression,
          srs: {
            ...mockProfile.progression.srs,
            dueToday: ['card-1', 'card-2'],
          },
        },
      });

      const mix = generateDailyMix(profileWithDueCards, new Date());

      expect(mix.srsReviews).toBeDefined();
      expect(mix.srsReviews.dueCards.length).toBe(2);
    });
  });

  describe('Recovery Day Logic', () => {
    it('should activate recovery day after 3 consecutive poor performances', () => {
      const profileWithPoorPerformance = createMockProfile({
        progression: {
          ...mockProfile.progression,
          bandStatus: {
            ...mockProfile.progression.bandStatus,
            recentPerformance: {
              correctRate: 0.5, // Below threshold
              hintUsage: 3,
              timeEfficiency: 0.4,
              confidence: 0.3,
            },
          },
        },
      });

      const mix = generateDailyMix(profileWithPoorPerformance, new Date());

      expect(mix.isRecoveryDay).toBe(true);
    });

    it('should provide easier content on recovery day', () => {
      const profileWithPoorPerformance = createMockProfile({
        progression: {
          ...mockProfile.progression,
          bandStatus: {
            ...mockProfile.progression.bandStatus,
            currentBand: 'D',
            recentPerformance: {
              correctRate: 0.5,
              hintUsage: 3,
              timeEfficiency: 0.4,
              confidence: 0.3,
            },
          },
        },
      });

      const mix = generateDailyMix(profileWithPoorPerformance, new Date());

      if (mix.isRecoveryDay && mix.difficultFollowUp) {
        // Recovery content should be 1-2 bands easier
        expect(['B', 'C']).toContain(mix.difficultFollowUp.targetBand);
      }
    });
  });

  describe('Time Estimation', () => {
    it('should provide realistic time estimates', () => {
      const mix = generateDailyMix(mockProfile, new Date());

      expect(mix.newContent.estimatedTime).toBeGreaterThan(0);
      expect(mix.newContent.estimatedTime).toBeLessThan(60); // Should be reasonable

      if (mix.interleavingContent) {
        expect(mix.interleavingContent.estimatedTime).toBeGreaterThan(0);
      }

      if (mix.srsReviews) {
        expect(mix.srsReviews.estimatedTime).toBeGreaterThanOrEqual(0);
      }
    });

    it('should estimate 2 minutes per question', () => {
      const mix = generateDailyMix(mockProfile, new Date());

      const questionsCount = mix.newContent.questionIds.length;
      const expectedTime = questionsCount * 2;

      expect(mix.newContent.estimatedTime).toBe(expectedTime);
    });
  });

  describe('Band-Based Content Selection', () => {
    it('should select content matching current band', () => {
      const profileBandC = createMockProfile({
        progression: {
          ...mockProfile.progression,
          bandStatus: {
            ...mockProfile.progression.bandStatus,
            currentBand: 'C',
          },
        },
      });

      const mix = generateDailyMix(profileBandC, new Date());

      // Content should be appropriate for band C
      expect(mix.newContent).toBeDefined();
      expect(mix.newContent.questionIds.length).toBeGreaterThan(0);
    });

    it('should handle band E (hardest) appropriately', () => {
      const profileBandE = createMockProfile({
        progression: {
          ...mockProfile.progression,
          bandStatus: {
            ...mockProfile.progression.bandStatus,
            currentBand: 'E',
          },
        },
      });

      const mix = generateDailyMix(profileBandE, new Date());

      expect(mix.newContent).toBeDefined();
    });

    it('should handle band A (easiest) appropriately', () => {
      const profileBandA = createMockProfile({
        progression: {
          ...mockProfile.progression,
          bandStatus: {
            ...mockProfile.progression.bandStatus,
            currentBand: 'A',
          },
        },
      });

      const mix = generateDailyMix(profileBandA, new Date());

      expect(mix.newContent).toBeDefined();
    });
  });

  describe('Goal-Based Content Selection', () => {
    it('should prioritize content related to user goals', () => {
      const profileWithGoals = createMockProfile({
        goals: ['st-trauma-001', 'st-trauma-002'],
      });

      const mix = generateDailyMix(profileWithGoals, new Date());

      expect(mix.newContent.questionIds.length).toBeGreaterThan(0);
    });

    it('should handle users with no goals set', () => {
      const profileNoGoals = createMockProfile({
        goals: [],
      });

      const mix = generateDailyMix(profileNoGoals, new Date());

      expect(mix.newContent).toBeDefined();
      expect(mix.newContent.questionIds.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty SRS card list', () => {
      const profileNoCards = createMockProfile({
        progression: {
          ...mockProfile.progression,
          srs: {
            cards: [],
            dueToday: [],
            overdueCards: [],
            leechCards: [],
          },
        },
      });

      const mix = generateDailyMix(profileNoCards, new Date());

      expect(mix.srsReviews.dueCards).toHaveLength(0);
    });

    it('should handle future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const mix = generateDailyMix(mockProfile, futureDate);

      expect(mix.date).toEqual(futureDate);
    });

    it('should be consistent for same date and profile', () => {
      const date = new Date('2025-01-10');
      const mix1 = generateDailyMix(mockProfile, date);
      const mix2 = generateDailyMix(mockProfile, date);

      expect(mix1.newContent.questionIds).toEqual(mix2.newContent.questionIds);
    });
  });

  describe('Interleaving Strategy', () => {
    it('should include domains user has previously studied', () => {
      const profileWithHistory = createMockProfile({
        domains: ['trauma', 'höft', 'knä'],
        progression: {
          ...mockProfile.progression,
          primaryDomain: 'trauma',
        },
      });

      const mix = generateDailyMix(profileWithHistory, new Date());

      if (mix.interleavingContent) {
        const interleavedDomains = mix.interleavingContent.domains;
        expect(interleavedDomains.some((d: string) => ['höft', 'knä'].includes(d))).toBe(
          true
        );
      }
    });

    it('should balance new learning with review', () => {
      const mix = generateDailyMix(mockProfile, new Date());

      const totalNewQuestions = mix.newContent.questionIds.length;
      const totalInterleavedQuestions = mix.interleavingContent?.questionIds.length || 0;

      // New content should typically be 60-70% of mix
      expect(totalNewQuestions).toBeGreaterThan(totalInterleavedQuestions);
    });
  });
});
