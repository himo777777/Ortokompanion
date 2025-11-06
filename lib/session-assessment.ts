/**
 * Session Assessment Helpers
 * Calculate enhanced feedback data for post-activity summaries
 */

import { Domain } from '@/types/onboarding';
import {
  IntegratedUserProfile,
  SessionAssessment,
  GoalProgression,
  WeakDomainPerformance,
  SessionHistoryEntry,
} from '@/types/integrated';
import { MCQQuestion } from '@/data/questions';
import { ALL_FOCUSED_GOALS } from '@/data/focused-socialstyrelsen-goals';

/**
 * Calculate goal progressions based on session performance
 * Estimates which goals would advance based on performance criteria
 */
export function calculateGoalProgressions(
  relatedGoals: string[],
  profile: IntegratedUserProfile,
  accuracy: number
): GoalProgression[] {
  const progressions: GoalProgression[] = [];

  // Only advance goals if performance was good (≥70% accuracy)
  const shouldAdvance = accuracy >= 70;

  relatedGoals.forEach((goalId) => {
    const currentProgress = profile.socialstyrelseMålProgress.find((p) => p.goalId === goalId);

    if (!currentProgress) {
      // New goal - might be added in this session
      const goal = ALL_FOCUSED_GOALS.find((g) => g.id === goalId);
      if (goal && shouldAdvance) {
        progressions.push({
          goalId,
          goalTitle: goal.title,
          beforeCriteria: 0,
          afterCriteria: 1,
          totalCriteria: goal.assessmentCriteria.length,
          completed: false,
        });
      }
      return;
    }

    // Existing goal
    const goal = ALL_FOCUSED_GOALS.find((g) => g.id === goalId);
    if (!goal || currentProgress.achieved) return;

    const beforeCriteria = currentProgress.completedCriteria.length;
    const totalCriteria = currentProgress.totalCriteria;

    // Estimate if this session would advance a criterion
    // In reality, handleSessionCompletion does the actual advancement
    // We're estimating here for immediate feedback
    const afterCriteria = shouldAdvance && beforeCriteria < totalCriteria
      ? beforeCriteria + 1
      : beforeCriteria;

    const completed = afterCriteria >= totalCriteria;

    if (afterCriteria > beforeCriteria || completed) {
      progressions.push({
        goalId,
        goalTitle: goal.title,
        beforeCriteria,
        afterCriteria,
        totalCriteria,
        completed,
      });
    }
  });

  return progressions;
}

/**
 * Calculate weak domain performance comparison
 * Compares today's session to recent history (last 7 days)
 */
export function calculateWeakDomainPerformance(
  sessionDomain: Domain,
  sessionAccuracy: number,
  questionsAnswered: number,
  profile: IntegratedUserProfile,
  weakDomains?: Array<{ domain: Domain; accuracy: number }>
): WeakDomainPerformance | undefined {
  // Only calculate if this domain was identified as weak
  const isWeakDomain = weakDomains?.some((w) => w.domain === sessionDomain);
  if (!isWeakDomain) return undefined;

  // Get recent accuracy for this domain (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentSessions = profile.progression.history.sessionHistory
    .filter((s) => {
      const sessionDate = new Date(s.date);
      return s.domain === sessionDomain && sessionDate >= sevenDaysAgo;
    });

  // Calculate average accuracy from recent sessions
  let recentAccuracy = 0;
  if (recentSessions.length > 0) {
    const totalAccuracy = recentSessions.reduce((sum, s) => sum + s.accuracy, 0);
    recentAccuracy = totalAccuracy / recentSessions.length;
  } else {
    // No recent history - use weak domain accuracy if available
    const weakDomain = weakDomains?.find((w) => w.domain === sessionDomain);
    recentAccuracy = weakDomain?.accuracy || 50;
  }

  const improvement = sessionAccuracy - recentAccuracy;

  return {
    domain: sessionDomain,
    todayAccuracy: sessionAccuracy,
    recentAccuracy,
    improvement,
    questionsToday: questionsAnswered,
  };
}

/**
 * Assess band progression based on session performance
 * Provides messaging about likely band changes
 */
export function assessBandProgression(
  accuracy: number,
  hintsUsed: number,
  currentBand: string,
  streakAtBand: number
): { message: string; type: 'promotion' | 'stable' | 'demotion' } | undefined {
  // Strong performance criteria (from band-system.ts)
  const isStrongPerformance = accuracy >= 75 && hintsUsed <= 1.5 && streakAtBand >= 2;

  // Poor performance criteria
  const isPoorPerformance = accuracy < 50 || hintsUsed > 2.0;

  if (isStrongPerformance && currentBand !== 'E') {
    const nextBand = getNextBand(currentBand);
    return {
      message: `Stark prestation! Din svårighetsgrad höjs till Band ${nextBand} nästa session.`,
      type: 'promotion',
    };
  }

  if (isPoorPerformance && currentBand !== 'A') {
    return {
      message: 'Utmanande session. Systemet kan justera svårighetsgraden för bättre lärande.',
      type: 'demotion',
    };
  }

  if (accuracy >= 70) {
    return {
      message: 'Bra framsteg! Fortsätt träna på denna nivå för att bygga säkerhet.',
      type: 'stable',
    };
  }

  return {
    message: 'Stadigt lärande. Fortsätt så bygger du kompetens steg för steg.',
    type: 'stable',
  };
}

/**
 * Generate next steps recommendations
 */
export function generateNextSteps(
  accuracy: number,
  goalProgressions: GoalProgression[],
  weakDomainPerformance?: WeakDomainPerformance
): string[] {
  const steps: string[] = [];

  // Band-based recommendation
  if (accuracy >= 80) {
    steps.push('Utmärkt! Du är redo för mer utmanande frågor.');
  } else if (accuracy >= 70) {
    steps.push('Bra arbete! Fortsätt träna för att stärka förståelsen.');
  } else if (accuracy >= 60) {
    steps.push('Bygg vidare på grunderna - du är på rätt väg.');
  } else {
    steps.push('Fokusera på grundläggande koncept och använd hints aktivt.');
  }

  // Goal-based recommendation
  if (goalProgressions.length > 0) {
    const completedGoals = goalProgressions.filter((g) => g.completed);
    if (completedGoals.length > 0) {
      steps.push(`🎉 ${completedGoals.length} mål klara! Nya mål väntar.`);
    } else {
      const closestGoal = goalProgressions
        .map((g) => ({
          ...g,
          remaining: g.totalCriteria - g.afterCriteria,
        }))
        .sort((a, b) => a.remaining - b.remaining)[0];

      if (closestGoal) {
        steps.push(`Nästa: ${closestGoal.remaining} kriterier kvar till ${closestGoal.goalTitle}`);
      }
    }
  }

  // Weak domain recommendation
  if (weakDomainPerformance && weakDomainPerformance.improvement > 0) {
    steps.push(`💪 Fortsätt träna ${getDomainName(weakDomainPerformance.domain)} - du förbättras!`);
  }

  return steps;
}

/**
 * Get next band in sequence
 */
function getNextBand(currentBand: string): string {
  const bands = ['A', 'B', 'C', 'D', 'E'];
  const currentIndex = bands.indexOf(currentBand);
  return currentIndex < bands.length - 1 ? bands[currentIndex + 1] : 'E';
}

/**
 * Get domain name in Swedish
 */
function getDomainName(domain: Domain): string {
  const names: Record<string, string> = {
    'trauma': 'Traumaortopedi',
    'höft': 'Höftkirurgi',
    'knä': 'Knäkirurgi',
    'fot-fotled': 'Fot & Fotled',
    'hand-handled': 'Hand & Handled',
    'axel-armbåge': 'Axel & Armbåge',
    'rygg': 'Ryggkirurgi',
    'sport': 'Idrottsmedicin',
    'tumör': 'Tumörortopedi',
  };
  return names[domain] || domain;
}

/**
 * Main function to calculate complete session assessment
 */
export function calculateSessionAssessment(
  questions: MCQQuestion[],
  results: Array<{ questionId: string; correct: boolean; hintsUsed: number }>,
  relatedGoals: string[],
  profile: IntegratedUserProfile,
  weakDomains?: Array<{ domain: Domain; accuracy: number }>
): SessionAssessment {
  // Calculate accuracy
  const correctAnswers = results.filter((r) => r.correct).length;
  const accuracy = results.length > 0 ? (correctAnswers / results.length) * 100 : 0;

  // Calculate average hints used
  const totalHints = results.reduce((sum, r) => sum + r.hintsUsed, 0);
  const avgHints = results.length > 0 ? totalHints / results.length : 0;

  // Determine session domain (most common domain in questions)
  const domainCounts = new Map<Domain, number>();
  questions.forEach((q) => {
    domainCounts.set(q.domain, (domainCounts.get(q.domain) || 0) + 1);
  });
  const sessionDomain = Array.from(domainCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || profile.progression.primaryDomain;

  // Calculate all assessment components
  const goalProgressions = calculateGoalProgressions(relatedGoals, profile, accuracy);

  const weakDomainPerformance = calculateWeakDomainPerformance(
    sessionDomain,
    accuracy,
    results.length,
    profile,
    weakDomains
  );

  const bandProgression = assessBandProgression(
    accuracy,
    avgHints,
    profile.progression.bandStatus.currentBand,
    profile.progression.bandStatus.streakAtBand
  );

  const nextSteps = generateNextSteps(accuracy, goalProgressions, weakDomainPerformance);

  return {
    goalProgressions,
    weakDomainPerformance,
    bandProgression,
    nextSteps,
  };
}
