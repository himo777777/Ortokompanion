'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronDown, ChevronUp, Clock, Target } from 'lucide-react';
import { DailyMix } from '@/types/progression';
import { IntegratedUserProfile } from '@/types/integrated';
import { colors } from '@/lib/design-tokens';
import { NextGoalFocus } from '@/components/progression/NextGoalFocus';
import AdaptiveIntelligenceWidget from './AdaptiveIntelligenceWidget';

interface QuickStartViewProps {
  dailyMix: DailyMix;
  profile: IntegratedUserProfile;
  onStartActivity: (activityId: string, type: 'new' | 'interleave' | 'srs') => void;
  recoveryMode?: boolean;
}

/**
 * QuickStartView Component
 *
 * Simplified daily plan view that focuses on immediate actions.
 * Shows only what the user needs to start working right now.
 *
 * Features:
 * - Clean, minimal UI with clear CTAs
 * - 3 activity cards with start buttons
 * - Optional detail expansion
 * - Total time estimate
 * - Current band display
 */
export default function QuickStartView({
  dailyMix,
  profile,
  onStartActivity,
  recoveryMode = false,
}: QuickStartViewProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [viewPreference, setViewPreference] = useState<'snabbstart' | 'detaljerad'>('snabbstart');

  // Load preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ortokompanion_view_preference');
    if (saved === 'detaljerad') {
      setViewPreference('detaljerad');
      setShowDetails(true);
    }
  }, []);

  // Save preference to localStorage
  const toggleView = (view: 'snabbstart' | 'detaljerad') => {
    setViewPreference(view);
    setShowDetails(view === 'detaljerad');
    localStorage.setItem('ortokompanion_view_preference', view);
  };

  // Calculate total time
  const totalMinutes =
    (dailyMix?.newContent?.estimatedTime || 0) +
    (dailyMix?.interleavingContent?.estimatedTime || 0) +
    (dailyMix?.srsReviews?.estimatedTime || 0);

  // Get domain name in Swedish
  const getDomainName = (domain: string): string => {
    const names: Record<string, string> = {
      'TRAUMA': 'Traumaortopedi',
      'HOEFT': 'Höftkirurgi',
      'KNA': 'Knäkirurgi',
      'FOT_FOTLED': 'Fot & Fotled',
      'HAND_HANDLED': 'Hand & Handled',
      'AXEL_ARMBAGE': 'Axel & Armbåge',
      'RYGG': 'Ryggkirurgi',
      'SPORT': 'Idrottsmedicin',
      'TUMOR': 'Tumörortopedi',
    };
    return names[domain] || domain;
  };

  // Get activities in order with clear Swedish names
  const newDomain = dailyMix?.newContent?.domain || 'TRAUMA';
  const activities = [
    {
      id: 'new-content',
      type: 'new' as const,
      title: `Nya frågor: ${getDomainName(newDomain)}`,
      domain: newDomain,
      count: dailyMix?.newContent?.items?.length || 0,
      minutes: dailyMix?.newContent?.estimatedTime || 0,
      icon: '🎯',
      color: colors.primary[500],
      bgColor: colors.primary[50],
    },
    {
      id: 'interleaving',
      type: 'interleave' as const,
      title: 'Repetition från andra områden',
      domain: dailyMix?.interleavingContent?.domain || 'Blandade domäner',
      count: dailyMix?.interleavingContent?.items?.length || 0,
      minutes: dailyMix?.interleavingContent?.estimatedTime || 0,
      icon: '🔀',
      color: colors.secondary[500],
      bgColor: colors.secondary[50],
    },
    {
      id: 'srs-review',
      type: 'srs' as const,
      title: 'Dagliga flashcards',
      domain: 'Blandade domäner',
      count: dailyMix?.srsReviews?.cards?.length || 0,
      minutes: dailyMix?.srsReviews?.estimatedTime || 0,
      icon: '🔄',
      color: colors.success[500],
      bgColor: colors.success[50],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => toggleView('snabbstart')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewPreference === 'snabbstart'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Snabbstart
          </button>
          <button
            onClick={() => toggleView('detaljerad')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewPreference === 'detaljerad'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Detaljerad
          </button>
        </div>

        {/* Recovery Mode Badge */}
        {recoveryMode && (
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
            <span>😌</span>
            <span>Återhämtningsläge</span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {new Date().toLocaleDateString('sv-SE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h2>
            <p className="text-gray-600">
              3 aktiviteter • {totalMinutes} minuter • Band {dailyMix.targetBand}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl mb-2">{activities[0].icon}</div>
            <p className="text-sm text-gray-600">Börja med {activities[0].title}</p>
          </div>
        </div>
      </div>

      {/* Adaptive Intelligence Widget */}
      <div className="mb-4">
        <AdaptiveIntelligenceWidget dailyMix={dailyMix} profile={profile} />
      </div>

      {/* Next Goal Focus Widget */}
      <div className="mb-4">
        <NextGoalFocus
          userProgram="bt"
          userSpecialty="ortopedi"
          profile={profile}
        />
      </div>

      {/* Activity Cards */}
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: activity.bgColor }}
                  >
                    {activity.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {activity.count} frågor • ~{activity.minutes} min
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onStartActivity(activity.id, activity.type)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all hover:scale-105 active:scale-95 shadow-md"
                  style={{ backgroundColor: activity.color }}
                >
                  <Play className="w-5 h-5" />
                  <span>Starta</span>
                </button>
              </div>

              {/* Optional Details */}
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-4 pt-4 border-t border-gray-100"
                >
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Svårighetsgrad</p>
                      <p className="font-medium">{dailyMix.targetBand}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Estimerad tid</p>
                      <p className="font-medium">{activity.minutes} minuter</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Antal frågor</p>
                      <p className="font-medium">{activity.count} st</p>
                    </div>
                  </div>

                  {activity.type === 'new' && dailyMix.newContent.reasoning && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700 font-medium mb-1">Varför detta innehåll?</p>
                      <p className="text-xs text-blue-600">{dailyMix.newContent.reasoning}</p>
                    </div>
                  )}
                  {activity.type === 'interleave' && dailyMix.interleavingContent.reasoning && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-purple-700 font-medium mb-1">Varför detta innehåll?</p>
                      <p className="text-xs text-purple-600">{dailyMix.interleavingContent.reasoning}</p>
                    </div>
                  )}
                  {activity.type === 'srs' && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-700 font-medium mb-1">Varför repetition?</p>
                      <p className="text-xs text-green-600">
                        Dessa kort behöver repeteras för optimal långtidsretention
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Stats (Minimal) */}
      <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Total tid:</span>
            <span className="font-semibold text-gray-800">{totalMinutes} minuter</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Nuvarande band:</span>
            <span className="font-semibold text-gray-800">{dailyMix.targetBand}</span>
          </div>
        </div>
      </div>

      {/* Toggle Details Button (only in Snabbstart mode) */}
      {viewPreference === 'snabbstart' && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>{showDetails ? 'Dölj' : 'Visa'} detaljer</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
