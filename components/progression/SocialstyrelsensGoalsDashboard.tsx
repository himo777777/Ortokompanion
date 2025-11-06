'use client';

import { useState, useMemo } from 'react';
import { useIntegrated } from '@/context/IntegratedContext';
import {
  ALL_FOCUSED_GOALS,
  BT_GOALS,
  AT_GOALS,
  getGoalsByProgram,
  type SocialstyrelsensGoal,
} from '@/data/focused-socialstyrelsen-goals';
import { calculateGoalProgress } from '@/lib/goal-taxonomy';
import {
  Target,
  CheckCircle2,
  Circle,
  TrendingUp,
  Award,
  BookOpen,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

type ProgramType = 'läkarexamen' | 'bt' | 'at' | 'st';
type SpecialtyType = 'läkarexamen' | 'allmänmedicin' | 'akutsjukvård' | 'ortopedi';

export function SocialstyrelsensGoalsDashboard() {
  const { profile } = useIntegrated();
  const [selectedProgram, setSelectedProgram] = useState<ProgramType>('bt');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get user's program and specialty
  // TODO: Get from profile when educationLevel is added
  const userProgram: ProgramType = 'bt';
  const userSpecialty: SpecialtyType = 'ortopedi'; // Could be from profile

  // Get completed activities from profile
  const completedActivities = useMemo(() => {
    if (!profile) return [];

    return profile.socialstyrelseMålProgress.map((mp) => ({
      goalId: mp.goalId,
      activityType: 'question-session',
      completedAt: mp.lastUpdated,
    }));
  }, [profile]);

  // Calculate progress
  const progress = useMemo(() => {
    // Filter out läkarexamen for calculateGoalProgress since it expects bt/at/st
    const validProgram = selectedProgram === 'läkarexamen' ? 'bt' : selectedProgram;
    return calculateGoalProgress(
      validProgram as 'bt' | 'at' | 'st',
      userSpecialty,
      completedActivities
    );
  }, [selectedProgram, userSpecialty, completedActivities]);

  // Get goals for selected program
  const programGoals = useMemo(() => {
    return getGoalsByProgram(selectedProgram);
  }, [selectedProgram]);

  // Group goals by category
  const goalsByCategory = useMemo(() => {
    const grouped: Record<string, SocialstyrelsensGoal[]> = {};
    programGoals.forEach((goal) => {
      if (!grouped[goal.category]) {
        grouped[goal.category] = [];
      }
      grouped[goal.category].push(goal);
    });
    return grouped;
  }, [programGoals]);

  // Get completed goal IDs
  const completedGoalIds = useMemo(() => {
    return new Set(
      profile?.socialstyrelseMålProgress
        .filter((mp) => mp.achieved)
        .map((mp) => mp.goalId) || []
    );
  }, [profile]);

  const renderGoalCard = (goal: SocialstyrelsensGoal) => {
    const isCompleted = completedGoalIds.has(goal.id);
    const goalProgress =
      profile?.socialstyrelseMålProgress.find((mp) => mp.goalId === goal.id);
    const completedCriteria = goalProgress?.completedCriteria.length || 0;
    const totalCriteria = goal.assessmentCriteria.length;
    const progressPercent = (completedCriteria / totalCriteria) * 100;

    return (
      <div
        key={goal.id}
        className={`border rounded-lg p-4 ${
          isCompleted
            ? 'bg-green-50 border-green-200'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-3">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
            )}
            <div>
              <h4 className="font-semibold text-gray-900">{goal.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    goal.required
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {goal.required ? 'Obligatoriskt' : 'Valfritt'}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                  {goal.competencyArea}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>
              {completedCriteria} / {totalCriteria} kriterier
            </span>
            <span>{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isCompleted ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Assessment criteria */}
        {goal.assessmentCriteria.length > 0 && (
          <details className="mt-3">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer">
              Bedömningskriterier ({goal.assessmentCriteria.length})
            </summary>
            <ul className="mt-2 space-y-1">
              {goal.assessmentCriteria.map((criterion, idx) => {
                const isCompleted =
                  goalProgress?.completedCriteria.includes(idx);
                return (
                  <li
                    key={idx}
                    className="text-sm text-gray-600 flex items-start gap-2"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={isCompleted ? 'line-through' : ''}>
                      {criterion}
                    </span>
                  </li>
                );
              })}
            </ul>
          </details>
        )}

        {/* Requirements */}
        {(goal.minimumCases || goal.minimumProcedures) && (
          <div className="mt-3 text-xs text-gray-600">
            {goal.minimumCases && (
              <div>📊 Minimum fall: {goal.minimumCases}</div>
            )}
            {goal.minimumProcedures && (
              <div>🔧 Minimum procedurer: {goal.minimumProcedures}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Socialstyrelsen Mål
          </h1>
        </div>
        <p className="text-gray-600">
          Följ din progression mot Socialstyrelsens mål och kompetenskrav
        </p>
      </div>

      {/* Program selector */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['läkarexamen', 'bt', 'at', 'st'] as ProgramType[]).map(
            (program) => {
              const count = getGoalsByProgram(program).length;
              return (
                <button
                  key={program}
                  onClick={() => setSelectedProgram(program)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                    selectedProgram === program
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {program.toUpperCase()} ({count})
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Totalt mål</p>
              <p className="text-2xl font-bold text-gray-900">
                {progress.totalGoals}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Uppnådda</p>
              <p className="text-2xl font-bold text-gray-900">
                {progress.completedGoals}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Framsteg</p>
              <p className="text-2xl font-bold text-gray-900">
                {progress.progressPercentage.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Kategorier</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(progress.goalsByCategory).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress by competency area */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Kompetensområden
        </h2>
        <div className="space-y-3">
          {Object.entries(progress.goalsByCompetency).map(
            ([area, { total, completed }]) => {
              const percent = (completed / total) * 100;
              return (
                <div key={area}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 capitalize">
                      {area.replace('-', ' ')}
                    </span>
                    <span className="text-gray-600">
                      {completed} / {total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Goals by category */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Mål efter kategori
        </h2>
        {Object.entries(goalsByCategory).map(([category, goals]) => {
          const completedInCategory = goals.filter((g) =>
            completedGoalIds.has(g.id)
          ).length;
          const totalInCategory = goals.length;

          return (
            <div
              key={category}
              className="bg-white border border-gray-200 rounded-lg"
            >
              <button
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category ? null : category
                  )
                }
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{category}</h3>
                    <p className="text-sm text-gray-600">
                      {completedInCategory} / {totalInCategory} mål uppnådda
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    selectedCategory === category ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {selectedCategory === category && (
                <div className="p-4 border-t border-gray-200 space-y-4">
                  {goals.map(renderGoalCard)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help text */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">
              Hur använder jag Socialstyrelsen-målen?
            </p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Frågor i systemet kopplas automatiskt till relevanta mål</li>
              <li>
                Progression spåras när du besvarar frågor och genomför aktiviteter
              </li>
              <li>
                Obligatoriska mål måste uppfyllas för att slutföra programmet
              </li>
              <li>
                AI-systemet genererar innehåll som täcker dina återstående mål
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
