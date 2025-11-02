'use client';

import { useState, useEffect } from 'react';
import { MCQQuestion } from '@/data/questions';
import { EducationLevel } from '@/types/education';
import TutorMode from './TutorMode';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, Award, Clock, ChevronRight, Home, RotateCcw } from 'lucide-react';
import { fadeInUp } from '@/lib/animations';
import { CircularProgress, ProgressBar } from '@/components/ui/ProgressIndicators';
import { InteractiveButton } from '@/components/ui/InteractiveCard';

interface QuestionSessionProps {
  questions: MCQQuestion[];
  userLevel?: EducationLevel;
  onComplete?: (results: SessionResults) => void;
  onExit?: () => void;
  sessionType?: 'practice' | 'review' | 'exam';
}

export interface SessionResults {
  totalQuestions: number;
  correctAnswers: number;
  totalHintsUsed: number;
  totalXPEarned: number;
  totalTimeSpent: number;
  accuracy: number;
  questionResults: Array<{
    questionId: string;
    correct: boolean;
    hintsUsed: number;
    timeSpent: number;
    xpEarned: number;
  }>;
}

export default function QuestionSession({
  questions,
  userLevel = 'student',
  onComplete,
  onExit,
  sessionType = 'practice',
}: QuestionSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<SessionResults>({
    totalQuestions: questions.length,
    correctAnswers: 0,
    totalHintsUsed: 0,
    totalXPEarned: 0,
    totalTimeSpent: 0,
    accuracy: 0,
    questionResults: [],
  });
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStartTime] = useState(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswer = (result: {
    selectedAnswer: string;
    correct: boolean;
    hintsUsed: number;
    timeSpent: number;
    xpEarned: number;
  }) => {
    // Update session results
    const newResults = {
      ...sessionResults,
      correctAnswers: sessionResults.correctAnswers + (result.correct ? 1 : 0),
      totalHintsUsed: sessionResults.totalHintsUsed + result.hintsUsed,
      totalXPEarned: sessionResults.totalXPEarned + result.xpEarned,
      totalTimeSpent: sessionResults.totalTimeSpent + result.timeSpent,
      questionResults: [
        ...sessionResults.questionResults,
        {
          questionId: currentQuestion.id,
          correct: result.correct,
          hintsUsed: result.hintsUsed,
          timeSpent: result.timeSpent,
          xpEarned: result.xpEarned,
        },
      ],
    };

    newResults.accuracy = Math.round(
      (newResults.correctAnswers / (currentQuestionIndex + 1)) * 100
    );

    setSessionResults(newResults);

    // Move to next question or show summary
    if (isLastQuestion) {
      setShowSummary(true);
      if (onComplete) {
        onComplete(newResults);
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSessionResults({
      totalQuestions: questions.length,
      correctAnswers: 0,
      totalHintsUsed: 0,
      totalXPEarned: 0,
      totalTimeSpent: 0,
      accuracy: 0,
      questionResults: [],
    });
    setShowSummary(false);
  };

  if (showSummary) {
    return (
      <SessionSummary
        results={sessionResults}
        sessionType={sessionType}
        onRestart={handleRestart}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Session Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {sessionType === 'practice' ? 'Övningssession' : sessionType === 'review' ? 'Repetitionssession' : 'Examen'}
            </h2>
            <p className="text-sm text-gray-600">
              Fråga {currentQuestionIndex + 1} av {questions.length}
            </p>
          </div>
          <button
            onClick={onExit}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Avsluta
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <ProgressBar
            progress={progress}
            height={12}
            showPercentage={false}
            animated={true}
          />
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Framsteg: {currentQuestionIndex + 1}/{questions.length}</span>
            <span>Träffsäkerhet: {sessionResults.accuracy}%</span>
            <span>Total XP: {sessionResults.totalXPEarned}</span>
          </div>
        </div>
      </div>

      {/* Current Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <TutorMode
            question={currentQuestion}
            onAnswer={handleAnswer}
            baseXP={20}
            userLevel={userLevel}
            enableAI={true}
          />
        </motion.div>
      </AnimatePresence>

      {/* Session Stats Footer */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <Target className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{sessionResults.correctAnswers}</p>
          <p className="text-xs text-gray-600">Rätt svar</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{sessionResults.accuracy}%</p>
          <p className="text-xs text-gray-600">Träffsäkerhet</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <Award className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{sessionResults.totalXPEarned}</p>
          <p className="text-xs text-gray-600">XP tjänat</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <Clock className="w-5 h-5 text-orange-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">
            {Math.floor(sessionResults.totalTimeSpent / 60)}:{(sessionResults.totalTimeSpent % 60).toString().padStart(2, '0')}
          </p>
          <p className="text-xs text-gray-600">Tid spenderad</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Session Summary Component
 */
interface SessionSummaryProps {
  results: SessionResults;
  sessionType: 'practice' | 'review' | 'exam';
  onRestart?: () => void;
  onExit?: () => void;
}

function SessionSummary({ results, sessionType, onRestart, onExit }: SessionSummaryProps) {
  const totalMinutes = Math.floor(results.totalTimeSpent / 60);
  const totalSeconds = results.totalTimeSpent % 60;
  const avgTimePerQuestion = Math.round(results.totalTimeSpent / results.totalQuestions);

  const getPerformanceLevel = (accuracy: number): { label: string; color: string; message: string } => {
    if (accuracy >= 90) {
      return {
        label: 'Utmärkt!',
        color: 'text-green-600',
        message: 'Du behärskar detta område mycket bra!',
      };
    } else if (accuracy >= 75) {
      return {
        label: 'Bra jobbat!',
        color: 'text-blue-600',
        message: 'Du har god förståelse för detta område.',
      };
    } else if (accuracy >= 60) {
      return {
        label: 'Godkänt',
        color: 'text-yellow-600',
        message: 'Du är på rätt väg, fortsätt öva!',
      };
    } else {
      return {
        label: 'Behöver mer övning',
        color: 'text-orange-600',
        message: 'Repetera materialet och försök igen.',
      };
    }
  };

  const performance = getPerformanceLevel(results.accuracy);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Session avslutad!</h1>
        <p className="text-gray-600">Här är din sammanfattning</p>
      </div>

      {/* Main Stats Card */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-8 mb-6">
        <div className="text-center mb-6">
          <CircularProgress
            progress={results.accuracy}
            size={160}
            strokeWidth={12}
            showPercentage={true}
            label="Träffsäkerhet"
          />
        </div>

        <div className={`text-center mb-6`}>
          <h2 className={`text-2xl font-bold ${performance.color} mb-1`}>
            {performance.label}
          </h2>
          <p className="text-gray-700">{performance.message}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-gray-900">{results.correctAnswers}</p>
            <p className="text-sm text-gray-600 mt-1">Rätt svar</p>
            <p className="text-xs text-gray-500">av {results.totalQuestions}</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-purple-600">{results.totalXPEarned}</p>
            <p className="text-sm text-gray-600 mt-1">XP tjänat</p>
            <p className="text-xs text-gray-500">Total poäng</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-orange-600">{totalMinutes}:{totalSeconds.toString().padStart(2, '0')}</p>
            <p className="text-sm text-gray-600 mt-1">Total tid</p>
            <p className="text-xs text-gray-500">{avgTimePerQuestion}s/fråga</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-blue-600">{results.totalHintsUsed}</p>
            <p className="text-sm text-gray-600 mt-1">Ledtrådar</p>
            <p className="text-xs text-gray-500">Använda</p>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detaljerade resultat</h3>
        <div className="space-y-2">
          {results.questionResults.map((result, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg ${
                result.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  result.correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{result.questionId}</p>
                  <p className="text-xs text-gray-600">
                    {result.timeSpent}s • {result.hintsUsed} ledtråd(ar)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">+{result.xpEarned} XP</p>
                <p className={`text-xs ${result.correct ? 'text-green-600' : 'text-red-600'}`}>
                  {result.correct ? 'Rätt' : 'Fel'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <InteractiveButton
          variant="secondary"
          size="lg"
          onClick={onExit}
          icon={<Home className="w-5 h-5" />}
          iconPosition="left"
          className="flex-1"
        >
          Tillbaka till start
        </InteractiveButton>
        <InteractiveButton
          variant="primary"
          size="lg"
          onClick={onRestart}
          icon={<RotateCcw className="w-5 h-5" />}
          iconPosition="left"
          className="flex-1"
        >
          Starta om session
        </InteractiveButton>
      </div>
    </motion.div>
  );
}
