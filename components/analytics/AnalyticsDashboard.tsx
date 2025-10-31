'use client';

import { UserAnalytics, WeeklyStats, AccuracyStats } from '@/types/learning';
import { TrendingUp, TrendingDown, Minus, Award, Target, Clock, Zap, Flame, BookOpen, CheckCircle2, TrendingUp as TrendingUpIcon } from 'lucide-react';
import Link from 'next/link';

interface AnalyticsDashboardProps {
  analytics: UserAnalytics;
}

export default function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const { weeklyStats, accuracy, streakInfo, topicMastery } = analytics;

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (trend === 'declining') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-500" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'improving') return 'text-green-600 bg-green-50';
    if (trend === 'declining') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Din Statistik</h1>
        <p className="text-gray-600">Följ din utveckling och identifiera förbättringsområden</p>
      </div>

      {/* Weekly Overview */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Veckoöversikt</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Award className="w-6 h-6" />}
            label="Sessioner slutförda"
            value={`${weeklyStats.sessionsCompleted}/${weeklyStats.totalSessions}`}
            color="blue"
          />
          <StatCard
            icon={<Zap className="w-6 h-6" />}
            label="XP tjänad"
            value={weeklyStats.xpEarned.toString()}
            color="yellow"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            label="Genomsnittlig accuracy"
            value={`${Math.round(weeklyStats.averageAccuracy)}%`}
            color="green"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Total tid"
            value={`${Math.floor(weeklyStats.totalTimeSpent / 60)}min`}
            color="purple"
          />
        </div>

        {/* Progress Bar for Week */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Veckoframsteg</span>
            <span className="text-sm text-gray-600">
              {weeklyStats.sessionsCompleted}/{weeklyStats.totalSessions} dagar
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
              style={{
                width: `${(weeklyStats.sessionsCompleted / weeklyStats.totalSessions) * 100}%`,
              }}
            />
          </div>
          {weeklyStats.sessionsCompleted === weeklyStats.totalSessions && (
            <p className="text-green-600 text-sm mt-2 font-medium">
              🎉 Perfekt vecka! Alla dagar slutförda!
            </p>
          )}
        </div>
      </div>

      {/* Accuracy Stats */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Precision & Träffsäkerhet</h2>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getTrendColor(accuracy.trend)}`}>
            {getTrendIcon(accuracy.trend)}
            <span className="text-sm font-medium capitalize">{accuracy.trend}</span>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Övergripande accuracy</span>
            <span className="text-2xl font-bold text-blue-600">{Math.round(accuracy.overall)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all"
              style={{ width: `${accuracy.overall}%` }}
            />
          </div>
        </div>

        {/* By Difficulty */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Per svårighetsgrad</h3>
          <div className="space-y-3">
            <DifficultyBar label="Easy" accuracy={accuracy.byDifficulty.easy} color="green" />
            <DifficultyBar label="Medium" accuracy={accuracy.byDifficulty.medium} color="yellow" />
            <DifficultyBar label="Hard" accuracy={accuracy.byDifficulty.hard} color="red" />
          </div>
        </div>

        {/* By Subspecialty */}
        {Object.keys(accuracy.bySubspecialty).length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Per område</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(accuracy.bySubspecialty).map(([subspecialty, acc]) => (
                <div key={subspecialty} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{subspecialty}</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {Math.round(acc)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${acc}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Streak Info */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-lg border-2 border-orange-300 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Din Streak
          </h2>
          <div className="flex items-center gap-2">
            {streakInfo.freezeTokens > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 rounded-full">
                <span className="text-2xl">❄️</span>
                <span className="text-sm font-semibold text-blue-800">
                  {streakInfo.freezeTokens} freeze tokens
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-orange-600 mb-1">
              {streakInfo.current}
            </div>
            <div className="text-sm text-gray-600">Nuvarande streak</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-gray-800 mb-1">
              {streakInfo.longest}
            </div>
            <div className="text-sm text-gray-600">Längsta streak</div>
          </div>
        </div>

        {streakInfo.current > 0 && (
          <div className="mt-4 p-3 bg-orange-100 rounded-lg">
            <p className="text-sm text-orange-800 text-center">
              🔥 Fortsätt så! Kom tillbaka imorgon för att hålla din streak vid liv!
            </p>
          </div>
        )}
      </div>

      {/* Socialstyrelsen Mål Progress */}
      {analytics.goalProgress && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-500" />
              Socialstyrelsen Mål
            </h2>
            <Link
              href="/goals"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Se alla mål
              <TrendingUpIcon className="w-4 h-4" />
            </Link>
          </div>

          {/* Overall Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Övergripande progress</span>
              <span className="text-2xl font-bold text-blue-600">{analytics.goalProgress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all"
                style={{ width: `${analytics.goalProgress.percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{analytics.goalProgress.achievedGoals} av {analytics.goalProgress.totalGoals} mål uppnådda</span>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="font-medium text-green-600">
                  {Math.round((analytics.goalProgress.achievedGoals / analytics.goalProgress.totalGoals) * 100)}% slutfört
                </span>
              </div>
            </div>
          </div>

          {/* By Competency Area */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Progress per kompetensområde</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(analytics.goalProgress.byCompetencyArea).map(([area, progress]) => {
                const percentage = progress.total > 0 ? Math.round((progress.achieved / progress.total) * 100) : 0;
                const areaLabels: Record<string, { label: string; color: string }> = {
                  'medicinsk-kunskap': { label: 'Medicinsk kunskap', color: 'blue' },
                  'klinisk-färdighet': { label: 'Klinisk färdighet', color: 'green' },
                  'kommunikation': { label: 'Kommunikation', color: 'purple' },
                  'professionalism': { label: 'Professionalism', color: 'yellow' },
                  'samverkan': { label: 'Samverkan', color: 'pink' },
                  'utveckling': { label: 'Utveckling', color: 'orange' },
                };
                const areaInfo = areaLabels[area] || { label: area, color: 'gray' };

                return (
                  <div key={area} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{areaInfo.label}</span>
                      <span className="text-sm font-semibold text-gray-800">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div
                        className={`bg-${areaInfo.color}-500 h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600">
                      {progress.achieved}/{progress.total} mål
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          {analytics.goalProgress.recentActivity.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Senaste aktivitet</h3>
              <div className="space-y-2">
                {analytics.goalProgress.recentActivity.slice(0, 3).map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{activity.goalTitle}</p>
                      <p className="text-xs text-gray-600">{activity.activityType}</p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {new Date(activity.timestamp).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Topic Mastery */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Ämneskunskaper</h2>

        <div className="space-y-4">
          {topicMastery.map((topic) => (
            <div key={topic.topic} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{topic.topic}</h3>
                <span className="text-sm text-gray-600">
                  {topic.questionsAnswered} frågor besvarade
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Mastery</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {Math.round(topic.mastery)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${topic.mastery}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Accuracy</span>
                    <span className="text-sm font-semibold text-green-600">
                      {Math.round(topic.accuracy)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${topic.accuracy}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600 border-blue-300',
    yellow: 'bg-yellow-100 text-yellow-600 border-yellow-300',
    green: 'bg-green-100 text-green-600 border-green-300',
    purple: 'bg-purple-100 text-purple-600 border-purple-300',
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colors[color as keyof typeof colors]}`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function DifficultyBar({ label, accuracy, color }: any) {
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-700 capitalize">{label}</span>
        <span className="text-sm font-semibold text-gray-800">{Math.round(accuracy)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colors[color as keyof typeof colors]}`}
          style={{ width: `${accuracy}%` }}
        />
      </div>
    </div>
  );
}

// Mock data generator for testing
export function generateMockAnalytics(): UserAnalytics {
  return {
    userId: 'user123',
    weeklyStats: {
      sessionsCompleted: 6,
      totalSessions: 7,
      xpEarned: 185,
      averageAccuracy: 82,
      totalTimeSpent: 3420, // seconds
    },
    accuracy: {
      overall: 82,
      byDifficulty: {
        easy: 95,
        medium: 80,
        hard: 68,
      },
      bySubspecialty: {
        'Höft': 85,
        'Fotled': 78,
      },
      trend: 'improving',
    },
    streakInfo: {
      current: 12,
      longest: 18,
      freezeTokens: 2,
      lastActivity: new Date(),
    },
    topicMastery: [
      {
        topic: 'Ottawa Ankle Rules',
        mastery: 90,
        questionsAnswered: 15,
        accuracy: 93,
      },
      {
        topic: 'Höftfrakturer',
        mastery: 65,
        questionsAnswered: 10,
        accuracy: 70,
      },
      {
        topic: 'Klinisk Undersökning',
        mastery: 75,
        questionsAnswered: 12,
        accuracy: 83,
      },
    ],
    goalProgress: {
      totalGoals: 20,
      achievedGoals: 8,
      percentage: 40,
      byCompetencyArea: {
        'medicinsk-kunskap': { total: 6, achieved: 3 },
        'klinisk-färdighet': { total: 8, achieved: 4 },
        'kommunikation': { total: 2, achieved: 1 },
        'professionalism': { total: 2, achieved: 0 },
        'samverkan': { total: 1, achieved: 0 },
        'utveckling': { total: 1, achieved: 0 },
      },
      recentActivity: [
        {
          goalId: 'st1-01',
          goalTitle: 'Handlägga höftfrakturer',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          activityType: 'Slutförde bedömningskriterium',
        },
        {
          goalId: 'st1-02',
          goalTitle: 'Grundläggande operationsteknik',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          activityType: 'Påbörjade nytt mål',
        },
        {
          goalId: 'lp-03',
          goalTitle: 'ABCDE och primär bedömning',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          activityType: 'Slutförde mål',
        },
      ],
    },
  };
}
