/**
 * Source Monitoring System
 *
 * Automatically monitors Swedish and international medical sources for updates
 * using RSS feeds, APIs, and web scraping.
 */

import { SourceReference } from '@/types/verification';

export type MonitorType = 'rss' | 'api' | 'web-scrape' | 'manual';
export type CheckFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';

export interface SourceMonitor {
  sourceId: string;
  monitorType: MonitorType;
  checkUrl: string;
  checkInterval: number; // days
  lastCheck: Date | null;
  lastUpdate: Date | null;
  parser: (data: any) => Promise<SourceUpdate>;
  enabled: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface SourceUpdate {
  detected: boolean;
  newVersion?: string;
  publishDate?: Date;
  changeLog?: string;
  affectedContent?: string[]; // Content IDs that use this source
  updateType?: 'major' | 'minor' | 'patch';
  url?: string;
  checksum?: string; // For PDFs
}

export interface MonitorResult {
  sourceId: string;
  timestamp: Date;
  success: boolean;
  update?: SourceUpdate;
  error?: string;
}

export interface MonitorReport {
  totalChecked: number;
  updatesFound: number;
  errors: number;
  criticalUpdates: string[];
  nextChecks: Array<{
    sourceId: string;
    scheduledDate: Date;
  }>;
}

/**
 * Convert frequency to days
 */
export const FREQUENCY_DAYS: Record<CheckFrequency, number> = {
  'daily': 1,
  'weekly': 7,
  'monthly': 30,
  'quarterly': 90,
  'annual': 365
};

/**
 * Source monitoring configurations
 */
export class SourceMonitoringService {
  private monitors: Map<string, SourceMonitor> = new Map();
  private updateHistory: MonitorResult[] = [];

  constructor() {
    this.initializeMonitors();
  }

  /**
   * Initialize default monitors for Swedish sources
   */
  private initializeMonitors() {
    // SBU - RSS Feed
    this.addMonitor({
      sourceId: 'sbu-ortopedi-2023',
      monitorType: 'rss',
      checkUrl: 'https://www.sbu.se/sv/publikationer/feed/',
      checkInterval: 1, // Daily
      lastCheck: null,
      lastUpdate: null,
      parser: this.parseSBURSS,
      enabled: true,
      priority: 'critical'
    });

    // Socialstyrelsen - API
    this.addMonitor({
      sourceId: 'socialstyrelsen-2021',
      monitorType: 'api',
      checkUrl: 'https://www.socialstyrelsen.se/api/publications/ortopedi',
      checkInterval: 7, // Weekly
      lastCheck: null,
      lastUpdate: null,
      parser: this.parseSocialstyrelsenjson,
      enabled: true,
      priority: 'critical'
    });

    // Rikshöft - Web Scrape
    this.addMonitor({
      sourceId: 'rikshoft-2023',
      monitorType: 'web-scrape',
      checkUrl: 'https://shpr.registercentrum.se/shar-in-english/annual-reports/',
      checkInterval: 30, // Monthly
      lastCheck: null,
      lastUpdate: null,
      parser: this.parseRikshoftReports,
      enabled: true,
      priority: 'high'
    });

    // Riksknä - Web Scrape
    this.addMonitor({
      sourceId: 'rikskna-2023',
      monitorType: 'web-scrape',
      checkUrl: 'https://www.knee.registercentrum.se/arsrapporter/',
      checkInterval: 30, // Monthly
      lastCheck: null,
      lastUpdate: null,
      parser: this.parseRiksknaReports,
      enabled: true,
      priority: 'high'
    });

    // SVORF - Web Scrape
    this.addMonitor({
      sourceId: 'svorf-handbook-2023',
      monitorType: 'web-scrape',
      checkUrl: 'https://svorf.se/dokument/handbok',
      checkInterval: 30, // Monthly
      lastCheck: null,
      lastUpdate: null,
      parser: this.parseSVORFHandbook,
      enabled: true,
      priority: 'high'
    });

    // Läkemedelsverket - Web Scrape
    this.addMonitor({
      sourceId: 'lakemedelsveket-ortopedi-2023',
      monitorType: 'web-scrape',
      checkUrl: 'https://www.lakemedelsverket.se/sv/behandling-och-forskrivning/behandlingsrekommendationer',
      checkInterval: 30, // Monthly
      lastCheck: null,
      lastUpdate: null,
      parser: this.parseLakemedelsverket,
      enabled: true,
      priority: 'medium'
    });

    // Karolinska - Web Scrape
    this.addMonitor({
      sourceId: 'karolinska-ortopedi-2023',
      monitorType: 'web-scrape',
      checkUrl: 'https://www.karolinska.se/for-vardgivare/tema/rorelseapparaten/ortopedi/',
      checkInterval: 7, // Weekly
      lastCheck: null,
      lastUpdate: null,
      parser: this.parseKarolinska,
      enabled: true,
      priority: 'high'
    });
  }

  /**
   * Add a new monitor
   */
  addMonitor(monitor: SourceMonitor) {
    this.monitors.set(monitor.sourceId, monitor);
  }

  /**
   * Check if a source needs monitoring
   */
  needsCheck(sourceId: string): boolean {
    const monitor = this.monitors.get(sourceId);
    if (!monitor || !monitor.enabled) return false;

    if (!monitor.lastCheck) return true;

    const daysSinceLastCheck = Math.floor(
      (Date.now() - monitor.lastCheck.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceLastCheck >= monitor.checkInterval;
  }

  /**
   * Check a single source for updates
   */
  async checkSource(sourceId: string): Promise<MonitorResult> {
    const monitor = this.monitors.get(sourceId);
    if (!monitor) {
      return {
        sourceId,
        timestamp: new Date(),
        success: false,
        error: 'Monitor not found'
      };
    }

    try {
      let data: any;

      // Fetch data based on monitor type
      switch (monitor.monitorType) {
        case 'rss':
          data = await this.fetchRSS(monitor.checkUrl);
          break;
        case 'api':
          data = await this.fetchAPI(monitor.checkUrl);
          break;
        case 'web-scrape':
          data = await this.scrapeWebsite(monitor.checkUrl);
          break;
        default:
          throw new Error(`Unsupported monitor type: ${monitor.monitorType}`);
      }

      // Parse the data
      const update = await monitor.parser(data);

      // Update monitor state
      monitor.lastCheck = new Date();
      if (update.detected) {
        monitor.lastUpdate = new Date();
      }

      // Store result
      const result: MonitorResult = {
        sourceId,
        timestamp: new Date(),
        success: true,
        update
      };

      this.updateHistory.push(result);
      return result;

    } catch (error) {
      const result: MonitorResult = {
        sourceId,
        timestamp: new Date(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.updateHistory.push(result);
      return result;
    }
  }

  /**
   * Check all sources that need updating
   */
  async checkAllSources(): Promise<MonitorReport> {
    const sourcesToCheck = Array.from(this.monitors.keys()).filter(id => this.needsCheck(id));
    const results: MonitorResult[] = [];
    const criticalUpdates: string[] = [];

    for (const sourceId of sourcesToCheck) {
      const result = await this.checkSource(sourceId);
      results.push(result);

      if (result.success && result.update?.detected) {
        const monitor = this.monitors.get(sourceId);
        if (monitor?.priority === 'critical') {
          criticalUpdates.push(sourceId);
        }
      }
    }

    // Calculate next checks
    const nextChecks = Array.from(this.monitors.entries())
      .map(([sourceId, monitor]) => ({
        sourceId,
        scheduledDate: this.calculateNextCheck(monitor)
      }))
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
      .slice(0, 10); // Top 10 upcoming

    return {
      totalChecked: results.length,
      updatesFound: results.filter(r => r.update?.detected).length,
      errors: results.filter(r => !r.success).length,
      criticalUpdates,
      nextChecks
    };
  }

  /**
   * Calculate next check date for a monitor
   */
  private calculateNextCheck(monitor: SourceMonitor): Date {
    const lastCheck = monitor.lastCheck || new Date();
    const nextCheck = new Date(lastCheck);
    nextCheck.setDate(nextCheck.getDate() + monitor.checkInterval);
    return nextCheck;
  }

  /**
   * Fetch RSS feed
   */
  private async fetchRSS(url: string): Promise<any> {
    const response = await fetch(url);
    const text = await response.text();
    // Parse RSS XML - simplified for now
    return { raw: text, url };
  }

  /**
   * Fetch from API
   */
  private async fetchAPI(url: string): Promise<any> {
    const response = await fetch(url);
    return await response.json();
  }

  /**
   * Scrape website (placeholder - needs implementation)
   */
  private async scrapeWebsite(url: string): Promise<any> {
    // In production, this would use Puppeteer or Playwright
    // For now, just fetch HTML
    const response = await fetch(url);
    const html = await response.text();
    return { html, url };
  }

  // Parser functions for each source

  private async parseSBURSS(data: any): Promise<SourceUpdate> {
    // Parse SBU RSS feed for orthopaedic updates
    const orthoKeywords = ['ortoped', 'fraktur', 'protese', 'artros', 'rygg'];
    const hasOrthoUpdate = orthoKeywords.some(keyword =>
      data.raw?.toLowerCase().includes(keyword)
    );

    return {
      detected: hasOrthoUpdate,
      newVersion: hasOrthoUpdate ? new Date().toISOString() : undefined,
      publishDate: hasOrthoUpdate ? new Date() : undefined,
      updateType: hasOrthoUpdate ? 'minor' : undefined
    };
  }

  private async parseSocialstyrelsenjson(data: any): Promise<SourceUpdate> {
    // Parse Socialstyrelsen API response
    const latestPublication = data.publications?.[0];
    const isNew = latestPublication?.date > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return {
      detected: isNew,
      newVersion: latestPublication?.version,
      publishDate: latestPublication?.date ? new Date(latestPublication.date) : undefined,
      changeLog: latestPublication?.summary,
      updateType: latestPublication?.type === 'major' ? 'major' : 'minor'
    };
  }

  private async parseRikshoftReports(data: any): Promise<SourceUpdate> {
    // Check for new annual report (usually published in September/October)
    const currentYear = new Date().getFullYear();
    const hasNewReport = data.html?.includes(`Årsrapport ${currentYear}`);

    return {
      detected: hasNewReport,
      newVersion: hasNewReport ? `${currentYear}` : undefined,
      publishDate: hasNewReport ? new Date(currentYear, 9, 1) : undefined, // October
      updateType: hasNewReport ? 'major' : undefined
    };
  }

  private async parseRiksknaReports(data: any): Promise<SourceUpdate> {
    // Similar to Rikshöft
    const currentYear = new Date().getFullYear();
    const hasNewReport = data.html?.includes(`${currentYear}`) && data.html?.includes('årsrapport');

    return {
      detected: hasNewReport,
      newVersion: hasNewReport ? `${currentYear}` : undefined,
      publishDate: hasNewReport ? new Date(currentYear, 9, 1) : undefined,
      updateType: hasNewReport ? 'major' : undefined
    };
  }

  private async parseSVORFHandbook(data: any): Promise<SourceUpdate> {
    // Check for handbook updates
    const hasUpdate = data.html?.includes('Uppdaterad') || data.html?.includes('Reviderad');

    return {
      detected: hasUpdate,
      updateType: hasUpdate ? 'minor' : undefined
    };
  }

  private async parseLakemedelsverket(data: any): Promise<SourceUpdate> {
    // Check for new recommendations
    const hasOrthoUpdate = data.html?.includes('ortoped') && data.html?.includes('uppdater');

    return {
      detected: hasOrthoUpdate,
      updateType: hasOrthoUpdate ? 'minor' : undefined
    };
  }

  private async parseKarolinska(data: any): Promise<SourceUpdate> {
    // Check for PM updates
    const hasUpdate = data.html?.includes('Nytt PM') || data.html?.includes('Uppdaterat PM');

    return {
      detected: hasUpdate,
      updateType: hasUpdate ? 'minor' : undefined
    };
  }

  /**
   * Get monitoring status for all sources
   */
  getMonitoringStatus(): Map<string, {
    enabled: boolean;
    lastCheck: Date | null;
    lastUpdate: Date | null;
    nextCheck: Date;
    priority: string;
  }> {
    const status = new Map();

    this.monitors.forEach((monitor, sourceId) => {
      status.set(sourceId, {
        enabled: monitor.enabled,
        lastCheck: monitor.lastCheck,
        lastUpdate: monitor.lastUpdate,
        nextCheck: this.calculateNextCheck(monitor),
        priority: monitor.priority
      });
    });

    return status;
  }

  /**
   * Get update history
   */
  getUpdateHistory(limit = 100): MonitorResult[] {
    return this.updateHistory.slice(-limit);
  }
}

// Export singleton instance
export const sourceMonitor = new SourceMonitoringService();