/**
 * Content Versioning System
 *
 * Tracks which version of medical guidelines each piece of content is based on
 * and maintains a complete audit trail of changes.
 */

import { MCQQuestion } from '@/data/questions';
import { UnifiedClinicalCase } from '@/types/clinical-cases';

export interface ContentVersion {
  contentId: string;
  contentType: 'question' | 'case' | 'module' | 'guideline';
  version: string; // Semantic versioning: 1.0.0
  timestamp: Date;
  changes: VersionChange[];
  sourceVersions: SourceVersionSnapshot[];
  approvedBy?: string;
  publishedBy?: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  reviewNotes?: string;
}

export interface SourceVersionSnapshot {
  sourceId: string;
  sourceTitle: string;
  versionAtTime: string;
  publicationDate: Date;
  url?: string;
  checksum?: string; // For PDFs/static documents
  pageReferences?: string[]; // Specific pages/sections referenced
}

export interface VersionChange {
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
  sourceReference: string;
  changeType: 'content' | 'reference' | 'correction' | 'clarification' | 'update';
  impact: 'major' | 'minor' | 'patch';
}

export interface VersionMetadata {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
}

export interface VersionComparisonResult {
  fromVersion: string;
  toVersion: string;
  changes: VersionChange[];
  sourcesAdded: string[];
  sourcesRemoved: string[];
  sourcesUpdated: string[];
  impactLevel: 'major' | 'minor' | 'patch';
  requiresReview: boolean;
}

export interface ContentUpdateNotification {
  contentId: string;
  contentType: string;
  currentVersion: string;
  sourceUpdates: Array<{
    sourceId: string;
    oldVersion: string;
    newVersion: string;
    updateType: 'major' | 'minor' | 'patch';
  }>;
  recommendedAction: 'immediate-review' | 'scheduled-review' | 'monitor' | 'no-action';
  priority: 'critical' | 'high' | 'medium' | 'low';
  deadline?: Date;
}

/**
 * Versioning service for content management
 */
export class ContentVersioningService {
  private versionHistory: Map<string, ContentVersion[]> = new Map();
  private sourceSnapshots: Map<string, SourceVersionSnapshot[]> = new Map();

  /**
   * Parse semantic version string
   */
  parseVersion(version: string): VersionMetadata {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+?))?(?:\+(.+))?$/);
    if (!match) {
      throw new Error(`Invalid version format: ${version}`);
    }

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4],
      build: match[5]
    };
  }

  /**
   * Create semantic version string
   */
  createVersion(metadata: VersionMetadata): string {
    let version = `${metadata.major}.${metadata.minor}.${metadata.patch}`;
    if (metadata.prerelease) {
      version += `-${metadata.prerelease}`;
    }
    if (metadata.build) {
      version += `+${metadata.build}`;
    }
    return version;
  }

  /**
   * Increment version based on change type
   */
  incrementVersion(currentVersion: string, changeType: 'major' | 'minor' | 'patch'): string {
    const metadata = this.parseVersion(currentVersion);

    switch (changeType) {
      case 'major':
        metadata.major++;
        metadata.minor = 0;
        metadata.patch = 0;
        break;
      case 'minor':
        metadata.minor++;
        metadata.patch = 0;
        break;
      case 'patch':
        metadata.patch++;
        break;
    }

    // Clear prerelease and build for new versions
    metadata.prerelease = undefined;
    metadata.build = undefined;

    return this.createVersion(metadata);
  }

  /**
   * Create a new version of content
   */
  createContentVersion(
    contentId: string,
    contentType: ContentVersion['contentType'],
    changes: VersionChange[],
    sourceVersions: SourceVersionSnapshot[],
    previousVersion?: string
  ): ContentVersion {
    // Determine impact level
    const impactLevel = this.determineImpactLevel(changes);

    // Calculate new version
    const newVersion = previousVersion
      ? this.incrementVersion(previousVersion, impactLevel)
      : '1.0.0';

    const contentVersion: ContentVersion = {
      contentId,
      contentType,
      version: newVersion,
      timestamp: new Date(),
      changes,
      sourceVersions,
      status: 'draft'
    };

    // Store in history
    if (!this.versionHistory.has(contentId)) {
      this.versionHistory.set(contentId, []);
    }
    this.versionHistory.get(contentId)!.push(contentVersion);

    return contentVersion;
  }

  /**
   * Determine impact level based on changes
   */
  private determineImpactLevel(changes: VersionChange[]): 'major' | 'minor' | 'patch' {
    if (changes.some(c => c.impact === 'major')) return 'major';
    if (changes.some(c => c.impact === 'minor')) return 'minor';
    return 'patch';
  }

  /**
   * Take snapshot of current source versions
   */
  createSourceSnapshot(
    sourceId: string,
    sourceTitle: string,
    version: string,
    publicationDate: Date,
    url?: string,
    pageReferences?: string[]
  ): SourceVersionSnapshot {
    const snapshot: SourceVersionSnapshot = {
      sourceId,
      sourceTitle,
      versionAtTime: version,
      publicationDate,
      url,
      pageReferences
    };

    // Calculate checksum if URL is provided (simplified)
    if (url) {
      snapshot.checksum = this.calculateChecksum(url + version);
    }

    // Store snapshot
    if (!this.sourceSnapshots.has(sourceId)) {
      this.sourceSnapshots.set(sourceId, []);
    }
    this.sourceSnapshots.get(sourceId)!.push(snapshot);

    return snapshot;
  }

  /**
   * Simple checksum calculation (in production, use crypto)
   */
  private calculateChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Compare two versions of content
   */
  compareVersions(
    contentId: string,
    fromVersion: string,
    toVersion: string
  ): VersionComparisonResult | null {
    const history = this.versionHistory.get(contentId);
    if (!history) return null;

    const fromContent = history.find(v => v.version === fromVersion);
    const toContent = history.find(v => v.version === toVersion);

    if (!fromContent || !toContent) return null;

    // Find source differences
    const fromSources = new Set(fromContent.sourceVersions.map(s => s.sourceId));
    const toSources = new Set(toContent.sourceVersions.map(s => s.sourceId));

    const sourcesAdded = Array.from(toSources).filter(s => !fromSources.has(s));
    const sourcesRemoved = Array.from(fromSources).filter(s => !toSources.has(s));

    // Find updated sources
    const sourcesUpdated = fromContent.sourceVersions
      .filter(fs => {
        const toSource = toContent.sourceVersions.find(ts => ts.sourceId === fs.sourceId);
        return toSource && toSource.versionAtTime !== fs.versionAtTime;
      })
      .map(s => s.sourceId);

    // Collect all changes between versions
    const changes: VersionChange[] = [];
    const fromIndex = history.indexOf(fromContent);
    const toIndex = history.indexOf(toContent);

    for (let i = fromIndex + 1; i <= toIndex; i++) {
      changes.push(...history[i].changes);
    }

    const impactLevel = this.determineImpactLevel(changes);
    const requiresReview = impactLevel === 'major' ||
      sourcesAdded.length > 0 ||
      sourcesRemoved.length > 0;

    return {
      fromVersion,
      toVersion,
      changes,
      sourcesAdded,
      sourcesRemoved,
      sourcesUpdated,
      impactLevel,
      requiresReview
    };
  }

  /**
   * Check if content needs update based on source changes
   */
  checkContentUpdateNeeded(
    contentId: string,
    currentSourceVersions: Map<string, string>
  ): ContentUpdateNotification | null {
    const history = this.versionHistory.get(contentId);
    if (!history || history.length === 0) return null;

    const latestVersion = history[history.length - 1];
    const sourceUpdates: ContentUpdateNotification['sourceUpdates'] = [];

    // Check each source for updates
    for (const snapshot of latestVersion.sourceVersions) {
      const currentVersion = currentSourceVersions.get(snapshot.sourceId);
      if (currentVersion && currentVersion !== snapshot.versionAtTime) {
        // Determine update type based on version difference
        const updateType = this.compareSourceVersions(snapshot.versionAtTime, currentVersion);
        sourceUpdates.push({
          sourceId: snapshot.sourceId,
          oldVersion: snapshot.versionAtTime,
          newVersion: currentVersion,
          updateType
        });
      }
    }

    if (sourceUpdates.length === 0) return null;

    // Determine recommended action and priority
    const hasMajorUpdate = sourceUpdates.some(u => u.updateType === 'major');
    const hasSwedishUpdate = sourceUpdates.some(u =>
      u.sourceId.includes('socialstyrelsen') ||
      u.sourceId.includes('sbu') ||
      u.sourceId.includes('svorf') ||
      u.sourceId.includes('riks')
    );

    let recommendedAction: ContentUpdateNotification['recommendedAction'];
    let priority: ContentUpdateNotification['priority'];
    let deadline: Date | undefined;

    if (hasMajorUpdate && hasSwedishUpdate) {
      recommendedAction = 'immediate-review';
      priority = 'critical';
      deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    } else if (hasMajorUpdate || hasSwedishUpdate) {
      recommendedAction = 'scheduled-review';
      priority = 'high';
      deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
    } else if (sourceUpdates.length > 2) {
      recommendedAction = 'scheduled-review';
      priority = 'medium';
      deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    } else {
      recommendedAction = 'monitor';
      priority = 'low';
    }

    return {
      contentId,
      contentType: latestVersion.contentType,
      currentVersion: latestVersion.version,
      sourceUpdates,
      recommendedAction,
      priority,
      deadline
    };
  }

  /**
   * Compare source versions to determine update type
   */
  private compareSourceVersions(oldVersion: string, newVersion: string): 'major' | 'minor' | 'patch' {
    try {
      const old = this.parseVersion(oldVersion);
      const new_ = this.parseVersion(newVersion);

      if (new_.major > old.major) return 'major';
      if (new_.minor > old.minor) return 'minor';
      return 'patch';
    } catch {
      // If not semantic versioning, use date comparison
      const oldDate = new Date(oldVersion);
      const newDate = new Date(newVersion);
      const daysDiff = Math.abs((newDate.getTime() - oldDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff > 365) return 'major';
      if (daysDiff > 90) return 'minor';
      return 'patch';
    }
  }

  /**
   * Get version history for content
   */
  getVersionHistory(contentId: string): ContentVersion[] {
    return this.versionHistory.get(contentId) || [];
  }

  /**
   * Get latest version for content
   */
  getLatestVersion(contentId: string): ContentVersion | null {
    const history = this.versionHistory.get(contentId);
    return history && history.length > 0 ? history[history.length - 1] : null;
  }

  /**
   * Approve a version
   */
  approveVersion(contentId: string, version: string, approvedBy: string): boolean {
    const history = this.versionHistory.get(contentId);
    if (!history) return false;

    const versionToApprove = history.find(v => v.version === version);
    if (!versionToApprove) return false;

    versionToApprove.approvedBy = approvedBy;
    versionToApprove.status = 'approved';
    return true;
  }

  /**
   * Publish a version
   */
  publishVersion(contentId: string, version: string, publishedBy: string): boolean {
    const history = this.versionHistory.get(contentId);
    if (!history) return false;

    const versionToPublish = history.find(v => v.version === version);
    if (!versionToPublish || versionToPublish.status !== 'approved') return false;

    versionToPublish.publishedBy = publishedBy;
    versionToPublish.status = 'published';
    return true;
  }

  /**
   * Archive old versions
   */
  archiveOldVersions(contentId: string, keepCount = 5): number {
    const history = this.versionHistory.get(contentId);
    if (!history || history.length <= keepCount) return 0;

    let archived = 0;
    const publishedVersions = history.filter(v => v.status === 'published');

    // Keep the latest keepCount published versions
    const versionsToKeep = publishedVersions.slice(-keepCount);
    const versionsToArchive = history.filter(v =>
      v.status === 'published' &&
      !versionsToKeep.includes(v) &&
      v.timestamp < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Older than 1 year
    );

    for (const version of versionsToArchive) {
      version.status = 'archived';
      archived++;
    }

    return archived;
  }

  /**
   * Generate version audit report
   */
  generateAuditReport(): {
    totalContent: number;
    totalVersions: number;
    contentWithMultipleVersions: number;
    averageVersionsPerContent: number;
    oldestVersion: Date | null;
    newestVersion: Date | null;
    contentNeedingReview: string[];
  } {
    let totalVersions = 0;
    let oldestVersion: Date | null = null;
    let newestVersion: Date | null = null;
    const contentNeedingReview: string[] = [];

    this.versionHistory.forEach((versions, contentId) => {
      totalVersions += versions.length;

      versions.forEach(v => {
        if (!oldestVersion || v.timestamp < oldestVersion) {
          oldestVersion = v.timestamp;
        }
        if (!newestVersion || v.timestamp > newestVersion) {
          newestVersion = v.timestamp;
        }

        if (v.status === 'draft' || v.status === 'review') {
          contentNeedingReview.push(contentId);
        }
      });
    });

    const totalContent = this.versionHistory.size;
    const contentWithMultipleVersions = Array.from(this.versionHistory.values())
      .filter(versions => versions.length > 1).length;

    return {
      totalContent,
      totalVersions,
      contentWithMultipleVersions,
      averageVersionsPerContent: totalContent > 0 ? totalVersions / totalContent : 0,
      oldestVersion,
      newestVersion,
      contentNeedingReview: [...new Set(contentNeedingReview)]
    };
  }
}

// Export singleton instance
export const contentVersioning = new ContentVersioningService();