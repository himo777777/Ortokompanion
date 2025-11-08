/**
 * Zod Validation Schemas
 *
 * Runtime validation schemas for critical data structures.
 * Ensures data integrity when loading from localStorage, receiving from API, or accepting user input.
 */

import { z } from 'zod';
import { logger } from './logger';

// ==================== Enum Schemas ====================

export const DomainSchema = z.enum([
  'trauma',
  'höft',
  'fot-fotled',
  'hand-handled',
  'knä',
  'axel-armbåge',
  'rygg',
  'sport',
  'tumor',
]);

export const DifficultyBandSchema = z.enum(['A', 'B', 'C', 'D', 'E']);

export const EducationLevelSchema = z.enum([
  'student',
  'at',
  'st1',
  'st2',
  'st3',
  'st4',
  'st5',
  'specialist',
]);

export const SRSCardTypeSchema = z.enum([
  'quiz',
  'microcase',
  'pearl',
  'image',
  'differential',
]);

export const CompetencySchema = z.enum([
  'diagnostik',
  'akuta-flöden',
  'konservativ-behandling',
  'kirurgisk-behandling',
  'komplikationer',
  'rehabilitering',
  'pediatrik',
  'geriatrik',
]);

export const ActivityTypeSchema = z.enum(['new', 'interleaving', 'srs', 'recovery']);

// ==================== ActivitySession Props Schema ====================

/**
 * Validates props passed to ActivitySession component
 */
export const ActivitySessionPropsSchema = z.object({
  activityId: z.string().min(1, 'Activity ID cannot be empty'),
  activityType: ActivityTypeSchema,
  domain: DomainSchema,
  userLevel: EducationLevelSchema,
  targetBand: DifficultyBandSchema.optional(),
  questionIds: z
    .array(z.string().min(1))
    .max(100, 'Cannot have more than 100 questions')
    .optional(),
  onComplete: z.function().args(z.any()).returns(z.void()),
  onClose: z.function().args().returns(z.void()),
});

export type ActivitySessionPropsInput = z.input<typeof ActivitySessionPropsSchema>;

// ==================== Question Schema ====================

export const MCQQuestionSchema = z.object({
  id: z.string().min(1),
  domain: DomainSchema,
  question: z.string().min(1),
  options: z.array(z.string()).min(2).max(6),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(1),
  band: DifficultyBandSchema,
  level: EducationLevelSchema,
  competencies: z.array(CompetencySchema).min(1),
  relatedGoals: z.array(z.string()).optional(),
  references: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
});

// ==================== SRS Card Schema ====================

export const SRSCardSchema = z.object({
  id: z.string().min(1),
  domain: DomainSchema,
  type: SRSCardTypeSchema,
  contentId: z.string().min(1),
  easeFactor: z.number().min(1.3).max(4.0),
  stability: z.number().min(0).max(100),
  interval: z.number().int().min(0),
  dueDate: z.coerce.date(),
  difficulty: z.number().min(0).max(1),
  retrievability: z.number().min(0).max(1).optional(),
  lastReview: z.coerce.date().optional(),
  reviewCount: z.number().int().min(0),
  lapseCount: z.number().int().min(0),
  failCount: z.number().int().min(0),
  isLeech: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  relatedGoals: z.array(z.string()).optional(),
  competencies: z.array(CompetencySchema).optional(),
});

// ==================== Session Results Schema ====================

export const SessionSummarySchema = z.object({
  questionsAnswered: z.number().int().min(0),
  correctAnswers: z.number().int().min(0),
  accuracy: z.number().min(0).max(100),
  totalTimeSpent: z.number().min(0),
  averageTimePerQuestion: z.number().min(0),
  hintsUsed: z.number().int().min(0),
  xpEarned: z.number().int().min(0),
  domain: DomainSchema.optional(),
});

export const SessionResultsSchema = z.object({
  activityId: z.string(),
  activityType: ActivityTypeSchema,
  summary: SessionSummarySchema,
  srsCards: z.array(SRSCardSchema),
  performanceByCompetency: z.record(z.string(), z.number().min(0).max(100)),
  completedContent: z.array(z.string()),
  relatedGoals: z.array(z.string()),
  timestamp: z.coerce.date(),
});

// ==================== User Input Sanitization Schema ====================

/**
 * Validates and sanitizes user text input
 * - Max length to prevent abuse
 * - No control characters
 * - Trims whitespace
 */
export const UserTextInputSchema = z
  .string()
  .max(10000, 'Input too long')
  .transform((str) => str.trim())
  .refine((str) => !str.includes('\0'), 'Invalid characters detected');

/**
 * Validates user answers in step-by-step mode
 */
export const StepAnswerInputSchema = z
  .string()
  .max(5000, 'Answer too long')
  .transform((str) => str.trim());

// ==================== Profile Validation (Partial) ====================

/**
 * Validates basic profile structure when loading from localStorage
 * Only validates critical fields to ensure app doesn't crash
 */
export const ProfileBasicSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email().optional(),
  role: EducationLevelSchema,
  gamification: z.object({
    xp: z.number().int().min(0),
    level: z.number().int().min(1),
    streak: z.number().int().min(0),
    badges: z.array(z.string()),
  }),
  progression: z.object({
    primaryDomain: DomainSchema,
    bandStatus: z.object({
      currentBand: DifficultyBandSchema,
    }),
  }),
});

// ==================== Validation Helper Functions ====================

/**
 * Validates data and returns typed result or null
 *
 * @example
 * ```typescript
 * const validated = safeValidate(ActivitySessionPropsSchema, props);
 * if (!validated) {
 *   console.error('Invalid props');
 *   return;
 * }
 * // Use validated.data
 * ```
 */
export function safeValidate<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error };
}

/**
 * Validates data or throws error with detailed message
 *
 * @example
 * ```typescript
 * try {
 *   const validated = validateOrThrow(ActivitySessionPropsSchema, props);
 *   // Use validated
 * } catch (error) {
 *   console.error('Validation failed:', error);
 * }
 * ```
 */
export function validateOrThrow<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data);
}

/**
 * Validates data or returns fallback value
 *
 * @example
 * ```typescript
 * const questions = validateOrFallback(
 *   z.array(MCQQuestionSchema),
 *   loadedData,
 *   []
 * );
 * ```
 */
export function validateOrFallback<T extends z.ZodType>(
  schema: T,
  data: unknown,
  fallback: z.infer<T>
): z.infer<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  } else {
    logger.warn('Validation failed, using fallback value', {
      errors: result.error.format()
    });
    return fallback;
  }
}
