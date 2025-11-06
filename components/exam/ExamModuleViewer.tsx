'use client';

import { useState } from 'react';
import { GraduationCap, BookOpen, Target, TrendingUp, Award, Clock, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { ExamType, ExamQuestion } from '@/types/exam';
import { getQuestionsForExam, examInfo, getExamStats } from '@/data/exam-questions';

interface ExamModuleViewerProps {
  examType: ExamType;
  onStartExam?: (questions: ExamQuestion[]) => void;
}

export default function ExamModuleViewer({ examType, onStartExam }: ExamModuleViewerProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  const info = examInfo[examType];
  const stats = getExamStats(examType);
  const allQuestions = getQuestionsForExam(examType);

  // Filter questions
  const filteredQuestions = allQuestions.filter(q => {
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    if (selectedDomain !== 'all' && q.domain !== selectedDomain) return false;
    return true;
  });

  // Get unique domains
  const uniqueDomains = Array.from(new Set(allQuestions.map(q => q.domain)));

  const getDomainName = (domain: string) => {
    const names: Record<string, string> = {
      'trauma': 'Trauma',
      'axel-armbåge': 'Axel & Armbåge',
      'hand-handled': 'Hand & Handled',
      'höft': 'Höft',
      'knä': 'Knä',
      'fot-fotled': 'Fot & Fotled',
      'rygg': 'Rygg',
      'sport': 'Sport',
      'tumör': 'Tumör',
    };
    return names[domain] || domain;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'standard': return 'green';
      case 'challenging': return 'orange';
      case 'expert': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">{info.title}</h1>
        </div>
        <p className="text-gray-600 mb-4">{info.description}</p>

        {/* Exam Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Totalt frågor</span>
            </div>
            <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Godkänd nivå</span>
            </div>
            <p className="text-3xl font-bold text-green-900">{info.passingScore}%</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Rekommenderad tid</span>
            </div>
            <p className="text-3xl font-bold text-purple-900">{info.recommendedTime} min</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          Statistik
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* By Difficulty */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Fördelning svårighetsgrad</h3>
            <div className="space-y-2">
              {Object.entries(stats.byDifficulty).map(([difficulty, count]) => (
                <div key={difficulty} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        getDifficultyColor(difficulty) === 'green'
                          ? 'bg-green-500'
                          : getDifficultyColor(difficulty) === 'orange'
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {difficulty === 'standard' ? 'Standard' : difficulty === 'challenging' ? 'Utmanande' : 'Expert'}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Source */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Källa</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Gamla prov</span>
                <span className="text-sm font-semibold text-gray-900">{stats.bySourceType.previousExam}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Förutsedda frågor</span>
                <span className="text-sm font-semibold text-gray-900">{stats.bySourceType.predicted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Riktlinjebaserade</span>
                <span className="text-sm font-semibold text-gray-900">{stats.bySourceType.guidelineBased}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Svårighetsgrad
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alla</option>
              <option value="standard">Standard</option>
              <option value="challenging">Utmanande</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domän
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alla</option>
              {uniqueDomains.map(domain => (
                <option key={domain} value={domain}>{getDomainName(domain)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Visar {filteredQuestions.length} av {stats.total} frågor
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question, index) => (
          <div
            key={question.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all"
          >
            {/* Question Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                  {index + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        getDifficultyColor(question.difficulty) === 'green'
                          ? 'bg-green-100 text-green-700'
                          : getDifficultyColor(question.difficulty) === 'orange'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {question.difficulty === 'standard' ? 'Standard' : question.difficulty === 'challenging' ? 'Utmanande' : 'Expert'}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {getDomainName(question.domain)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {Math.round(question.estimatedTime / 60)} min
                    </span>
                  </div>
                  {question.sources.some(s => s.type === 'previous-exam') && (
                    <span className="flex items-center gap-1 text-xs text-purple-600">
                      <Award className="w-3 h-3" />
                      Från gammalt prov
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Question Text */}
            <p className="text-gray-900 font-medium mb-4">{question.question}</p>

            {/* All Answer Options */}
            <div className="space-y-2 mb-4">
              {question.options.map((option, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm text-gray-700 p-2 bg-gray-50 rounded"
                >
                  <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span>
                  <span>{option}</span>
                </div>
              ))}
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-2 mb-4">
              {question.keywords.slice(0, 5).map((keyword, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                  {keyword}
                </span>
              ))}
            </div>

            {/* References - All Visible */}
            {question.references.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-semibold text-gray-700 mb-1">Källor & Referenser:</p>
                <div className="text-xs text-gray-600 space-y-1">
                  {question.references.map((ref, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{ref}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Start Exam Button */}
      {onStartExam && (
        <div className="mt-8 text-center">
          <button
            onClick={() => onStartExam(filteredQuestions)}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold text-lg transition-all flex items-center gap-3 mx-auto"
          >
            <Sparkles className="w-6 h-6" />
            Starta provexamen med {filteredQuestions.length} frågor
          </button>
        </div>
      )}
    </div>
  );
}
