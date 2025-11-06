/**
 * Alert Engine System
 *
 * Monitors content freshness and generates alerts for medical updates,
 * with priority for Swedish sources.
 */

import { SourceReference } from '@/types/verification';
import { ContentUpdateNotification } from './content-versioning';
import { isSwedishSource } from './source-hierarchy';

export type AlertType =
  | 'source-updated'
  | 'source-expiring'
  | 'conflict-detected'
  | 'review-due'
  | 'quality-low'
  | 'swedish-source-updated'
  | 'major-guideline-change'
  | 'content-outdated';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  affectedContent: string[];
  sourceId?: string;
  actionRequired: string;
  dueDate?: Date;
  assignedTo?: string;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

export interface AlertFilter {
  type?: AlertType[];
  severity?: AlertSeverity[];
  resolved?: boolean;
  acknowledged?: boolean;
  assignedTo?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  sourceId?: string;
}

export interface AlertStats {
  total: number;
  bySeverity: Record<AlertSeverity, number>;
  byType: Record<AlertType, number>;
  unresolved: number;
  unacknowledged: number;
  overdue: number;
  swedishSourceAlerts: number;
}

export interface AuditReport {
  period: {
    start: Date;
    end: Date;
  };
  stats: AlertStats;
  criticalAlerts: Alert[];
  swedishSourceUpdates: Alert[];
  overdueAlerts: Alert[];
  contentQualityIssues: Alert[];
  recommendations: string[];
}

/**
 * Alert Engine Service
 */
export class AlertEngine {
  private alerts: Map<string, Alert> = new Map();
  private alertCounter = 0;

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert-${Date.now()}-${++this.alertCounter}`;
  }

  /**
   * Create a new alert
   */
  createAlert(
    type: AlertType,
    severity: AlertSeverity,
    title: string,
    description: string,
    affectedContent: string[],
    actionRequired: string,
    options: Partial<Alert> = {}
  ): Alert {
    const alert: Alert = {
      id: this.generateAlertId(),
      type,
      severity,
      title,
      description,
      affectedContent,
      actionRequired,
      createdAt: new Date(),
      acknowledged: false,
      resolved: false,
      ...options
    };

    // Set due date based on severity if not provided
    if (!alert.dueDate) {
      const hoursUntilDue = {
        critical: 24,
        high: 72,
        medium: 168, // 1 week
        low: 336,    // 2 weeks
        info: 720    // 30 days
      };

      alert.dueDate = new Date(Date.now() + hoursUntilDue[severity] * 60 * 60 * 1000);
    }

    this.alerts.set(alert.id, alert);
    return alert;
  }

  /**
   * Check for source updates and create alerts
   */
  async checkSourceUpdates(sources: Map<string, SourceReference>): Promise<Alert[]> {
    const alerts: Alert[] = [];

    sources.forEach((source, sourceId) => {
      // Check if source is outdated
      const yearsSincePublication = new Date().getFullYear() - source.year;

      if (isSwedishSource(source)) {
        // Swedish sources - stricter requirements
        if (yearsSincePublication > 2) {
          alerts.push(this.createAlert(
            'swedish-source-updated',
            'high',
            `Svensk källa behöver uppdatering: ${source.title}`,
            `Den svenska källan "${source.title}" är ${yearsSincePublication} år gammal och bör kontrolleras för uppdateringar.`,
            [], // Would be filled with affected content IDs
            'Kontrollera om det finns en nyare version av denna svenska källa',
            { sourceId }
          ));
        }
      } else if (yearsSincePublication > 5) {
        // International sources - 5 year threshold
        alerts.push(this.createAlert(
          'source-expiring',
          'medium',
          `Källa föråldrad: ${source.title}`,
          `Källan "${source.title}" från ${source.year} är över 5 år gammal.`,
          [],
          'Överväg att hitta en nyare källa eller verifiera att informationen fortfarande är aktuell',
          { sourceId }
        ));
      }

      // Check for sources expiring soon
      if (source.expirationDate) {
        const daysUntilExpiration = Math.floor(
          (new Date(source.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiration < 0) {
          alerts.push(this.createAlert(
            'source-expiring',
            'critical',
            `Källa har gått ut: ${source.title}`,
            `Källan "${source.title}" gick ut för ${Math.abs(daysUntilExpiration)} dagar sedan.`,
            [],
            'Omedelbar uppdatering krävs',
            { sourceId }
          ));
        } else if (daysUntilExpiration < 30) {
          alerts.push(this.createAlert(
            'source-expiring',
            'high',
            `Källa går ut snart: ${source.title}`,
            `Källan "${source.title}" går ut om ${daysUntilExpiration} dagar.`,
            [],
            'Planera för uppdatering',
            { sourceId }
          ));
        }
      }
    });

    return alerts;
  }

  /**
   * Check for content that needs review
   */
  async checkContentReviewDue(
    contentMap: Map<string, { lastReviewed: Date; references: string[] }>
  ): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const now = new Date();

    contentMap.forEach((content, contentId) => {
      const daysSinceReview = Math.floor(
        (now.getTime() - content.lastReviewed.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Content with Swedish sources needs review every 6 months
      const hasSwedishSources = content.references.some(ref =>
        ref.includes('socialstyrelsen') ||
        ref.includes('sbu') ||
        ref.includes('svorf') ||
        ref.includes('riks')
      );

      const reviewThreshold = hasSwedishSources ? 180 : 365; // 6 months vs 1 year

      if (daysSinceReview > reviewThreshold) {
        const severity: AlertSeverity = hasSwedishSources ? 'high' : 'medium';

        alerts.push(this.createAlert(
          'review-due',
          severity,
          `Innehåll behöver granskning: ${contentId}`,
          `Innehållet har inte granskats på ${daysSinceReview} dagar.${
            hasSwedishSources ? ' Innehåller svenska källor som kräver tätare granskning.' : ''
          }`,
          [contentId],
          'Granska och uppdatera innehållet mot aktuella källor',
          {
            metadata: {
              daysSinceReview,
              hasSwedishSources,
              references: content.references
            }
          }
        ));
      }
    });

    return alerts;
  }

  /**
   * Detect conflicts between sources
   */
  detectConflicts(
    contentId: string,
    sources: Array<{ id: string; recommendation: string }>
  ): Alert | null {
    // Check if sources have conflicting recommendations
    const uniqueRecommendations = new Set(sources.map(s => s.recommendation));

    if (uniqueRecommendations.size > 1) {
      return this.createAlert(
        'conflict-detected',
        'high',
        `Konflikt mellan källor för ${contentId}`,
        `Flera källor ger olika rekommendationer för detta innehåll.`,
        [contentId],
        'Manuell granskning krävs för att lösa konflikten',
        {
          metadata: {
            sources: sources.map(s => s.id),
            recommendations: Array.from(uniqueRecommendations)
          }
        }
      );
    }

    return null;
  }

  /**
   * Check content quality
   */
  checkContentQuality(
    contentId: string,
    qualityScore: number,
    issues: string[]
  ): Alert | null {
    if (qualityScore < 60) {
      return this.createAlert(
        'quality-low',
        qualityScore < 40 ? 'high' : 'medium',
        `Låg kvalitetspoäng för ${contentId}`,
        `Innehållet har en kvalitetspoäng på ${qualityScore}%. Problem: ${issues.join(', ')}`,
        [contentId],
        'Förbättra innehållet enligt identifierade problem',
        {
          metadata: {
            qualityScore,
            issues
          }
        }
      );
    }

    return null;
  }

  /**
   * Process content update notification and create alert
   */
  processContentUpdate(notification: ContentUpdateNotification): Alert {
    const hasSwedishUpdate = notification.sourceUpdates.some(u =>
      u.sourceId.includes('socialstyrelsen') ||
      u.sourceId.includes('sbu') ||
      u.sourceId.includes('svorf') ||
      u.sourceId.includes('riks')
    );

    const severity: AlertSeverity =
      notification.priority === 'critical' ? 'critical' :
      notification.priority === 'high' ? 'high' :
      notification.priority === 'medium' ? 'medium' : 'low';

    const type: AlertType = hasSwedishUpdate ? 'swedish-source-updated' :
      notification.sourceUpdates.some(u => u.updateType === 'major') ? 'major-guideline-change' :
      'source-updated';

    const sourceList = notification.sourceUpdates
      .map(u => `${u.sourceId} (${u.oldVersion} → ${u.newVersion})`)
      .join(', ');

    return this.createAlert(
      type,
      severity,
      `Källuppdatering för ${notification.contentType}: ${notification.contentId}`,
      `Följande källor har uppdaterats: ${sourceList}`,
      [notification.contentId],
      `${notification.recommendedAction === 'immediate-review' ? 'Omedelbar' : 'Planerad'} granskning krävs`,
      {
        dueDate: notification.deadline,
        metadata: notification
      }
    );
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();
    return true;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, resolvedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.resolved = true;
    alert.resolvedBy = resolvedBy;
    alert.resolvedAt = new Date();
    return true;
  }

  /**
   * Assign alert to user
   */
  assignAlert(alertId: string, assignedTo: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.assignedTo = assignedTo;
    return true;
  }

  /**
   * Get alerts with filtering
   */
  getAlerts(filter: AlertFilter = {}): Alert[] {
    let alerts = Array.from(this.alerts.values());

    // Apply filters
    if (filter.type && filter.type.length > 0) {
      alerts = alerts.filter(a => filter.type!.includes(a.type));
    }

    if (filter.severity && filter.severity.length > 0) {
      alerts = alerts.filter(a => filter.severity!.includes(a.severity));
    }

    if (filter.resolved !== undefined) {
      alerts = alerts.filter(a => a.resolved === filter.resolved);
    }

    if (filter.acknowledged !== undefined) {
      alerts = alerts.filter(a => a.acknowledged === filter.acknowledged);
    }

    if (filter.assignedTo) {
      alerts = alerts.filter(a => a.assignedTo === filter.assignedTo);
    }

    if (filter.createdAfter) {
      alerts = alerts.filter(a => a.createdAt >= filter.createdAfter!);
    }

    if (filter.createdBefore) {
      alerts = alerts.filter(a => a.createdAt <= filter.createdBefore!);
    }

    if (filter.sourceId) {
      alerts = alerts.filter(a => a.sourceId === filter.sourceId);
    }

    // Sort by severity and creation date
    alerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return alerts;
  }

  /**
   * Get alert statistics
   */
  getAlertStats(): AlertStats {
    const alerts = Array.from(this.alerts.values());
    const now = new Date();

    const stats: AlertStats = {
      total: alerts.length,
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0
      },
      byType: {} as Record<AlertType, number>,
      unresolved: 0,
      unacknowledged: 0,
      overdue: 0,
      swedishSourceAlerts: 0
    };

    alerts.forEach(alert => {
      stats.bySeverity[alert.severity]++;
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;

      if (!alert.resolved) stats.unresolved++;
      if (!alert.acknowledged) stats.unacknowledged++;
      if (alert.dueDate && alert.dueDate < now && !alert.resolved) stats.overdue++;
      if (alert.type === 'swedish-source-updated') stats.swedishSourceAlerts++;
    });

    return stats;
  }

  /**
   * Generate monthly audit report
   */
  async generateAuditReport(startDate: Date, endDate: Date): Promise<AuditReport> {
    const alerts = this.getAlerts({
      createdAfter: startDate,
      createdBefore: endDate
    });

    const stats = this.getAlertStats();
    const now = new Date();

    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const swedishSourceUpdates = alerts.filter(a => a.type === 'swedish-source-updated');
    const overdueAlerts = alerts.filter(a =>
      a.dueDate && a.dueDate < now && !a.resolved
    );
    const contentQualityIssues = alerts.filter(a => a.type === 'quality-low');

    const recommendations: string[] = [];

    // Generate recommendations
    if (stats.swedishSourceAlerts > 5) {
      recommendations.push('🇸🇪 Många svenska källor behöver uppdatering. Överväg en systematisk genomgång.');
    }

    if (stats.overdue > 10) {
      recommendations.push('⚠️ Över 10 försenade varningar. Öka granskningskapaciteten.');
    }

    if (stats.bySeverity.critical > 0) {
      recommendations.push('🚨 Kritiska varningar kräver omedelbar uppmärksamhet.');
    }

    if (contentQualityIssues.length > 20) {
      recommendations.push('📊 Många kvalitetsproblem identifierade. Överväg kvalitetshöjande insatser.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Systemet är i gott skick med få varningar.');
    }

    return {
      period: { start: startDate, end: endDate },
      stats,
      criticalAlerts,
      swedishSourceUpdates,
      overdueAlerts,
      contentQualityIssues,
      recommendations
    };
  }

  /**
   * Clear resolved alerts older than specified days
   */
  cleanupOldAlerts(daysToKeep = 90): number {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    let removed = 0;

    this.alerts.forEach((alert, id) => {
      if (alert.resolved && alert.resolvedAt && alert.resolvedAt < cutoffDate) {
        this.alerts.delete(id);
        removed++;
      }
    });

    return removed;
  }
}

// Export singleton instance
export const alertEngine = new AlertEngine();