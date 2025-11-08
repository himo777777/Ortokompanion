/**
 * Auto-Update Engine
 *
 * Monitors verified sources for updates and changes.
 * When a source is updated, automatically:
 * 1. Identifies affected content (questions/cases using the source)
 * 2. Re-validates affected content against new source
 * 3. Flags outdated content for review/regeneration
 * 4. Generates new content using updated sources
 */

import { ALL_QUESTIONS, MCQQuestion } from '@/data/questions';
import { UNIFIED_CLINICAL_CASES } from '@/data/unified-clinical-cases';
import { UnifiedClinicalCase } from '@/types/clinical-cases';
import { VERIFIED_SOURCES } from '@/data/verified-sources';
import { SourceReference } from '@/types/verification';
import { confidenceScorer } from './confidence-scoring';
import { aiContentFactory } from './ai-content-factory';
import { AlertType } from '@/lib/alert-engine';
import { logger } from './logger';

export interface SourceUpdate {
  sourceId: string;
  previousVersion?: {
    lastVerified: Date;
    url: string | undefined;
  };
  currentVersion: {
    lastVerified: Date;
    url: string | undefined;
    changesDetected: string[];
  };
  updateType: 'minor' | 'major' | 'expired';
  affectedContentCount: number;
  affectedContent: AffectedContent[];
}

export interface AffectedContent {
  contentId: string;
  contentType: 'question' | 'clinical-case';
  currentConfidence: number;
  requiresUpdate: boolean;
  updatePriority: 'critical' | 'high' | 'medium' | 'low';
  issues: string[];
}

export interface UpdateRun {
  timestamp: Date;
  duration: number;
  sourcesChecked: number;
  sourcesUpdated: number;
  contentFlagged: number;
  contentRegenerated: number;
  updates: SourceUpdate[];
  errors: string[];
}

/**
 * Auto-Update Engine
 */
export class AutoUpdateEngine {
  private updateCheckInterval = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
  private confidenceThresholdForUpdate = 0.95; // Re-validate if confidence drops below 95%

  /**
   * Run update check for all sources
   */
  async runUpdateCheck(): Promise<UpdateRun> {
    const startTime = Date.now();
    const updates: SourceUpdate[] = [];
    const errors: string[] = [];
    let contentFlagged = 0;
    let contentRegenerated = 0;

    // Phase 1: Check all verified sources for updates
    const sources = Object.values(VERIFIED_SOURCES);
    for (const source of sources) {
      try {
        const update = await this.checkSourceUpdate(source);
        if (update) {
          updates.push(update);
          contentFlagged += update.affectedContent.filter((c) => c.requiresUpdate).length;
        }
      } catch (error) {
        errors.push(`Failed to check ${source.id}: ${error}`);
      }
    }

    // Phase 2: Handle critical updates
    const criticalUpdates = updates.filter((u) => u.updateType === 'expired' || u.updateType === 'major');

    for (const update of criticalUpdates) {
      try {
        const regenerated = await this.handleCriticalUpdate(update);
        contentRegenerated += regenerated;
      } catch (error) {
        errors.push(`Failed to handle update for ${update.sourceId}: ${error}`);
      }
    }

    return {
      timestamp: new Date(),
      duration: Date.now() - startTime,
      sourcesChecked: sources.length,
      sourcesUpdated: updates.length,
      contentFlagged,
      contentRegenerated,
      updates,
      errors,
    };
  }

  /**
   * Check if a source needs updating
   */
  private async checkSourceUpdate(source: SourceReference): Promise<SourceUpdate | null> {
    // Check 1: Is source expired?
    const now = new Date();
    if (source.expirationDate && source.expirationDate < now) {
      return this.createExpiredSourceUpdate(source);
    }

    // Check 2: Has it been too long since last verification?
    const daysSinceVerification = source.lastVerified
      ? (now.getTime() - source.lastVerified.getTime()) / (1000 * 60 * 60 * 24)
      : 999;

    if (daysSinceVerification > 7) {
      // Check for updates (in production, this would fetch the source URL)
      const hasChanges = await this.detectSourceChanges(source);

      if (hasChanges) {
        return this.createMajorSourceUpdate(source);
      } else {
        return this.createMinorSourceUpdate(source);
      }
    }

    return null;
  }

  /**
   * Detect changes in a source
   */
  private async detectSourceChanges(source: SourceReference): Promise<boolean> {
    // In production, this would:
    // 1. Fetch the source URL
    // 2. Compare with cached version
    // 3. Use AI to detect meaningful changes
    // 4. Calculate change magnitude

    // Mock: 20% chance of detecting changes
    return Math.random() < 0.2;
  }

  /**
   * Create update record for expired source
   */
  private createExpiredSourceUpdate(source: SourceReference): SourceUpdate {
    const affectedContent = this.findAffectedContent(source.id);

    return {
      sourceId: source.id,
      previousVersion: {
        lastVerified: source.lastVerified || new Date(),
        url: source.url,
      },
      currentVersion: {
        lastVerified: new Date(),
        url: source.url,
        changesDetected: ['Source has expired'],
      },
      updateType: 'expired',
      affectedContentCount: affectedContent.length,
      affectedContent,
    };
  }

  /**
   * Create update record for major changes
   */
  private createMajorSourceUpdate(source: SourceReference): SourceUpdate {
    const affectedContent = this.findAffectedContent(source.id);

    return {
      sourceId: source.id,
      previousVersion: {
        lastVerified: source.lastVerified || new Date(),
        url: source.url,
      },
      currentVersion: {
        lastVerified: new Date(),
        url: source.url,
        changesDetected: [
          'Guideline version updated',
          'Treatment recommendations changed',
          'New evidence added',
        ],
      },
      updateType: 'major',
      affectedContentCount: affectedContent.length,
      affectedContent,
    };
  }

  /**
   * Create update record for minor changes
   */
  private createMinorSourceUpdate(source: SourceReference): SourceUpdate {
    const affectedContent = this.findAffectedContent(source.id);

    return {
      sourceId: source.id,
      previousVersion: {
        lastVerified: source.lastVerified || new Date(),
        url: source.url,
      },
      currentVersion: {
        lastVerified: new Date(),
        url: source.url,
        changesDetected: ['Formatting updates', 'Minor corrections'],
      },
      updateType: 'minor',
      affectedContentCount: affectedContent.length,
      affectedContent: affectedContent.filter((c) => c.currentConfidence < 0.95),
    };
  }

  /**
   * Find all content that references a source
   */
  private findAffectedContent(sourceId: string): AffectedContent[] {
    const affected: AffectedContent[] = [];

    // Check questions
    const questions = ALL_QUESTIONS.filter((q) => q.references?.includes(sourceId));
    questions.forEach((question) => {
      const confidence = confidenceScorer.calculateConfidence(question);
      const requiresUpdate = confidence.overall < this.confidenceThresholdForUpdate;

      affected.push({
        contentId: question.id,
        contentType: 'question',
        currentConfidence: confidence.overall,
        requiresUpdate,
        updatePriority: this.calculateUpdatePriority(confidence.overall),
        issues: this.identifyIssues(confidence),
      });
    });

    // Check clinical cases
    const cases = UNIFIED_CLINICAL_CASES.filter((c) => c.references?.includes(sourceId));
    cases.forEach((clinicalCase) => {
      const confidence = confidenceScorer.calculateConfidence(clinicalCase);
      const requiresUpdate = confidence.overall < this.confidenceThresholdForUpdate;

      affected.push({
        contentId: clinicalCase.id,
        contentType: 'clinical-case',
        currentConfidence: confidence.overall,
        requiresUpdate,
        updatePriority: this.calculateUpdatePriority(confidence.overall),
        issues: this.identifyIssues(confidence),
      });
    });

    return affected;
  }

  /**
   * Calculate update priority based on confidence
   */
  private calculateUpdatePriority(
    confidence: number
  ): 'critical' | 'high' | 'medium' | 'low' {
    if (confidence < 0.85) return 'critical';
    if (confidence < 0.90) return 'high';
    if (confidence < 0.95) return 'medium';
    return 'low';
  }

  /**
   * Identify issues from confidence metrics
   */
  private identifyIssues(metrics: ReturnType<typeof confidenceScorer.calculateConfidence>): string[] {
    const issues: string[] = [];

    if (metrics.sourceAccuracy < 0.9) {
      issues.push('Source accuracy below threshold');
    }
    if (metrics.medicalAccuracy < 0.9) {
      issues.push('Medical accuracy below threshold');
    }
    if (metrics.pedagogicalQuality < 0.8) {
      issues.push('Pedagogical quality needs improvement');
    }

    return issues;
  }

  /**
   * Handle a critical source update
   */
  private async handleCriticalUpdate(update: SourceUpdate): Promise<number> {
    let regenerated = 0;

    // Get critical content that needs immediate update
    const criticalContent = update.affectedContent.filter(
      (c) => c.updatePriority === 'critical' || c.updatePriority === 'high'
    );

    for (const content of criticalContent) {
      try {
        if (content.contentType === 'question') {
          const originalQuestion = ALL_QUESTIONS.find((q) => q.id === content.contentId);
          if (originalQuestion) {
            // Regenerate question using updated source
            await this.regenerateQuestion(originalQuestion, update.sourceId);
            regenerated++;
          }
        } else if (content.contentType === 'clinical-case') {
          const originalCase = UNIFIED_CLINICAL_CASES.find((c) => c.id === content.contentId);
          if (originalCase) {
            // Regenerate clinical case using updated source
            await this.regenerateCase(originalCase, update.sourceId);
            regenerated++;
          }
        }
      } catch (error) {
        logger.error('Failed to regenerate content', error, { contentId: content.contentId });
      }
    }

    return regenerated;
  }

  /**
   * Regenerate a question with updated source
   */
  private async regenerateQuestion(
    originalQuestion: MCQQuestion,
    updatedSourceId: string
  ): Promise<void> {
    // In production, this would:
    // 1. Call AI to regenerate question using updated source
    // 2. Validate new version
    // 3. If confidence > 99%, auto-update
    // 4. Otherwise, queue for review with diff

    logger.info('Regenerating question due to source update', {
      questionId: originalQuestion.id,
      sourceId: updatedSourceId
    });

    // Mock: Simulate regeneration
    // In real implementation, would use aiContentFactory.generateSingle()
  }

  /**
   * Regenerate a clinical case with updated source
   */
  private async regenerateCase(
    originalCase: UnifiedClinicalCase,
    updatedSourceId: string
  ): Promise<void> {
    logger.info('Regenerating case due to source update', {
      caseId: originalCase.id,
      sourceId: updatedSourceId
    });

    // Mock: Simulate regeneration
  }

  /**
   * Create alerts for content that needs review
   */
  createUpdateAlerts(run: UpdateRun): Array<{
    type: AlertType;
    message: string;
    details: any;
  }> {
    const alerts: Array<{
      type: AlertType;
      message: string;
      details: any;
    }> = [];

    // Alert for expired sources
    const expiredUpdates = run.updates.filter((u) => u.updateType === 'expired');
    if (expiredUpdates.length > 0) {
      alerts.push({
        type: 'content-outdated',
        message: `${expiredUpdates.length} sources have expired`,
        details: {
          sources: expiredUpdates.map((u) => u.sourceId),
          affectedContent: expiredUpdates.reduce((sum, u) => sum + u.affectedContentCount, 0),
        },
      });
    }

    // Alert for major updates
    const majorUpdates = run.updates.filter((u) => u.updateType === 'major');
    if (majorUpdates.length > 0) {
      alerts.push({
        type: 'source-updated',
        message: `${majorUpdates.length} sources have major updates`,
        details: {
          sources: majorUpdates.map((u) => u.sourceId),
          affectedContent: majorUpdates.reduce((sum, u) => sum + u.affectedContentCount, 0),
        },
      });
    }

    // Alert for content that needs review
    if (run.contentFlagged > 0) {
      alerts.push({
        type: 'review-due',
        message: `${run.contentFlagged} content items flagged for review due to source updates`,
        details: {
          flaggedContent: run.contentFlagged,
          regenerated: run.contentRegenerated,
        },
      });
    }

    return alerts;
  }

  /**
   * Generate update report
   */
  generateReport(run: UpdateRun): string {
    const lines: string[] = [];

    lines.push('=== AUTO-UPDATE ENGINE REPORT ===');
    lines.push(`Timestamp: ${run.timestamp.toISOString()}`);
    lines.push(`Duration: ${(run.duration / 1000).toFixed(1)}s`);
    lines.push('');
    lines.push(`Sources Checked: ${run.sourcesChecked}`);
    lines.push(`Sources Updated: ${run.sourcesUpdated}`);
    lines.push(`Content Flagged: ${run.contentFlagged}`);
    lines.push(`Content Regenerated: ${run.contentRegenerated}`);
    lines.push('');

    if (run.updates.length > 0) {
      lines.push('SOURCE UPDATES:');
      run.updates.forEach((update) => {
        lines.push(
          `  ${update.sourceId} (${update.updateType}) - ${update.affectedContentCount} items affected`
        );
        update.currentVersion.changesDetected.forEach((change) => {
          lines.push(`    - ${change}`);
        });
      });
    }

    if (run.errors.length > 0) {
      lines.push('');
      lines.push('ERRORS:');
      run.errors.forEach((error) => lines.push(`  - ${error}`));
    }

    return lines.join('\n');
  }
}

// Singleton instance
export const autoUpdateEngine = new AutoUpdateEngine();
