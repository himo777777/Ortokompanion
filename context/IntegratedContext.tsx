'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  const [profile, setProfileState] = useState<IntegratedUserProfile | null>(null);
  const [dailyMix, setDailyMix] = useState<DailyMix | null>(null);
  const [analytics, setAnalytics] = useState<IntegratedAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('ortokompanion_integrated_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        // Convert date strings back to Date objects
        if (parsed.gamification?.lastActivity) {
          parsed.gamification.lastActivity = new Date(parsed.gamification.lastActivity);
        }
        setProfileState(parsed);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (profile) {
      try {
        localStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(profile));
        // Recalculate analytics when profile changes
        const newAnalytics = calculateIntegratedAnalytics(profile);
        setAnalytics(newAnalytics);
      } catch (error) {
        console.error('Failed to save profile:', error);
      }
    }
  }, [profile]);

  // Load daily mix from localStorage
  useEffect(() => {
    try {
      const savedMix = localStorage.getItem('ortokompanion_daily_mix');
      if (savedMix) {
        const parsed = JSON.parse(savedMix);
        // Check if mix is still valid for today
        const mixDate = new Date(parsed.date);
        const today = new Date();
        mixDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (mixDate.getTime() === today.getTime()) {
          setDailyMix(parsed);
        } else {
          // Mix is outdated, generate new one
          if (profile) {
            refreshDailyMix();
          }
        }
      } else if (profile) {
        // No saved mix, generate one
        refreshDailyMix();
      }
    } catch (error) {
      console.error('Failed to load daily mix:', error);
    }
  }, [profile]);

  // Save daily mix to localStorage
  useEffect(() => {
    if (dailyMix) {
      try {
        localStorage.setItem('ortokompanion_daily_mix', JSON.stringify(dailyMix));
      } catch (error) {
        console.error('Failed to save daily mix:', error);
      }
    }
  }, [dailyMix]);

  const updateProfile = (updates: Partial<IntegratedUserProfile>) => {
    setProfileState((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const setProfile = (newProfile: IntegratedUserProfile | null) => {
    setProfileState(newProfile);
  };

  const refreshDailyMix = () => {
    if (!profile) {
      console.warn('Cannot refresh daily mix: no profile');
      return;
    }

    try {
      const newMix = generateIntegratedDailyMix(profile, ALL_QUESTIONS);
      setDailyMix(newMix);
    } catch (error) {
      console.error('Failed to generate daily mix:', error);
    }
  };

  const completeSession = (results: SessionResults) => {
    if (!profile || !dailyMix) {
      console.warn('Cannot complete session: missing profile or daily mix');
      return;
    }

    try {
      // Update profile with session results
      const updatedProfile = handleSessionCompletion(profile, results, dailyMix);
      setProfileState(updatedProfile);

      // Track event (could integrate with analytics service)
      console.log('Session completed:', {
        xp: results.summary.xpEarned,
        accuracy: results.summary.accuracy,
        band: updatedProfile.progression.bandStatus.currentBand,
      });
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
  };

  const completeMiniOSCE = (result: OSCEResult) => {
    if (!profile) {
      console.warn('Cannot complete Mini-OSCE: no profile');
      return;
    }

    try {
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

      // Update profile
      setProfileState({
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
      });

      console.log('Mini-OSCE completed:', {
        domain,
        passed: result.passed,
        score: result.percentage,
      });
    } catch (error) {
      console.error('Failed to complete Mini-OSCE:', error);
    }
  };

  const requestRecovery = () => {
    if (!profile) {
      console.warn('Cannot request recovery: no profile');
      return;
    }

    try {
      // Activate recovery mode
      const updatedProfile = {
        ...profile,
        preferences: {
          ...profile.preferences,
          recoveryMode: true,
        },
      };
      setProfileState(updatedProfile);

      // Regenerate daily mix with recovery settings
      const recoveryMix = generateIntegratedDailyMix(updatedProfile, ALL_QUESTIONS);
      setDailyMix(recoveryMix);

      console.log('Recovery mode activated');
    } catch (error) {
      console.error('Failed to request recovery:', error);
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
