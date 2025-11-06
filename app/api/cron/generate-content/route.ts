/**
 * API endpoint for automated content generation
 *
 * This endpoint is called daily by GitHub Actions to:
 * 1. Analyze content gaps
 * 2. Generate 100+ new questions/cases with AI
 * 3. Validate and score content
 * 4. Auto-publish high-confidence content (>99%)
 * 5. Queue medium-confidence content for admin review
 */

import { NextRequest, NextResponse } from 'next/server';
import { contentOrchestrator } from '@/lib/content-orchestrator';

export const maxDuration = 300; // 5 minutes max execution time
export const runtime = 'nodejs'; // Use Node.js runtime for file system access

export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (
      process.env.NODE_ENV === 'production' &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Starting automated content generation');

    // Run the complete orchestration pipeline
    const run = await contentOrchestrator.runDaily();

    // Generate summary
    const summary = {
      runId: run.id,
      status: run.status,
      duration: run.endTime
        ? (run.endTime.getTime() - run.startTime.getTime()) / 1000
        : 0,
      plan: run.plan,
      results: run.results,
      errors: run.errors.length,
      timestamp: new Date().toISOString(),
    };

    console.log('[CRON] Content generation complete:', summary);

    return NextResponse.json({
      success: run.status === 'completed',
      summary,
    });
  } catch (error) {
    console.error('[CRON] Error during content generation:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for manual trigger with custom configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      targetCount,
      confidenceThreshold,
      enableAutoPublish,
    }: {
      targetCount?: number;
      confidenceThreshold?: number;
      enableAutoPublish?: boolean;
    } = body;

    console.log('[CRON] Manual trigger with custom config:', {
      targetCount,
      confidenceThreshold,
      enableAutoPublish,
    });

    // Create custom orchestrator instance with provided config
    const { ContentOrchestrator } = await import('@/lib/content-orchestrator');
    const customOrchestrator = new ContentOrchestrator({
      dailyTarget: targetCount,
      confidenceThreshold,
      enableAutoPublish,
    });

    const run = await customOrchestrator.runDaily();

    const summary = {
      runId: run.id,
      status: run.status,
      duration: run.endTime
        ? (run.endTime.getTime() - run.startTime.getTime()) / 1000
        : 0,
      plan: run.plan,
      results: run.results,
      errors: run.errors.length,
    };

    return NextResponse.json({
      success: run.status === 'completed',
      summary,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
