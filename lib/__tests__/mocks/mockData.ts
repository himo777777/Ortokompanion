/**
 * Mock Data for Testing
 * Provides realistic test data for profiles, questions, SRS cards, etc.
 */

import type { IntegratedUserProfile } from '@/types/integrated';
import type { MCQQuestion } from '@/data/questions';
import type { SRSCard } from '@/types/progression';

// Mock User Profile
export const mockProfile: IntegratedUserProfile = {
  // From UserProfile base
  id: 'test-user-001',
  role: 'st3',
  stYear: 3,
  goals: ['st-trauma-001', 'st-trauma-002'],
  domains: ['trauma', 'höft'],
  consent: {
    analytics: true,
    regionAdapt: true,
  },
  channel: 'email',
  tieBreaker: {
    startMode: 'akut',
    preferMicrocases: false,
    dailyPush: true,
  },
  createdAt: new Date('2025-01-01'),
  socialstyrelseMålProgress: [],
  aiAdaptationEnabled: true,

  // Gamification
  gamification: {
    xp: 500,
    level: 5,
    badges: ['first_session', 'week_streak'],
    streak: 3,
    longestStreak: 5,
    totalSessions: 20,
    lastActivity: new Date('2025-01-05'),
    freezeTokens: 2,
    prestigeLevel: 0,
    lifetimeXP: 500,
  },

  // Progression System
  progression: {
    primaryDomain: 'trauma',
    bandStatus: {
      currentBand: 'C',
      bandHistory: [
        {
          band: 'C',
          date: new Date('2025-01-01'),
          reason: 'Startpunkt baserat på din utbildningsnivå',
        },
      ],
      streakAtBand: 3,
      recentPerformance: {
        correctRate: 0.75,
        hintUsage: 1.2,
        timeEfficiency: 0.8,
        confidence: 0.7,
      },
    },
    domainStatuses: {} as any,
    srs: {
      cards: [],
      dueToday: [],
      overdueCards: [],
      leechCards: [],
    },
    history: {
      bandAdjustments: [],
      osceResults: [],
      retentionChecks: [],
      sessionHistory: [],
    },
  },
};

// Mock Question
export const mockQuestion: MCQQuestion = {
  id: 'trauma-001',
  domain: 'trauma',
  level: 'st3',
  band: 'C',
  question: 'En 45-årig man kommer in efter en motorcykelolycka. Vilken är den första prioriteten enligt ATLS?',
  options: [
    'A) Kontrollera andning',
    'B) Säkra luftvägen',
    'C) Stoppa blödning',
    'D) Bedöma medvetandegrad',
  ],
  correctAnswer: '1', // B
  explanation: 'Enligt ATLS-protokollet är första prioriteten alltid att säkra luftvägen (Airway).',
  tutorMode: {
    hints: [
      'Tänk på ABCDE-principen',
      'A står för Airway (luftväg)',
      'Vid trauma säkrar man alltid luftvägen först',
    ],
    teachingPoints: ['ATLS: Airway with C-spine protection är alltid första steget.'],
  },
  competency: 'klinisk-färdighet',
  tags: ['atls', 'trauma', 'airway'],
  references: ['atls-sverige-2022'],
  relatedGoals: ['bt-trauma-001', 'st-trauma-002'],
  contentVersion: '1.0.0',
  lastContentUpdate: new Date('2025-01-01'),
};

// Mock SRS Card
export const mockSRSCard: SRSCard = {
  id: 'card-trauma-001',
  domain: 'trauma',
  type: 'quiz',
  contentId: 'trauma-001',
  easeFactor: 2.5,
  stability: 0.8,
  interval: 7,
  dueDate: new Date('2025-01-10'),
  difficulty: 0.3,
  lastGrade: 4,
  lastReviewed: new Date('2025-01-03'),
  reviewCount: 3,
  createdAt: new Date('2025-01-01'),
  competencies: [],
  failCount: 0,
  isLeech: false,
};

// Mock Daily Mix
export const mockDailyMix = {
  date: new Date('2025-01-06'),
  newContent: {
    domain: 'trauma',
    questionIds: ['trauma-001', 'trauma-002', 'trauma-003'],
    estimatedTime: 15,
  },
  interleavingContent: {
    domains: ['höft', 'knä'] as any[],
    questionIds: ['hoeft-001', 'kna-001'],
    estimatedTime: 10,
  },
  srsReviews: {
    dueCards: ['card-trauma-001'],
    urgentCards: [],
    estimatedTime: 5,
  },
  isRecoveryDay: false,
  difficultFollowUp: null,
};

// Helper: Create mock profile with overrides
export function createMockProfile(overrides?: Partial<IntegratedUserProfile>): IntegratedUserProfile {
  return {
    ...mockProfile,
    ...overrides,
    gamification: {
      ...mockProfile.gamification,
      ...(overrides?.gamification || {}),
    },
    progression: {
      ...mockProfile.progression,
      ...(overrides?.progression || {}),
    },
  };
}

// Helper: Create mock question with overrides
export function createMockQuestion(overrides?: Partial<MCQQuestion>): MCQQuestion {
  return {
    ...mockQuestion,
    ...overrides,
  };
}

// Helper: Create mock SRS card with overrides
export function createMockSRSCard(overrides?: Partial<SRSCard>): SRSCard {
  return {
    ...mockSRSCard,
    ...overrides,
  };
}

// Helper: Create mock daily mix with overrides
export function createMockDailyMix(overrides?: any) {
  return {
    ...mockDailyMix,
    ...overrides,
  };
}
