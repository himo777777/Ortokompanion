/**
 * Content Verification & Quality Control System
 * Ensures all medical information is 100% correct and up-to-date
 */

export type SourceType =
  | 'clinical-guideline'      // NICE, SKR, BOAST, etc.
  | 'textbook'                // Campbell's, Green's, Rockwood, etc.
  | 'journal-article'         // Peer-reviewed publications
  | 'registry-data'           // Rikshöft, RIKSKNA, etc.
  | 'classification-system'   // Gartland, Weber, Paprosky, etc.
  | 'previous-exam'           // Past exam questions
  | 'expert-consensus'        // Expert panel consensus
  | 'clinical-trial';         // RCT, systematic review

export type VerificationStatus =
  | 'verified'       // Expert verified, up-to-date
  | 'pending'        // Awaiting verification
  | 'needs-review'   // Flagged for review
  | 'outdated'       // Source outdated, needs update
  | 'deprecated';    // No longer valid

export type ReviewLevel =
  | 'peer-review'    // Reviewed by another physician
  | 'expert-review'  // Reviewed by specialist/consultant
  | 'ai-assisted'    // AI-verified against sources
  | 'automated'      // Automated checks passed
  | 'unreviewed';    // Not yet reviewed

export interface SourceReference {
  id: string;
  type: SourceType;
  title: string;
  author?: string;
  year: number;
  edition?: string;
  doi?: string;
  url?: string;
  pages?: string;

  // Journal-specific fields
  journal?: string;
  volume?: string;
  issue?: string;
  publisher?: string;

  // Verification metadata
  verificationStatus: VerificationStatus;
  lastVerified: Date;
  verifiedBy?: string;  // User ID or "AI"

  // Freshness tracking
  publicationDate: Date;
  expirationDate?: Date;  // When this source should be reviewed
  updateFrequency?: 'annual' | 'biannual' | 'as-needed';

  // Quality metrics
  evidenceLevel?: '1A' | '1B' | '2A' | '2B' | '3' | '4' | '5';
  reliability: number;  // 0-100
}

export interface ContentVerification {
  contentId: string;
  contentType: 'question' | 'case' | 'module' | 'explanation';

  // Verification status
  verificationStatus: VerificationStatus;
  reviewLevel: ReviewLevel;
  qualityScore: number;  // 0-100

  // Source validation
  sources: SourceReference[];
  primarySource: SourceReference;
  conflictingSources?: string[];  // IDs of sources with conflicting info

  // Review tracking
  createdDate: Date;
  lastReviewDate: Date;
  nextReviewDate: Date;
  reviewHistory: VerificationReview[];

  // Flags and issues
  flags: ContentFlag[];
  accuracyConfidence: number;  // 0-100
}

export interface VerificationReview {
  reviewId: string;
  reviewDate: Date;
  reviewedBy: string;
  reviewLevel: ReviewLevel;
  previousStatus: VerificationStatus;
  newStatus: VerificationStatus;
  changes?: string;
  notes?: string;
  sourcesChecked: string[];  // Source IDs verified
}

export interface ContentFlag {
  flagId: string;
  flagType:
    | 'outdated-source'
    | 'conflicting-information'
    | 'missing-citation'
    | 'unclear-explanation'
    | 'incorrect-answer'
    | 'needs-update';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  flaggedDate: Date;
  flaggedBy: string;  // User ID or "automated"
  resolved: boolean;
  resolvedDate?: Date;
  resolvedBy?: string;
}

export interface QualityMetrics {
  totalContent: number;
  verifiedContent: number;
  needsReview: number;
  outdated: number;
  averageQualityScore: number;
  averageSourceReliability: number;

  // By category
  byDomain: Record<string, {
    total: number;
    verified: number;
    averageQuality: number;
  }>;

  bySourceType: Record<SourceType, number>;

  // Freshness
  contentWithinDate: number;
  contentNearingExpiration: number;
  expiredContent: number;
}

export interface VerificationAlert {
  alertId: string;
  type:
    | 'content-expiring'
    | 'source-outdated'
    | 'conflicting-sources'
    | 'low-quality-score'
    | 'missing-verification';
  severity: 'info' | 'warning' | 'critical';
  contentIds: string[];
  message: string;
  createdDate: Date;
  dismissed: boolean;
}
