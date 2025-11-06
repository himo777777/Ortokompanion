/**
 * Version Storage Service
 *
 * Persistent storage for content version history using JSON file system.
 * Tracks all content updates and source version changes.
 */

import * as fs from 'fs';
import * as path from 'path';
import { ContentVersion } from '@/lib/content-versioning';

const STORAGE_DIR = path.join(process.cwd(), 'data');
const VERSIONS_FILE = path.join(STORAGE_DIR, 'version-history.json');

// Maximum number of versions to keep per content item
const MAX_VERSIONS_PER_CONTENT = 50;

/**
 * Ensure storage directory exists
 */
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Load all versions from persistent storage
 */
export function loadVersions(): Map<string, ContentVersion[]> {
  try {
    ensureStorageDir();

    if (!fs.existsSync(VERSIONS_FILE)) {
      return new Map();
    }

    const data = fs.readFileSync(VERSIONS_FILE, 'utf-8');
    const parsed = JSON.parse(data);

    // Convert to Map and restore Date objects
    const versionMap = new Map<string, ContentVersion[]>();

    Object.entries(parsed).forEach(([contentId, versions]) => {
      if (!Array.isArray(versions)) return;
      versionMap.set(
        contentId,
        versions.map((v) => ({
          ...v,
          timestamp: new Date(v.timestamp),
          sourceVersions: v.sourceVersions.map((sv: any) => ({
            ...sv,
            publicationDate: new Date(sv.publicationDate),
            capturedAt: new Date(sv.capturedAt),
          })),
        }))
      );
    });

    return versionMap;
  } catch (error) {
    console.error('[VersionStorage] Error loading versions:', error);
    return new Map();
  }
}

/**
 * Save all versions to persistent storage
 */
export function saveVersions(versions: Map<string, ContentVersion[]>): boolean {
  try {
    ensureStorageDir();

    // Convert Map to plain object for JSON serialization
    const obj: Record<string, ContentVersion[]> = {};

    versions.forEach((contentVersions, contentId) => {
      // Keep only the most recent versions per content
      obj[contentId] = contentVersions
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, MAX_VERSIONS_PER_CONTENT);
    });

    // Write with pretty formatting
    fs.writeFileSync(VERSIONS_FILE, JSON.stringify(obj, null, 2), 'utf-8');

    return true;
  } catch (error) {
    console.error('[VersionStorage] Error saving versions:', error);
    return false;
  }
}

/**
 * Add a new version for a content item
 */
export function addVersion(contentId: string, version: ContentVersion): boolean {
  const versions = loadVersions();
  const contentVersions = versions.get(contentId) || [];

  contentVersions.push(version);
  versions.set(contentId, contentVersions);

  return saveVersions(versions);
}

/**
 * Get version history for a specific content item
 */
export function getContentVersionHistory(contentId: string): ContentVersion[] {
  const versions = loadVersions();
  return versions.get(contentId) || [];
}

/**
 * Get latest version for a content item
 */
export function getLatestVersion(contentId: string): ContentVersion | null {
  const history = getContentVersionHistory(contentId);

  if (history.length === 0) {
    return null;
  }

  return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
}

/**
 * Get all content items that need review
 */
export function getContentNeedingReview(): string[] {
  const versions = loadVersions();
  const needsReview: string[] = [];

  versions.forEach((contentVersions, contentId) => {
    const latest = contentVersions.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )[0];

    if (latest && latest.status === 'review') {
      needsReview.push(contentId);
    }
  });

  return needsReview;
}

/**
 * Get version statistics
 */
export function getVersionStats(): {
  totalContent: number;
  totalVersions: number;
  contentNeedingReview: number;
  averageVersionsPerContent: number;
  recentUpdates: number; // Last 7 days
} {
  const versions = loadVersions();
  let totalVersions = 0;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  let recentUpdates = 0;

  versions.forEach((contentVersions) => {
    totalVersions += contentVersions.length;

    const hasRecentUpdate = contentVersions.some(
      (v) => v.timestamp > sevenDaysAgo
    );

    if (hasRecentUpdate) {
      recentUpdates++;
    }
  });

  return {
    totalContent: versions.size,
    totalVersions,
    contentNeedingReview: getContentNeedingReview().length,
    averageVersionsPerContent:
      versions.size > 0 ? Math.round((totalVersions / versions.size) * 10) / 10 : 0,
    recentUpdates,
  };
}

/**
 * Find content using outdated sources
 */
export function findOutdatedContent(
  currentSourceVersions: Map<string, string>
): Array<{
  contentId: string;
  contentType: string;
  currentVersion: string;
  outdatedSources: Array<{
    sourceId: string;
    usedVersion: string;
    currentVersion: string;
  }>;
}> {
  const versions = loadVersions();
  const outdated: Array<{
    contentId: string;
    contentType: string;
    currentVersion: string;
    outdatedSources: Array<{
      sourceId: string;
      usedVersion: string;
      currentVersion: string;
    }>;
  }> = [];

  versions.forEach((contentVersions, contentId) => {
    const latest = contentVersions.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )[0];

    if (!latest) return;

    const outdatedSources = latest.sourceVersions
      .filter((sv) => {
        const currentVersion = currentSourceVersions.get(sv.sourceId);
        return currentVersion && currentVersion !== sv.versionAtTime;
      })
      .map((sv) => ({
        sourceId: sv.sourceId,
        usedVersion: sv.versionAtTime,
        currentVersion: currentSourceVersions.get(sv.sourceId)!,
      }));

    if (outdatedSources.length > 0) {
      outdated.push({
        contentId,
        contentType: latest.contentType,
        currentVersion: latest.version,
        outdatedSources,
      });
    }
  });

  return outdated;
}

/**
 * Clean up old versions (keep last N versions per content)
 */
export function cleanupOldVersions(versionsToKeep: number = MAX_VERSIONS_PER_CONTENT): number {
  const versions = loadVersions();
  let removed = 0;

  versions.forEach((contentVersions, contentId) => {
    if (contentVersions.length > versionsToKeep) {
      const sorted = contentVersions.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
      const kept = sorted.slice(0, versionsToKeep);
      removed += contentVersions.length - kept.length;
      versions.set(contentId, kept);
    }
  });

  if (removed > 0) {
    saveVersions(versions);
  }

  return removed;
}

/**
 * Export version history for backup
 */
export function exportVersionHistory(): string {
  const versions = loadVersions();
  const obj: Record<string, ContentVersion[]> = {};

  versions.forEach((contentVersions, contentId) => {
    obj[contentId] = contentVersions;
  });

  return JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      contentCount: versions.size,
      versions: obj,
    },
    null,
    2
  );
}

/**
 * Import version history from backup
 */
export function importVersionHistory(jsonData: string): boolean {
  try {
    const parsed = JSON.parse(jsonData);
    const versionsObj = parsed.versions || parsed;

    if (typeof versionsObj !== 'object') {
      throw new Error('Invalid backup format');
    }

    const versions = new Map<string, ContentVersion[]>();

    Object.entries(versionsObj).forEach(([contentId, contentVersions]: [string, any]) => {
      if (Array.isArray(contentVersions)) {
        versions.set(contentId, contentVersions);
      }
    });

    return saveVersions(versions);
  } catch (error) {
    console.error('[VersionStorage] Error importing version history:', error);
    return false;
  }
}
