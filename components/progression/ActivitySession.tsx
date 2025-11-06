'use client';

import React, { useState, useEffect, memo } from 'react';
import { MCQQuestion, ALL_QUESTIONS } from '@/data/questions';
import { Domain } from '@/types/onboarding';
import { EducationLevel } from '@/types/education';
import { DifficultyBand, SRSCard } from '@/types/progression';
import { SessionResults, IntegratedUserProfile } from '@/types/integrated';
import { isLevelAppropriate, getAppropriateBands, getBandNumericValue } from '@/lib/level-utils';
import { processReview } from '@/lib/srs-algorithm';
import { ActivitySessionPropsSchema, safeValidate } from '@/lib/validation-schemas';
import { calculateSessionAssessment } from '@/lib/session-assessment';
import TutorMode from '../learning/TutorMode';
import { X, CheckCircle, Award, TrendingUp } from 'lucide-react';
import {
  GoalProgressionSection,
  WeakDomainSection,
  SystemAssessmentSection,
} from './SessionFeedbackSections';

interface ActivitySessionProps {
  activityId: string;
  activityType: 'new' | 'interleave' | 'srs';
  domain: Domain;
  userLevel: EducationLevel;
  targetBand?: DifficultyBand;
  questionIds?: string[];
  profile: IntegratedUserProfile;
  weakDomains?: Array<{ domain: Domain; accuracy: number }>;
  onComplete: (results: SessionResults) => void;
  onClose: () => void;
}

function ActivitySession({
  activityId,
  activityType,
  domain,
  userLevel,
  targetBand,
  questionIds,
  profile,
  weakDomains,
  onComplete,
  onClose
}: ActivitySessionProps) {
  // Validate props on mount
  useEffect(() => {
    const validation = safeValidate(ActivitySessionPropsSchema, {
      activityId,
      activityType,
      domain,
      userLevel,
      targetBand,
      questionIds,
      onComplete,
      onClose,
    });

    if (!validation.success) {
      console.error('ActivitySession received invalid props:', validation.error.format());
      // Log specific validation errors for debugging
      validation.error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only validate once on mount - intentionally not including dependencies

  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<{
    questionId: string;
    correct: boolean;
    xp: number;
    hintsUsed: number;
  }[]>([]);
  const [srsCards, setSrsCards] = useState<SRSCard[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionAssessment, setSessionAssessment] = useState<ReturnType<typeof calculateSessionAssessment> | null>(null);
  const [startTime] = useState(Date.now());

  // Load questions based on activity type
  useEffect(() => {
    let selectedQuestions: MCQQuestion[] = [];

    // If questionIds are provided, use them directly
    if (questionIds && questionIds.length > 0) {
      // Filter out any undefined/null/empty values from questionIds first
      const validIds = questionIds.filter((id): id is string => id != null && id !== '');
      console.log('ActivitySession: Filtering questionIds', {
        original: questionIds.length,
        valid: validIds.length,
        filtered: questionIds.length - validIds.length
      });

      selectedQuestions = validIds
        .map(id => ALL_QUESTIONS.find(q => q.id === id))
        .filter((q): q is MCQQuestion => q !== undefined);

      // Log if some IDs weren't found
      if (selectedQuestions.length < validIds.length) {
        console.warn(`Found ${selectedQuestions.length} questions out of ${validIds.length} valid IDs`);
      }
    } else {
      // Fallback to intelligent filtering if no questionIds provided
      // Uses level hierarchy and band filtering for better adaptation

      const appropriateBands = targetBand
        ? getAppropriateBands(targetBand, false) // Allow ±1 band variation
        : undefined;

      switch (activityType) {
        case 'new':
          // Get 3 new questions from the user's primary domain
          // Filter by level hierarchy (ST3 can see ST2, ST1, etc)
          // Filter by band if targetBand is provided
          selectedQuestions = ALL_QUESTIONS
            .filter(q => {
              // Guard against undefined questions
              if (!q) return false;

              // Must match domain
              if (q.domain !== domain) return false;

              // Use level hierarchy (e.g., ST3 can see ST1-ST3 content)
              if (!isLevelAppropriate(q.level, userLevel)) return false;

              // If targetBand provided, filter by appropriate bands
              if (appropriateBands && !appropriateBands.includes(q.band)) return false;

              return true;
            })
            .slice(0, 3);
          break;

        case 'interleave':
          // Get 2 questions from different domains (review/interleaving)
          // Use level hierarchy but allow easier content
          selectedQuestions = shuffleArray(
            ALL_QUESTIONS.filter(q => {
              // Guard against undefined questions
              if (!q) return false;

              // Different domain
              if (q.domain === domain) return false;

              // Use level hierarchy
              if (!isLevelAppropriate(q.level, userLevel)) return false;

              // For interleaving, prefer slightly easier bands
              if (appropriateBands) {
                const easierBands = getAppropriateBands(
                  appropriateBands[0], // Use easiest of appropriate bands
                  false
                );
                if (!easierBands.includes(q.band)) return false;
              }

              return true;
            })
          ).slice(0, 2);
          break;

        case 'srs':
          // Get questions that simulate SRS review
          // Use level hierarchy and band filtering
          selectedQuestions = shuffleArray(
            ALL_QUESTIONS.filter(q => {
              // Guard against undefined questions
              if (!q) return false;

              // Use level hierarchy
              if (!isLevelAppropriate(q.level, userLevel)) return false;

              // Use band filtering if provided
              if (appropriateBands && !appropriateBands.includes(q.band)) return false;

              return true;
            })
          ).slice(0, 2);
          break;
      }
    }

    console.log('ActivitySession: Loaded questions', {
      activityType,
      domain,
      selectedCount: selectedQuestions.length,
      questionIds: questionIds?.length,
      questions: selectedQuestions.map(q => ({ id: q.id, domain: q.domain }))
    });
    setQuestions(selectedQuestions);
  }, [activityType, domain, userLevel, targetBand, questionIds]);

  const handleQuestionComplete = (params: {
    selectedAnswer: string;
    correct: boolean;
    hintsUsed: number;
    timeSpent: number;
    xpEarned: number;
  }) => {
    const currentQ = questions[currentQuestionIndex];

    // Guard against undefined question
    if (!currentQ) {
      console.error('handleQuestionComplete called but currentQ is undefined', {
        currentQuestionIndex,
        questionsLength: questions.length
      });
      return;
    }

    // Record result
    setResults(prev => [...prev, {
      questionId: currentQ.id,
      correct: params.correct,
      xp: params.xpEarned,
      hintsUsed: params.hintsUsed
    }]);

    // Create SRS card for this question
    const now = new Date();
    const baseSRSCard: SRSCard = {
      id: `srs-${currentQ.id}-${now.getTime()}`,
      domain: currentQ.domain,
      type: 'quiz',
      contentId: currentQ.id,
      easeFactor: 2.5,
      stability: 0.3,
      interval: 1,
      dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      difficulty: getBandNumericValue(currentQ.band) / 4, // Convert band to 0-1
      lastGrade: null,
      lastReviewed: null,
      reviewCount: 0,
      createdAt: now,
      relatedGoals: currentQ.relatedGoals || [],
      competencies: [], // Will be populated by question tags later
      isLeech: false,
      failCount: 0
    };

    // Process review to update the card based on performance
    const grade = params.correct ? (params.hintsUsed === 0 ? 5 : 4) : 2;
    const { updatedCard } = processReview(baseSRSCard, grade, params.timeSpent, params.hintsUsed);

    setSrsCards(prev => [...prev, updatedCard]);

    // Move to next question or show summary
    console.log('handleQuestionComplete: Checking next step', {
      currentIndex: currentQuestionIndex,
      totalQuestions: questions.length,
      hasMore: currentQuestionIndex < questions.length - 1
    });

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      console.log('handleQuestionComplete: Moving to next question', {
        nextIndex,
        nextQuestionExists: !!questions[nextIndex],
        nextQuestionId: questions[nextIndex]?.id
      });
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      console.log('handleQuestionComplete: Showing summary');
      setShowSummary(true);
    }
  };

  const handleCompleteSummary = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const totalXP = results.reduce((sum, r) => sum + r.xp, 0);
    const correctAnswers = results.filter(r => r.correct).length;
    const totalHints = results.reduce((sum, r) => sum + r.hintsUsed, 0);

    // Extract unique related goals from all questions
    const relatedGoals = Array.from(
      new Set(
        questions
          .flatMap(q => q.relatedGoals || [])
          .filter(Boolean)
      )
    );

    // Track wrong answers for weak area identification
    const wrongAnswers = results
      .filter(r => !r.correct)
      .map(r => {
        const question = questions.find(q => q.id === r.questionId);
        if (!question) return null;

        return {
          questionId: r.questionId,
          timestamp: new Date(),
          domain: question.domain,
          band: question.band,
          topic: question.tags?.[0] // Use first tag as topic if available
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    // Calculate enhanced session assessment
    const assessment = calculateSessionAssessment(
      questions,
      results,
      relatedGoals,
      profile,
      weakDomains
    );

    // Store assessment for summary screen
    setSessionAssessment(assessment);

    // Build complete SessionResults
    const sessionResults: SessionResults = {
      summary: {
        xpEarned: totalXP,
        accuracy: results.length > 0 ? (correctAnswers / results.length) * 100 : 0,
        timeSpent,
        questionsAnswered: results.length,
        correctAnswers,
        hintsUsed: totalHints
      },
      srsUpdates: srsCards,
      performance: {
        correctRate: results.length > 0 ? correctAnswers / results.length : 0,
        hintUsage: results.length > 0 ? totalHints / results.length : 0,
        timeEfficiency: 1.0, // Could be improved with expected time calculation
        confidence: results.length > 0 ? correctAnswers / results.length : 0
      },
      completedContent: results.map(r => r.questionId),
      relatedGoals,
      wrongAnswers,
      assessment
    };

    onComplete(sessionResults);
  };

  if (questions.length === 0) {
    // Get activity type label
    const activityLabel = activityType === 'new' ? 'nytt innehåll' :
                          activityType === 'srs' ? 'repetitionskort' :
                          'övningsfrågor';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="flex flex-col items-center gap-6">
            {/* Animated Loading Spinner */}
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Informative Text */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Förbereder session...
              </h3>
              <p className="text-gray-600">
                Letar efter {activityLabel} inom <span className="font-medium text-blue-600">{domain}</span>
              </p>
              <p className="text-sm text-gray-500">
                Anpassar svårighetsgrad till {targetBand || 'din nivå'}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="w-full max-w-xs">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={onClose}
              className="mt-4 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Avbryt
            </button>
          </div>
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
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

          {/* Enhanced Feedback Sections */}
          {sessionAssessment && (
            <div className="mb-6 border border-gray-200 rounded-xl overflow-hidden">
              <GoalProgressionSection progressions={sessionAssessment.goalProgressions} />
              <WeakDomainSection performance={sessionAssessment.weakDomainPerformance} />
              <SystemAssessmentSection
                bandProgression={sessionAssessment.bandProgression}
                nextSteps={sessionAssessment.nextSteps}
              />
            </div>
          )}

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

  // Guard against no questions or undefined current question BEFORE accessing array
  if (questions.length === 0 || currentQuestionIndex >= questions.length || !questions[currentQuestionIndex]) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Inga frågor hittades</h2>
            <p className="text-gray-600 mb-6">
              Det finns inga frågor tillgängliga för denna aktivitet. Detta kan bero på att:
            </p>
            <ul className="text-left text-gray-600 mb-6 space-y-2">
              <li>• Inga frågor matchar din nuvarande nivå och svårighetsgrad</li>
              <li>• Domänen har inte tillräckligt med innehåll än</li>
              <li>• Ett tekniskt fel uppstod vid laddning av frågor</li>
            </ul>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Stäng och försök igen
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed at top */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
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
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Progress Bar - Fixed below header */}
        <div className="px-6 pt-4 flex-shrink-0">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-1 p-6 pt-4">
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

// Custom comparison function for memo
function arePropsEqual(prev: ActivitySessionProps, next: ActivitySessionProps): boolean {
  return (
    prev.activityId === next.activityId &&
    prev.activityType === next.activityType &&
    prev.domain === next.domain &&
    prev.userLevel === next.userLevel &&
    prev.targetBand === next.targetBand &&
    JSON.stringify(prev.questionIds) === JSON.stringify(next.questionIds) &&
    prev.profile.id === next.profile.id &&
    JSON.stringify(prev.weakDomains) === JSON.stringify(next.weakDomains)
    // Note: onComplete and onClose functions are not compared
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(ActivitySession, arePropsEqual);
