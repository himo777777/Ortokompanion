'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { Target, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Brain, Sparkles, Loader2, BookOpen, Flame } from 'lucide-react';
import { logger } from '@/lib/logger';
import { analyzeKnowledgeGaps } from '@/lib/ai-service';
import { logger } from '@/lib/logger';
import { Domain } from '@/types/onboarding';
import { logger } from '@/lib/logger';
import { EducationLevel } from '@/types/education';
import { logger } from '@/lib/logger';

interface PerformanceRecord {
  domain: Domain;
  correct: boolean;
  timestamp: Date;
  difficulty: string;
  timeSpent: number;
}

interface KnowledgeGapDashboardProps {
  performanceHistory: PerformanceRecord[];
  userLevel: EducationLevel;
  targetGoals?: string[];
  enableAI?: boolean;
}

export default function KnowledgeGapDashboard({
  performanceHistory,
  userLevel,
  targetGoals = [],
  enableAI = true,
}: KnowledgeGapDashboardProps) {
  const [aiAnalysis, setAiAnalysis] = useState<{
    gaps: Array<{
      topic: string;
      severity: 'critical' | 'moderate' | 'minor';
      evidence: string[];
      recommendation: string;
    }>;
    strengths: string[];
    overallAssessment: string;
    priorityStudyTopics: string[];
  } | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const loadAIAnalysis = useCallback(async () => {
    setLoadingAnalysis(true);
    try {
      const result = await analyzeKnowledgeGaps({
        performanceHistory: performanceHistory.map((p, index) => ({
          questionId: `${p.domain}-${index}-${p.timestamp.getTime()}`,
          question: {
            id: `${p.domain}-${index}`,
            domain: p.domain,
            level: userLevel,
            band: (p.difficulty === 'basic' ? 'A' : p.difficulty === 'intermediate' ? 'C' : 'E') as 'A' | 'B' | 'C' | 'D' | 'E',
            question: `Question about ${p.domain}`,
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            correctAnswer: 'Option 1',
            explanation: '',
            competency: 'medicinsk-kunskap' as const,
            tags: [p.domain],
          },
          correct: p.correct,
          hintsUsed: 0, // TODO: Track hints used in PerformanceRecord
          timeSpent: p.timeSpent,
        })),
        userLevel,
        targetGoals,
      });
      setAiAnalysis(result);
    } catch (error) {
      logger.error('Failed to analyze knowledge gaps', error);
      setAiAnalysis(null);
    } finally {
      setLoadingAnalysis(false);
    }
  }, [performanceHistory, userLevel, targetGoals]);

  // Load AI analysis on mount
  useEffect(() => {
    if (enableAI && performanceHistory.length > 0 && !aiAnalysis) {
      loadAIAnalysis();
    }
  }, [enableAI, performanceHistory, aiAnalysis, loadAIAnalysis]);

  // Calculate basic stats
  const totalQuestions = performanceHistory.length;
  const correctAnswers = performanceHistory.filter(p => p.correct).length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  // Domain stats
  const domainStats: Record<string, { total: number; correct: number; accuracy: number }> = {};
  performanceHistory.forEach(p => {
    if (!domainStats[p.domain]) {
      domainStats[p.domain] = { total: 0, correct: 0, accuracy: 0 };
    }
    domainStats[p.domain].total++;
    if (p.correct) domainStats[p.domain].correct++;
  });

  Object.keys(domainStats).forEach(domain => {
    const stats = domainStats[domain];
    stats.accuracy = (stats.correct / stats.total) * 100;
  });

  // Sort domains by accuracy (weakest first)
  const sortedDomains = Object.entries(domainStats).sort((a, b) => a[1].accuracy - b[1].accuracy);

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'major':
        return 'orange';
      case 'minor':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  // Get domain name in Swedish
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Kunskapsgap & Analys
          </h1>
        </div>
        <p className="text-gray-600">
          AI-driven analys av dina styrkor och svagheter
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Totalt svar</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">{totalQuestions}</p>
          <p className="text-sm text-blue-700 mt-1">
            {correctAnswers} rätt ({Math.round(accuracy)}%)
          </p>
        </div>

        <div className={`bg-gradient-to-br rounded-lg border p-6 ${
          accuracy >= 80
            ? 'from-green-50 to-green-100 border-green-200'
            : accuracy >= 60
            ? 'from-yellow-50 to-yellow-100 border-yellow-200'
            : 'from-red-50 to-red-100 border-red-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6" />
            <span className="text-sm font-medium">Träffsäkerhet</span>
          </div>
          <p className="text-3xl font-bold">{Math.round(accuracy)}%</p>
          <div className="w-full bg-white rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${
                accuracy >= 80 ? 'bg-green-600' : accuracy >= 60 ? 'bg-yellow-600' : 'bg-red-600'
              }`}
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Studienivå</span>
          </div>
          <p className="text-3xl font-bold text-purple-900 capitalize">{userLevel}</p>
          <p className="text-sm text-purple-700 mt-1">Aktiv nivå</p>
        </div>
      </div>

      {/* AI Analysis Loading */}
      {loadingAnalysis && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-3 text-purple-700 justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
            <div>
              <p className="font-semibold text-lg">AI analyserar dina prestationsmönster...</p>
              <p className="text-sm">Detta kan ta några sekunder</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Results */}
      {aiAnalysis && (
        <div className="space-y-6 mb-8">
          {/* Overall Assessment */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="w-7 h-7 text-blue-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-blue-900 mb-2">AI-bedömning av din kunskap</h2>
                <p className="text-blue-800 leading-relaxed">{aiAnalysis.overallAssessment}</p>
              </div>
            </div>
          </div>

          {/* Strengths */}
          {aiAnalysis.strengths.length > 0 && (
            <div className="bg-white border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Dina styrkor</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiAnalysis.strengths.map((strength, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-800">{strength}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Knowledge Gaps */}
          {aiAnalysis.gaps.length > 0 && (
            <div className="bg-white border-2 border-orange-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingDown className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">Identifierade kunskapsgap</h2>
              </div>
              <div className="space-y-4">
                {aiAnalysis.gaps.map((gap, idx) => {
                  const severityColor = getSeverityColor(gap.severity);
                  return (
                    <div
                      key={idx}
                      className={`border-l-4 rounded-lg p-4 ${
                        severityColor === 'red'
                          ? 'bg-red-50 border-red-500'
                          : severityColor === 'orange'
                          ? 'bg-orange-50 border-orange-500'
                          : 'bg-yellow-50 border-yellow-500'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <AlertTriangle
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            severityColor === 'red'
                              ? 'text-red-600'
                              : severityColor === 'orange'
                              ? 'text-orange-600'
                              : 'text-yellow-600'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900">{gap.topic}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                severityColor === 'red'
                                  ? 'bg-red-200 text-red-900'
                                  : severityColor === 'orange'
                                  ? 'bg-orange-200 text-orange-900'
                                  : 'bg-yellow-200 text-yellow-900'
                              }`}
                            >
                              {gap.severity === 'critical' ? 'Kritiskt' : gap.severity === 'moderate' ? 'Stort gap' : 'Mindre gap'}
                            </span>
                          </div>

                          {/* Evidence */}
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Bevis:</p>
                            <ul className="space-y-1">
                              {gap.evidence.map((ev, evidx) => (
                                <li key={evidx} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-gray-400 mt-0.5">•</span>
                                  <span>{ev}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Recommendation */}
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Rekommendation:</p>
                            <p className="text-sm text-gray-800">{gap.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Priority Study Topics */}
          {aiAnalysis.priorityStudyTopics.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-purple-900">Prioritera dessa ämnen</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiAnalysis.priorityStudyTopics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-white border-2 border-purple-200 rounded-lg p-3"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-medium text-gray-900">{topic}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Domain Performance Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          Prestation per domän
        </h2>
        <div className="space-y-3">
          {sortedDomains.map(([domain, stats]) => (
            <div key={domain} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{getDomainName(domain)}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {stats.correct}/{stats.total}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      stats.accuracy >= 80
                        ? 'text-green-600'
                        : stats.accuracy >= 60
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {Math.round(stats.accuracy)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    stats.accuracy >= 80
                      ? 'bg-green-600'
                      : stats.accuracy >= 60
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${stats.accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      {enableAI && (
        <div className="mt-6 text-center">
          <button
            onClick={loadAIAnalysis}
            disabled={loadingAnalysis}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
          >
            {loadingAnalysis ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyserar...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Uppdatera AI-analys
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
