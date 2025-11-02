'use client';

import { useState, useEffect } from 'react';
import { MCQQuestion, ALL_QUESTIONS } from '@/data/questions';
import { Domain } from '@/types/onboarding';
import { EducationLevel } from '@/types/education';
import TutorMode from '../learning/TutorMode';
import { X, CheckCircle, Award, TrendingUp } from 'lucide-react';

interface ActivitySessionProps {
  activityId: string;
  activityType: 'new' | 'interleave' | 'srs';
  domain: Domain;
  userLevel: EducationLevel;
  onComplete: (results: {
    questionsCompleted: number;
    correctAnswers: number;
    totalXP: number;
    timeSpent: number;
  }) => void;
  onClose: () => void;
}

export default function ActivitySession({
  activityId,
  activityType,
  domain,
  userLevel,
  onComplete,
  onClose
}: ActivitySessionProps) {
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<{
    questionId: string;
    correct: boolean;
    xp: number;
    hintsUsed: number;
  }[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [startTime] = useState(Date.now());

  // Load questions based on activity type
  useEffect(() => {
    loadQuestions();
  }, [activityType, domain, userLevel]);

  const loadQuestions = () => {
    let selectedQuestions: MCQQuestion[] = [];

    switch (activityType) {
      case 'new':
        // Get 3 new questions from the user's primary domain at their level
        selectedQuestions = ALL_QUESTIONS
          .filter(q => q.domain === domain && q.level === userLevel)
          .slice(0, 3);
        break;

      case 'interleave':
        // Get 2 questions from different domains (review/interleaving)
        const otherDomains = ALL_QUESTIONS.filter(q =>
          q.domain !== domain &&
          (q.level === userLevel || q.level === 'student') // Include easier questions
        );
        selectedQuestions = shuffleArray(otherDomains).slice(0, 2);
        break;

      case 'srs':
        // Get questions that simulate SRS review (random selection for now)
        // In a full implementation, this would pull from actual SRS cards
        selectedQuestions = shuffleArray(
          ALL_QUESTIONS.filter(q => q.level === userLevel)
        ).slice(0, 2);
        break;
    }

    setQuestions(selectedQuestions);
  };

  const handleQuestionComplete = (params: {
    selectedAnswer: string;
    correct: boolean;
    hintsUsed: number;
    timeSpent: number;
    xpEarned: number;
  }) => {
    // Record result
    setResults(prev => [...prev, {
      questionId: questions[currentQuestionIndex].id,
      correct: params.correct,
      xp: params.xpEarned,
      hintsUsed: params.hintsUsed
    }]);

    // Move to next question or show summary
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleCompleteSummary = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const totalXP = results.reduce((sum, r) => sum + r.xp, 0);
    const correctAnswers = results.filter(r => r.correct).length;

    onComplete({
      questionsCompleted: results.length,
      correctAnswers,
      totalXP,
      timeSpent
    });
  };

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-shimmer" style={{ backgroundSize: '200% 100%', background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)' }}></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-shimmer" style={{ backgroundSize: '200% 100%', background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)' }}></div>
          </div>
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 rounded-lg animate-shimmer" style={{ backgroundSize: '200% 100%', background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)' }}></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-gray-200 rounded-lg animate-shimmer" style={{ backgroundSize: '200% 100%', background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)' }}></div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Avbryt
          </button>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const totalXP = results.reduce((sum, r) => sum + r.xp, 0);
    const correctAnswers = results.filter(r => r.correct).length;
    const accuracy = Math.round((correctAnswers / results.length) * 100);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
          {/* Success Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bra jobbat!</h2>
            <p className="text-gray-600">Du har slutfört aktiviteten</p>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <Award className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-600 font-medium">XP intjänat</p>
              <p className="text-2xl font-bold text-blue-900">{totalXP}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-600 font-medium">Rätt svar</p>
              <p className="text-2xl font-bold text-green-900">{correctAnswers}/{results.length}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-600 font-medium">Träffsäkerhet</p>
              <p className="text-2xl font-bold text-purple-900">{accuracy}%</p>
            </div>
          </div>

          {/* Question Results */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Resultat per fråga</h3>
            <div className="space-y-2">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.correct ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <X className="w-5 h-5 text-red-600" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      Fråga {idx + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-600">
                      {result.hintsUsed} hints
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      +{result.xp} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleCompleteSummary}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
          >
            Fortsätt till dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {activityType === 'new' && 'Nytt innehåll'}
              {activityType === 'interleave' && 'Interleaving'}
              {activityType === 'srs' && 'Repetition (SRS)'}
            </h2>
            <p className="text-sm text-gray-600">
              Fråga {currentQuestionIndex + 1} av {questions.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* TutorMode for Question */}
        <TutorMode
          question={currentQuestion}
          onAnswer={handleQuestionComplete}
          baseXP={20}
          userLevel={userLevel}
          enableAI={true}
        />
      </div>
    </div>
  );
}

// Helper function
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
