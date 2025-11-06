/**
 * API endpoint for source monitoring cron job
 *
 * This endpoint should be called daily via a cron service (e.g., Vercel Cron)
 * to check for updates to medical sources.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sourceMonitor } from '@/lib/source-monitor';
import { alertEngine } from '@/lib/alert-engine';
import { VERIFIED_SOURCES } from '@/data/verified-sources';
import { getContentBySource, getSourceUsageStats, generateMappingReport } from '@/lib/content-source-mapping';
import { contentVersioning } from '@/lib/content-versioning';
import { ALL_QUESTIONS } from '@/data/questions';

export async function GET(request: NextRequest) {
  try {
    // Verify authorization (for production, use proper auth)
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Starting source monitoring check...');

    // Run source monitoring checks
    const monitorReport = await sourceMonitor.checkAllSources();

    console.log(`[CRON] Checked ${monitorReport.totalChecked} sources`);
    console.log(`[CRON] Found ${monitorReport.updatesFound} updates`);

    // Generate alerts for critical updates
    if (monitorReport.criticalUpdates.length > 0) {
      for (const sourceId of monitorReport.criticalUpdates) {
        const source = VERIFIED_SOURCES[sourceId];
        if (source) {
          // Get all content that uses this source
          const affectedContent = getContentBySource(sourceId, 'all');
          const usageStats = getSourceUsageStats(sourceId);

          alertEngine.createAlert(
            'source-updated',
            'critical',
            `Kritisk uppdatering: ${source.title}`,
            `Källan "${source.title}" har uppdaterats och kräver omedelbar granskning. Påverkar ${usageStats.totalContent} innehållsobjekt (${usageStats.questionCount} frågor, ${usageStats.caseCount} fallstudier) över ${usageStats.domains.size} domäner.`,
            affectedContent,
            'Granska och uppdatera allt innehåll som använder denna källa',
            {
              metadata: {
                sourceId,
                questionCount: usageStats.questionCount,
                caseCount: usageStats.caseCount,
                domains: Array.from(usageStats.domains)
              }
            }
          );
        }
      }
    }

    // Check for expiring sources
    const sourceMap = new Map(Object.entries(VERIFIED_SOURCES));
    const expiringAlerts = await alertEngine.checkSourceUpdates(sourceMap);

    console.log(`[CRON] Created ${expiringAlerts.length} expiration alerts`);

    // Check if content needs updating due to source changes
    console.log('[CRON] Checking for content updates needed...');

    let contentUpdateAlerts = 0;
    const currentVersions = new Map(
      Object.entries(VERIFIED_SOURCES).map(([id, s]) => [id, s.year.toString()])
    );

    // Check all questions with source references
    const questionsWithSources = ALL_QUESTIONS.filter(
      (q) => q.references && q.references.length > 0
    );

    for (const question of questionsWithSources) {
      const notification = contentVersioning.checkContentUpdateNeeded(
        question.id,
        currentVersions
      );

      if (notification) {
        // Create alert for content that needs updating
        const alert = alertEngine.processContentUpdate(notification);
        if (alert) {
          contentUpdateAlerts++;
        }
      }
    }

    console.log(`[CRON] Created ${contentUpdateAlerts} content update alerts`);

    // Generate content mapping report
    const mappingReport = generateMappingReport();

    // Generate summary
    const summary = {
      timestamp: new Date().toISOString(),
      sourcesChecked: monitorReport.totalChecked,
      updatesFound: monitorReport.updatesFound,
      criticalUpdates: monitorReport.criticalUpdates.length,
      errors: monitorReport.errors,
      alertsCreated: expiringAlerts.length + monitorReport.criticalUpdates.length + contentUpdateAlerts,
      contentUpdateAlerts,
      nextChecks: monitorReport.nextChecks.slice(0, 5), // Next 5 checks
      contentMapping: {
        totalContent: mappingReport.totalContent,
        contentWithSources: mappingReport.totalContent - mappingReport.contentWithoutSources,
        contentWithoutSources: mappingReport.contentWithoutSources,
        averageSourcesPerContent: mappingReport.averageSourcesPerContent,
        mostUsedSources: mappingReport.topSources.slice(0, 5)
      }
    };

    console.log('[CRON] Source monitoring complete:', summary);

    return NextResponse.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('[CRON] Error during source monitoring:', error);

    // Create alert for monitoring failure
    alertEngine.createAlert(
      'source-updated',
      'high',
      'Källövervakning misslyckades',
      `Ett fel uppstod vid källövervakning: ${error instanceof Error ? error.message : 'Okänt fel'}`,
      [],
      'Kontrollera loggarna och kör övervakningen manuellt',
      {
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    );

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST endpoint for manual trigger with specific sources
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceIds } = body;

    if (!Array.isArray(sourceIds) || sourceIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid sourceIds array' },
        { status: 400 }
      );
    }

    const results = [];
    for (const sourceId of sourceIds) {
      const result = await sourceMonitor.checkSource(sourceId);
      results.push(result);
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}