/**
 * Domain Progression System
 * Gate requirements, retention checks, and domain unlocking
 *
 * Features:
 * - Domain status tracking
 * - Gate requirements (Mini-OSCE + retention + stability)
 * - Next domain selection (70% primary, 20% neighbor, 10% recall)
 * - Interleaving with neighbor domains
 */

import { Domain } from '@/types/onboarding';
import {
  DomainStatus,
  DomainNeighborMap,
  DOMAIN_NEIGHBORS,
  SRSCard,
  RetentionCheck,
  GATE_THRESHOLDS,
  DailyMix,
  DifficultyBand,
  DAILY_MIX_RATIOS,
  DOMAIN_SELECTION_WEIGHTS,
} from '@/types/progression';
import type { IntegratedUserProfile } from '@/types/integrated';
import { getLastReviewedCards, getAverageStability, getDueCards } from './srs-algorithm';
import { getQuestionsByDomain } from '@/data/questions';

/**
 * Check if domain gate requirements are met
 *
 * From spec:
 * 1. Gate Mini-OSCE ≥80%
 * 2. Last 10 SRS cards avg stability ≥ threshold
 * 3. At least 1 complication case (band D) passed
 *
 * @param domainStatus - Current domain status
 * @param srsCards - All SRS cards
 * @returns True if all gate requirements met
 */
export function isGateRequirementMet(
  domainStatus: DomainStatus,
  srsCards: SRSCard[]
): boolean {
  const { gateProgress } = domainStatus;

  // Check Mini-OSCE
  if (!gateProgress.miniOSCEPassed) {
    return false;
  }

  // Check retention
  if (!gateProgress.retentionCheckPassed) {
    return false;
  }

  // Check SRS stability
  if (!gateProgress.srsCardsStable) {
    // Calculate it if not already done
    const last10Cards = getLastReviewedCards(srsCards, domainStatus.domain, 10);
    if (last10Cards.length < GATE_THRESHOLDS.RETENTION_MIN_CARDS) {
      return false; // Not enough cards reviewed
    }

    const avgStability = getAverageStability(last10Cards);
    if (avgStability < GATE_THRESHOLDS.RETENTION_MIN_STABILITY) {
      return false;
    }
  }

  // Check complication case
  if (!gateProgress.complicationCasePassed) {
    return false;
  }

  return true;
}

/**
 * Get list of completed domains from domain statuses
 *
 * @param domainStatuses - Map of domain statuses
 * @returns Array of completed domain names
 */
export function getCompletedDomains(
  domainStatuses: Record<Domain, DomainStatus>
): Domain[] {
  return Object.entries(domainStatuses)
    .filter(([_, status]) => status.status === 'completed')
    .map(([domain, _]) => domain as Domain);
}

/**
 * Update domain gate progress for SRS stability
 *
 * @param domainStatus - Current domain status
 * @param srsCards - All SRS cards
 * @returns Updated domain status
 */
export function updateDomainSRSStability(
  domainStatus: DomainStatus,
  srsCards: SRSCard[]
): DomainStatus {
  const last10Cards = getLastReviewedCards(srsCards, domainStatus.domain, 10);

  if (last10Cards.length < GATE_THRESHOLDS.RETENTION_MIN_CARDS) {
    return {
      ...domainStatus,
      gateProgress: {
        ...domainStatus.gateProgress,
        srsCardsStable: false,
        avgStability: undefined,
      },
    };
  }

  const avgStability = getAverageStability(last10Cards);
  const isStable = avgStability >= GATE_THRESHOLDS.RETENTION_MIN_STABILITY;

  return {
    ...domainStatus,
    gateProgress: {
      ...domainStatus.gateProgress,
      srsCardsStable: isStable,
      avgStability,
    },
  };
}

/**
 * Get neighbor domains for a given domain
 *
 * @param domain - Primary domain
 * @returns Array of neighbor domains
 */
export function getNeighborDomains(domain: Domain): Domain[] {
  return DOMAIN_NEIGHBORS[domain] || [];
}

/**
 * Select next domain to suggest
 * Logic: 70% primary, 20% nearest neighbor, 10% long-term recall
 *
 * @param currentDomain - Current primary domain
 * @param completedDomains - Domains already completed
 * @param allDomains - All available domains
 * @returns Next suggested domain or null if all complete
 */
export function selectNextDomain(
  currentDomain: Domain,
  completedDomains: Domain[],
  allDomains: Domain[]
): Domain | null {
  // Filter out completed domains
  const availableDomains = allDomains.filter(
    (domain) => !completedDomains.includes(domain) && domain !== currentDomain
  );

  if (availableDomains.length === 0) {
    return null; // All domains completed!
  }

  // Get neighbors
  const neighbors = getNeighborDomains(currentDomain).filter((domain) =>
    availableDomains.includes(domain)
  );

  // Random selection based on weights
  const rand = Math.random();

  if (rand < DOMAIN_SELECTION_WEIGHTS.PRIMARY && neighbors.length > 0) {
    // 70% - Select from neighbors (closest domains)
    return neighbors[Math.floor(Math.random() * neighbors.length)];
  } else if (
    rand < DOMAIN_SELECTION_WEIGHTS.PRIMARY + DOMAIN_SELECTION_WEIGHTS.NEIGHBOR &&
    availableDomains.length > 0
  ) {
    // 20% - Select any available domain
    return availableDomains[Math.floor(Math.random() * availableDomains.length)];
  } else if (completedDomains.length > 0) {
    // 10% - Long-term recall from completed domains
    return completedDomains[Math.floor(Math.random() * completedDomains.length)];
  }

  // Fallback - random available domain
  return availableDomains[Math.floor(Math.random() * availableDomains.length)];
}

/**
 * Complete a domain (mark as completed, suggest next)
 *
 * @param domainStatus - Current domain status
 * @param allDomains - All domains
 * @param completedDomains - Already completed domains
 * @returns Updated domain status with next suggestion
 */
export function completeDomain(
  domainStatus: DomainStatus,
  allDomains: Domain[],
  completedDomains: Domain[]
): DomainStatus {
  const nextDomain = selectNextDomain(domainStatus.domain, completedDomains, allDomains);

  return {
    ...domainStatus,
    status: 'completed',
    completedAt: new Date(),
    nextSuggestedDomain: nextDomain || undefined,
  };
}

/**
 * Create retention check for a domain
 * From spec: Revisit after ≥7 days
 *
 * @param domain - Domain to check
 * @param srsCards - SRS cards in the domain
 * @returns Retention check object
 */
export function createRetentionCheck(domain: Domain, srsCards: SRSCard[]): RetentionCheck {
  // Select 10 cards randomly from the domain
  const domainCards = srsCards.filter((card) => card.domain === domain);
  const shuffled = [...domainCards].sort(() => Math.random() - 0.5);
  const selectedCards = shuffled.slice(0, 10);

  // Schedule for 7 days from now
  const scheduledFor = new Date();
  scheduledFor.setDate(scheduledFor.getDate() + 7);

  return {
    domainId: domain,
    scheduledFor,
    cardIds: selectedCards.map((card) => card.id),
    requiredAvgStability: GATE_THRESHOLDS.RETENTION_MIN_STABILITY,
  };
}

/**
 * Check if retention check passed
 *
 * @param retentionCheck - Retention check object
 * @returns True if passed
 */
export function isRetentionCheckPassed(retentionCheck: RetentionCheck): boolean {
  if (!retentionCheck.completedAt || !retentionCheck.actualAvgStability) {
    return false;
  }

  return retentionCheck.actualAvgStability >= retentionCheck.requiredAvgStability;
}

/**
 * Create initial domain status for all domains
 *
 * @param primaryDomain - User's starting domain
 * @param allDomains - All available domains
 * @returns Record of domain statuses
 */
export function createInitialDomainStatuses(
  primaryDomain: Domain,
  allDomains: Domain[]
): Record<Domain, DomainStatus> {
  const statuses: Record<string, DomainStatus> = {};

  allDomains.forEach((domain) => {
    // Count actual questions available for this domain
    const domainQuestions = getQuestionsByDomain(domain);

    statuses[domain] = {
      domain,
      status: domain === primaryDomain ? 'active' : 'locked',
      itemsCompleted: 0,
      totalItems: domainQuestions.length, // Count of available questions
      gateProgress: {
        miniOSCEPassed: false,
        retentionCheckPassed: false,
        srsCardsStable: false,
        complicationCasePassed: false,
      },
      unlockedAt: domain === primaryDomain ? new Date() : undefined,
    };
  });

  return statuses as Record<Domain, DomainStatus>;
}

/**
 * Generate daily content mix (Core implementation)
 * From spec: 60% new, 20% interleaving, 20% SRS
 *
 * @param params - Parameters for mix generation
 * @returns Daily mix object
 */
export function generateDailyMixCore(params: {
  primaryDomain: Domain;
  targetBand: DifficultyBand;
  srsCards: SRSCard[];
  availableNewContent: Map<Domain, string[]>; // Domain -> content IDs
  completedDomains: Domain[];
  userDomains?: Domain[]; // User's enrolled domains
  isRecoveryDay: boolean;
  targetMinutes: number;
}): DailyMix {
  const {
    primaryDomain,
    targetBand,
    srsCards,
    availableNewContent,
    completedDomains,
    userDomains = [],
    isRecoveryDay,
    targetMinutes,
  } = params;

  // Calculate time allocation
  const newTime = targetMinutes * DAILY_MIX_RATIOS.NEW_CONTENT;
  const interleaveTime = targetMinutes * DAILY_MIX_RATIOS.INTERLEAVING;
  const srsTime = targetMinutes * DAILY_MIX_RATIOS.SRS_REVIEW;

  // 1. New content (60% from primary domain)
  const primaryContent = availableNewContent.get(primaryDomain) || [];
  const newContentCount = Math.ceil(newTime / 2); // Assume ~2 min per item
  const selectedNewContent = primaryContent.slice(0, newContentCount);
  const newReasoning = isRecoveryDay
    ? `Lättare innehåll från ${primaryDomain} för att konsolidera kunskap i återhämtningsläge`
    : `Nytt innehåll från din primära domän ${primaryDomain} för att bygga djup förståelse`;

  // 2. Interleaving (20% from neighbor domain or user's other domains)
  const neighbors = getNeighborDomains(primaryDomain);
  let interleaveDomain: Domain | null = null;
  let interleaveContent: string[] = [];
  let interleaveReasoning = '';

  // Prefer user's other domains (excluding primary) for interleaving
  const userOtherDomains = userDomains.filter(d => d !== primaryDomain);
  const preferredInterleaveDomains = userOtherDomains.length > 0 ? userOtherDomains : neighbors;

  if (preferredInterleaveDomains.length > 0) {
    // Select random domain from preferred list
    interleaveDomain = preferredInterleaveDomains[Math.floor(Math.random() * preferredInterleaveDomains.length)];
    const domainContent = availableNewContent.get(interleaveDomain) || [];
    const interleaveCount = Math.ceil(interleaveTime / 2);
    interleaveContent = domainContent.slice(0, interleaveCount);
    interleaveReasoning = `Blandat innehåll från ${interleaveDomain} för att stärka långtidsminnet och hitta samband`;
  } else if (completedDomains.length > 0) {
    // Use long-term recall if no other options
    interleaveDomain = completedDomains[Math.floor(Math.random() * completedDomains.length)];
    const recallContent = availableNewContent.get(interleaveDomain) || [];
    const interleaveCount = Math.ceil(interleaveTime / 2);
    interleaveContent = recallContent.slice(0, interleaveCount);
    interleaveReasoning = `Repetition från tidigare domän ${interleaveDomain} för att bibehålla långtidskunskap`;
  }

  // 3. SRS reviews (20% due cards)
  const dueCards = getDueCards(srsCards);
  const srsCount = Math.ceil(srsTime / 2);
  const selectedSRS = dueCards.slice(0, srsCount);

  // Build daily mix
  const dailyMix: DailyMix = {
    date: new Date(),
    newContent: {
      domain: primaryDomain,
      items: selectedNewContent,
      estimatedTime: newTime,
      reasoning: newReasoning,
    },
    interleavingContent: {
      domain: interleaveDomain || primaryDomain,
      items: interleaveContent,
      estimatedTime: interleaveTime,
      reasoning: interleaveReasoning || 'Blandat innehåll för att stärka långtidsminnet',
    },
    srsReviews: {
      cards: selectedSRS,
      estimatedTime: srsTime,
    },
    totalEstimatedTime: targetMinutes,
    targetBand,
    isRecoveryDay,
    isDifficultFollowUp: false, // Will be set based on yesterday's performance
  };

  return dailyMix;
}

/**
 * Check if domain is ready for gate (Mini-OSCE)
 *
 * @param domainStatus - Domain status
 * @returns True if ready for gate
 */
export function isReadyForGate(domainStatus: DomainStatus): boolean {
  // Need to complete enough items and pass complication case
  if (!domainStatus.gateProgress.complicationCasePassed) {
    return false;
  }

  // Check if enough content completed (arbitrary threshold)
  const completionRate = domainStatus.totalItems > 0
    ? domainStatus.itemsCompleted / domainStatus.totalItems
    : 0;

  return completionRate >= 0.7; // 70% of content completed
}

/**
 * Get progress message for domain
 *
 * @param domainStatus - Domain status
 * @returns User-friendly progress message
 */
export function getDomainProgressMessage(domainStatus: DomainStatus): string {
  const { status, gateProgress, itemsCompleted, totalItems } = domainStatus;

  if (status === 'completed') {
    return 'Domän slutförd! Utmärkt arbete!';
  }

  if (status === 'locked') {
    return 'Låst - slutför tidigare domäner för att låsa upp';
  }

  if (status === 'gated') {
    return 'Redo för Mini-OSCE! Ta testet när du känner dig redo.';
  }

  // Active domain - show what's remaining
  const missing: string[] = [];

  if (!gateProgress.miniOSCEPassed) {
    missing.push('Mini-OSCE');
  }
  if (!gateProgress.retentionCheckPassed) {
    missing.push('Retention Check');
  }
  if (!gateProgress.srsCardsStable) {
    missing.push('SRS Stabilitet');
  }
  if (!gateProgress.complicationCasePassed) {
    missing.push('Komplikationsfall');
  }

  const progress = totalItems > 0 ? Math.round((itemsCompleted / totalItems) * 100) : 0;

  return `Progress: ${progress}% • Kvar: ${missing.join(', ')}`;
}

/**
 * Unlock a domain (change from locked to active)
 *
 * @param domainStatuses - All domain statuses
 * @param domainToUnlock - Domain to unlock
 * @returns Updated domain statuses
 */
export function unlockDomain(
  domainStatuses: Record<Domain, DomainStatus>,
  domainToUnlock: Domain
): Record<Domain, DomainStatus> {
  const updatedStatuses = { ...domainStatuses };

  if (updatedStatuses[domainToUnlock].status === 'locked') {
    updatedStatuses[domainToUnlock] = {
      ...updatedStatuses[domainToUnlock],
      status: 'active',
      unlockedAt: new Date(),
    };
  }

  return updatedStatuses;
}

/**
 * Complete domain and unlock next one
 *
 * @param currentDomain - Domain that was just completed
 * @param domainStatuses - All domain statuses
 * @param allDomains - All available domains
 * @returns Updated domain statuses with next domain unlocked
 */
export function completeDomainAndUnlockNext(
  currentDomain: Domain,
  domainStatuses: Record<Domain, DomainStatus>,
  allDomains: Domain[]
): {
  updatedStatuses: Record<Domain, DomainStatus>;
  nextDomain: Domain | null;
  allCompleted: boolean;
} {
  const completedDomains = getCompletedDomains(domainStatuses);

  // Mark current domain as completed
  const updatedStatuses = { ...domainStatuses };
  updatedStatuses[currentDomain] = {
    ...updatedStatuses[currentDomain],
    status: 'completed',
    completedAt: new Date(),
  };

  // Select next domain
  const nextDomain = selectNextDomain(
    currentDomain,
    [...completedDomains, currentDomain], // Include newly completed
    allDomains
  );

  // Check if all domains completed
  const allCompleted = nextDomain === null;

  // Unlock next domain if exists
  if (nextDomain && updatedStatuses[nextDomain].status === 'locked') {
    updatedStatuses[nextDomain] = {
      ...updatedStatuses[nextDomain],
      status: 'active',
      unlockedAt: new Date(),
    };

    // Add suggestion to completed domain
    updatedStatuses[currentDomain].nextSuggestedDomain = nextDomain;
  }

  return {
    updatedStatuses,
    nextDomain,
    allCompleted,
  };
}

/**
 * Generate daily mix from user profile (Wrapper for tests)
 *
 * @param profile - User's integrated profile
 * @returns Daily mix object
 */
export function generateDailyMix(profile: IntegratedUserProfile): DailyMix {
  const { progression, domains } = profile;

  // Build available content map
  const availableNewContent = new Map<Domain, string[]>();
  domains.forEach(domain => {
    const questions = getQuestionsByDomain(domain)
      .filter(q => q.band === progression.bandStatus.currentBand)
      .map(q => q.id);
    availableNewContent.set(domain, questions);
  });

  // Get completed domains
  const completedDomains = Object.entries(progression.domainStatuses || {})
    .filter(([_, status]) => status.status === 'completed')
    .map(([domain]) => domain as Domain);

  // Check for recovery day
  const recentPerf = progression.bandStatus.recentPerformance;
  const isRecoveryDay = recentPerf.correctRate < 0.5 && recentPerf.confidence < 0.4;

  // Generate mix using core function
  return generateDailyMixCore({
    primaryDomain: progression.primaryDomain,
    targetBand: progression.bandStatus.currentBand,
    srsCards: progression.srs.cards,
    availableNewContent,
    completedDomains,
    isRecoveryDay,
    targetMinutes: 30,
  });
}
