/**
 * TutorMode Generator Service
 *
 * Adds TutorMode content to existing questions that lack it
 * using AI to generate progressive hints, common mistakes, teaching points, and mnemonics.
 */

import { z } from 'zod';
import { EducationLevel } from '@/types/education';
import { Domain } from '@/types/onboarding';
import { DifficultyBand } from '@/types/progression';
import { MCQQuestion } from '@/data/questions';
import OpenAI from 'openai';
import {
  TUTORMODE_GENERATOR_SYSTEM_PROMPT,
  buildTutorModePrompt,
} from '@/lib/generation-prompts';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const TutorModeSchema = z.object({
  hints: z.tuple([z.string(), z.string(), z.string()]),
  commonMistakes: z.array(z.string()).optional(),
  teachingPoints: z.array(z.string()).optional(),
  mnemonicOrTrick: z.string().optional(),
});

export type TutorModeContent = z.infer<typeof TutorModeSchema>;

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

/**
 * Generate TutorMode content for a question
 */
export async function generateTutorMode(
  question: MCQQuestion
): Promise<TutorModeContent> {
  console.log(`🎓 Generating TutorMode for ${question.id}...`);

  // Build the prompt
  const userPrompt = buildTutorModePrompt({
    id: question.id,
    question: question.question,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    domain: question.domain,
    level: question.level,
    band: question.band,
  });

  // Make OpenAI API request
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: TUTORMODE_GENERATOR_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error(`TutorMode generation failed for ${question.id}: No response from OpenAI`);
  }

  // Parse and validate response
  const parsed = JSON.parse(content);
  const validated = TutorModeSchema.parse(parsed);

  console.log(`✅ TutorMode generated for ${question.id}`);

  return validated;
}

// ============================================================================
// BATCH GENERATION
// ============================================================================

/**
 * Generate TutorMode for multiple questions
 */
export async function generateTutorModeBatch(
  questions: MCQQuestion[]
): Promise<Array<{
  questionId: string;
  tutorMode: TutorModeContent | null;
  error?: string;
}>> {
  console.log(`📚 Generating TutorMode for ${questions.length} questions...`);

  const results: Array<{
    questionId: string;
    tutorMode: TutorModeContent | null;
    error?: string;
  }> = [];

  for (const question of questions) {
    try {
      const tutorMode = await generateTutorMode(question);
      results.push({
        questionId: question.id,
        tutorMode,
      });

      // Rate limiting: 1 request per 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Failed to generate TutorMode for ${question.id}:`, error);
      results.push({
        questionId: question.id,
        tutorMode: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  const successCount = results.filter(r => r.tutorMode !== null).length;
  const failureCount = results.filter(r => r.tutorMode === null).length;

  console.log(`✅ Generated ${successCount} TutorModes successfully`);
  if (failureCount > 0) {
    console.log(`⚠️  Failed to generate ${failureCount} TutorModes`);
  }

  return results;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate TutorMode content quality
 */
export function validateTutorMode(tutorMode: TutorModeContent): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Hints validation
  if (!tutorMode.hints || tutorMode.hints.length !== 3) {
    errors.push('Must have exactly 3 hints');
  } else {
    tutorMode.hints.forEach((hint, i) => {
      if (hint.length < 20) {
        warnings.push(`Hint ${i + 1} is very short (<20 chars)`);
      }
      // Check for question-style hints (bad practice)
      if (hint.includes('?') && hint.trim().endsWith('?')) {
        warnings.push(`Hint ${i + 1} appears to be a question - should be a statement`);
      }
      // Check for vague hints
      if (hint.toLowerCase().includes('tänk på') || hint.toLowerCase().includes('kom ihåg')) {
        warnings.push(`Hint ${i + 1} may be too vague ("Tänk på..." pattern)`);
      }
    });
  }

  // Common mistakes validation
  if (!tutorMode.commonMistakes || tutorMode.commonMistakes.length < 3) {
    warnings.push('Should have at least 3 common mistakes');
  } else if (tutorMode.commonMistakes) {
    tutorMode.commonMistakes.forEach((mistake, i) => {
      if (mistake.length < 30) {
        warnings.push(`Common mistake ${i + 1} is very short (<30 chars)`);
      }
    });
  }

  // Teaching points validation
  if (!tutorMode.teachingPoints || tutorMode.teachingPoints.length < 3) {
    warnings.push('Should have at least 3 teaching points');
  } else if (tutorMode.teachingPoints.length > 5) {
    warnings.push('Teaching points should be 3-5 items (currently >5)');
  } else if (tutorMode.teachingPoints) {
    tutorMode.teachingPoints.forEach((point, i) => {
      if (point.length < 15) {
        warnings.push(`Teaching point ${i + 1} is very short (<15 chars)`);
      }
      if (point.length > 200) {
        warnings.push(`Teaching point ${i + 1} is very long (>200 chars) - consider breaking it down`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Find questions missing TutorMode
 */
export function findQuestionsWithoutTutorMode(
  questions: MCQQuestion[]
): MCQQuestion[] {
  return questions.filter(q => !q.tutorMode);
}

/**
 * Find questions with incomplete TutorMode
 */
export function findQuestionsWithIncompleteTutorMode(
  questions: MCQQuestion[]
): Array<{
  question: MCQQuestion;
  issues: string[];
}> {
  return questions
    .filter(q => q.tutorMode)
    .map(q => ({
      question: q,
      issues: [] as string[],
    }))
    .map(({ question, issues }) => {
      if (!question.tutorMode!.hints || question.tutorMode!.hints.length !== 3) {
        issues.push('Missing or incorrect number of hints');
      }
      if (!question.tutorMode!.commonMistakes || question.tutorMode!.commonMistakes.length < 3) {
        issues.push('Missing or insufficient common mistakes');
      }
      if (!question.tutorMode!.teachingPoints || question.tutorMode!.teachingPoints.length < 3) {
        issues.push('Missing or insufficient teaching points');
      }
      return { question, issues };
    })
    .filter(({ issues }) => issues.length > 0);
}

/**
 * Estimate time to generate TutorMode for questions
 */
export function estimateTutorModeTime(questionCount: number): {
  aiGenerationTime: number;  // seconds
  totalTimeWithRateLimit: number;  // seconds
  estimatedCost: number;  // USD
} {
  // Each TutorMode generation takes ~3 seconds
  const aiGenerationTime = questionCount * 3;

  // With 2-second rate limiting between requests
  const totalTimeWithRateLimit = (questionCount * 3) + ((questionCount - 1) * 2);

  // Cost estimation (gpt-4o-mini)
  const avgInputTokens = 600;   // Question + explanation + options
  const avgOutputTokens = 400;  // TutorMode content
  const inputCostPer1M = 0.150;
  const outputCostPer1M = 0.600;

  const totalInputTokens = questionCount * avgInputTokens;
  const totalOutputTokens = questionCount * avgOutputTokens;

  const inputCost = (totalInputTokens / 1_000_000) * inputCostPer1M;
  const outputCost = (totalOutputTokens / 1_000_000) * outputCostPer1M;
  const estimatedCost = inputCost + outputCost;

  return {
    aiGenerationTime,
    totalTimeWithRateLimit,
    estimatedCost,
  };
}

/**
 * Generate summary report for TutorMode batch
 */
export function generateTutorModeReport(
  results: Array<{
    questionId: string;
    tutorMode: TutorModeContent | null;
    error?: string;
  }>
): {
  totalQuestions: number;
  successCount: number;
  failureCount: number;
  qualityReport: {
    perfectCount: number;
    hasWarningsCount: number;
    hasErrorsCount: number;
  };
  failedQuestions: string[];
} {
  const totalQuestions = results.length;
  const successCount = results.filter(r => r.tutorMode !== null).length;
  const failureCount = results.filter(r => r.tutorMode === null).length;

  // Validate quality
  const validations = results
    .filter(r => r.tutorMode !== null)
    .map(r => ({
      questionId: r.questionId,
      ...validateTutorMode(r.tutorMode!),
    }));

  const perfectCount = validations.filter(v => v.valid && v.warnings.length === 0).length;
  const hasWarningsCount = validations.filter(v => v.valid && v.warnings.length > 0).length;
  const hasErrorsCount = validations.filter(v => !v.valid).length;

  const failedQuestions = results
    .filter(r => r.tutorMode === null)
    .map(r => r.questionId);

  return {
    totalQuestions,
    successCount,
    failureCount,
    qualityReport: {
      perfectCount,
      hasWarningsCount,
      hasErrorsCount,
    },
    failedQuestions,
  };
}
