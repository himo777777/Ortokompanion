/**
 * Source Monitoring Cron Endpoint
 *
 * Scheduled job that:
 * 1. Discovers new medical sources
 * 2. Checks existing sources for updates
 * 3. Flags outdated content
 * 4. Triggers content regeneration
 *
 * Schedule: Daily at 03:00 UTC (runs before content generation at 09:00 UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { autoSourceDiscovery } from '@/lib/auto-source-discovery';
import { autoUpdateEngine } from '@/lib/auto-update-engine';

export const maxDuration = 300; // 5 minutes max
export const runtime = 'nodejs';

/**
 * GET handler for scheduled cron job
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[SOURCE-MONITOR] Starting source monitoring job...');
    const startTime = Date.now();

    // Phase 1: Run source discovery
    console.log('[SOURCE-MONITOR] Phase 1: Discovering new sources...');
    const discoveryRun = await autoSourceDiscovery.runDiscovery();
    console.log(`[SOURCE-MONITOR] Discovered ${discoveryRun.sourcesAdded} high-confidence sources`);

    // Phase 2: Run update check
    console.log('[SOURCE-MONITOR] Phase 2: Checking sources for updates...');
    const updateRun = await autoUpdateEngine.runUpdateCheck();
    console.log(
      `[SOURCE-MONITOR] Found ${updateRun.sourcesUpdated} source updates, regenerated ${updateRun.contentRegenerated} items`
    );

    // Phase 3: Generate reports
    const discoveryReport = autoSourceDiscovery.generateReport(discoveryRun);
    const updateReport = autoUpdateEngine.generateReport(updateRun);

    // Phase 4: Create alerts
    const alerts = autoUpdateEngine.createUpdateAlerts(updateRun);

    const duration = Date.now() - startTime;
    console.log(`[SOURCE-MONITOR] Completed in ${(duration / 1000).toFixed(1)}s`);

    // Return comprehensive report
    return NextResponse.json({
      success: true,
      duration,
      discovery: {
        sourcesDiscovered: discoveryRun.sourcesDiscovered,
        sourcesValidated: discoveryRun.sourcesValidated,
        highConfidenceSources: discoveryRun.sourcesAdded,
        candidates: discoveryRun.candidates.map((c) => ({
          id: c.suggestedId,
          title: c.title,
          confidence: c.confidence,
          url: c.url,
        })),
      },
      updates: {
        sourcesChecked: updateRun.sourcesChecked,
        sourcesUpdated: updateRun.sourcesUpdated,
        contentFlagged: updateRun.contentFlagged,
        contentRegenerated: updateRun.contentRegenerated,
        updates: updateRun.updates.map((u) => ({
          sourceId: u.sourceId,
          updateType: u.updateType,
          affectedContent: u.affectedContentCount,
        })),
      },
      alerts,
      reports: {
        discovery: discoveryReport,
        updates: updateReport,
      },
    });
  } catch (error) {
    console.error('[SOURCE-MONITOR] Error:', error);

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
 * POST handler for manual trigger
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Allow manual trigger with specific options
    const options = {
      discoverySources: body.discoverySources !== false, // Default: true
      checkUpdates: body.checkUpdates !== false, // Default: true
      regenerateContent: body.regenerateContent !== false, // Default: true
    };

    console.log('[SOURCE-MONITOR] Manual trigger with options:', options);
    const startTime = Date.now();

    const result: any = {
      success: true,
      duration: 0,
    };

    // Conditionally run discovery
    if (options.discoverySources) {
      const discoveryRun = await autoSourceDiscovery.runDiscovery();
      result.discovery = {
        sourcesDiscovered: discoveryRun.sourcesDiscovered,
        sourcesValidated: discoveryRun.sourcesValidated,
        highConfidenceSources: discoveryRun.sourcesAdded,
        candidates: discoveryRun.candidates,
      };
    }

    // Conditionally run update check
    if (options.checkUpdates) {
      const updateRun = await autoUpdateEngine.runUpdateCheck();
      result.updates = {
        sourcesChecked: updateRun.sourcesChecked,
        sourcesUpdated: updateRun.sourcesUpdated,
        contentFlagged: updateRun.contentFlagged,
        contentRegenerated: updateRun.contentRegenerated,
        updates: updateRun.updates,
      };
    }

    result.duration = Date.now() - startTime;

    return NextResponse.json(result);
  } catch (error) {
    console.error('[SOURCE-MONITOR] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
