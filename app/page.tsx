'use client';

import { useState, useEffect, useMemo } from 'react';

// Force dynamic rendering to avoid build-time localStorage access
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;
import { EducationLevel } from '@/types/education';
import { SevenDayPlan, UserProfile, Domain } from '@/types/onboarding';
import { DifficultyBand } from '@/types/progression';
import QuickStart from '@/components/onboarding/QuickStart';
import { toDomain } from '@/lib/ai-utils';
import DayPlanView from '@/components/dashboard/DayPlanView';
import ChatInterface from '@/components/ChatInterface';
import { trackEvent, updateStreak, checkBadgeEarned } from '@/lib/onboarding-utils';
import { useIntegrated } from '@/context/IntegratedContext';
import { logger } from '@/lib/logger';
import {
  createIntegratedProfile,
  migrateToIntegratedProfile,
  loadAvailableContent,
  generateIntegratedDailyMix,
} from '@/lib/integrated-helpers';
import DailyPlanDashboard from '@/components/progression/DailyPlanDashboard';
import ExamModulesHub from '@/components/exam/ExamModulesHub';
import ActivitySession from '@/components/progression/ActivitySession';
import QuestionBankBrowser from '@/components/learning/QuestionBankBrowser';
import ClinicalCaseBrowser from '@/components/learning/ClinicalCaseBrowser';
import MedicalQualityDashboard from '@/components/quality/MedicalQualityDashboard';
import FocusTimer from '@/components/study/FocusTimer';
import PerformanceCharts from '@/components/analytics/PerformanceCharts';
import RecommendationWidget from '@/components/dashboard/RecommendationWidget';
import QuickStartView from '@/components/daily-plan/QuickStartView';
import { useToast } from '@/components/ui/ToastContainer';
import KeyboardShortcutsModal from '@/components/ui/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import RotationDashboard from '@/components/rotation/RotationDashboard';
import { SocialstyrelsensGoalsDashboard } from '@/components/progression/SocialstyrelsensGoalsDashboard';
import DailyGoalsCalendar from '@/components/progression/DailyGoalsCalendar';
import { GoalAchievementCelebration } from '@/components/ui/GoalAchievementCelebration';
import { ALL_FOCUSED_GOALS, type SocialstyrelsensGoal } from '@/data/focused-socialstyrelsen-goals';
import {
  MessageSquare,
  FileText,
  BookOpen,
  CalendarDays,
  Settings,
  LogOut,
  Award,
  TrendingUp,
  Target,
  BarChart,
  Map,
  Brain,
  Keyboard,
  Shield,
  Timer,
  GraduationCap,
  Stethoscope,
} from 'lucide-react';

type Tab = 'today' | 'plan' | 'progress' | 'analytics' | 'roadmap' | 'goals' | 'chat' | 'clinicalcases' | 'modules' | 'questions' | 'medical-quality';

// Helper function to map EducationLevel to goal program type
function getUserProgram(level: EducationLevel): 'läkarexamen' | 'bt' | 'at' | 'st' {
  if (level === 'student') return 'läkarexamen';
  if (level === 'at') return 'at';
  if (level.startsWith('st')) return 'st';
  return 'st'; // Default for specialists
}

// v2.0.1 - Fixed domain validation and cache issues - 2025-11-02T18:14
export default function Home() {
  const { profile, setProfile, dailyMix, refreshDailyMix, completeSession, requestRecovery, isLoading } = useIntegrated();
  const toast = useToast();
  const [plan, setPlan] = useState<SevenDayPlan | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [activeActivity, setActiveActivity] = useState<{
    id: string;
    type: 'new' | 'interleave' | 'srs';
    domain: string;
    targetBand?: DifficultyBand;
    questionIds?: string[];
  } | null>(null);
  const [achievedGoal, setAchievedGoal] = useState<SocialstyrelsensGoal | null>(null);

  // Memoize expensive domain performance calculation
  const weakDomains = useMemo(() => {
    if (!profile) return [];

    const domainPerformance = Object.entries(profile.progression.domainStatuses)
      .map(([domain, status]) => ({
        domain,
        completionRate: status.totalItems > 0 ? status.itemsCompleted / status.totalItems : 0,
        status: status.status,
      }))
      .filter(d => d.status === 'active' || d.status === 'gated')
      .sort((a, b) => a.completionRate - b.completionRate);

    // Return bottom 3 domains with less than 70% completion
    return domainPerformance
      .filter(d => d.completionRate < 0.7)
      .slice(0, 3)
      .map(d => d.domain as Domain);
  }, [profile]); // Only recalculate when profile changes

  // Memoize current goals calculation
  const currentGoals = useMemo(() => {
    if (!profile) return [];

    const goals = [];
    const currentBand = profile.progression.bandStatus.currentBand;
    const nextBand = `Band ${parseInt(currentBand.split(' ')[1]) + 1}`;

    goals.push(`Nå ${nextBand}`);

    // Add domain-specific goals using memoized weakDomains
    if (weakDomains.length > 0) {
      goals.push(`Förbättra inom ${weakDomains[0]}`);
    }

    // Add accuracy goal if below 80%
    const currentAccuracy = profile.progression.bandStatus.recentPerformance.correctRate * 100;
    if (currentAccuracy < 80) {
      goals.push('Öka träffsäkerhet till 80%');
    }

    return goals.slice(0, 3);
  }, [profile, weakDomains]); // Depends on profile and weakDomains

  // Keyboard shortcuts - disabled when activity is active to prevent accidental triggers
  useKeyboardShortcuts([
    { key: '1', description: 'Gå till Dagens Plan', action: () => setActiveTab('today') },
    { key: '2', description: 'Gå till Progression', action: () => setActiveTab('progress') },
    { key: '3', description: 'Gå till Analytics', action: () => setActiveTab('analytics') },
    // Chat shortcut removed to prevent accidental activation
    // { key: '4', description: 'Gå till AI-Handledare', action: () => setActiveTab('chat') },
    { key: '5', description: 'Gå till Kliniska Fall', action: () => setActiveTab('clinicalcases') },
    { key: '6', description: 'Gå till Frågebank', action: () => setActiveTab('questions') },
    { key: '8', description: 'Gå till Provexamen', action: () => setActiveTab('modules') },
    { key: '9', description: 'Gå till Medicinsk Kvalitet', action: () => setActiveTab('medical-quality') },
    { key: 'f', description: 'Öppna Fokustimer', action: () => setShowFocusTimer(true) },
    { key: '?', shift: true, description: 'Visa kortkommandon', action: () => setShowKeyboardHelp(true) },
    { key: 'Escape', description: 'Stäng modaler', action: () => { setShowKeyboardHelp(false); setShowFocusTimer(false); setActiveActivity(null); } },
  ], !showOnboarding && !!profile && !activeActivity); // Disable shortcuts during activities

  // Check for existing profile or trigger onboarding
  useEffect(() => {
    if (!isLoading) {
      if (!profile) {
        // Check for old profile format and migrate if needed
        const oldProfile = localStorage.getItem('ortokompanion_profile');
        const oldPlan = localStorage.getItem('ortokompanion_plan');

        if (oldProfile && oldPlan) {
          try {
            const parsedProfile = JSON.parse(oldProfile);
            const parsedPlan = JSON.parse(oldPlan);

            // Migrate to integrated profile
            const integratedProfile = migrateToIntegratedProfile(
              parsedProfile,
              parsedPlan
            );

            // Check if onboarding was completed
            if (!integratedProfile.onboardingCompletedAt) {
              logger.info('Profile found but onboarding not completed - showing onboarding');
              setShowOnboarding(true);
              trackEvent('onboard_incomplete');
              return;
            }

            setProfile(integratedProfile);
            setPlan(parsedPlan);

            // Generate daily mix
            setTimeout(() => refreshDailyMix(), 100);

            trackEvent('profile_migrated', { userId: integratedProfile.id });
          } catch (error) {
            logger.error('Migration failed', error);
            setShowOnboarding(true);
          }
        } else {
          setShowOnboarding(true);
          trackEvent('onboard_start');
        }
      } else {
        trackEvent('session_start', { userId: profile.id });
      }
    }
  }, [isLoading, profile, setProfile, refreshDailyMix]);

  const handleOnboardingComplete = (newProfile: UserProfile, newPlan: SevenDayPlan) => {
    // Create integrated profile
    const integratedProfile = createIntegratedProfile(newProfile, newPlan);
    setProfile(integratedProfile);
    setPlan(newPlan);
    setShowOnboarding(false);
    setActiveTab('today');

    // Generate first daily mix
    setTimeout(() => refreshDailyMix(), 100);

    trackEvent('onboard_complete', { userId: newProfile.id });
  };

  const handleCompleteItem = (dayIndex: number, itemId: string) => {
    if (!plan || !profile) return;

    const updatedPlan = { ...plan };
    const day = updatedPlan.days[dayIndex];
    const item = day.items.find(i => i.id === itemId);

    if (item && !item.completed) {
      item.completed = true;

      // Uppdatera XP
      const newXP = profile.gamification.xp + item.xpReward;
      const newLevel = Math.floor(newXP / 100) + 1;

      // Uppdatera streak
      const newStreak = updateStreak(profile);

      // Kolla badges
      const newBadge = checkBadgeEarned(profile, `complete-${item.type}`);
      const badges = newBadge
        ? [...profile.gamification.badges, newBadge]
        : profile.gamification.badges;

      // Kolla om dag är klar
      if (day.items.every(i => i.completed)) {
        day.completed = true;
        const dayBadge = checkBadgeEarned(profile, `complete-day-${dayIndex + 1}`);
        if (dayBadge && !badges.includes(dayBadge)) {
          badges.push(dayBadge);
        }
      }

      const updatedProfile = {
        ...profile,
        gamification: {
          ...profile.gamification,
          xp: newXP,
          level: newLevel,
          streak: newStreak,
          badges,
          lastActivity: new Date(),
        },
      };

      setPlan(updatedPlan);
      setProfile(updatedProfile);

      // Spara
      localStorage.setItem('ortokompanion_plan', JSON.stringify(updatedPlan));
      localStorage.setItem('ortokompanion_profile', JSON.stringify(updatedProfile));

      trackEvent('item_completed', {
        itemId,
        type: item.type,
        day: dayIndex + 1,
        xpEarned: item.xpReward,
      });

      if (newBadge) {
        trackEvent('badge_earned', { badge: newBadge });
      }
    }
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = {
      ...profile,
      ...updates,
      gamification: {
        ...profile.gamification,
        ...(updates.gamification || {}),
        freezeTokens: profile.gamification.freezeTokens, // Preserve freezeTokens
      },
    };
    setProfile(updated);
    localStorage.setItem('ortokompanion_profile', JSON.stringify(updated));
  };

  const handleResetOnboarding = () => {
    if (confirm('Är du säker på att du vill börja om? All progress kommer att raderas.')) {
      localStorage.removeItem('ortokompanion_profile');
      localStorage.removeItem('ortokompanion_plan');
      setProfile(null);
      setPlan(null);
      setShowOnboarding(true);
      trackEvent('reset_onboarding');
    }
  };

  if (showOnboarding) {
    return <QuickStart onComplete={handleOnboardingComplete} />;
  }

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    );
  }

  // Extract recent topics from activity history
  const getRecentTopics = () => {
    if (!profile || !profile.progression.history) return [];

    // TODO: Implement when activity tracking is added to history
    // Currently history only contains bandAdjustments, osceResults, retentionChecks
    return [];
  };

  // Track mistake patterns from history
  const getMistakePatterns = () => {
    if (!profile || !profile.progression.history) return [];

    // TODO: Implement when activity tracking is added to history
    // Currently history only contains bandAdjustments, osceResults, retentionChecks
    return [];
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Ortokompanion</h1>
              <p className="text-sm text-gray-600">
                {profile.role.toUpperCase()}
                {profile.stYear ? ` (År ${profile.stYear})` : ''}
                {' • '}
                Level {profile.gamification.level} • {profile.gamification.xp} XP
                {profile.progression && (
                  <span>
                    {' • '}
                    Band {profile.progression.bandStatus.currentBand}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {profile.gamification.streak > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 border border-orange-300 rounded-full">
                  <span className="text-2xl">🔥</span>
                  <span className="font-semibold text-orange-800">
                    {profile.gamification.streak} dagar
                  </span>
                </div>
              )}
              <button
                onClick={() => setShowFocusTimer(true)}
                className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                title="Fokustimer (F)"
              >
                <Timer className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowKeyboardHelp(true)}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Kortkommandon (Shift + ?)"
              >
                <Keyboard className="w-5 h-5" />
              </button>
              <button
                onClick={handleResetOnboarding}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Börja om</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6">
          <div className="flex gap-0.5 md:gap-1 overflow-x-auto scrollbar-hide">
            <TabButton
              active={activeTab === 'today'}
              onClick={() => setActiveTab('today')}
              icon={<CalendarDays className="w-5 h-5" />}
              label="Dagens Plan"
            />
            <TabButton
              active={activeTab === 'progress'}
              onClick={() => setActiveTab('progress')}
              icon={<TrendingUp className="w-5 h-5" />}
              label="Progression"
            />
            <TabButton
              active={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
              icon={<BarChart className="w-5 h-5" />}
              label="Analytics"
            />
            <TabButton
              active={activeTab === 'chat'}
              onClick={() => setActiveTab('chat')}
              icon={<MessageSquare className="w-5 h-5" />}
              label="AI-Handledare"
            />
            <TabButton
              active={activeTab === 'clinicalcases'}
              onClick={() => setActiveTab('clinicalcases')}
              icon={<Stethoscope className="w-5 h-5" />}
              label="Kliniska Fall"
            />
            <TabButton
              active={activeTab === 'questions'}
              onClick={() => setActiveTab('questions')}
              icon={<Brain className="w-5 h-5" />}
              label="Frågebank"
            />
            <TabButton
              active={activeTab === 'modules'}
              onClick={() => setActiveTab('modules')}
              icon={<BookOpen className="w-5 h-5" />}
              label="Provexamen"
            />
            <TabButton
              active={activeTab === 'medical-quality'}
              onClick={() => setActiveTab('medical-quality')}
              icon={<Shield className="w-5 h-5" />}
              label="Medicinsk Kvalitet"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        {activeTab === 'today' && dailyMix && (
          <div className="max-w-7xl mx-auto px-6">
            {/* QuickStart View - Simplified Daily Plan */}
            <QuickStartView
              dailyMix={dailyMix}
              profile={profile}
              recoveryMode={profile.preferences?.recoveryMode}
              onStartActivity={(activityId, type) => {
                logger.info('Starting activity', { activityId, type });
                logger.info('DailyMix state', {
                  hasDailyMix: !!dailyMix,
                  hasNewContent: !!dailyMix?.newContent,
                  newContentItems: dailyMix?.newContent?.items?.length,
                  hasInterleaving: !!dailyMix?.interleavingContent,
                  interleavingItems: dailyMix?.interleavingContent?.items?.length,
                  hasSRS: !!dailyMix?.srsReviews,
                  srsCards: dailyMix?.srsReviews?.cards?.length,
                });

                // Get domain, questionIds, and targetBand based on activity type
                let domain: Domain = 'trauma';
                let questionIds: string[] = [];
                const targetBand = dailyMix?.targetBand; // Get user's target difficulty band

                if (type === 'new' && dailyMix?.newContent) {
                  domain = dailyMix.newContent.domain;
                  questionIds = (dailyMix.newContent.items || []).filter((id): id is string => id != null && id !== '');
                  logger.info('NEW content loaded', { domain, questionCount: questionIds.length });
                } else if (type === 'interleave' && dailyMix?.interleavingContent) {
                  domain = dailyMix.interleavingContent.domain;
                  questionIds = (dailyMix.interleavingContent.items || []).filter((id): id is string => id != null && id !== '');
                  logger.info('INTERLEAVE content loaded', { domain, questionCount: questionIds.length });
                } else if (type === 'srs' && dailyMix?.srsReviews?.cards) {
                  // For SRS, extract domain from first card
                  domain = dailyMix.srsReviews.cards[0]?.domain || 'trauma';
                  questionIds = dailyMix.srsReviews.cards
                    .map(card => card.contentId)
                    .filter((id): id is string => id != null && id !== '');
                  logger.info('SRS content loaded', { domain, questionCount: questionIds.length });
                }

                logger.info('Setting activeActivity', {
                  id: activityId,
                  type,
                  domain,
                  targetBand,
                  questionIdsCount: questionIds.length,
                  questionIds: questionIds.slice(0, 3), // Log first 3 IDs
                });

                setActiveActivity({
                  id: activityId,
                  type: type,
                  domain: domain,
                  targetBand: targetBand,
                  questionIds: questionIds,
                });

                trackEvent('activity_started', {
                  activityId,
                  type,
                  domain,
                  targetBand,
                  questionCount: questionIds.length,
                  userId: profile.id
                });
              }}
            />
          </div>
        )}
        {activeTab === 'today' && !dailyMix && (
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600 mb-4">Genererar dagens plan...</p>
              <button
                onClick={refreshDailyMix}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Generera nu
              </button>
            </div>
          </div>
        )}
        {activeTab === 'progress' && (
          <div className="max-w-7xl mx-auto px-6">
            {/* Rotation Dashboard (ST-läkare, Student, AT) - Moved from Today tab */}
            {(profile.rotationTimeline || profile.orthoPlacement) && (
              <div className="mb-6">
                <RotationDashboard profile={profile} />
              </div>
            )}

            {/* Daily Goals Calendar */}
            <div className="mb-6">
              <DailyGoalsCalendar profile={profile} />
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Progression & Domänstatus</h2>
              <div className="space-y-6">
                {Object.entries(profile.progression.domainStatuses).map(([domain, status]) => (
                  <div key={domain} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold capitalize">{domain}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        status.status === 'completed' ? 'bg-green-100 text-green-800' :
                        status.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        status.status === 'gated' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status.status}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${status.totalItems > 0 ? (status.itemsCompleted / status.totalItems) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className={status.gateProgress.miniOSCEPassed ? 'text-green-600' : 'text-gray-400'}>
                        {status.gateProgress.miniOSCEPassed ? '✓' : '○'} Mini-OSCE
                      </div>
                      <div className={status.gateProgress.retentionCheckPassed ? 'text-green-600' : 'text-gray-400'}>
                        {status.gateProgress.retentionCheckPassed ? '✓' : '○'} Retention
                      </div>
                      <div className={status.gateProgress.srsCardsStable ? 'text-green-600' : 'text-gray-400'}>
                        {status.gateProgress.srsCardsStable ? '✓' : '○'} SRS Stability
                      </div>
                      <div className={status.gateProgress.complicationCasePassed ? 'text-green-600' : 'text-gray-400'}>
                        {status.gateProgress.complicationCasePassed ? '✓' : '○'} Complication
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h2>
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-medium">Total XP</p>
                  <p className="text-3xl font-bold text-blue-900">{profile.gamification.xp}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-600 font-medium">Level</p>
                  <p className="text-3xl font-bold text-purple-900">{profile.gamification.level}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium">Accuracy</p>
                  <p className="text-3xl font-bold text-green-900">
                    {Math.round(profile.progression.bandStatus.recentPerformance.correctRate * 100)}%
                  </p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-600 font-medium">Current Band</p>
                  <p className="text-3xl font-bold text-orange-900">{profile.progression.bandStatus.currentBand}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">SRS Statistics</h3>
                  <div className="space-y-2">
                    <p className="text-sm">Total Cards: <span className="font-bold">{profile.progression.srs.cards.length}</span></p>
                    <p className="text-sm">Due Today: <span className="font-bold">{profile.progression.srs.dueToday.length}</span></p>
                    <p className="text-sm">Average Stability: <span className="font-bold">
                      {Math.round((profile.progression.srs.cards.reduce((sum, c) => sum + c.stability, 0) / profile.progression.srs.cards.length || 0) * 100)}%
                    </span></p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Band History</h3>
                  <div className="space-y-2">
                    {profile.progression.bandStatus.bandHistory.slice(-5).reverse().map((entry, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-bold">Band {entry.band}</span>
                        <span className="text-gray-600 ml-2">
                          {new Date(entry.date).toLocaleDateString('sv-SE')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Charts */}
              <div className="mt-8">
                <PerformanceCharts
                  xpProgress={{
                    current: profile.gamification.xp,
                    target: (profile.gamification.level + 1) * 100,
                    milestones: Array.from({ length: 5 }, (_, i) => ({
                      level: profile.gamification.level + i + 1,
                      xp: (profile.gamification.level + i + 1) * 100,
                    })),
                  }}
                />
              </div>
            </div>
          </div>
        )}
        {activeTab === 'chat' && (
          <div className="max-w-7xl mx-auto px-6">
            <ChatInterface
              level={profile.role}
              userContext={{
                currentAccuracy: profile.progression.bandStatus.recentPerformance.correctRate * 100,
                weakDomains: weakDomains,
                recentTopics: getRecentTopics(),
                currentGoals: currentGoals,
                mistakePatterns: getMistakePatterns(),
                currentBand: profile.progression.bandStatus.currentBand,
                totalXP: profile.gamification.xp,
                level: profile.gamification.level,
                streak: profile.gamification.streak,
              }}
            />
          </div>
        )}
        {activeTab === 'clinicalcases' && (
          <ClinicalCaseBrowser
            userLevel={profile.role}
            onCaseComplete={(results) => {
              // Track case completion
              trackEvent('clinical_case_completed', {
                caseId: results.caseId,
                mode: results.mode,
                stepsCompleted: results.stepsCompleted,
                hintsUsed: results.hintsUsed,
                questionsAnswered: results.questionsAnswered,
                correctAnswers: results.correctAnswers,
                timeSpent: results.timeSpent,
                score: results.score,
                userId: profile.id,
              });

              // Award XP
              const newXP = profile.gamification.xp + results.xpEarned;
              const newLevel = Math.floor(newXP / 100) + 1;

              handleUpdateProfile({
                gamification: {
                  ...profile.gamification,
                  xp: newXP,
                  level: newLevel,
                },
              });

              toast.success(
                `Kliniskt fall slutfört! +${results.xpEarned} XP`,
                `Poäng: ${results.score}/100${
                  results.mode === 'guided'
                    ? ` (${results.hintsUsed} ledtrådar använda)`
                    : ` (${results.correctAnswers}/${results.questionsAnswered} rätt)`
                }`
              );
            }}
          />
        )}
        {activeTab === 'questions' && (
          <div className="max-w-7xl mx-auto px-6">
            <QuestionBankBrowser
              userLevel={profile.role}
              onQuestionCompleted={(questionId, correct, hintsUsed) => {
                // Track question completion
                trackEvent('question_completed', {
                  questionId,
                  correct,
                  hintsUsed,
                  userId: profile.id,
                });

                // Award XP
                if (correct) {
                  const baseXP = 20;
                  const xpPenalty = hintsUsed * 5;
                  const earnedXP = Math.max(baseXP - xpPenalty, 5);

                  const newXP = profile.gamification.xp + earnedXP;
                  const newLevel = Math.floor(newXP / 100) + 1;

                  handleUpdateProfile({
                    gamification: {
                      ...profile.gamification,
                      xp: newXP,
                      level: newLevel,
                    },
                  });
                }
              }}
            />
          </div>
        )}
        {activeTab === 'modules' && (
          <div className="max-w-7xl mx-auto px-6">
            <ExamModulesHub />
          </div>
        )}
        {activeTab === 'medical-quality' && (
          <div className="max-w-7xl mx-auto">
            <MedicalQualityDashboard
              userId={profile?.id || 'current-user'}
              onReviewStart={(contentId) => {
                logger.info('Starting review', { contentId });
              }}
              onAlertAction={(alertId, action) => {
                logger.info('Alert action', { alertId, action });
              }}
            />
          </div>
        )}
      </div>

      {/* Activity Session Modal */}
      {activeActivity && activeActivity.id && activeActivity.type && activeActivity.domain && (
        <ActivitySession
          activityId={activeActivity.id}
          activityType={activeActivity.type}
          domain={activeActivity.domain as Domain}
          userLevel={profile.role}
          targetBand={activeActivity.targetBand}
          questionIds={activeActivity.questionIds}
          profile={profile}
          weakDomains={dailyMix?.weakDomains}
          onComplete={(sessionResults) => {
            if (!activeActivity) return; // Extra safety check
            trackEvent('activity_completed', {
              activityId: activeActivity.id,
              type: activeActivity.type,
              domain: activeActivity.domain,
              userId: profile.id,
              questionsCompleted: sessionResults.summary.questionsAnswered,
              correctAnswers: sessionResults.summary.correctAnswers,
              totalXP: sessionResults.summary.xpEarned,
              timeSpent: sessionResults.summary.timeSpent,
              accuracy: sessionResults.summary.accuracy,
              srsCardsCreated: sessionResults.srsUpdates.length,
            });

            // Use completeSession to handle ALL profile updates
            // This will:
            // - Update XP, level, streak, badges
            // - Add/update SRS cards
            // - Update band adjustments
            // - Update domain progress
            // - Update Socialstyrelsen mål
            const oldXP = profile.gamification.xp;
            const oldLevel = profile.gamification.level;
            const oldProgress = [...profile.socialstyrelseMålProgress];

            completeSession(sessionResults);

            // Show success toast
            const newXP = oldXP + sessionResults.summary.xpEarned;
            const newLevel = Math.floor(newXP / 100) + 1;
            const leveledUp = newLevel > oldLevel;

            const accuracy = Math.round(sessionResults.summary.accuracy);
            if (leveledUp) {
              toast.success(
                `Nivå ${newLevel} uppnådd! 🎉`,
                `Du tjänade ${sessionResults.summary.xpEarned} XP med ${accuracy}% träffsäkerhet`
              );
            } else {
              toast.success(
                `Aktivitet slutförd! +${sessionResults.summary.xpEarned} XP`,
                `${sessionResults.summary.correctAnswers}/${sessionResults.summary.questionsAnswered} rätt (${accuracy}%)`
              );
            }

            // Check for goal achievements after profile updates
            setTimeout(() => {
              const newlyAchievedProgress = profile.socialstyrelseMålProgress.find(
                (mp) => mp.achieved && !oldProgress.find((op) => op.goalId === mp.goalId && op.achieved)
              );

              if (newlyAchievedProgress) {
                const goal = ALL_FOCUSED_GOALS.find((g) => g.id === newlyAchievedProgress.goalId);
                if (goal) {
                  setAchievedGoal(goal);
                }
              }
            }, 100);

            setActiveActivity(null);
            // Refresh daily mix after profile updates settle
            setTimeout(() => refreshDailyMix(), 200);
          }}
          onClose={() => {
            if (!activeActivity) return; // Extra safety check
            trackEvent('activity_cancelled', {
              activityId: activeActivity.id,
              type: activeActivity.type,
              userId: profile.id,
            });
            setActiveActivity(null);
          }}
        />
      )}

      {/* Goal Achievement Celebration */}
      {achievedGoal && (
        <GoalAchievementCelebration
          goal={achievedGoal}
          isOpen={!!achievedGoal}
          onClose={() => setAchievedGoal(null)}
        />
      )}

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />

      {/* Focus Timer Modal */}
      {showFocusTimer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-scaleIn">
            <FocusTimer
              onSessionComplete={(stats) => {
                // Award bonus XP for completing pomodoros
                const newXP = profile.gamification.xp + stats.xpBonus;
                const newLevel = Math.floor(newXP / 100) + 1;

                handleUpdateProfile({
                  gamification: {
                    ...profile.gamification,
                    xp: newXP,
                    level: newLevel,
                  },
                });

                toast.success(
                  `Fokussession slutförd! +${stats.xpBonus} XP`,
                  `${stats.pomodorosCompleted} pomodoros, ${Math.floor(stats.totalFocusTime / 60)} minuters fokustid`
                );

                setShowFocusTimer(false);
              }}
              onClose={() => setShowFocusTimer(false)}
            />
          </div>
        </div>
      )}
    </main>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
        active
          ? 'border-blue-500 text-blue-600 bg-blue-50'
          : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="hidden sm:inline text-sm md:text-base">{label}</span>
    </button>
  );
}

// Placeholder komponent för kunskapsmoduler (från original)
function KnowledgeModules({ level }: { level: EducationLevel }) {
  const modules = [
    {
      title: 'Anatomi och Fysiologi',
      description: 'Grundläggande muskuloskeletala strukturer',
      topics: ['Axel', 'Armbåge', 'Handled och hand', 'Höft', 'Knä', 'Fot och fotled', 'Ryggrad'],
    },
    {
      title: 'Frakturer och Luxationer',
      description: 'Diagnos och behandling av skelettskador',
      topics: ['Frakturläkning', 'AO-klassifikation', 'Reposition och fixation', 'Komplikationer'],
    },
    {
      title: 'Ledsjukdomar',
      description: 'Degenerativa och inflammatoriska ledsjukdomar',
      topics: ['Artros', 'Reumatoid artrit', 'Kristallartropati', 'Septisk artrit'],
    },
    {
      title: 'Sportskador',
      description: 'Vanliga idrottsskador och deras behandling',
      topics: ['Korsbandsskador', 'Meniskskador', 'Rotator cuff', 'Achillesruptur'],
    },
    {
      title: 'Kirurgiska Tekniker',
      description: 'Operativa metoder inom ortopedi',
      topics: ['Artroskopi', 'Artroplastik', 'Osteotomi', 'Frakturbehandling'],
    },
    {
      title: 'Pediatrisk Ortopedi',
      description: 'Ortopediska tillstånd hos barn',
      topics: ['Höftluxation', 'Klumpfot', 'Skolios', 'Tillväxtstörningar'],
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Kunskapsmoduler</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{module.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{module.description}</p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Innehåll:</p>
              <ul className="space-y-1">
                {module.topics.map((topic, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-blue-500">•</span>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
            <button className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
              Starta modul
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-center text-gray-700">
          💡 Modulerna anpassas automatiskt efter din valda nivå och visar relevant innehåll för
          dig som är på nivå <strong>{level.toUpperCase()}</strong>.
        </p>
      </div>
    </div>
  );
}
