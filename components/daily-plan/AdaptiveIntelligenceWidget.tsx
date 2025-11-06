'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp, Target, TrendingUp, Sparkles, CheckCircle } from 'lucide-react';
import { DailyMix } from '@/types/progression';
import { IntegratedUserProfile, MålProgress } from '@/types/integrated';
import { Domain } from '@/types/onboarding';
import { ALL_FOCUSED_GOALS } from '@/data/focused-socialstyrelsen-goals';

interface Props {
  dailyMix: DailyMix;
  profile: IntegratedUserProfile;
  compact?: boolean;
}

interface AdaptiveFeature {
  icon: string;
  text: string;
  reasoning: string;
}

export default function AdaptiveIntelligenceWidget({ dailyMix, profile, compact = false }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract data
  const weakDomains = dailyMix.weakDomains || [];
  const currentBand = profile.progression.bandStatus.currentBand;
  const accuracy = Math.round(profile.progression.bandStatus.recentPerformance.correctRate * 100);

  // Get active goals influencing today's mix
  const activeGoals = getActiveGoalsFromProfile(profile);

  // Determine adaptive features
  const adaptiveFeatures = getAdaptiveFeatures(dailyMix, profile);

  // Don't show widget if there's nothing to display (new user)
  const hasData = weakDomains.length > 0 || activeGoals.length > 0 || adaptiveFeatures.length > 0;

  if (!hasData) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-md p-4">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="font-semibold text-gray-800">Systemet lär känna dig</h3>
            <p className="text-sm text-gray-600">
              Slutför några sessioner så börjar systemet anpassa sig efter dina behov
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-md overflow-hidden">
      {/* Collapsed Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-indigo-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-indigo-600" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              Systemet anpassar sig efter dig
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </h3>
            <p className="text-sm text-gray-600">
              {weakDomains.length > 0 && `${weakDomains.length} svaga områden • `}
              {activeGoals.length} mål aktiva • Band {currentBand}
            </p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-indigo-600" /> : <ChevronDown className="w-5 h-5 text-indigo-600" />}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-indigo-200"
          >
            <div className="p-4 space-y-4">
              {/* Weak Domains Section */}
              {weakDomains.length > 0 && (
                <WeakDomainsSection weakDomains={weakDomains} />
              )}

              {/* Active Goals Section */}
              {activeGoals.length > 0 && (
                <ActiveGoalsSection goals={activeGoals} />
              )}

              {/* Band Reasoning Section */}
              <BandReasoningSection
                band={currentBand}
                accuracy={accuracy}
              />

              {/* Adaptive Features Section */}
              {adaptiveFeatures.length > 0 && (
                <AdaptiveFeaturesSection features={adaptiveFeatures} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to get domain name in Swedish
function getDomainName(domain: Domain): string {
  const names: Record<string, string> = {
    'trauma': 'Traumaortopedi',
    'höft': 'Höftkirurgi',
    'knä': 'Knäkirurgi',
    'fot-fotled': 'Fot & Fotled',
    'hand-handled': 'Hand & Handled',
    'axel-armbåge': 'Axel & Armbåge',
    'rygg': 'Ryggkirurgi',
    'sport': 'Idrottsmedicin',
    'tumör': 'Tumörortopedi',
  };
  return names[domain] || domain;
}

// Helper to extract active goals from profile
function getActiveGoalsFromProfile(profile: IntegratedUserProfile): MålProgress[] {
  // Get top 3 in-progress goals (not achieved, has some progress)
  return profile.socialstyrelseMålProgress
    .filter(p => !p.achieved && p.completedCriteria.length > 0)
    .sort((a, b) => {
      // Sort by completion percentage (descending)
      const aPercent = a.completedCriteria.length / a.totalCriteria;
      const bPercent = b.completedCriteria.length / b.totalCriteria;
      return bPercent - aPercent;
    })
    .slice(0, 3);
}

// Helper to identify adaptive features
function getAdaptiveFeatures(dailyMix: DailyMix, profile: IntegratedUserProfile): AdaptiveFeature[] {
  const features: AdaptiveFeature[] = [];

  if (dailyMix.isRecoveryDay) {
    features.push({
      icon: '😌',
      text: 'Återhämtningsläge aktivt',
      reasoning: 'Lättare frågor idag för att konsolidera kunskap efter svåra dagar'
    });
  }

  if (dailyMix.interleavingContent.reasoning) {
    features.push({
      icon: '🔀',
      text: 'Intelligent repetition',
      reasoning: dailyMix.interleavingContent.reasoning
    });
  }

  if (dailyMix.weakDomains && dailyMix.weakDomains.length > 0) {
    features.push({
      icon: '🎯',
      text: 'Extra träning på svaga områden',
      reasoning: 'Frågor prioriteras från domäner där du har lägre träffsäkerhet'
    });
  }

  if (dailyMix.newContent.reasoning) {
    features.push({
      icon: '🎓',
      text: 'Målinriktat innehåll',
      reasoning: dailyMix.newContent.reasoning
    });
  }

  return features;
}

// Weak Domains Section Component
function WeakDomainsSection({ weakDomains }: { weakDomains: Array<{ domain: Domain; accuracy: number }> }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-5 h-5 text-indigo-600" />
        <h4 className="font-semibold text-gray-800">Träning på svaga områden</h4>
      </div>
      <div className="space-y-2 ml-7">
        {weakDomains.map(({ domain, accuracy }) => {
          const accuracyPercent = Math.round(accuracy);
          const color = accuracyPercent < 50 ? 'red' : accuracyPercent < 65 ? 'orange' : 'yellow';
          const bgColor = color === 'red' ? 'bg-red-200' : color === 'orange' ? 'bg-orange-200' : 'bg-yellow-200';
          const textColor = color === 'red' ? 'text-red-700' : color === 'orange' ? 'text-orange-700' : 'text-yellow-700';

          return (
            <div key={domain} className="text-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-gray-700">{getDomainName(domain)}</span>
                <span className={`text-xs font-semibold ${textColor}`}>{accuracyPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${bgColor} h-2 rounded-full transition-all`}
                  style={{ width: `${accuracyPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Active Goals Section Component
function ActiveGoalsSection({ goals }: { goals: MålProgress[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle className="w-5 h-5 text-indigo-600" />
        <h4 className="font-semibold text-gray-800">Aktiva Socialstyrelsen-mål</h4>
      </div>
      <div className="space-y-2 ml-7">
        {goals.map((goal) => {
          const goalData = ALL_FOCUSED_GOALS.find(g => g.id === goal.goalId);
          const progressPercent = Math.round((goal.completedCriteria.length / goal.totalCriteria) * 100);

          return (
            <div key={goal.goalId} className="text-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-gray-700 flex-1">
                  {goalData?.title || goal.goalId}
                </span>
                <span className="text-xs text-indigo-600 font-semibold ml-2">
                  {goal.completedCriteria.length}/{goal.totalCriteria}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Band Reasoning Section Component
function BandReasoningSection({ band, accuracy }: { band: string; accuracy: number }) {
  const getBandDescription = (band: string, acc: number): string => {
    if (acc >= 80) return 'Utmärkt prestation! Din svårighetsgrad ökar snart.';
    if (acc >= 70) return 'Bra framsteg! Fortsätt träna på denna nivå.';
    if (acc >= 60) return 'Stadigt lärande. Fortsätt så bygger du säkerhet.';
    return 'Utmanande nivå. Systemet hjälper dig att komma tillbaka på rätt spår.';
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        <h4 className="font-semibold text-gray-800">Nuvarande nivå</h4>
      </div>
      <div className="ml-7 text-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-indigo-600 text-lg">Band {band}</span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-700">{accuracy}% träffsäkerhet</span>
        </div>
        <p className="text-gray-600 text-xs">
          {getBandDescription(band, accuracy)}
        </p>
      </div>
    </div>
  );
}

// Adaptive Features Section Component
function AdaptiveFeaturesSection({ features }: { features: AdaptiveFeature[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h4 className="font-semibold text-gray-800">AI-anpassningar idag</h4>
      </div>
      <div className="space-y-2 ml-7">
        {features.map((feature, idx) => (
          <div key={idx} className="text-sm">
            <div className="flex items-start gap-2">
              <span className="text-lg">{feature.icon}</span>
              <div>
                <p className="font-medium text-gray-700">{feature.text}</p>
                <p className="text-xs text-gray-600">{feature.reasoning}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
