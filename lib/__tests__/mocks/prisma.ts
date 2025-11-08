/**
 * Mock Prisma Client for Testing
 *
 * Provides a mocked Prisma client with all models and methods
 * for testing database interactions without a real database.
 */

import { vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';

/**
 * Create a mock Prisma client
 */
export const createMockPrismaClient = () => {
  return {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
      upsert: vi.fn(),
    },
    profile: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
      upsert: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
      createMany: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn((callback: any) => callback(mockPrismaClient)),
    $executeRaw: vi.fn(),
    $queryRaw: vi.fn(),
  } as unknown as PrismaClient;
};

/**
 * Default mock Prisma client instance
 */
export const mockPrismaClient = createMockPrismaClient();

/**
 * Mock Prisma module
 * Use this in tests with vi.mock('@/lib/db')
 */
export const mockPrismaModule = {
  prisma: mockPrismaClient,
};

/**
 * Reset all Prisma mocks
 * Call this in beforeEach() to ensure clean state
 */
export const resetPrismaMocks = () => {
  Object.values(mockPrismaClient.user).forEach((fn) => {
    if (typeof fn === 'function' && 'mockReset' in fn) {
      (fn as any).mockReset();
    }
  });
  Object.values(mockPrismaClient.profile).forEach((fn) => {
    if (typeof fn === 'function' && 'mockReset' in fn) {
      (fn as any).mockReset();
    }
  });
  Object.values(mockPrismaClient.session).forEach((fn) => {
    if (typeof fn === 'function' && 'mockReset' in fn) {
      (fn as any).mockReset();
    }
  });
};

/**
 * Mock data generators for Prisma models
 */
export const mockPrismaData = {
  /**
   * Create a mock User
   */
  createUser: (overrides: any = {}) => ({
    id: 'user_test_123',
    clerkId: 'clerk_test_123',
    email: 'test@example.com',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  }),

  /**
   * Create a mock Profile
   */
  createProfile: (overrides: any = {}) => ({
    id: 'profile_test_123',
    userId: 'user_test_123',
    role: 'st3',
    stYear: 3,
    primarySpecialty: 'ortopedi',
    xp: 500,
    level: 5,
    streak: 3,
    longestStreak: 5,
    totalSessions: 20,
    lastActivity: new Date('2025-01-05'),
    freezeTokens: 2,
    prestigeLevel: 0,
    lifetimeXP: 500,
    progression: {
      primaryDomain: 'trauma',
      bandStatus: {
        currentBand: 'C',
        bandHistory: [],
        streakAtBand: 3,
        recentPerformance: {
          correctRate: 0.75,
          hintUsage: 1.2,
          timeEfficiency: 0.8,
          confidence: 0.7,
        },
      },
      domainStatuses: {},
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
    socialstyrelseMålProgress: [],
    wrongQuestions: [],
    preferences: null,
    rotationTimeline: null,
    orthoPlacement: null,
    placementTiming: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  }),

  /**
   * Create a mock Session
   */
  createSession: (overrides: any = {}) => ({
    id: 'session_test_123',
    userId: 'user_test_123',
    timestamp: new Date('2025-01-05'),
    questionsAnswered: 10,
    correctAnswers: 7,
    xpGained: 70,
    domain: 'trauma',
    band: 'C',
    activityType: 'new',
    topics: ['atls', 'fraktur'],
    mistakes: [],
    relatedGoals: ['st-trauma-001'],
    ...overrides,
  }),
};
