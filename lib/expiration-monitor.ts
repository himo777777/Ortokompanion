/**
 * Expiration Monitoring System
 * Monitors source freshness and triggers alerts for outdated content
 */

import { SourceReference, ContentVerification } from '@/types/verification';
import { logger } from './logger';

export interface ExpirationAlert {
  sourceId: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  daysUntilExpiration?: number;
  daysOverdue?: number;
  recommendedAction: string;
  affectedContent?: string[];
}

export interface ExpirationMonitorConfig {
  criticalThresholdDays: number; // Alert when source will expire within this many days
  warningThresholdDays: number; // Warning when source will expire within this many days
  maxSourceAgeDays: number; // Maximum age before source is considered outdated
  checkIntervalHours: number; // How often to run monitoring
}

export const DEFAULT_EXPIRATION_CONFIG: ExpirationMonitorConfig = {
  criticalThresholdDays: 30,
  warningThresholdDays: 90,
  maxSourceAgeDays: 1825, // 5 years
  checkIntervalHours: 24,
};

/**
 * Check if a source has expired or is approaching expiration
 */
export function checkSourceExpiration(
  source: SourceReference,
  config: ExpirationMonitorConfig = DEFAULT_EXPIRATION_CONFIG
): ExpirationAlert | null {
  const now = new Date();

  // Check if source has explicit expiration date
  if (source.expirationDate) {
    const expirationDate = new Date(source.expirationDate);
    const daysUntilExpiration = Math.ceil(
      (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiration < 0) {
      // Source has expired
      return {
        sourceId: source.id,
        severity: 'critical',
        message: `Source "${source.title}" has expired ${Math.abs(daysUntilExpiration)} days ago`,
        daysOverdue: Math.abs(daysUntilExpiration),
        recommendedAction: 'Update source immediately or mark as deprecated',
      };
    } else if (daysUntilExpiration <= config.criticalThresholdDays) {
      return {
        sourceId: source.id,
        severity: 'critical',
        message: `Source "${source.title}" will expire in ${daysUntilExpiration} days`,
        daysUntilExpiration,
        recommendedAction: 'Find replacement source or verify current source is still valid',
      };
    } else if (daysUntilExpiration <= config.warningThresholdDays) {
      return {
        sourceId: source.id,
        severity: 'warning',
        message: `Source "${source.title}" will expire in ${daysUntilExpiration} days`,
        daysUntilExpiration,
        recommendedAction: 'Plan to review and update this source',
      };
    }
  }

  // Check source age (publication year)
  const sourceAge = now.getFullYear() - source.year;
  const sourceAgeDays = sourceAge * 365;

  if (sourceAgeDays > config.maxSourceAgeDays) {
    // Source type specific aging rules
    const isTextbook = source.type === 'textbook';
    const isGuideline = source.type === 'clinical-guideline';
    const isClassification = source.type === 'classification-system';

    // Different source types age differently
    const maxAge = isClassification ? 20 : isTextbook ? 10 : isGuideline ? 5 : 5;

    if (sourceAge > maxAge) {
      return {
        sourceId: source.id,
        severity: 'warning',
        message: `Source "${source.title}" is ${sourceAge} years old (published ${source.year})`,
        recommendedAction: `Review if ${maxAge}+ year old ${source.type} is still current`,
      };
    }
  }

  // Check last verification date
  if (source.lastVerified) {
    const lastVerified = new Date(source.lastVerified);
    const daysSinceVerification = Math.ceil(
      (now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceVerification > 180) {
      // 6 months since last verification
      return {
        sourceId: source.id,
        severity: 'info',
        message: `Source "${source.title}" hasn't been verified in ${daysSinceVerification} days`,
        recommendedAction: 'Re-verify source accessibility and accuracy',
      };
    }
  } else {
    // Never verified
    return {
      sourceId: source.id,
      severity: 'warning',
      message: `Source "${source.title}" has never been verified`,
      recommendedAction: 'Verify source immediately',
    };
  }

  return null; // No expiration concerns
}

/**
 * Check all sources for expiration
 */
export function checkAllSourcesExpiration(
  sources: SourceReference[],
  config: ExpirationMonitorConfig = DEFAULT_EXPIRATION_CONFIG
): ExpirationAlert[] {
  const alerts: ExpirationAlert[] = [];

  for (const source of sources) {
    const alert = checkSourceExpiration(source, config);
    if (alert) {
      alerts.push(alert);
    }
  }

  // Sort by severity
  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Find content affected by expired sources
 */
export function findAffectedContent(
  expiredSourceId: string,
  allVerifications: ContentVerification[]
): ContentVerification[] {
  return allVerifications.filter(verification =>
    verification.sources.some(source => source.id === expiredSourceId)
  );
}

/**
 * Get expiration summary statistics
 */
export function getExpirationSummary(alerts: ExpirationAlert[]): {
  critical: number;
  warnings: number;
  info: number;
  sourcesExpiringSoon: number;
  sourcesExpired: number;
  sourcesNeedingReview: number;
} {
  const critical = alerts.filter(a => a.severity === 'critical').length;
  const warnings = alerts.filter(a => a.severity === 'warning').length;
  const info = alerts.filter(a => a.severity === 'info').length;

  const sourcesExpiringSoon = alerts.filter(a =>
    a.daysUntilExpiration !== undefined && a.daysUntilExpiration > 0
  ).length;

  const sourcesExpired = alerts.filter(a =>
    a.daysOverdue !== undefined && a.daysOverdue > 0
  ).length;

  const sourcesNeedingReview = alerts.filter(a =>
    a.message.includes('hasn\'t been verified') || a.message.includes('never been verified')
  ).length;

  return {
    critical,
    warnings,
    info,
    sourcesExpiringSoon,
    sourcesExpired,
    sourcesNeedingReview,
  };
}

/**
 * Generate expiration report
 */
export function generateExpirationReport(
  sources: SourceReference[],
  config: ExpirationMonitorConfig = DEFAULT_EXPIRATION_CONFIG
): {
  alerts: ExpirationAlert[];
  summary: ReturnType<typeof getExpirationSummary>;
  reportDate: Date;
  nextCheckDate: Date;
} {
  const alerts = checkAllSourcesExpiration(sources, config);
  const summary = getExpirationSummary(alerts);
  const reportDate = new Date();
  const nextCheckDate = new Date(
    reportDate.getTime() + config.checkIntervalHours * 60 * 60 * 1000
  );

  return {
    alerts,
    summary,
    reportDate,
    nextCheckDate,
  };
}

/**
 * Get sources that need immediate attention
 */
export function getSourcesNeedingAttention(
  sources: SourceReference[],
  config: ExpirationMonitorConfig = DEFAULT_EXPIRATION_CONFIG
): {
  critical: SourceReference[];
  warning: SourceReference[];
  info: SourceReference[];
} {
  const alerts = checkAllSourcesExpiration(sources, config);
  const sourceMap = new Map(sources.map(s => [s.id, s]));

  const critical: SourceReference[] = [];
  const warning: SourceReference[] = [];
  const info: SourceReference[] = [];

  for (const alert of alerts) {
    const source = sourceMap.get(alert.sourceId);
    if (!source) continue;

    if (alert.severity === 'critical') {
      critical.push(source);
    } else if (alert.severity === 'warning') {
      warning.push(source);
    } else {
      info.push(source);
    }
  }

  return { critical, warning, info };
}

/**
 * Calculate days until next critical expiration
 */
export function getDaysUntilNextExpiration(
  sources: SourceReference[],
  config: ExpirationMonitorConfig = DEFAULT_EXPIRATION_CONFIG
): number | null {
  const alerts = checkAllSourcesExpiration(sources, config);
  const expiringAlerts = alerts.filter(a => a.daysUntilExpiration !== undefined);

  if (expiringAlerts.length === 0) {
    return null;
  }

  const minDays = Math.min(...expiringAlerts.map(a => a.daysUntilExpiration!));
  return minDays;
}

/**
 * Format alert for display
 */
export function formatExpirationAlert(alert: ExpirationAlert): string {
  const icon = alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '⚠️' : 'ℹ️';
  let message = `${icon} [${alert.severity.toUpperCase()}] ${alert.message}`;

  if (alert.daysUntilExpiration !== undefined) {
    message += ` (${alert.daysUntilExpiration} days remaining)`;
  }

  if (alert.daysOverdue !== undefined) {
    message += ` (${alert.daysOverdue} days overdue)`;
  }

  message += `\n   → ${alert.recommendedAction}`;

  if (alert.affectedContent && alert.affectedContent.length > 0) {
    message += `\n   📄 Affects ${alert.affectedContent.length} content item(s)`;
  }

  return message;
}

/**
 * Send expiration notifications (placeholder for future email/webhook integration)
 */
export async function sendExpirationNotifications(
  alerts: ExpirationAlert[],
  recipients: string[]
): Promise<{ sent: number; failed: number }> {
  // Placeholder for notification system
  // In a real implementation, this would:
  // - Send emails to administrators
  // - Post to Slack/Discord webhooks
  // - Create dashboard notifications
  // - Log to monitoring systems

  logger.info('Expiration notifications scheduled', {
    alertsCount: alerts.length,
    recipientsCount: recipients.length
  });

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  if (criticalAlerts.length > 0) {
    logger.warn('Critical expiration alerts require immediate attention', {
      criticalCount: criticalAlerts.length
    });
  }

  return {
    sent: alerts.length * recipients.length,
    failed: 0,
  };
}

/**
 * Schedule next expiration check
 */
export function getNextCheckTime(
  config: ExpirationMonitorConfig = DEFAULT_EXPIRATION_CONFIG
): Date {
  return new Date(Date.now() + config.checkIntervalHours * 60 * 60 * 1000);
}

/**
 * Check if it's time to run expiration monitoring
 */
export function shouldRunExpirationCheck(
  lastCheckTime: Date | null,
  config: ExpirationMonitorConfig = DEFAULT_EXPIRATION_CONFIG
): boolean {
  if (!lastCheckTime) {
    return true; // Never run before
  }

  const timeSinceLastCheck = Date.now() - lastCheckTime.getTime();
  const checkInterval = config.checkIntervalHours * 60 * 60 * 1000;

  return timeSinceLastCheck >= checkInterval;
}
