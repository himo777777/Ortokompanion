/**
 * AI-Driven Recommendation Engine
 * NOW ROTATION-AWARE: Analyzes user performance, rotation status, and placement timing
 * to suggest optimal learning paths
 */

import { UserProfile } from '@/types/onboarding';
import { Domain } from '@/types/onboarding';
import { getCurrentRotation, getDaysRemaining } from '@/types/rotation';
import { RotationActivityLog, getCurrentRotationProgress, calculateRotationProgress, predictRotationCompletion } from './rotation-tracker';
import { getPriorityGoalsForUser, getGoalRecommendations } from './goal-assignment';

export interface StudyRecommendation {
  id: string;
  type: 'domain' | 'topic' | 'review' | 'challenge' | 'break' | 'rotation-urgent';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning: string;
  estimatedTime: number; // minutes
  xpReward: number;
  actionType: 'new-content' | 'review' | 'practice' | 'rest';
  targetDomain?: Domain;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  relatedGoals?: string[]; // Socialstyrelsen goal IDs
}

export interface RecommendationContext {
  profile: UserProfile;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  availableTime?: number; // minutes
  lastStudySession?: Date;
  activityLog?: RotationActivityLog[]; // NEW: For rotation tracking
  completedGoalIds?: string[]; // NEW: For goal-based recommendations
}

/**
 * Main recommendation engine
 * NOW ROTATION-AWARE: Prioritizes urgent rotation/placement needs
 */
export function generateRecommendations(context: RecommendationContext): StudyRecommendation[] {
  const recommendations: StudyRecommendation[] = [];

  // 0. CRITICAL: Check for urgent rotation deadlines (HIGHEST PRIORITY)
  const rotationUrgentRecommendations = generateRotationUrgentRecommendations(context);
  recommendations.push(...rotationUrgentRecommendations);

  // 1. Check for overdue SRS cards
  const srsRecommendation = generateSRSRecommendation(context);
  if (srsRecommendation) recommendations.push(srsRecommendation);

  // 2. Socialstyrelsen goal-based recommendations (rotation/placement aware)
  const goalRecommendations = generateGoalBasedRecommendations(context);
  recommendations.push(...goalRecommendations);

  // 3. Identify weak domains (rotation-context aware)
  const weakDomainRecommendations = generateWeakDomainRecommendations(context);
  recommendations.push(...weakDomainRecommendations);

  // 4. Check for learning fatigue
  const fatigueRecommendation = checkForFatigue(context);
  if (fatigueRecommendation) recommendations.push(fatigueRecommendation);

  // 5. Suggest optimal time-based activities
  const timeBasedRecommendation = generateTimeBasedRecommendation(context);
  if (timeBasedRecommendation) recommendations.push(timeBasedRecommendation);

  // 6. Challenge recommendations for high performers
  const challengeRecommendation = generateChallengeRecommendation(context);
  if (challengeRecommendation) recommendations.push(challengeRecommendation);

  // 7. Review recommendations for consolidation
  const reviewRecommendation = generateReviewRecommendation(context);
  if (reviewRecommendation) recommendations.push(reviewRecommendation);

  // Sort by priority and return top 5
  return recommendations
    .sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 5);
}

/**
 * NEW: Generate urgent rotation-based recommendations
 * For ST-läkare with current rotations or students/AT with placements
 */
function generateRotationUrgentRecommendations(context: RecommendationContext): StudyRecommendation[] {
  const { profile, activityLog } = context;
  const recommendations: StudyRecommendation[] = [];

  // Check for ST-läkare with rotations
  if (profile.role.match(/^st[1-5]$/) && profile.rotationTimeline) {
    const currentRotation = getCurrentRotation(profile.rotationTimeline);

    if (currentRotation) {
      const daysRemaining = getDaysRemaining(currentRotation);

      // CRITICAL: Less than 7 days remaining
      if (daysRemaining > 0 && daysRemaining < 7) {
        const progress = calculateRotationProgress(currentRotation, activityLog || []);
        const prediction = predictRotationCompletion(currentRotation, progress);

        recommendations.push({
          id: `rotation-critical-${currentRotation.id}`,
          type: 'rotation-urgent',
          priority: 'critical',
          title: `🚨 ${currentRotation.domain}-rotation slutar om ${daysRemaining} dagar!`,
          description: `Du behöver genomföra ${prediction.requiredDailyActivities} frågor/dag för att klara målen`,
          reasoning: `Endast ${daysRemaining} dagar kvar på din ${currentRotation.domain}-rotation. ${progress.goalsCompleted.length}/${progress.totalGoals} mål uppnådda.`,
          estimatedTime: prediction.requiredDailyActivities * 2,
          xpReward: 100,
          actionType: 'new-content',
          targetDomain: currentRotation.domain,
          difficultyLevel: 'medium',
          relatedGoals: currentRotation.goals,
        });
      }
      // HIGH: Less than 30 days remaining
      else if (daysRemaining > 0 && daysRemaining < 30) {
        const progress = calculateRotationProgress(currentRotation, activityLog || []);

        recommendations.push({
          id: `rotation-urgent-${currentRotation.id}`,
          type: 'rotation-urgent',
          priority: 'high',
          title: `⏰ Fokusera på ${currentRotation.domain}`,
          description: `${daysRemaining} dagar kvar - ${progress.goalsCompleted.length}/${progress.totalGoals} mål klara`,
          reasoning: `Din ${currentRotation.domain}-rotation fortsätter i ${daysRemaining} dagar. ${progress.onTrack ? 'Du ligger bra till!' : 'Du behöver öka takten något.'}`,
          estimatedTime: 20,
          xpReward: 50,
          actionType: 'new-content',
          targetDomain: currentRotation.domain,
          difficultyLevel: 'medium',
          relatedGoals: currentRotation.goals,
        });
      }
    }
  }

  // Check for Student/AT/ST-other with ortho placement
  if (
    (profile.role === 'student' || profile.role === 'at' ||
     profile.role === 'st-allmänmedicin' || profile.role === 'st-akutsjukvård') &&
    profile.orthoPlacement
  ) {
    const placement = profile.orthoPlacement;
    const daysRemaining = getDaysRemaining(placement);

    if (daysRemaining > 0 && daysRemaining < 14) {
      recommendations.push({
        id: `placement-urgent`,
        type: 'rotation-urgent',
        priority: 'critical',
        title: `🚨 Ortopedi-placering slutar om ${daysRemaining} dagar!`,
        description: 'Fokusera på att klara Socialstyrelsens mål',
        reasoning: `Din ortopedi-placering går mot sitt slut. Se till att du har täckt alla nödvändiga kompetensområden.`,
        estimatedTime: 30,
        xpReward: 80,
        actionType: 'new-content',
        targetDomain: placement.focusDomain,
        difficultyLevel: 'medium',
        relatedGoals: placement.goals,
      });
    }
  }

  return recommendations;
}

/**
 * NEW: Generate Socialstyrelsen goal-based recommendations
 */
function generateGoalBasedRecommendations(context: RecommendationContext): StudyRecommendation[] {
  const { profile, completedGoalIds } = context;
  const recommendations: StudyRecommendation[] = [];

  // Get priority goals for user
  const priorityGoals = getPriorityGoalsForUser(
    profile,
    completedGoalIds || []
  );

  // Get detailed goal recommendations with reasoning
  const goalRecs = getGoalRecommendations(
    profile,
    completedGoalIds || []
  );

  // Add top 2 goal-based recommendations
  goalRecs.slice(0, 2).forEach((goalRec, index) => {
    recommendations.push({
      id: `goal-${goalRec.goalId}`,
      type: 'topic',
      priority: goalRec.priority,
      title: `Mål: ${goalRec.goal.title}`,
      description: goalRec.goal.description || 'Socialstyrelsen-mål',
      reasoning: goalRec.reason,
      estimatedTime: 20,
      xpReward: goalRec.priority === 'critical' ? 60 : goalRec.priority === 'high' ? 45 : 30,
      actionType: 'new-content',
      targetDomain: undefined, // Goals can span multiple domains
      difficultyLevel: 'medium',
      relatedGoals: [goalRec.goalId],
    });
  });

  return recommendations;
}

/**
 * Generate SRS review recommendation
 */
function generateSRSRecommendation(context: RecommendationContext): StudyRecommendation | null {
  const { profile } = context;
  const dueCards = (profile as any).progression?.srs?.dueToday?.length || 0;

  if (dueCards === 0) return null;

  const isOverdue = dueCards > 10;

  return {
    id: 'srs-review',
    type: 'review',
    priority: isOverdue ? 'high' : 'medium',
    title: `Repetera ${dueCards} SRS-kort`,
    description: 'Spaced Repetition System - optimal timing för långtidsminne',
    reasoning: isOverdue
      ? 'Du har många förfallna repetitionskort. Repetera nu för att undvika glömska!'
      : 'Dina SRS-kort är redo för repetition. Perfekt timing för att stärka ditt minne.',
    estimatedTime: Math.min(dueCards * 2, 30),
    xpReward: dueCards * 5,
    actionType: 'review',
    difficultyLevel: 'easy',
  };
}

/**
 * Generate weak domain recommendations
 * NOW ROTATION-AWARE: Prioritizes current rotation domain over general weakness
 */
function generateWeakDomainRecommendations(
  context: RecommendationContext
): StudyRecommendation[] {
  const { profile } = context;
  const recommendations: StudyRecommendation[] = [];

  // Identify current rotation/placement domain (takes priority)
  let rotationDomain: Domain | undefined;
  if (profile.role.match(/^st[1-5]$/) && profile.rotationTimeline) {
    const currentRotation = getCurrentRotation(profile.rotationTimeline);
    if (currentRotation) {
      rotationDomain = currentRotation.domain;
    }
  } else if (profile.orthoPlacement?.focusDomain) {
    rotationDomain = profile.orthoPlacement.focusDomain;
  }

  // Calculate domain performance
  const domainPerformance = Object.entries((profile as any).progression.domainStatuses)
    .map(([domain, status]: [string, any]) => ({
      domain: domain as Domain,
      completionRate: status.totalItems > 0 ? status.itemsCompleted / status.totalItems : 0,
      status: status.status,
      itemsRemaining: status.totalItems - status.itemsCompleted,
      isRotationDomain: domain === rotationDomain,
    }))
    .filter((d) => d.status === 'active' || d.status === 'gated')
    .sort((a, b) => {
      // Prioritize rotation domain even if not weakest
      if (a.isRotationDomain && !b.isRotationDomain) return -1;
      if (!a.isRotationDomain && b.isRotationDomain) return 1;
      return a.completionRate - b.completionRate;
    });

  // Get weakest domain (or rotation domain if applicable)
  const weakestDomain = domainPerformance[0];
  if (weakestDomain && weakestDomain.completionRate < 0.7) {
    const isRotation = weakestDomain.isRotationDomain;
    recommendations.push({
      id: `weak-domain-${weakestDomain.domain}`,
      type: 'domain',
      priority: isRotation ? 'high' : 'medium',
      title: isRotation
        ? `Förstärk ${weakestDomain.domain} (Nuvarande rotation)`
        : `Förstärk ${weakestDomain.domain}`,
      description: `Du har ${Math.round(weakestDomain.completionRate * 100)}% completion - låt oss förbättra detta!`,
      reasoning: isRotation
        ? `${weakestDomain.domain} är din nuvarande rotation och behöver mer fokus.`
        : `${weakestDomain.domain} är ditt svagaste område just nu. Fokuserad träning här ger störst effekt.`,
      estimatedTime: 15,
      xpReward: isRotation ? 40 : 30,
      actionType: 'new-content',
      targetDomain: weakestDomain.domain,
      difficultyLevel: 'medium',
    });
  }

  // Get second weakest if significantly behind (but not if it would duplicate rotation)
  const secondWeakest = domainPerformance[1];
  if (secondWeakest && secondWeakest.completionRate < 0.6 && !secondWeakest.isRotationDomain) {
    recommendations.push({
      id: `weak-domain-${secondWeakest.domain}`,
      type: 'domain',
      priority: 'low',
      title: `Träna ${secondWeakest.domain}`,
      description: `${Math.round(secondWeakest.completionRate * 100)}% completion - nästan halvvägs!`,
      reasoning: `Efter att ha förbättrat ${weakestDomain.domain}, är ${secondWeakest.domain} nästa fokusområde.`,
      estimatedTime: 15,
      xpReward: 25,
      actionType: 'new-content',
      targetDomain: secondWeakest.domain,
      difficultyLevel: 'medium',
    });
  }

  return recommendations;
}

/**
 * Check for learning fatigue
 */
function checkForFatigue(context: RecommendationContext): StudyRecommendation | null {
  const { profile, lastStudySession } = context;

  // Check if user has studied a lot recently by counting recent activities
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Count recent OSCE completions
  const recentOSCEs = (profile as any).progression.history.osceResults.filter(
    (osce: any) => new Date(osce.completedAt) > oneDayAgo
  );

  // Count recent retention checks
  const recentRetentionChecks = (profile as any).progression.history.retentionChecks.filter(
    (check: any) => check.completedAt && new Date(check.completedAt) > oneDayAgo
  );

  const totalRecentActivities = recentOSCEs.length + recentRetentionChecks.length;

  // If more than 5 activities in last 24 hours, suggest break
  if (totalRecentActivities > 5) {
    return {
      id: 'rest-break',
      type: 'break',
      priority: 'high',
      title: 'Ta en paus! 🧘',
      description: 'Du har studerat intensivt - vila hjälper hjärnan att konsolidera',
      reasoning:
        `Du har genomfört ${totalRecentActivities} övningar senaste dygnet. Forskning visar att pauser är kritiska för långtidsminne.`,
      estimatedTime: 15,
      xpReward: 10,
      actionType: 'rest',
      difficultyLevel: 'easy',
    };
  }

  // Check for same-day intense studying
  if (lastStudySession) {
    const hoursSinceLastSession = (Date.now() - lastStudySession.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastSession < 1) {
      return {
        id: 'short-break',
        type: 'break',
        priority: 'medium',
        title: 'Kort paus rekommenderas',
        description: 'Låt hjärnan processa innan nästa session',
        reasoning: 'Du studerade nyligen. En 10-minuters paus optimerar inlärning.',
        estimatedTime: 10,
        xpReward: 5,
        actionType: 'rest',
        difficultyLevel: 'easy',
      };
    }
  }

  return null;
}

/**
 * Generate time-based recommendations
 */
function generateTimeBasedRecommendation(
  context: RecommendationContext
): StudyRecommendation | null {
  const { timeOfDay, availableTime } = context;

  // Morning: Best for new, complex material
  if (timeOfDay === 'morning') {
    return {
      id: 'morning-learning',
      type: 'topic',
      priority: 'medium',
      title: 'Lär dig nytt material (morgonhjärna!)',
      description: 'Morgonen är optimal för att lära sig nya komplexa koncept',
      reasoning: 'Din kognitiva förmåga är högst på morgonen - perfekt för nytt material.',
      estimatedTime: availableTime || 20,
      xpReward: 35,
      actionType: 'new-content',
      difficultyLevel: 'hard',
    };
  }

  // Afternoon: Good for practice and application
  if (timeOfDay === 'afternoon') {
    return {
      id: 'afternoon-practice',
      type: 'topic',
      priority: 'medium',
      title: 'Öva på kliniska fall',
      description: 'Eftermiddagen passar bra för att tillämpa kunskap',
      reasoning: 'Praktisk tillämpning fungerar bra när fokus är måttligt.',
      estimatedTime: availableTime || 20,
      xpReward: 30,
      actionType: 'practice',
      difficultyLevel: 'medium',
    };
  }

  // Evening: Best for review
  if (timeOfDay === 'evening') {
    return {
      id: 'evening-review',
      type: 'review',
      priority: 'medium',
      title: 'Repetera dagens material',
      description: 'Kvällsrepetition stärker konsolideringen under sömn',
      reasoning: 'Repetition innan sömn ger bäst långtidsminne genom sömnkonsolidering.',
      estimatedTime: availableTime || 15,
      xpReward: 25,
      actionType: 'review',
      difficultyLevel: 'easy',
    };
  }

  return null;
}

/**
 * Generate challenge recommendation for high performers
 */
function generateChallengeRecommendation(
  context: RecommendationContext
): StudyRecommendation | null {
  const { profile } = context;

  const accuracy = (profile as any).progression.bandStatus.recentPerformance.correctRate;
  const currentBand = parseInt((profile as any).progression.bandStatus.currentBand.split(' ')[1]);

  // If accuracy > 85% and band 3+, suggest challenge
  if (accuracy > 0.85 && currentBand >= 3) {
    return {
      id: 'challenge-mode',
      type: 'challenge',
      priority: 'low',
      title: '🏆 Utmaning: Svårare frågor',
      description: 'Du presterar utmärkt - dags för nästa nivå!',
      reasoning: `Med ${Math.round(accuracy * 100)}% träffsäkerhet är du redo för svårare material.`,
      estimatedTime: 20,
      xpReward: 50,
      actionType: 'practice',
      difficultyLevel: 'hard',
    };
  }

  return null;
}

/**
 * Generate review recommendation for consolidation
 */
function generateReviewRecommendation(context: RecommendationContext): StudyRecommendation | null {
  const { profile } = context;

  // Check if user has recent retention checks that failed
  const recentRetentionChecks = (profile as any).progression.history.retentionChecks
    .filter((check: any) => check.completedAt)
    .sort((a: any, b: any) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 3);

  const hasFailedChecks = recentRetentionChecks.some((check: any) => check.passed === false);

  if (hasFailedChecks) {
    return {
      id: 'consolidation-review',
      type: 'review',
      priority: 'medium',
      title: 'Konsolidera dina nya kunskaper',
      description: 'Du har lärt dig mycket nytt - låt oss befästa det',
      reasoning:
        'Dina senaste retentionskontroller visar behov av repetition. Repetition inom 24h ökar retention med 50%.',
      estimatedTime: 15,
      xpReward: 20,
      actionType: 'review',
      difficultyLevel: 'easy',
    };
  }

  return null;
}

/**
 * Get time of day category
 */
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Format recommendation for display
 */
export function formatRecommendationMessage(rec: StudyRecommendation): string {
  const timeStr = rec.estimatedTime < 60 ? `${rec.estimatedTime} min` : `${Math.round(rec.estimatedTime / 60)} tim`;
  const priorityEmoji = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';

  return `${priorityEmoji} ${rec.title} (${timeStr}, +${rec.xpReward} XP)`;
}
