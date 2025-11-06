'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  IntegratedUserProfile,
  SessionResults,
  IntegratedAnalytics,
  DailyState,
} from '@/types/integrated';
import { DailyMix, OSCEResult, DomainStatus } from '@/types/progression';
import { Domain, SevenDayPlan } from '@/types/onboarding';
import {
  generateIntegratedDailyMix,
  handleSessionCompletion,
  calculateIntegratedAnalytics,
  loadAvailableContent,
} from '@/lib/integrated-helpers';
import { isGateRequirementMet } from '@/lib/domain-progression';
import { ALL_QUESTIONS } from '@/data/questions';
import { safeGetItem, safeSetItem, handleErrorSync } from '@/lib/error-handler';
import { useToast } from '@/components/ui/ToastContainer';

interface IntegratedContextType {
  profile: IntegratedUserProfile | null;
  dailyMix: DailyMix | null;
  analytics: IntegratedAnalytics | null;

  // Profile management
  updateProfile: (updates: Partial<IntegratedUserProfile>) => void;
  setProfile: (profile: IntegratedUserProfile | null) => void;

  // Daily mix management
  refreshDailyMix: () => void;

  // Session management
  completeSession: (results: SessionResults) => void;

  // Mini-OSCE management
  completeMiniOSCE: (result: OSCEResult) => void;

  // Recovery mode
  requestRecovery: () => void;

  // Loading states
  isLoading: boolean;
}

const IntegratedContext = createContext<IntegratedContextType | undefined>(undefined);

interface IntegratedProviderProps {
  children: ReactNode;
}

export function IntegratedProvider({ children }: IntegratedProviderProps) {
  const toast = useToast();
  const [profile, setProfileState] = useState<IntegratedUserProfile | null>(null);
  const [dailyMix, setDailyMix] = useState<DailyMix | null>(null);
  const [analytics, setAnalytics] = useState<IntegratedAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from localStorage on mount
  useEffect(() => {
    const loadProfile = () => {
      const profile = safeGetItem<IntegratedUserProfile | null>(
        'ortokompanion_integrated_profile',
        null
      );

      if (profile) {
        // Convert date strings back to Date objects
        if (profile.gamification?.lastActivity) {
          profile.gamification.lastActivity = new Date(profile.gamification.lastActivity);
        }
        if (profile.progression?.history) {
          // Convert dates in history
          profile.progression.history.osceResults = profile.progression.history.osceResults.map(r => ({
            ...r,
            completedAt: new Date(r.completedAt),
          }));
        }
        setProfileState(profile);
      }
      setIsLoading(false);
    };

    loadProfile();
  }, []);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (profile) {
      // Save profile
      const saveSuccess = safeSetItem('ortokompanion_integrated_profile', profile);
      if (!saveSuccess) {
        console.warn('Failed to save profile to localStorage - data may be lost on refresh');
      }

      // Recalculate analytics when profile changes
      const newAnalytics = handleErrorSync(
        () => calculateIntegratedAnalytics(profile),
        {
          operation: 'calculateAnalytics',
          fallbackValue: null,
          showToast: false,
        }
      );

      if (newAnalytics) {
        setAnalytics(newAnalytics);
      }
    }
  }, [profile]);

  // Function to refresh daily mix - defined before useEffect that uses it
  const refreshDailyMix = useCallback(() => {
    if (!profile) {
      console.warn('Cannot refresh daily mix: no profile');
      return;
    }

    const newMix = handleErrorSync(
      () => generateIntegratedDailyMix(profile, ALL_QUESTIONS),
      {
        operation: 'generateDailyMix',
        fallbackValue: null,
        showToast: false,
        context: {
          primaryDomain: profile.progression.primaryDomain,
          currentBand: profile.progression.bandStatus.currentBand,
        },
      }
    );

    if (newMix) {
      setDailyMix(newMix);
    } else {
      console.error('Failed to generate daily mix - user will see empty dashboard');
      // Could set a fallback empty mix or show error state
    }
  }, [profile]);

  // Load daily mix from localStorage
  useEffect(() => {
    if (!profile) return;

    const savedMix = safeGetItem<DailyMix | null>('ortokompanion_daily_mix', null);

    if (savedMix) {
      // Check if mix is still valid for today
      const mixDate = new Date(savedMix.date);
      const today = new Date();
      mixDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (mixDate.getTime() === today.getTime()) {
        setDailyMix(savedMix);
      } else {
        // Mix is outdated, generate new one
        refreshDailyMix();
      }
    } else {
      // No saved mix, generate one
      refreshDailyMix();
    }
  }, [profile, refreshDailyMix]);

  // Save daily mix to localStorage
  useEffect(() => {
    if (dailyMix) {
      safeSetItem('ortokompanion_daily_mix', dailyMix);
    }
  }, [dailyMix]);

  const updateProfile = (updates: Partial<IntegratedUserProfile>) => {
    setProfileState((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const setProfile = (newProfile: IntegratedUserProfile | null) => {
    setProfileState(newProfile);
  };

  const completeSession = (results: SessionResults) => {
    if (!profile || !dailyMix) {
      console.warn('Cannot complete session: missing profile or daily mix');
      return;
    }

    const updatedProfile = handleErrorSync(
      () => handleSessionCompletion(profile, results, dailyMix),
      {
        operation: 'completeSession',
        fallbackValue: null,
        showToast: false,
        context: {
          xpEarned: results.summary.xpEarned,
          questionsAnswered: results.summary.questionsAnswered,
          accuracy: results.summary.accuracy,
        },
      }
    );

    if (updatedProfile) {
      // Check if band was adjusted
      const bandChanged = updatedProfile.progression.bandStatus.currentBand !== profile.progression.bandStatus.currentBand;

      // Check for new leech cards
      const previousLeechCount = profile.progression.srs.leechCards.length;
      const newLeechCount = updatedProfile.progression.srs.leechCards.length;
      const leechCardsDetected = newLeechCount > previousLeechCount;

      // Check for recovery mode auto-trigger
      const recoveryModeChanged = (updatedProfile.preferences?.recoveryMode || false) !== (profile.preferences?.recoveryMode || false);
      const enteredRecoveryMode = updatedProfile.preferences?.recoveryMode && recoveryModeChanged;

      setProfileState(updatedProfile);

      // Auto-refresh daily mix if band changed or recovery mode triggered
      if (bandChanged) {
        console.log('🔄 Band adjusted! Regenerating daily mix for new difficulty level...');
        toast.info('Band Adjusted', `Moved to Band ${updatedProfile.progression.bandStatus.currentBand}`);
        refreshDailyMix();
      }

      // Notify user if recovery mode auto-triggered
      if (enteredRecoveryMode) {
        console.log('⚠️ Recovery mode auto-triggered after 2 difficult days');
        toast.warning(
          'Recovery Mode Activated',
          'Two difficult days detected. Content adjusted to easier level to help you recover.'
        );
        refreshDailyMix(); // Refresh mix to apply recovery mode
      }

      // Notify user of leech cards
      if (leechCardsDetected) {
        const newLeechCards = newLeechCount - previousLeechCount;
        toast.warning(
          'Problematic Cards Detected',
          `${newLeechCards} card(s) need focused review. Consider taking a remediation session.`
        );
      }

      // Track event (could integrate with analytics service)
      console.log('Session completed:', {
        xp: results.summary.xpEarned,
        accuracy: results.summary.accuracy,
        band: updatedProfile.progression.bandStatus.currentBand,
        levelUp: updatedProfile.gamification.level > profile.gamification.level,
        bandAdjusted: bandChanged,
        leechCardsDetected,
      });
    } else {
      console.error('Failed to complete session - profile not updated');
      toast.error('Session Error', 'Failed to save session progress');
    }
  };

  const completeMiniOSCE = (result: OSCEResult) => {
    if (!profile) {
      console.warn('Cannot complete Mini-OSCE: no profile');
      return;
    }

    const updatedProfile = handleErrorSync(
      () => {
        // Extract domain from OSCE ID (e.g., "hoeft-pff-001" -> "höft")
        const domainKey = result.osceId.split('-')[0];
        const domainMap: Record<string, Domain> = {
          'hoeft': 'höft',
          'fotled': 'fot-fotled',
          'axel': 'axel-armbåge',
          'trauma': 'trauma',
        };
        const domain = domainMap[domainKey] || ('trauma' as Domain);

        // Update domain gate progress
        const domainStatus = { ...profile.progression.domainStatuses[domain] };

        if (result.passed) {
          domainStatus.gateProgress = {
            ...domainStatus.gateProgress,
            miniOSCEPassed: true,
            miniOSCEScore: result.percentage,
            miniOSCEDate: new Date(),
          };

          // Check if all gates complete
          if (isGateRequirementMet(domainStatus, profile.progression.srs.cards)) {
            domainStatus.status = 'completed';
            domainStatus.completedAt = new Date();
          }
        }

        // Add to history
        const updatedHistory = [...profile.progression.history.osceResults, result];

        // Award XP for OSCE
        const osceXP = result.passed ? 100 : 50;
        const newXP = profile.gamification.xp + osceXP;
        const newLevel = Math.floor(newXP / 100) + 1;

        // Check for OSCE badge
        const newBadges = [...profile.gamification.badges];
        if (result.passed && !newBadges.includes('first_osce')) {
          newBadges.push('first_osce');
        }

        // Return updated profile
        return {
          ...profile,
          gamification: {
            ...profile.gamification,
            xp: newXP,
            level: newLevel,
            badges: newBadges,
          },
          progression: {
            ...profile.progression,
            domainStatuses: {
              ...profile.progression.domainStatuses,
              [domain]: domainStatus,
            },
            history: {
              ...profile.progression.history,
              osceResults: updatedHistory,
            },
          },
        };
      },
      {
        operation: 'completeMiniOSCE',
        fallbackValue: null,
        showToast: false,
        context: {
          osceId: result.osceId,
          passed: result.passed,
          score: result.percentage,
        },
      }
    );

    if (updatedProfile) {
      setProfileState(updatedProfile);
      console.log('Mini-OSCE completed successfully');
    } else {
      console.error('Failed to complete Mini-OSCE - profile not updated');
    }
  };

  const requestRecovery = () => {
    if (!profile) {
      console.warn('Cannot request recovery: no profile');
      return;
    }

    const result = handleErrorSync(
      () => {
        // Activate recovery mode
        const updatedProfile = {
          ...profile,
          preferences: {
            ...profile.preferences,
            recoveryMode: true,
          },
        };

        // Regenerate daily mix with recovery settings
        const recoveryMix = generateIntegratedDailyMix(updatedProfile, ALL_QUESTIONS);

        return { updatedProfile, recoveryMix };
      },
      {
        operation: 'requestRecovery',
        fallbackValue: null,
        showToast: false,
      }
    );

    if (result) {
      setProfileState(result.updatedProfile);
      setDailyMix(result.recoveryMix);
      console.log('Recovery mode activated');
    } else {
      console.error('Failed to activate recovery mode');
    }
  };

  const value: IntegratedContextType = {
    profile,
    dailyMix,
    analytics,
    updateProfile,
    setProfile,
    refreshDailyMix,
    completeSession,
    completeMiniOSCE,
    requestRecovery,
    isLoading,
  };

  return (
    <IntegratedContext.Provider value={value}>
      {children}
    </IntegratedContext.Provider>
  );
}

export function useIntegrated() {
  const context = useContext(IntegratedContext);
  if (context === undefined) {
    throw new Error('useIntegrated must be used within IntegratedProvider');
  }
  return context;
}
