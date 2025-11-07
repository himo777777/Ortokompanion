/**
 * Zod Schemas for AI Response Validation
 * Ensures type safety and runtime validation of all AI responses
 */

import { z } from 'zod';

/**
 * Personalized Explanation Schema
 */
export const PersonalizedExplanationSchema = z.object({
  explanation: z.string().min(10).max(1000),
  keyTakeaway: z.string().min(5).max(200),
  relatedConcepts: z.array(z.string()).min(0).max(10),
  studyRecommendation: z.string().min(5).max(300),
});

export type PersonalizedExplanation = z.infer<typeof PersonalizedExplanationSchema>;

/**
 * Knowledge Gap Analysis Schema
 */
export const KnowledgeGapSchema = z.object({
  gaps: z.array(
    z.object({
      topic: z.string(),
      severity: z.enum(['critical', 'moderate', 'minor']),
      evidence: z.array(z.string()),
      recommendation: z.string(),
    })
  ),
  strengths: z.array(z.string()),
  overallAssessment: z.string(),
  priorityStudyTopics: z.array(z.string()),
});

export type KnowledgeGap = z.infer<typeof KnowledgeGapSchema>;

/**
 * Adaptive Hints Schema
 */
export const AdaptiveHintsSchema = z.object({
  hints: z.tuple([z.string(), z.string(), z.string()]),
  teachingPoints: z.array(z.string()),
  mnemonicOrTrick: z.string().optional(),
});

export type AdaptiveHints = z.infer<typeof AdaptiveHintsSchema>;

/**
 * AI Tutor Response Schema
 */
export const AITutorResponseSchema = z.object({
  response: z.string(),
  suggestedQuestions: z.array(z.string()).optional(),
  relatedContent: z.array(z.string()).optional(),
});

export type AITutorResponse = z.infer<typeof AITutorResponseSchema>;

/**
 * Follow-up Questions Schema
 */
export const FollowUpQuestionsSchema = z.object({
  questions: z.array(z.string()).min(1).max(5),
});

export type FollowUpQuestions = z.infer<typeof FollowUpQuestionsSchema>;

/**
 * SRS Optimization Schema
 * ENHANCED: Now includes goal-awareness and priority scoring
 */
export const SRSOptimizationSchema = z.object({
  predictions: z.array(
    z.object({
      cardId: z.string(),
      forgettingProbability: z.number().min(0).max(1),
      recommendedReviewDate: z.string(), // ISO date string
      reason: z.string(),
      linkedGoalId: z.string().optional(),
      linkedGoalTitle: z.string().optional(),
      priorityScore: z.number().min(0).max(100),
    })
  ),
  optimizationSuggestions: z.array(z.string()),
  goalFocusedReview: z.array(z.string()),
});

export type SRSOptimization = z.infer<typeof SRSOptimizationSchema>;

/**
 * Decision Making Analysis Schema
 */
export const DecisionMakingAnalysisSchema = z.object({
  reasoningQuality: z.enum(['excellent', 'good', 'needs-improvement', 'poor']),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  specificFeedback: z.array(
    z.object({
      decision: z.string(),
      feedback: z.string(),
      improvement: z.string(),
    })
  ),
  overallRecommendation: z.string(),
});

export type DecisionMakingAnalysis = z.infer<typeof DecisionMakingAnalysisSchema>;

/**
 * Study Plan Schema
 */
export const StudyPlanSchema = z.object({
  weeklyPlan: z.array(
    z.object({
      day: z.number().min(1).max(7),
      activities: z.array(
        z.object({
          type: z.enum(['questions', 'cases', 'reading', 'review']),
          domain: z.string(),
          estimatedTime: z.number(),
          priority: z.enum(['high', 'medium', 'low']),
          goal: z.string(),
        })
      ),
    })
  ),
  milestones: z.array(
    z.object({
      week: z.number(),
      goal: z.string(),
      successCriteria: z.string(),
    })
  ),
  recommendations: z.array(z.string()),
});

export type StudyPlan = z.infer<typeof StudyPlanSchema>;

/**
 * Performance Insights Schema
 */
export const PerformanceInsightsSchema = z.object({
  insights: z.array(z.string()).min(1).max(10),
  encouragement: z.string(),
  recommendations: z.array(z.string()),
  nextMilestone: z.string(),
  estimatedTimeToMilestone: z.string(),
});

export type PerformanceInsights = z.infer<typeof PerformanceInsightsSchema>;

/**
 * Specialist Readiness Assessment Schema
 * NEW: Comprehensive readiness evaluation for specialist exam
 */
export const SpecialistReadinessSchema = z.object({
  overallReadiness: z.number().min(0).max(100),
  goalCompletion: z.array(
    z.object({
      goalId: z.string(),
      goalTitle: z.string(),
      completionPercentage: z.number().min(0).max(100),
      assessmentStatus: z.enum(['klarad', 'delvis', 'ej-påbörjad']),
      estimatedTimeToCompletion: z.string(),
      priority: z.enum(['kritisk', 'hög', 'medel', 'låg']),
    })
  ),
  strongestDomains: z.array(z.string()),
  weakestDomains: z.array(z.string()),
  examPrediction: z.object({
    passLikelihood: z.number().min(0).max(100),
    criticalGaps: z.array(z.string()),
    recommendedFocus: z.array(z.string()),
    estimatedReadyDate: z.string().optional(),
  }),
  personalizedAdvice: z.string(),
  milestones: z.array(
    z.object({
      title: z.string(),
      deadline: z.string(),
      requiredActions: z.array(z.string()),
    })
  ),
});

export type SpecialistReadiness = z.infer<typeof SpecialistReadinessSchema>;

/**
 * Generic AI API Response Schema (wrapper from our API)
 */
export const AIAPIResponseSchema = z.object({
  content: z.string(),
  error: z.string().optional(),
});

export type AIAPIResponse = z.infer<typeof AIAPIResponseSchema>;
