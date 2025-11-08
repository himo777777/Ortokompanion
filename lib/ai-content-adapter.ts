/**
 * AI Content Adaptation Engine
 *
 * Adapts content selection and recommendations based on:
 * - Current rotation/placement
 * - Learning style preferences
 * - Progress and performance
 * - Time remaining in rotation
 * - Socialstyrelsen goal completion
 */

import { UserProfile, Domain } from '@/types/onboarding';
import { MCQQuestion } from '@/data/questions';
import { getCurrentRotation, getDaysRemaining } from '@/types/rotation';
import { autoAssignGoals, getPriorityGoalsForUser } from './goal-assignment';
import {
  getCurrentRotationProgress,
  predictRotationCompletion,
  RotationActivityLog,
} from './rotation-tracker';
import { logger } from './logger';

export interface ContentAdaptationContext {
  profile: UserProfile;
  completedGoalIds?: string[];
  activityLog?: RotationActivityLog[];
  recentPerformance?: {
    accuracy: number;
    averageTime: number;
    hintsUsed: number;
  };
}

export interface AdaptedContentRecommendation {
  questionIds: string[];
  focusDomains: Domain[];
  focusGoals: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string;
  dailyTarget: number;
}

/**
 * Main content adaptation function
 * Returns personalized content recommendations
 */
export function adaptContentForUser(
  context: ContentAdaptationContext,
  allQuestions: MCQQuestion[]
): AdaptedContentRecommendation {
  const { profile, completedGoalIds = [], activityLog = [], recentPerformance } = context;

  // Determine focus based on user type
  const focusConfig = determineFocus(profile, completedGoalIds, activityLog);

  // Filter questions based on focus
  let relevantQuestions = filterQuestionsByContext(
    allQuestions,
    profile,
    focusConfig.focusDomains,
    focusConfig.focusGoals
  );

  // Adapt difficulty based on performance
  const difficulty = determineDifficulty(profile, recentPerformance);

  // Filter by difficulty
  relevantQuestions = filterByDifficulty(relevantQuestions, difficulty, profile.role);

  // Determine urgency and daily target
  const { urgency, dailyTarget } = determineUrgencyAndTarget(profile, activityLog);

  // Select questions (prioritize based on various factors)
  const selectedQuestionIds = selectQuestions(relevantQuestions, dailyTarget, context);

  return {
    questionIds: selectedQuestionIds,
    focusDomains: focusConfig.focusDomains,
    focusGoals: focusConfig.focusGoals,
    difficulty,
    urgency,
    reasoning: focusConfig.reasoning,
    dailyTarget,
  };
}

/**
 * Determine what to focus on based on rotation/placement
 */
function determineFocus(
  profile: UserProfile,
  completedGoalIds: string[],
  activityLog: RotationActivityLog[]
): {
  focusDomains: Domain[];
  focusGoals: string[];
  reasoning: string;
} {
  // ST-Ortopedi with current rotation
  if (profile.role.match(/^st[1-5]$/) && profile.rotationTimeline) {
    const currentRotation = getCurrentRotation(profile.rotationTimeline);
    if (currentRotation) {
      const progress = getCurrentRotationProgress(profile, activityLog);
      const daysRemaining = getDaysRemaining(currentRotation);

      return {
        focusDomains: [currentRotation.domain],
        focusGoals: currentRotation.goals,
        reasoning: daysRemaining < 30
          ? `Fokus på ${currentRotation.domain} - mindre än en månad kvar i rotationen!`
          : `Fokus på din nuvarande ${currentRotation.domain}-rotation`,
      };
    }
  }

  // ST-Allmänmedicin / ST-Akutsjukvård with placement
  if ((profile.role === 'st-allmänmedicin' || profile.role === 'st-akutsjukvård') && profile.orthoPlacement) {
    const assignedGoals = autoAssignGoals(profile);
    const domains: Domain[] = profile.orthoPlacement.focusDomain
      ? [profile.orthoPlacement.focusDomain]
      : ['trauma', 'höft', 'knä']; // Common ortho areas

    return {
      focusDomains: domains,
      focusGoals: assignedGoals,
      reasoning: profile.placementTiming === 'current'
        ? 'Fokus på din pågående ortopedi-placering'
        : 'Förberedelse för kommande ortopedi-placering',
    };
  }

  // Student/AT with placement
  if ((profile.role === 'student' || profile.role === 'at') && profile.placementTiming) {
    const assignedGoals = autoAssignGoals(profile);

    if (profile.placementTiming === 'current') {
      return {
        focusDomains: profile.domains.length > 0 ? profile.domains : ['trauma'], // Default to trauma
        focusGoals: assignedGoals,
        reasoning: 'Fokus på din nuvarande ortopedi-placering',
      };
    } else if (profile.placementTiming === 'soon') {
      return {
        focusDomains: ['trauma', 'höft', 'knä'], // Foundation areas
        focusGoals: assignedGoals.slice(0, 3), // Top 3 goals
        reasoning: 'Grundläggande ortopedi inför din kommande placering',
      };
    }
  }

  // Specialists - fortbildning focus
  if (profile.role.startsWith('specialist')) {
    return {
      focusDomains: profile.domains.length > 0 ? profile.domains : ['trauma', 'höft', 'knä'],
      focusGoals: autoAssignGoals(profile),
      reasoning: 'Fortbildning inom valda områden',
    };
  }

  // Default: Use user's selected domains and priority goals
  const priorityGoals = getPriorityGoalsForUser(profile, completedGoalIds);

  return {
    focusDomains: profile.domains.length > 0 ? profile.domains : ['trauma'],
    focusGoals: priorityGoals,
    reasoning: 'Baserat på dina valda fokusområden',
  };
}

/**
 * Filter questions by context (domain, goals, level)
 */
function filterQuestionsByContext(
  questions: MCQQuestion[],
  profile: UserProfile,
  focusDomains: Domain[],
  focusGoals: string[]
): MCQQuestion[] {
  return questions.filter(q => {
    // Skip invalid questions
    if (!q || !q.level || !q.domain) {
      return false;
    }

    // Must match level
    if (q.level !== profile.role) {
      // Allow some flexibility: ST can see lower levels, specialists can see all
      const userLevelNum = profile.role.match(/\d+/) ? parseInt(profile.role.match(/\d+/)![0]) : 99;
      const qLevelNum = q.level.match(/\d+/) ? parseInt(q.level.match(/\d+/)![0]) : 0;

      if (profile.role.startsWith('specialist')) {
        // Specialists can see everything
      } else if (userLevelNum < qLevelNum) {
        return false; // Too advanced
      }
    }

    // Must match one of focus domains
    if (focusDomains.length > 0 && !focusDomains.includes(q.domain as Domain)) {
      return false;
    }

    // Prefer questions related to focus goals
    // (Not strict filter, just for prioritization later)

    return true;
  });
}

/**
 * Determine difficulty based on recent performance
 */
function determineDifficulty(
  profile: UserProfile,
  recentPerformance?: { accuracy: number; averageTime: number; hintsUsed: number }
): 'easy' | 'medium' | 'hard' {
  if (!recentPerformance) return 'medium';

  const { accuracy, hintsUsed } = recentPerformance;

  // If struggling (low accuracy, many hints), give easier content
  if (accuracy < 50 || hintsUsed > 2) {
    return 'easy';
  }

  // If doing well (high accuracy, few hints), give harder content
  if (accuracy > 80 && hintsUsed < 1) {
    return 'hard';
  }

  return 'medium';
}

/**
 * Filter questions by difficulty
 */
function filterByDifficulty(
  questions: MCQQuestion[],
  difficulty: 'easy' | 'medium' | 'hard',
  userLevel: string
): MCQQuestion[] {
  // Difficulty is somewhat subjective, use band as proxy
  // Band A-B: easy, Band C-D: medium, Band E: hard

  if (difficulty === 'easy') {
    return questions.filter(q => q.band === 'A' || q.band === 'B');
  } else if (difficulty === 'medium') {
    return questions.filter(q => q.band === 'C' || q.band === 'D');
  } else {
    return questions.filter(q => q.band === 'E');
  }
}

/**
 * Determine urgency and daily target based on rotation/placement timing
 */
function determineUrgencyAndTarget(
  profile: UserProfile,
  activityLog: RotationActivityLog[]
): {
  urgency: 'low' | 'medium' | 'high' | 'critical';
  dailyTarget: number;
} {
  // ST-Ortopedi with rotation
  if (profile.role.match(/^st[1-5]$/) && profile.rotationTimeline) {
    const currentRotation = getCurrentRotation(profile.rotationTimeline);
    if (currentRotation) {
      const daysRemaining = getDaysRemaining(currentRotation);
      const progress = getCurrentRotationProgress(profile, activityLog);

      if (progress) {
        const prediction = predictRotationCompletion(currentRotation, progress);

        if (daysRemaining < 7) {
          return { urgency: 'critical', dailyTarget: prediction.requiredDailyActivities };
        } else if (daysRemaining < 30 || !progress.onTrack) {
          return { urgency: 'high', dailyTarget: Math.max(10, prediction.requiredDailyActivities) };
        } else if (daysRemaining < 60) {
          return { urgency: 'medium', dailyTarget: 8 };
        }
      }

      return { urgency: 'low', dailyTarget: 5 };
    }
  }

  // Placement with timing
  if (profile.placementTiming === 'current') {
    return { urgency: 'high', dailyTarget: 10 };
  } else if (profile.placementTiming === 'soon') {
    return { urgency: 'medium', dailyTarget: 7 };
  }

  // Default
  return { urgency: 'low', dailyTarget: 5 };
}

/**
 * Select specific questions based on various prioritization factors
 */
function selectQuestions(
  questions: MCQQuestion[],
  targetCount: number,
  context: ContentAdaptationContext
): string[] {
  // FALLBACK: If no questions available, return empty array (caller must handle)
  if (questions.length === 0) {
    logger.warn('No questions available to select from', { targetCount });
    return [];
  }

  // Score each question
  const scored = questions.map(q => {
    let score = 0;

    // Priority 1: Questions related to focus goals
    if (context.profile.rotationTimeline) {
      const currentRotation = getCurrentRotation(context.profile.rotationTimeline);
      if (currentRotation && q.relatedGoals) {
        const matchingGoals = q.relatedGoals.filter(g =>
          currentRotation.goals.includes(g)
        );
        score += matchingGoals.length * 100;
      }
    }

    // Priority 2: Questions user hasn't seen (if we had activity history)
    // For now, just randomize a bit
    score += Math.random() * 10;

    // Priority 3: Band appropriate for user
    const userBand = context.profile.role.match(/\d+/)
      ? parseInt(context.profile.role.match(/\d+/)![0])
      : 3;
    // Convert band letter to number (A=1, B=2, C=3, D=4, E=5)
    const bandToNumber = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
    const questionBand = bandToNumber[q.band as keyof typeof bandToNumber] || 3;
    const bandDiff = Math.abs(questionBand - userBand);
    score -= bandDiff * 5;

    return { question: q, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // GUARANTEE at least some questions if available
  const selected = scored.slice(0, Math.max(1, targetCount)).map(s => s.question.id);

  if (selected.length === 0 && questions.length > 0) {
    logger.warn('Fallback - returning first available question', { questionsLength: questions.length });
    return [questions[0].id];
  }

  return selected;
}

/**
 * Generate AI-adapted study plan for the week
 */
export function generateAIStudyPlan(
  context: ContentAdaptationContext,
  allQuestions: MCQQuestion[]
): {
  daily: AdaptedContentRecommendation[];
  weeklyGoals: string[];
  motivationalMessage: string;
} {
  const daily: AdaptedContentRecommendation[] = [];

  // Generate 7 days of content
  for (let day = 0; day < 7; day++) {
    const dayRecommendation = adaptContentForUser(context, allQuestions);
    daily.push(dayRecommendation);
  }

  // Weekly goals
  const weeklyGoals = getPriorityGoalsForUser(
    context.profile,
    context.completedGoalIds || []
  ).slice(0, 3);

  // Motivational message based on context
  let motivationalMessage = 'Välkommen! Låt oss göra en fantastisk vecka tillsammans.';

  if (context.profile.rotationTimeline) {
    const currentRotation = getCurrentRotation(context.profile.rotationTimeline);
    if (currentRotation) {
      const daysRemaining = getDaysRemaining(currentRotation);
      if (daysRemaining < 30) {
        motivationalMessage = `Du har ${daysRemaining} dagar kvar i din ${currentRotation.domain}-rotation. Låt oss göra räkningen!`;
      } else {
        motivationalMessage = `Fokusera på din ${currentRotation.domain}-rotation denna vecka. Du har god tid att nå dina mål!`;
      }
    }
  } else if (context.profile.placementTiming === 'current') {
    motivationalMessage = 'Din ortopedi-placering pågår! Låt oss maximera din inlärning denna vecka.';
  } else if (context.profile.placementTiming === 'soon') {
    motivationalMessage = 'Förbered dig inför din kommande ortopedi-placering. Varje dag räknas!';
  }

  return {
    daily,
    weeklyGoals,
    motivationalMessage,
  };
}
