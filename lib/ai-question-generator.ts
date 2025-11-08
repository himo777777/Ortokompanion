/**
 * AI Question Generator Service
 *
 * Uses OpenAI API to generate medical questions with TutorMode
 * based on structured prompts and verified sources.
 */

import { z } from 'zod';
import { EducationLevel } from '@/types/education';
import { Domain } from '@/types/onboarding';
import { DifficultyBand } from '@/types/progression';
import { MCQQuestion } from '@/data/questions';
import { SocialstyrelseMål } from '@/data/socialstyrelsen-goals';
import { SourceReference } from '@/types/verification';
import { VERIFIED_SOURCES } from '@/data/verified-sources';
import OpenAI from 'openai';
import {
  QUESTION_GENERATOR_SYSTEM_PROMPT,
  buildQuestionGenerationPrompt,
} from '@/lib/generation-prompts';
import { toCompetency } from '@/lib/ai-utils';
import { contentVersioning } from '@/lib/content-versioning';
import { logger } from './logger';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create a Set of valid source IDs for fast lookup during validation
const VALID_SOURCE_IDS = new Set(Object.keys(VERIFIED_SOURCES));

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const TutorModeSchema = z.object({
  hints: z.tuple([z.string(), z.string(), z.string()]),
  commonMistakes: z.array(z.string()).optional(),
  teachingPoints: z.array(z.string()).optional(),
  mnemonicOrTrick: z.string().optional(),
});

const GeneratedQuestionSchema = z.object({
  id: z.string(),
  domain: z.string(),
  level: z.string(),
  band: z.enum(['A', 'B', 'C', 'D', 'E']),
  question: z.string().min(50),
  options: z.array(z.string()).length(4),
  correctAnswer: z.string(),
  explanation: z.string().min(100),
  competency: z.string(),
  tags: z.array(z.string()).min(3).max(5),
  references: z.array(z.string()).min(2),
  relatedGoals: z.array(z.string()).min(1),
  tutorMode: TutorModeSchema,
});

const QuestionBatchSchema = z.array(GeneratedQuestionSchema);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface QuestionGenerationParams {
  domain: Domain;
  level: EducationLevel;
  band: DifficultyBand;
  count: number;
  sources: SourceReference[];
  goals: SocialstyrelseMål[];
  startId?: number;
}

export interface QuestionGenerationResult {
  questions: MCQQuestion[];
  metadata: {
    domain: Domain;
    level: EducationLevel;
    band: DifficultyBand;
    count: number;
    timestamp: string;
    model: string;
  };
}

export interface GenerationError {
  code: string;
  message: string;
  details?: unknown;
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

/**
 * Generate a batch of questions using AI
 */
export async function generateQuestionBatch(
  params: QuestionGenerationParams
): Promise<QuestionGenerationResult> {
  const {
    domain,
    level,
    band,
    count,
    sources,
    goals,
    startId = 1,
  } = params;

  logger.info('Generating questions with AI', {
    domain,
    level,
    band,
    count,
    sourcesCount: sources.length
  });

  // Build the generation prompt
  const userPrompt = buildQuestionGenerationPrompt({
    domain,
    level,
    band,
    count,
    sources,
    goals,
    startId,
  });

  // Make OpenAI API request
  // gpt-4o-mini max: 16384 tokens, so cap at ~3000 per question to stay safe
  const maxTokens = Math.min(3000 * count, 16000);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: QUESTION_GENERATOR_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  // Parse and validate response
  const parsed = JSON.parse(content);

  // Handle both array and object responses (OpenAI json_object mode returns an object)
  const questionsArray = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || []);
  const validated = QuestionBatchSchema.parse(questionsArray);

  // Transform to MCQQuestion format
  type Competency = 'medicinsk-kunskap' | 'klinisk-färdighet' | 'kommunikation' | 'professionalism' | 'samverkan' | 'utveckling';

  const questions: MCQQuestion[] = validated.map((q: z.infer<typeof GeneratedQuestionSchema>) => {
    // Create source version snapshots for content versioning
    const sourceVersionSnapshots = q.references.map((sourceId) => {
      const source = VERIFIED_SOURCES[sourceId];
      return contentVersioning.createSourceSnapshot(
        sourceId,
        source?.title || sourceId,
        source?.year?.toString() || '2024',
        source?.publicationDate || new Date()
      );
    });

    // Create initial content version
    contentVersioning.createContentVersion(
      q.id,
      'question',
      [],
      sourceVersionSnapshots,
      'AI-generated content'
    );

    return {
      id: q.id,
      domain: q.domain as Domain,
      level: q.level as EducationLevel,
      band: q.band,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      competency: (toCompetency(q.competency) || 'medicinsk-kunskap') as Competency,  // Use validated competency with fallback
      tags: q.tags,
      references: q.references,
      relatedGoals: q.relatedGoals,
      tutorMode: q.tutorMode,
      // Version tracking fields
      contentVersion: '1.0.0',
      sourceVersions: sourceVersionSnapshots.map((snapshot) => ({
        sourceId: snapshot.sourceId,
        version: snapshot.versionAtTime,
        publicationDate: snapshot.publicationDate,
      })),
      lastContentUpdate: new Date(),
      needsReview: false,
    };
  });

  logger.info('Successfully generated questions', {
    count: questions.length,
    domain,
    band
  });

  return {
    questions,
    metadata: {
      domain,
      level,
      band,
      count: questions.length,
      timestamp: new Date().toISOString(),
      model: 'gpt-4o-mini',
    },
  };
}

// ============================================================================
// BATCH GENERATION WITH BAND DISTRIBUTION
// ============================================================================

/**
 * Generate multiple questions with specified band distribution
 */
export async function generateWithBandDistribution(params: {
  domain: Domain;
  level: EducationLevel;
  bandDistribution: Record<DifficultyBand, number>;
  sources: SourceReference[];
  goals: SocialstyrelseMål[];
  startId?: number;
}): Promise<QuestionGenerationResult> {
  const { domain, level, bandDistribution, sources, goals, startId = 1 } = params;

  const totalCount = Object.values(bandDistribution).reduce((sum, count) => sum + count, 0);
  logger.info('Generating questions across multiple difficulty bands', {
    domain,
    level,
    totalCount,
    bandDistribution
  });

  const allQuestions: MCQQuestion[] = [];
  let currentId = startId;

  // Generate for each band
  for (const [band, count] of Object.entries(bandDistribution) as [DifficultyBand, number][]) {
    if (count === 0) continue;

    logger.debug('Generating questions for band', { band, count });

    const result = await generateQuestionBatch({
      domain,
      level,
      band,
      count,
      sources,
      goals,
      startId: currentId,
    });

    allQuestions.push(...result.questions);
    currentId += count;

    // Rate limiting: wait 2 seconds between batches
    if (count > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  logger.info('Completed multi-band question generation', {
    totalGenerated: allQuestions.length
  });

  return {
    questions: allQuestions,
    metadata: {
      domain,
      level,
      band: 'A' as DifficultyBand,  // Mixed bands
      count: allQuestions.length,
      timestamp: new Date().toISOString(),
      model: 'gpt-4o-mini',
    },
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate generated question structure
 */
export function validateGeneratedQuestion(question: MCQQuestion): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!question.id) errors.push('Missing id');
  if (!question.question) errors.push('Missing question text');
  if (!question.options || question.options.length !== 4) {
    errors.push('Must have exactly 4 options');
  }
  if (!question.correctAnswer) errors.push('Missing correctAnswer');
  if (!question.explanation) errors.push('Missing explanation');

  // Correct answer validation
  if (question.correctAnswer && question.options) {
    if (!question.options.includes(question.correctAnswer)) {
      errors.push('correctAnswer must match one of the options exactly');
    }
  }

  // References validation
  if (!question.references || question.references.length < 2) {
    errors.push('Must have at least 2 references');
  } else {
    // Validate that all reference IDs exist in VERIFIED_SOURCES
    const invalidRefs = question.references.filter(ref => !VALID_SOURCE_IDS.has(ref));
    if (invalidRefs.length > 0) {
      errors.push(`HALLUCINATED SOURCES DETECTED: ${invalidRefs.join(', ')} - these IDs do not exist in verified-sources.ts`);
    }
  }

  // Related goals
  if (!question.relatedGoals || question.relatedGoals.length < 1) {
    warnings.push('Should have at least 1 related goal');
  }

  // TutorMode
  if (!question.tutorMode) {
    warnings.push('Missing tutorMode');
  } else {
    if (!question.tutorMode.hints || question.tutorMode.hints.length !== 3) {
      errors.push('tutorMode.hints must have exactly 3 items');
    }
    if (!question.tutorMode.commonMistakes || question.tutorMode.commonMistakes.length < 3) {
      warnings.push('tutorMode.commonMistakes should have at least 3 items');
    }
    if (!question.tutorMode.teachingPoints || question.tutorMode.teachingPoints.length < 3) {
      warnings.push('tutorMode.teachingPoints should have at least 3 items');
    }
  }

  // Length checks
  if (question.question && question.question.length < 50) {
    warnings.push('Question text is very short (<50 chars)');
  }
  if (question.explanation && question.explanation.length < 100) {
    warnings.push('Explanation is very short (<100 chars)');
  }

  // Tag count
  if (question.tags && (question.tags.length < 3 || question.tags.length > 5)) {
    warnings.push('Should have 3-5 tags');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate entire batch
 */
export function validateQuestionBatch(questions: MCQQuestion[]): {
  validCount: number;
  invalidCount: number;
  results: Array<{
    questionId: string;
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>;
} {
  const results = questions.map(q => ({
    questionId: q.id,
    ...validateGeneratedQuestion(q),
  }));

  const validCount = results.filter(r => r.valid).length;
  const invalidCount = results.filter(r => !r.valid).length;

  return {
    validCount,
    invalidCount,
    results,
  };
}

// ============================================================================
// COST ESTIMATION
// ============================================================================

/**
 * Estimate cost for generating questions
 */
export function estimateGenerationCost(params: {
  count: number;
  avgPromptTokens?: number;
  avgCompletionTokens?: number;
}): {
  estimatedCost: number;
  inputCost: number;
  outputCost: number;
  breakdown: string;
} {
  const { count, avgPromptTokens = 2000, avgCompletionTokens = 1000 } = params;

  // gpt-4o-mini pricing (Nov 2024)
  const INPUT_COST_PER_1M = 0.150;   // $0.150 per 1M input tokens
  const OUTPUT_COST_PER_1M = 0.600;  // $0.600 per 1M output tokens

  const totalInputTokens = count * avgPromptTokens;
  const totalOutputTokens = count * avgCompletionTokens;

  const inputCost = (totalInputTokens / 1_000_000) * INPUT_COST_PER_1M;
  const outputCost = (totalOutputTokens / 1_000_000) * OUTPUT_COST_PER_1M;
  const estimatedCost = inputCost + outputCost;

  const breakdown = `
Generation Cost Estimate:
- Questions: ${count}
- Input tokens: ${totalInputTokens.toLocaleString()} (${avgPromptTokens} per question)
- Output tokens: ${totalOutputTokens.toLocaleString()} (${avgCompletionTokens} per question)
- Input cost: $${inputCost.toFixed(4)}
- Output cost: $${outputCost.toFixed(4)}
- Total cost: $${estimatedCost.toFixed(4)}
  `.trim();

  return {
    estimatedCost,
    inputCost,
    outputCost,
    breakdown,
  };
}
