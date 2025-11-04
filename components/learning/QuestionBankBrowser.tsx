'use client';

import { useState, useMemo } from 'react';
import { BookOpen, Filter, Search, Target, Award, Clock, CheckCircle, Brain } from 'lucide-react';
import { ALL_QUESTIONS, MCQQuestion } from '@/data/questions';
import { Domain, DOMAIN_LABELS } from '@/types/onboarding';
import { EducationLevel } from '@/types/education';
import TutorMode from './TutorMode';

interface QuestionBankBrowserProps {
  userLevel?: EducationLevel;
  onQuestionCompleted?: (questionId: string, correct: boolean, hintsUsed: number) => void;
}

export default function QuestionBankBrowser({
  userLevel = 'student',
  onQuestionCompleted
}: QuestionBankBrowserProps) {
  const [selectedDomain, setSelectedDomain] = useState<Domain | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | 'all'>('all');
  const [selectedBand, setSelectedBand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuestion, setActiveQuestion] = useState<MCQQuestion | null>(null);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return ALL_QUESTIONS.filter(q => {
      if (selectedDomain !== 'all' && q.domain !== selectedDomain) return false;
      if (selectedLevel !== 'all' && q.level !== selectedLevel) return false;
      if (selectedBand !== 'all' && q.band !== selectedBand) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          q.question.toLowerCase().includes(query) ||
          q.tags.some(tag => tag.toLowerCase().includes(query)) ||
          q.explanation.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [selectedDomain, selectedLevel, selectedBand, searchQuery]);

  // Get unique domains
  const domains: Domain[] = ['trauma', 'höft', 'knä', 'fot-fotled', 'hand-handled', 'axel-armbåge', 'rygg', 'sport', 'tumör'];
  const levels: EducationLevel[] = ['student', 'at', 'st1', 'st2', 'st3', 'st4', 'st5', 'specialist'];
  const bands = ['A', 'B', 'C', 'D', 'E'];

  // Statistics
  const stats = useMemo(() => {
    const byDomain: Record<string, number> = {};
    const byLevel: Record<string, number> = {};
    const byBand: Record<string, number> = {};

    ALL_QUESTIONS.forEach(q => {
      byDomain[q.domain] = (byDomain[q.domain] || 0) + 1;
      byLevel[q.level] = (byLevel[q.level] || 0) + 1;
      byBand[q.band] = (byBand[q.band] || 0) + 1;
    });

    return { byDomain, byLevel, byBand };
  }, []);

  const getBandColor = (band: string) => {
    switch (band) {
      case 'A': return 'bg-green-100 text-green-700 border-green-300';
      case 'B': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'C': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'D': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'E': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getLevelLabel = (level: EducationLevel) => {
    const labels: Record<EducationLevel, string> = {
      'student': 'Student',
      'at': 'AT-läkare',
      'st1': 'ST1',
      'st2': 'ST2',
      'st3': 'ST3',
      'st4': 'ST4',
      'st5': 'ST5',
      'specialist': 'Specialist'
    };
    return labels[level];
  };

  if (activeQuestion) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setActiveQuestion(null)}
          className="mb-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ← Tillbaka till frågebank
        </button>
        <TutorMode
          question={activeQuestion}
          onAnswer={(result) => {
            if (onQuestionCompleted) {
              onQuestionCompleted(activeQuestion.id, result.correct, result.hintsUsed);
            }
            // Auto-return after 2 seconds
            setTimeout(() => setActiveQuestion(null), 2000);
          }}
          baseXP={20}
          userLevel={userLevel}
          enableAI={true}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-600" />
          Frågebank - MCQ Övningar
        </h1>
        <p className="text-gray-600">
          Totalt <strong>{ALL_QUESTIONS.length}</strong> frågor sorterade efter domän, nivå och svårighetsgrad
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Totalt frågor</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">{ALL_QUESTIONS.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Domäner</span>
          </div>
          <p className="text-3xl font-bold text-green-900">{Object.keys(stats.byDomain).length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Nivåer</span>
          </div>
          <p className="text-3xl font-bold text-purple-900">{Object.keys(stats.byLevel).length}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Filter className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Filtrerade</span>
          </div>
          <p className="text-3xl font-bold text-orange-900">{filteredQuestions.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          Filtrera frågor
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Domain Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Domän</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value as Domain | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alla domäner</option>
              {domains.map(domain => (
                <option key={domain} value={domain}>
                  {DOMAIN_LABELS[domain]} ({stats.byDomain[domain] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nivå</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as EducationLevel | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alla nivåer</option>
              {levels.map(level => (
                <option key={level} value={level}>
                  {getLevelLabel(level)} ({stats.byLevel[level] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Band Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Band (Svårighetsgrad)</label>
            <select
              value={selectedBand}
              onChange={(e) => setSelectedBand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alla band</option>
              {bands.map(band => (
                <option key={band} value={band}>
                  Band {band} ({stats.byBand[band] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sök</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sök i frågor..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Visar <strong>{filteredQuestions.length}</strong> av <strong>{ALL_QUESTIONS.length}</strong> frågor
          </p>
          <button
            onClick={() => {
              setSelectedDomain('all');
              setSelectedLevel('all');
              setSelectedBand('all');
              setSearchQuery('');
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Återställ filter
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question, index) => (
          <div
            key={question.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => setActiveQuestion(question)}
          >
            {/* Question Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700">
                  {index + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getBandColor(question.band)}`}>
                      Band {question.band}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {DOMAIN_LABELS[question.domain]}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {getLevelLabel(question.level)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">ID: {question.id}</p>
                </div>
              </div>
            </div>

            {/* Question Text */}
            <p className="text-gray-900 font-medium mb-4">{question.question}</p>

            {/* Options - All Visible */}
            <div className="grid grid-cols-1 gap-2 mb-4">
              {question.options.map((option, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-700 p-2 bg-gray-50 rounded"
                >
                  <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span>
                  <span>{option}</span>
                </div>
              ))}
            </div>

            {/* Tags & Metadata */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {question.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
                {question.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    +{question.tags.length - 3} fler
                  </span>
                )}
              </div>
              <button
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveQuestion(question);
                }}
              >
                Öva på denna →
              </button>
            </div>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Inga frågor hittades</h3>
            <p className="text-gray-600 mb-4">Prova att justera dina filter eller sökord</p>
            <button
              onClick={() => {
                setSelectedDomain('all');
                setSelectedLevel('all');
                setSelectedBand('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Återställ filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
