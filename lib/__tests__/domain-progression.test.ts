/**
 * Tests for domain-progression.ts  
 * Testing the daily mix generation and domain progression
 */

import { describe, it, expect } from 'vitest';
import { generateDailyMix, isGateRequirementMet } from '../domain-progression';
import { createMockProfile } from './mocks/mockData';

describe('Domain Progression', () => {
  describe('generateDailyMix', () => {
    it('should generate daily mix for user', () => {
      const profile = createMockProfile();
      const mix = generateDailyMix(profile);

      expect(mix).toBeDefined();
      expect(mix).toHaveProperty('newContent');
      expect(mix).toHaveProperty('srsReviews');
    });
  });

  describe('isGateRequirementMet', () => {
    it('should check gate requirements', () => {
      const domainStatus = {
        domain: 'trauma' as const,
        status: 'active' as const,
        itemsCompleted: 20,
        totalItems: 30,
        gateProgress: {
          miniOSCEPassed: true,
          retentionCheckPassed: true,
          srsCardsStable: true,
          complicationCasePassed: true,
        },
      };

      const result = isGateRequirementMet(domainStatus, []);
      expect(result).toBe(true);
    });
  });
});
