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
  SessionHistoryEntry,
  WrongQuestionEntry,
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
import {
  adaptContentForUser,
  ContentAdaptationContext,
  AdaptedContentRecommendation,
} from './ai-content-adapter';
import { MCQQuestion } from '@/data/questions';
import { getCurrentRotation } from '@/types/rotation';
import { RotationActivityLog } from './rotation-tracker';
import { getAppropriateBands, isLevelAppropriate } from './level-utils';
import { getGoalById as getGoalFromDatabase } from '@/data/focused-socialstyrelsen-goals';
import { normalizeGoalIds, isLegacyGoalId } from './goal-id-compatibility';
import { logger } from './logger';

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
 * Converts a basic UserProfile to an IntegratedUserProfile with progression tracking
 *
 * Initializes the integrated profile with:
 * - Band system status for adaptive difficulty
 * - Domain-specific progression tracking
 * - SRS (Spaced Repetition System) card management
 * - Gamification elements (freeze tokens, etc.)
 * - Learning history tracking
 *
 * @param profile - Basic user profile from onboarding
 * @param plan - Seven-day study plan for the user
 * @returns Complete integrated profile with all progression systems initialized
 *
 * @example
 * ```typescript
 * const basicProfile = { role: 'st1', domains: ['trauma'], ... };
 * const plan = generateSevenDayPlan(basicProfile);
 * const integrated = createIntegratedProfile(basicProfile, plan);
 * // integrated.progression.bandStatus = { currentBand: 'B', ... }
 * ```
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
      longestStreak: profile.gamification?.streak || 0,
      totalSessions: 0,
      freezeTokens: 2, // Start with 2 freeze tokens
      prestigeLevel: 0,
      lifetimeXP: profile.gamification?.xp || 0,
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
        sessionHistory: [],
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
 * Generates personalized daily question mix for integrated profile
 *
 * Uses AI-powered content adaptation to select questions based on:
 * - Current rotation and Socialstyrelsen goals
 * - User's band level and performance history
 * - SRS due cards for retention
 * - Learning preferences and time budget
 *
 * The mix balances new learning with retention practice using the band system
 * for adaptive difficulty and SRS for long-term retention.
 *
 * @param profile - Integrated user profile with progression tracking
 * @param availableQuestions - Pool of questions to select from
 * @param activityLog - Optional activity log for rotation-aware recommendations
 * @returns Personalized daily mix with questions distributed across categories
 *
 * @example
 * ```typescript
 * const mix = generateIntegratedDailyMix(profile, ALL_QUESTIONS, activityLog);
 * // mix.newLearning: [q1, q2, q3] (Band B questions)
 * // mix.retention: [q4, q5] (SRS due cards)
 * // mix.goalDriven: [q6, q7] (Rotation-specific)
 * ```
 */
export function generateIntegratedDailyMix(
  profile: IntegratedUserProfile,
  availableQuestions: MCQQuestion[],
  activityLog?: RotationActivityLog[]
): DailyMix {
  const { progression, preferences } = profile;

  // Filter out any invalid questions
  const validQuestions = availableQuestions.filter(q => q && q.id && q.domain && q.level);

  // Early warning if no questions available
  if (validQuestions.length === 0) {
    logger.warn('No valid questions available for daily mix generation', {
      totalQuestionsProvided: availableQuestions.length,
    });
  }

  // Build AI adaptation context
  const context: ContentAdaptationContext = {
    profile,
    completedGoalIds: profile.socialstyrelseMålProgress
      .filter((p) => p.achieved)
      .map((p) => p.goalId),
    activityLog: activityLog || [],
    recentPerformance: {
      accuracy: progression.bandStatus.recentPerformance.correctRate * 100,
      averageTime: 30, // TODO: Track actual average time
      hintsUsed: progression.bandStatus.recentPerformance.hintUsage,
    },
  };

  // Get AI-adapted content recommendations based on rotation/placement
  const aiRecommendation = adaptContentForUser(context, validQuestions);

  // Day 1 is always easier
  const isDay1 = progression.history.bandAdjustments.length === 0;
  const targetBand = isDay1
    ? getDayOneBand(progression.bandStatus.currentBand)
    : progression.bandStatus.currentBand;

  // ALWAYS prioritize rotation domain if user has active rotation
  let primaryDomain = progression.primaryDomain;

  // ST-Ortopedi with active rotation
  if (profile.role.match(/^st[1-5]$/) && profile.rotationTimeline) {
    const currentRotation = getCurrentRotation(profile.rotationTimeline);
    if (currentRotation) {
      primaryDomain = currentRotation.domain;
    }
  }

  // Other specialties with ortho placement
  if (profile.role === 'at' || profile.role === 'student') {
    if (profile.orthoPlacement?.focusDomain) {
      primaryDomain = profile.orthoPlacement.focusDomain as Domain;
    }
  }

  // Identify weak domains from wrong answer history
  const weakDomains = getWeakDomains(
    profile.wrongQuestions || [],
    progression.history.sessionHistory,
    14 // Look back 14 days
  );

  if (weakDomains.length > 0) {
    logger.info('Weak domains detected (training focus)', {
      weakDomains: weakDomains.map(({ domain, accuracy }) => ({
        domain,
        accuracy: Math.round(accuracy),
      })),
    });
  }

  // Use AI-recommended focus domains but ensure rotation domain is first
  let focusDomains = aiRecommendation.focusDomains.length > 0
    ? aiRecommendation.focusDomains
    : [primaryDomain];

  // Add weak domains to focus list (after primary but before other AI recommendations)
  const weakDomainNames = weakDomains.map(w => w.domain);
  const weakDomainsToAdd = weakDomainNames.filter(d => d !== primaryDomain && !focusDomains.includes(d));
  if (weakDomainsToAdd.length > 0) {
    // Insert weak domains after primary domain
    focusDomains = [primaryDomain, ...weakDomainsToAdd, ...focusDomains.filter(d => d !== primaryDomain)];
    logger.info('Adding weak domains to training focus', {
      domains: weakDomainsToAdd.slice(0, 2),
    });
  }

  // Ensure primaryDomain is always first if not already there
  if (!focusDomains.includes(primaryDomain)) {
    focusDomains = [primaryDomain, ...focusDomains];
  } else if (focusDomains[0] !== primaryDomain) {
    focusDomains = [primaryDomain, ...focusDomains.filter(d => d !== primaryDomain)];
  }

  // Convert AI-recommended questions to Map format for domain-progression
  // Filter by band, level hierarchy, and AI recommendations
  const appropriateBands = getAppropriateBands(targetBand, false, 2); // Allow ±2 band variation for better availability

  logger.debug('Generating daily mix', {
    role: profile.role,
    primaryDomain,
    targetBand,
    appropriateBands,
    focusDomains: focusDomains.slice(0, 3),
    totalValidQuestions: validQuestions.length,
  });

  const availableContent = new Map<Domain, string[]>();
  focusDomains.forEach((domain) => {
    // Filter questions by domain, level, band, and recommended IDs
    // Then prioritize by Socialstyrelsen goal completion status
    let domainQuestionsFiltered = validQuestions
      .filter((q) => {
        // Must match domain
        if (q.domain !== domain) return false;

        // Use level hierarchy (ST3 can see ST1-ST3 content)
        if (!isLevelAppropriate(q.level, profile.role)) return false;

        // Filter by appropriate bands (target ±1)
        if (!appropriateBands.includes(q.band)) return false;

        // If AI recommended specific IDs, use only those
        if (aiRecommendation.questionIds.length > 0) {
          return aiRecommendation.questionIds.includes(q.id);
        }

        return true;
      });

    // Sort by goal-based priority (highest first)
    const sortedByGoalPriority = domainQuestionsFiltered
      .map((q) => ({
        question: q,
        priority: getGoalBasedPriority(q, profile.socialstyrelseMålProgress)
      }))
      .sort((a, b) => b.priority - a.priority);

    // Log top priorities for debugging
    if (sortedByGoalPriority.length > 0) {
      const topPriorities = sortedByGoalPriority.slice(0, 3);
      logger.debug('Top questions by goal priority', {
        domain,
        questions: topPriorities.map(({ question, priority }) => ({
          id: question.id.substring(0, 20),
          priority: Math.round(priority),
          goals: question.relatedGoals?.length || 0,
        })),
      });
    }

    let domainQuestions = sortedByGoalPriority
      .map(({ question }) => question.id)
      .filter((id): id is string => id != null && id !== '');

    // FALLBACK: If no questions match strict filters, relax the filters
    if (domainQuestions.length === 0) {
      logger.warn('No questions found for domain with strict filters, relaxing filters', { domain });

      // Try without AI recommendation filter, but still prioritize by goals
      const fallbackFiltered = validQuestions
        .filter((q) => {
          if (q.domain !== domain) return false;
          if (!isLevelAppropriate(q.level, profile.role)) return false;
          if (!appropriateBands.includes(q.band)) return false;
          return true;
        });

      domainQuestions = fallbackFiltered
        .map((q) => ({
          question: q,
          priority: getGoalBasedPriority(q, profile.socialstyrelseMålProgress)
        }))
        .sort((a, b) => b.priority - a.priority)
        .map(({ question }) => question.id)
        .filter((id): id is string => id != null && id !== '');
    }

    // FALLBACK 2: If still empty, try with any band
    if (domainQuestions.length === 0) {
      logger.warn('Still no questions for domain, trying any band', { domain });

      const fallback2Filtered = validQuestions
        .filter((q) => {
          if (q.domain !== domain) return false;
          if (!isLevelAppropriate(q.level, profile.role)) return false;
          return true;
        });

      domainQuestions = fallback2Filtered
        .map((q) => ({
          question: q,
          priority: getGoalBasedPriority(q, profile.socialstyrelseMålProgress)
        }))
        .sort((a, b) => b.priority - a.priority)
        .map(({ question }) => question.id)
        .filter((id): id is string => id != null && id !== '');
    }

    // FINAL FALLBACK: If still empty, get ANY question from domain
    if (domainQuestions.length === 0) {
      logger.warn('No level-appropriate questions for domain, using any available', { domain });

      const finalFallback = validQuestions
        .filter((q) => q.domain === domain);

      domainQuestions = finalFallback
        .map((q) => ({
          question: q,
          priority: getGoalBasedPriority(q, profile.socialstyrelseMålProgress)
        }))
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5) // Take top 5 by priority
        .map(({ question }) => question.id)
        .filter((id): id is string => id != null && id !== '');
    }

    availableContent.set(domain, domainQuestions);

    logger.debug('Domain questions available', { domain, count: domainQuestions.length });
  });

  // Log summary
  const totalAvailable = Array.from(availableContent.values()).reduce((sum, ids) => sum + ids.length, 0);
  logger.debug('Total questions available across all domains', { totalAvailable });

  const completedDomains = getCompletedDomains(progression.domainStatuses);

  // Generate daily mix with rotation-aware parameters
  const dailyMix = generateDailyMix({
    primaryDomain: focusDomains[0], // Use AI-determined primary focus
    targetBand,
    srsCards: progression.srs.cards,
    availableNewContent: availableContent,
    completedDomains,
    isRecoveryDay: preferences?.recoveryMode || false,
    targetMinutes: aiRecommendation.dailyTarget || preferences?.targetMinutesPerDay || 10,
  });

  // Add weak domains information for UI display
  return {
    ...dailyMix,
    weakDomains: weakDomains.length > 0 ? weakDomains : undefined,
  };
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
 * Analyzes wrong answers to identify weak domains
 * Returns domains with <70% accuracy based on recent wrong answers
 */
function getWeakDomains(
  wrongQuestions: WrongQuestionEntry[],
  sessionHistory: SessionHistoryEntry[],
  lookbackDays: number = 14
): { domain: Domain; accuracy: number }[] {
  if (!wrongQuestions || wrongQuestions.length === 0) {
    return [];
  }

  // Filter to recent entries (last N days)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

  const recentWrong = wrongQuestions.filter((w) => {
    const entryDate = new Date(w.timestamp);
    return entryDate >= cutoffDate;
  });

  // Count wrong answers per domain
  const wrongCountByDomain = new Map<Domain, number>();
  recentWrong.forEach((w) => {
    wrongCountByDomain.set(w.domain, (wrongCountByDomain.get(w.domain) || 0) + 1);
  });

  // Count total questions answered per domain from session history
  const totalByDomain = new Map<Domain, number>();
  sessionHistory
    .filter((s) => {
      const sessionDate = new Date(s.date);
      return sessionDate >= cutoffDate;
    })
    .forEach((s) => {
      totalByDomain.set(s.domain, (totalByDomain.get(s.domain) || 0) + s.questionsAnswered);
    });

  // Calculate accuracy per domain
  const domainAccuracies: { domain: Domain; accuracy: number }[] = [];
  wrongCountByDomain.forEach((wrongCount, domain) => {
    const total = totalByDomain.get(domain) || wrongCount;
    const correctCount = total - wrongCount;
    const accuracy = total > 0 ? (correctCount / total) * 100 : 100;

    // Include domains with <70% accuracy
    if (accuracy < 70) {
      domainAccuracies.push({ domain, accuracy });
    }
  });

  // Sort by accuracy (lowest first = weakest)
  return domainAccuracies.sort((a, b) => a.accuracy - b.accuracy);
}

/**
 * Calculates priority score for a question based on Socialstyrelsen goal completion
 * Higher score = higher priority
 */
function getGoalBasedPriority(
  question: MCQQuestion,
  goalProgress: MålProgress[]
): number {
  // Questions without goals get neutral priority
  if (!question.relatedGoals || question.relatedGoals.length === 0) {
    return 50;
  }

  let totalPriority = 0;
  let goalCount = 0;

  question.relatedGoals.forEach((goalId) => {
    const progress = goalProgress.find((p) => p.goalId === goalId);

    if (!progress) {
      // New goal that hasn't been started yet - high priority
      totalPriority += 100;
    } else if (progress.achieved) {
      // Already achieved - low priority
      totalPriority += 10;
    } else {
      // In progress - prioritize based on completion percentage
      const completionPercentage = (progress.completedCriteria.length / progress.totalCriteria) * 100;

      if (completionPercentage < 30) {
        // Low completion - highest priority
        totalPriority += 90;
      } else if (completionPercentage < 70) {
        // Medium completion - medium priority
        totalPriority += 60;
      } else {
        // High completion but not done - medium-low priority
        totalPriority += 30;
      }
    }
    goalCount++;
  });

  return goalCount > 0 ? totalPriority / goalCount : 50;
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
  const calculatedLevel = Math.floor(newXP / 100) + 1;

  // Level cap at 50
  const MAX_LEVEL = 50;
  const newLevel = Math.min(calculatedLevel, MAX_LEVEL);
  const isAtLevelCap = calculatedLevel >= MAX_LEVEL;

  const newStreak = profile.gamification.streak + 1;
  const newTotalSessions = (profile.gamification.totalSessions || 0) + 1;
  const newLongestStreak = Math.max(
    profile.gamification.longestStreak || 0,
    newStreak
  );

  // Check for new badges
  const newBadges = [...profile.gamification.badges];
  if (newStreak >= 7 && !newBadges.includes('week_warrior')) {
    newBadges.push('week_warrior');
  }
  if (newLevel >= 10 && !newBadges.includes('level_10')) {
    newBadges.push('level_10');
  }
  if (newLevel >= 25 && !newBadges.includes('level_25')) {
    newBadges.push('level_25');
  }
  if (newLevel >= MAX_LEVEL && !newBadges.includes('max_level')) {
    newBadges.push('max_level');
    logger.info('Max level achieved! Consider prestige to reset and earn exclusive badges');
  }

  // Log level cap warning
  if (isAtLevelCap && calculatedLevel > MAX_LEVEL) {
    logger.warn('Level cap reached - earning XP but not leveling up', {
      maxLevel: MAX_LEVEL,
      wouldBeLevel: calculatedLevel,
    });
  }

  // 1b. Create session history entry
  const sessionEntry: SessionHistoryEntry = {
    id: `session-${Date.now()}`,
    date: new Date(),
    domain: profile.progression.primaryDomain,
    band: profile.progression.bandStatus.currentBand,
    xpEarned: results.summary.xpEarned,
    accuracy: results.summary.accuracy,
    timeSpent: results.summary.timeSpent,
    questionsAnswered: results.summary.questionsAnswered,
    hintsUsed: results.summary.hintsUsed,
  };

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

  // 4b. Check if recovery mode should be auto-triggered
  const { hasTwoDifficultDaysInRow } = require('./band-system');
  const shouldEnterRecovery = hasTwoDifficultDaysInRow(recentDays.slice(0, 2));
  const currentlyInRecovery = profile.preferences?.recoveryMode || false;

  // Auto-enable recovery mode if 2 difficult days detected
  let updatedPreferences = profile.preferences;
  if (shouldEnterRecovery && !currentlyInRecovery) {
    logger.info('Two difficult days detected - auto-enabling recovery mode');
    updatedPreferences = {
      ...profile.preferences,
      recoveryMode: true,
    };
  } else if (!shouldEnterRecovery && currentlyInRecovery) {
    // Auto-disable recovery mode when performance improves
    logger.info('Performance improved - disabling recovery mode');
    updatedPreferences = {
      ...profile.preferences,
      recoveryMode: false,
    };
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

  // Check if domain complete and unlock next
  let updatedDomainStatuses = {
    ...profile.progression.domainStatuses,
    [profile.progression.primaryDomain]: primaryDomainStatus,
  };

  let newPrimaryDomain = profile.progression.primaryDomain;
  let domainCompletionEvent: { completed: Domain; next: Domain | null; allCompleted: boolean } | null = null;

  if (isGateRequirementMet(primaryDomainStatus, updatedCards)) {
    const { completeDomainAndUnlockNext } = require('./domain-progression');
    const ALL_DOMAINS: Domain[] = [
      'trauma',
      'höft',
      'fot-fotled',
      'hand-handled',
      'knä',
      'axel-armbåge',
      'rygg',
      'sport',
      'tumör',
    ];

    const result = completeDomainAndUnlockNext(
      profile.progression.primaryDomain,
      updatedDomainStatuses,
      ALL_DOMAINS
    );

    updatedDomainStatuses = result.updatedStatuses;

    // Update primary domain to next unlocked domain
    if (result.nextDomain) {
      newPrimaryDomain = result.nextDomain;
    }

    // Track completion event for logging/notifications
    domainCompletionEvent = {
      completed: profile.progression.primaryDomain,
      next: result.nextDomain,
      allCompleted: result.allCompleted,
    };

    // Log completion
    logger.info('Domain completed', {
      domain: profile.progression.primaryDomain,
      allCompleted: result.allCompleted,
      nextDomain: result.nextDomain,
    });
  }

  // 6. Update Socialstyrelsen progress
  const updatedMålProgress = updateSocialstyrelseMålProgress(
    profile.socialstyrelseMålProgress,
    results.relatedGoals,
    {
      correctRate: results.performance.correctRate,
      questionsAnswered: results.summary.questionsAnswered,
    }
  );

  // 7. Detect leech cards and overdue cards for remediation
  const { detectLeeches } = require('./srs-algorithm');
  const leechCards: SRSCard[] = detectLeeches(updatedCards);

  // Get overdue cards (cards with dueDate before today)
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const overdueCards: SRSCard[] = updatedCards.filter((card) => {
    const dueDate = new Date(card.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < now;
  });

  // Check for newly detected leech cards
  const previousLeechIds = new Set(profile.progression.srs.leechCards);
  const newLeechCards = leechCards.filter((card: SRSCard) => !previousLeechIds.has(card.id));

  if (newLeechCards.length > 0) {
    logger.warn('Leech cards detected - these need focused review', {
      count: newLeechCards.length,
      cards: newLeechCards.map((c: SRSCard) => ({ id: c.id, domain: c.domain, failCount: c.failCount })),
    });
    // Note: Toast notification shown in IntegratedContext
  }

  // 8. Track wrong answers for weak area identification
  const existingWrongQuestions = profile.wrongQuestions || [];
  const updatedWrongQuestions = [
    ...results.wrongAnswers,
    ...existingWrongQuestions,
  ].slice(0, 100); // Keep last 100 wrong answers

  // Log wrong answers for debugging
  if (results.wrongAnswers.length > 0) {
    logger.debug('Wrong answers this session', {
      count: results.wrongAnswers.length,
      domainsWithErrors: Array.from(new Set(results.wrongAnswers.map(w => w.domain))),
    });
  }

  // 9. Build updated profile
  return {
    ...profile,
    gamification: {
      ...profile.gamification,
      xp: newXP,
      level: newLevel,
      streak: newStreak,
      longestStreak: newLongestStreak,
      totalSessions: newTotalSessions,
      badges: newBadges,
      lastActivity: new Date(),
      lifetimeXP: (profile.gamification.lifetimeXP || 0) + results.summary.xpEarned,
    },
    progression: {
      ...profile.progression,
      primaryDomain: newPrimaryDomain, // Update to next domain if completed
      bandStatus: updatedBandStatus,
      domainStatuses: updatedDomainStatuses, // Use updated statuses with unlocked domain
      srs: {
        ...profile.progression.srs,
        cards: updatedCards,
        dueToday: getDueCards(updatedCards).map((c: SRSCard) => c.id),
        leechCards: leechCards.map((c: SRSCard) => c.id),
        overdueCards: overdueCards.map((c: SRSCard) => c.id),
      },
      history: {
        ...profile.progression.history,
        sessionHistory: [...profile.progression.history.sessionHistory, sessionEntry],
      },
    },
    socialstyrelseMålProgress: updatedMålProgress,
    wrongQuestions: updatedWrongQuestions,
    preferences: updatedPreferences,
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
/**
 * Get goal data by ID from Socialstyrelsen goals
 */
function getGoalById(goalId: string): { totalCriteria: number; minimumCases?: number; minimumProcedures?: number } | null {
  // Use new goal database
  const goal = getGoalFromDatabase(goalId);

  if (goal && goal.assessmentCriteria) {
    return {
      totalCriteria: goal.assessmentCriteria.length,
      minimumCases: goal.minimumCases,
      minimumProcedures: goal.minimumProcedures,
    };
  }

  return null;
}

/**
 * Update Socialstyrelsen goal progress
 *
 * @param currentProgress - Current goal progress array
 * @param newGoalIds - Goal IDs touched in this session
 * @param sessionPerformance - Session performance metrics (correctRate, etc.)
 * @returns Updated progress array
 */
function updateSocialstyrelseMålProgress(
  currentProgress: MålProgress[],
  newGoalIds: string[],
  sessionPerformance?: { correctRate: number; questionsAnswered: number }
): MålProgress[] {
  const updated = [...currentProgress];

  // Normalize goal IDs (convert legacy to new format)
  const { normalized: normalizedGoalIds, warnings } = normalizeGoalIds(newGoalIds);

  // Log warnings about legacy goal mappings
  if (warnings.length > 0) {
    logger.warn('Legacy goal ID mappings detected', { warnings });
  }

  // Performance threshold to advance criteria
  const PERFORMANCE_THRESHOLD = 0.7; // 70% correct
  const shouldAdvanceCriteria = sessionPerformance &&
    sessionPerformance.correctRate >= PERFORMANCE_THRESHOLD &&
    sessionPerformance.questionsAnswered > 0;

  normalizedGoalIds.forEach((goalId) => {
    const existing = updated.find((p) => p.goalId === goalId);

    if (existing) {
      // Update existing goal progress
      existing.lastUpdated = new Date();

      // Advance one criterion if performance is good and not all criteria completed
      if (shouldAdvanceCriteria && existing.completedCriteria.length < existing.totalCriteria) {
        // Find next incomplete criterion index
        const nextCriterionIndex = existing.completedCriteria.length; // 0, 1, 2, etc.

        // Add it if not already present
        if (!existing.completedCriteria.includes(nextCriterionIndex)) {
          existing.completedCriteria.push(nextCriterionIndex);
          logger.debug('Goal criterion completed', {
            goalId,
            criterion: nextCriterionIndex + 1,
            total: existing.totalCriteria,
          });
        }
      }

      // Check if goal is now achieved
      if (existing.completedCriteria.length >= existing.totalCriteria && !existing.achieved) {
        existing.achieved = true;
        logger.info('Goal achieved! All criteria completed', {
          goalId,
          totalCriteria: existing.totalCriteria,
        });
      }
    } else {
      // Create new goal progress entry
      const goalData = getGoalById(goalId);
      const totalCriteria = goalData?.totalCriteria || 4; // Default to 4 if not found

      const completedCriteria: number[] = [];

      // If performance is good, mark first criterion as complete
      if (shouldAdvanceCriteria) {
        completedCriteria.push(0);
        logger.debug('First criterion completed for new goal', {
          goalId,
          totalCriteria,
        });
      }

      updated.push({
        goalId,
        completedCriteria,
        totalCriteria,
        lastUpdated: new Date(),
        achieved: completedCriteria.length >= totalCriteria,
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

  // Calculate byCompetencyArea breakdown
  const { getAllMålForLevel } = require('@/data/socialstyrelsen-goals');
  const byCompetencyArea: Record<string, { total: number; achieved: number }> = {};

  socialstyrelseMålProgress.forEach((progress) => {
    try {
      // Extract level from goalId (e.g., 'lp-01' -> 'student', 'at-01' -> 'at')
      const levelPrefix = progress.goalId.split('-')[0];
      let level: EducationLevel = 'student';

      if (levelPrefix === 'lp') level = 'student';
      else if (levelPrefix === 'at') level = 'at';
      else if (levelPrefix === 'st1') level = 'st1';
      else if (levelPrefix === 'st2') level = 'st2';
      else if (levelPrefix === 'st3') level = 'st3';
      else if (levelPrefix === 'st4') level = 'st4';
      else if (levelPrefix === 'st5') level = 'st5';

      const allGoals = getAllMålForLevel(level);
      const goal = allGoals.find((g: any) => g.id === progress.goalId);

      if (goal && goal.competencyArea) {
        const area = goal.competencyArea;
        if (!byCompetencyArea[area]) {
          byCompetencyArea[area] = { total: 0, achieved: 0 };
        }
        byCompetencyArea[area].total++;
        if (progress.achieved) {
          byCompetencyArea[area].achieved++;
        }
      }
    } catch (error) {
      logger.warn('Could not process goal for competency breakdown', {
        goalId: progress.goalId,
        error,
      });
    }
  });

  // Session history metrics
  const sessionHistory = progression.history.sessionHistory || [];
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const last7DaysSessions = sessionHistory.filter(s => new Date(s.date) >= sevenDaysAgo);
  const last30DaysSessions = sessionHistory.filter(s => new Date(s.date) >= thirtyDaysAgo);

  const last7DaysXP = last7DaysSessions.reduce((sum, s) => sum + s.xpEarned, 0);
  const last30DaysXP = last30DaysSessions.reduce((sum, s) => sum + s.xpEarned, 0);

  const last7DaysAccuracy = last7DaysSessions.length > 0
    ? last7DaysSessions.reduce((sum, s) => sum + s.accuracy, 0) / last7DaysSessions.length
    : progression.bandStatus.recentPerformance.correctRate;

  const last30DaysAccuracy = last30DaysSessions.length > 0
    ? last30DaysSessions.reduce((sum, s) => sum + s.accuracy, 0) / last30DaysSessions.length
    : progression.bandStatus.recentPerformance.correctRate;

  return {
    gamification: {
      totalXP: gamification.xp,
      level: gamification.level,
      badgesEarned: gamification.badges.length,
      currentStreak: gamification.streak,
      longestStreak: gamification.longestStreak || gamification.streak,
      totalSessions: gamification.totalSessions || 0,
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
      reviewsCompleted: sessionHistory.reduce((sum, s) => sum + s.questionsAnswered, 0),
    },
    performance: {
      overallAccuracy: progression.bandStatus.recentPerformance.correctRate,
      averageHintUsage: progression.bandStatus.recentPerformance.hintUsage,
      averageTimeEfficiency:
        progression.bandStatus.recentPerformance.timeEfficiency,
      recentPerformance: {
        last7Days: {
          accuracy: last7DaysAccuracy,
          sessionsCompleted: last7DaysSessions.length,
          xpEarned: last7DaysXP,
        },
        last30Days: {
          accuracy: last30DaysAccuracy,
          sessionsCompleted: last30DaysSessions.length,
          xpEarned: last30DaysXP,
        },
      },
    },
    socialstyrelsen: {
      totalGoals,
      achievedGoals,
      percentage: totalGoals > 0 ? (achievedGoals / totalGoals) * 100 : 0,
      byCompetencyArea,
      recentActivity: [], // TODO: Track recent goal achievements
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
 * Loads available content for a domain from actual question bank
 * @param allQuestions - Full question bank
 * @param targetDomain - Optional domain filter
 * @returns Map of domain to question IDs
 */
export function loadAvailableContent(
  allQuestions: MCQQuestion[],
  targetDomain?: Domain
): Map<Domain, string[]> {
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

  // Filter domains if specific domain requested
  const domainsToLoad = targetDomain ? [targetDomain] : domains;

  domainsToLoad.forEach((d) => {
    const domainQuestions = allQuestions
      .filter((q) => q.domain === d)
      .map((q) => q.id);
    content.set(d, domainQuestions);
  });

  return content;
}

/**
 * Prestige system - Reset level and XP while keeping all progress
 *
 * @param profile - Current user profile
 * @returns Updated profile with prestige applied
 */
export function prestigeProfile(
  profile: IntegratedUserProfile
): IntegratedUserProfile {
  const newPrestigeLevel = (profile.gamification.prestigeLevel || 0) + 1;
  const prestigeBadge = `prestige_${newPrestigeLevel}`;

  // Add prestige badge
  const newBadges = [...profile.gamification.badges];
  if (!newBadges.includes(prestigeBadge)) {
    newBadges.push(prestigeBadge);
  }

  logger.info('Prestige level increased - level reset to 1', {
    prestigeLevel: newPrestigeLevel,
    lifetimeXP: profile.gamification.lifetimeXP,
  });

  return {
    ...profile,
    gamification: {
      ...profile.gamification,
      xp: 0,
      level: 1,
      prestigeLevel: newPrestigeLevel,
      badges: newBadges,
      // Keep: streak, longestStreak, totalSessions, lifetimeXP, freezeTokens
    },
    // Keep all progression: domains, SRS cards, goals, band status, history
  };
}
