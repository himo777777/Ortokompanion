'use client';

import { useState, useEffect } from 'react';
import { ClinicalDecisionCase, DecisionNode } from '@/data/case-decision-trees';
import { Brain, CheckCircle, XCircle, AlertCircle, Lightbulb, Target, Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { analyzeDecisionMaking } from '@/lib/ai-service';
import { EducationLevel } from '@/types/education';

interface DecisionTreeCaseProps {
  caseStudy: ClinicalDecisionCase;
  userLevel: EducationLevel;
  onComplete: (params: {
    outcomeId: string;
    decisionPath: string[];
    timeSpent: number;
    xpEarned: number;
  }) => void;
  enableAI?: boolean;
}

export default function DecisionTreeCase({
  caseStudy,
  userLevel,
  onComplete,
  enableAI = true,
}: DecisionTreeCaseProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string>(caseStudy.startNodeId);
  const [decisionPath, setDecisionPath] = useState<string[]>([]);
  const [startTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const [finalOutcome, setFinalOutcome] = useState<any>(null);

  // AI analysis state
  const [aiAnalysis, setAiAnalysis] = useState<{
    reasoningQuality: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    strengths: string[];
    weaknesses: string[];
    specificFeedback: Array<{
      decision: string;
      feedback: string;
      improvement: string;
    }>;
    overallRecommendation: string;
  } | null>(null);
  const [loadingAIAnalysis, setLoadingAIAnalysis] = useState(false);

  // Get current node
  const currentNode = caseStudy.nodes[currentNodeId];

  // Handle decision
  const handleDecision = (choiceId: string, nextNodeId: string | null) => {
    // Record decision
    setDecisionPath([...decisionPath, choiceId]);

    if (nextNodeId) {
      // Continue to next node
      setCurrentNodeId(nextNodeId);
    } else {
      // Reached outcome (terminal node)
      const outcomeNode = Object.values(caseStudy.nodes).find(n => n.isTerminal && n.id === currentNodeId);
      if (outcomeNode && outcomeNode.outcome) {
        // Create outcome object from node data
        const outcome = {
          id: outcomeNode.id,
          quality: outcomeNode.outcome.type === 'success' ? 'optimal' :
                   outcomeNode.outcome.type === 'suboptimal' ? 'acceptable' : 'poor',
          ...outcomeNode.outcome
        };
        setFinalOutcome(outcome as any);
        setIsComplete(true);

        // Load AI analysis if enabled
        if (enableAI) {
          loadAIAnalysis([...decisionPath, choiceId]);
        }

        // Calculate XP
        const baseXP = 50;
        const qualityMultiplier = outcome.quality === 'optimal' ? 1.5 : outcome.quality === 'acceptable' ? 1.0 : 0.5;
        const xpEarned = Math.round(baseXP * qualityMultiplier);

        // Call onComplete after analysis loads
        setTimeout(() => {
          onComplete({
            outcomeId: choiceId,
            decisionPath: [...decisionPath, choiceId],
            timeSpent: Math.floor((Date.now() - startTime) / 1000),
            xpEarned,
          });
        }, 3000);
      }
    }
  };

  // Load AI analysis of clinical reasoning
  const loadAIAnalysis = async (fullPath: string[]) => {
    setLoadingAIAnalysis(true);
    try {
      const result = await analyzeDecisionMaking({
        caseId: caseStudy.id,
        userDecisions: fullPath.map((decision) => ({
          nodeId: decision,
          optionChosen: decision,
          isOptimal: true, // TODO: Track if decision was optimal
          timeSpent: 0, // TODO: Track time spent on each decision
        })),
        caseContext: caseStudy.introduction,
      });
      setAiAnalysis(result);
    } catch (error) {
      console.error('Failed to generate AI analysis:', error);
      setAiAnalysis(null);
    } finally {
      setLoadingAIAnalysis(false);
    }
  };

  // Get quality color
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'optimal':
        return 'green';
      case 'acceptable':
        return 'yellow';
      case 'suboptimal':
        return 'orange';
      case 'dangerous':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Get reasoning quality color
  const getReasoningQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'green';
      case 'good':
        return 'blue';
      case 'needs-improvement':
        return 'orange';
      case 'poor':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (!currentNode && !isComplete) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-gray-600">Laddar fall...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            {caseStudy.title}
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Domän: <span className="font-medium text-gray-900">{caseStudy.domain}</span></span>
          <span>•</span>
          <span>Nivå: <span className="font-medium text-gray-900">{caseStudy.level}</span></span>
          <span>•</span>
          <span>Beslut: <span className="font-medium text-gray-900">{decisionPath.length}</span></span>
        </div>
      </div>

      {/* Scenario */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Kliniskt Scenario
        </h2>
        <p className="text-gray-800 leading-relaxed">{caseStudy.introduction}</p>
      </div>

      {/* Current Decision Node */}
      {!isComplete && currentNode && (
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg mb-6">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h3 className="font-semibold text-gray-900">
              {currentNode.nodeType === 'scenario' && '📋 Scenario'}
              {currentNode.nodeType === 'decision' && '🤔 Beslut'}
              {currentNode.nodeType === 'outcome' && '✅ Resultat'}
            </h3>
          </div>

          <div className="p-6">
            <p className="text-lg text-gray-800 mb-6">{currentNode.decision || currentNode.scenario}</p>

            {(currentNode.clinicalFindings || currentNode.imagingFindings || currentNode.labResults) && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Klinisk Information</p>
                    {currentNode.clinicalFindings && (
                      <div className="text-sm text-blue-800 mb-2">
                        <strong>Kliniska fynd:</strong> {currentNode.clinicalFindings.join(', ')}
                      </div>
                    )}
                    {currentNode.imagingFindings && (
                      <div className="text-sm text-blue-800 mb-2">
                        <strong>Bilddiagnostik:</strong> {currentNode.imagingFindings.join(', ')}
                      </div>
                    )}
                    {currentNode.labResults && (
                      <div className="text-sm text-blue-800">
                        <strong>Lab:</strong> {currentNode.labResults.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {currentNode.options?.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleDecision(choice.id, choice.nextNodeId || null)}
                  className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center font-semibold text-gray-700 group-hover:text-blue-700">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{choice.text}</p>
                      {choice.clinicalReasoning && (
                        <p className="text-sm text-gray-600 mt-1 italic">💭 {choice.clinicalReasoning}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Outcome & AI Analysis */}
      {isComplete && finalOutcome && (
        <div className="space-y-6">
          {/* Outcome Card */}
          <div className={`bg-gradient-to-br rounded-lg border-2 p-6 ${
            finalOutcome.quality === 'optimal'
              ? 'from-green-50 to-emerald-50 border-green-300'
              : finalOutcome.quality === 'acceptable'
              ? 'from-blue-50 to-cyan-50 border-blue-300'
              : finalOutcome.quality === 'suboptimal'
              ? 'from-orange-50 to-yellow-50 border-orange-300'
              : 'from-red-50 to-pink-50 border-red-300'
          }`}>
            <div className="flex items-start gap-3 mb-4">
              {finalOutcome.quality === 'optimal' && <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />}
              {finalOutcome.quality === 'acceptable' && <CheckCircle className="w-8 h-8 text-blue-600 flex-shrink-0" />}
              {finalOutcome.quality === 'suboptimal' && <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0" />}
              {finalOutcome.quality === 'dangerous' && <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`text-2xl font-bold ${
                    getQualityColor(finalOutcome.quality) === 'green' ? 'text-green-900' :
                    getQualityColor(finalOutcome.quality) === 'yellow' ? 'text-yellow-900' :
                    getQualityColor(finalOutcome.quality) === 'orange' ? 'text-orange-900' :
                    'text-red-900'
                  }`}>
                    {finalOutcome.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    finalOutcome.quality === 'optimal'
                      ? 'bg-green-200 text-green-900'
                      : finalOutcome.quality === 'acceptable'
                      ? 'bg-blue-200 text-blue-900'
                      : finalOutcome.quality === 'suboptimal'
                      ? 'bg-orange-200 text-orange-900'
                      : 'bg-red-200 text-red-900'
                  }`}>
                    {finalOutcome.quality === 'optimal' ? 'Optimalt' :
                     finalOutcome.quality === 'acceptable' ? 'Acceptabelt' :
                     finalOutcome.quality === 'suboptimal' ? 'Suboptimalt' :
                     'Farligt'}
                  </span>
                </div>
                <p className={`text-sm mb-4 ${
                  getQualityColor(finalOutcome.quality) === 'green' ? 'text-green-800' :
                  getQualityColor(finalOutcome.quality) === 'yellow' ? 'text-yellow-800' :
                  getQualityColor(finalOutcome.quality) === 'orange' ? 'text-orange-800' :
                  'text-red-800'
                }`}>
                  {finalOutcome.description}
                </p>

                {/* Explanation */}
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Förklaring</h4>
                  <p className="text-gray-800 text-sm leading-relaxed">{finalOutcome.explanation}</p>
                </div>

                {/* Teaching Points */}
                {finalOutcome.teachingPoints && finalOutcome.teachingPoints.length > 0 && (
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      Viktiga lärdomar
                    </h4>
                    <ul className="space-y-1">
                      {finalOutcome.teachingPoints.map((point: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-800 flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Clinical Reasoning Analysis */}
          {enableAI && loadingAIAnalysis && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <div className="flex items-center gap-3 text-purple-700">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-medium">AI analyserar ditt kliniska beslutsfattande...</span>
              </div>
            </div>
          )}

          {enableAI && aiAnalysis && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <Sparkles className="w-7 h-7 text-purple-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-purple-900 mb-1">
                    AI-analys av kliniskt resonemang
                  </h3>
                  <p className="text-sm text-purple-700">Personlig feedback baserad på dina beslut</p>
                </div>
                <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                  getReasoningQualityColor(aiAnalysis.reasoningQuality) === 'green'
                    ? 'bg-green-200 text-green-900'
                    : getReasoningQualityColor(aiAnalysis.reasoningQuality) === 'blue'
                    ? 'bg-blue-200 text-blue-900'
                    : getReasoningQualityColor(aiAnalysis.reasoningQuality) === 'orange'
                    ? 'bg-orange-200 text-orange-900'
                    : 'bg-red-200 text-red-900'
                }`}>
                  {aiAnalysis.reasoningQuality === 'excellent' ? 'Utmärkt' :
                   aiAnalysis.reasoningQuality === 'good' ? 'Bra' :
                   aiAnalysis.reasoningQuality === 'needs-improvement' ? 'Kan förbättras' :
                   'Behöver arbete'}
                </span>
              </div>

              {/* Strengths */}
              {aiAnalysis.strengths.length > 0 && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Styrkor i ditt resonemang
                  </h4>
                  <ul className="space-y-2">
                    {aiAnalysis.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-gray-800 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {aiAnalysis.weaknesses.length > 0 && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Förbättringsområden
                  </h4>
                  <ul className="space-y-2">
                    {aiAnalysis.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-sm text-gray-800 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specific Feedback */}
              {aiAnalysis.specificFeedback.length > 0 && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Steg-för-steg feedback</h4>
                  <div className="space-y-3">
                    {aiAnalysis.specificFeedback.map((feedback, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border-l-4 bg-blue-50 border-blue-500"
                      >
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Beslut: {feedback.decision}
                        </p>
                        <p className="text-sm text-gray-700 mb-2">{feedback.feedback}</p>
                        <p className="text-sm text-blue-800">
                          <strong>Förbättring:</strong> {feedback.improvement}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Recommendation */}
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4 border-2 border-blue-300">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-700" />
                  Rekommendation för fortsatt utveckling
                </h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  {aiAnalysis.overallRecommendation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
