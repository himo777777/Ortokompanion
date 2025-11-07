/**
 * Database Utility Functions
 *
 * Handles CRUD operations for User, Profile, Session, and DailyMix models
 */

import { prisma } from './prisma'
import type { IntegratedUserProfile, SessionResults, MålProgress } from '@/types/integrated'
import type { DailyMix } from '@/types/progression'
import { Prisma } from '@prisma/client'

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
    console.error('Error creating user:', error)
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
    console.error('Error getting user by Clerk ID:', error)
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
    console.error('Error in getOrCreateUser:', error)
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
    console.error('Error deleting user:', error)
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
    console.error('Error creating profile:', error)
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
    console.error('Error getting profile:', error)
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
    console.error('Error getting profile by Clerk ID:', error)
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
    console.error('Error updating profile:', error)
    throw error
  }
}

/**
 * Convert database Profile to IntegratedUserProfile
 */
export function profileToIntegratedUserProfile(profile: any): IntegratedUserProfile {
  return {
    id: profile.userId,
    role: profile.role,
    stYear: profile.stYear,
    primarySpecialty: profile.primarySpecialty,

    gamification: {
      xp: profile.xp,
      level: profile.level,
      badges: (profile.progression as any)?.badges || [],
      streak: profile.streak,
      longestStreak: profile.longestStreak,
      totalSessions: profile.totalSessions,
      lastActivity: profile.lastActivity,
      freezeTokens: profile.freezeTokens,
      prestigeLevel: profile.prestigeLevel,
      lifetimeXP: profile.lifetimeXP,
    },

    progression: profile.progression as any,
    socialstyrelseMålProgress: profile.socialstyrelseMålProgress as MålProgress[],
    wrongQuestions: profile.wrongQuestions as any,
    preferences: profile.preferences as any,
    rotationTimeline: profile.rotationTimeline as any,
    orthoPlacement: profile.orthoPlacement as any,
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
    mistakes: any[]
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
    console.error('Error creating session:', error)
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
    console.error('Error getting recent sessions:', error)
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
    console.error('Error getting sessions by date range:', error)
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
    console.error('Error saving daily mix:', error)
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
    console.error('Error getting daily mix:', error)
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
    console.error('Error checking daily mix staleness:', error)
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
    console.error('Error incrementing XP:', error)
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
    console.error('Error updating streak:', error)
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
    console.error('Error getting full user profile:', error)
    throw error
  }
}
