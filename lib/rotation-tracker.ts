/**
 * Rotation Progress Tracker
 *
 * Tracks progress for ST-läkare rotations:
 * - Questions answered per rotation
 * - Goals completed per rotation
 * - Time remaining in rotation
 * - Predicts if user will complete rotation goals on time
 */

import { Rotation, RotationTimeline, getCurrentRotation, getDaysRemaining, getRotationDuration } from '@/types/rotation';
import { UserProfile } from '@/types/onboarding';
import { getMålForLevel } from '@/data/socialstyrelsen-goals';

export interface RotationProgress {
  rotationId: string;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  goalsCompleted: string[]; // Socialstyrelsen goal IDs
  totalGoals: number;
  completionPercentage: number;
  daysRemaining: number;
  onTrack: boolean;
  recommendation: string;
}

export interface RotationActivityLog {
  rotationId: string;
  questionId: string;
  correct: boolean;
  timestamp: Date;
  domain: string;
  goalIds?: string[]; // Related Socialstyrelsen goals
}

/**
 * Calculate progress for a specific rotation
 */
export function calculateRotationProgress(
  rotation: Rotation,
  activityLog: RotationActivityLog[]
): RotationProgress {
  // Filter activities for this rotation
  const rotationActivities = activityLog.filter(a => a.rotationId === rotation.id);

  const questionsAnswered = rotationActivities.length;
  const correctAnswers = rotationActivities.filter(a => a.correct).length;
  const accuracy = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;

  const totalGoals = rotation.goals.length;
  const goalsCompleted = rotation.goals.filter(goalId => {
    // Goal is completed if user has answered related questions correctly
    const goalActivities = rotationActivities.filter(a =>
      a.goalIds?.includes(goalId)
    );
    // Consider goal completed if user has answered at least 3 related questions with >70% accuracy
    if (goalActivities.length < 3) return false;
    const goalCorrect = goalActivities.filter(a => a.correct).length;
    return (goalCorrect / goalActivities.length) >= 0.7;
  });

  const completionPercentage = totalGoals > 0 ? (goalsCompleted.length / totalGoals) * 100 : 0;
  const daysRemaining = getDaysRemaining(rotation);
  const totalDuration = getRotationDuration(rotation);
  const daysElapsed = totalDuration - daysRemaining;

  // Calculate if on track
  const expectedCompletion = totalDuration > 0 ? (daysElapsed / totalDuration) * 100 : 0;
  const onTrack = completionPercentage >= expectedCompletion * 0.8; // 80% of expected

  // Generate recommendation
  let recommendation = '';
  if (completionPercentage >= 90) {
    recommendation = 'Utmärkt! Du är i god tid med dina rotationsmål.';
  } else if (onTrack) {
    recommendation = 'Du ligger bra till. Fortsätt i samma takt.';
  } else if (daysRemaining > 30) {
    recommendation = 'Du ligger efter schema. Öka studietakten något.';
  } else {
    recommendation = 'Kritisk fas! Fokusera på prioriterade mål de kommande veckorna.';
  }

  return {
    rotationId: rotation.id,
    questionsAnswered,
    correctAnswers,
    accuracy: Math.round(accuracy),
    goalsCompleted: goalsCompleted,
    totalGoals,
    completionPercentage: Math.round(completionPercentage),
    daysRemaining,
    onTrack,
    recommendation,
  };
}

/**
 * Get current rotation progress for a user
 */
export function getCurrentRotationProgress(
  profile: UserProfile,
  activityLog: RotationActivityLog[]
): RotationProgress | null {
  if (!profile.rotationTimeline) return null;

  const currentRotation = getCurrentRotation(profile.rotationTimeline);
  if (!currentRotation) return null;

  return calculateRotationProgress(currentRotation, activityLog);
}

/**
 * Get progress for all rotations
 */
export function getAllRotationsProgress(
  timeline: RotationTimeline,
  activityLog: RotationActivityLog[]
): RotationProgress[] {
  return timeline.rotations.map(rotation =>
    calculateRotationProgress(rotation, activityLog)
  );
}

/**
 * Predict if user will complete rotation on time
 */
export function predictRotationCompletion(
  rotation: Rotation,
  currentProgress: RotationProgress
): {
  willComplete: boolean;
  requiredDailyActivities: number;
  projectedCompletion: number;
} {
  const daysRemaining = getDaysRemaining(rotation);
  const goalsRemaining = rotation.goals.length - currentProgress.goalsCompleted.length;

  // Assume each goal needs ~10 questions to master (3 correct out of 4 attempts)
  const questionsNeeded = goalsRemaining * 10;

  // Calculate required daily activities
  const requiredDailyActivities = daysRemaining > 0
    ? Math.ceil(questionsNeeded / daysRemaining)
    : questionsNeeded;

  // Project completion based on current pace
  const currentPace = currentProgress.questionsAnswered / Math.max(1, getRotationDuration(rotation) - daysRemaining);
  const projectedQuestions = currentPace * daysRemaining;
  const projectedCompletion = Math.min(100, currentProgress.completionPercentage + (projectedQuestions / questionsNeeded) * 100);

  const willComplete = projectedCompletion >= 90;

  return {
    willComplete,
    requiredDailyActivities: Math.max(5, requiredDailyActivities), // Minimum 5/day
    projectedCompletion: Math.round(projectedCompletion),
  };
}

/**
 * Get priority goals for current rotation
 * Returns goals that need most attention
 */
export function getPriorityGoals(
  rotation: Rotation,
  activityLog: RotationActivityLog[]
): string[] {
  const rotationActivities = activityLog.filter(a => a.rotationId === rotation.id);

  // Score each goal based on completion status
  const goalScores = rotation.goals.map(goalId => {
    const goalActivities = rotationActivities.filter(a => a.goalIds?.includes(goalId));
    const attempts = goalActivities.length;
    const correct = goalActivities.filter(a => a.correct).length;
    const accuracy = attempts > 0 ? correct / attempts : 0;

    // Priority score (lower = higher priority)
    // Unstarted goals and low-accuracy goals get higher priority
    let score = 0;
    if (attempts === 0) {
      score = 1000; // Highest priority: not started
    } else if (accuracy < 0.5) {
      score = 500 + (1 - accuracy) * 100; // High priority: struggling
    } else if (accuracy < 0.7) {
      score = 200 + (1 - accuracy) * 100; // Medium priority: needs work
    } else {
      score = attempts; // Low priority: doing well, just needs maintenance
    }

    return { goalId, score };
  });

  // Sort by priority (highest score first) and return top 3
  return goalScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(g => g.goalId);
}

/**
 * Generate study recommendations based on rotation progress
 */
export function generateRotationRecommendations(
  rotation: Rotation,
  progress: RotationProgress,
  prediction: ReturnType<typeof predictRotationCompletion>
): {
  urgency: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  focusAreas: string[];
} {
  const recommendations: string[] = [];
  let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';

  // Determine urgency
  if (progress.daysRemaining < 7) {
    urgency = 'critical';
    recommendations.push('Mindre än en vecka kvar! Fokusera på prioriterade mål.');
  } else if (progress.daysRemaining < 30) {
    urgency = 'high';
    recommendations.push('Mindre än en månad kvar. Öka studietakten.');
  } else if (!progress.onTrack) {
    urgency = 'medium';
    recommendations.push('Du ligger lite efter schema. Sikta på fler dagliga aktiviteter.');
  } else {
    urgency = 'low';
    recommendations.push('Du ligger bra till med dina rotationsmål!');
  }

  // Activity recommendations
  if (prediction.requiredDailyActivities > 10) {
    recommendations.push(`Rekommenderad aktivitet: ${prediction.requiredDailyActivities} frågor/dag`);
  }

  // Focus area recommendations
  const focusAreas: string[] = [];
  if (progress.completionPercentage < 30) {
    focusAreas.push('Grundläggande koncept');
  }
  if (progress.accuracy < 60) {
    focusAreas.push('Repetera felbesvarade frågor');
  }
  if (progress.completionPercentage > 70) {
    focusAreas.push('Avancerade scenarios och komplikationer');
  }

  return {
    urgency,
    recommendations,
    focusAreas,
  };
}
