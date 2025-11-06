/**
 * Content Orchestrator
 *
 * Coordinates the entire automated content generation pipeline.
 * Runs daily to generate 100+ questions, validate them, and publish/queue for review.
 */

import { aiContentFactory, ContentGenerationRequest, GeneratedContent } from './ai-content-factory';
import { gapAnalyzer } from './gap-analyzer';
import { confidenceScorer } from './confidence-scoring';
import { contentVersioning } from './content-versioning';
import { alertEngine } from './alert-engine';
import { ALL_QUESTIONS } from '@/data/questions';
import { VERIFIED_SOURCES } from '@/data/verified-sources';
import * as fs from 'fs';
import * as path from 'path';

export interface OrchestrationRun {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'partial';
  plan: {
    targetCount: number;
    estimatedCost: number;
    estimatedDuration: number;
  };
  results: {
    generated: number;
    autoPublished: number;
    queuedForReview: number;
    rejected: number;
    totalCost: number;
    totalDuration: number;
  };
  generatedContent: GeneratedContent[];
  errors: Array<{
    phase: string;
    error: string;
    timestamp: Date;
  }>;
}

export interface OrchestratorConfig {
  dailyTarget: number; // How many items to generate per day
  confidenceThreshold: number; // Threshold for auto-publishing (0.99)
  maxCostPerDay: number; // Budget limit in USD
  enableAutoPublish: boolean; // Whether to auto-publish high-confidence content
  enableNotifications: boolean; // Whether to send admin notifications
}

/**
 * Content Orchestrator - Main automation controller
 */
export class ContentOrchestrator {
  private config: OrchestratorConfig;
  private currentRun: OrchestrationRun | null = null;
  private storageDir: string;
  private contentQueueFile: string;
  private runHistoryFile: string;

  constructor(config?: Partial<OrchestratorConfig>) {
    this.config = {
      dailyTarget: config?.dailyTarget || 100,
      confidenceThreshold: config?.confidenceThreshold || 0.99,
      maxCostPerDay: config?.maxCostPerDay || 1500,
      enableAutoPublish: config?.enableAutoPublish ?? true,
      enableNotifications: config?.enableNotifications ?? true,
    };

    this.storageDir = path.join(process.cwd(), 'data', 'generated');
    this.contentQueueFile = path.join(this.storageDir, 'review-queue.json');
    this.runHistoryFile = path.join(this.storageDir, 'orchestration-history.json');

    this.ensureStorageDir();
  }

  /**
   * Ensure storage directory exists
   */
  private ensureStorageDir() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Run the complete daily content generation pipeline
   */
  async runDaily(): Promise<OrchestrationRun> {
    console.log('[Orchestrator] Starting daily content generation pipeline');

    const runId = `run-${Date.now()}`;
    this.currentRun = {
      id: runId,
      startTime: new Date(),
      status: 'running',
      plan: {
        targetCount: 0,
        estimatedCost: 0,
        estimatedDuration: 0,
      },
      results: {
        generated: 0,
        autoPublished: 0,
        queuedForReview: 0,
        rejected: 0,
        totalCost: 0,
        totalDuration: 0,
      },
      generatedContent: [],
      errors: [],
    };

    try {
      // Phase 1: Analyze content gaps
      console.log('[Orchestrator] Phase 1: Analyzing content gaps');
      const plan = await this.analyzeGaps();
      this.currentRun.plan = plan;

      // Phase 2: Generate content batch
      console.log('[Orchestrator] Phase 2: Generating content batch');
      const generated = await this.generateContentBatch(plan);
      this.currentRun.generatedContent = generated;
      this.currentRun.results.generated = generated.length;

      // Phase 3: Validate and score content
      console.log('[Orchestrator] Phase 3: Validating and scoring content');
      const validated = await this.validateContent(generated);

      // Phase 4: Auto-publish or queue for review
      console.log('[Orchestrator] Phase 4: Publishing/queueing content');
      await this.processValidatedContent(validated);

      // Phase 5: Generate reports and notifications
      console.log('[Orchestrator] Phase 5: Generating reports');
      await this.generateReports();

      this.currentRun.status = 'completed';
      this.currentRun.endTime = new Date();

      console.log('[Orchestrator] Pipeline completed successfully');
    } catch (error) {
      console.error('[Orchestrator] Pipeline failed:', error);
      this.currentRun.status = 'failed';
      this.currentRun.endTime = new Date();
      this.currentRun.errors.push({
        phase: 'pipeline',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
    }

    // Save run history
    await this.saveRunHistory();

    return this.currentRun;
  }

  /**
   * Phase 1: Analyze content gaps and create generation plan
   */
  private async analyzeGaps(): Promise<{
    targetCount: number;
    estimatedCost: number;
    estimatedDuration: number;
  }> {
    const coverage = gapAnalyzer.analyzeCoverage();
    const plan = gapAnalyzer.createDailyPlan(this.config.dailyTarget);

    console.log(`[Orchestrator] Identified ${coverage.gaps.length} content gaps`);
    console.log(`[Orchestrator] Plan: Generate ${plan.totalItems} items`);
    console.log(`[Orchestrator] Estimated cost: $${plan.estimatedCost.toFixed(2)}`);
    console.log(`[Orchestrator] Estimated duration: ${Math.round(plan.estimatedDuration / 60)}min`);

    return {
      targetCount: plan.totalItems,
      estimatedCost: plan.estimatedCost,
      estimatedDuration: plan.estimatedDuration,
    };
  }

  /**
   * Phase 2: Generate content batch based on plan
   */
  private async generateContentBatch(plan: {
    targetCount: number;
    estimatedCost: number;
    estimatedDuration: number;
  }): Promise<GeneratedContent[]> {
    // Create generation plan
    const gapPlan = gapAnalyzer.createDailyPlan(plan.targetCount);

    // Convert plan breakdown into generation requests
    const requests: ContentGenerationRequest[] = gapPlan.breakdown.map((item) => ({
      type: 'question',
      domain: item.domain,
      level: item.level,
      band: item.band,
      targetCount: item.count,
    }));

    console.log(`[Orchestrator] Generating ${requests.length} content items`);

    // Generate content in batches to manage API rate limits
    const batchSize = 10;
    const allGenerated: GeneratedContent[] = [];

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      console.log(`[Orchestrator] Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(requests.length / batchSize)}`);

      try {
        const batchResults = await aiContentFactory.generateBatch(batch);
        allGenerated.push(...batchResults);

        // Update metrics
        batchResults.forEach((result) => {
          if (this.currentRun) {
            this.currentRun.results.totalCost += result.generationMetadata.cost;
            this.currentRun.results.totalDuration += result.generationMetadata.duration;
          }
        });

        // Check budget limit
        if (this.currentRun && this.currentRun.results.totalCost >= this.config.maxCostPerDay) {
          console.warn('[Orchestrator] Daily budget limit reached, stopping generation');
          break;
        }

        // Rate limiting: Wait between batches
        await this.sleep(2000); // 2 second delay between batches
      } catch (error) {
        console.error('[Orchestrator] Batch generation failed:', error);
        if (this.currentRun) {
          this.currentRun.errors.push({
            phase: 'generation',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
          });
        }
      }
    }

    return allGenerated;
  }

  /**
   * Phase 3: Validate and score all generated content
   */
  private async validateContent(generated: GeneratedContent[]): Promise<GeneratedContent[]> {
    console.log(`[Orchestrator] Validating ${generated.length} generated items`);

    for (const item of generated) {
      try {
        // Calculate confidence metrics
        const metrics = confidenceScorer.calculateConfidence(item.content);

        // Update item with final confidence score
        item.confidenceScore = metrics.overall;
        item.sourceAccuracy = metrics.sourceAccuracy;
        item.medicalAccuracy = metrics.medicalAccuracy;
        item.pedagogicalQuality = metrics.pedagogicalQuality;

        console.log(
          `[Orchestrator] ${item.content.id}: Confidence ${(metrics.overall * 100).toFixed(1)}%`
        );
      } catch (error) {
        console.error('[Orchestrator] Validation failed for item:', error);
        if (this.currentRun) {
          this.currentRun.errors.push({
            phase: 'validation',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
          });
        }
      }
    }

    return generated;
  }

  /**
   * Phase 4: Process validated content (auto-publish or queue for review)
   */
  private async processValidatedContent(validated: GeneratedContent[]): Promise<void> {
    const reviewQueue: GeneratedContent[] = [];

    for (const item of validated) {
      // Check if confidence meets auto-publish threshold
      if (
        this.config.enableAutoPublish &&
        item.confidenceScore >= this.config.confidenceThreshold
      ) {
        // Auto-publish
        await this.autoPublish(item);
        if (this.currentRun) {
          this.currentRun.results.autoPublished++;
        }
      } else if (item.confidenceScore >= 0.90) {
        // Queue for admin review (good enough to review)
        reviewQueue.push(item);
        if (this.currentRun) {
          this.currentRun.results.queuedForReview++;
        }
      } else {
        // Reject (too low confidence)
        console.warn(
          `[Orchestrator] Rejecting ${item.content.id} - confidence too low (${(item.confidenceScore * 100).toFixed(1)}%)`
        );
        if (this.currentRun) {
          this.currentRun.results.rejected++;
        }
      }
    }

    // Save review queue
    if (reviewQueue.length > 0) {
      await this.saveToReviewQueue(reviewQueue);
    }
  }

  /**
   * Auto-publish content to production
   */
  private async autoPublish(item: GeneratedContent): Promise<void> {
    console.log(
      `[Orchestrator] Auto-publishing ${item.content.id} (confidence: ${(item.confidenceScore * 100).toFixed(1)}%)`
    );

    try {
      // Create content version record
      const sourceSnapshots = item.usedSources.map((sourceId) => {
        const source = VERIFIED_SOURCES[sourceId];
        return contentVersioning.createSourceSnapshot(
          sourceId,
          source?.title || sourceId,
          source?.year.toString() || '2024',
          source?.publicationDate || new Date()
        );
      });

      contentVersioning.createContentVersion(
        item.content.id,
        'question',
        [],
        sourceSnapshots,
        `AI-generated with ${(item.confidenceScore * 100).toFixed(1)}% confidence`
      );

      // Append to questions file (in production, this would update the database)
      // For now, save to a separate "ai-generated" file
      const aiGeneratedFile = path.join(this.storageDir, 'ai-published-questions.json');
      let existingQuestions: any[] = [];

      if (fs.existsSync(aiGeneratedFile)) {
        const data = fs.readFileSync(aiGeneratedFile, 'utf-8');
        existingQuestions = JSON.parse(data);
      }

      existingQuestions.push({
        ...item.content,
        metadata: {
          aiGenerated: true,
          confidence: item.confidenceScore,
          publishedAt: new Date().toISOString(),
        },
      });

      fs.writeFileSync(aiGeneratedFile, JSON.stringify(existingQuestions, null, 2), 'utf-8');

      console.log(`[Orchestrator] Successfully published ${item.content.id}`);
    } catch (error) {
      console.error('[Orchestrator] Failed to auto-publish:', error);
      throw error;
    }
  }

  /**
   * Save content to review queue
   */
  private async saveToReviewQueue(items: GeneratedContent[]): Promise<void> {
    console.log(`[Orchestrator] Adding ${items.length} items to review queue`);

    let existingQueue: GeneratedContent[] = [];

    if (fs.existsSync(this.contentQueueFile)) {
      const data = fs.readFileSync(this.contentQueueFile, 'utf-8');
      existingQueue = JSON.parse(data);
    }

    existingQueue.push(...items);

    fs.writeFileSync(this.contentQueueFile, JSON.stringify(existingQueue, null, 2), 'utf-8');
  }

  /**
   * Phase 5: Generate reports and send notifications
   */
  private async generateReports(): Promise<void> {
    if (!this.currentRun) return;

    const report = this.generateSummaryReport();
    console.log('\n' + report + '\n');

    // Send notification if enabled
    if (this.config.enableNotifications) {
      await this.sendAdminNotification(report);
    }
  }

  /**
   * Generate summary report
   */
  private generateSummaryReport(): string {
    if (!this.currentRun) return '';

    const duration = this.currentRun.endTime
      ? (this.currentRun.endTime.getTime() - this.currentRun.startTime.getTime()) / 1000
      : 0;

    const lines: string[] = [];
    lines.push('═══════════════════════════════════════════════');
    lines.push('     DAILY CONTENT GENERATION REPORT');
    lines.push('═══════════════════════════════════════════════');
    lines.push(`Run ID: ${this.currentRun.id}`);
    lines.push(`Status: ${this.currentRun.status.toUpperCase()}`);
    lines.push(`Duration: ${Math.round(duration / 60)} minutes`);
    lines.push('');
    lines.push('RESULTS:');
    lines.push(`  Generated: ${this.currentRun.results.generated} items`);
    lines.push(`  Auto-Published: ${this.currentRun.results.autoPublished} items (>99% confidence)`);
    lines.push(
      `  Queued for Review: ${this.currentRun.results.queuedForReview} items (90-99% confidence)`
    );
    lines.push(`  Rejected: ${this.currentRun.results.rejected} items (<90% confidence)`);
    lines.push('');
    lines.push('COST:');
    lines.push(`  Total: $${this.currentRun.results.totalCost.toFixed(2)}`);
    lines.push(`  Average per item: $${(this.currentRun.results.totalCost / this.currentRun.results.generated).toFixed(2)}`);
    lines.push('');

    if (this.currentRun.errors.length > 0) {
      lines.push('ERRORS:');
      this.currentRun.errors.forEach((error) => {
        lines.push(`  [${error.phase}] ${error.error}`);
      });
      lines.push('');
    }

    lines.push('═══════════════════════════════════════════════');

    return lines.join('\n');
  }

  /**
   * Send notification to admins
   */
  private async sendAdminNotification(report: string): Promise<void> {
    // Create alert in alert system
    if (this.currentRun && this.currentRun.results.queuedForReview > 0) {
      alertEngine.createAlert(
        'review-due',
        'medium',
        'New AI-generated content awaiting review',
        `${this.currentRun.results.queuedForReview} new questions have been generated and are awaiting admin review. ${this.currentRun.results.autoPublished} questions were automatically published.`,
        [],
        'Review AI-generated content in the admin panel',
        {
          metadata: {
            runId: this.currentRun.id,
            generated: this.currentRun.results.generated,
            autoPublished: this.currentRun.results.autoPublished,
            queuedForReview: this.currentRun.results.queuedForReview,
          },
        }
      );
    }

    // TODO: Send email notification
    console.log('[Orchestrator] Admin notification sent');
  }

  /**
   * Save run history
   */
  private async saveRunHistory(): Promise<void> {
    if (!this.currentRun) return;

    let history: OrchestrationRun[] = [];

    if (fs.existsSync(this.runHistoryFile)) {
      const data = fs.readFileSync(this.runHistoryFile, 'utf-8');
      history = JSON.parse(data);
    }

    history.push(this.currentRun);

    // Keep only last 30 runs
    if (history.length > 30) {
      history = history.slice(-30);
    }

    fs.writeFileSync(this.runHistoryFile, JSON.stringify(history, null, 2), 'utf-8');
  }

  /**
   * Get review queue
   */
  getReviewQueue(): GeneratedContent[] {
    if (!fs.existsSync(this.contentQueueFile)) {
      return [];
    }

    const data = fs.readFileSync(this.contentQueueFile, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * Get run history
   */
  getRunHistory(): OrchestrationRun[] {
    if (!fs.existsSync(this.runHistoryFile)) {
      return [];
    }

    const data = fs.readFileSync(this.runHistoryFile, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * Utility: Sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const contentOrchestrator = new ContentOrchestrator();
