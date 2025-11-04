'use client';

import { useState } from 'react';
import { Calendar, Target, Clock, CheckSquare, BookOpen, Sparkles, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { generateStudyPlan } from '@/lib/ai-service';
import { EducationLevel } from '@/types/education';
import { Domain } from '@/types/onboarding';

interface AIStudyPlanGeneratorProps {
  userLevel: EducationLevel;
  currentGoals: string[];
  weakDomains: Domain[];
  enableAI?: boolean;
}

export default function AIStudyPlanGenerator({
  userLevel,
  currentGoals,
  weakDomains,
  enableAI = true,
}: AIStudyPlanGeneratorProps) {
  const [availableTimePerDay, setAvailableTimePerDay] = useState(60); // minutes
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [studyPlan, setStudyPlan] = useState<{
    weeklyPlan: Array<{
      day: number;
      activities: Array<{
        type: 'questions' | 'cases' | 'reading' | 'review';
        domain: Domain;
        estimatedTime: number;
        priority: 'high' | 'medium' | 'low';
        goal: string;
      }>;
    }>;
    milestones: Array<{
      week: number;
      goal: string;
      successCriteria: string;
    }>;
    recommendations: string[];
  } | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const handleGeneratePlan = async () => {
    setLoadingPlan(true);
    try {
      const result = await generateStudyPlan({
        userLevel,
        targetGoals: currentGoals,
        weakDomains,
        availableTimePerDay,
        deadline: deadline || undefined,
      });
      setStudyPlan(result);
    } catch (error) {
      console.error('Failed to generate study plan:', error);
      setStudyPlan(null);
    } finally {
      setLoadingPlan(false);
    }
  };

  const getDomainName = (domain: string) => {
    const names: Record<string, string> = {
      'trauma': 'Trauma',
      'axel-armbåge': 'Axel & Armbåge',
      'hand-handled': 'Hand & Handled',
      'höft': 'Höft',
      'knä': 'Knä',
      'fot-fotled': 'Fot & Fotled',
      'rygg': 'Rygg',
      'sport': 'Sportmedicin',
      'tumör': 'Tumör',
    };
    return names[domain] || domain;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            AI Studieplaneringsgenerator
          </h1>
        </div>
        <p className="text-gray-600">
          Få en personlig, AI-genererad studieplan baserad på dina mål och svagheter
        </p>
      </div>

      {/* Configuration */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-600" />
          Konfigurera din studieplan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Din nuvarande nivå
            </label>
            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="font-semibold text-gray-900 capitalize">{userLevel}</p>
            </div>
          </div>

          {/* Available Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tillgänglig tid per dag (minuter)
            </label>
            <input
              type="number"
              value={availableTimePerDay}
              onChange={(e) => setAvailableTimePerDay(parseInt(e.target.value) || 0)}
              min="15"
              max="480"
              step="15"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Rekommenderat: 60-120 minuter/dag
            </p>
          </div>

          {/* Deadline (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline (valfritt)
            </label>
            <input
              type="date"
              value={deadline ? deadline.toISOString().split('T')[0] : ''}
              onChange={(e) => setDeadline(e.target.value ? new Date(e.target.value) : null)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Goals count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aktiva mål
            </label>
            <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-900">{currentGoals.length} mål</p>
            </div>
          </div>
        </div>

        {/* Weak Domains */}
        {weakDomains.length > 0 && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fokusområden (baserat på svagheter)
            </label>
            <div className="flex flex-wrap gap-2">
              {weakDomains.map((domain) => (
                <span
                  key={domain}
                  className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                >
                  {getDomainName(domain)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGeneratePlan}
          disabled={loadingPlan || !enableAI}
          className="mt-6 w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
        >
          {loadingPlan ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Genererar personlig studieplan...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generera AI-studieplan
            </>
          )}
        </button>
      </div>

      {/* Loading State */}
      {loadingPlan && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-8 mb-8">
          <div className="flex flex-col items-center gap-4 text-purple-700">
            <Loader2 className="w-12 h-12 animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-lg">AI skapar din personliga studieplan...</p>
              <p className="text-sm mt-1">Analyserar dina mål, svagheter och tillgänglig tid</p>
            </div>
          </div>
        </div>
      )}

      {/* Study Plan Results */}
      {studyPlan && (
        <div className="space-y-6">
          {/* AI Badge */}
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold">AI-Genererad Studieplan</span>
          </div>

          {/* Recommendations */}
          {studyPlan.recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                AI-rekommendationer
              </h3>
              <ul className="space-y-2">
                {studyPlan.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-blue-900">
                    <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Milestones Timeline */}
          {studyPlan.milestones.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Milstolpar
              </h3>
              <div className="space-y-4">
                {studyPlan.milestones.map((milestone, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="font-bold text-green-700">V{milestone.week}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{milestone.goal}</h4>
                      <p className="text-sm text-gray-600">{milestone.successCriteria}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Plan */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Veckovis Plan
            </h3>
            <div className="space-y-6">
              {studyPlan.weeklyPlan.map((dayPlan, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Day Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-lg">Dag {dayPlan.day}</h4>
                      <span className="text-sm opacity-90">{dayPlan.activities.length} aktiviteter</span>
                    </div>
                  </div>

                  {/* Day Activities */}
                  <div className="p-4 bg-gray-50">
                    <div className="space-y-2">
                      {dayPlan.activities.map((activity, aidx) => {
                        const priorityColor = getPriorityColor(activity.priority);
                        return (
                          <div
                            key={aidx}
                            className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3"
                          >
                            <div
                              className={`flex-shrink-0 w-2 h-2 rounded-full ${
                                priorityColor === 'red'
                                  ? 'bg-red-500'
                                  : priorityColor === 'yellow'
                                  ? 'bg-yellow-500'
                                  : 'bg-blue-500'
                              }`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase">
                                  {activity.type}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    priorityColor === 'red'
                                      ? 'bg-red-100 text-red-700'
                                      : priorityColor === 'yellow'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {activity.priority === 'high' ? 'Hög prio' : activity.priority === 'medium' ? 'Mellan' : 'Låg prio'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-900 mt-1">{activity.goal} - {activity.domain}</p>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm font-medium">{activity.estimatedTime} min</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-green-900 mb-2">Nästa steg</h4>
                <p className="text-sm text-green-800 mb-3">
                  Din AI-genererade studieplan är redo! Börja med vecka 1 och följ schemat för bästa resultat.
                </p>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Starta studieplanen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
