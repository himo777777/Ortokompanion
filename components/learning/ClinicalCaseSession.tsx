'use client';

import React, { useState, memo } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { colors } from '@/lib/design-tokens';
import { StepAnswerInputSchema, safeValidate } from '@/lib/validation-schemas';
import {
  UnifiedClinicalCase,
  ClinicalCaseSessionProps,
  ClinicalCaseResults,
  ClinicalStepType,
} from '@/types/clinical-cases';
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
  User,
  Clock,
  XCircle,
} from 'lucide-react';

const STEP_ICONS: Record<ClinicalStepType, React.ReactNode> = {
  anamnes: <FileText className="w-5 h-5" />,
  differential: <Brain className="w-5 h-5" />,
  status: <Stethoscope className="w-5 h-5" />,
  investigation: <FlaskConical className="w-5 h-5" />,
  diagnosis: <CheckCircle className="w-5 h-5" />,
  treatment: <ArrowRight className="w-5 h-5" />,
};

const STEP_LABELS: Record<ClinicalStepType, string> = {
  anamnes: 'Anamnes',
  differential: 'Differentialdiagnostik',
  status: 'Klinisk undersökning',
  investigation: 'Utredning',
  diagnosis: 'Diagnos',
  treatment: 'Behandling',
};

function ClinicalCaseSession({
  caseData,
  userMasteryLevel = 50,
  onComplete,
  onClose,
}: ClinicalCaseSessionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [hintsRevealed, setHintsRevealed] = useState<Record<string, number>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());

  const isGuidedMode = caseData.mode === 'guided';
  const isScenarioMode = caseData.mode === 'scenario';

  // Guided mode state
  const currentStep = isGuidedMode && caseData.steps ? caseData.steps[currentStepIndex] : null;
  const isLastStep = isGuidedMode && caseData.steps ? currentStepIndex === caseData.steps.length - 1 : false;
  const currentAnswer = currentStep ? userAnswers[currentStep.id] || '' : '';
  const currentHintsShown = currentStep ? hintsRevealed[currentStep.id] || 0 : 0;

  // Adaptive scaffolding for hints (guided mode only)
  const maxHintsAvailable = userMasteryLevel < 30 ? 3 : userMasteryLevel < 60 ? 2 : 1;

  const allHints = currentStep
    ? [...(currentStep.examples || []), ...currentStep.hints]
    : [];

  // ==================== Handlers ====================

  const handleRevealHint = () => {
    if (!currentStep) return;
    if (currentHintsShown < Math.min(maxHintsAvailable, allHints.length)) {
      setHintsRevealed({
        ...hintsRevealed,
        [currentStep.id]: currentHintsShown + 1,
      });
    }
  };

  const handleAnswerChange = (value: string, questionId?: string) => {
    if (isGuidedMode && currentStep) {
      // Validate and sanitize for guided mode
      const validation = safeValidate(StepAnswerInputSchema, value);
      if (!validation.success) {
        console.warn('Invalid answer input:', validation.error.errors[0]?.message);
        return;
      }

      const sanitized = DOMPurify.sanitize(validation.data, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });

      setUserAnswers({
        ...userAnswers,
        [currentStep.id]: sanitized,
      });
    } else if (isScenarioMode && questionId) {
      // For scenario mode
      setUserAnswers({
        ...userAnswers,
        [questionId]: value,
      });
    }
  };

  const handleSubmitStep = () => {
    if (!currentStep) return;

    setCompletedSteps(new Set([...completedSteps, currentStep.id]));

    if (currentStep.feedback) {
      setShowFeedback(currentStep.feedback);
    } else {
      setTimeout(() => handleNextStep(), 500);
    }
  };

  const handleNextStep = () => {
    setShowFeedback(null);

    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleSubmitScenario = () => {
    setShowResults(true);
    // Calculate results after a brief delay
    setTimeout(() => handleComplete(), 100);
  };

  const handleComplete = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    let results: ClinicalCaseResults;

    if (isGuidedMode && caseData.steps) {
      const totalHints = Object.values(hintsRevealed).reduce((sum, count) => sum + count, 0);
      const baseScore = 100;
      const hintPenalty = totalHints * 10;
      const score = Math.max(baseScore - hintPenalty, 0);
      const xpEarned = Math.floor(score / 2);

      results = {
        caseId: caseData.id,
        mode: 'guided',
        stepsCompleted: completedSteps.size + 1,
        hintsUsed: totalHints,
        timeSpent,
        score,
        xpEarned,
      };
    } else if (isScenarioMode && caseData.questions) {
      const correctAnswers = caseData.questions.filter(
        (q) => q.correctAnswer && userAnswers[q.id] === q.correctAnswer
      ).length;
      const questionsAnswered = Object.keys(userAnswers).length;
      const score = Math.floor((correctAnswers / caseData.questions.length) * 100);
      const xpEarned = Math.floor(score / 2);

      results = {
        caseId: caseData.id,
        mode: 'scenario',
        questionsAnswered,
        correctAnswers,
        timeSpent,
        score,
        xpEarned,
      };
    } else {
      return; // Should never happen
    }

    onComplete?.(results);
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setUserAnswers({});
    setHintsRevealed({});
    setCompletedSteps(new Set());
    setShowFeedback(null);
    setShowResults(false);
  };

  const getStepColor = (type: ClinicalStepType) => {
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

  const getDifficultyLabel = () => {
    return caseData.difficulty === 'beginner'
      ? 'Nybörjare'
      : caseData.difficulty === 'intermediate'
      ? 'Mellannivå'
      : 'Avancerad';
  };

  const getDifficultyColor = () => {
    return caseData.difficulty === 'beginner'
      ? { bg: colors.success[100], text: colors.success[700] }
      : caseData.difficulty === 'intermediate'
      ? { bg: colors.warning[100], text: colors.warning[700] }
      : { bg: colors.error[100], text: colors.error[700] };
  };

  // ==================== Render ====================

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
                    backgroundColor: colors.primary[100],
                    color: colors.primary[700],
                  }}
                >
                  {caseData.domain}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: getDifficultyColor().bg,
                    color: getDifficultyColor().text,
                  }}
                >
                  {getDifficultyLabel()}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700"
                >
                  {isGuidedMode ? 'Guidat' : 'Scenario'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{caseData.title}</h1>

              {/* Patient Info */}
              {caseData.patient && (
                <div className="flex gap-4 text-sm text-gray-600 mb-2">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {caseData.patient.gender}, {caseData.patient.age} år
                  </span>
                  <span>•</span>
                  <span>{caseData.patient.complaint}</span>
                </div>
              )}

              <p className="text-gray-600">{caseData.initialPresentation}</p>
              {isScenarioMode && caseData.scenario && (
                <p className="text-gray-700 mt-2">{caseData.scenario}</p>
              )}
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
          {caseData.learningObjectives && caseData.learningObjectives.length > 0 && (
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
          )}
        </div>

        {/* Guided Mode Content */}
        {isGuidedMode && caseData.steps && currentStep && (
          <>
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap text-gray-900 ${
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
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            STEP_ICONS[step.type]
                          )}
                        </div>
                        <span className="text-xs font-medium">{step.title}</span>
                      </button>
                      {caseData.steps && index < caseData.steps.length - 1 && (
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
                  <p className="text-sm text-gray-600">{STEP_LABELS[currentStep.type]}</p>
                </div>
              </div>

              {/* Question */}
              <div className="mb-6">
                <p className="text-lg text-gray-800 mb-4 leading-relaxed">
                  {currentStep.question}
                </p>

                {/* Answer Input */}
                <textarea
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Skriv ditt svar här..."
                  className="w-full border border-gray-300 rounded-lg p-4 min-h-32 text-gray-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  disabled={showFeedback !== null}
                />
              </div>

              {/* Hints Section */}
              {currentHintsShown > 0 && (
                <div className="mb-6 space-y-3">
                  {allHints.slice(0, currentHintsShown).map((hint, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg"
                    >
                      <Lightbulb
                        className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-sm text-gray-700">{hint}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Feedback */}
              {showFeedback && (
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                  <p className="text-sm text-gray-600">{showFeedback}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!showFeedback ? (
                  <>
                    {currentHintsShown < Math.min(maxHintsAvailable, allHints.length) && (
                      <button
                        onClick={handleRevealHint}
                        className="px-6 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors font-medium flex items-center gap-2"
                      >
                        <Lightbulb className="w-5 h-5" />
                        Visa tips ({currentHintsShown}/{Math.min(maxHintsAvailable, allHints.length)})
                      </button>
                    )}
                    <button
                      onClick={handleSubmitStep}
                      disabled={!currentAnswer.trim()}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                      {isLastStep ? 'Slutför' : 'Nästa steg'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleNextStep}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    {isLastStep ? 'Se resultat' : 'Fortsätt'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Scenario Mode Content */}
        {isScenarioMode && caseData.questions && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Frågor</h3>
            <div className="space-y-6">
              {caseData.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-medium text-gray-800 mb-3">
                    {index + 1}. {question.question}
                  </p>

                  {question.options ? (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <label
                          key={option}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all text-gray-900 ${
                            userAnswers[question.id] === option
                              ? 'border-blue-500 bg-blue-50 text-blue-900'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          } ${
                            showResults && question.correctAnswer === option
                              ? 'border-green-500 bg-green-50 text-green-900'
                              : ''
                          } ${
                            showResults &&
                            userAnswers[question.id] === option &&
                            option !== question.correctAnswer
                              ? 'border-red-500 bg-red-50 text-red-900'
                              : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={userAnswers[question.id] === option}
                            onChange={(e) => handleAnswerChange(e.target.value, question.id)}
                            disabled={showResults}
                            className="w-4 h-4"
                          />
                          <span className="flex-1">{option}</span>
                          {showResults && question.correctAnswer === option && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {showResults &&
                            userAnswers[question.id] === option &&
                            option !== question.correctAnswer && (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={userAnswers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(e.target.value, question.id)}
                      disabled={showResults}
                      placeholder="Skriv ditt svar här..."
                      className="w-full p-3 border-2 border-gray-200 rounded-lg resize-none text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  )}

                  {showResults && (
                    <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <p className="text-sm font-medium text-gray-700 mb-1">Förklaring:</p>
                      <p className="text-sm text-gray-600">{question.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!showResults ? (
              <button
                onClick={handleSubmitScenario}
                disabled={Object.keys(userAnswers).length !== caseData.questions.length}
                className="mt-6 w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Skicka svar
              </button>
            ) : (
              <button
                onClick={handleRestart}
                className="mt-6 w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Gör om testet
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ClinicalCaseSession);
