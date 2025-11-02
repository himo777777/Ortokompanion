'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/lib/design-tokens';
import {
  generateRecommendations,
  getTimeOfDay,
  StudyRecommendation,
  RecommendationContext,
} from '@/lib/recommendation-engine';
import { UserProfile } from '@/types/onboarding';
import {
  Sparkles,
  Clock,
  Award,
  ChevronRight,
  TrendingUp,
  Brain,
  Coffee,
  Zap,
  RefreshCw,
  Target,
} from 'lucide-react';

interface RecommendationWidgetProps {
  profile: UserProfile;
  onSelectRecommendation?: (recommendation: StudyRecommendation) => void;
}

export default function RecommendationWidget({
  profile,
  onSelectRecommendation,
}: RecommendationWidgetProps) {
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate recommendations on mount and when profile changes
  useEffect(() => {
    generateRecs();
  }, [profile]);

  const generateRecs = () => {
    setIsLoading(true);

    const context: RecommendationContext = {
      profile,
      timeOfDay: getTimeOfDay(),
      lastStudySession: profile.gamification.lastActivity,
    };

    const recs = generateRecommendations(context);
    setRecommendations(recs);

    setIsLoading(false);
  };

  const getTypeIcon = (type: StudyRecommendation['type']) => {
    switch (type) {
      case 'domain':
        return <Target className="w-5 h-5" />;
      case 'topic':
        return <Brain className="w-5 h-5" />;
      case 'review':
        return <RefreshCw className="w-5 h-5" />;
      case 'challenge':
        return <Zap className="w-5 h-5" />;
      case 'break':
        return <Coffee className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: StudyRecommendation['priority']) => {
    switch (priority) {
      case 'high':
        return colors.error[500];
      case 'medium':
        return colors.warning[500];
      case 'low':
        return colors.success[500];
    }
  };

  const getActionColor = (actionType: StudyRecommendation['actionType']) => {
    switch (actionType) {
      case 'new-content':
        return colors.primary[500];
      case 'review':
        return colors.secondary[500];
      case 'practice':
        return colors.warning[500];
      case 'rest':
        return colors.success[500];
    }
  };

  const getDifficultyBadge = (difficulty?: string) => {
    if (!difficulty) return null;

    const badges = {
      easy: { label: 'Lätt', bg: colors.success[100], text: colors.success[700] },
      medium: { label: 'Medel', bg: colors.warning[100], text: colors.warning[700] },
      hard: { label: 'Svår', bg: colors.error[100], text: colors.error[700] },
    };

    const badge = badges[difficulty as keyof typeof badges];
    if (!badge) return null;

    return (
      <span
        className="px-2 py-0.5 rounded text-xs font-medium"
        style={{ backgroundColor: badge.bg, color: badge.text }}
      >
        {badge.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[500]} 100%)`,
            }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">AI-Rekommendationer</h3>
            <p className="text-sm text-gray-600">Personaliserade studieförslag just nu</p>
          </div>
        </div>
        <button
          onClick={generateRecs}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          title="Uppdatera rekommendationer"
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Time of Day Context */}
      <div className="mb-4 p-3 bg-white/60 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" style={{ color: colors.primary[600] }} />
          <span className="text-gray-700">
            {getTimeOfDay() === 'morning' && '☀️ Morgon - Bäst för nytt material'}
            {getTimeOfDay() === 'afternoon' && '🌤️ Eftermiddag - Perfekt för praktik'}
            {getTimeOfDay() === 'evening' && '🌙 Kväll - Repetera för sömnkonsolidering'}
            {getTimeOfDay() === 'night' && '🌃 Natt - Lätt repetition rekommenderas'}
          </span>
        </div>
      </div>

      {/* Recommendations List */}
      {recommendations.length === 0 ? (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">Du är på rätt spår! Fortsätt så här.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={rec.id}
              className="bg-white rounded-lg border-2 p-4 hover:shadow-md transition-all cursor-pointer group"
              style={{
                borderColor:
                  index === 0
                    ? getPriorityColor(rec.priority)
                    : colors.gray[200],
              }}
              onClick={() => onSelectRecommendation?.(rec)}
            >
              {/* Priority Badge */}
              {index === 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: `${getPriorityColor(rec.priority)}20`,
                      color: getPriorityColor(rec.priority),
                    }}
                  >
                    {rec.priority === 'high' ? '🔥 TOP PRIORITET' : rec.priority === 'medium' ? '⚡ Rekommenderas' : '💡 Förslag'}
                  </span>
                </div>
              )}

              {/* Header Row */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <div style={{ color: getActionColor(rec.actionType) }}>
                    {getTypeIcon(rec.type)}
                  </div>
                  <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {rec.title}
                  </h4>
                </div>
                <ChevronRight
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0"
                />
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{rec.description}</p>

              {/* Reasoning */}
              <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-100">
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">Varför: </span>
                  {rec.reasoning}
                </p>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{rec.estimatedTime} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-3 h-3" style={{ color: colors.warning[500] }} />
                  <span className="font-semibold">+{rec.xpReward} XP</span>
                </div>
                {getDifficultyBadge(rec.difficultyLevel)}
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium capitalize"
                  style={{
                    backgroundColor: `${getActionColor(rec.actionType)}20`,
                    color: getActionColor(rec.actionType),
                  }}
                >
                  {rec.actionType === 'new-content' && 'Nytt innehåll'}
                  {rec.actionType === 'review' && 'Repetition'}
                  {rec.actionType === 'practice' && 'Praktik'}
                  {rec.actionType === 'rest' && 'Vila'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Tip */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <p className="text-xs text-gray-600 text-center">
          💡 Rekommendationerna uppdateras baserat på din prestation och tid på dagen
        </p>
      </div>
    </div>
  );
}
