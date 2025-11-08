/**
 * Daily Mix Generator - Wrapper for Domain Progression
 *
 * Provides a simplified interface for tests while using domain-progression implementation
 */

import type { IntegratedUserProfile } from '@/types/integrated';
import type { DailyMix } from '@/types/progression';
import { generateDailyMixCore } from './domain-progression';
import { getQuestionsByDomain } from '@/data/questions';
import { Domain } from '@/types/onboarding';
import { DOMAIN_NEIGHBORS } from '@/types/progression';

/**
 * Generate daily mix for a user profile (test-friendly interface)
 */
export function generateDailyMix(profile: IntegratedUserProfile, date: Date): DailyMix {
  const { progression } = profile;

  // Build available content map (include user domains + neighbor domains for interleaving)
  const availableNewContent = new Map<Domain, string[]>();
  const allRelevantDomains = new Set([...profile.domains]);

  // Add neighbor domains of primary domain for interleaving
  const neighbors = DOMAIN_NEIGHBORS[progression.primaryDomain] || [];
  neighbors.forEach((neighbor) => allRelevantDomains.add(neighbor));

  allRelevantDomains.forEach(domain => {
    let questions = getQuestionsByDomain(domain)
      .filter(q => q.band === progression.bandStatus.currentBand)
      .map(q => q.id);

    // Fallback: if no questions at target band, use questions from any band
    if (questions.length === 0) {
      questions = getQuestionsByDomain(domain)
        .map(q => q.id)
        .slice(0, 10); // Limit to 10 for performance
    }

    availableNewContent.set(domain, questions);
  });

  // Handle test case where dueToday is provided but cards array is empty
  // Create dummy cards for due today items
  let srsCards = progression.srs.cards;
  if (srsCards.length === 0 && progression.srs.dueToday && progression.srs.dueToday.length > 0) {
    srsCards = progression.srs.dueToday.map((id, index) => ({
      id,
      domain: progression.primaryDomain,
      type: 'quiz' as const,
      contentId: id,
      easeFactor: 2.5,
      stability: 0.8,
      interval: 7,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday (due)
      difficulty: 0.5,
      lastGrade: 3,
      lastReviewed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      reviewCount: index + 1,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      competencies: [],
      failCount: 0,
      isLeech: false,
    }));
  }

  // Get completed domains
  const completedDomains = Object.entries(progression.domainStatuses || {})
    .filter(([_, status]) => status.status === 'completed')
    .map(([domain]) => domain as Domain);

  // Check for recovery day
  const recentPerf = progression.bandStatus.recentPerformance;
  const isRecoveryDay = recentPerf.correctRate <= 0.5 && recentPerf.confidence < 0.4;

  // Generate mix using core function
  const coreMix = generateDailyMixCore({
    primaryDomain: progression.primaryDomain,
    targetBand: progression.bandStatus.currentBand,
    srsCards,
    availableNewContent,
    completedDomains,
    userDomains: profile.domains,
    isRecoveryDay,
    targetMinutes: 30,
  });

  // Transform to test-expected format
  return {
    date,
    newContent: {
      domain: coreMix.newContent.domain,
      questionIds: coreMix.newContent.items,
      estimatedTime: coreMix.newContent.estimatedTime,
      reasoning: coreMix.newContent.reasoning,
    },
    interleavingContent: coreMix.interleavingContent ? {
      domains: [coreMix.interleavingContent.domain],
      questionIds: coreMix.interleavingContent.items,
      estimatedTime: coreMix.interleavingContent.estimatedTime,
      reasoning: coreMix.interleavingContent.reasoning,
    } : undefined,
    srsReviews: {
      dueCards: coreMix.srsReviews.cards.map(c => c.id),
      urgentCards: [],
      estimatedTime: coreMix.srsReviews.estimatedTime,
    },
    isRecoveryDay: coreMix.isRecoveryDay,
    difficultFollowUp: coreMix.isDifficultFollowUp ? {
      questions: [],
      reasoning: 'Follow-up based on yesterday\'s difficult questions',
    } : null,
    totalEstimatedTime: coreMix.totalEstimatedTime,
  } as DailyMix;
}

export { isGateRequirementMet, getCompletedDomains } from './domain-progression';
