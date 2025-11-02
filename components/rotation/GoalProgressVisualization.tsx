'use client';

/**
 * GoalProgressVisualization Component
 * Displays Socialstyrelsen goals grouped by competency area
 * Shows progress, completion status, and priority
 */

import { UserProfile } from '@/types/onboarding';
import { SocialstyrelseMål, getAllMål, COMPETENCY_AREAS } from '@/data/socialstyrelsen-goals';
import { MålProgress } from '@/types/integrated';
import { CheckCircle2, Circle, AlertCircle, Target } from 'lucide-react';
import { useState } from 'react';

interface GoalProgressVisualizationProps {
  profile: UserProfile;
  goalProgress: MålProgress[];
  highlightPriorityGoals?: boolean;
}

export default function GoalProgressVisualization({
  profile,
  goalProgress,
  highlightPriorityGoals = false
}: GoalProgressVisualizationProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  // Get all goals relevant to user's level
  const allGoals = getAllMål();
  const userGoals = allGoals.filter(goal => {
    // For ST-Ortopedi with rotation
    if (profile.role.match(/^st[1-5]$/) && profile.rotationTimeline?.rotations) {
      const allRotationGoals = profile.rotationTimeline.rotations.flatMap(r => r.goals);
      return allRotationGoals.includes(goal.id);
    }

    // For ST-other or Student/AT with placement
    if (profile.orthoPlacement) {
      return profile.orthoPlacement.goals.includes(goal.id);
    }

    // Fallback: match by level
    return goal.level === profile.role;
  });

  // Group goals by competency area
  const goalsByArea = userGoals.reduce((acc, goal) => {
    if (!acc[goal.competencyArea]) {
      acc[goal.competencyArea] = [];
    }
    acc[goal.competencyArea].push(goal);
    return acc;
  }, {} as Record<string, SocialstyrelseMål[]>);

  // Calculate area completion
  const areaCompletion = Object.entries(goalsByArea).map(([area, goals]) => {
    const completed = goals.filter(goal =>
      goalProgress.find(p => p.goalId === goal.id && p.achieved)
    ).length;
    return {
      area,
      total: goals.length,
      completed,
      percentage: goals.length > 0 ? (completed / goals.length) * 100 : 0,
    };
  });

  // Sort areas by percentage (lowest first to show what needs attention)
  const sortedAreas = areaCompletion.sort((a, b) => a.percentage - b.percentage);

  // Overall stats
  const totalGoals = userGoals.length;
  const completedGoals = goalProgress.filter(p => p.achieved).length;
  const overallPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Socialstyrelsen-mål</h3>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              {completedGoals}/{totalGoals}
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div
            className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-600">
          {Math.round(overallPercentage)}% av alla mål uppnådda
        </p>
      </div>

      {/* Competency Areas */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Kompetensområden
        </h4>

        {sortedAreas.map(({ area, total, completed, percentage }) => {
          const areaGoals = goalsByArea[area];
          const isSelected = selectedArea === area;
          const areaLabel = COMPETENCY_AREAS[area as keyof typeof COMPETENCY_AREAS] || area;

          return (
            <div key={area} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Area Header (clickable) */}
              <button
                onClick={() => setSelectedArea(isSelected ? null : area)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${percentage === 100 ? 'bg-green-100' : percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                    {percentage === 100 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <h5 className="font-semibold text-gray-900">{areaLabel}</h5>
                    <p className="text-sm text-gray-600">
                      {completed}/{total} mål klara
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${percentage === 100 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-orange-600'}`}>
                      {Math.round(percentage)}%
                    </span>
                  </div>
                </div>
              </button>

              {/* Progress Bar */}
              <div className="px-4 pb-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${percentage === 100 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Expanded Goals List */}
              {isSelected && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <div className="space-y-2">
                    {areaGoals.map(goal => {
                      const progress = goalProgress.find(p => p.goalId === goal.id);
                      const isCompleted = progress?.achieved || false;
                      const criteriaCompleted = progress?.completedCriteria.length || 0;
                      const totalCriteria = progress?.totalCriteria || 5;

                      return (
                        <div
                          key={goal.id}
                          className={`rounded-lg p-3 ${isCompleted ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'}`}
                        >
                          <div className="flex items-start gap-3">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <h6 className={`font-medium ${isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                                {goal.title}
                              </h6>
                              {goal.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {goal.description}
                                </p>
                              )}
                              {!isCompleted && progress && (
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                    <span>Framsteg</span>
                                    <span>{criteriaCompleted}/{totalCriteria}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className="h-1.5 rounded-full bg-blue-500"
                                      style={{ width: `${(criteriaCompleted / totalCriteria) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Priority Goals (if enabled) */}
      {highlightPriorityGoals && (
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-6">
          <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Prioriterade mål
          </h4>
          <p className="text-sm text-orange-800 mb-4">
            Dessa mål är särskilt viktiga baserat på din rotation/placering och tid kvar.
          </p>
          <div className="space-y-2">
            {/* This would be populated by getPriorityGoalsForUser() */}
            {userGoals.slice(0, 3).map(goal => {
              const progress = goalProgress.find(p => p.goalId === goal.id);
              const isCompleted = progress?.achieved || false;

              if (isCompleted) return null;

              return (
                <div key={goal.id} className="bg-white rounded-lg p-3 border border-orange-300">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h6 className="font-medium text-gray-900">{goal.title}</h6>
                      <p className="text-xs text-gray-600 mt-1">
                        {COMPETENCY_AREAS[goal.competencyArea as keyof typeof COMPETENCY_AREAS]}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
