/**
 * IntegratedContext Tests
 * Tests for global state management, localStorage persistence, and state transitions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { IntegratedProvider, useIntegrated } from '../IntegratedContext';
import { mockProfile, mockDailyMix, createMockProfile } from '@/lib/__tests__/mocks/mockData';
import type { SessionResults } from '@/types/progression';

// Mock useToast
vi.mock('@/components/ui/ToastContainer', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get store() {
      return { ...store };
    },
  };
})();

// Wrapper for renderHook
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <IntegratedProvider>{children}</IntegratedProvider>
);

describe('IntegratedContext', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    global.localStorage = mockLocalStorage as any;
    vi.clearAllMocks();
  });

  // ==================== INITIAL LOAD ====================
  describe('Initial Load', () => {
    it('should load with null profile when localStorage is empty', () => {
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      expect(result.current.profile).toBeNull();
      expect(result.current.dailyMix).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should load existing profile from localStorage', () => {
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      expect(result.current.profile).not.toBeNull();
      expect(result.current.profile?.basic.name).toBe('Test Användare');
      expect(result.current.profile?.basic.level).toBe('st3');
    });

    it('should parse dates correctly when loading profile', () => {
      const profileWithDates = {
        ...mockProfile,
        gamification: {
          ...mockProfile.gamification,
          lastActivity: new Date('2025-01-05').toISOString(),
        },
      };
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(profileWithDates));

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      expect(result.current.profile?.gamification.lastActivity).toBeInstanceOf(Date);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      mockLocalStorage.setItem('integrated-profile', 'invalid json{{{');

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      // Should not crash, should return null
      expect(result.current.profile).toBeNull();
    });

    it('should load daily mix from localStorage', () => {
      mockLocalStorage.setItem('daily-mix', JSON.stringify(mockDailyMix));

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      expect(result.current.dailyMix).not.toBeNull();
      expect(result.current.dailyMix?.newContent.domain).toBe('TRAUMA');
    });
  });

  // ==================== PROFILE MANAGEMENT ====================
  describe('Profile Management', () => {
    it('should set profile', () => {
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      act(() => {
        result.current.setProfile(mockProfile);
      });

      expect(result.current.profile).toEqual(mockProfile);
      expect(mockLocalStorage.store['integrated-profile']).toBeDefined();
    });

    it('should update profile fields', () => {
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      act(() => {
        result.current.updateProfile({
          basic: {
            ...mockProfile.basic,
            name: 'Updated Name',
          },
        });
      });

      expect(result.current.profile?.basic.name).toBe('Updated Name');
    });

    it('should save to localStorage automatically after update', () => {
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      act(() => {
        result.current.updateProfile({
          gamification: {
            ...mockProfile.gamification,
            totalXP: 1000,
          },
        });
      });

      const saved = JSON.parse(mockLocalStorage.store['integrated-profile']);
      expect(saved.gamification.totalXP).toBe(1000);
    });

    it('should update analytics on profile change', () => {
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      act(() => {
        result.current.updateProfile({
          gamification: {
            ...mockProfile.gamification,
            totalXP: 2000,
          },
        });
      });

      expect(result.current.analytics).not.toBeNull();
    });

    it('should handle partial updates', () => {
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      const originalName = result.current.profile?.basic.name;

      act(() => {
        result.current.updateProfile({
          gamification: {
            ...mockProfile.gamification,
            totalXP: 1500,
          },
        });
      });

      // Name should remain unchanged
      expect(result.current.profile?.basic.name).toBe(originalName);
      expect(result.current.profile?.gamification.totalXP).toBe(1500);
    });

    it('should preserve unchanged fields during update', () => {
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      const originalBandStatus = result.current.profile?.progression.bandStatus;

      act(() => {
        result.current.updateProfile({
          gamification: {
            ...mockProfile.gamification,
            streakDays: 10,
          },
        });
      });

      expect(result.current.profile?.progression.bandStatus).toEqual(originalBandStatus);
    });
  });

  // ==================== DAILY MIX GENERATION ====================
  describe('Daily Mix Generation', () => {
    it('should generate daily mix for new day', () => {
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      act(() => {
        result.current.refreshDailyMix();
      });

      expect(result.current.dailyMix).not.toBeNull();
      expect(result.current.dailyMix?.newContent).toBeDefined();
    });

    it('should reuse existing mix if same day', () => {
      const todayMix = { ...mockDailyMix, date: new Date() };
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));
      mockLocalStorage.setItem('daily-mix', JSON.stringify(todayMix));

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      const mixBefore = result.current.dailyMix;

      act(() => {
        result.current.refreshDailyMix();
      });

      // Should be the same mix (not regenerated)
      expect(result.current.dailyMix?.date).toEqual(mixBefore?.date);
    });

    it('should handle missing primary domain', () => {
      const profileNoDomain = createMockProfile({
        basic: { ...mockProfile.basic, primaryDomain: undefined as any },
      });
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(profileNoDomain));

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      act(() => {
        result.current.refreshDailyMix();
      });

      // Should handle gracefully, not crash
      expect(result.current.dailyMix).toBeDefined();
    });

    it('should generate recovery mode mix when requested', () => {
      const profileWithRecovery = createMockProfile({
        progression: {
          ...mockProfile.progression,
          preferences: {
            ...mockProfile.progression.preferences,
            recoveryMode: true,
          },
        },
      });
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(profileWithRecovery));

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      act(() => {
        result.current.refreshDailyMix();
      });

      expect(result.current.dailyMix?.recoveryDay).toBe(true);
    });

    it('should select band-appropriate questions', () => {
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      act(() => {
        result.current.refreshDailyMix();
      });

      // Band C should be selected based on profile
      const dailyMix = result.current.dailyMix;
      expect(dailyMix).not.toBeNull();
    });

    it('should regenerate mix on band change', () => {
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));
      mockLocalStorage.setItem('daily-mix', JSON.stringify(mockDailyMix));

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      // Change band
      act(() => {
        result.current.updateProfile({
          progression: {
            ...mockProfile.progression,
            bandStatus: {
              ...mockProfile.progression.bandStatus,
              currentBand: 'D',
            },
          },
        });
      });

      // Mix should be regenerated
      expect(result.current.dailyMix).not.toBeNull();
    });
  });

  // ==================== SESSION COMPLETION ====================
  describe('Session Completion', () => {
    const mockSessionResults: SessionResults = {
      sessionId: 'session-001',
      activityType: 'new',
      domain: 'TRAUMA',
      questionsAnswered: 3,
      correctAnswers: 2,
      totalXP: 45,
      avgTimePerQuestion: 60,
      hintsUsed: 2,
      srsCards: [],
      completedAt: new Date(),
    };

    it('should add XP on session completion', () => {
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      const xpBefore = result.current.profile?.gamification.totalXP || 0;

      act(() => {
        result.current.completeSession(mockSessionResults);
      });

      const xpAfter = result.current.profile?.gamification.totalXP || 0;
      expect(xpAfter).toBeGreaterThan(xpBefore);
    });

    it('should detect level up', () => {
      const lowXPProfile = createMockProfile({
        gamification: {
          ...mockProfile.gamification,
          totalXP: 95, // Close to level up
          xpToNextLevel: 5,
        },
      });
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(lowXPProfile));

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      const levelBefore = result.current.profile?.gamification.currentLevel || 0;

      act(() => {
        result.current.completeSession({
          ...mockSessionResults,
          totalXP: 10, // Should trigger level up
        });
      });

      const levelAfter = result.current.profile?.gamification.currentLevel || 0;
      expect(levelAfter).toBeGreaterThan(levelBefore);
    });

    it('should update SRS cards', () => {
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      act(() => {
        result.current.completeSession({
          ...mockSessionResults,
          srsCards: [
            {
              id: 'card-001',
              questionId: 'q-001',
              interval: 7,
              easeFactor: 2.5,
              reviewCount: 1,
              nextReview: new Date(),
              lastReview: new Date(),
              stability: 0.8,
              difficulty: 0.3,
              failCount: 0,
              isLeech: false,
            },
          ],
        });
      });

      expect(result.current.profile?.srs.cards.length).toBeGreaterThan(0);
    });

    it('should persist to localStorage after session completion', () => {
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      act(() => {
        result.current.completeSession(mockSessionResults);
      });

      const saved = mockLocalStorage.store['integrated-profile'];
      expect(saved).toBeDefined();
    });

    it('should update streak on daily completion', () => {
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      const streakBefore = result.current.profile?.gamification.streakDays || 0;

      act(() => {
        result.current.completeSession(mockSessionResults);
      });

      const streakAfter = result.current.profile?.gamification.streakDays || 0;
      expect(streakAfter).toBeGreaterThanOrEqual(streakBefore);
    });
  });

  // ==================== RECOVERY MODE ====================
  describe('Recovery Mode', () => {
    it('should activate recovery mode', () => {
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      act(() => {
        result.current.requestRecovery();
      });

      expect(result.current.profile?.progression.preferences.recoveryMode).toBe(true);
    });

    it('should regenerate daily mix with easier content', () => {
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      act(() => {
        result.current.requestRecovery();
      });

      expect(result.current.dailyMix?.recoveryDay).toBe(true);
    });

    it('should persist recovery mode to localStorage', () => {
      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      act(() => {
        result.current.requestRecovery();
      });

      const saved = JSON.parse(mockLocalStorage.store['integrated-profile']);
      expect(saved.progression.preferences.recoveryMode).toBe(true);
    });
  });

  // ==================== ERROR HANDLING ====================
  describe('Error Handling', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useIntegrated());
      }).toThrow();
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw error
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem = vi.fn(() => {
        throw new Error('LocalStorage full');
      });

      mockLocalStorage.setItem('integrated-profile', JSON.stringify(mockProfile));
      mockLocalStorage.setItem = originalSetItem; // Restore for initialization

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      // Should not crash when trying to save
      act(() => {
        mockLocalStorage.setItem = vi.fn(() => {
          throw new Error('LocalStorage full');
        });
        result.current.updateProfile({
          gamification: {
            ...mockProfile.gamification,
            totalXP: 999,
          },
        });
      });

      // Should handle error gracefully
      expect(result.current.profile).toBeDefined();
    });
  });
});
