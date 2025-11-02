'use client';

import React, { useState } from 'react';
import { colors } from '@/lib/design-tokens';
import { STEP_BY_STEP_CASES } from '@/data/step-by-step-cases';
import StepByStepTutor, { StepByStepCase } from './StepByStepTutor';
import {
  Brain,
  ChevronRight,
  CheckCircle,
  Filter,
  Search,
  Clock,
  Target,
  Award,
} from 'lucide-react';

interface StepByStepBrowserProps {
  userLevel?: string;
  onCaseCompleted?: (results: {
    caseId: string;
    stepsCompleted: number;
    hintsUsed: number;
    timeSpent: number;
    score: number;
  }) => void;
}

export default function StepByStepBrowser({ userLevel, onCaseCompleted }: StepByStepBrowserProps) {
  const [selectedCase, setSelectedCase] = useState<StepByStepCase | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterDomain, setFilterDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [completedCases, setCompletedCases] = useState<Set<string>>(new Set());

  // Get unique domains
  const domains = Array.from(new Set(STEP_BY_STEP_CASES.map((c) => c.domain)));

  // Filter cases
  const filteredCases = STEP_BY_STEP_CASES.filter((caseData) => {
    if (filterDifficulty !== 'all' && caseData.difficulty !== filterDifficulty) return false;
    if (filterDomain !== 'all' && caseData.domain !== filterDomain) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        caseData.title.toLowerCase().includes(query) ||
        caseData.domain.toLowerCase().includes(query) ||
        caseData.initialPresentation.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleCaseComplete = (results: any) => {
    setCompletedCases(new Set([...completedCases, results.caseId]));
    onCaseCompleted?.(results);
    setSelectedCase(null);
  };

  if (selectedCase) {
    return (
      <StepByStepTutor
        caseData={selectedCase}
        userMasteryLevel={50} // TODO: Calculate from user progress
        onComplete={handleCaseComplete}
        onClose={() => setSelectedCase(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: colors.primary[100] }}
            >
              <Brain className="w-8 h-8" style={{ color: colors.primary[600] }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Steg-för-Steg Handledning</h1>
              <p className="text-gray-600">
                Guidat lärande med klinisk resonemang från anamnes till behandling
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5" style={{ color: colors.primary[500] }} />
                <div>
                  <p className="text-sm text-gray-600">Tillgängliga fall</p>
                  <p className="text-2xl font-bold text-gray-800">{STEP_BY_STEP_CASES.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5" style={{ color: colors.success[500] }} />
                <div>
                  <p className="text-sm text-gray-600">Slutförda</p>
                  <p className="text-2xl font-bold text-gray-800">{completedCases.size}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5" style={{ color: colors.warning[500] }} />
                <div>
                  <p className="text-sm text-gray-600">Genomsnittlig poäng</p>
                  <p className="text-2xl font-bold text-gray-800">--</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              />
              <input
                type="text"
                placeholder="Sök fall..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              />
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all appearance-none"
              >
                <option value="all">Alla nivåer</option>
                <option value="beginner">Nybörjare</option>
                <option value="intermediate">Mellannivå</option>
                <option value="advanced">Avancerad</option>
              </select>
            </div>

            {/* Domain Filter */}
            <div>
              <select
                value={filterDomain}
                onChange={(e) => setFilterDomain(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all appearance-none"
              >
                <option value="all">Alla domäner</option>
                {domains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(filterDifficulty !== 'all' || filterDomain !== 'all' || searchQuery) && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Aktiva filter:</span>
              {filterDifficulty !== 'all' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {filterDifficulty === 'beginner'
                    ? 'Nybörjare'
                    : filterDifficulty === 'intermediate'
                    ? 'Mellannivå'
                    : 'Avancerad'}
                  <button
                    onClick={() => setFilterDifficulty('all')}
                    className="ml-2 text-blue-800 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterDomain !== 'all' && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {filterDomain}
                  <button
                    onClick={() => setFilterDomain('all')}
                    className="ml-2 text-purple-800 hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  &quot;{searchQuery}&quot;
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-green-800 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Cases Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredCases.length === 0 ? (
            <div className="col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Inga fall matchade dina filter</p>
              <button
                onClick={() => {
                  setFilterDifficulty('all');
                  setFilterDomain('all');
                  setSearchQuery('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Rensa filter
              </button>
            </div>
          ) : (
            filteredCases.map((caseData) => {
              const isCompleted = completedCases.has(caseData.id);
              const estimatedTime = caseData.steps.length * 3; // ~3 min per step

              return (
                <div
                  key={caseData.id}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow relative overflow-hidden"
                >
                  {isCompleted && (
                    <div
                      className="absolute top-4 right-4 p-2 rounded-full"
                      style={{ backgroundColor: colors.success[100] }}
                    >
                      <CheckCircle className="w-5 h-5" style={{ color: colors.success[600] }} />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: colors.primary[100],
                        color: colors.primary[700],
                      }}
                    >
                      {caseData.domain}
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor:
                          caseData.difficulty === 'beginner'
                            ? colors.success[100]
                            : caseData.difficulty === 'intermediate'
                            ? colors.warning[100]
                            : colors.error[100],
                        color:
                          caseData.difficulty === 'beginner'
                            ? colors.success[700]
                            : caseData.difficulty === 'intermediate'
                            ? colors.warning[700]
                            : colors.error[700],
                      }}
                    >
                      {caseData.difficulty === 'beginner'
                        ? 'Nybörjare'
                        : caseData.difficulty === 'intermediate'
                        ? 'Mellannivå'
                        : 'Avancerad'}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{caseData.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{caseData.initialPresentation}</p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Brain className="w-4 h-4" />
                      <span>{caseData.steps.length} steg</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>~{estimatedTime} min</span>
                    </div>
                  </div>

                  {/* Learning Objectives Preview */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Du kommer att lära dig:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {caseData.learningObjectives.slice(0, 2).map((objective, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span style={{ color: colors.primary[500] }}>•</span>
                          <span className="line-clamp-1">{objective}</span>
                        </li>
                      ))}
                      {caseData.learningObjectives.length > 2 && (
                        <li className="text-gray-400">
                          +{caseData.learningObjectives.length - 2} mer...
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Start Button */}
                  <button
                    onClick={() => setSelectedCase(caseData)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    {isCompleted ? 'Gör om' : 'Starta fall'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
