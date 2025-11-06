'use client';

import { useState, useEffect } from 'react';
import {
  LearningSession,
  AdaptiveQuestion,
  Flashcard,
  SessionSummary,
} from '@/types/learning';
import {
  DailyMix,
  DifficultyBand,
  SRSCard,
  UserProgressionState,
} from '@/types/progression';
import { processReview, behaviorToGrade } from '@/lib/srs-algorithm';
import { BAND_DEFINITIONS } from '@/lib/band-system';
import { DOMAIN_LABELS } from '@/types/onboarding';
import {
  BookOpen,
  HelpCircle,
  Repeat,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Zap,
  Shield,
  Flame,
} from 'lucide-react';

interface EnhancedDailySessionProps {
  dailyMix: DailyMix;
  progressionState: UserProgressionState;
  onComplete: (results: {
    summary: SessionSummary;
    srsUpdates: SRSCard[];
    performance: {
      correctRate: number;
      hintUsage: number;
      timeEfficiency: number;
    };
  }) => void;
}

type Phase = 'read' | 'quiz' | 'review' | 'summary';

export default function EnhancedDailySession({
  dailyMix,
  progressionState,
  onComplete,
}: EnhancedDailySessionProps) {
  const [currentPhase, setCurrentPhase] = useState<Phase>('read');
  const [startTime] = useState(Date.now());
  const [readCompleted, setReadCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    hintsUsed: number;
    correctCount: number;
    totalQuestions: number;
  }>({ score: 0, hintsUsed: 0, correctCount: 0, totalQuestions: 0 });
  const [srsUpdates, setSrsUpdates] = useState<SRSCard[]>([]);
  const [flashcardsMastered, setFlashcardsMastered] = useState(0);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);

  const phases = [
    {
      id: 'read',
      label: 'READ',
      icon: BookOpen,
      duration: `${Math.round(dailyMix?.newContent?.estimatedTime || 0)} min`,
    },
    {
      id: 'quiz',
      label: 'QUIZ',
      icon: HelpCircle,
      duration: `${Math.round(dailyMix?.interleavingContent?.estimatedTime || 0)} min`,
    },
    {
      id: 'review',
      label: 'REVIEW',
      icon: Repeat,
      duration: `${Math.round(dailyMix?.srsReviews?.estimatedTime || 0)} min`,
    },
    { id: 'summary', label: 'SUMMARY', icon: Trophy, duration: '1 min' },
  ];

  const currentPhaseIndex = phases.findIndex((p) => p.id === currentPhase);
  const currentBand = dailyMix.targetBand;
  const bandDef = BAND_DEFINITIONS[currentBand];

  const handlePhaseComplete = (phase: Phase, data?: any) => {
    if (phase === 'read') {
      setReadCompleted(true);
      setCurrentPhase('quiz');
    } else if (phase === 'quiz') {
      setQuizResults(data);
      setCurrentPhase('review');
    } else if (phase === 'review') {
      setSrsUpdates(data.updatedCards);
      setFlashcardsMastered(data.mastered);
      generateSummary(data.updatedCards);
      setCurrentPhase('summary');
    }
  };

  const generateSummary = (updatedSRSCards: SRSCard[]) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    // Calculate XP with band multiplier
    const bandMultiplier = {
      A: 1.0,
      B: 1.2,
      C: 1.5,
      D: 1.8,
      E: 2.0,
    }[currentBand];

    const baseXP = 25;
    const quizBonus = quizResults.score >= 80 ? 10 : 0;
    const flashcardBonus = flashcardsMastered * 2;
    const bandBonus = Math.round(baseXP * (bandMultiplier - 1));

    const xpEarned = Math.round(baseXP + quizBonus + flashcardBonus + bandBonus);

    // Check if perfect day
    const perfectDay =
      quizResults.score === 100 &&
      flashcardsMastered >= Math.min(4, dailyMix?.srsReviews?.cards?.length || 0) &&
      quizResults.hintsUsed === 0;

    const summary: SessionSummary = {
      xpEarned,
      streakDay: progressionState.bandStatus.streakAtBand + 1,
      keyInsight: getKeyInsight(dailyMix, quizResults.score),
      accuracy: quizResults.score,
      timeSpent,
      perfectDay,
    };

    setSessionSummary(summary);
  };

  const getKeyInsight = (mix: DailyMix, score: number): string => {
    if (mix.isRecoveryDay) {
      return '🌟 Recovery day complete! You\'re building back your confidence and strength.';
    }

    if (score >= 90) {
      return `💪 Excellent work on Band ${currentBand}! You're mastering ${DOMAIN_LABELS[mix.newContent.domain]}.`;
    }

    if (score >= 70) {
      return `📈 Good progress! Keep practicing ${DOMAIN_LABELS[mix.newContent.domain]} concepts.`;
    }

    return `🎯 Keep going! Review ${DOMAIN_LABELS[mix.newContent.domain]} material and try again tomorrow.`;
  };

  const handleComplete = () => {
    if (!sessionSummary) return;

    // Calculate performance metrics for band adjustment
    const timeRatio = startTime
      ? (Date.now() - startTime) / (dailyMix.totalEstimatedTime * 60 * 1000)
      : 1.0;

    onComplete({
      summary: sessionSummary,
      srsUpdates,
      performance: {
        correctRate: quizResults.score / 100,
        hintUsage: quizResults.hintsUsed / quizResults.totalQuestions,
        timeEfficiency: Math.min(1.0, 1.0 / timeRatio),
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Band Info Header */}
      <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6" />
            <div>
              <div className="text-sm opacity-90">Dagens svårighetsgrad</div>
              <div className="text-lg font-bold">
                Band {currentBand} - {bandDef.label}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Domän</div>
            <div className="font-semibold">{DOMAIN_LABELS[dailyMix?.newContent?.domain || 'trauma']}</div>
          </div>
        </div>
        {dailyMix.isRecoveryDay && (
          <div className="mt-3 bg-white bg-opacity-20 rounded-lg p-2 text-sm">
            🛟 Recovery Day: Ta det lugnt idag. Vi fokuserar på repetition och självförtroende.
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {phases.map((phase, index) => (
            <div key={phase.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                    index < currentPhaseIndex
                      ? 'bg-green-500 text-white'
                      : index === currentPhaseIndex
                      ? 'bg-blue-500 text-white ring-4 ring-blue-200'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <phase.icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    index === currentPhaseIndex ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {phase.label}
                </span>
                <span className="text-xs text-gray-500">{phase.duration}</span>
              </div>
              {index < phases.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 transition-all ${
                    index < currentPhaseIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Phase Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {currentPhase === 'read' && (
          <ReadPhaseEnhanced
            content={dailyMix.newContent}
            band={currentBand}
            onComplete={() => handlePhaseComplete('read')}
          />
        )}
        {currentPhase === 'quiz' && (
          <QuizPhaseEnhanced
            band={currentBand}
            interleavingDomain={dailyMix?.interleavingContent?.domain || 'trauma'}
            onComplete={(results) => handlePhaseComplete('quiz', results)}
          />
        )}
        {currentPhase === 'review' && (
          <ReviewPhaseEnhanced
            srsCards={dailyMix?.srsReviews?.cards || []}
            onComplete={(results) => handlePhaseComplete('review', results)}
          />
        )}
        {currentPhase === 'summary' && sessionSummary && (
          <SummaryPhaseEnhanced
            summary={sessionSummary}
            band={currentBand}
            progressionState={progressionState}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}

// Enhanced READ Phase with Band-appropriate content
function ReadPhaseEnhanced({
  content,
  band,
  onComplete,
}: {
  content: DailyMix['newContent'];
  band: DifficultyBand;
  onComplete: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(Math.round(content.estimatedTime * 60));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock content - in real app, would load from content.items
  const pearl = {
    title: `Ottawa Ankle Rules - ${BAND_DEFINITIONS[band].label} Level`,
    content: getBandAppropriateContent(band),
    keyPoints: getBandAppropriateKeyPoints(band),
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">READ</h2>
            <p className="text-sm text-gray-600">
              Clinical Pearl • {DOMAIN_LABELS[content.domain]} • Band {band}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
          <Clock className="w-4 h-4 text-gray-600" />
          <span className="font-mono text-gray-700">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="prose max-w-none">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{pearl.title}</h3>
        <div className="text-gray-700 whitespace-pre-line leading-relaxed mb-6">
          {pearl.content}
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Viktiga punkter:</h4>
          <ul className="space-y-2">
            {pearl.keyPoints.map((point, index) => (
              <li key={index} className="text-blue-800">
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors mt-6"
      >
        Fortsätt till Quiz →
      </button>
    </div>
  );
}

// Enhanced QUIZ Phase with SRS integration
function QuizPhaseEnhanced({
  band,
  interleavingDomain,
  onComplete,
}: {
  band: DifficultyBand;
  interleavingDomain: string;
  onComplete: (results: {
    score: number;
    hintsUsed: number;
    correctCount: number;
    totalQuestions: number;
  }) => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintShown, setHintShown] = useState(false);

  // Generate band-appropriate questions
  const questions: AdaptiveQuestion[] = getBandAppropriateQuestions(band);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleHint = () => {
    setHintsUsed(hintsUsed + 1);
    setHintShown(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setHintShown(false);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      const correct = answers.filter((ans, idx) => ans === questions[idx].correctAnswer).length;
      const score = Math.round((correct / questions.length) * 100);

      onComplete({
        score,
        hintsUsed,
        correctCount: correct,
        totalQuestions: questions.length,
      });
    }
  };

  const question = questions[currentQuestion];
  const userAnswer = answers[currentQuestion];
  const isCorrect = userAnswer === question.correctAnswer;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <HelpCircle className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">QUIZ</h2>
            <p className="text-sm text-gray-600">
              Fråga {currentQuestion + 1} av {questions.length} • Band {band}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-600">Hints: {hintsUsed}</div>
      </div>

      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{question.question}</h3>

        {!showFeedback && !hintShown && BAND_DEFINITIONS[band].hints !== 'minimal' && (
          <button
            onClick={handleHint}
            className="mb-4 text-sm text-blue-600 hover:text-blue-700 underline"
          >
            💡 Behöver du en hint?
          </button>
        )}

        {hintShown && !showFeedback && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            💡 Hint: Tänk på de viktigaste indikationerna enligt beslutsstödet
          </div>
        )}

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showFeedback && handleAnswer(index)}
              disabled={showFeedback}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                showFeedback
                  ? index === question.correctAnswer
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : index === userAnswer
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : 'border-gray-200 bg-gray-50 text-gray-900'
                  : 'border-gray-200 text-gray-900 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option}</span>
                {showFeedback && index === question.correctAnswer && (
                  <span className="text-green-600">✓ Rätt</span>
                )}
                {showFeedback && index === userAnswer && index !== question.correctAnswer && (
                  <span className="text-red-600">✗ Fel</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {showFeedback && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            isCorrect ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
          }`}
        >
          <p className={`font-semibold mb-2 ${isCorrect ? 'text-green-800' : 'text-blue-800'}`}>
            {isCorrect ? '🎉 Rätt svar!' : '📚 Förklaring:'}
          </p>
          <p className={isCorrect ? 'text-green-700' : 'text-blue-700'}>{question.explanation}</p>
        </div>
      )}

      {showFeedback && (
        <button
          onClick={handleNext}
          className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition-colors"
        >
          {currentQuestion < questions.length - 1 ? 'Nästa fråga →' : 'Fortsätt till Review →'}
        </button>
      )}
    </div>
  );
}

// Enhanced REVIEW Phase with actual SRS scheduling
function ReviewPhaseEnhanced({
  srsCards,
  onComplete,
}: {
  srsCards: SRSCard[];
  onComplete: (results: { updatedCards: SRSCard[]; mastered: number }) => void;
}) {
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [updatedCards, setUpdatedCards] = useState<SRSCard[]>([]);
  const [masteredCount, setMasteredCount] = useState(0);

  if (srsCards.length === 0) {
    return (
      <div className="p-8 text-center">
        <Repeat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Inga kort att repetera idag!</h3>
        <p className="text-gray-600 mb-6">Bra jobbat! Du är uppdaterad med alla repetitioner.</p>
        <button
          onClick={() => onComplete({ updatedCards: [], mastered: 0 })}
          className="py-3 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
        >
          Fortsätt till Sammanfattning →
        </button>
      </div>
    );
  }

  const card = srsCards[currentCard];

  const handleGrade = (grade: 0 | 1 | 2 | 3 | 4 | 5) => {
    const timeSpent = 30; // Approximate time per card
    const hints = grade < 3 ? 1 : 0;

    const { updatedCard } = processReview(card, grade, timeSpent, hints);

    const newUpdatedCards = [...updatedCards, updatedCard];
    setUpdatedCards(newUpdatedCards);

    if (grade >= 4) {
      setMasteredCount(masteredCount + 1);
    }

    setFlipped(false);

    if (currentCard < srsCards.length - 1) {
      setCurrentCard(currentCard + 1);
    } else {
      onComplete({
        updatedCards: newUpdatedCards,
        mastered: masteredCount + (grade >= 4 ? 1 : 0),
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <Repeat className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">REVIEW (SRS)</h2>
            <p className="text-sm text-gray-600">
              Card {currentCard + 1} av {srsCards.length} • {DOMAIN_LABELS[card.domain]}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-600">Mastrad: {masteredCount}</div>
      </div>

      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentCard + 1) / srsCards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* SRS Card Info */}
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
        <span>Stabilitet: {Math.round(card.stability * 100)}%</span>
        <span>•</span>
        <span>Intervall: {card.interval} dagar</span>
        <span>•</span>
        <span>Reviews: {card.reviewCount}</span>
      </div>

      <div className="mb-8">
        <div
          className={`min-h-[300px] p-8 rounded-xl border-2 cursor-pointer transition-all ${
            flipped ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300'
          }`}
          onClick={() => setFlipped(!flipped)}
        >
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">
              {flipped ? 'Svar' : 'Fråga'}
            </p>
            <div className="text-lg leading-relaxed whitespace-pre-line">
              {flipped ? 'TODO: Load card back content' : 'TODO: Load card front content'}
            </div>
          </div>
          <div className="text-center mt-6 text-sm text-gray-500">
            {!flipped && '👆 Klicka för att visa svar'}
          </div>
        </div>
      </div>

      {flipped && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Hur väl kunde du svaret?</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleGrade(1)}
              className="py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 hover:text-red-800 font-medium transition-colors text-sm"
            >
              😕 Nej
            </button>
            <button
              onClick={() => handleGrade(3)}
              className="py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 hover:text-yellow-800 font-medium transition-colors text-sm"
            >
              🤔 Okej
            </button>
            <button
              onClick={() => handleGrade(5)}
              className="py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 hover:text-green-800 font-medium transition-colors text-sm"
            >
              😄 Perfekt!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced SUMMARY Phase with progression metrics
function SummaryPhaseEnhanced({
  summary,
  band,
  progressionState,
  onComplete,
}: {
  summary: SessionSummary;
  band: DifficultyBand;
  progressionState: UserProgressionState;
  onComplete: () => void;
}) {
  return (
    <div className="p-8 bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
          <Trophy className="w-12 h-12 text-yellow-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {summary.perfectDay ? '🌟 Perfekt dag!' : '🎉 Bra jobbat!'}
        </h2>
        <p className="text-gray-600">Din dagens session är klar</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 text-center border-2 border-yellow-300">
          <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">+{summary.xpEarned}</div>
          <div className="text-sm text-gray-600">XP Earned</div>
        </div>

        <div className="bg-white rounded-lg p-4 text-center border-2 border-orange-300">
          <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{summary.streakDay}</div>
          <div className="text-sm text-gray-600">Streak Day</div>
        </div>

        <div className="bg-white rounded-lg p-4 text-center border-2 border-blue-300">
          <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{summary.accuracy}%</div>
          <div className="text-sm text-gray-600">Accuracy</div>
        </div>

        <div className="bg-white rounded-lg p-4 text-center border-2 border-purple-300">
          <Shield className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">Band {band}</div>
          <div className="text-sm text-gray-600">{BAND_DEFINITIONS[band].label}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border-2 border-blue-200 mb-8">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">💡 Dagens insikt:</h3>
            <p className="text-gray-700">{summary.keyInsight}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 font-semibold text-lg transition-all shadow-lg"
      >
        Avsluta session ✨
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        Kom tillbaka imorgon för nästa session!
      </p>
    </div>
  );
}

// Helper functions for band-appropriate content
function getBandAppropriateContent(band: DifficultyBand): string {
  const content = {
    A: `Ottawa Ankle Rules är enkla riktlinjer för när röntgen behövs efter fotledstrauma.

**Tre viktiga punkter:**
1. Kolla malleolerna (knölarna på fotleden)
2. Kan patienten gå 4 steg?
3. Kolla naviculare och basis MT5 i foten

Om något av detta är positivt → Röntgen!`,

    B: `Ottawa Ankle Rules utvecklades 1992 för att minska onödiga röntgen på akuten.

**Fotledsröntgen endast om:**
- Ömhet över bakre delen/spetsen av malleolerna ELLER
- Oförmåga att gå 4 steg direkt efter skadan och i akuten

**Fotröntgen endast om:**
- Ömhet över naviculare ELLER
- Ömhet över basis metatarsale 5 ELLER
- Oförmåga att gå 4 steg

Sensitivitet: 98-99% för kliniskt signifikanta frakturer.`,

    C: `Ottawa Ankle Rules är validerade beslutsstöd med hög sensitivitet (98-99%).

**Bakgrund:**
Introducerades 1992 av Ian Stiell i Ottawa. Validerade i >30 studier med >15,000 patienter.

**Indikationer för fotledsröntgen:**
- Ömhet över bakre delen eller spetsen av laterala/mediala malleolen ELLER
- Oförmåga att belasta och gå 4 steg både direkt efter skadan och i akutmottagningen

**Indikationer för fotröntgen:**
- Ömhet över naviculare ELLER
- Ömhet över basis metatarsale 5 ELLER
- Oförmåga att belasta

**Effekt:** Minskar onödiga röntgen med 30-40% utan missade frakturer.

**Viktigt:** Gäller endast akuta (<10 dagar) fotledsskador hos vuxna. Undantag: multipla skador, gravida, intoxikerade.`,

    D: `Ottawa Ankle Rules - Avancerad tillämpning och fallgropar

**Evidens:**
- Sensitivitet: 98-99% för kliniskt signifikanta frakturer
- Specificitet: 40% (många får röntgen trots ingen fraktur)
- NNT: ~12 (antal röntgen som behövs för att hitta en fraktur)

**Kritiska beslutspunkter:**
1. Är skadan akut (<10 dagar)?
2. Finns andra distraktioner eller intoxikation?
3. Multipla skador eller högenergiskada?
4. Är patienten gravid eller har minskad känsel?

**Fallgropar:**
- Maisonneuve-fraktur: Proximal fibulafraktur kan missas
- Högenergiskador: Ottawa gäller för lågenergi
- Barn: Reglerna är mindre validerade <18 år
- Svullnad kan göra palpation svår inom 1-2 timmar

**Tips:** Vid tveksamhet - röntga! Kostnaden för en misstad fraktur är mycket högre.`,

    E: `Ottawa Ankle Rules - Expert-nivå: Evidens, implementation och edge cases

**Meta-analyser:**
- Bachmann et al. (2003): Pooled sensitivitet 98.5% (95% CI: 96.5-99.6)
- Dowling et al. (2009): Implementering minskar röntgen 30-35%

**Kostnad-nytta:**
- Besparingar: ~$40-60 per patient
- Minskning väntetid: 20-30 minuter
- Radiation exposure: 20-40% mindre

**Komplexa scenarios:**
1. **Maisonneuve-fraktur:**
   - Palpera ALLTID hela fibula proximalt
   - External rotation injury med deltoid pain
   - Röntgen hela underben vid misstanke

2. **Lisfranc-skador:**
   - Ottawa täcker EJ mittfotsskador
   - Kräver separat bedömning (midfoot tenderness, inability to bear weight)

3. **Osteoporotiska patienter:**
   - Lägre tröskel för röntgen
   - Risk för okkulta frakturer

4. **Återbesök:**
   - 1-5% får symtom efter initial negativ Ottawa
   - Följe vid kvarstående symtom efter 5-7 dagar

**Implementation barriers:**
- Physician override: 20-30% röntgar trots negativ Ottawa
- Medicolegal concerns
- Patient expectations

**Research gaps:**
- Pediatric validation
- Geriatric populations
- Cost-effectiveness i olika healthcare systems`,
  };

  return content[band];
}

function getBandAppropriateKeyPoints(band: DifficultyBand): string[] {
  const keyPoints: Record<DifficultyBand, string[]> = {
    A: [
      'Känna på malleolerna (knölarna)',
      'Fråga om patienten kan gå 4 steg',
      'Känna på naviculare och basis MT5 i foten',
    ],
    B: [
      'Ömhet över malleolernas baksida/spets = röntgen',
      'Oförmåga att gå 4 steg = röntgen',
      'Naviculare och basis MT5 viktiga punkter',
      'Sensitivitet 98-99%',
    ],
    C: [
      'Validerade regler från 1992, >30 studier',
      'Minskar onödiga röntgen med 30-40%',
      '4-steg-test både direkt efter skadan OCH i akuten',
      'Gäller akuta (<10 dagar) skador hos vuxna',
    ],
    D: [
      'Specificitet endast 40% - många onödiga röntgen kvarstår',
      'Palpera hela fibula - risk för Maisonneuve',
      'Mindre validerat hos barn och gravida',
      'Svullnad kan försvåra palpation inom 1-2h',
    ],
    E: [
      'Pooled sensitivitet 98.5% (Bachmann 2003)',
      'Maisonneuve, Lisfranc och osteoporotiska patienter kräver extra vigilans',
      '20-30% physician override - medicolegal och patient expectations',
      '1-5% återbesök vid kvarstående symtom',
    ],
  };

  return keyPoints[band];
}

function getBandAppropriateQuestions(band: DifficultyBand): AdaptiveQuestion[] {
  // Return different questions based on band
  // For now, return mock questions - in real app, load from database
  return [
    {
      id: 'q1',
      question: 'En 28-årig patient vrider foten. Ömhet över laterala malleolens spets. Röntgen?',
      options: ['Ja', 'Nej', 'Endast om inte kan gå'],
      correctAnswer: 0,
      explanation: 'Ja - Ömhet över malleolens bakre del/spets indikerar röntgen.',
      difficulty: 'easy',
    },
    {
      id: 'q2',
      question: 'Vilken sensitivitet har Ottawa Ankle Rules?',
      options: ['85-90%', '90-95%', '98-99%', '100%'],
      correctAnswer: 2,
      explanation: 'Ottawa Ankle Rules har 98-99% sensitivitet för signifikanta frakturer.',
      difficulty: 'medium',
    },
    {
      id: 'q3',
      question: 'Patient kan gå 4 steg men har ömhet över naviculare. Röntgen av foten?',
      options: ['Ja', 'Nej', 'Endast ankeln'],
      correctAnswer: 0,
      explanation: 'Ja - Ömhet över naviculare är indikation för fotröntgen oavsett gångförmåga.',
      difficulty: 'hard',
    },
  ];
}
