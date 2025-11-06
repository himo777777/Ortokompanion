/**
 * Alert Storage Service
 *
 * Persistent storage for medical quality alerts using JSON file system.
 * Provides backup/restore capabilities for alert history.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Alert } from '@/lib/alert-engine';

const STORAGE_DIR = path.join(process.cwd(), 'data');
const ALERTS_FILE = path.join(STORAGE_DIR, 'alert-history.json');

// Maximum number of alerts to keep in history
const MAX_ALERTS = 1000;

/**
 * Ensure storage directory exists
 */
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Load alerts from persistent storage
 */
export function loadAlerts(): Alert[] {
  try {
    ensureStorageDir();

    if (!fs.existsSync(ALERTS_FILE)) {
      return [];
    }

    const data = fs.readFileSync(ALERTS_FILE, 'utf-8');
    const parsed = JSON.parse(data);

    // Convert date strings back to Date objects
    return parsed.map((alert: any) => ({
      ...alert,
      createdAt: new Date(alert.createdAt),
      dueDate: alert.dueDate ? new Date(alert.dueDate) : undefined,
      acknowledgedAt: alert.acknowledgedAt ? new Date(alert.acknowledgedAt) : undefined,
      resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt) : undefined,
    }));
  } catch (error) {
    console.error('[AlertStorage] Error loading alerts:', error);
    return [];
  }
}

/**
 * Save alerts to persistent storage
 */
export function saveAlerts(alerts: Alert[]): boolean {
  try {
    ensureStorageDir();

    // Sort by creation date (newest first) and limit to MAX_ALERTS
    const sortedAlerts = [...alerts]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, MAX_ALERTS);

    // Write with pretty formatting for readability
    fs.writeFileSync(
      ALERTS_FILE,
      JSON.stringify(sortedAlerts, null, 2),
      'utf-8'
    );

    return true;
  } catch (error) {
    console.error('[AlertStorage] Error saving alerts:', error);
    return false;
  }
}

/**
 * Add a new alert to storage
 */
export function addAlert(alert: Alert): boolean {
  const alerts = loadAlerts();
  alerts.push(alert);
  return saveAlerts(alerts);
}

/**
 * Update an existing alert in storage
 */
export function updateAlert(alertId: string, updates: Partial<Alert>): boolean {
  const alerts = loadAlerts();
  const index = alerts.findIndex((a) => a.id === alertId);

  if (index === -1) {
    return false;
  }

  alerts[index] = { ...alerts[index], ...updates };
  return saveAlerts(alerts);
}

/**
 * Delete an alert from storage
 */
export function deleteAlert(alertId: string): boolean {
  const alerts = loadAlerts();
  const filtered = alerts.filter((a) => a.id !== alertId);

  if (filtered.length === alerts.length) {
    return false; // Alert not found
  }

  return saveAlerts(filtered);
}

/**
 * Get alerts statistics
 */
export function getAlertStats(): {
  total: number;
  unresolved: number;
  critical: number;
  oldestUnresolved: Date | null;
} {
  const alerts = loadAlerts();
  const unresolved = alerts.filter((a) => !a.resolved);

  return {
    total: alerts.length,
    unresolved: unresolved.length,
    critical: alerts.filter((a) => a.severity === 'critical' && !a.resolved).length,
    oldestUnresolved:
      unresolved.length > 0
        ? new Date(Math.min(...unresolved.map((a) => a.createdAt.getTime())))
        : null,
  };
}

/**
 * Clean up old resolved alerts (keep last 30 days)
 */
export function cleanupOldAlerts(daysToKeep: number = 30): number {
  const alerts = loadAlerts();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const filtered = alerts.filter((alert) => {
    // Keep unresolved alerts
    if (!alert.resolved) return true;

    // Keep recently resolved alerts
    if (alert.resolvedAt && alert.resolvedAt > cutoffDate) return true;

    return false;
  });

  const removed = alerts.length - filtered.length;
  if (removed > 0) {
    saveAlerts(filtered);
  }

  return removed;
}

/**
 * Export alerts for backup
 */
export function exportAlerts(): string {
  const alerts = loadAlerts();
  return JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      count: alerts.length,
      alerts,
    },
    null,
    2
  );
}

/**
 * Import alerts from backup
 */
export function importAlerts(jsonData: string): boolean {
  try {
    const parsed = JSON.parse(jsonData);
    const alerts = parsed.alerts || parsed;

    if (!Array.isArray(alerts)) {
      throw new Error('Invalid backup format');
    }

    return saveAlerts(alerts);
  } catch (error) {
    console.error('[AlertStorage] Error importing alerts:', error);
    return false;
  }
}
