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
import ActivityViewer from '@/components/progression/ActivityViewer';
import QuestionBankBrowser from '@/components/learning/QuestionBankBrowser';
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
} from 'lucide-react';

type Tab = 'today' | 'plan' | 'progress' | 'analytics' | 'roadmap' | 'goals' | 'chat' | 'cases' | 'modules' | 'questions';

export default function Home() {
  const { profile, setProfile, dailyMix, refreshDailyMix, requestRecovery, isLoading } = useIntegrated();
  const [plan, setPlan] = useState<SevenDayPlan | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeActivity, setActiveActivity] = useState<{
    id: string;
    type: 'new' | 'interleave' | 'srs';
    domain: string;
  } | null>(null);

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
                onClick={handleResetOnboarding}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Börja om
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
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
              active={activeTab === 'modules'}
              onClick={() => setActiveTab('modules')}
              icon={<BookOpen className="w-5 h-5" />}
              label="Provexamen"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        {activeTab === 'today' && dailyMix && (
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
            </div>
          </div>
        )}
        {activeTab === 'chat' && (
          <div className="max-w-7xl mx-auto px-6">
            <ChatInterface level={profile.role} />
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
        {activeTab === 'modules' && (
          <div className="max-w-7xl mx-auto px-6">
            <ExamModulesHub />
          </div>
        )}
      </div>

      {/* Activity Viewer Modal */}
      {activeActivity && (
        <ActivityViewer
          activityId={activeActivity.id}
          activityType={activeActivity.type}
          domain={activeActivity.domain}
          onComplete={() => {
            trackEvent('activity_completed', {
              activityId: activeActivity.id,
              type: activeActivity.type,
              domain: activeActivity.domain,
              userId: profile.id,
            });
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
    </main>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
        active
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-800'
      }`}
    >
      {icon}
      {label}
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
