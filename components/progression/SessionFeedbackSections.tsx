'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  Sparkles,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import {
  GoalProgression,
  WeakDomainPerformance,
} from '@/types/integrated';
import { Domain } from '@/types/onboarding';

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

/**
 * Goal Progression Section
 * Shows which Socialstyrelsen goals advanced during the session
 */
export function GoalProgressionSection({ progressions }: { progressions: GoalProgression[] }) {
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded

  if (progressions.length === 0) return null;

  const completedGoals = progressions.filter((g) => g.completed);
  const inProgressGoals = progressions.filter((g) => !g.completed);

  return (
    <div className="border-t border-gray-200">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-green-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-green-600" />
          <div className="text-left">
            <h4 className="font-semibold text-gray-800">Målprogression</h4>
            <p className="text-sm text-gray-600">
              {completedGoals.length > 0 && `${completedGoals.length} mål klara • `}
              {inProgressGoals.length > 0 && `${inProgressGoals.length} mål avancerade`}
            </p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4 space-y-3"
          >
            {/* Completed Goals */}
            {completedGoals.map((goal) => (
              <motion.div
                key={goal.goalId}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-50 border-2 border-green-200 rounded-lg p-3"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">{goal.goalTitle}</p>
                    <p className="text-sm text-green-700 mt-1">
                      🎉 Mål uppnått! Alla {goal.totalCriteria} kriterier klara
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* In-Progress Goals */}
            {inProgressGoals.map((goal) => {
              const progressPercent = (goal.afterCriteria / goal.totalCriteria) * 100;

              return (
                <div
                  key={goal.goalId}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-800 text-sm flex-1 pr-2">
                      {goal.goalTitle}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold flex-shrink-0">
                      <span>{goal.beforeCriteria}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>{goal.afterCriteria}</span>
                      <span className="text-gray-500">/{goal.totalCriteria}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: `${(goal.beforeCriteria / goal.totalCriteria) * 100}%` }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="bg-blue-500 h-2 rounded-full"
                    />
                  </div>

                  <p className="text-xs text-blue-700 mt-1">
                    +{goal.afterCriteria - goal.beforeCriteria} kriterium framsteg
                  </p>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Weak Domain Performance Section
 * Shows improvement in weak areas compared to recent history
 */
export function WeakDomainSection({ performance }: { performance?: WeakDomainPerformance }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!performance) return null;

  const isImprovement = performance.improvement > 0;
  const improvementPercent = Math.abs(Math.round(performance.improvement));

  return (
    <div className="border-t border-gray-200">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-yellow-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-yellow-600" />
          <div className="text-left">
            <h4 className="font-semibold text-gray-800">Svagt område-träning</h4>
            <p className="text-sm text-gray-600">
              {isImprovement ? `Förbättring i ${getDomainName(performance.domain)}!` : `Träning på ${getDomainName(performance.domain)}`}
            </p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4"
          >
            <div className={`${isImprovement ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-3`}>
              <div className="flex items-start gap-2">
                <span className="text-2xl">{isImprovement ? '📈' : '🎯'}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {getDomainName(performance.domain)}
                  </p>

                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Idag:</span>
                      <span className="font-semibold text-gray-800">
                        {performance.questionsToday} frågor • {Math.round(performance.todayAccuracy)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Senaste veckan:</span>
                      <span className="font-semibold text-gray-600">
                        {Math.round(performance.recentAccuracy)}% i snitt
                      </span>
                    </div>
                  </div>

                  {isImprovement && (
                    <p className="text-sm text-green-700 mt-2 font-medium">
                      💪 +{improvementPercent}% förbättring - Fortsätt så!
                    </p>
                  )}

                  {!isImprovement && performance.todayAccuracy < performance.recentAccuracy && (
                    <p className="text-sm text-gray-600 mt-2">
                      Fortsätt träna - varje session bygger förståelse
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * System Assessment Section
 * Shows band progression, system learnings, and next steps
 */
export function SystemAssessmentSection({
  bandProgression,
  nextSteps,
}: {
  bandProgression?: { message: string; type: 'promotion' | 'stable' | 'demotion' };
  nextSteps: string[];
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!bandProgression && nextSteps.length === 0) return null;

  const getHeaderColor = () => {
    if (!bandProgression) return 'text-blue-600';
    return bandProgression.type === 'promotion' ? 'text-green-600' :
           bandProgression.type === 'demotion' ? 'text-orange-600' :
           'text-blue-600';
  };

  const getHeaderBg = () => {
    if (!bandProgression) return 'hover:bg-blue-50';
    return bandProgression.type === 'promotion' ? 'hover:bg-green-50' :
           bandProgression.type === 'demotion' ? 'hover:bg-orange-50' :
           'hover:bg-blue-50';
  };

  return (
    <div className="border-t border-gray-200">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-4 flex items-center justify-between ${getHeaderBg()} transition-colors`}
      >
        <div className="flex items-center gap-3">
          <Sparkles className={`w-5 h-5 ${getHeaderColor()}`} />
          <div className="text-left">
            <h4 className="font-semibold text-gray-800">Systemets bedömning</h4>
            <p className="text-sm text-gray-600">
              {bandProgression?.type === 'promotion' && 'Stark prestation!'}
              {bandProgression?.type === 'stable' && 'Bra framsteg'}
              {bandProgression?.type === 'demotion' && 'Fortsatt träning'}
              {!bandProgression && 'Nästa steg'}
            </p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4"
          >
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 space-y-3">
              {/* Band Progression Message */}
              {bandProgression && (
                <div className="flex items-start gap-2">
                  <span className="text-xl">
                    {bandProgression.type === 'promotion' && '🚀'}
                    {bandProgression.type === 'stable' && '📊'}
                    {bandProgression.type === 'demotion' && '🎯'}
                  </span>
                  <p className="text-sm text-gray-800 font-medium">
                    {bandProgression.message}
                  </p>
                </div>
              )}

              {/* Next Steps */}
              {nextSteps.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-indigo-700 mb-2">NÄSTA STEG:</p>
                  <ul className="space-y-1">
                    {nextSteps.map((step, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-indigo-500 mt-0.5">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
