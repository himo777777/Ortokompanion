/**
 * Tests for db-utils.ts
 * Testing database utility functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveProfile,
  loadProfile,
  saveSession,
  getUserSessions,
} from '../db-utils';
import { mockPrismaClient, resetPrismaMocks } from './mocks/prisma';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: mockPrismaClient,
}));

describe('Database Utils', () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  describe('saveProfile', () => {
    it('should save user profile to database', async () => {
      const mockProfile = {
        userId: 'user_123',
        role: 'st3',
        xp: 500,
      };

      mockPrismaClient.profile.upsert.mockResolvedValue(mockProfile as any);

      const result = await saveProfile('user_123', mockProfile as any);

      expect(mockPrismaClient.profile.upsert).toHaveBeenCalled();
      expect(result).toEqual(mockProfile);
    });

    it('should handle database errors', async () => {
      mockPrismaClient.profile.upsert.mockRejectedValue(
        new Error('Database error')
      );

      await expect(saveProfile('user_123', {} as any)).rejects.toThrow();
    });
  });

  describe('loadProfile', () => {
    it('should load user profile from database', async () => {
      const mockProfile = {
        id: 'profile_123',
        userId: 'user_123',
        role: 'st3',
      };

      mockPrismaClient.profile.findUnique.mockResolvedValue(mockProfile as any);

      const result = await loadProfile('user_123');

      expect(mockPrismaClient.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user_123' },
      });
      expect(result).toEqual(mockProfile);
    });

    it('should return null if profile not found', async () => {
      mockPrismaClient.profile.findUnique.mockResolvedValue(null);

      const result = await loadProfile('nonexistent_user');

      expect(result).toBeNull();
    });
  });

  describe('saveSession', () => {
    it('should save session data to database', async () => {
      const mockSession = {
        userId: 'user_123',
        questionsAnswered: 10,
        correctAnswers: 7,
        xpGained: 70,
      };

      mockPrismaClient.session.create.mockResolvedValue(mockSession as any);

      const result = await saveSession(mockSession as any);

      expect(mockPrismaClient.session.create).toHaveBeenCalled();
      expect(result).toEqual(mockSession);
    });
  });

  describe('getUserSessions', () => {
    it('should retrieve user sessions from database', async () => {
      const mockSessions = [
        { id: 'session_1', userId: 'user_123', xpGained: 70 },
        { id: 'session_2', userId: 'user_123', xpGained: 50 },
      ];

      mockPrismaClient.session.findMany.mockResolvedValue(mockSessions as any);

      const result = await getUserSessions('user_123');

      expect(mockPrismaClient.session.findMany).toHaveBeenCalledWith({
        where: { userId: 'user_123' },
        orderBy: { timestamp: 'desc' },
      });
      expect(result).toEqual(mockSessions);
    });

    it('should support limit parameter', async () => {
      mockPrismaClient.session.findMany.mockResolvedValue([]);

      await getUserSessions('user_123', 10);

      expect(mockPrismaClient.session.findMany).toHaveBeenCalledWith({
        where: { userId: 'user_123' },
        orderBy: { timestamp: 'desc' },
        take: 10,
      });
    });
  });
});
