'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, Flame, Heart, MessageCircle, Sparkles, Loader2, Trophy, Calendar, CheckCircle, Clock } from 'lucide-react';
import { generatePerformanceInsights } from '@/lib/ai-service';

interface StudySession {
  date: Date;
  questionsCompleted: number;
  accuracy: number;
  timeSpent: number; // minutes
  xpEarned: number;
}

interface AILearningCoachProps {
  recentSessions: StudySession[];
  currentStreak: number; // days
  goalsAchieved: number;
  totalGoals: number;
  enableAI?: boolean;
}

export default function AILearningCoach({
  recentSessions,
  currentStreak,
  goalsAchieved,
  totalGoals,
  enableAI = true,
}: AILearningCoachProps) {
  const [aiInsights, setAiInsights] = useState<{
    insights: string[];
    encouragement: string;
    recommendations: string[];
    nextMilestone: string;
    estimatedTimeToMilestone: string;
  } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Load AI insights on mount
  useEffect(() => {
    if (enableAI && recentSessions.length > 0 && !aiInsights) {
      loadAIInsights();
    }
  }, [enableAI, recentSessions]);

  const loadAIInsights = async () => {
    setLoadingInsights(true);
    try {
      const result = await generatePerformanceInsights({
        recentSessions: recentSessions.map(s => ({
          date: s.date,
          accuracy: s.accuracy,
          xpEarned: s.xpEarned,
          timeSpent: s.timeSpent,
          hintsUsed: 0, // TODO: Track hints used in session data
        })),
        currentStreak,
        goalsAchieved,
        totalGoals,
      });
      setAiInsights(result);
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      setAiInsights(null);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Calculate stats
  const totalXP = recentSessions.reduce((sum, s) => sum + s.xpEarned, 0);
  const totalQuestions = recentSessions.reduce((sum, s) => sum + s.questionsCompleted, 0);
  const totalMinutes = recentSessions.reduce((sum, s) => sum + s.timeSpent, 0);
  const avgAccuracy = recentSessions.length > 0
    ? recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length
    : 0;
  const goalProgress = totalGoals > 0 ? (goalsAchieved / totalGoals) * 100 : 0;

  // Get streak message
  const getStreakMessage = () => {
    if (currentStreak === 0) return 'Starta en ny streak idag!';
    if (currentStreak === 1) return 'Bra start! Fortsätt imorgon.';
    if (currentStreak < 7) return `${currentStreak} dagar i rad! Fantastiskt!`;
    if (currentStreak < 30) return `${currentStreak} dagar streak! Du är dedikerad!`;
    return `${currentStreak} dagar! Du är en legend!`;
  };

  // Get streak color
  const getStreakColor = () => {
    if (currentStreak === 0) return 'gray';
    if (currentStreak < 7) return 'blue';
    if (currentStreak < 30) return 'purple';
    return 'orange';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Din AI-coach
          </h1>
        </div>
        <p className="text-gray-600">
          Personliga insikter och uppmuntran baserat på din prestanda
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Streak */}
        <div className={`bg-gradient-to-br rounded-lg border-2 p-6 ${
          getStreakColor() === 'orange'
            ? 'from-orange-50 to-red-50 border-orange-300'
            : getStreakColor() === 'purple'
            ? 'from-purple-50 to-pink-50 border-purple-300'
            : getStreakColor() === 'blue'
            ? 'from-blue-50 to-cyan-50 border-blue-300'
            : 'from-gray-50 to-gray-100 border-gray-300'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <Flame className={`w-6 h-6 ${
              getStreakColor() === 'orange' ? 'text-orange-600' :
              getStreakColor() === 'purple' ? 'text-purple-600' :
              getStreakColor() === 'blue' ? 'text-blue-600' :
              'text-gray-600'
            }`} />
            <span className="text-sm font-medium text-gray-700">Daglig streak</span>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-1">{currentStreak}</p>
          <p className="text-sm text-gray-600">{getStreakMessage()}</p>
        </div>

        {/* Total XP */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-900">Total XP</span>
          </div>
          <p className="text-4xl font-bold text-green-900 mb-1">{totalXP}</p>
          <p className="text-sm text-green-700">Senaste veckorna</p>
        </div>

        {/* Questions Completed */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Frågor klara</span>
          </div>
          <p className="text-4xl font-bold text-blue-900 mb-1">{totalQuestions}</p>
          <p className="text-sm text-blue-700">Senaste veckorna</p>
        </div>

        {/* Study Time */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Studietid</span>
          </div>
          <p className="text-4xl font-bold text-purple-900 mb-1">{Math.round(totalMinutes / 60)}</p>
          <p className="text-sm text-purple-700">timmar totalt</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Goal Progress */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Målprogression</h2>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900">
                {goalsAchieved} / {totalGoals}
              </span>
              <span className="text-lg font-semibold text-green-600">
                {Math.round(goalProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Du har uppnått {goalsAchieved} av {totalGoals} mål. Fortsätt så!
          </p>
        </div>

        {/* Average Accuracy */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Genomsnittlig träffsäkerhet</h2>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(avgAccuracy)}%
              </span>
              <span className={`text-lg font-semibold ${
                avgAccuracy >= 80 ? 'text-green-600' :
                avgAccuracy >= 60 ? 'text-yellow-600' :
                'text-orange-600'
              }`}>
                {avgAccuracy >= 80 ? 'Utmärkt!' : avgAccuracy >= 60 ? 'Bra!' : 'Fortsätt öva!'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  avgAccuracy >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  avgAccuracy >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-orange-500 to-red-500'
                }`}
                style={{ width: `${avgAccuracy}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Baserat på {recentSessions.length} senaste studiepassen
          </p>
        </div>
      </div>

      {/* Loading AI Insights */}
      {loadingInsights && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-8 mb-8">
          <div className="flex flex-col items-center gap-4 text-purple-700">
            <Loader2 className="w-12 h-12 animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-lg">Din AI-coach analyserar din prestanda...</p>
              <p className="text-sm mt-1">Förbereder personliga insikter och uppmuntran</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {aiInsights && (
        <div className="space-y-6">
          {/* Encouragement */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-300 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-pink-900">Uppmuntran från din AI-coach</h2>
                  <Sparkles className="w-5 h-5 text-pink-600" />
                </div>
                <p className="text-pink-800 leading-relaxed text-lg">
                  {aiInsights.encouragement}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Prestationsinsikter</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiInsights.insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-800">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white border-2 border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Rekommendationer</h2>
            </div>
            <div className="space-y-3">
              {aiInsights.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-green-50 border-l-4 border-green-500 rounded-lg p-4"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-200 text-green-800 font-bold text-sm flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-gray-800 flex-1">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Next Milestone */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-900 mb-1 flex items-center gap-2">
                  Nästa milstolpe
                  <Sparkles className="w-4 h-4 text-yellow-600" />
                </h3>
                <p className="text-yellow-800 font-semibold mb-2">{aiInsights.nextMilestone}</p>
                <div className="flex items-center gap-2 text-sm text-yellow-700">
                  <Calendar className="w-4 h-4" />
                  <span>Estimerad tid: {aiInsights.estimatedTimeToMilestone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      {enableAI && (
        <div className="mt-8 text-center">
          <button
            onClick={loadAIInsights}
            disabled={loadingInsights}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-lg font-semibold transition-all flex items-center gap-2 mx-auto"
          >
            {loadingInsights ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyserar...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Uppdatera AI-coaching
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
