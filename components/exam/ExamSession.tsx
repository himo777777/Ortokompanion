'use client';

import { useState } from 'react';
import { ExamQuestion } from '@/types/exam';
import { CheckCircle, XCircle, Clock, Award, ArrowRight, ArrowLeft, X } from 'lucide-react';

interface ExamSessionProps {
  questions: ExamQuestion[];
  examTitle: string;
  passingScore: number;
  onComplete: (results: {
    score: number;
    correct: number;
    total: number;
    timeSpent: number;
  }) => void;
  onExit: () => void;
}

export default function ExamSession({
  questions,
  examTitle,
  passingScore,
  onComplete,
  onExit
}: ExamSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: answer
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinish = () => {
    const correct = questions.filter((q, idx) => selectedAnswers[idx] === q.correctAnswer).length;
    const total = questions.length;
    const score = Math.round((correct / total) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 1000); // seconds

    setShowResults(true);
    onComplete({ score, correct, total, timeSpent });
  };

  const calculateResults = () => {
    const correct = questions.filter((q, idx) => selectedAnswers[idx] === q.correctAnswer).length;
    const total = questions.length;
    const score = Math.round((correct / total) * 100);
    return { correct, total, score };
  };

  if (showResults) {
    const results = calculateResults();
    const passed = results.score >= passingScore;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
              passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {passed ? (
                <CheckCircle className="w-16 h-16 text-green-600" />
              ) : (
                <XCircle className="w-16 h-16 text-red-600" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {passed ? 'Godkänd!' : 'Inte godkänd'}
            </h2>
            <p className="text-lg text-gray-600">
              {examTitle}
            </p>
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-600 font-medium mb-1">Resultat</p>
              <p className="text-3xl font-bold text-blue-900">{results.score}%</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-green-600 font-medium mb-1">Rätt svar</p>
              <p className="text-3xl font-bold text-green-900">{results.correct}/{results.total}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <p className="text-sm text-purple-600 font-medium mb-1">Godkänt</p>
              <p className="text-3xl font-bold text-purple-900">{passingScore}%</p>
            </div>
          </div>

          {/* Question Review */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Genomgång av frågor</h3>
            <div className="space-y-4">
              {questions.map((question, idx) => {
                const userAnswer = selectedAnswers[idx];
                const isCorrect = userAnswer === question.correctAnswer;
                return (
                  <div
                    key={question.id}
                    className={`border-2 rounded-lg p-4 ${
                      isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">
                          {idx + 1}. {question.question}
                        </p>
                        <div className="text-sm space-y-1">
                          {userAnswer && (
                            <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                              <strong>Ditt svar:</strong> {userAnswer}
                            </p>
                          )}
                          {!isCorrect && (
                            <p className="text-green-700">
                              <strong>Rätt svar:</strong> {question.correctAnswer}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onExit}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Tillbaka till översikt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{examTitle}</h2>
            <p className="text-sm text-gray-600">
              Fråga {currentQuestionIndex + 1} av {questions.length}
            </p>
          </div>
          <button
            onClick={onExit}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Avsluta prov"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        {/* Question Text */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {currentQuestion.domain}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {currentQuestion.difficulty}
            </span>
          </div>
          <p className="text-xl font-medium text-gray-900">
            {currentQuestion.question}
          </p>
        </div>

        {/* Answer Options */}
        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectAnswer(option)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedAnswer === option
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  selectedAnswer === option
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className={`${selectedAnswer === option ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                  {option}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            Föregående
          </button>

          <div className="text-sm text-gray-600">
            {Object.keys(selectedAnswers).length}/{questions.length} besvarade
          </div>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Nästa
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={Object.keys(selectedAnswers).length < questions.length}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Award className="w-5 h-5" />
              Slutför prov
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
