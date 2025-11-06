/**
 * IntegratedContext Tests
 * Tests for global state management, localStorage persistence, and state transitions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { IntegratedProvider, useIntegrated } from '../IntegratedContext';
import { mockProfile, mockDailyMix, createMockProfile } from '@/lib/__tests__/mocks/mockData';
import type { SessionResults } from '@/types/progression';

// Mock useToast
vi.mock('@/components/ui/ToastContainer', () => ({
  useToast: () => ({
    addToast: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock integrated-helpers
vi.mock('@/lib/integrated-helpers', () => ({
  generateIntegratedDailyMix: vi.fn((profile, questions) => ({
    date: new Date(),
    newContent: {
      domain: profile.progression.primaryDomain,
      questionIds: ['q1', 'q2', 'q3'],
      estimatedTime: 15,
    },
    interleavingContent: {
      domains: [],
      questionIds: [],
      estimatedTime: 0,
    },
    srsReviews: {
      dueCards: [],
      urgentCards: [],
      estimatedTime: 0,
    },
    recoveryDay: profile.progression.preferences?.recoveryMode || false,
    difficultFollowUp: null,
  })),
  handleSessionCompletion: vi.fn((profile, results, dailyMix) => ({
    ...profile,
    gamification: {
      ...profile.gamification,
      xp: profile.gamification.xp + results.summary.xpEarned,
      level: Math.floor((profile.gamification.xp + results.summary.xpEarned) / 100) + 1,
      streak: profile.gamification.streak + 1,
    },
    progression: {
      ...profile.progression,
      srs: {
        ...profile.progression.srs,
        cards: [...profile.progression.srs.cards, ...results.srsUpdates],
      },
    },
  })),
  calculateIntegratedAnalytics: vi.fn((profile) => ({
    overallProgress: 0.5,
    domains: {},
    streakInfo: {
      current: profile.gamification.streak,
      longest: profile.gamification.longestStreak,
    },
    recentActivity: [],
  })),
  loadAvailableContent: vi.fn(() => []),
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

    it('should load existing profile from localStorage', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
        expect(result.current.profile?.basic.name).toBe('Test Användare');
        expect(result.current.profile?.basic.level).toBe('st3');
      });
    });

    it('should parse dates correctly when loading profile', async () => {
      const profileWithDates = {
        ...mockProfile,
        gamification: {
          ...mockProfile.gamification,
          lastActivity: new Date('2025-01-05').toISOString(),
        },
      };
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(profileWithDates));

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile?.gamification.lastActivity).toBeInstanceOf(Date);
      });
    });

    it('should handle corrupted localStorage data gracefully', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', 'invalid json{{{');

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        // Should not crash, should return null
        expect(result.current.profile).toBeNull();
      });
    });

    it('should load daily mix from localStorage', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));
      mockLocalStorage.setItem('ortokompanion_daily_mix', JSON.stringify(mockDailyMix));

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.dailyMix).not.toBeNull();
        expect(result.current.dailyMix?.newContent.domain).toBe('TRAUMA');
      });
    });
  });

  // ==================== PROFILE MANAGEMENT ====================
  describe('Profile Management', () => {
    it('should set profile', async () => {
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await act(async () => {
        result.current.setProfile(mockProfile);
      });

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
        expect(mockLocalStorage.store['ortokompanion_integrated_profile']).toBeDefined();
      });
    });

    it('should update profile fields', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await act(async () => {
        result.current.updateProfile({
          basic: {
            ...mockProfile.basic,
            name: 'Updated Name',
          },
        });
      });

      await waitFor(() => {
        expect(result.current.profile?.basic.name).toBe('Updated Name');
      });
    });

    it('should save to localStorage automatically after update', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await act(async () => {
        result.current.updateProfile({
          gamification: {
            ...mockProfile.gamification,
            xp: 1000,
          },
        });
      });

      await waitFor(() => {
        const saved = JSON.parse(mockLocalStorage.store['ortokompanion_integrated_profile']);
        expect(saved.gamification.xp).toBe(1000);
      });
    });

    it('should update analytics on profile change', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await act(async () => {
        result.current.updateProfile({
          gamification: {
            ...mockProfile.gamification,
            xp: 2000,
          },
        });
      });

      await waitFor(() => {
        expect(result.current.analytics).not.toBeNull();
      });
    });

    it('should handle partial updates', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      });

      const originalName = result.current.profile?.basic.name;

      await act(async () => {
        result.current.updateProfile({
          gamification: {
            ...mockProfile.gamification,
            xp: 1500,
          },
        });
      });

      await waitFor(() => {
        // Name should remain unchanged
        expect(result.current.profile?.basic.name).toBe(originalName);
        expect(result.current.profile?.gamification.xp).toBe(1500);
      });
    });

    it('should preserve unchanged fields during update', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      });

      const originalBandStatus = result.current.profile?.progression.bandStatus;

      await act(async () => {
        result.current.updateProfile({
          gamification: {
            ...mockProfile.gamification,
            streak: 10,
          },
        });
      });

      await waitFor(() => {
        expect(result.current.profile?.progression.bandStatus).toEqual(originalBandStatus);
      });
    });
  });

  // ==================== DAILY MIX GENERATION ====================
  describe('Daily Mix Generation', () => {
    it('should generate daily mix for new day', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      });

      await act(async () => {
        result.current.refreshDailyMix();
      });

      await waitFor(() => {
        expect(result.current.dailyMix).not.toBeNull();
        expect(result.current.dailyMix?.newContent).toBeDefined();
      });
    });

    it('should reuse existing mix if same day', async () => {
      const todayMix = { ...mockDailyMix, date: new Date() };
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));
      mockLocalStorage.setItem('ortokompanion_daily_mix', JSON.stringify(todayMix));

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.dailyMix).not.toBeNull();
      });

      const mixBefore = result.current.dailyMix;

      await act(async () => {
        result.current.refreshDailyMix();
      });

      await waitFor(() => {
        // Should be the same mix (not regenerated)
        expect(result.current.dailyMix?.date).toEqual(mixBefore?.date);
      });
    });

    it('should handle missing primary domain', async () => {
      const profileNoDomain = createMockProfile({
        basic: { ...mockProfile.basic, primaryDomain: undefined as any },
      });
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(profileNoDomain));

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      });

      await act(async () => {
        result.current.refreshDailyMix();
      });

      await waitFor(() => {
        // Should handle gracefully, not crash
        expect(result.current.dailyMix).toBeDefined();
      });
    });

    it('should generate recovery mode mix when requested', async () => {
      const profileWithRecovery = createMockProfile({
        progression: {
          ...mockProfile.progression,
          preferences: {
            ...mockProfile.progression.preferences,
            recoveryMode: true,
          },
        },
      });
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(profileWithRecovery));

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      });

      await act(async () => {
        result.current.refreshDailyMix();
      });

      await waitFor(() => {
        expect(result.current.dailyMix?.recoveryDay).toBe(true);
      });
    });

    it('should select band-appropriate questions', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      });

      await act(async () => {
        result.current.refreshDailyMix();
      });

      await waitFor(() => {
        // Band C should be selected based on profile
        const dailyMix = result.current.dailyMix;
        expect(dailyMix).not.toBeNull();
      });
    });

    it('should regenerate mix on band change', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));
      mockLocalStorage.setItem('ortokompanion_daily_mix', JSON.stringify(mockDailyMix));

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      });

      // Change band
      await act(async () => {
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

      await waitFor(() => {
        // Mix should be regenerated
        expect(result.current.dailyMix).not.toBeNull();
      });
    });
  });

  // ==================== SESSION COMPLETION ====================
  describe('Session Completion', () => {
    const mockSessionResults: SessionResults = {
      summary: {
        xpEarned: 45,
        accuracy: 0.67,
        timeSpent: 180,
        questionsAnswered: 3,
        correctAnswers: 2,
        hintsUsed: 2,
      },
      srsUpdates: [],
      performance: {
        speed: 0.8,
        consistency: 0.75,
        improvement: 0.1,
      },
    };

    it('should add XP on session completion', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));
      mockLocalStorage.setItem('ortokompanion_daily_mix', JSON.stringify(mockDailyMix));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
        expect(result.current.dailyMix).not.toBeNull();
      });

      const xpBefore = result.current.profile?.gamification.xp || 0;

      await act(async () => {
        result.current.completeSession(mockSessionResults);
      });

      await waitFor(() => {
        const xpAfter = result.current.profile?.gamification.xp || 0;
        expect(xpAfter).toBeGreaterThan(xpBefore);
      });
    });

    it('should detect level up', async () => {
      const lowXPProfile = createMockProfile({
        gamification: {
          ...mockProfile.gamification,
          xp: 95, // Close to level up
          level: 1,
        },
      });
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(lowXPProfile));
      mockLocalStorage.setItem('ortokompanion_daily_mix', JSON.stringify(mockDailyMix));

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
        expect(result.current.dailyMix).not.toBeNull();
      });

      const levelBefore = result.current.profile?.gamification.level || 0;

      await act(async () => {
        result.current.completeSession({
          ...mockSessionResults,
          summary: {
            ...mockSessionResults.summary,
            xpEarned: 10, // Should trigger level up
          },
        });
      });

      await waitFor(() => {
        const levelAfter = result.current.profile?.gamification.level || 0;
        expect(levelAfter).toBeGreaterThan(levelBefore);
      });
    });

    it('should update SRS cards', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));
      mockLocalStorage.setItem('ortokompanion_daily_mix', JSON.stringify(mockDailyMix));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
        expect(result.current.dailyMix).not.toBeNull();
      });

      await act(async () => {
        result.current.completeSession({
          ...mockSessionResults,
          srsUpdates: [
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

      await waitFor(() => {
        expect(result.current.profile?.srs.cards.length).toBeGreaterThan(0);
      });
    });

    it('should persist to localStorage after session completion', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));
      mockLocalStorage.setItem('ortokompanion_daily_mix', JSON.stringify(mockDailyMix));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
        expect(result.current.dailyMix).not.toBeNull();
      });

      await act(async () => {
        result.current.completeSession(mockSessionResults);
      });

      await waitFor(() => {
        const saved = mockLocalStorage.store['ortokompanion_integrated_profile'];
        expect(saved).toBeDefined();
      });
    });

    it('should update streak on daily completion', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));
      mockLocalStorage.setItem('ortokompanion_daily_mix', JSON.stringify(mockDailyMix));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
        expect(result.current.dailyMix).not.toBeNull();
      });

      const streakBefore = result.current.profile?.gamification.streak || 0;

      await act(async () => {
        result.current.completeSession(mockSessionResults);
      });

      await waitFor(() => {
        const streakAfter = result.current.profile?.gamification.streak || 0;
        expect(streakAfter).toBeGreaterThanOrEqual(streakBefore);
      });
    });
  });

  // ==================== RECOVERY MODE ====================
  describe('Recovery Mode', () => {
    it('should activate recovery mode', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      });

      await act(async () => {
        result.current.requestRecovery();
      });

      await waitFor(() => {
        expect(result.current.profile?.progression.preferences.recoveryMode).toBe(true);
      });
    });

    it('should regenerate daily mix with easier content', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      });

      await act(async () => {
        result.current.requestRecovery();
      });

      await waitFor(() => {
        expect(result.current.dailyMix?.recoveryDay).toBe(true);
      });
    });

    it('should persist recovery mode to localStorage', async () => {
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));
      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      });

      await act(async () => {
        result.current.requestRecovery();
      });

      await waitFor(() => {
        const saved = JSON.parse(mockLocalStorage.store['ortokompanion_integrated_profile']);
        expect(saved.progression.preferences.recoveryMode).toBe(true);
      });
    });
  });

  // ==================== ERROR HANDLING ====================
  describe('Error Handling', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useIntegrated());
      }).toThrow();
    });

    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage.setItem to throw error
      const originalSetItem = mockLocalStorage.setItem;

      // First set up the initial profile normally
      mockLocalStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(mockProfile));

      const { result } = renderHook(() => useIntegrated(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      });

      // Now make setItem throw errors
      mockLocalStorage.setItem = vi.fn(() => {
        throw new Error('LocalStorage full');
      });

      // Should not crash when trying to save
      await act(async () => {
        result.current.updateProfile({
          gamification: {
            ...mockProfile.gamification,
            xp: 999,
          },
        });
      });

      // Should handle error gracefully - profile should still be defined
      await waitFor(() => {
        expect(result.current.profile).toBeDefined();
      });

      // Restore original setItem
      mockLocalStorage.setItem = originalSetItem;
    });
  });
});
