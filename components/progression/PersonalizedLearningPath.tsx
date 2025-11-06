'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntegrated } from '@/context/IntegratedContext';
import { ALL_FOCUSED_GOALS } from '@/data/focused-socialstyrelsen-goals';
import {
  Calendar,
  ChevronRight,
  Clock,
  Target,
  TrendingUp,
  CheckCircle2,
  Brain,
  Sparkles,
} from 'lucide-react';

interface LearningStep {
  week: number;
  goalId: string;
  goalTitle: string;
  goalDescription: string;
  estimatedTime: string;
  priority: 'critical' | 'high' | 'medium';
  competencyArea: string;
  prerequisites: string[];
  milestones: string[];
}

interface PersonalizedLearningPathProps {
  userProgram?: 'läkarexamen' | 'bt' | 'at' | 'st';
  userSpecialty?: string;
  weeksToProject?: number;
}

export function PersonalizedLearningPath({
  userProgram = 'bt',
  userSpecialty = 'ortopedi',
  weeksToProject = 12,
}: PersonalizedLearningPathProps) {
  const { profile } = useIntegrated();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  // Generate personalized learning path
  const learningPath = useMemo(() => {
    if (!profile) return [];

    // Get all relevant goals
    const relevantGoals = ALL_FOCUSED_GOALS.filter(
      (g) =>
        g.program === userProgram &&
        (g.specialty === userSpecialty || g.specialty === 'allmänmedicin')
    );

    // Get completed goal IDs
    const completedGoalIds = new Set(
      profile.socialstyrelseMålProgress.filter((mp) => mp.achieved).map((mp) => mp.goalId)
    );

    // Get incomplete required goals
    const incompleteGoals = relevantGoals
      .filter((g) => g.required && !completedGoalIds.has(g.id))
      .map((goal) => {
        // Calculate priority based on user's weak areas
        const areaGoals = relevantGoals.filter((g) => g.competencyArea === goal.competencyArea);
        const areaCompleted = areaGoals.filter((g) => completedGoalIds.has(g.id)).length;
        const areaCompletionRate = areaCompleted / areaGoals.length;

        let priority: 'critical' | 'high' | 'medium';
        if (areaCompletionRate < 0.3) {
          priority = 'critical';
        } else if (areaCompletionRate < 0.5) {
          priority = 'high';
        } else {
          priority = 'medium';
        }

        return { goal, priority, areaCompletionRate };
      })
      .sort((a, b) => {
        // Sort by priority first
        const priorityOrder = { critical: 0, high: 1, medium: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        // Then by area completion rate (lowest first)
        return a.areaCompletionRate - b.areaCompletionRate;
      });

    // Distribute goals across weeks
    const goalsPerWeek = Math.ceil(incompleteGoals.length / weeksToProject);
    const path: LearningStep[] = [];

    incompleteGoals.forEach((item, index) => {
      const week = Math.floor(index / goalsPerWeek) + 1;
      const goal = item.goal;

      path.push({
        week,
        goalId: goal.id,
        goalTitle: goal.title,
        goalDescription: goal.description,
        estimatedTime: goal.minimumCases
          ? `${goal.minimumCases} fall`
          : goal.minimumProcedures
          ? `${goal.minimumProcedures} procedurer`
          : '10 fall',
        priority: item.priority,
        competencyArea: goal.competencyArea,
        prerequisites: [],
        milestones: goal.assessmentCriteria.slice(0, 3),
      });
    });

    return path;
  }, [profile, userProgram, userSpecialty, weeksToProject]);

  // Group by week
  const weeklyPlan = useMemo(() => {
    const grouped: Record<number, LearningStep[]> = {};
    learningPath.forEach((step) => {
      if (!grouped[step.week]) {
        grouped[step.week] = [];
      }
      grouped[step.week].push(step);
    });
    return grouped;
  }, [learningPath]);

  if (!profile) {
    return <div>Laddar...</div>;
  }

  if (learningPath.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-bold text-green-900">Fantastiskt arbete!</h3>
            <p className="text-sm text-green-700">
              Du har slutfört alla obligatoriska mål för {userProgram.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalWeeks = Object.keys(weeklyPlan).length;
  const currentWeek = 1; // In production, calculate based on start date

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-indigo-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Din Personliga Studieplan</h2>
            <p className="text-gray-600">
              AI-genererad väg till att slutföra alla {userProgram.toUpperCase()}-mål
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span>Totalt</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalWeeks} veckor</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Target className="w-4 h-4" />
              <span>Mål kvar</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{learningPath.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>AI-Optimerad</span>
            </div>
            <p className="text-2xl font-bold text-indigo-600">100%</p>
          </div>
        </div>
      </div>

      {/* Weekly timeline */}
      <div className="space-y-4">
        {Object.entries(weeklyPlan)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([weekNum, steps], weekIndex) => {
            const week = Number(weekNum);
            const isCurrentWeek = week === currentWeek;
            const isPast = week < currentWeek;
            const isExpanded = selectedWeek === week;

            return (
              <motion.div
                key={week}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: weekIndex * 0.05 }}
                className={`rounded-xl border-2 overflow-hidden ${
                  isCurrentWeek
                    ? 'border-indigo-500 bg-indigo-50'
                    : isPast
                    ? 'border-gray-300 bg-gray-50 opacity-60'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {/* Week header */}
                <button
                  onClick={() => setSelectedWeek(isExpanded ? null : week)}
                  className="w-full p-5 flex items-center justify-between hover:bg-white/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {isCurrentWeek && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-3 h-3 bg-indigo-600 rounded-full"
                      />
                    )}
                    <div className="text-left">
                      <h3 className="font-bold text-gray-900">
                        Vecka {week}
                        {isCurrentWeek && (
                          <span className="ml-2 px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
                            AKTUELL
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {steps.length} mål • {steps.filter((s) => s.priority === 'critical').length}{' '}
                        kritiska
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  </motion.div>
                </button>

                {/* Week details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200"
                    >
                      <div className="p-5 space-y-4 bg-white">
                        {steps.map((step, stepIndex) => (
                          <motion.div
                            key={step.goalId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: stepIndex * 0.1 }}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            {/* Goal header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">{step.goalTitle}</h4>
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                                      step.priority === 'critical'
                                        ? 'bg-red-100 text-red-700'
                                        : step.priority === 'high'
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}
                                  >
                                    {step.priority.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{step.goalDescription}</p>
                              </div>
                            </div>

                            {/* Meta info */}
                            <div className="flex flex-wrap gap-3 mb-3 text-sm">
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{step.estimatedTime}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <TrendingUp className="w-4 h-4" />
                                <span className="capitalize">
                                  {step.competencyArea.replace('-', ' ')}
                                </span>
                              </div>
                            </div>

                            {/* Milestones */}
                            {step.milestones.length > 0 && (
                              <div>
                                <h5 className="text-xs font-semibold text-gray-700 mb-2">
                                  Delmål att uppnå:
                                </h5>
                                <ul className="space-y-1">
                                  {step.milestones.map((milestone, i) => (
                                    <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                      <CheckCircle2 className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                      <span>{milestone}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
      </div>

      {/* Action button */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-2">Redo att börja?</h3>
        <p className="text-gray-600 mb-4">
          Följ din personliga studieplan och uppnå alla dina {userProgram.toUpperCase()}-mål
          systematiskt.
        </p>
        <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all">
          Starta denna veckas mål →
        </button>
      </div>
    </motion.div>
  );
}
