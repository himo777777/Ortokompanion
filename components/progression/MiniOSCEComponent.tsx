'use client';

import { useState, useEffect } from 'react';
import { MiniOSCE, OSCEResult } from '@/types/progression';
import { calculateOSCEScore } from '@/data/mini-osce';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  ChevronRight,
  Timer,
} from 'lucide-react';

interface MiniOSCEComponentProps {
  osce: MiniOSCE;
  onComplete: (result: OSCEResult) => void;
  onCancel?: () => void;
}

type OSCEPhase = 'intro' | 'scenario' | 'actions' | 'assessment' | 'pitfall' | 'results';

export default function MiniOSCEComponent({ osce, onComplete, onCancel }: MiniOSCEComponentProps) {
  const [phase, setPhase] = useState<OSCEPhase>('intro');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // User responses
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [assessmentText, setAssessmentText] = useState('');
  const [pitfallIdentified, setPitfallIdentified] = useState(false);

  // Scoring
  const [scores, setScores] = useState<Array<{ rubricId: number; score: 0 | 1 | 2 }>>([]);

  // Timer effect
  useEffect(() => {
    if (phase === 'scenario' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [phase, timeRemaining]);

  const startScenarioPhase = () => {
    setPhase('scenario');
    setTimeRemaining(osce.scenario.duration);
    setStartTime(new Date());
  };

  const moveToActionsPhase = () => {
    setPhase('actions');
  };

  const toggleAction = (actionId: string) => {
    if (completedActions.includes(actionId)) {
      setCompletedActions(completedActions.filter((id) => id !== actionId));
    } else {
      setCompletedActions([...completedActions, actionId]);
    }
  };

  const moveToAssessmentPhase = () => {
    setPhase('assessment');
    setTimeRemaining(osce.assessment.timeLimit);
  };

  const moveToPitfallPhase = () => {
    setPhase('pitfall');
  };

  const calculateAndShowResults = () => {
    // Auto-score based on actions and assessment
    const autoScores: Array<{ rubricId: number; score: 0 | 1 | 2 }> = [];

    osce.rubric.forEach((criterion, index) => {
      let score: 0 | 1 | 2 = 0;

      // Simple scoring logic (in real app, this would be more sophisticated)
      if (index === 0) {
        // First criterion usually relates to actions
        const requiredActions = osce.criticalActions.filter((a) => a.required);
        const completedRequiredActions = requiredActions.filter((a) =>
          completedActions.includes(a.id)
        );
        const ratio = completedRequiredActions.length / requiredActions.length;
        score = ratio >= 1 ? 2 : ratio >= 0.5 ? 1 : 0;
      } else if (index === osce.rubric.length - 1) {
        // Last criterion often relates to keywords/pitfall
        const hasKeywords = osce.assessment.requiredKeywords.some((keyword) =>
          assessmentText.toLowerCase().includes(keyword.toLowerCase())
        );
        score = pitfallIdentified && hasKeywords ? 2 : hasKeywords ? 1 : 0;
      } else {
        // Middle criteria - moderate scoring
        score = completedActions.length >= osce.criticalActions.length ? 2 : 1;
      }

      autoScores.push({ rubricId: index, score });
    });

    setScores(autoScores);
    setPhase('results');
  };

  const finishOSCE = () => {
    const endTime = new Date();
    const timeSpent = startTime ? (endTime.getTime() - startTime.getTime()) / 1000 : 0;

    const result = calculateOSCEScore(scores, osce.rubric);

    const osceResult: OSCEResult = {
      osceId: osce.id,
      userId: 'current-user', // Would come from context
      completedAt: endTime,
      scores,
      totalScore: result.totalScore,
      maxScore: result.maxScore,
      percentage: result.percentage,
      passed: result.passed,
      actionsCompleted: completedActions,
      keywordsUsed: osce.assessment.requiredKeywords.filter((keyword) =>
        assessmentText.toLowerCase().includes(keyword.toLowerCase())
      ),
      pitfallIdentified,
      timeSpent,
    };

    onComplete(osceResult);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Intro Phase */}
      {phase === 'intro' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-6">
            <Award className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mini-OSCE: {osce.domain}</h1>
            <p className="text-gray-600">{osce.scenario.title}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-blue-900 mb-3">Om detta test</h2>
            <p className="text-blue-800 mb-4">
              Detta är en kort OSCE-liknande bedömning (5-8 minuter) som testar din förmåga att:
            </p>
            <ul className="list-disc list-inside text-blue-800 space-y-2">
              <li>Utföra kritiska säkerhetsåtgärder</li>
              <li>Prioritera korrekt</li>
              <li>Tillämpa klinisk kunskap</li>
              <li>Identifiera fallgropar</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Antal steg</div>
              <div className="text-2xl font-bold text-gray-800">
                {osce.criticalActions.length + 2}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Godkänt vid</div>
              <div className="text-2xl font-bold text-green-600">{osce.passingScore * 100}%</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={startScenarioPhase}
              className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronRight className="w-5 h-5" />
              Starta Mini-OSCE
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
              >
                Avbryt
              </button>
            )}
          </div>
        </div>
      )}

      {/* Scenario Phase */}
      {phase === 'scenario' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Scenario</h2>
            <div className="flex items-center gap-2 text-blue-600">
              <Timer className="w-5 h-5" />
              <span className="text-lg font-semibold">{formatTime(timeRemaining)}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{osce.scenario.title}</h3>
            <p className="text-gray-700 leading-relaxed mb-4">{osce.scenario.description}</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-900 mb-2">Viktiga fakta:</h4>
            <ul className="space-y-1">
              {osce.scenario.vitalFacts.map((fact, index) => (
                <li key={index} className="flex items-start gap-2 text-yellow-800">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={moveToActionsPhase}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Fortsätt till åtgärder
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Actions Phase */}
      {phase === 'actions' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Kritiska åtgärder</h2>
          <p className="text-gray-600 mb-6">
            Välj de åtgärder du skulle utföra. Klicka för att markera/avmarkera.
          </p>

          <div className="space-y-4 mb-8">
            {osce.criticalActions.map((action) => {
              const isCompleted = completedActions.includes(action.id);

              return (
                <button
                  key={action.id}
                  onClick={() => toggleAction(action.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isCompleted
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 bg-white hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isCompleted ? 'text-green-900' : 'text-gray-800'}`}>
                        {action.action}
                      </p>
                      {action.required && (
                        <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                          Obligatorisk
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={moveToAssessmentPhase}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Fortsätt till bedömning
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Assessment Phase */}
      {phase === 'assessment' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Bedömning & Diktation</h2>
            <div className="flex items-center gap-2 text-blue-600">
              <Clock className="w-5 h-5" />
              <span className="text-lg font-semibold">{formatTime(timeRemaining)}</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 font-medium mb-4">{osce.assessment.question}</p>
            <textarea
              value={assessmentText}
              onChange={(e) => setAssessmentText(e.target.value)}
              placeholder="Skriv din bedömning här..."
              className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-2">
              Viktiga nyckelord att inkludera: {osce.assessment.requiredKeywords.join(', ')}
            </p>
          </div>

          <button
            onClick={moveToPitfallPhase}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Fortsätt
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Pitfall Phase */}
      {phase === 'pitfall' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Fallgrop</h2>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">Ny information</h3>
                <p className="text-orange-800">{osce.pitfall.description}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <p className="font-medium text-gray-700 mb-3">Identifierade du denna fallgrop?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setPitfallIdentified(true)}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  pitfallIdentified
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-green-400'
                }`}
              >
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
                Ja, jag tänkte på detta
              </button>
              <button
                onClick={() => setPitfallIdentified(false)}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  !pitfallIdentified
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                }`}
              >
                <XCircle className="w-6 h-6 mx-auto mb-2" />
                Nej, jag missade detta
              </button>
            </div>
          </div>

          <button
            onClick={calculateAndShowResults}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Se resultat
            <Award className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Results Phase */}
      {phase === 'results' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            {scores.length > 0 && (
              <>
                {calculateOSCEScore(scores, osce.rubric).passed ? (
                  <div>
                    <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-green-600 mb-2">Godkänt!</h2>
                    <p className="text-gray-600">
                      Du klarade Mini-OSCE med {Math.round(calculateOSCEScore(scores, osce.rubric).percentage * 100)}%
                    </p>
                  </div>
                ) : (
                  <div>
                    <XCircle className="w-20 h-20 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-orange-600 mb-2">Ej godkänt</h2>
                    <p className="text-gray-600">
                      Du fick {Math.round(calculateOSCEScore(scores, osce.rubric).percentage * 100)}% (krävs {osce.passingScore * 100}%)
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Detaljerad bedömning</h3>
            <div className="space-y-4">
              {osce.rubric.map((criterion, index) => {
                const score = scores.find((s) => s.rubricId === index)?.score || 0;

                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-800">{criterion.criterion}</h4>
                      <span className="text-lg font-bold text-blue-600">
                        {score}/{criterion.maxScore}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{criterion.scoring[score]}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={finishOSCE}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Slutför Mini-OSCE
          </button>
        </div>
      )}
    </div>
  );
}
