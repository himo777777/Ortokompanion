'use client';

import { useState, useEffect, useRef } from 'react';
import { MCQQuestion, TutorModeData } from '@/data/questions';
import { HelpCircle, Lightbulb, Target, Eye, CheckCircle, XCircle, BookOpen, AlertTriangle, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import {
  HintLevel,
  getHint,
  formatHintForDisplay,
  calculateHintPenalty,
  generateDefaultHints,
} from '@/lib/hint-system';
import {
  generateAdaptiveHints,
  generatePersonalizedExplanation,
} from '@/lib/ai-service';
import { EducationLevel } from '@/types/education';
import { VERIFIED_SOURCES } from '@/data/verified-sources';
import { SourceReference } from '@/types/verification';
import SourcesList, { SourcesSummary } from './SourcesList';
import EvidenceBadge from './EvidenceBadge';

interface TutorModeProps {
  question: MCQQuestion;
  onAnswer: (params: {
    selectedAnswer: string;
    correct: boolean;
    hintsUsed: number;
    timeSpent: number;
    xpEarned: number;
  }) => void;
  baseXP?: number;
  userLevel?: EducationLevel;
  previousMistakes?: string[]; // For AI personalization
  learningStyle?: 'visual' | 'analytical' | 'clinical' | 'mixed';
  enableAI?: boolean; // Toggle AI features
}

export default function TutorMode({
  question,
  onAnswer,
  baseXP = 20,
  userLevel = 'student',
  previousMistakes = [],
  learningStyle = 'mixed',
  enableAI = true,
}: TutorModeProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [revealedHints, setRevealedHints] = useState<HintLevel[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  // AI-powered state
  const [aiHints, setAiHints] = useState<string[] | null>(null);
  const [aiExplanation, setAiExplanation] = useState<{
    explanation: string;
    keyTakeaway: string;
    relatedConcepts: string[];
    studyRecommendation: string;
  } | null>(null);
  const [loadingAIHints, setLoadingAIHints] = useState(false);
  const [loadingAIExplanation, setLoadingAIExplanation] = useState(false);

  // Ref to track timeout for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get tutor mode data (use default if not provided)
  const tutorData: TutorModeData =
    question.tutorMode || generateDefaultHints(question);

  const isCorrect = selectedAnswer === question.correctAnswer;
  const hintsUsed = revealedHints.length;
  const xpEarned = showAnswer && isCorrect ? calculateHintPenalty(hintsUsed, baseXP) : 0;

  // Get relevant sources for this question
  const getQuestionSources = (): SourceReference[] => {
    const domainSourceMap: Record<string, string[]> = {
      'trauma': ['atls-sverige-2022', 'boast-open-fractures-2020', 'gustilo-1976'],
      'höft': ['nice-hip-fracture-2023', 'paprosky-1994', 'rikshoft-2024'],
      'knä': ['ottawa-knee-rules-1997', 'rikskna-2024'],
      'fot-fotled': ['campbell-13ed', 'rockwood-9ed'],
      'hand-handled': ['green-8ed', 'campbell-13ed'],
      'axel-armbåge': ['gartland-1959', 'rockwood-9ed', 'lewinnek-1978'],
      'rygg': ['aaos-acl-2022', 'campbell-13ed'],
      'sport': ['aaos-acl-2022', 'rikskna-2024'],
      'tumör': ['campbell-13ed', 'rockwood-9ed'],
    };

    const sourceIds = domainSourceMap[question.domain] || ['campbell-13ed'];
    return sourceIds.map(id => VERIFIED_SOURCES[id]).filter(Boolean);
  };

  const questionSources = getQuestionSources();

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setRevealedHints([]);
    setShowAnswer(false);
    setAiExplanation(null);
    setAiHints(null);
    setLoadingAIExplanation(false);
    setStartTime(Date.now());
  }, [question]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Load AI hints on component mount (if AI enabled)
  useEffect(() => {
    if (enableAI && !aiHints && !loadingAIHints) {
      loadAIHints();
    }
  }, [enableAI]);

  // Load AI hints
  const loadAIHints = async () => {
    setLoadingAIHints(true);
    try {
      const result = await generateAdaptiveHints({
        question,
        userLevel,
        learningStyle,
        previousAttempts: previousMistakes.length,
      });
      setAiHints(result.hints);
    } catch (error) {
      console.error('Failed to generate AI hints:', error);
      setAiHints(null); // Fallback to static hints
    } finally {
      setLoadingAIHints(false);
    }
  };

  // Load AI explanation when wrong answer submitted
  const loadAIExplanation = async () => {
    if (!selectedAnswer || isCorrect || !enableAI) return;

    setLoadingAIExplanation(true);
    try {
      const result = await generatePersonalizedExplanation({
        question,
        userAnswer: selectedAnswer,
        correctAnswer: question.correctAnswer,
        previousMistakes,
      });
      setAiExplanation(result);
    } catch (error) {
      console.error('Failed to generate AI explanation:', error);
      setAiExplanation(null); // Fallback to static explanation
    } finally {
      setLoadingAIExplanation(false);
    }
  };

  // Reveal next hint
  const revealNextHint = () => {
    const nextLevel = (revealedHints.length + 1) as HintLevel;
    if (nextLevel <= 3) {
      setRevealedHints([...revealedHints, nextLevel]);
    }
  };

  // Handle answer selection
  const handleSelectAnswer = (answer: string) => {
    if (!showAnswer) {
      setSelectedAnswer(answer);
    }
  };

  // Submit answer
  const handleSubmit = async () => {
    if (!selectedAnswer) return;

    setShowAnswer(true);

    // Load AI explanation if wrong answer
    if (!isCorrect && enableAI) {
      await loadAIExplanation();
    }
  };

  // Handle moving to next question
  const handleNext = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onAnswer({
      selectedAnswer: selectedAnswer!,
      correct: isCorrect,
      hintsUsed,
      timeSpent,
      xpEarned,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
          <h2 className="text-2xl font-bold text-gray-900">Tutor Mode</h2>
        </div>
        <p className="text-gray-600">
          Använd ledtrådar om du behöver hjälp. Varje ledtråd minskar XP med 20%.
        </p>
      </div>

      {/* XP Indicator */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700">Möjlig XP:</span>
            <span className={`ml-2 text-2xl font-bold ${hintsUsed > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {calculateHintPenalty(hintsUsed, baseXP)} XP
            </span>
            {hintsUsed > 0 && (
              <span className="ml-2 text-sm text-gray-500 line-through">{baseXP} XP</span>
            )}
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-gray-700">Ledtrådar använda:</span>
            <span className="ml-2 text-lg font-semibold text-blue-600">
              {hintsUsed}/3
            </span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        {/* Question Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium text-gray-600">
              Domän: <span className="text-gray-900">{question.domain}</span>
            </span>
            <span className="font-medium text-gray-600">
              Nivå: <span className="text-gray-900">{question.level}</span>
            </span>
            <span className="font-medium text-gray-600">
              Band: <span className="text-gray-900">{question.band}</span>
            </span>
          </div>
        </div>

        {/* Question Text */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {question.question}
          </h3>

          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isThisCorrect = option === question.correctAnswer;
              const showFeedback = showAnswer;

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={showAnswer}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    showFeedback && isThisCorrect
                      ? 'border-green-500 bg-green-50'
                      : showFeedback && isSelected && !isThisCorrect
                      ? 'border-red-500 bg-red-50'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${showAnswer ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-700">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 text-gray-900">{option}</span>
                    {showFeedback && isThisCorrect && (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    )}
                    {showFeedback && isSelected && !isThisCorrect && (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hint Section */}
          {!showAnswer && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3 mb-3">
                <HelpCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-yellow-900">
                      Behöver du en ledtråd?
                    </h4>
                    {enableAI && aiHints && (
                      <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        <Sparkles className="w-3 h-3" />
                        AI-anpassad
                      </span>
                    )}
                  </div>

                  {/* Loading AI Hints */}
                  {loadingAIHints && revealedHints.length === 0 && (
                    <div className="flex items-center gap-2 text-sm text-yellow-700 mb-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Genererar intelligenta ledtrådar...
                    </div>
                  )}

                  {/* Revealed Hints */}
                  {revealedHints.map((level) => {
                    // Use AI hints if available, otherwise fallback to static
                    const hintText = aiHints && aiHints[level - 1]
                      ? aiHints[level - 1]
                      : getHint(tutorData, level);

                    const formatted = formatHintForDisplay(hintText, level);
                    const isAIHint = aiHints && aiHints[level - 1];

                    return (
                      <div
                        key={level}
                        className={`mb-3 p-3 rounded-lg border-2 ${
                          formatted.color === 'blue'
                            ? 'bg-blue-50 border-blue-200'
                            : formatted.color === 'yellow'
                            ? 'bg-yellow-50 border-yellow-300'
                            : 'bg-orange-50 border-orange-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xl">{formatted.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-semibold text-gray-700">
                                {formatted.label}
                              </p>
                              {isAIHint && (
                                <Sparkles className="w-3 h-3 text-purple-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-800">{formatted.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Next Hint Button */}
                  {revealedHints.length < 3 && (
                    <button
                      onClick={revealNextHint}
                      disabled={loadingAIHints}
                      className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {loadingAIHints ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Laddar...
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Visa ledtråd {revealedHints.length + 1} (-20% XP)
                        </>
                      )}
                    </button>
                  )}

                  {revealedHints.length === 3 && (
                    <p className="text-sm text-yellow-800 italic">
                      Alla ledtrådar visade. Försök svara nu!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Explanation (after submission) */}
          {showAnswer && (
            <div className={`rounded-lg border-2 p-4 mb-4 ${
              isCorrect
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3 mb-3">
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h4 className={`font-bold text-lg mb-1 ${
                    isCorrect ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {isCorrect ? 'Rätt!' : 'Fel svar'}
                  </h4>
                  <p className={`text-sm ${
                    isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isCorrect
                      ? `Bra jobbat! Du tjänade ${xpEarned} XP.`
                      : `Rätt svar: ${question.correctAnswer}`}
                  </p>
                </div>
              </div>

              {/* AI Personalized Explanation (for wrong answers) */}
              {!isCorrect && enableAI && loadingAIExplanation && (
                <div className="bg-purple-50 rounded-lg p-4 mt-3 border border-purple-200">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Genererar personlig förklaring...</span>
                  </div>
                </div>
              )}

              {!isCorrect && enableAI && aiExplanation && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 mt-3 border-2 border-purple-300">
                  <div className="flex items-start gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h5 className="font-semibold text-purple-900 mb-1">AI-anpassad förklaring för dig</h5>
                      <p className="text-xs text-purple-700">Baserat på ditt svar och tidigare misstag</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {aiExplanation.explanation}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Nyckelpunkt att komma ihåg:</p>
                    <p className="text-sm text-blue-800">{aiExplanation.keyTakeaway}</p>
                  </div>

                  {aiExplanation.relatedConcepts.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-3 mb-3 border border-purple-200">
                      <p className="text-xs font-semibold text-purple-900 mb-2">Relaterade koncept att studera:</p>
                      <ul className="space-y-1">
                        {aiExplanation.relatedConcepts.map((concept, idx) => (
                          <li key={idx} className="text-sm text-purple-800 flex items-start gap-2">
                            <span className="text-purple-400 mt-0.5">→</span>
                            <span>{concept}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs font-semibold text-green-900 mb-1">Studierekommendation:</p>
                    <p className="text-sm text-green-800">{aiExplanation.studyRecommendation}</p>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg p-4 mt-3">
                <div className="flex items-start gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <h5 className="font-semibold text-gray-900">Förklaring</h5>
                </div>
                <p className="text-gray-800 text-sm leading-relaxed">
                  {question.explanation}
                </p>

                {/* Verified Sources Section */}
                {questionSources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <h6 className="text-sm font-semibold text-gray-900">Verifierade källor</h6>
                      </div>
                      <SourcesSummary sources={questionSources} />
                    </div>
                    <SourcesList sources={questionSources} variant="compact" maxVisible={3} />
                  </div>
                )}
              </div>

              {/* Teaching Points */}
              {tutorData.teachingPoints && tutorData.teachingPoints.length > 0 && (
                <div className="bg-white rounded-lg p-4 mt-3">
                  <div className="flex items-start gap-2 mb-2">
                    <Target className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <h5 className="font-semibold text-gray-900">Viktiga lärdomar</h5>
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {tutorData.teachingPoints.map((point, idx) => (
                      <li key={idx} className="text-sm text-gray-800">{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Mistakes */}
              {tutorData.commonMistakes && tutorData.commonMistakes.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4 mt-3 border border-yellow-200">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <h5 className="font-semibold text-yellow-900">Vanliga misstag</h5>
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {tutorData.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="text-sm text-yellow-800">{mistake}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mnemonic */}
              {tutorData.mnemonicOrTrick && (
                <div className="bg-purple-50 rounded-lg p-4 mt-3 border border-purple-200">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-purple-900 mb-1">Minnesregel</h5>
                      <p className="text-sm text-purple-800">{tutorData.mnemonicOrTrick}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          {!showAnswer && (
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            >
              Svara
            </button>
          )}

          {/* Next Question Button - only show after answer is submitted */}
          {showAnswer && (
            <button
              onClick={handleNext}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span>Nästa fråga</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
