'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useIntegrated } from '@/context/IntegratedContext';
import { ALL_FOCUSED_GOALS } from '@/data/focused-socialstyrelsen-goals';
import { AlertTriangle, TrendingUp, Target, BookOpen, Zap, CheckCircle } from 'lucide-react';

interface GapAnalysis {
  competencyArea: string;
  totalGoals: number;
  completedGoals: number;
  completionRate: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  recommendedActions: string[];
  affectedGoals: string[];
}

interface KnowledgeGapAnalyzerProps {
  userProgram?: 'läkarexamen' | 'bt' | 'at' | 'st';
  userSpecialty?: string;
}

export function KnowledgeGapAnalyzer({
  userProgram = 'bt',
  userSpecialty = 'ortopedi',
}: KnowledgeGapAnalyzerProps) {
  const { profile } = useIntegrated();

  // Analyze gaps across competency areas
  const gapAnalysis = useMemo(() => {
    if (!profile) return [];

    // Group goals by competency area
    const areaGoals: Record<
      string,
      {
        total: Array<{ id: string; title: string; required: boolean }>;
        completed: Set<string>;
      }
    > = {};

    // Get relevant goals for user
    const relevantGoals = ALL_FOCUSED_GOALS.filter(
      (g) =>
        g.program === userProgram &&
        (g.specialty === userSpecialty || g.specialty === 'allmänmedicin')
    );

    // Initialize competency areas
    relevantGoals.forEach((goal) => {
      if (!areaGoals[goal.competencyArea]) {
        areaGoals[goal.competencyArea] = {
          total: [],
          completed: new Set(),
        };
      }
      areaGoals[goal.competencyArea].total.push({
        id: goal.id,
        title: goal.title,
        required: goal.required,
      });
    });

    // Mark completed goals
    profile.socialstyrelseMålProgress.forEach((progress) => {
      const goal = ALL_FOCUSED_GOALS.find((g) => g.id === progress.goalId);
      if (goal && progress.achieved && areaGoals[goal.competencyArea]) {
        areaGoals[goal.competencyArea].completed.add(progress.goalId);
      }
    });

    // Analyze each area
    const gaps: GapAnalysis[] = Object.entries(areaGoals)
      .map(([competencyArea, data]) => {
        const totalGoals = data.total.length;
        const completedGoals = data.completed.size;
        const completionRate = totalGoals > 0 ? completedGoals / totalGoals : 0;

        // Determine priority
        let priority: 'critical' | 'high' | 'medium' | 'low';
        if (completionRate < 0.3) {
          priority = 'critical';
        } else if (completionRate < 0.5) {
          priority = 'high';
        } else if (completionRate < 0.7) {
          priority = 'medium';
        } else {
          priority = 'low';
        }

        // Generate recommendations
        const incompleteGoals = data.total.filter((g) => !data.completed.has(g.id));
        const requiredIncomplete = incompleteGoals.filter((g) => g.required);

        const recommendedActions: string[] = [];
        if (requiredIncomplete.length > 0) {
          recommendedActions.push(
            `Slutför ${requiredIncomplete.length} obligatoriska mål i detta område`
          );
        }
        if (completionRate < 0.5) {
          recommendedActions.push(`Fokusera daglig träning på ${competencyArea}`);
        }
        if (completionRate < 0.3) {
          recommendedActions.push(
            `KRITISKT: Detta område behöver omedelbar uppmärksamhet`
          );
        }

        return {
          competencyArea,
          totalGoals,
          completedGoals,
          completionRate,
          priority,
          recommendedActions,
          affectedGoals: incompleteGoals.map((g) => g.title),
        };
      })
      .sort((a, b) => {
        // Sort by priority first, then by completion rate
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.completionRate - b.completionRate;
      });

    return gaps;
  }, [profile, userProgram, userSpecialty]);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const critical = gapAnalysis.filter((g) => g.priority === 'critical').length;
    const high = gapAnalysis.filter((g) => g.priority === 'high').length;
    const avgCompletion =
      gapAnalysis.reduce((sum, g) => sum + g.completionRate, 0) / gapAnalysis.length || 0;

    return { critical, high, avgCompletion };
  }, [gapAnalysis]);

  if (!profile) {
    return <div>Laddar...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                AI-Driven Kunskapsanalys
              </h2>
              <p className="text-gray-600 mt-1">
                Intelligenta rekommendationer baserat på din progression
              </p>
            </div>
          </div>
        </div>

        {/* Overall stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Genomsnittlig uppnåelse</p>
            <p className="text-2xl font-bold text-gray-900">
              {(overallStats.avgCompletion * 100).toFixed(0)}%
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Kritiska områden</p>
            <p className="text-2xl font-bold text-red-600">{overallStats.critical}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Hög prioritet</p>
            <p className="text-2xl font-bold text-orange-600">{overallStats.high}</p>
          </div>
        </div>
      </div>

      {/* Gap analysis cards */}
      <div className="space-y-4">
        {gapAnalysis.map((gap, index) => (
          <motion.div
            key={gap.competencyArea}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-xl p-6 border-2 ${
              gap.priority === 'critical'
                ? 'bg-red-50 border-red-300'
                : gap.priority === 'high'
                ? 'bg-orange-50 border-orange-300'
                : gap.priority === 'medium'
                ? 'bg-yellow-50 border-yellow-300'
                : 'bg-green-50 border-green-300'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                {gap.priority === 'critical' || gap.priority === 'high' ? (
                  <AlertTriangle
                    className={`w-6 h-6 mt-1 ${
                      gap.priority === 'critical' ? 'text-red-600' : 'text-orange-600'
                    }`}
                  />
                ) : gap.completionRate >= 0.9 ? (
                  <CheckCircle className="w-6 h-6 mt-1 text-green-600" />
                ) : (
                  <TrendingUp className="w-6 h-6 mt-1 text-blue-600" />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 capitalize">
                    {gap.competencyArea.replace('-', ' ')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {gap.completedGoals} av {gap.totalGoals} mål uppnådda
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  gap.priority === 'critical'
                    ? 'bg-red-600 text-white'
                    : gap.priority === 'high'
                    ? 'bg-orange-600 text-white'
                    : gap.priority === 'medium'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-green-600 text-white'
                }`}
              >
                {gap.priority}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Komplettering</span>
                <span className="text-gray-600">{(gap.completionRate * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${gap.completionRate * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.8, ease: 'easeOut' }}
                  className={`h-3 rounded-full ${
                    gap.priority === 'critical'
                      ? 'bg-red-600'
                      : gap.priority === 'high'
                      ? 'bg-orange-600'
                      : gap.priority === 'medium'
                      ? 'bg-yellow-600'
                      : 'bg-green-600'
                  }`}
                />
              </div>
            </div>

            {/* Recommendations */}
            {gap.recommendedActions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Rekommenderade åtgärder:
                </h4>
                <ul className="space-y-1">
                  {gap.recommendedActions.map((action, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Affected goals preview */}
            {gap.affectedGoals.length > 0 && gap.affectedGoals.length <= 3 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Mål att fokusera på:
                </h4>
                <ul className="space-y-1">
                  {gap.affectedGoals.slice(0, 3).map((goal, i) => (
                    <li key={i} className="text-sm text-gray-600">
                      • {goal}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Action button */}
      {(overallStats.critical > 0 || overallStats.high > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-gray-200 rounded-xl p-6"
        >
          <h3 className="font-bold text-gray-900 mb-2">Nästa steg</h3>
          <p className="text-gray-600 mb-4">
            Fokusera på de kritiska och högt prioriterade områdena för att snabbt förbättra din
            kunskapsbas.
          </p>
          <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all">
            Starta målstyrd träning →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
