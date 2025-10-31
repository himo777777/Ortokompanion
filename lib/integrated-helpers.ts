/**
 * Helper functions for OrtoKompanion Integrated System
 * Bridges v2.0 features with ST-Progression & SRS
 */

import {
  UserProfile,
  Domain,
  SevenDayPlan,
  PlanItem,
} from '@/types/onboarding';
import { EducationLevel } from '@/types/education';
import {
  IntegratedUserProfile,
  MålProgress,
  SessionResults,
  IntegratedAnalytics,
  MappedContent,
} from '@/types/integrated';
import {
  DifficultyBand,
  UserBandStatus,
  DomainStatus,
  SRSCard,
  DailyMix,
  BandAdjustment,
  DomainNeighborMap,
} from '@/types/progression';
import {
  getStartingBand,
  BAND_DEFINITIONS,
  shouldPromoteBand,
  shouldDemoteBand,
  calculateBandAdjustment,
  updatePerformanceMetrics,
} from './band-system';
import {
  generateDailyMix,
  isGateRequirementMet,
  getCompletedDomains,
} from './domain-progression';
import { getDueCards, processReview } from './srs-algorithm';
import { DOMAIN_NEIGHBORS } from '@/types/progression';

/**
 * Creates initial band status for a new user
 */
export function createInitialBandStatus(level: EducationLevel): UserBandStatus {
  const startingBand = getStartingBand(level);

  return {
    currentBand: startingBand,
    bandHistory: [
      {
        band: startingBand,
        date: new Date(),
        reason: 'Initial placement based on education level',
      },
    ],
    streakAtBand: 0,
    recentPerformance: {
      correctRate: 0.75, // Start with optimistic assumption
      hintUsage: 1.0,
      timeEfficiency: 1.0,
      confidence: 0.7,
    },
  };
}

/**
 * Creates initial domain statuses
 * Primary domain is active, others are locked
 */
export function createInitialDomainStatuses(
  primaryDomain: Domain,
  allDomains: Domain[]
): Record<Domain, DomainStatus> {
  const statuses: Record<string, DomainStatus> = {};

  allDomains.forEach((domain) => {
    statuses[domain] = {
      domain,
      status: domain === primaryDomain ? 'active' : 'locked',
      itemsCompleted: 0,
      totalItems: 30, // Approximate per domain
      gateProgress: {
        miniOSCEPassed: false,
        retentionCheckPassed: false,
        srsCardsStable: false,
        complicationCasePassed: false,
      },
    };
  });

  return statuses as Record<Domain, DomainStatus>;
}

/**
 * Converts UserProfile to IntegratedUserProfile
 */
export function createIntegratedProfile(
  profile: UserProfile,
  plan: SevenDayPlan
): IntegratedUserProfile {
  const primaryDomain = (profile.domains && profile.domains[0]) || ('trauma' as Domain);
  const allDomains: Domain[] = [
    'trauma',
    'axel-armbåge',
    'hand-handled',
    'rygg',
    'höft',
    'knä',
    'fot-fotled',
    'sport',
    'tumör',
  ];

  return {
    ...profile,
    gamification: {
      ...profile.gamification,
      freezeTokens: 2, // Start with 2 freeze tokens
    },
    progression: {
      primaryDomain,
      bandStatus: createInitialBandStatus(profile.role),
      domainStatuses: createInitialDomainStatuses(primaryDomain, allDomains),
      srs: {
        cards: [],
        dueToday: [],
        overdueCards: [],
        leechCards: [],
      },
      history: {
        bandAdjustments: [],
        osceResults: [],
        retentionChecks: [],
      },
    },
    socialstyrelseMålProgress: [],
    preferences: {
      targetMinutesPerDay: 10,
      recoveryMode: false,
      notificationsEnabled: true,
      soundEnabled: true,
    },
  };
}

/**
 * Generates daily mix for integrated profile
 */
export function generateIntegratedDailyMix(
  profile: IntegratedUserProfile,
  availableContent: Map<Domain, string[]>
): DailyMix {
  const { progression, preferences } = profile;

  // Day 1 is always easier
  const isDay1 = progression.history.bandAdjustments.length === 0;
  const targetBand = isDay1
    ? getDayOneBand(progression.bandStatus.currentBand)
    : progression.bandStatus.currentBand;

  const completedDomains = getCompletedDomains(progression.domainStatuses);

  return generateDailyMix({
    primaryDomain: progression.primaryDomain,
    targetBand,
    srsCards: progression.srs.cards,
    availableNewContent: availableContent,
    completedDomains,
    isRecoveryDay: preferences?.recoveryMode || false,
    targetMinutes: preferences?.targetMinutesPerDay || 10,
  });
}

/**
 * Gets Day 1 band (one easier than starting band)
 */
function getDayOneBand(startingBand: DifficultyBand): DifficultyBand {
  const bands: DifficultyBand[] = ['A', 'B', 'C', 'D', 'E'];
  const currentIndex = bands.indexOf(startingBand);
  return currentIndex > 0 ? bands[currentIndex - 1] : startingBand;
}

/**
 * Handles session completion and updates profile
 */
export function handleSessionCompletion(
  profile: IntegratedUserProfile,
  results: SessionResults,
  dailyMix: DailyMix
): IntegratedUserProfile {
  // 1. Update gamification
  const newXP = profile.gamification.xp + results.summary.xpEarned;
  const newLevel = Math.floor(newXP / 100) + 1;
  const newStreak = profile.gamification.streak + 1;

  // Check for new badges
  const newBadges = [...profile.gamification.badges];
  if (newStreak >= 7 && !newBadges.includes('week_warrior')) {
    newBadges.push('week_warrior');
  }
  if (newLevel >= 10 && !newBadges.includes('level_10')) {
    newBadges.push('level_10');
  }

  // 2. Update SRS cards
  const updatedCards = profile.progression.srs.cards.map((card) => {
    const update = results.srsUpdates.find((u) => u.id === card.id);
    return update || card;
  });

  // Add new SRS cards from completed content
  results.srsUpdates
    .filter((card) => !profile.progression.srs.cards.find((c) => c.id === card.id))
    .forEach((newCard) => updatedCards.push(newCard));

  // 3. Update performance metrics
  const updatedPerformance = updatePerformanceMetrics(
    profile.progression.bandStatus.recentPerformance,
    {
      ...results.performance,
      confidence: results.performance.confidence || 0.7,
    }
  );

  const updatedBandStatus: UserBandStatus = {
    ...profile.progression.bandStatus,
    recentPerformance: updatedPerformance,
    streakAtBand: profile.progression.bandStatus.streakAtBand + 1,
  };

  // 4. Check for band adjustment
  const recentDays = getRecentDays(profile, 3);
  const adjustment = calculateBandAdjustment(updatedBandStatus, recentDays);

  if (adjustment) {
    updatedBandStatus.currentBand = adjustment.toBand;
    updatedBandStatus.streakAtBand = 0;
    updatedBandStatus.bandHistory.push({
      band: adjustment.toBand,
      date: new Date(),
      reason: adjustment.reason,
    });
    profile.progression.history.bandAdjustments.push(adjustment);
  }

  // 5. Update domain progress
  const primaryDomainStatus = profile.progression.domainStatuses[profile.progression.primaryDomain];
  primaryDomainStatus.itemsCompleted += results.completedContent.length;

  // Check SRS stability for gate
  const domainCards = updatedCards.filter(
    (c) => c.domain === profile.progression.primaryDomain
  );
  if (domainCards.length >= 10) {
    const avgStability =
      domainCards.reduce((sum, c) => sum + c.stability, 0) / domainCards.length;
    primaryDomainStatus.gateProgress.srsCardsStable = avgStability >= 0.7;
    primaryDomainStatus.gateProgress.avgStability = avgStability;
  }

  // Check if domain complete
  if (isGateRequirementMet(primaryDomainStatus, updatedCards)) {
    primaryDomainStatus.status = 'completed';
    primaryDomainStatus.completedAt = new Date();
  }

  // 6. Update Socialstyrelsen progress
  const updatedMålProgress = updateSocialstyrelseMålProgress(
    profile.socialstyrelseMålProgress,
    results.relatedGoals
  );

  // 7. Build updated profile
  return {
    ...profile,
    gamification: {
      ...profile.gamification,
      xp: newXP,
      level: newLevel,
      streak: newStreak,
      badges: newBadges,
      lastActivity: new Date(),
    },
    progression: {
      ...profile.progression,
      bandStatus: updatedBandStatus,
      domainStatuses: {
        ...profile.progression.domainStatuses,
        [profile.progression.primaryDomain]: primaryDomainStatus,
      },
      srs: {
        ...profile.progression.srs,
        cards: updatedCards,
        dueToday: getDueCards(updatedCards).map((c) => c.id),
      },
    },
    socialstyrelseMålProgress: updatedMålProgress,
  };
}

/**
 * Gets recent days performance data
 */
function getRecentDays(
  profile: IntegratedUserProfile,
  days: number
): Array<{
  date: Date;
  correctRate: number;
  hintUsage: number;
  difficult: boolean;
}> {
  // In production, this would load from activity log
  // For now, return mock data based on current performance
  const recent: Array<{
    date: Date;
    correctRate: number;
    hintUsage: number;
    difficult: boolean;
  }> = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    recent.push({
      date,
      correctRate: profile.progression.bandStatus.recentPerformance.correctRate,
      hintUsage: profile.progression.bandStatus.recentPerformance.hintUsage,
      difficult:
        profile.progression.bandStatus.recentPerformance.correctRate < 0.6,
    });
  }

  return recent;
}

/**
 * Updates Socialstyrelsen goal progress
 */
function updateSocialstyrelseMålProgress(
  currentProgress: MålProgress[],
  newGoalIds: string[]
): MålProgress[] {
  const updated = [...currentProgress];

  newGoalIds.forEach((goalId) => {
    const existing = updated.find((p) => p.goalId === goalId);
    if (existing) {
      existing.lastUpdated = new Date();
    } else {
      updated.push({
        goalId,
        completedCriteria: [],
        totalCriteria: 5, // Default
        lastUpdated: new Date(),
        achieved: false,
      });
    }
  });

  return updated;
}

/**
 * Calculates integrated analytics
 */
export function calculateIntegratedAnalytics(
  profile: IntegratedUserProfile
): IntegratedAnalytics {
  const { gamification, progression, socialstyrelseMålProgress } = profile;

  // SRS metrics
  const totalCards = progression.srs.cards.length;
  const dueToday = progression.srs.dueToday.length;
  const avgStability =
    totalCards > 0
      ? progression.srs.cards.reduce((sum, c) => sum + c.stability, 0) /
        totalCards
      : 0;
  const leechCards = progression.srs.leechCards.length;

  // Domain metrics
  const domainsCompleted = Object.values(progression.domainStatuses).filter(
    (d) => d.status === 'completed'
  ).length;
  const oscesPassed = progression.history.osceResults.filter((r) => r.passed)
    .length;

  // Socialstyrelsen metrics
  const achievedGoals = socialstyrelseMålProgress.filter((p) => p.achieved)
    .length;
  const totalGoals = socialstyrelseMålProgress.length;

  return {
    gamification: {
      totalXP: gamification.xp,
      level: gamification.level,
      badgesEarned: gamification.badges.length,
      currentStreak: gamification.streak,
      longestStreak: gamification.streak, // TODO: Track separately
      totalSessions: 0, // TODO: Track in profile
    },
    progression: {
      currentBand: progression.bandStatus.currentBand,
      bandHistory: progression.bandStatus.bandHistory,
      domainsCompleted,
      totalDomains: 9,
      oscesPassed,
      oscesTotal: 9,
    },
    srs: {
      totalCards,
      dueToday,
      averageStability: avgStability,
      leechCards,
      reviewsCompleted: 0, // TODO: Track
    },
    performance: {
      overallAccuracy: progression.bandStatus.recentPerformance.correctRate,
      averageHintUsage: progression.bandStatus.recentPerformance.hintUsage,
      averageTimeEfficiency:
        progression.bandStatus.recentPerformance.timeEfficiency,
      recentPerformance: {
        last7Days: {
          accuracy: progression.bandStatus.recentPerformance.correctRate,
          sessionsCompleted: 7, // TODO: Track
          xpEarned: 300, // TODO: Track
        },
        last30Days: {
          accuracy: progression.bandStatus.recentPerformance.correctRate,
          sessionsCompleted: 28, // TODO: Track
          xpEarned: 1200, // TODO: Track
        },
      },
    },
    socialstyrelsen: {
      totalGoals,
      achievedGoals,
      percentage: totalGoals > 0 ? (achievedGoals / totalGoals) * 100 : 0,
      byCompetencyArea: {}, // TODO: Calculate
      recentActivity: [], // TODO: Track
    },
  };
}

/**
 * Maps content from SevenDayPlan to SRS cards
 */
export function mapContentToSRS(
  items: PlanItem[],
  domain: Domain,
  band: DifficultyBand
): SRSCard[] {
  return items.map((item, index) => ({
    id: `srs-${item.id}-${Date.now()}-${index}`,
    domain,
    type: item.type === 'microcase' ? 'microcase' : item.type === 'quiz' ? 'quiz' : 'pearl',
    contentId: item.id,
    easeFactor: 2.5, // Default SM-2
    stability: 0.5, // Initial stability
    interval: 1, // First review in 1 day
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    difficulty: getDifficultyScore(band),
    lastGrade: null,
    lastReviewed: null,
    reviewCount: 0,
    isLeech: false,
    failCount: 0,
    relatedGoals: item.relatedGoals || [],
    competencies: extractCompetencies(item),
    createdAt: new Date(),
  }));
}

/**
 * Gets difficulty score from band
 */
function getDifficultyScore(band: DifficultyBand): number {
  const scores: Record<DifficultyBand, number> = {
    A: 0.2,
    B: 0.4,
    C: 0.6,
    D: 0.8,
    E: 1.0,
  };
  return scores[band];
}

/**
 * Extracts competencies from plan item
 */
function extractCompetencies(item: PlanItem): import('@/types/progression').SubCompetency[] {
  // Simple extraction based on type and description
  const competencies: import('@/types/progression').SubCompetency[] = [];

  if (item.type === 'quiz') competencies.push('diagnostik');
  if (item.type === 'microcase') competencies.push('akuta-flöden');
  if (item.description?.includes('röntgen')) competencies.push('bildtolkning');
  if (item.description?.includes('dokumentation'))
    competencies.push('dokumentation');

  return competencies.length > 0 ? competencies : ['diagnostik'];
}

/**
 * Migrates existing UserProfile to IntegratedUserProfile
 */
export function migrateToIntegratedProfile(
  oldProfile: UserProfile,
  oldPlan: SevenDayPlan
): IntegratedUserProfile {
  const integrated = createIntegratedProfile(oldProfile, oldPlan);

  // Convert completed plan items to SRS cards
  const completedItems: PlanItem[] = [];
  oldPlan.days.forEach((day) => {
    day.items.forEach((item) => {
      if (item.completed) {
        completedItems.push(item);
      }
    });
  });

  if (completedItems.length > 0) {
    const srsCards = mapContentToSRS(
      completedItems,
      integrated.progression.primaryDomain,
      integrated.progression.bandStatus.currentBand
    );
    integrated.progression.srs.cards = srsCards;
    integrated.progression.srs.dueToday = getDueCards(srsCards).map((c) => c.id);
  }

  return integrated;
}

/**
 * Loads available content for a domain
 * TODO: Replace with actual content loading
 */
export function loadAvailableContent(domain?: Domain): Map<Domain, string[]> {
  const content = new Map<Domain, string[]>();
  const domains: Domain[] = [
    'trauma',
    'axel-armbåge',
    'hand-handled',
    'rygg',
    'höft',
    'knä',
    'fot-fotled',
    'sport',
    'tumör',
  ];

  domains.forEach((d) => {
    content.set(d, [
      `${d}-item-1`,
      `${d}-item-2`,
      `${d}-item-3`,
      `${d}-item-4`,
      `${d}-item-5`,
    ]);
  });

  return content;
}
