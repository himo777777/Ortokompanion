/**
 * OrtoKompanion ST-Progression & Spaced Repetition System
 *
 * This file contains all type definitions for:
 * - SRS (Spaced Repetition System)
 * - Band A-E difficulty system
 * - Domain progression with gates
 * - Mini-OSCE assessments
 * - Daily mix generation
 */

import { Domain } from './onboarding';
import { EducationLevel } from './education';

// ==================== SRS (Spaced Repetition System) ====================

/**
 * SRS Card Types
 * Each card represents a learning item that can be repeated
 */
export type SRSCardType = 'microcase' | 'quiz' | 'pearl' | 'rx' | 'evidence' | 'beslutstraad';

/**
 * User grading scale (0-5)
 * Used to determine next interval and ease factor
 */
export type SRSGrade = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * SRS Card - the core unit of spaced repetition
 */
export interface SRSCard {
  id: string;
  domain: Domain;
  type: SRSCardType;

  // Content reference (links to actual content)
  contentId: string;

  // SRS Parameters (SM-2 inspired)
  easeFactor: number;        // EF: 1.3 - 2.5, default 2.5
  stability: number;         // S: 0-1, how well retained (0.5 = 50% chance of recall)
  interval: number;          // I: current interval in days
  dueDate: Date;             // Next review date
  difficulty: number;        // D: 0-1, intrinsic difficulty

  // History
  lastGrade: SRSGrade | null;
  lastReviewed: Date | null;
  reviewCount: number;

  // Metadata
  createdAt: Date;

  // Related Socialstyrelsen goals
  relatedGoals?: string[];

  // Sub-competencies
  competencies: SubCompetency[];

  // Leech detection
  isLeech: boolean;          // Marked as problematic after repeated failures
  failCount: number;         // Consecutive failures
}

/**
 * SRS Review Result
 * Captured after each review session
 */
export interface SRSReviewResult {
  cardId: string;
  grade: SRSGrade;
  timeSpent: number;         // seconds
  hintsUsed: number;
  timestamp: Date;

  // Calculated values
  newEaseFactor: number;
  newInterval: number;
  newDueDate: Date;
}

/**
 * Sub-competencies (cross-cutting skills)
 */
export type SubCompetency =
  | 'diagnostik'
  | 'akuta-flöden'
  | 'operativa-principer'
  | 'komplikationer'
  | 'evidens'
  | 'bildtolkning'
  | 'dokumentation'
  | 'kommunikation';

// ==================== Band System (Difficulty A-E) ====================

/**
 * Difficulty bands A-E
 * A = Easiest (supportive), E = Hardest (complex, time pressure)
 */
export type DifficultyBand = 'A' | 'B' | 'C' | 'D' | 'E';

/**
 * Band characteristics
 */
export interface BandDefinition {
  band: DifficultyBand;
  label: string;
  description: string;
  decisionPoints: number;     // Number of decision points
  hints: 'many' | 'some' | 'few' | 'minimal';
  pitfalls: 'none' | 'obvious' | 'subtle' | 'multiple';
  timeConstraint: 'none' | 'relaxed' | 'moderate' | 'tight';
  supportLevel: 'high' | 'medium' | 'low';
}

/**
 * User's current band status
 */
export interface UserBandStatus {
  currentBand: DifficultyBand;
  bandHistory: Array<{
    band: DifficultyBand;
    date: Date;
    reason: string;
  }>;
  streakAtBand: number;       // Days at current band
  lastPromotion?: Date;
  lastDemotion?: Date;

  // Performance metrics for band tuning
  recentPerformance: {
    correctRate: number;      // 0-1
    hintUsage: number;        // average hints per exercise
    timeEfficiency: number;   // 0-1, how quickly completed
    confidence: number;       // 0-1, self-reported or inferred
  };
}

/**
 * Band Adjustment Decision
 */
export interface BandAdjustment {
  fromBand: DifficultyBand;
  toBand: DifficultyBand;
  reason: string;
  date: Date;
  performanceMetrics: {
    streak: number;
    avgCorrectRate: number;
    avgHintUsage: number;
  };
}

// ==================== Domain Progression & Gates ====================

/**
 * Domain Status
 * Tracks progress within a specific domain
 */
export interface DomainStatus {
  domain: Domain;
  status: 'locked' | 'active' | 'gated' | 'completed';

  // Progress metrics
  itemsCompleted: number;
  totalItems: number;

  // Gate requirements
  gateProgress: {
    miniOSCEPassed: boolean;
    miniOSCEScore?: number;
    miniOSCEDate?: Date;

    retentionCheckPassed: boolean;
    retentionCheckDate?: Date;

    srsCardsStable: boolean;  // Last 10 cards have avg stability >= threshold
    avgStability?: number;

    complicationCasePassed: boolean; // At least 1 band-D complication case
  };

  // When unlocked and when completed
  unlockedAt?: Date;
  completedAt?: Date;

  // Next suggested domain
  nextSuggestedDomain?: Domain;
}

/**
 * Mini-OSCE Assessment
 * Short focused OSCE-like test (5-8 min, 2-3 steps)
 */
export interface MiniOSCE {
  id: string;
  domain: Domain;
  level: EducationLevel;

  // Content
  scenario: {
    title: string;
    description: string;
    duration: number;         // seconds (90-120s)
    vitalFacts: string[];
  };

  // Critical actions (2-3)
  criticalActions: OSCEAction[];

  // Assessment & dictation
  assessment: {
    question: string;
    requiredKeywords: string[];
    timeLimit: number;        // seconds (60-120s)
  };

  // Pitfall (red flag to identify)
  pitfall: {
    description: string;
    correctIdentification: string;
  };

  // Scoring rubric
  rubric: OSCERubric[];

  // Pass criteria
  passingScore: number;       // 0-1 (typically 0.8)
}

/**
 * OSCE Action (critical step)
 */
export interface OSCEAction {
  id: string;
  action: string;
  required: boolean;
  timeLimit?: number;         // seconds
  hints?: string[];
}

/**
 * OSCE Rubric Criterion
 */
export interface OSCERubric {
  criterion: string;
  maxScore: 2;                // 0, 1, or 2 points
  description: string;
  scoring: {
    '0': string;              // Description for 0 points
    '1': string;              // Description for 1 point
    '2': string;              // Description for 2 points
  };
}

/**
 * OSCE Result
 */
export interface OSCEResult {
  osceId: string;
  userId: string;
  completedAt: Date;

  // Scores per criterion
  scores: Array<{
    rubricId: number;
    score: 0 | 1 | 2;
  }>;

  // Overall
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;

  // Details
  actionsCompleted: string[];
  keywordsUsed: string[];
  pitfallIdentified: boolean;

  // Time
  timeSpent: number;          // seconds
}

/**
 * Retention Check
 * Revisit after >= 7 days to ensure knowledge retained
 */
export interface RetentionCheck {
  domainId: Domain;
  scheduledFor: Date;
  completedAt?: Date;
  passed?: boolean;

  // Sample cards to review
  cardIds: string[];
  results?: SRSReviewResult[];

  // Pass criteria: avg stability >= threshold
  requiredAvgStability: number;
  actualAvgStability?: number;
}

// ==================== Daily Mix & Scheduling ====================

/**
 * Daily Exercise Mix
 * 60% new, 20% interleaving, 20% SRS
 */
export interface DailyMix {
  date: Date;

  // New content in primary domain (60%)
  newContent: {
    domain: Domain;
    items: string[];          // Content IDs
    estimatedTime: number;    // minutes
    reasoning?: string;       // Why this content was chosen
  };

  // Interleaving from neighbor domain (20%)
  interleavingContent: {
    domain: Domain;
    items: string[];
    estimatedTime: number;
    reasoning?: string;       // Why this content was chosen
  };

  // SRS reviews due today (20%)
  srsReviews: {
    cards: SRSCard[];
    estimatedTime: number;
  };

  // Metadata
  totalEstimatedTime: number;
  targetBand: DifficultyBand;

  // Special flags
  isRecoveryDay: boolean;     // User requested easier day
  isDifficultFollowUp: boolean; // Was yesterday difficult?

  // Weak area training
  weakDomains?: Array<{ domain: Domain; accuracy: number }>; // Domains with <70% accuracy
}

/**
 * Weekly Session
 * 1x per week, 10-15 min, Mini-OSCE chain or dictation
 */
export interface WeeklySession {
  weekNumber: number;
  scheduledDate: Date;
  completedAt?: Date;

  type: 'mini-osce' | 'dictation' | 'self-assessment';

  // Content
  content: {
    osceId?: string;
    dictationPrompt?: string;
    selfAssessmentQuestions?: string[];
  };

  // Results
  result?: {
    score: number;
    timeSpent: number;
    feedback: string;
  };
}

/**
 * Monthly Checkpoint
 * Light progress check, only affects band within track
 */
export interface MonthlyCheckpoint {
  month: number;
  year: number;
  completedAt?: Date;

  // Summary stats
  stats: {
    daysActive: number;
    itemsCompleted: number;
    avgCorrectRate: number;
    avgStability: number;
    domainsCompleted: number;
  };

  // Band adjustment recommendation
  bandAdjustment?: {
    suggested: DifficultyBand;
    reason: string;
  };
}

// ==================== Domain Neighbor Map ====================

/**
 * Domain Neighbors
 * For interleaving - which domains are related
 */
export type DomainNeighborMap = Record<Domain, Domain[]>;

/**
 * Default neighbor map from spec
 */
export const DOMAIN_NEIGHBORS: DomainNeighborMap = {
  'trauma': ['axel-armbåge', 'fot-fotled', 'knä'],
  'axel-armbåge': ['hand-handled', 'sport'],
  'hand-handled': ['axel-armbåge', 'sport'],
  'höft': ['knä', 'rygg'],
  'knä': ['höft', 'sport', 'fot-fotled'],
  'fot-fotled': ['sport', 'trauma'],
  'rygg': ['höft', 'tumör'],
  'sport': ['axel-armbåge', 'knä', 'fot-fotled'],
  'tumör': ['rygg', 'höft'],
};

// ==================== User Progression State ====================

/**
 * Complete user progression state
 * This is the main state object saved to localStorage/backend
 */
export interface UserProgressionState {
  userId: string;

  // Current level and domain focus
  level: EducationLevel;
  primaryDomain: Domain;

  // Band status
  bandStatus: UserBandStatus;

  // Domain progress
  domains: Record<Domain, DomainStatus>;

  // SRS state
  srs: {
    cards: SRSCard[];
    dueToday: string[];       // Card IDs
    overdueCards: string[];   // Card IDs
    leechCards: string[];     // Card IDs marked as leeches
  };

  // Daily/Weekly/Monthly
  dailyMix?: DailyMix;
  weeklySession?: WeeklySession;
  monthlyCheckpoint?: MonthlyCheckpoint;

  // History
  history: {
    bandAdjustments: BandAdjustment[];
    osceResults: OSCEResult[];
    retentionChecks: RetentionCheck[];
  };

  // Preferences
  preferences: {
    recoveryMode: boolean;    // User requested easier content
    targetMinutesPerDay: number;
    notificationTime?: string; // HH:MM
  };

  // Timestamps
  createdAt: Date;
  lastActivity: Date;
  lastBandCheck: Date;
}

// ==================== Constants & Thresholds ====================

/**
 * SRS Algorithm Constants
 */
export const SRS_CONSTANTS = {
  // Initial values
  INITIAL_EASE_FACTOR: 2.5,
  INITIAL_INTERVAL: 1,        // days
  INITIAL_STABILITY: 0.3,

  // Ease factor bounds
  MIN_EASE_FACTOR: 1.3,
  MAX_EASE_FACTOR: 2.5,

  // Initial intervals for new cards
  NEW_CARD_INTERVALS: [1, 3, 7], // days

  // Leech detection
  LEECH_THRESHOLD: 3,         // consecutive failures

  // Stability thresholds
  MIN_STABILITY_FOR_GATE: 0.7,
  TARGET_STABILITY: 0.8,
};

/**
 * Band Promotion/Demotion Thresholds
 */
export const BAND_THRESHOLDS = {
  // Promotion criteria (move up)
  PROMOTION_STREAK: 3,        // days with good performance
  PROMOTION_CORRECT_RATE: 0.75,
  PROMOTION_MAX_HINT_USAGE: 1.5,

  // Demotion criteria (move down)
  DEMOTION_DIFFICULT_DAYS: 2,
  DEMOTION_CORRECT_RATE: 0.5,

  // Never promote/demote more than ±1 band per day
  MAX_BAND_CHANGE_PER_DAY: 1,
};

/**
 * Domain Gate Thresholds
 */
export const GATE_THRESHOLDS = {
  MINI_OSCE_PASSING_SCORE: 0.8,
  RETENTION_MIN_STABILITY: 0.7,
  RETENTION_MIN_CARDS: 10,
  COMPLICATION_CASES_REQUIRED: 1,
};

/**
 * Daily Mix Ratios
 */
export const DAILY_MIX_RATIOS = {
  NEW_CONTENT: 0.6,           // 60% new in primary domain
  INTERLEAVING: 0.2,          // 20% from neighbor domain
  SRS_REVIEW: 0.2,            // 20% spaced repetition
};

/**
 * Domain Selection Weights
 */
export const DOMAIN_SELECTION_WEIGHTS = {
  PRIMARY: 0.7,               // 70% primary domain
  NEIGHBOR: 0.2,              // 20% nearest neighbor
  LONG_TERM_RECALL: 0.1,      // 10% from earlier domain
};

// ==================== Decision Tree Types ====================

/**
 * Decision Node in a clinical decision tree
 */
export interface DecisionNode {
  id: string;
  scenario: string;
  type?: 'assessment' | 'investigation' | 'treatment' | 'monitoring';
  question?: string;
  clinicalInfo?: string;
  choices: Array<{
    id: string;
    label: string;
    text?: string;
    reasoning?: string;
    nextNodeId: string | null;
  }>;
}

/**
 * Decision Tree Case Study
 */
export interface DecisionTreeCase {
  id: string;
  title: string;
  description: string;
  domain: Domain;
  level: EducationLevel;
  startNodeId: string;
  nodes: DecisionNode[];
  outcomes: Array<{
    id: string;
    description: string;
    quality: 'optimal' | 'acceptable' | 'poor';
    feedback: string;
  }>;
}
