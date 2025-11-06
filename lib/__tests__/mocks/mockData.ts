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
    totalXP: 500,
    currentLevel: 5,
    xpToNextLevel: 200,
    streakDays: 3,
    lastActivity: new Date('2025-01-05'),
  },
  progression: {
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
    domains: {
      TRAUMA: {
        domain: 'TRAUMA',
        overallProgress: 0.3,
        mastery: 0.25,
        gates: {
          fundamentals: {
            id: 'fundamentals',
            title: 'Grundläggande Traumakunskap',
            completed: true,
            progress: 1.0,
            unlocked: true,
          },
          clinical: {
            id: 'clinical',
            title: 'Klinisk Traumahantering',
            completed: false,
            progress: 0.5,
            unlocked: true,
          },
          advanced: {
            id: 'advanced',
            title: 'Avancerad Traumavård',
            completed: false,
            progress: 0.1,
            unlocked: false,
          },
          expert: {
            id: 'expert',
            title: 'Expertkunskap',
            completed: false,
            progress: 0,
            unlocked: false,
          },
        },
        recentPerformance: {
          questionsAnswered: 50,
          correctAnswers: 38,
          avgTimePerQuestion: 45,
          lastPracticed: new Date('2025-01-05'),
        },
      },
    },
    history: {
      sessionResults: [],
      bandAdjustments: [],
      osceResults: [],
      retentionChecks: [],
    },
    preferences: {
      recoveryMode: false,
      targetMinutesPerDay: 30,
    },
  },
  srs: {
    cards: [],
    dueToday: [],
    overdueCards: [],
    leechCards: [],
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
