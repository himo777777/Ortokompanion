/**
 * Verification & Quality Control Utilities
 * Functions to ensure content accuracy and freshness
 */

import {
  SourceReference,
  ContentVerification,
  VerificationStatus,
  QualityMetrics,
  VerificationAlert,
  ContentFlag,
} from '@/types/verification';

/**
 * Calculate quality score based on multiple factors
 */
export function calculateQualityScore(verification: ContentVerification): number {
  let score = 0;

  // Source quality (40 points)
  if (verification.sources.length >= 2) score += 15;
  if (verification.sources.length >= 3) score += 10;
  const avgReliability =
    verification.sources.reduce((sum, s) => sum + s.reliability, 0) /
    verification.sources.length;
  score += (avgReliability / 100) * 15;

  // Verification status (30 points)
  if (verification.verificationStatus === 'verified') score += 30;
  else if (verification.verificationStatus === 'pending') score += 15;

  // Review level (20 points)
  const reviewScores = {
    'expert-review': 20,
    'peer-review': 15,
    'ai-assisted': 10,
    'automated': 5,
    'unreviewed': 0,
  };
  score += reviewScores[verification.reviewLevel];

  // Freshness (10 points)
  const daysSinceReview =
    (Date.now() - verification.lastReviewDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceReview < 90) score += 10;
  else if (daysSinceReview < 180) score += 7;
  else if (daysSinceReview < 365) score += 4;

  return Math.min(100, Math.round(score));
}

/**
 * Check if content is up-to-date
 */
export function isContentFresh(verification: ContentVerification): boolean {
  const now = new Date();

  // Check if any source is expired
  const hasExpiredSource = verification.sources.some((source) => {
    if (!source.expirationDate) return false;
    return source.expirationDate < now;
  });

  if (hasExpiredSource) return false;

  // Check if review is overdue
  if (verification.nextReviewDate < now) return false;

  // Check if primary source is recent enough
  const primarySourceAge =
    (now.getTime() - verification.primarySource.publicationDate.getTime()) /
    (1000 * 60 * 60 * 24 * 365);

  // Medical info older than 5 years needs review
  if (primarySourceAge > 5) return false;

  return true;
}

/**
 * Validate source reference
 */
export function validateSource(source: SourceReference): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check required fields
  if (!source.title) issues.push('Missing title');
  if (!source.year) issues.push('Missing publication year');
  if (source.type === 'journal-article' && !source.doi && !source.url) {
    issues.push('Journal article missing DOI or URL');
  }

  // Check year is reasonable
  const currentYear = new Date().getFullYear();
  if (source.year < 1950 || source.year > currentYear + 1) {
    issues.push('Invalid publication year');
  }

  // Check if source is too old
  const age = currentYear - source.year;
  if (age > 10 && source.type === 'clinical-guideline') {
    issues.push('Clinical guideline may be outdated (>10 years)');
  }

  // Check verification status
  if (source.verificationStatus === 'outdated') {
    issues.push('Source marked as outdated');
  }
  if (source.verificationStatus === 'deprecated') {
    issues.push('Source has been deprecated');
  }

  // Check reliability
  if (source.reliability < 50) {
    issues.push('Low reliability score');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Detect conflicting information across sources
 */
export function detectConflicts(
  verification: ContentVerification
): ContentFlag[] {
  const flags: ContentFlag[] = [];

  // Check for sources with different verification statuses
  const verificationStatuses = new Set(
    verification.sources.map((s) => s.verificationStatus)
  );
  if (verificationStatuses.size > 1 && verificationStatuses.has('outdated')) {
    flags.push({
      flagId: `conflict-${verification.contentId}-${Date.now()}`,
      flagType: 'conflicting-information',
      severity: 'high',
      description:
        'Some sources are marked as outdated while others are verified',
      flaggedDate: new Date(),
      flaggedBy: 'automated',
      resolved: false,
    });
  }

  // Check for very different publication years
  const years = verification.sources.map((s) => s.year);
  const yearRange = Math.max(...years) - Math.min(...years);
  if (yearRange > 15 && verification.sources.length >= 2) {
    flags.push({
      flagId: `conflict-${verification.contentId}-${Date.now()}-years`,
      flagType: 'conflicting-information',
      severity: 'medium',
      description: `Large publication year range (${yearRange} years) across sources`,
      flaggedDate: new Date(),
      flaggedBy: 'automated',
      resolved: false,
    });
  }

  // Check evidence levels
  const evidenceLevels = verification.sources
    .map((s) => s.evidenceLevel)
    .filter(Boolean);
  if (evidenceLevels.length >= 2) {
    const hasHighEvidence = evidenceLevels.some((e) =>
      ['1A', '1B'].includes(e!)
    );
    const hasLowEvidence = evidenceLevels.some((e) => ['4', '5'].includes(e!));
    if (hasHighEvidence && hasLowEvidence) {
      flags.push({
        flagId: `conflict-${verification.contentId}-${Date.now()}-evidence`,
        flagType: 'conflicting-information',
        severity: 'medium',
        description: 'Mixed evidence levels (high and low quality sources)',
        flaggedDate: new Date(),
        flaggedBy: 'automated',
        resolved: false,
      });
    }
  }

  return flags;
}

/**
 * Generate verification alerts
 */
export function generateAlerts(
  verifications: ContentVerification[]
): VerificationAlert[] {
  const alerts: VerificationAlert[] = [];
  const now = new Date();

  // Content expiring soon (within 30 days)
  const expiringSoon = verifications.filter((v) => {
    const daysUntilReview =
      (v.nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilReview > 0 && daysUntilReview <= 30;
  });

  if (expiringSoon.length > 0) {
    alerts.push({
      alertId: `alert-expiring-${Date.now()}`,
      type: 'content-expiring',
      severity: 'warning',
      contentIds: expiringSoon.map((v) => v.contentId),
      message: `${expiringSoon.length} innehållselement behöver granskas inom 30 dagar`,
      createdDate: now,
      dismissed: false,
    });
  }

  // Expired content
  const expired = verifications.filter((v) => v.nextReviewDate < now);
  if (expired.length > 0) {
    alerts.push({
      alertId: `alert-expired-${Date.now()}`,
      type: 'content-expiring',
      severity: 'critical',
      contentIds: expired.map((v) => v.contentId),
      message: `${expired.length} innehållselement har passerat granskningsdatum`,
      createdDate: now,
      dismissed: false,
    });
  }

  // Low quality content
  const lowQuality = verifications.filter((v) => v.qualityScore < 60);
  if (lowQuality.length > 0) {
    alerts.push({
      alertId: `alert-quality-${Date.now()}`,
      type: 'low-quality-score',
      severity: 'warning',
      contentIds: lowQuality.map((v) => v.contentId),
      message: `${lowQuality.length} innehållselement har låg kvalitetspoäng (<60)`,
      createdDate: now,
      dismissed: false,
    });
  }

  // Unverified content
  const unverified = verifications.filter(
    (v) => v.verificationStatus !== 'verified'
  );
  if (unverified.length > 0) {
    alerts.push({
      alertId: `alert-unverified-${Date.now()}`,
      type: 'missing-verification',
      severity: 'info',
      contentIds: unverified.map((v) => v.contentId),
      message: `${unverified.length} innehållselement väntar på verifiering`,
      createdDate: now,
      dismissed: false,
    });
  }

  return alerts;
}

/**
 * Calculate overall quality metrics
 */
export function calculateQualityMetrics(
  verifications: ContentVerification[]
): QualityMetrics {
  const verified = verifications.filter(
    (v) => v.verificationStatus === 'verified'
  ).length;
  const needsReview = verifications.filter(
    (v) => v.verificationStatus === 'needs-review'
  ).length;
  const outdated = verifications.filter(
    (v) => v.verificationStatus === 'outdated'
  ).length;

  const avgQuality =
    verifications.reduce((sum, v) => sum + v.qualityScore, 0) /
    verifications.length;

  const allSources = verifications.flatMap((v) => v.sources);
  const avgReliability =
    allSources.reduce((sum, s) => sum + s.reliability, 0) / allSources.length;

  // Count by source type
  const bySourceType = allSources.reduce((acc, source) => {
    acc[source.type] = (acc[source.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const now = new Date();
  const contentWithinDate = verifications.filter((v) => isContentFresh(v)).length;
  const contentNearingExpiration = verifications.filter((v) => {
    const daysUntil =
      (v.nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntil > 0 && daysUntil <= 30;
  }).length;
  const expiredContent = verifications.filter(
    (v) => v.nextReviewDate < now
  ).length;

  return {
    totalContent: verifications.length,
    verifiedContent: verified,
    needsReview,
    outdated,
    averageQualityScore: Math.round(avgQuality),
    averageSourceReliability: Math.round(avgReliability),
    byDomain: {},  // TODO: Implement domain grouping
    bySourceType: bySourceType as any,
    contentWithinDate,
    contentNearingExpiration,
    expiredContent,
  };
}

/**
 * Get recommended review date based on source type and content
 */
export function getRecommendedReviewDate(
  verification: ContentVerification
): Date {
  const now = new Date();
  const reviewDate = new Date(now);

  // Base review period on primary source type
  const sourceType = verification.primarySource.type;

  const reviewIntervals: Record<string, number> = {
    'clinical-guideline': 365,      // Annual review
    'registry-data': 365,            // Annual review
    'journal-article': 730,          // Biennial review
    'textbook': 1095,                // Every 3 years
    'classification-system': 1825,   // Every 5 years
    'previous-exam': 365,            // Annual review
    'expert-consensus': 730,         // Biennial review
    'clinical-trial': 730,           // Biennial review
  };

  const daysToAdd = reviewIntervals[sourceType] || 365;
  reviewDate.setDate(reviewDate.getDate() + daysToAdd);

  // Adjust based on content quality
  if (verification.qualityScore < 70) {
    // More frequent review for lower quality
    reviewDate.setDate(reviewDate.getDate() - 90);
  }

  // Adjust based on source age
  const sourceAge =
    (now.getTime() - verification.primarySource.publicationDate.getTime()) /
    (1000 * 60 * 60 * 24 * 365);
  if (sourceAge > 5) {
    // More frequent review for older sources
    reviewDate.setDate(reviewDate.getDate() - 90);
  }

  return reviewDate;
}

/**
 * Validate all sources for a piece of content
 */
export function validateContentSources(
  verification: ContentVerification
): {
  isValid: boolean;
  criticalIssues: string[];
  warnings: string[];
} {
  const criticalIssues: string[] = [];
  const warnings: string[] = [];

  // Check minimum sources
  if (verification.sources.length === 0) {
    criticalIssues.push('No sources provided');
  } else if (verification.sources.length === 1) {
    warnings.push('Only one source - recommend at least 2 sources');
  }

  // Validate each source
  verification.sources.forEach((source, index) => {
    const validation = validateSource(source);
    if (!validation.isValid) {
      validation.issues.forEach((issue) => {
        if (
          issue.includes('deprecated') ||
          issue.includes('outdated') ||
          issue.includes('Missing')
        ) {
          criticalIssues.push(`Källa ${index + 1}: ${issue}`);
        } else {
          warnings.push(`Källa ${index + 1}: ${issue}`);
        }
      });
    }
  });

  // Check for conflicts
  const conflicts = detectConflicts(verification);
  conflicts.forEach((flag) => {
    if (flag.severity === 'high' || flag.severity === 'critical') {
      criticalIssues.push(flag.description);
    } else {
      warnings.push(flag.description);
    }
  });

  // Check freshness
  if (!isContentFresh(verification)) {
    warnings.push('Innehållet behöver uppdateras');
  }

  return {
    isValid: criticalIssues.length === 0,
    criticalIssues,
    warnings,
  };
}
