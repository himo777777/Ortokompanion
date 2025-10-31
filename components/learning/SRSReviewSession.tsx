'use client';

import { useState, useEffect } from 'react';
import { SRSCard, SRSGrade } from '@/types/progression';
import { CaseStudy } from '@/types/education';
import { MCQQuestion } from '@/data/questions';
import { Clock, BookOpen, CheckCircle, XCircle, Brain, Zap, Target, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { processReview, behaviorToGrade } from '@/lib/srs-algorithm';
import { optimizeSRSSchedule } from '@/lib/ai-service';

interface SRSReviewSessionProps {
  dueCards: SRSCard[];
  allQuestions: MCQQuestion[];
  allCases: CaseStudy[];
  onSessionComplete: (results: {
    reviewedCards: SRSCard[];
    totalReviews: number;
    avgGrade: number;
    timeSpent: number;
    xpEarned: number;
  }) => void;
  enableAI?: boolean;
  recentPerformance?: Array<{
    cardId: string;
    grade: number;
    timestamp: Date;
    timeSpent: number;
  }>;
}

export default function SRSReviewSession({
  dueCards,
  allQuestions,
  allCases,
  onSessionComplete,
  enableAI = true,
  recentPerformance = [],
}: SRSReviewSessionProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showContent, setShowContent] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [cardStartTime, setCardStartTime] = useState(Date.now());
  const [sessionStartTime] = useState(Date.now());
  const [reviewedCards, setReviewedCards] = useState<SRSCard[]>([]);
  const [grades, setGrades] = useState<SRSGrade[]>([]);

  // AI-powered state
  const [aiPredictions, setAiPredictions] = useState<Array<{
    cardId: string;
    forgettingProbability: number;
    recommendedReviewDate: Date;
    reason: string;
  }> | null>(null);
  const [loadingAIPredictions, setLoadingAIPredictions] = useState(false);

  const currentCard = dueCards[currentCardIndex];
  const totalCards = dueCards.length;
  const progress = totalCards > 0 ? ((currentCardIndex + 1) / totalCards) * 100 : 0;

  // Load AI predictions on mount
  useEffect(() => {
    if (enableAI && dueCards.length > 0 && !loadingAIPredictions && !aiPredictions) {
      loadAIPredictions();
    }
  }, [enableAI, dueCards]);

  // Load AI predictions for all cards
  const loadAIPredictions = async () => {
    setLoadingAIPredictions(true);
    try {
      const result = await optimizeSRSSchedule({
        cards: dueCards,
        recentPerformance,
      });
      setAiPredictions(result.predictions);
    } catch (error) {
      console.error('Failed to load AI predictions:', error);
      setAiPredictions(null);
    } finally {
      setLoadingAIPredictions(false);
    }
  };

  // Get AI prediction for current card
  const getCurrentCardPrediction = () => {
    if (!aiPredictions || !currentCard) return null;
    return aiPredictions.find(p => p.cardId === currentCard.id);
  };

  const currentPrediction = getCurrentCardPrediction();

  // Get content for current card
  const getCardContent = (card: SRSCard): MCQQuestion | CaseStudy | null => {
    if (card.type === 'quiz') {
      return allQuestions.find((q) => q.id === card.contentId) || null;
    } else if (card.type === 'microcase') {
      return allCases.find((c) => c.id === card.contentId) || null;
    }
    return null;
  };

  const content = currentCard ? getCardContent(currentCard) : null;

  // Handle answer selection (for quiz cards)
  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowAnswer(true);
  };

  // Handle manual grading (user rates their own recall)
  const handleGrade = (grade: SRSGrade) => {
    if (!currentCard) return;

    const timeSpent = Math.floor((Date.now() - cardStartTime) / 1000);

    // Process the review
    const { updatedCard, reviewResult } = processReview(
      currentCard,
      grade,
      timeSpent,
      hintsUsed
    );

    // Store results
    setReviewedCards([...reviewedCards, updatedCard]);
    setGrades([...grades, grade]);

    // Move to next card or finish
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      resetCardState();
    } else {
      completeSession();
    }
  };

  // Auto-grade for quiz cards based on correctness
  const handleQuizGrade = () => {
    if (!currentCard || !content || !selectedAnswer) return;

    const question = content as MCQQuestion;
    const isCorrect = selectedAnswer === question.correctAnswer;
    const timeSpent = Math.floor((Date.now() - cardStartTime) / 1000);
    const expectedTime = 60; // 60 seconds expected per question

    // Calculate grade using behavior mapping
    const grade = behaviorToGrade({
      correct: isCorrect,
      hintsUsed,
      timeRatio: timeSpent / expectedTime,
      confidence: isCorrect ? 0.8 : 0.3,
    });

    handleGrade(grade);
  };

  // Reset state for next card
  const resetCardState = () => {
    setShowContent(true);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setHintsUsed(0);
    setCardStartTime(Date.now());
  };

  // Complete the session
  const completeSession = () => {
    const sessionTime = Math.floor((Date.now() - sessionStartTime) / 1000);
    const avgGrade =
      grades.length > 0
        ? grades.reduce((sum: number, g) => sum + g, 0) / grades.length
        : 0;

    // Calculate XP: 10 per card + bonus for good grades
    const xpEarned =
      reviewedCards.length * 10 +
      grades.filter((g) => g >= 4).length * 5;

    onSessionComplete({
      reviewedCards,
      totalReviews: reviewedCards.length,
      avgGrade,
      timeSpent: sessionTime,
      xpEarned,
    });
  };

  // Show completion message if no cards
  if (totalCards === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Inga kort att repetera idag!
          </h2>
          <p className="text-gray-600">
            Bra jobbat! Alla dina kort är uppdaterade. Kom tillbaka när det är dags för nästa repetition.
          </p>
        </div>
      </div>
    );
  }

  if (!currentCard || !content) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <p className="text-gray-600">Laddar innehåll...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-7 h-7 text-purple-600" />
              SRS Repetition
            </h1>
            <p className="text-gray-600 mt-1">
              Kort {currentCardIndex + 1} av {totalCards}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span className="font-mono">
                {Math.floor((Date.now() - cardStartTime) / 1000)}s
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-600">
                Stabilitet: {Math.round(currentCard.stability * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* AI Prediction Alert (high forgetting risk) */}
      {enableAI && currentPrediction && currentPrediction.forgettingProbability > 0.6 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-orange-900">Hög risk att glömma!</h4>
                <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  AI-förutsägelse
                </span>
              </div>
              <p className="text-sm text-orange-800 mb-2">
                Sannolikhet att glömma: <span className="font-semibold">{Math.round(currentPrediction.forgettingProbability * 100)}%</span>
              </p>
              <p className="text-sm text-orange-700 italic">
                {currentPrediction.reason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading AI Predictions */}
      {loadingAIPredictions && !aiPredictions && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-purple-700">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Analyserar dina repetitionsmönster med AI...</span>
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        {/* Card Metadata */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-600">
              Domän: <span className="text-gray-900">{currentCard.domain}</span>
            </span>
            <span className="text-sm font-medium text-gray-600">
              Typ: <span className="text-gray-900">{currentCard.type === 'quiz' ? 'Quiz' : 'Case'}</span>
            </span>
            <span className="text-sm font-medium text-gray-600">
              Granskningar: <span className="text-gray-900">{currentCard.reviewCount}</span>
            </span>
            {enableAI && currentPrediction && (
              <span className="text-sm font-medium text-purple-600 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Glömrisk: <span className="font-bold">{Math.round(currentPrediction.forgettingProbability * 100)}%</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentCard.isLeech && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                ⚠️ Svår
              </span>
            )}
            {enableAI && currentPrediction && currentPrediction.forgettingProbability > 0.6 && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Hög risk
              </span>
            )}
          </div>
        </div>

        {/* Question Content (for quiz cards) */}
        {currentCard.type === 'quiz' && content && 'question' in content && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {(content as MCQQuestion).question}
            </h3>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {(content as MCQQuestion).options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === (content as MCQQuestion).correctAnswer;
                const showFeedback = showAnswer;

                return (
                  <button
                    key={index}
                    onClick={() => !showAnswer && handleAnswerSelect(option)}
                    disabled={showAnswer}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      showFeedback && isCorrect
                        ? 'border-green-500 bg-green-50'
                        : showFeedback && isSelected && !isCorrect
                        ? 'border-red-500 bg-red-50'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-700">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="text-gray-900">{option}</span>
                      {showFeedback && isCorrect && (
                        <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                      )}
                      {showFeedback && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation (shown after answering) */}
            {showAnswer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Förklaring
                </h4>
                <p className="text-blue-900 text-sm leading-relaxed">
                  {(content as MCQQuestion).explanation}
                </p>
                {(content as MCQQuestion).references && (content as MCQQuestion).references!.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-blue-700 font-medium mb-1">Källor:</p>
                    <p className="text-xs text-blue-600">
                      {(content as MCQQuestion).references!.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                disabled={!selectedAnswer}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Visa svar
              </button>
            ) : (
              <button
                onClick={handleQuizGrade}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Nästa kort →
              </button>
            )}
          </div>
        )}

        {/* Case Content (for microcase cards) */}
        {currentCard.type === 'microcase' && content && 'scenario' in content && (
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {(content as CaseStudy).title}
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-800 leading-relaxed">
                {(content as CaseStudy).scenario}
              </p>
            </div>

            {/* Manual Grading for Cases */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-900 mb-3 font-medium">
                Hur väl kommer du ihåg detta fall?
              </p>
              <div className="grid grid-cols-6 gap-2">
                {[0, 1, 2, 3, 4, 5].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => handleGrade(grade as SRSGrade)}
                    className={`py-3 px-2 rounded-lg font-semibold transition-all ${
                      grade === 0
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : grade <= 2
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : grade === 3
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-600">
                <span className="text-center">0-1: Glömt</span>
                <span className="text-center">2-3: Okej</span>
                <span className="text-center">4-5: Perfekt</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">XP denna session</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {reviewedCards.length * 10}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Repeterade kort</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {reviewedCards.length}/{totalCards}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Snitt betyg</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {grades.length > 0
              ? (grades.reduce((sum: number, g) => sum + g, 0) / grades.length).toFixed(1)
              : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
