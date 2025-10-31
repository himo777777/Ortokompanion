/**
 * Integrated Types for OrtoKompanion
 * Combines v2.0 features with ST-Progression & SRS system
 */

import {
  UserProfile,
  Domain,
  SevenDayPlan,
  PlanItem,
} from './onboarding';
import { EducationLevel } from './education';
import {
  UserBandStatus,
  DomainStatus,
  SRSCard,
  BandAdjustment,
  OSCEResult,
  RetentionCheck,
  DailyMix,
} from './progression';

/**
 * Progress tracking for individual Socialstyrelsen goals
 */
export interface MålProgress {
  goalId: string;
  completedCriteria: number[];
  totalCriteria: number;
  lastUpdated: Date;
  achieved: boolean;
}

/**
 * Enhanced UserProfile that integrates all systems
 * Extends the base UserProfile with progression tracking
 */
export interface IntegratedUserProfile extends UserProfile {
  // Progression System
  progression: {
    primaryDomain: Domain;
    bandStatus: UserBandStatus;
    domainStatuses: Record<Domain, DomainStatus>;
    srs: {
      cards: SRSCard[];
      dueToday: string[];
      overdueCards: string[];
      leechCards: string[];
    };
    history: {
      bandAdjustments: BandAdjustment[];
      osceResults: OSCEResult[];
      retentionChecks: RetentionCheck[];
    };
  };

  // Enhanced Gamification
  gamification: {
    xp: number;
    level: number;
    badges: string[];
    streak: number;
    lastActivity?: Date;
    freezeTokens: number; // New: streak protection
  };

  // Socialstyrelsen Progress
  socialstyrelseMålProgress: MålProgress[];

  // User Preferences
  preferences?: {
    targetMinutesPerDay?: number;
    recoveryMode?: boolean;
    notificationsEnabled?: boolean;
    soundEnabled?: boolean;
  };
}

/**
 * Session results returned from EnhancedDailySession
 */
export interface SessionResults {
  summary: {
    xpEarned: number;
    accuracy: number;
    timeSpent: number;
    questionsAnswered: number;
    correctAnswers: number;
    hintsUsed: number;
  };
  srsUpdates: SRSCard[];
  performance: {
    correctRate: number;
    hintUsage: number;
    timeEfficiency: number;
    confidence?: number;
  };
  completedContent: string[];
  relatedGoals: string[];
}

/**
 * Daily state combining daily mix and user progress
 */
export interface DailyState {
  date: Date;
  dailyMix: DailyMix;
  completed: boolean;
  sessionResults?: SessionResults;
}

/**
 * Analytics data combining all metrics
 */
export interface IntegratedAnalytics {
  // Gamification metrics
  gamification: {
    totalXP: number;
    level: number;
    badgesEarned: number;
    currentStreak: number;
    longestStreak: number;
    totalSessions: number;
  };

  // Progression metrics
  progression: {
    currentBand: string;
    bandHistory: Array<{ band: string; date: Date; reason: string }>;
    domainsCompleted: number;
    totalDomains: number;
    oscesPassed: number;
    oscesTotal: number;
  };

  // SRS metrics
  srs: {
    totalCards: number;
    dueToday: number;
    averageStability: number;
    leechCards: number;
    reviewsCompleted: number;
  };

  // Performance metrics
  performance: {
    overallAccuracy: number;
    averageHintUsage: number;
    averageTimeEfficiency: number;
    recentPerformance: {
      last7Days: {
        accuracy: number;
        sessionsCompleted: number;
        xpEarned: number;
      };
      last30Days: {
        accuracy: number;
        sessionsCompleted: number;
        xpEarned: number;
      };
    };
  };

  // Socialstyrelsen progress
  socialstyrelsen: {
    totalGoals: number;
    achievedGoals: number;
    percentage: number;
    byCompetencyArea: Record<string, { total: number; achieved: number }>;
    recentActivity: Array<{
      goalId: string;
      goalTitle: string;
      timestamp: Date;
      activityType: string;
    }>;
  };
}

/**
 * User journey tracking
 */
export interface UserJourney {
  userId: string;
  startDate: Date;
  milestones: Array<{
    type: 'band_promotion' | 'domain_complete' | 'osce_pass' | 'level_up' | 'badge_earned';
    date: Date;
    details: string;
  }>;
  totalDaysActive: number;
  totalTimeSpent: number; // minutes
}

/**
 * Notification types
 */
export interface Notification {
  id: string;
  type: 'band_adjustment' | 'domain_complete' | 'osce_ready' | 'srs_due' | 'streak_reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

/**
 * Content mapping between old and new systems
 */
export interface MappedContent {
  id: string;
  type: 'microcase' | 'quiz' | 'pearl' | 'flashcard';
  domain: Domain;
  band: string;
  competencies: string[];
  relatedGoals: string[];
  srsCard?: SRSCard;
  originalItem: PlanItem;
}
