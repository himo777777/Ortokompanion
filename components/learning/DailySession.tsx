'use client';

import { useState, useEffect } from 'react';
import { LearningSession, AdaptiveQuestion, Flashcard, SessionSummary } from '@/types/learning';
import { BookOpen, HelpCircle, Repeat, Trophy, Clock, Target, TrendingUp, Zap } from 'lucide-react';

interface DailySessionProps {
  onComplete: (summary: SessionSummary) => void;
}

type Phase = 'read' | 'quiz' | 'review' | 'summary';

export default function DailySession({ onComplete }: DailySessionProps) {
  const [currentPhase, setCurrentPhase] = useState<Phase>('read');
  const [startTime] = useState(Date.now());
  const [readCompleted, setReadCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [flashcardsMastered, setFlashcardsMastered] = useState(0);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);

  const phases = [
    { id: 'read', label: 'READ', icon: BookOpen, duration: '2-3 min' },
    { id: 'quiz', label: 'QUIZ', icon: HelpCircle, duration: '3-4 min' },
    { id: 'review', label: 'REVIEW', icon: Repeat, duration: '2-3 min' },
    { id: 'summary', label: 'SUMMARY', icon: Trophy, duration: '1 min' },
  ];

  const currentPhaseIndex = phases.findIndex(p => p.id === currentPhase);

  const handlePhaseComplete = (phase: Phase, data?: any) => {
    if (phase === 'read') {
      setReadCompleted(true);
      setCurrentPhase('quiz');
    } else if (phase === 'quiz') {
      setQuizScore(data.score);
      setCurrentPhase('review');
    } else if (phase === 'review') {
      setFlashcardsMastered(data.mastered);
      generateSummary();
      setCurrentPhase('summary');
    }
  };

  const generateSummary = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const xpEarned = 25 + (quizScore >= 80 ? 10 : 0) + (flashcardsMastered * 2);

    const summary: SessionSummary = {
      xpEarned,
      streakDay: 3, // Would come from user profile
      keyInsight: 'Ottawa Ankle Rules reducerar onödiga röntgen med 30-40%',
      accuracy: quizScore,
      timeSpent,
      perfectDay: quizScore === 100 && flashcardsMastered >= 4,
    };

    setSessionSummary(summary);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
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
          <ReadPhase onComplete={() => handlePhaseComplete('read')} />
        )}
        {currentPhase === 'quiz' && (
          <QuizPhase onComplete={(score) => handlePhaseComplete('quiz', { score })} />
        )}
        {currentPhase === 'review' && (
          <ReviewPhase onComplete={(mastered) => handlePhaseComplete('review', { mastered })} />
        )}
        {currentPhase === 'summary' && sessionSummary && (
          <SummaryPhase summary={sessionSummary} onComplete={() => onComplete(sessionSummary)} />
        )}
      </div>
    </div>
  );
}

// READ Phase
function ReadPhase({ onComplete }: { onComplete: () => void }) {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pearl = {
    title: 'Ottawa Ankle Rules - När ska du röntga?',
    content: `Ottawa Ankle Rules är validerade beslutsstöd för att avgöra när röntgen behövs efter fotledstrauma.

**Röntgen ENDAST om:**

**Fotled:**
- Ömhet över bakre delen/spetsen av laterala malleolen ELLER
- Ömhet över bakre delen/spetsen av mediala malleolen ELLER
- Oförmåga att gå 4 steg direkt efter skadan och i akuten

**Fot:**
- Ömhet över naviculare ELLER
- Ömhet över basis metatarsale 5 ELLER
- Oförmåga att gå 4 steg

**Sensitivitet: 98-99%** för kliniskt signifikanta frakturer.
**Minskar onödiga röntgen med 30-40%** utan missade frakturer.`,
    keyPoints: [
      'Ömhet över malleolernas baksida/spets indikerar röntgen',
      'Oförmåga att gå 4 steg är viktig indikator',
      'Naviculare och basis MT5 är viktiga punkter i foten',
      'Mycket hög sensitivitet - trygg att utesluta fraktur',
    ],
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
            <p className="text-sm text-gray-600">Clinical Pearl • 2-3 minuter</p>
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

// QUIZ Phase
function QuizPhase({ onComplete }: { onComplete: (score: number) => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const questions: AdaptiveQuestion[] = [
    {
      id: 'q1',
      question: 'En 28-årig patient vrider foten vid löpning. Vid undersökning finns ömhet över laterala malleolens spets. Enligt Ottawa Ankle Rules, behövs röntgen?',
      options: ['Ja', 'Nej', 'Endast om patienten inte kan gå'],
      correctAnswer: 0,
      explanation: 'Ja - Ömhet över malleolernas bakre del eller spets är en indikation för röntgen enligt Ottawa Ankle Rules.',
      difficulty: 'easy',
    },
    {
      id: 'q2',
      question: 'Vilken sensitivitet har Ottawa Ankle Rules för kliniskt signifikanta frakturer?',
      options: ['85-90%', '90-95%', '98-99%', '100%'],
      correctAnswer: 2,
      explanation: 'Ottawa Ankle Rules har en sensitivitet på 98-99% för kliniskt signifikanta frakturer, vilket gör dem mycket pålitliga.',
      difficulty: 'medium',
    },
    {
      id: 'q3',
      question: 'En patient kan gå 4 steg men har ömhet över naviculare. Behövs röntgen av foten?',
      options: ['Ja', 'Nej', 'Endast ankeln behöver röntgas'],
      correctAnswer: 0,
      explanation: 'Ja - Ömhet över naviculare är en indikation för fotröntgen enligt Ottawa Ankle Rules, oavsett om patienten kan gå.',
      difficulty: 'hard',
    },
  ];

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      const correct = answers.filter((ans, idx) => ans === questions[idx].correctAnswer).length;
      const score = Math.round((correct / questions.length) * 100);
      onComplete(score);
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
              Fråga {currentQuestion + 1} av {questions.length}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Svarsfrekvens: {Math.round((currentQuestion / questions.length) * 100)}%
        </div>
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
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showFeedback && handleAnswer(index)}
              disabled={showFeedback}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                showFeedback
                  ? index === question.correctAnswer
                    ? 'border-green-500 bg-green-50'
                    : index === userAnswer
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
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
          <p
            className={`font-semibold mb-2 ${isCorrect ? 'text-green-800' : 'text-blue-800'}`}
          >
            {isCorrect ? '🎉 Rätt svar!' : '📚 Förklaring:'}
          </p>
          <p className={isCorrect ? 'text-green-700' : 'text-blue-700'}>
            {question.explanation}
          </p>
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

// REVIEW Phase (Flashcards)
function ReviewPhase({ onComplete }: { onComplete: (mastered: number) => void }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<boolean[]>([false, false, false, false, false]);

  const flashcards: Flashcard[] = [
    {
      id: 'fc1',
      front: 'Vilka är de 3 huvudindikationerna för fotledsröntgen enligt Ottawa Ankle Rules?',
      back: '1. Ömhet över bakre delen/spetsen av malleolerna\n2. Oförmåga att gå 4 steg\n3. (För fot: Ömhet över naviculare eller basis MT5)',
      topic: 'Ottawa Ankle Rules',
      difficulty: 'easy',
      mastered: false,
    },
    {
      id: 'fc2',
      front: 'Vad är sensitiviteten för Ottawa Ankle Rules?',
      back: '98-99% för kliniskt signifikanta frakturer\n\nDetta betyder att reglerna är mycket pålitliga för att utesluta frakturer.',
      topic: 'Ottawa Ankle Rules',
      difficulty: 'medium',
      mastered: false,
    },
    {
      id: 'fc3',
      front: 'Hur mycket minskar Ottawa Ankle Rules onödiga röntgenundersökningar?',
      back: '30-40% minskning av onödiga röntgen\n\nUtan att missa kliniskt signifikanta frakturer.',
      topic: 'Ottawa Ankle Rules',
      difficulty: 'medium',
      mastered: false,
    },
    {
      id: 'fc4',
      front: 'Var ska du palpera för att bedöma behov av fotröntgen?',
      back: '1. Naviculare (skepp ben)\n2. Basis metatarsale 5\n\n+ Oförmåga att gå 4 steg',
      topic: 'Ottawa Ankle Rules',
      difficulty: 'easy',
      mastered: false,
    },
    {
      id: 'fc5',
      front: 'När introducerades Ottawa Ankle Rules och varför?',
      back: 'Introducerades 1992 för att minska onödiga röntgen och väntetider på akuten.\n\nValiderade i över 30 studier med >15,000 patienter.',
      topic: 'Ottawa Ankle Rules',
      difficulty: 'hard',
      mastered: false,
    },
  ];

  const handleMastered = (mastered: boolean) => {
    const newMastered = [...masteredCards];
    newMastered[currentCard] = mastered;
    setMasteredCards(newMastered);
    setFlipped(false);

    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
    } else {
      const count = newMastered.filter(Boolean).length;
      onComplete(count);
    }
  };

  const card = flashcards[currentCard];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <Repeat className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">REVIEW</h2>
            <p className="text-sm text-gray-600">
              Flashcard {currentCard + 1} av {flashcards.length}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Mastrad: {masteredCards.filter(Boolean).length}/{flashcards.length}
        </div>
      </div>

      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }}
          />
        </div>
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
              {flipped ? card.back : card.front}
            </div>
          </div>
          <div className="text-center mt-6 text-sm text-gray-500">
            {!flipped && '👆 Klicka för att visa svar'}
          </div>
        </div>
      </div>

      {flipped && (
        <div className="flex gap-4">
          <button
            onClick={() => handleMastered(false)}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
          >
            🔄 Repetera senare
          </button>
          <button
            onClick={() => handleMastered(true)}
            className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors"
          >
            ✓ Jag kan detta!
          </button>
        </div>
      )}
    </div>
  );
}

// SUMMARY Phase
function SummaryPhase({
  summary,
  onComplete,
}: {
  summary: SessionSummary;
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
          <div className="text-2xl mb-2">🔥</div>
          <div className="text-2xl font-bold text-gray-800">{summary.streakDay}</div>
          <div className="text-sm text-gray-600">Streak Day</div>
        </div>

        <div className="bg-white rounded-lg p-4 text-center border-2 border-blue-300">
          <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{summary.accuracy}%</div>
          <div className="text-sm text-gray-600">Accuracy</div>
        </div>

        <div className="bg-white rounded-lg p-4 text-center border-2 border-green-300">
          <Clock className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">
            {Math.floor(summary.timeSpent / 60)}m
          </div>
          <div className="text-sm text-gray-600">Time Spent</div>
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
