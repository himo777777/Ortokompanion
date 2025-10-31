'use client';

import { useState } from 'react';
import { Leaderboard, LeaderboardEntry } from '@/types/learning';
import { Trophy, Medal, Award, TrendingUp, Flame, Users } from 'lucide-react';

export default function LeaderboardComponent() {
  const [selectedType, setSelectedType] = useState<'global' | 'subspecialty' | 'peers'>('global');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'alltime'>('weekly');

  // Mock data
  const mockLeaderboard: Leaderboard = {
    type: selectedType,
    period: selectedPeriod,
    userRank: 8,
    entries: [
      {
        userId: '1',
        username: 'Anna S.',
        level: 12,
        xp: 2850,
        streak: 28,
        subspecialty: 'Höft',
        rank: 1,
      },
      {
        userId: '2',
        username: 'Erik L.',
        level: 11,
        xp: 2720,
        streak: 24,
        subspecialty: 'Knä',
        rank: 2,
      },
      {
        userId: '3',
        username: 'Maria K.',
        level: 11,
        xp: 2680,
        streak: 22,
        subspecialty: 'Skuldra',
        rank: 3,
      },
      {
        userId: '4',
        username: 'Johan P.',
        level: 10,
        xp: 2520,
        streak: 19,
        subspecialty: 'Fotled',
        rank: 4,
      },
      {
        userId: '5',
        username: 'Linda M.',
        level: 10,
        xp: 2450,
        streak: 18,
        subspecialty: 'Höft',
        rank: 5,
      },
      {
        userId: '6',
        username: 'David A.',
        level: 9,
        xp: 2280,
        streak: 16,
        subspecialty: 'Handled',
        rank: 6,
      },
      {
        userId: '7',
        username: 'Sofia B.',
        level: 9,
        xp: 2150,
        streak: 14,
        subspecialty: 'Knä',
        rank: 7,
      },
      {
        userId: '8',
        username: 'Du',
        level: 8,
        xp: 1980,
        streak: 12,
        subspecialty: 'Höft',
        rank: 8,
      },
      {
        userId: '9',
        username: 'Peter N.',
        level: 8,
        xp: 1920,
        streak: 11,
        subspecialty: 'Fotled',
        rank: 9,
      },
      {
        userId: '10',
        username: 'Emma R.',
        level: 7,
        xp: 1850,
        streak: 10,
        subspecialty: 'Skuldra',
        rank: 10,
      },
    ],
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2)
      return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3)
      return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-sm font-semibold text-gray-600">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-400';
    if (rank === 2) return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400';
    if (rank === 3) return 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-400';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
          <Trophy className="w-12 h-12 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Topplistan</h1>
        <p className="text-gray-600">Se hur du rankas mot andra läkare</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Typ</label>
            <div className="flex gap-2">
              {(['global', 'subspecialty', 'peers'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedType === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'global' && <Users className="w-4 h-4 inline mr-1" />}
                  {type === 'global' ? 'Global' : type === 'subspecialty' ? 'Mitt område' : 'Peers'}
                </button>
              ))}
            </div>
          </div>

          {/* Period Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <div className="grid grid-cols-2 gap-2">
              {(['daily', 'weekly', 'monthly', 'alltime'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === period
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period === 'daily'
                    ? 'Dag'
                    : period === 'weekly'
                    ? 'Vecka'
                    : period === 'monthly'
                    ? 'Månad'
                    : 'All-time'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Your Rank Card */}
      {mockLeaderboard.userRank && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-1">Din placering</p>
              <p className="text-4xl font-bold">#{mockLeaderboard.userRank}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 mb-1">Ditt XP</p>
              <p className="text-2xl font-bold">
                {mockLeaderboard.entries.find(e => e.username === 'Du')?.xp || 0}
              </p>
            </div>
            <Award className="w-16 h-16 opacity-20" />
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="space-y-2 p-4">
          {mockLeaderboard.entries.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${getRankBg(
                entry.rank
              )} ${entry.username === 'Du' ? 'ring-2 ring-blue-500' : ''}`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-12">
                {getRankIcon(entry.rank)}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800">
                    {entry.username}
                    {entry.username === 'Du' && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                        Du
                      </span>
                    )}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                    Lv. {entry.level}
                  </span>
                </div>
                {entry.subspecialty && (
                  <p className="text-sm text-gray-600">{entry.subspecialty}</p>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-right">
                <div>
                  <div className="flex items-center gap-1 text-gray-600 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs">XP</span>
                  </div>
                  <p className="font-bold text-gray-800">{entry.xp.toLocaleString()}</p>
                </div>

                <div>
                  <div className="flex items-center gap-1 text-orange-600 mb-1">
                    <Flame className="w-4 h-4" />
                    <span className="text-xs">Streak</span>
                  </div>
                  <p className="font-bold text-orange-600">{entry.streak}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tips:</strong> Behåll din streak och slutför dagliga sessioner för att klättra på topplistan!
        </p>
      </div>
    </div>
  );
}
