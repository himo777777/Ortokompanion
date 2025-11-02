'use client';

import { useState, useEffect } from 'react';
import { EducationLevel } from '@/types/education';
import { SevenDayPlan, UserProfile } from '@/types/onboarding';
import QuickStart from '@/components/onboarding/QuickStart';
import DayPlanView from '@/components/dashboard/DayPlanView';
import ChatInterface from '@/components/ChatInterface';
import CaseStudyViewer from '@/components/CaseStudyViewer';
import { trackEvent, updateStreak, checkBadgeEarned } from '@/lib/onboarding-utils';
import { useIntegrated } from '@/context/IntegratedContext';
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
import StepByStepBrowser from '@/components/learning/StepByStepBrowser';
import QualityControlDashboard from '@/components/admin/QualityControlDashboard';
import FocusTimer from '@/components/study/FocusTimer';
import PerformanceCharts from '@/components/analytics/PerformanceCharts';
import RecommendationWidget from '@/components/dashboard/RecommendationWidget';
import { useToast } from '@/components/ui/ToastContainer';
import KeyboardShortcutsModal from '@/components/ui/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import RotationDashboard from '@/components/rotation/RotationDashboard';
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
} from 'lucide-react';

type Tab = 'today' | 'plan' | 'progress' | 'analytics' | 'roadmap' | 'goals' | 'chat' | 'cases' | 'modules' | 'questions' | 'stepbystep' | 'quality';

export default function Home() {
  const { profile, setProfile, dailyMix, refreshDailyMix, requestRecovery, isLoading } = useIntegrated();
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
  } | null>(null);

  // Keyboard shortcuts - disabled when activity is active to prevent accidental triggers
  useKeyboardShortcuts([
    { key: '1', description: 'Gå till Dagens Plan', action: () => setActiveTab('today') },
    { key: '2', description: 'Gå till Progression', action: () => setActiveTab('progress') },
    { key: '3', description: 'Gå till Analytics', action: () => setActiveTab('analytics') },
    // Chat shortcut removed to prevent accidental activation
    // { key: '4', description: 'Gå till AI-Handledare', action: () => setActiveTab('chat') },
    { key: '5', description: 'Gå till Fallstudier', action: () => setActiveTab('cases') },
    { key: '6', description: 'Gå till Frågebank', action: () => setActiveTab('questions') },
    { key: '7', description: 'Gå till Steg-för-Steg', action: () => setActiveTab('stepbystep') },
    { key: '8', description: 'Gå till Provexamen', action: () => setActiveTab('modules') },
    { key: '9', description: 'Gå till Kvalitetskontroll', action: () => setActiveTab('quality') },
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
            setProfile(integratedProfile);
            setPlan(parsedPlan);

            // Generate daily mix
            setTimeout(() => refreshDailyMix(), 100);

            trackEvent('profile_migrated', { userId: integratedProfile.id });
          } catch (error) {
            console.error('Migration failed:', error);
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

  // Calculate weak domains from performance data
  const getWeakDomains = () => {
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
      .map(d => d.domain as any);
  };

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

  // Derive current goals from band progression
  const getCurrentGoals = () => {
    if (!profile) return [];

    const goals = [];
    const currentBand = profile.progression.bandStatus.currentBand;
    const nextBand = `Band ${parseInt(currentBand.split(' ')[1]) + 1}`;

    goals.push(`Nå ${nextBand}`);

    // Add domain-specific goals
    const weakDomains = getWeakDomains();
    if (weakDomains.length > 0) {
      goals.push(`Förbättra inom ${weakDomains[0]}`);
    }

    // Add accuracy goal if below 80%
    const currentAccuracy = profile.progression.bandStatus.recentPerformance.correctRate * 100;
    if (currentAccuracy < 80) {
      goals.push('Öka träffsäkerhet till 80%');
    }

    return goals.slice(0, 3);
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
              active={activeTab === 'cases'}
              onClick={() => setActiveTab('cases')}
              icon={<FileText className="w-5 h-5" />}
              label="Fallstudier"
            />
            <TabButton
              active={activeTab === 'questions'}
              onClick={() => setActiveTab('questions')}
              icon={<Brain className="w-5 h-5" />}
              label="Frågebank"
            />
            <TabButton
              active={activeTab === 'stepbystep'}
              onClick={() => setActiveTab('stepbystep')}
              icon={<GraduationCap className="w-5 h-5" />}
              label="Steg-för-Steg"
            />
            <TabButton
              active={activeTab === 'modules'}
              onClick={() => setActiveTab('modules')}
              icon={<BookOpen className="w-5 h-5" />}
              label="Provexamen"
            />
            <TabButton
              active={activeTab === 'quality'}
              onClick={() => setActiveTab('quality')}
              icon={<Shield className="w-5 h-5" />}
              label="Kvalitetskontroll"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        {activeTab === 'today' && dailyMix && (
          <div>
            {/* AI Recommendations Widget */}
            <div className="max-w-7xl mx-auto px-6 mb-6">
              <RecommendationWidget
                profile={profile}
                onSelectRecommendation={(rec) => {
                  console.log('Selected recommendation:', rec);

                  // Handle break recommendations - just show toast
                  if (rec.type === 'break') {
                    toast.success('God idé!', 'Ta en paus och kom tillbaka utvilad 🧘');
                    return;
                  }

                  // Handle SRS review recommendations
                  if (rec.type === 'review' && rec.id === 'srs-review') {
                    setActiveActivity({
                      id: 'srs-review-session',
                      type: 'srs',
                      domain: 'Allmän',
                    });
                    toast.success('SRS-repetition', 'Startar repetitionssession!');
                    trackEvent('recommendation_followed', {
                      recommendationId: rec.id,
                      type: rec.type,
                      userId: profile.id,
                    });
                    return;
                  }

                  // Handle domain-specific recommendations
                  if (rec.type === 'domain' && rec.targetDomain) {
                    // Map actionType to activity type
                    let activityType: 'new' | 'interleave' | 'srs' = 'interleave';
                    if (rec.actionType === 'new-content') {
                      activityType = 'new';
                    } else if (rec.actionType === 'review') {
                      activityType = 'srs';
                    }

                    setActiveActivity({
                      id: `domain-${rec.targetDomain}-${Date.now()}`,
                      type: activityType,
                      domain: rec.targetDomain,
                    });

                    toast.success(
                      `Startar ${rec.targetDomain}`,
                      rec.actionType === 'new-content' ? 'Nytt innehåll!' :
                      rec.actionType === 'review' ? 'Repetition!' : 'Övning!'
                    );

                    trackEvent('recommendation_followed', {
                      recommendationId: rec.id,
                      type: rec.type,
                      domain: rec.targetDomain,
                      actionType: rec.actionType,
                      userId: profile.id,
                    });
                    return;
                  }

                  // Handle challenge recommendations
                  if (rec.type === 'challenge') {
                    setActiveTab('questions');
                    toast.success('Utmaning accepterad!', rec.description);
                    trackEvent('recommendation_followed', {
                      recommendationId: rec.id,
                      type: rec.type,
                      userId: profile.id,
                    });
                    return;
                  }

                  // Handle topic recommendations
                  if (rec.type === 'topic') {
                    // Navigate to appropriate content based on topic
                    if (rec.description.toLowerCase().includes('steg-för-steg')) {
                      setActiveTab('stepbystep');
                    } else if (rec.description.toLowerCase().includes('fallstudier')) {
                      setActiveTab('cases');
                    } else {
                      setActiveTab('questions');
                    }
                    toast.success('Bra val!', rec.description);
                    trackEvent('recommendation_followed', {
                      recommendationId: rec.id,
                      type: rec.type,
                      userId: profile.id,
                    });
                    return;
                  }

                  // Default fallback
                  toast.success('Bra val!', rec.description);
                }}
              />
            </div>

            {/* Rotation Dashboard (ST-läkare, Student, AT) */}
            {(profile.rotationTimeline || profile.orthoPlacement) && (
              <div className="max-w-7xl mx-auto px-6 mb-6">
                <RotationDashboard profile={profile} />
              </div>
            )}

            {/* Daily Plan Dashboard */}
            <DailyPlanDashboard
            progressionState={{
              userId: profile.id,
              level: profile.role,
              primaryDomain: profile.progression.primaryDomain,
              bandStatus: profile.progression.bandStatus,
              domains: profile.progression.domainStatuses,
              srs: profile.progression.srs,
              dailyMix: dailyMix,
              history: profile.progression.history,
              preferences: {
                recoveryMode: profile.preferences?.recoveryMode || false,
                targetMinutesPerDay: profile.preferences?.targetMinutesPerDay || 10,
                notificationTime: undefined,
              },
              createdAt: new Date(profile.createdAt),
              lastActivity: profile.gamification.lastActivity || new Date(),
              lastBandCheck: profile.progression.bandStatus.bandHistory[profile.progression.bandStatus.bandHistory.length - 1]?.date || new Date(),
            }}
            onStartActivity={(activityId, type) => {
              console.log('Starting activity:', activityId, type);

              // Get domain based on activity type
              let domain = 'Allmän';
              if (type === 'new' && dailyMix?.newContent.domain) {
                domain = dailyMix.newContent.domain;
              } else if (type === 'interleave' && dailyMix?.interleavingContent.domain) {
                domain = dailyMix.interleavingContent.domain;
              }

              setActiveActivity({
                id: activityId,
                type: type,
                domain: domain,
              });

              trackEvent('activity_started', {
                activityId,
                type,
                domain,
                userId: profile.id
              });
            }}
            onRequestRecovery={requestRecovery}
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
                weakDomains: getWeakDomains(),
                recentTopics: getRecentTopics(),
                currentGoals: getCurrentGoals(),
                mistakePatterns: getMistakePatterns(),
                currentBand: profile.progression.bandStatus.currentBand,
                totalXP: profile.gamification.xp,
                level: profile.gamification.level,
                streak: profile.gamification.streak,
              }}
            />
          </div>
        )}
        {activeTab === 'cases' && (
          <div className="max-w-7xl mx-auto px-6">
            <CaseStudyViewer level={profile.role} />
          </div>
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
        {activeTab === 'stepbystep' && (
          <StepByStepBrowser
            userLevel={profile.role}
            onCaseCompleted={(results) => {
              // Track case completion
              trackEvent('stepbystep_completed', {
                caseId: results.caseId,
                stepsCompleted: results.stepsCompleted,
                hintsUsed: results.hintsUsed,
                timeSpent: results.timeSpent,
                score: results.score,
                userId: profile.id,
              });

              // Award XP based on score
              const earnedXP = Math.floor(results.score / 2); // Score is 0-100, so 0-50 XP

              const newXP = profile.gamification.xp + earnedXP;
              const newLevel = Math.floor(newXP / 100) + 1;

              handleUpdateProfile({
                gamification: {
                  ...profile.gamification,
                  xp: newXP,
                  level: newLevel,
                },
              });

              toast.success(
                `Fall slutfört! +${earnedXP} XP`,
                `Poäng: ${results.score}/100 (${results.hintsUsed} ledtrådar använda)`
              );
            }}
          />
        )}
        {activeTab === 'modules' && (
          <div className="max-w-7xl mx-auto px-6">
            <ExamModulesHub />
          </div>
        )}
        {activeTab === 'quality' && (
          <div className="max-w-7xl mx-auto">
            <QualityControlDashboard />
          </div>
        )}
      </div>

      {/* Activity Session Modal */}
      {activeActivity && (
        <ActivitySession
          activityId={activeActivity.id}
          activityType={activeActivity.type}
          domain={activeActivity.domain as any}
          userLevel={profile.role}
          onComplete={(results) => {
            trackEvent('activity_completed', {
              activityId: activeActivity.id,
              type: activeActivity.type,
              domain: activeActivity.domain,
              userId: profile.id,
              questionsCompleted: results.questionsCompleted,
              correctAnswers: results.correctAnswers,
              totalXP: results.totalXP,
              timeSpent: results.timeSpent,
            });

            // Award XP
            const newXP = profile.gamification.xp + results.totalXP;
            const newLevel = Math.floor(newXP / 100) + 1;
            const leveledUp = newLevel > profile.gamification.level;

            handleUpdateProfile({
              gamification: {
                ...profile.gamification,
                xp: newXP,
                level: newLevel,
              },
            });

            // Show success toast
            const accuracy = Math.round((results.correctAnswers / results.questionsCompleted) * 100);
            if (leveledUp) {
              toast.success(
                `Nivå ${newLevel} uppnådd! 🎉`,
                `Du tjänade ${results.totalXP} XP med ${accuracy}% träffsäkerhet`
              );
            } else {
              toast.success(
                `Aktivitet slutförd! +${results.totalXP} XP`,
                `${results.correctAnswers}/${results.questionsCompleted} rätt (${accuracy}%)`
              );
            }

            setActiveActivity(null);
            // Refresh daily mix after completion
            refreshDailyMix();
          }}
          onClose={() => {
            trackEvent('activity_cancelled', {
              activityId: activeActivity.id,
              type: activeActivity.type,
              userId: profile.id,
            });
            setActiveActivity(null);
          }}
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

function TabButton({ active, onClick, icon, label }: any) {
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
