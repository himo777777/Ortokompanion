/**
 * Database Utility Functions
 *
 * Handles CRUD operations for User, Profile, Session, and DailyMix models
 */

import { prisma } from './prisma'
import type { IntegratedUserProfile, SessionResults, MålProgress } from '@/types/integrated'
import type { DailyMix } from '@/types/progression'
import { Prisma, Profile } from '@prisma/client'
import { logger } from './logger'

// Type for session mistakes
interface SessionMistake {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  topic?: string;
}

// ============================================================================
// User Operations
// ============================================================================

/**
 * Create a new user from Clerk webhook
 */
export async function createUserFromClerk(clerkId: string, email: string) {
  try {
    const user = await prisma.user.create({
      data: {
        clerkId,
        email,
      },
    })
    return user
  } catch (error) {
    logger.error('Failed to create user from Clerk webhook', error)
    throw error
  }
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { profile: true },
    })
    return user
  } catch (error) {
    logger.error('Failed to get user by Clerk ID', error, { clerkId })
    throw error
  }
}

/**
 * Get or create user by Clerk ID
 */
export async function getOrCreateUser(clerkId: string, email: string) {
  try {
    let user = await getUserByClerkId(clerkId)

    if (!user) {
      const newUser = await createUserFromClerk(clerkId, email)
      // Fetch again with profile included
      user = await getUserByClerkId(clerkId)
    }

    return user
  } catch (error) {
    logger.error('Failed to get or create user', error, { clerkId })
    throw error
  }
}

/**
 * Delete user (cascade deletes profile and sessions)
 */
export async function deleteUser(clerkId: string) {
  try {
    const user = await prisma.user.delete({
      where: { clerkId },
    })
    return user
  } catch (error) {
    logger.error('Failed to delete user', error, { clerkId })
    throw error
  }
}

// ============================================================================
// Profile Operations
// ============================================================================

/**
 * Create a new profile for a user
 */
export async function createProfile(
  userId: string,
  profileData: Partial<IntegratedUserProfile>
) {
  try {
    const profile = await prisma.profile.create({
      data: {
        userId,
        role: profileData.role || 'läkarexamen',
        stYear: profileData.stYear,
        primarySpecialty: profileData.primarySpecialty,

        // Gamification
        xp: profileData.gamification?.xp || 0,
        level: profileData.gamification?.level || 1,
        streak: profileData.gamification?.streak || 0,
        longestStreak: profileData.gamification?.longestStreak || 0,
        totalSessions: profileData.gamification?.totalSessions || 0,
        lastActivity: profileData.gamification?.lastActivity,
        freezeTokens: profileData.gamification?.freezeTokens || 0,
        prestigeLevel: profileData.gamification?.prestigeLevel || 0,
        lifetimeXP: profileData.gamification?.lifetimeXP || 0,

        // JSON fields
        progression: (profileData.progression as unknown as Prisma.InputJsonValue) || {},
        socialstyrelseMålProgress: (profileData.socialstyrelseMålProgress as unknown as Prisma.InputJsonValue) || [],
        wrongQuestions: (profileData.wrongQuestions as unknown as Prisma.InputJsonValue) || [],
        preferences: (profileData.preferences as unknown as Prisma.InputJsonValue) || {},

        // Rotation data
        rotationTimeline: profileData.rotationTimeline as unknown as Prisma.InputJsonValue,
        orthoPlacement: profileData.orthoPlacement as unknown as Prisma.InputJsonValue,
        placementTiming: profileData.placementTiming,
      },
    })
    return profile
  } catch (error) {
    logger.error('Failed to create profile', error, { userId })
    throw error
  }
}

/**
 * Get profile by user ID
 */
export async function getProfileByUserId(userId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
    })
    return profile
  } catch (error) {
    logger.error('Failed to get profile by user ID', error, { userId })
    throw error
  }
}

/**
 * Get profile by Clerk ID
 */
export async function getProfileByClerkId(clerkId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { profile: true },
    })
    return user?.profile || null
  } catch (error) {
    logger.error('Failed to get profile by Clerk ID', error, { clerkId })
    throw error
  }
}

/**
 * Update profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<IntegratedUserProfile>
) {
  try {
    const updateData: Prisma.ProfileUpdateInput = {}

    // Basic fields
    if (updates.role) updateData.role = updates.role
    if (updates.stYear !== undefined) updateData.stYear = updates.stYear
    if (updates.primarySpecialty) updateData.primarySpecialty = updates.primarySpecialty

    // Gamification fields
    if (updates.gamification) {
      if (updates.gamification.xp !== undefined) updateData.xp = updates.gamification.xp
      if (updates.gamification.level !== undefined) updateData.level = updates.gamification.level
      if (updates.gamification.streak !== undefined) updateData.streak = updates.gamification.streak
      if (updates.gamification.longestStreak !== undefined) updateData.longestStreak = updates.gamification.longestStreak
      if (updates.gamification.totalSessions !== undefined) updateData.totalSessions = updates.gamification.totalSessions
      if (updates.gamification.lastActivity !== undefined) updateData.lastActivity = updates.gamification.lastActivity
      if (updates.gamification.freezeTokens !== undefined) updateData.freezeTokens = updates.gamification.freezeTokens
      if (updates.gamification.prestigeLevel !== undefined) updateData.prestigeLevel = updates.gamification.prestigeLevel
      if (updates.gamification.lifetimeXP !== undefined) updateData.lifetimeXP = updates.gamification.lifetimeXP
    }

    // JSON fields
    if (updates.progression) updateData.progression = updates.progression as unknown as Prisma.InputJsonValue
    if (updates.socialstyrelseMålProgress) updateData.socialstyrelseMålProgress = updates.socialstyrelseMålProgress as unknown as Prisma.InputJsonValue
    if (updates.wrongQuestions) updateData.wrongQuestions = updates.wrongQuestions as unknown as Prisma.InputJsonValue
    if (updates.preferences) updateData.preferences = updates.preferences as unknown as Prisma.InputJsonValue

    // Rotation data
    if (updates.rotationTimeline) updateData.rotationTimeline = updates.rotationTimeline as unknown as Prisma.InputJsonValue
    if (updates.orthoPlacement) updateData.orthoPlacement = updates.orthoPlacement as unknown as Prisma.InputJsonValue
    if (updates.placementTiming) updateData.placementTiming = updates.placementTiming

    const profile = await prisma.profile.update({
      where: { userId },
      data: updateData,
    })

    return profile
  } catch (error) {
    logger.error('Failed to update profile', error, { userId })
    throw error
  }
}

/**
 * Convert database Profile to IntegratedUserProfile
 */
export function profileToIntegratedUserProfile(profile: Profile): IntegratedUserProfile {
  // Parse JSON fields safely
  const progression = profile.progression as Prisma.JsonValue;
  const progressionObj = progression && typeof progression === 'object' ? progression : {};

  return {
    id: profile.userId,
    role: profile.role,
    stYear: profile.stYear,
    primarySpecialty: profile.primarySpecialty,

    gamification: {
      xp: profile.xp,
      level: profile.level,
      badges: (progressionObj as Record<string, unknown>)?.badges || [],
      streak: profile.streak,
      longestStreak: profile.longestStreak,
      totalSessions: profile.totalSessions,
      lastActivity: profile.lastActivity,
      freezeTokens: profile.freezeTokens,
      prestigeLevel: profile.prestigeLevel,
      lifetimeXP: profile.lifetimeXP,
    },

    progression: progression as IntegratedUserProfile['progression'],
    socialstyrelseMålProgress: profile.socialstyrelseMålProgress as MålProgress[],
    wrongQuestions: profile.wrongQuestions as IntegratedUserProfile['wrongQuestions'],
    preferences: profile.preferences as IntegratedUserProfile['preferences'],
    rotationTimeline: profile.rotationTimeline as IntegratedUserProfile['rotationTimeline'],
    orthoPlacement: profile.orthoPlacement as IntegratedUserProfile['orthoPlacement'],
    placementTiming: profile.placementTiming,
  } as IntegratedUserProfile
}

// ============================================================================
// Session Operations
// ============================================================================

/**
 * Create a new session record
 */
export async function createSession(
  userId: string,
  sessionData: {
    questionsAnswered: number
    correctAnswers: number
    xpGained: number
    domain: string
    band: string
    activityType: string
    topics: string[]
    mistakes: SessionMistake[]
    relatedGoals: string[]
  }
) {
  try {
    const session = await prisma.session.create({
      data: {
        userId,
        questionsAnswered: sessionData.questionsAnswered,
        correctAnswers: sessionData.correctAnswers,
        xpGained: sessionData.xpGained,
        domain: sessionData.domain,
        band: sessionData.band,
        activityType: sessionData.activityType,
        topics: sessionData.topics,
        mistakes: sessionData.mistakes as unknown as Prisma.InputJsonValue[],
        relatedGoals: sessionData.relatedGoals,
      },
    })
    return session
  } catch (error) {
    logger.error('Failed to create session', error, { userId, domain: sessionData.domain })
    throw error
  }
}

/**
 * Get recent sessions for a user
 */
export async function getRecentSessions(userId: string, limit: number = 10) {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    })
    return sessions
  } catch (error) {
    logger.error('Failed to get recent sessions', error, { userId, limit })
    throw error
  }
}

/**
 * Get sessions by date range
 */
export async function getSessionsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'desc' },
    })
    return sessions
  } catch (error) {
    logger.error('Failed to get sessions by date range', error, { userId, startDate, endDate })
    throw error
  }
}

// ============================================================================
// Daily Mix Operations
// ============================================================================

/**
 * Save or update daily mix for a user
 */
export async function saveDailyMix(
  userId: string,
  date: Date,
  mixData: DailyMix
) {
  try {
    const dailyMix = await prisma.dailyMix.upsert({
      where: { userId },
      update: {
        date,
        mixData: mixData as unknown as Prisma.InputJsonValue,
      },
      create: {
        userId,
        date,
        mixData: mixData as unknown as Prisma.InputJsonValue,
      },
    })
    return dailyMix
  } catch (error) {
    logger.error('Failed to save daily mix', error, { userId })
    throw error
  }
}

/**
 * Get daily mix for a user
 */
export async function getDailyMix(userId: string) {
  try {
    const dailyMix = await prisma.dailyMix.findUnique({
      where: { userId },
    })
    return dailyMix
  } catch (error) {
    logger.error('Failed to get daily mix', error, { userId })
    throw error
  }
}

/**
 * Check if daily mix is stale (older than today)
 */
export async function isDailyMixStale(userId: string): Promise<boolean> {
  try {
    const dailyMix = await getDailyMix(userId)

    if (!dailyMix) return true

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const mixDate = new Date(dailyMix.date)
    mixDate.setHours(0, 0, 0, 0)

    return mixDate < today
  } catch (error) {
    logger.error('Failed to check daily mix staleness', error, { userId })
    return true
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Increment user XP and handle level ups
 */
export async function incrementXP(userId: string, xpToAdd: number) {
  try {
    const profile = await getProfileByUserId(userId)
    if (!profile) throw new Error('Profile not found')

    const newXP = profile.xp + xpToAdd
    const newLifetimeXP = profile.lifetimeXP + xpToAdd

    // Calculate new level (100 XP per level)
    const newLevel = Math.floor(newXP / 100) + 1

    const updated = await updateProfile(userId, {
      gamification: {
        xp: newXP,
        level: newLevel,
        lifetimeXP: newLifetimeXP,
        badges: [],
        streak: profile.streak,
        longestStreak: profile.longestStreak,
        totalSessions: profile.totalSessions,
        freezeTokens: profile.freezeTokens,
        prestigeLevel: profile.prestigeLevel,
      },
    } as Partial<IntegratedUserProfile>)

    return {
      xp: newXP,
      level: newLevel,
      leveledUp: newLevel > profile.level,
    }
  } catch (error) {
    logger.error('Failed to increment XP', error, { userId, xpToAdd })
    throw error
  }
}

/**
 * Update user streak
 */
export async function updateStreak(userId: string) {
  try {
    const profile = await getProfileByUserId(userId)
    if (!profile) throw new Error('Profile not found')

    const now = new Date()
    const lastActivity = profile.lastActivity ? new Date(profile.lastActivity) : null

    let newStreak = profile.streak
    let usedFreezeToken = false

    if (lastActivity) {
      const daysSinceLastActivity = Math.floor(
        (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysSinceLastActivity === 0) {
        // Same day, no change
      } else if (daysSinceLastActivity === 1) {
        // Consecutive day, increment streak
        newStreak += 1
      } else if (daysSinceLastActivity === 2 && profile.freezeTokens > 0) {
        // Missed one day but have freeze token
        usedFreezeToken = true
        newStreak += 1
      } else {
        // Streak broken
        newStreak = 1
      }
    } else {
      // First activity
      newStreak = 1
    }

    const longestStreak = Math.max(newStreak, profile.longestStreak)
    const freezeTokens = usedFreezeToken ? profile.freezeTokens - 1 : profile.freezeTokens

    await updateProfile(userId, {
      gamification: {
        xp: profile.xp,
        level: profile.level,
        badges: [],
        streak: newStreak,
        longestStreak,
        totalSessions: profile.totalSessions + 1,
        lastActivity: now,
        freezeTokens,
        prestigeLevel: profile.prestigeLevel,
        lifetimeXP: profile.lifetimeXP,
      },
    } as Partial<IntegratedUserProfile>)

    return {
      streak: newStreak,
      longestStreak,
      usedFreezeToken,
    }
  } catch (error) {
    logger.error('Failed to update streak', error, { userId })
    throw error
  }
}

/**
 * Get full user profile with all relations
 */
export async function getFullUserProfile(clerkId: string): Promise<IntegratedUserProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { profile: true },
    })

    if (!user || !user.profile) return null

    return profileToIntegratedUserProfile(user.profile)
  } catch (error) {
    logger.error('Failed to get full user profile', error, { clerkId })
    throw error
  }
}

// ============================================================================
// Test-Friendly Wrapper Functions
// ============================================================================

/**
 * Save/update user profile (wrapper for updateProfile)
 * @param userId - User ID
 * @param profile - Profile data to save
 */
export async function saveProfile(userId: string, profile: Partial<IntegratedUserProfile>) {
  return updateProfile(userId, profile)
}

/**
 * Load user profile (wrapper for getProfileByUserId)
 * @param userId - User ID
 * @returns User profile or null
 */
export async function loadProfile(userId: string) {
  return getProfileByUserId(userId)
}

/**
 * Save session data (wrapper for createSession)
 */
export async function saveSession(sessionData: {
  userId: string
  questionsAnswered: number
  correctAnswers: number
  xpGained: number
  domain: string
  band: string
  activityType: string
  topics?: string[]
  mistakes?: SessionMistake[]
  relatedGoals?: string[]
}) {
  return createSession(sessionData)
}

/**
 * Get user sessions with optional limit (wrapper for getRecentSessions)
 */
export async function getUserSessions(userId: string, limit?: number) {
  return getRecentSessions(userId, limit || 10)
}
