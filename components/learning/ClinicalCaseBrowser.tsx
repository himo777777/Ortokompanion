'use client';

import React, { useState, useMemo } from 'react';
import {
  UNIFIED_CLINICAL_CASES,
  getCasesByMode,
  getCasesByDifficulty,
  getCasesByDomain,
  getCasesByLevel,
  getCaseStats,
} from '@/data/unified-clinical-cases';
import {
  UnifiedClinicalCase,
  ClinicalCaseResults,
} from '@/types/clinical-cases';
import { EducationLevel } from '@/types/education';
import { Domain, DOMAIN_LABELS } from '@/types/onboarding';
import ClinicalCaseSession from './ClinicalCaseSession';
import {
  FileText,
  User,
  Clock,
  Brain,
  Filter,
  Search,
  GraduationCap,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';

interface ClinicalCaseBrowserProps {
  userLevel: EducationLevel;
  onCaseComplete?: (results: ClinicalCaseResults) => void;
}

export default function ClinicalCaseBrowser({
  userLevel,
  onCaseComplete,
}: ClinicalCaseBrowserProps) {
  const [selectedCase, setSelectedCase] = useState<UnifiedClinicalCase | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<'all' | 'guided' | 'scenario'>('all');
  const [selectedDomain, setSelectedDomain] = useState<Domain | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'all' | 'beginner' | 'intermediate' | 'advanced'
  >('all');
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | 'all'>('all');

  const stats = getCaseStats();

  // Filter cases based on all criteria
  const filteredCases = useMemo(() => {
    let cases = UNIFIED_CLINICAL_CASES;

    // Apply mode filter
    if (selectedMode !== 'all') {
      cases = cases.filter((c) => c.mode === selectedMode);
    }

    // Apply domain filter
    if (selectedDomain !== 'all') {
      cases = cases.filter((c) => c.domain === selectedDomain);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      cases = cases.filter((c) => c.difficulty === selectedDifficulty);
    }

    // Apply level filter
    if (selectedLevel !== 'all') {
      cases = cases.filter((c) => c.level === selectedLevel);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      cases = cases.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.initialPresentation.toLowerCase().includes(query) ||
          c.learningObjectives.some((obj) => obj.toLowerCase().includes(query))
      );
    }

    return cases;
  }, [selectedMode, selectedDomain, selectedDifficulty, selectedLevel, searchQuery]);

  const handleCaseSelect = (caseData: UnifiedClinicalCase) => {
    setSelectedCase(caseData);
  };

  const handleCaseComplete = (results: ClinicalCaseResults) => {
    onCaseComplete?.(results);
    setSelectedCase(null);
  };

  const handleClose = () => {
    setSelectedCase(null);
  };

  // If a case is selected, show the session component
  if (selectedCase) {
    return (
      <ClinicalCaseSession
        caseData={selectedCase}
        userMasteryLevel={50} // Could be dynamic based on user progression
        onComplete={handleCaseComplete}
        onClose={handleClose}
      />
    );
  }

  // Otherwise, show the browser
  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Stethoscope className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Kliniska Fall</h1>
        </div>
        <p className="text-gray-600">
          Guidat lärande med steg-för-steg genomgångar och kliniska fallstudier
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Totalt antal fall</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
          <p className="text-sm text-purple-700 mb-1">Guidat lärande</p>
          <p className="text-2xl font-bold text-purple-800">{stats.byMode.guided}</p>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <p className="text-sm text-blue-700 mb-1">Fallstudier</p>
          <p className="text-2xl font-bold text-blue-800">{stats.byMode.scenario}</p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-sm text-green-700 mb-1">Filtrerade</p>
          <p className="text-2xl font-bold text-green-800">{filteredCases.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Filtrera fall</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Mode Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lärosätt</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value as 'all' | 'guided' | 'scenario')}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alla ({stats.total})</option>
              <option value="guided">Guidat ({stats.byMode.guided})</option>
              <option value="scenario">Scenario ({stats.byMode.scenario})</option>
            </select>
          </div>

          {/* Domain Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Domän</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value as Domain | 'all')}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alla domäner</option>
              {Object.entries(DOMAIN_LABELS).map(([domain, label]) => (
                <option key={domain} value={domain}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Svårighetsgrad</label>
            <select
              value={selectedDifficulty}
              onChange={(e) =>
                setSelectedDifficulty(
                  e.target.value as 'all' | 'beginner' | 'intermediate' | 'advanced'
                )
              }
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alla nivåer</option>
              <option value="beginner">Nybörjare ({stats.byDifficulty.beginner})</option>
              <option value="intermediate">Mellannivå ({stats.byDifficulty.intermediate})</option>
              <option value="advanced">Avancerad ({stats.byDifficulty.advanced})</option>
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Utbildningsnivå</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as EducationLevel | 'all')}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alla nivåer</option>
              <option value="student">Student</option>
              <option value="at">AT</option>
              <option value="st1">ST1</option>
              <option value="st2">ST2</option>
              <option value="st3">ST3</option>
              <option value="st4">ST4</option>
              <option value="st5">ST5</option>
              <option value="specialist-ortopedi">Specialist</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sök efter fall, ämne, eller lärandemål..."
            className="w-full pl-10 pr-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCases.length === 0 ? (
          <div className="col-span-full p-12 bg-gray-100 rounded-lg text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">Inga fall matchade dina filter</p>
            <p className="text-gray-500 text-sm">Prova att justera filtren ovan</p>
          </div>
        ) : (
          filteredCases.map((clinicalCase) => (
            <button
              key={clinicalCase.id}
              onClick={() => handleCaseSelect(clinicalCase)}
              className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all text-left shadow-sm hover:shadow-md group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg flex-shrink-0 ${
                    clinicalCase.mode === 'guided'
                      ? 'bg-purple-100'
                      : 'bg-blue-100'
                  }`}
                >
                  {clinicalCase.mode === 'guided' ? (
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                  ) : (
                    <FileText className="w-6 h-6 text-blue-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title and badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {clinicalCase.title}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {DOMAIN_LABELS[clinicalCase.domain as Domain] || clinicalCase.domain}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        clinicalCase.difficulty === 'beginner'
                          ? 'bg-green-100 text-green-700'
                          : clinicalCase.difficulty === 'intermediate'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {clinicalCase.difficulty === 'beginner'
                        ? 'Nybörjare'
                        : clinicalCase.difficulty === 'intermediate'
                        ? 'Mellannivå'
                        : 'Avancerad'}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium uppercase">
                      {clinicalCase.level}
                    </span>
                  </div>

                  {/* Patient info */}
                  {clinicalCase.patient && (
                    <div className="flex gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {clinicalCase.patient.gender}, {clinicalCase.patient.age} år
                      </span>
                      <span>•</span>
                      <span className="truncate">{clinicalCase.patient.complaint}</span>
                    </div>
                  )}

                  {/* Presentation */}
                  <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                    {clinicalCase.initialPresentation}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-4 text-sm text-gray-500">
                    {clinicalCase.mode === 'guided' && clinicalCase.steps && (
                      <span className="flex items-center gap-1">
                        <Brain className="w-4 h-4" />
                        {clinicalCase.steps.length} steg
                      </span>
                    )}
                    {clinicalCase.mode === 'scenario' && clinicalCase.questions && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {clinicalCase.questions.length} frågor
                      </span>
                    )}
                    {clinicalCase.learningObjectives && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {clinicalCase.learningObjectives.length} lärandemål
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
