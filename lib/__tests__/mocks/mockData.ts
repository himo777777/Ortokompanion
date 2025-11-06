/**
 * Mock Data for Testing
 * Provides realistic test data for profiles, questions, SRS cards, etc.
 */

import type { IntegratedUserProfile, DailyMix } from '@/types/integrated';
import type { MCQQuestion } from '@/data/questions';
import type { SRSCard } from '@/types/progression';

// Mock User Profile
export const mockProfile: IntegratedUserProfile = {
  basic: {
    name: 'Test Användare',
    level: 'st3',
    primaryDomain: 'TRAUMA',
    avatarEmoji: '🩺',
    createdAt: new Date('2025-01-01'),
  },
  gamification: {
    xp: 500,
    level: 5,
    badges: [],
    streak: 3,
    longestStreak: 5,
    totalSessions: 20,
    lastActivity: new Date('2025-01-05'),
    freezeTokens: 2,
    prestigeLevel: 0,
    lifetimeXP: 500,
  },
  progression: {
    primaryDomain: 'TRAUMA',
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
    dailyMix: null,
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
    preferences: {
      recoveryMode: false,
      targetMinutesPerDay: 30,
    },
  },
};

// Mock Question
export const mockQuestion: MCQQuestion = {
  id: 'trauma-001',
  domain: 'TRAUMA',
  level: ['st2', 'st3', 'st4'],
  band: 'C',
  question: 'En 45-årig man kommer in efter en motorcykelolycka. Vilken är den första prioriteten enligt ATLS?',
  options: [
    'A) Kontrollera andning',
    'B) Säkra luftvägen',
    'C) Stoppa blödning',
    'D) Bedöma medvetandegrad',
  ],
  correctAnswer: 1, // B
  explanation: 'Enligt ATLS-protokollet är första prioriteten alltid att säkra luftvägen (Airway).',
  tutorMode: {
    hints: [
      'Tänk på ABCDE-principen',
      'A står för Airway (luftväg)',
      'Vid trauma säkrar man alltid luftvägen först',
    ],
    pitfalls: [
      'Glöm inte att stabilisera nacken samtidigt',
    ],
    clinicalPearl: 'ATLS: Airway with C-spine protection är alltid första steget.',
  },
  verifiedSource: {
    referenceId: 'atls-sverige-2022',
    pageNumber: 12,
    chapter: 'Initial Assessment',
    lastVerified: new Date('2025-01-01'),
    confidence: 1.0,
  },
  relatedGoals: ['bt-trauma-001', 'st-trauma-002'],
  metadata: {
    createdAt: new Date('2025-01-01'),
    lastReviewed: new Date('2025-01-01'),
    authorNotes: 'Grundläggande ATLS-fråga',
  },
};

// Mock SRS Card
export const mockSRSCard: SRSCard = {
  id: 'card-trauma-001',
  questionId: 'trauma-001',
  interval: 7,
  easeFactor: 2.5,
  reviewCount: 3,
  nextReview: new Date('2025-01-10'),
  lastReview: new Date('2025-01-03'),
  stability: 0.8,
  difficulty: 0.3,
  failCount: 0,
  isLeech: false,
};

// Mock Daily Mix
export const mockDailyMix: DailyMix = {
  date: new Date('2025-01-06'),
  newContent: {
    domain: 'TRAUMA',
    questionIds: ['trauma-001', 'trauma-002', 'trauma-003'],
    estimatedTime: 15,
  },
  interleavingContent: {
    domains: ['HOEFT', 'KNA'],
    questionIds: ['hoeft-001', 'kna-001'],
    estimatedTime: 10,
  },
  srsReviews: {
    dueCards: ['card-trauma-001'],
    urgentCards: [],
    estimatedTime: 5,
  },
  recoveryDay: false,
  difficultFollowUp: null,
};

// Helper: Create mock profile with overrides
export function createMockProfile(overrides?: Partial<IntegratedUserProfile>): IntegratedUserProfile {
  return {
    ...mockProfile,
    ...overrides,
    basic: {
      ...mockProfile.basic,
      ...(overrides?.basic || {}),
    },
    gamification: {
      ...mockProfile.gamification,
      ...(overrides?.gamification || {}),
    },
    progression: {
      ...mockProfile.progression,
      ...(overrides?.progression || {}),
    },
    srs: {
      ...mockProfile.srs,
      ...(overrides?.srs || {}),
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
export function createMockDailyMix(overrides?: Partial<DailyMix>): DailyMix {
  return {
    ...mockDailyMix,
    ...overrides,
  };
}
