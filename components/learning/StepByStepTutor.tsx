'use client';

import React, { useState } from 'react';
import { colors } from '@/lib/design-tokens';
import {
  ChevronRight,
  CheckCircle,
  Circle,
  Lightbulb,
  Brain,
  Stethoscope,
  FlaskConical,
  FileText,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export interface ClinicalStep {
  id: string;
  title: string;
  type: 'anamnes' | 'differential' | 'status' | 'investigation' | 'diagnosis' | 'treatment';
  question: string;
  hints: string[];
  correctAnswer?: string;
  feedback?: string;
  examples?: string[];
}

export interface StepByStepCase {
  id: string;
  title: string;
  domain: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  initialPresentation: string;
  steps: ClinicalStep[];
  learningObjectives: string[];
}

interface StepByStepTutorProps {
  caseData: StepByStepCase;
  userMasteryLevel?: number; // 0-100, affects scaffolding
  onComplete?: (results: {
    caseId: string;
    stepsCompleted: number;
    hintsUsed: number;
    timeSpent: number;
    score: number;
  }) => void;
  onClose?: () => void;
}

const STEP_ICONS: Record<ClinicalStep['type'], React.ReactNode> = {
  anamnes: <FileText className="w-5 h-5" />,
  differential: <Brain className="w-5 h-5" />,
  status: <Stethoscope className="w-5 h-5" />,
  investigation: <FlaskConical className="w-5 h-5" />,
  diagnosis: <CheckCircle className="w-5 h-5" />,
  treatment: <ArrowRight className="w-5 h-5" />,
};

export default function StepByStepTutor({
  caseData,
  userMasteryLevel = 50,
  onComplete,
  onClose,
}: StepByStepTutorProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [hintsRevealed, setHintsRevealed] = useState<Record<string, number>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  const currentStep = caseData.steps[currentStepIndex];
  const isLastStep = currentStepIndex === caseData.steps.length - 1;
  const currentAnswer = userAnswers[currentStep.id] || '';
  const currentHintsShown = hintsRevealed[currentStep.id] || 0;

  // Adaptive scaffolding: more hints available for lower mastery
  const maxHintsAvailable = userMasteryLevel < 30 ? 3 : userMasteryLevel < 60 ? 2 : 1;

  const handleRevealHint = () => {
    if (currentHintsShown < Math.min(maxHintsAvailable, currentStep.hints.length)) {
      setHintsRevealed({
        ...hintsRevealed,
        [currentStep.id]: currentHintsShown + 1,
      });
    }
  };

  const handleAnswerChange = (value: string) => {
    setUserAnswers({
      ...userAnswers,
      [currentStep.id]: value,
    });
  };

  const handleSubmitStep = () => {
    setCompletedSteps(new Set([...completedSteps, currentStep.id]));

    // Show feedback if available
    if (currentStep.feedback) {
      setShowFeedback(currentStep.feedback);
    } else {
      // Auto-advance if no feedback
      setTimeout(() => handleNextStep(), 500);
    }
  };

  const handleNextStep = () => {
    setShowFeedback(null);

    if (isLastStep) {
      // Calculate results
      const totalHints = Object.values(hintsRevealed).reduce((sum, count) => sum + count, 0);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const baseScore = 100;
      const hintPenalty = totalHints * 5;
      const score = Math.max(baseScore - hintPenalty, 0);

      onComplete?.({
        caseId: caseData.id,
        stepsCompleted: completedSteps.size + 1,
        hintsUsed: totalHints,
        timeSpent,
        score,
      });
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setUserAnswers({});
    setHintsRevealed({});
    setCompletedSteps(new Set());
    setShowFeedback(null);
  };

  const getStepColor = (type: ClinicalStep['type']) => {
    const colorMap = {
      anamnes: colors.primary[500],
      differential: colors.secondary[500],
      status: colors.success[500],
      investigation: colors.warning[500],
      diagnosis: colors.domain.tumör,
      treatment: colors.domain['axel-armbåge'],
    };
    return colorMap[type];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${colors.primary[100]}`,
                    color: colors.primary[700],
                  }}
                >
                  {caseData.domain}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor:
                      caseData.difficulty === 'beginner'
                        ? colors.success[100]
                        : caseData.difficulty === 'intermediate'
                        ? colors.warning[100]
                        : colors.error[100],
                    color:
                      caseData.difficulty === 'beginner'
                        ? colors.success[700]
                        : caseData.difficulty === 'intermediate'
                        ? colors.warning[700]
                        : colors.error[700],
                  }}
                >
                  {caseData.difficulty === 'beginner'
                    ? 'Nybörjare'
                    : caseData.difficulty === 'intermediate'
                    ? 'Mellannivå'
                    : 'Avancerad'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{caseData.title}</h1>
              <p className="text-gray-600">{caseData.initialPresentation}</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Learning Objectives */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Lärandemål:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {caseData.learningObjectives.map((objective, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span style={{ color: colors.primary[500] }}>•</span>
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              Steg {currentStepIndex + 1} av {caseData.steps.length}
            </p>
            <p className="text-sm text-gray-600">
              {completedSteps.size}/{caseData.steps.length} slutförda
            </p>
          </div>
          <div className="flex gap-2">
            {caseData.steps.map((step, index) => (
              <div
                key={step.id}
                className="flex-1 h-2 rounded-full transition-all"
                style={{
                  backgroundColor:
                    index < currentStepIndex
                      ? colors.success[500]
                      : index === currentStepIndex
                      ? colors.primary[500]
                      : colors.gray[200],
                }}
              />
            ))}
          </div>
        </div>

        {/* Step Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {caseData.steps.map((step, index) => {
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = index === currentStepIndex;
              const isPast = index < currentStepIndex;

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => {
                      if (isPast || isCompleted) {
                        setCurrentStepIndex(index);
                        setShowFeedback(null);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                      isCurrent
                        ? 'bg-blue-100 border-2 border-blue-500 text-blue-700'
                        : isCompleted
                        ? 'bg-green-50 border border-green-300 text-green-700 hover:bg-green-100'
                        : isPast
                        ? 'bg-gray-100 border border-gray-300 text-gray-600 hover:bg-gray-200'
                        : 'bg-gray-50 border border-gray-200 text-gray-400'
                    }`}
                    disabled={!isPast && !isCurrent && !isCompleted}
                  >
                    <div style={{ color: getStepColor(step.type) }}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : STEP_ICONS[step.type]}
                    </div>
                    <span className="text-xs font-medium">{step.title}</span>
                  </button>
                  {index < caseData.steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {/* Step Header */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${getStepColor(currentStep.type)}20` }}
            >
              <div style={{ color: getStepColor(currentStep.type) }}>
                {STEP_ICONS[currentStep.type]}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{currentStep.title}</h2>
              <p className="text-sm text-gray-600 capitalize">
                {currentStep.type === 'anamnes' && 'Anamnes'}
                {currentStep.type === 'differential' && 'Differentialdiagnostik'}
                {currentStep.type === 'status' && 'Klinisk undersökning'}
                {currentStep.type === 'investigation' && 'Utredning'}
                {currentStep.type === 'diagnosis' && 'Diagnos'}
                {currentStep.type === 'treatment' && 'Behandling'}
              </p>
            </div>
          </div>

          {/* Question */}
          <div className="mb-6">
            <p className="text-lg text-gray-800 mb-4 leading-relaxed">{currentStep.question}</p>

            {/* Examples (Socratic prompts) */}
            {currentStep.examples && currentStep.examples.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-blue-800 mb-2">Tänk på:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  {currentStep.examples.map((example, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span>•</span>
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Answer Input */}
            <textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Skriv ditt svar här..."
              className="w-full border border-gray-300 rounded-lg p-4 min-h-32 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              disabled={completedSteps.has(currentStep.id)}
            />
          </div>

          {/* Hints Section */}
          {currentStep.hints.length > 0 && !completedSteps.has(currentStep.id) && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">Ledtrådar:</p>
                <button
                  onClick={handleRevealHint}
                  disabled={currentHintsShown >= Math.min(maxHintsAvailable, currentStep.hints.length)}
                  className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Lightbulb className="w-4 h-4" />
                  Visa ledtråd ({currentHintsShown}/{Math.min(maxHintsAvailable, currentStep.hints.length)})
                </button>
              </div>

              {currentHintsShown > 0 && (
                <div className="space-y-2">
                  {currentStep.hints.slice(0, currentHintsShown).map((hint, i) => (
                    <div
                      key={i}
                      className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 animate-fadeIn"
                    >
                      <p className="text-sm text-yellow-800">
                        <span className="font-semibold">Ledtråd {i + 1}:</span> {hint}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 animate-fadeIn">
              <p className="text-sm font-semibold text-green-800 mb-2">Återkoppling:</p>
              <p className="text-sm text-green-700 leading-relaxed">{showFeedback}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Börja om
            </button>

            <div className="flex gap-3">
              {!completedSteps.has(currentStep.id) && (
                <button
                  onClick={handleSubmitStep}
                  disabled={!currentAnswer.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Skicka svar
                </button>
              )}

              {(showFeedback || completedSteps.has(currentStep.id)) && (
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  {isLastStep ? 'Slutför' : 'Nästa steg'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
