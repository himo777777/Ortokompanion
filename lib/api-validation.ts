/**
 * API Request Validation Schemas
 *
 * Zod schemas for validating incoming API requests
 */

import { z } from 'zod'

// ==================== Profile API Schemas ====================

export const CreateProfileSchema = z.object({
  profile: z.object({
    role: z.enum(['läkarexamen', 'at', 'bt', 'st']),
    stYear: z.number().int().min(1).max(10).optional().nullable(),
    primarySpecialty: z.enum(['ortopedi', 'allmänmedicin', 'akutsjukvård']).optional().nullable(),

    gamification: z.object({
      xp: z.number().int().min(0).default(0),
      level: z.number().int().min(1).default(1),
      badges: z.array(z.string()).default([]),
      streak: z.number().int().min(0).default(0),
      longestStreak: z.number().int().min(0).default(0),
      totalSessions: z.number().int().min(0).default(0),
      lastActivity: z.date().optional(),
      freezeTokens: z.number().int().min(0).default(0),
      prestigeLevel: z.number().int().min(0).default(0),
      lifetimeXP: z.number().int().min(0).default(0),
    }).optional(),

    progression: z.any().optional(), // Complex nested structure
    socialstyrelseMålProgress: z.array(z.any()).default([]),
    wrongQuestions: z.array(z.any()).default([]),
    preferences: z.object({
      targetMinutesPerDay: z.number().min(0).max(1440).optional(),
      recoveryMode: z.boolean().optional(),
      notificationsEnabled: z.boolean().optional(),
      soundEnabled: z.boolean().optional(),
    }).optional(),
  }),
  email: z.string().email().optional(),
})

export const UpdateProfileSchema = z.object({
  updates: z.object({
    role: z.enum(['läkarexamen', 'at', 'bt', 'st']).optional(),
    stYear: z.number().int().min(1).max(10).optional().nullable(),
    primarySpecialty: z.enum(['ortopedi', 'allmänmedicin', 'akutsjukvård']).optional().nullable(),

    gamification: z.object({
      xp: z.number().int().min(0).optional(),
      level: z.number().int().min(1).optional(),
      badges: z.array(z.string()).optional(),
      streak: z.number().int().min(0).optional(),
      longestStreak: z.number().int().min(0).optional(),
      totalSessions: z.number().int().min(0).optional(),
      lastActivity: z.date().optional(),
      freezeTokens: z.number().int().min(0).optional(),
      prestigeLevel: z.number().int().min(0).optional(),
      lifetimeXP: z.number().int().min(0).optional(),
    }).optional(),

    progression: z.any().optional(),
    socialstyrelseMålProgress: z.array(z.any()).optional(),
    wrongQuestions: z.array(z.any()).optional(),
    preferences: z.any().optional(),
    rotationTimeline: z.any().optional(),
    orthoPlacement: z.any().optional(),
    placementTiming: z.string().optional(),
  }),
})

// ==================== Session API Schemas ====================

export const CreateSessionSchema = z.object({
  questionsAnswered: z.number().int().min(0).max(1000),
  correctAnswers: z.number().int().min(0).max(1000),
  xpGained: z.number().int().min(0).max(10000),
  domain: z.string().min(1).max(100),
  band: z.enum(['A', 'B', 'C', 'D', 'E']),
  activityType: z.enum(['new', 'interleave', 'srs', 'clinical-case', 'exam']),
  topics: z.array(z.string().max(200)).max(50).optional().default([]),
  mistakes: z.array(z.any()).max(1000).optional().default([]),
  relatedGoals: z.array(z.string().max(200)).max(100).optional().default([]),
})
  .refine(
    data => data.correctAnswers <= data.questionsAnswered,
    { message: 'correctAnswers cannot exceed questionsAnswered' }
  )

// ==================== Daily Mix API Schemas ====================

export const SaveDailyMixSchema = z.object({
  mixData: z.object({
    date: z.coerce.date(),
    newContent: z.object({
      domain: z.string(),
      items: z.array(z.any()).max(100),
      difficulty: z.string(),
    }),
    interleavingContent: z.object({
      domain: z.string(),
      items: z.array(z.any()).max(100),
      difficulty: z.string(),
    }).optional(),
    srsReviews: z.object({
      cards: z.array(z.any()).max(100),
      dueToday: z.number().int().min(0),
    }).optional(),
  }),
  date: z.coerce.date().optional(),
})

// ==================== Validation Helper ====================

export function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error }
}

export function formatValidationError(error: z.ZodError): string {
  return error.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join('; ')
}
