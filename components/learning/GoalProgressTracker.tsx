'use client';

import { useState, useEffect } from 'react';
import {
  SocialstyrelseMål,
  MålProgress,
  getMålForLevel,
  getAllMålForLevel,
  calculateMålProgress
} from '@/data/socialstyrelsen-goals';
import {
  CheckCircle2,
  Circle,
  Target,
  Award,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Stethoscope,
  MessageSquare,
  Users,
  BrainCircuit,
  Lightbulb
} from 'lucide-react';

interface GoalProgressTrackerProps {
  userLevel: 'student' | 'at' | 'st1' | 'st2' | 'st3' | 'st4' | 'st5';
  showAllLevels?: boolean; // För ST-läkare, visa även tidigare års mål
}

export default function GoalProgressTracker({ userLevel, showAllLevels = false }: GoalProgressTrackerProps) {
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [userProgress, setUserProgress] = useState<MålProgress[]>([]);
  const [selectedCompetencyArea, setSelectedCompetencyArea] = useState<string | null>(null);

  // Hämta mål baserat på nivå
  const goals = showAllLevels ? getAllMålForLevel(userLevel) : getMålForLevel(userLevel);

  // Ladda progress från localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`socialstyrelsen-progress-${userLevel}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert date strings back to Date objects
      setUserProgress(parsed.map((p: any) => ({
        ...p,
        lastUpdated: new Date(p.lastUpdated)
      })));
    } else {
      // Initiera med tom progress för alla mål
      const initialProgress: MålProgress[] = goals.map(goal => ({
        målId: goal.id,
        achieved: false,
        progress: 0,
        evidenceCount: 0,
        lastUpdated: new Date(),
      }));
      setUserProgress(initialProgress);
    }
  }, [userLevel, showAllLevels, goals]);

  // Spara progress till localStorage
  useEffect(() => {
    if (userProgress.length > 0) {
      localStorage.setItem(`socialstyrelsen-progress-${userLevel}`, JSON.stringify(userProgress));
    }
  }, [userProgress, userLevel]);

  const toggleGoalExpanded = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const updateCriteriaProgress = (goalId: string, criteriaIndex: number) => {
    setUserProgress(prev => {
      const newProgress = [...prev];
      const goalProgressIndex = newProgress.findIndex(p => p.målId === goalId);

      if (goalProgressIndex === -1) {
        // Skapa ny progress
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return prev;

        newProgress.push({
          målId: goalId,
          achieved: false,
          progress: Math.round((1 / goal.assessmentCriteria.length) * 100),
          evidenceCount: 1,
          lastUpdated: new Date(),
        });
      } else {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return prev;

        const currentProgress = newProgress[goalProgressIndex];
        const progressPerCriteria = 100 / goal.assessmentCriteria.length;

        // Toggle progress
        if (currentProgress.progress >= (criteriaIndex + 1) * progressPerCriteria) {
          // Already marked, decrease
          currentProgress.progress = Math.max(0, currentProgress.progress - progressPerCriteria);
          currentProgress.evidenceCount = Math.max(0, currentProgress.evidenceCount - 1);
        } else {
          // Not marked, increase
          currentProgress.progress = Math.min(100, currentProgress.progress + progressPerCriteria);
          currentProgress.evidenceCount += 1;
        }

        currentProgress.achieved = currentProgress.progress >= 100;
        currentProgress.lastUpdated = new Date();
      }

      return newProgress;
    });
  };

  const getProgressForGoal = (goalId: string): MålProgress | undefined => {
    return userProgress.find(p => p.målId === goalId);
  };

  const getCompetencyIcon = (area: string) => {
    switch (area) {
      case 'medicinsk-kunskap': return <BookOpen className="w-5 h-5" />;
      case 'klinisk-färdighet': return <Stethoscope className="w-5 h-5" />;
      case 'kommunikation': return <MessageSquare className="w-5 h-5" />;
      case 'professionalism': return <Award className="w-5 h-5" />;
      case 'samverkan': return <Users className="w-5 h-5" />;
      case 'utveckling': return <Lightbulb className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getCompetencyColor = (area: string) => {
    switch (area) {
      case 'medicinsk-kunskap': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'klinisk-färdighet': return 'bg-green-100 text-green-700 border-green-300';
      case 'kommunikation': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'professionalism': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'samverkan': return 'bg-pink-100 text-pink-700 border-pink-300';
      case 'utveckling': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getCompetencyLabel = (area: string) => {
    switch (area) {
      case 'medicinsk-kunskap': return 'Medicinsk kunskap';
      case 'klinisk-färdighet': return 'Klinisk färdighet';
      case 'kommunikation': return 'Kommunikation';
      case 'professionalism': return 'Professionalism';
      case 'samverkan': return 'Samverkan';
      case 'utveckling': return 'Utveckling';
      default: return area;
    }
  };

  // Gruppera mål efter competency area
  const competencyAreas = Array.from(new Set(goals.map(g => g.competencyArea)));

  // Filtrera mål om competency area är vald
  const filteredGoals = selectedCompetencyArea
    ? goals.filter(g => g.competencyArea === selectedCompetencyArea)
    : goals;

  // Beräkna övergripande progress
  const overallProgress = calculateMålProgress(userProgress, userLevel);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Socialstyrelsen Mål</h1>
            <p className="text-blue-100">
              {userLevel === 'student' && 'Läkarprogrammet'}
              {userLevel === 'at' && 'Allmäntjänstgöring (AT)'}
              {userLevel.startsWith('st') && `Specialistutbildning år ${userLevel.replace('st', '')}`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold mb-1">{overallProgress.percentage}%</div>
            <div className="text-blue-100">
              {overallProgress.achieved} av {overallProgress.total} mål uppnådda
            </div>
          </div>
        </div>

        <div className="w-full bg-white bg-opacity-20 rounded-full h-4">
          <div
            className="bg-white h-4 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress.percentage}%` }}
          />
        </div>
      </div>

      {/* Competency Area Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Filtrera per kompetensområde</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCompetencyArea(null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
              selectedCompetencyArea === null
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
            }`}
          >
            <Target className="w-4 h-4" />
            Alla ({goals.length})
          </button>
          {competencyAreas.map(area => {
            const areaGoals = goals.filter(g => g.competencyArea === area);
            const areaProgress = userProgress.filter(p =>
              areaGoals.some(g => g.id === p.målId) && p.achieved
            ).length;

            return (
              <button
                key={area}
                onClick={() => setSelectedCompetencyArea(area === selectedCompetencyArea ? null : area)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedCompetencyArea === area
                    ? getCompetencyColor(area)
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {getCompetencyIcon(area)}
                <span className="font-medium">{getCompetencyLabel(area)}</span>
                <span className="px-2 py-0.5 bg-white bg-opacity-50 rounded-full text-xs font-semibold">
                  {areaProgress}/{areaGoals.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.map(goal => {
          const progress = getProgressForGoal(goal.id);
          const isExpanded = expandedGoals.has(goal.id);
          const criteriaProgress = progress?.progress || 0;
          const criteriaCount = goal.assessmentCriteria.length;
          const completedCriteria = Math.floor((criteriaProgress / 100) * criteriaCount);

          return (
            <div
              key={goal.id}
              className={`bg-white rounded-xl shadow-lg border-2 transition-all ${
                progress?.achieved
                  ? 'border-green-400'
                  : criteriaProgress > 0
                  ? 'border-blue-300'
                  : 'border-gray-200'
              }`}
            >
              {/* Goal Header */}
              <button
                onClick={() => toggleGoalExpanded(goal.id)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors rounded-xl"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {progress?.achieved ? (
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    ) : criteriaProgress > 0 ? (
                      <TrendingUp className="w-8 h-8 text-blue-500" />
                    ) : (
                      <Circle className="w-8 h-8 text-gray-300" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-800">{goal.title}</h3>
                          {goal.required && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                              Obligatorisk
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{goal.category}</span>
                          <span className="text-gray-300">•</span>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getCompetencyColor(goal.competencyArea)}`}>
                            {getCompetencyIcon(goal.competencyArea)}
                            <span>{getCompetencyLabel(goal.competencyArea)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Circle */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {Math.round(criteriaProgress)}%
                        </div>
                        <div className="text-xs text-gray-600">
                          {completedCriteria}/{criteriaCount} kriterier
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          progress?.achieved ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${criteriaProgress}%` }}
                      />
                    </div>

                    {/* Expand Indicator */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {progress?.evidenceCount || 0} bevis insamlade
                      </div>
                      <div className="flex items-center gap-1 text-sm text-blue-600">
                        {isExpanded ? 'Dölj detaljer' : 'Visa detaljer'}
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded Content - Assessment Criteria */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mt-4 mb-3">
                    Bedömningskriterier
                  </h4>
                  <div className="space-y-2">
                    {goal.assessmentCriteria.map((criteria, index) => {
                      const criteriaCompleted = index < completedCriteria;

                      return (
                        <button
                          key={index}
                          onClick={() => updateCriteriaProgress(goal.id, index)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                            criteriaCompleted
                              ? 'bg-green-50 border-green-300 hover:border-green-400'
                              : 'bg-white border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {criteriaCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                          <span className={`flex-1 text-left text-sm ${
                            criteriaCompleted ? 'text-green-800 font-medium' : 'text-gray-700'
                          }`}>
                            {criteria}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {progress?.achieved && (
                    <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <Award className="w-5 h-5" />
                        <span className="font-semibold">Mål uppnått!</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Senast uppdaterad: {progress.lastUpdated.toLocaleDateString('sv-SE')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredGoals.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Inga mål hittades för det valda kompetensområdet.
        </div>
      )}
    </div>
  );
}
