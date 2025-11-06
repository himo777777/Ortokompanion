'use client';

import { useState } from 'react';
import { Target, CheckCircle, Clock, TrendingUp, Award, BookOpen, AlertCircle } from 'lucide-react';
import { SocialstyrelseMål } from '@/data/socialstyrelsen-goals';
import { GoalProgress } from '@/lib/goal-content-mapper';

interface GoalProgressDashboardProps {
  goalsWithProgress: Array<SocialstyrelseMål & { progress: GoalProgress }>;
  summary: {
    totalGoals: number;
    achievedGoals: number;
    percentage: number;
    byCompetency: Record<string, { total: number; achieved: number; percentage: number }>;
    readyForAssessment: number;
    inProgress: number;
    notStarted: number;
  };
  onGoalClick?: (goal: SocialstyrelseMål) => void;
}

export default function GoalProgressDashboard({
  goalsWithProgress,
  summary,
  onGoalClick,
}: GoalProgressDashboardProps) {
  const [filterCompetency, setFilterCompetency] = useState<string | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'achieved' | 'in-progress' | 'not-started'>('all');

  // Filter goals
  const filteredGoals = goalsWithProgress.filter((goal) => {
    // Competency filter
    if (filterCompetency !== 'all' && goal.competencyArea !== filterCompetency) {
      return false;
    }

    // Status filter
    if (filterStatus === 'achieved' && !goal.progress.achieved) {
      return false;
    }
    if (filterStatus === 'in-progress' && (goal.progress.percentage === 0 || goal.progress.achieved)) {
      return false;
    }
    if (filterStatus === 'not-started' && goal.progress.percentage > 0) {
      return false;
    }

    return true;
  });

  // Get progress color
  const getProgressColor = (percentage: number, achieved: boolean) => {
    if (achieved) return 'bg-green-600';
    if (percentage >= 80) return 'bg-yellow-600';
    if (percentage >= 50) return 'bg-blue-600';
    if (percentage > 0) return 'bg-purple-600';
    return 'bg-gray-300';
  };

  // Get competency display name
  const getCompetencyName = (area: string | undefined) => {
    const names: Record<string, string> = {
      'medicinsk-kunskap': 'Medicinsk kunskap',
      'klinisk-färdighet': 'Klinisk färdighet',
      'kommunikation': 'Kommunikation',
      'professionalism': 'Professionalism',
      'samverkan': 'Samverkan',
      'utveckling': 'Utveckling',
    };
    return names[area || 'other'] || 'Övrigt';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Socialstyrelsen Målbeskrivning
          </h1>
        </div>
        <p className="text-gray-600">
          Följ din progression mot specialistkompetens
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Totalt mål</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.totalGoals}</p>
          <p className="text-sm text-gray-700 mt-1">
            {summary.achievedGoals} uppnådda ({Math.round(summary.percentage)}%)
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-gray-900">Uppnådda</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.achievedGoals}</p>
          <p className="text-sm text-gray-700 mt-1">100% genomförda</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-yellow-600" />
            <span className="text-sm font-medium text-gray-900">Pågående</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.inProgress}</p>
          <p className="text-sm text-gray-700 mt-1">
            {summary.readyForAssessment} redo för bedömning
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">Ej påbörjade</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.notStarted}</p>
          <p className="text-sm text-gray-700 mt-1">Väntande</p>
        </div>
      </div>

      {/* Competency Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-600" />
          Kompetensområden
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(summary.byCompetency).map((competency) => {
            const data = summary.byCompetency[competency];
            return (
              <div
                key={competency}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {getCompetencyName(competency)}
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {data.achieved} / {data.total} mål
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    {Math.round(data.percentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Kompetensområde
            </label>
            <select
              value={filterCompetency}
              onChange={(e) => setFilterCompetency(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alla</option>
              <option value="medicinsk-kunskap">Medicinsk kunskap</option>
              <option value="klinisk-färdighet">Klinisk färdighet</option>
              <option value="kommunikation">Kommunikation</option>
              <option value="professionalism">Professionalism</option>
              <option value="samverkan">Samverkan</option>
              <option value="utveckling">Utveckling</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'in-progress' | 'achieved' | 'not-started')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alla</option>
              <option value="achieved">Uppnådda</option>
              <option value="in-progress">Pågående</option>
              <option value="not-started">Ej påbörjade</option>
            </select>
          </div>

          <div className="flex items-end">
            <span className="text-sm text-gray-600">
              Visar {filteredGoals.length} av {goalsWithProgress.length} mål
            </span>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {filteredGoals.map((goal) => {
          const progressColor = getProgressColor(goal.progress.percentage, goal.progress.achieved);
          const percentage = Math.round(goal.progress.percentage);

          return (
            <div
              key={goal.id}
              onClick={() => onGoalClick && onGoalClick(goal)}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {goal.id}
                    </span>
                    {goal.progress.achieved && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        Uppnådd
                      </span>
                    )}
                    {!goal.progress.achieved && percentage >= 80 && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-900 rounded text-xs font-semibold">
                        <TrendingUp className="w-3 h-3" />
                        Nästan klar
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {goal.title}
                  </h3>

                  {goal.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {goal.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {getCompetencyName(goal.competencyArea)}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {goal.progress.completedContent}/{goal.progress.totalContent} aktiviteter
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 min-w-[120px]">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
                    <p className="text-xs text-gray-500">Genomfört</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${progressColor} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Criteria (if available) */}
              {goal.assessmentCriteria && goal.assessmentCriteria.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Bedömningskriterier:</p>
                  <ul className="space-y-1">
                    {goal.assessmentCriteria.slice(0, 3).map((criterion, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>{criterion}</span>
                      </li>
                    ))}
                    {goal.assessmentCriteria.length > 3 && (
                      <li className="text-sm text-gray-500 italic">
                        +{goal.assessmentCriteria.length - 3} fler kriterier...
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredGoals.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Inga mål hittades
          </h3>
          <p className="text-gray-600">
            Prova att ändra dina filter för att se fler mål.
          </p>
        </div>
      )}
    </div>
  );
}
