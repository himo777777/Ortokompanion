/**
 * Monitoring Log Service
 *
 * Persistent storage for source monitoring results using rotating JSON log.
 * Keeps last N monitoring runs for audit and debugging purposes.
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../logger';

const STORAGE_DIR = path.join(process.cwd(), 'data');
const LOG_FILE = path.join(STORAGE_DIR, 'monitoring-log.json');

// Maximum number of monitoring runs to keep
const MAX_LOG_ENTRIES = 1000;

export interface MonitoringLogEntry {
  timestamp: Date;
  sourcesChecked: number;
  updatesFound: number;
  criticalUpdates: number;
  errors: number;
  alertsCreated: number;
  contentUpdateAlerts?: number;
  duration: number; // in milliseconds
  status: 'success' | 'partial' | 'failed';
  details?: {
    sourceResults?: Array<{
      sourceId: string;
      status: 'updated' | 'unchanged' | 'error';
      message?: string;
    }>;
    errorMessages?: string[];
  };
}

/**
 * Ensure storage directory exists
 */
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Load monitoring log from storage
 */
export function loadMonitoringLog(): MonitoringLogEntry[] {
  try {
    ensureStorageDir();

    if (!fs.existsSync(LOG_FILE)) {
      return [];
    }

    const data = fs.readFileSync(LOG_FILE, 'utf-8');
    const parsed = JSON.parse(data);

    // Convert date strings back to Date objects
    return parsed.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));
  } catch (error) {
    logger.error('Failed to load monitoring log', error);
    return [];
  }
}

/**
 * Save monitoring log to storage
 */
export function saveMonitoringLog(log: MonitoringLogEntry[]): boolean {
  try {
    ensureStorageDir();

    // Sort by timestamp (newest first) and limit to MAX_LOG_ENTRIES
    const sortedLog = [...log]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, MAX_LOG_ENTRIES);

    fs.writeFileSync(LOG_FILE, JSON.stringify(sortedLog, null, 2), 'utf-8');

    return true;
  } catch (error) {
    logger.error('Failed to save monitoring log', error);
    return false;
  }
}

/**
 * Add a new monitoring entry to the log
 */
export function addMonitoringEntry(entry: MonitoringLogEntry): boolean {
  const log = loadMonitoringLog();
  log.push(entry);
  return saveMonitoringLog(log);
}

/**
 * Get monitoring statistics
 */
export function getMonitoringStats(): {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  lastRun: Date | null;
  averageDuration: number;
  totalUpdatesFound: number;
  totalAlertsCreated: number;
} {
  const log = loadMonitoringLog();

  if (log.length === 0) {
    return {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastRun: null,
      averageDuration: 0,
      totalUpdatesFound: 0,
      totalAlertsCreated: 0,
    };
  }

  const totalDuration = log.reduce((sum, entry) => sum + entry.duration, 0);

  return {
    totalRuns: log.length,
    successfulRuns: log.filter((e) => e.status === 'success').length,
    failedRuns: log.filter((e) => e.status === 'failed').length,
    lastRun: log[0]?.timestamp || null,
    averageDuration: Math.round(totalDuration / log.length),
    totalUpdatesFound: log.reduce((sum, e) => sum + e.updatesFound, 0),
    totalAlertsCreated: log.reduce((sum, e) => sum + e.alertsCreated, 0),
  };
}

/**
 * Get recent monitoring runs (last N days)
 */
export function getRecentRuns(days: number = 7): MonitoringLogEntry[] {
  const log = loadMonitoringLog();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return log.filter((entry) => entry.timestamp >= cutoffDate);
}

/**
 * Get failed monitoring runs
 */
export function getFailedRuns(): MonitoringLogEntry[] {
  const log = loadMonitoringLog();
  return log.filter((entry) => entry.status === 'failed');
}

/**
 * Get monitoring trend (daily aggregates)
 */
export function getMonitoringTrend(days: number = 30): Array<{
  date: string;
  runs: number;
  updatesFound: number;
  alertsCreated: number;
  averageDuration: number;
}> {
  const log = loadMonitoringLog();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentRuns = log.filter((entry) => entry.timestamp >= cutoffDate);

  // Group by date
  const dailyData = new Map<string, MonitoringLogEntry[]>();

  recentRuns.forEach((entry) => {
    const dateKey = entry.timestamp.toISOString().split('T')[0];
    if (!dailyData.has(dateKey)) {
      dailyData.set(dateKey, []);
    }
    dailyData.get(dateKey)!.push(entry);
  });

  // Calculate aggregates
  const trend: Array<{
    date: string;
    runs: number;
    updatesFound: number;
    alertsCreated: number;
    averageDuration: number;
  }> = [];

  dailyData.forEach((entries, date) => {
    const totalDuration = entries.reduce((sum, e) => sum + e.duration, 0);

    trend.push({
      date,
      runs: entries.length,
      updatesFound: entries.reduce((sum, e) => sum + e.updatesFound, 0),
      alertsCreated: entries.reduce((sum, e) => sum + e.alertsCreated, 0),
      averageDuration: Math.round(totalDuration / entries.length),
    });
  });

  return trend.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Check if monitoring is overdue (based on expected schedule)
 */
export function isMonitoringOverdue(expectedIntervalHours: number = 24): boolean {
  const log = loadMonitoringLog();

  if (log.length === 0) {
    return true; // No runs yet
  }

  const lastRun = log[0].timestamp;
  const now = new Date();
  const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60);

  return hoursSinceLastRun > expectedIntervalHours;
}

/**
 * Get monitoring health status
 */
export function getMonitoringHealth(): {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  lastRun: Date | null;
  recentFailures: number;
  isOverdue: boolean;
} {
  const log = loadMonitoringLog();

  if (log.length === 0) {
    return {
      status: 'critical',
      message: 'No monitoring runs recorded',
      lastRun: null,
      recentFailures: 0,
      isOverdue: true,
    };
  }

  const recentRuns = getRecentRuns(7);
  const recentFailures = recentRuns.filter((e) => e.status === 'failed').length;
  const isOverdue = isMonitoringOverdue(26); // Allow 2 hour grace period

  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  let message = 'Monitoring is running normally';

  if (isOverdue) {
    status = 'critical';
    message = 'Monitoring is overdue (no runs in last 26 hours)';
  } else if (recentFailures >= 3) {
    status = 'critical';
    message = `${recentFailures} failed runs in last 7 days`;
  } else if (recentFailures > 0) {
    status = 'warning';
    message = `${recentFailures} failed run(s) in last 7 days`;
  }

  return {
    status,
    message,
    lastRun: log[0].timestamp,
    recentFailures,
    isOverdue,
  };
}

/**
 * Clean up old log entries (keep last N entries)
 */
export function cleanupOldLogEntries(entriesToKeep: number = MAX_LOG_ENTRIES): number {
  const log = loadMonitoringLog();

  if (log.length <= entriesToKeep) {
    return 0;
  }

  const sorted = log.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const kept = sorted.slice(0, entriesToKeep);
  const removed = log.length - kept.length;

  saveMonitoringLog(kept);

  return removed;
}

/**
 * Export monitoring log for backup
 */
export function exportMonitoringLog(): string {
  const log = loadMonitoringLog();
  return JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      entryCount: log.length,
      log,
    },
    null,
    2
  );
}

/**
 * Import monitoring log from backup
 */
export function importMonitoringLog(jsonData: string): boolean {
  try {
    const parsed = JSON.parse(jsonData);
    const log = parsed.log || parsed;

    if (!Array.isArray(log)) {
      throw new Error('Invalid backup format');
    }

    return saveMonitoringLog(log);
  } catch (error) {
    logger.error('Failed to import monitoring log', error);
    return false;
  }
}
