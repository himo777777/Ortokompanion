/**
 * API Client
 *
 * Client-side functions for interacting with backend API
 */

import type { IntegratedUserProfile, SessionResults } from '@/types/integrated'
import type { DailyMix } from '@/types/progression'

// ============================================================================
// Profile API
// ============================================================================

/**
 * Fetch the current user's profile
 */
export async function fetchProfile(): Promise<{
  profile: IntegratedUserProfile | null
  hasProfile: boolean
}> {
  try {
    const response = await fetch('/api/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 404) {
      return { profile: null, hasProfile: false }
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`)
    }

    const data = await response.json()

    // Convert date strings back to Date objects
    if (data.profile?.gamification?.lastActivity) {
      data.profile.gamification.lastActivity = new Date(
        data.profile.gamification.lastActivity
      )
    }
    if (data.profile?.progression?.history) {
      data.profile.progression.history.osceResults =
        data.profile.progression.history.osceResults.map((r: any) => ({
          ...r,
          completedAt: new Date(r.completedAt),
        }))
    }

    return { profile: data.profile, hasProfile: data.hasProfile }
  } catch (error) {
    console.error('Error fetching profile:', error)
    throw error
  }
}

/**
 * Create a new profile
 */
export async function createProfile(
  profileData: Partial<IntegratedUserProfile>,
  email?: string
): Promise<IntegratedUserProfile> {
  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile: profileData,
        email,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create profile: ${response.statusText}`)
    }

    const data = await response.json()
    return data.profile
  } catch (error) {
    console.error('Error creating profile:', error)
    throw error
  }
}

/**
 * Update the current user's profile
 */
export async function updateProfileAPI(
  updates: Partial<IntegratedUserProfile>
): Promise<IntegratedUserProfile> {
  try {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updates }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.statusText}`)
    }

    const data = await response.json()
    return data.profile
  } catch (error) {
    console.error('Error updating profile:', error)
    throw error
  }
}

// ============================================================================
// Session API
// ============================================================================

/**
 * Save a learning session
 */
export async function saveSession(sessionData: {
  questionsAnswered: number
  correctAnswers: number
  xpGained: number
  domain: string
  band: string
  activityType: string
  topics?: string[]
  mistakes?: any[]
  relatedGoals?: string[]
}): Promise<{
  sessionId: string
  gamification: {
    xp: number
    level: number
    leveledUp: boolean
    streak: number
    longestStreak: number
    usedFreezeToken: boolean
  }
}> {
  try {
    const response = await fetch('/api/profile/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    })

    if (!response.ok) {
      throw new Error(`Failed to save session: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      sessionId: data.session.id,
      gamification: data.gamification,
    }
  } catch (error) {
    console.error('Error saving session:', error)
    throw error
  }
}

// ============================================================================
// Daily Mix API
// ============================================================================

/**
 * Fetch the current user's daily mix
 */
export async function fetchDailyMix(): Promise<{
  dailyMix: DailyMix | null
  date: Date
  isStale: boolean
  hasMix: boolean
}> {
  try {
    const response = await fetch('/api/daily-mix', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 404) {
      return { dailyMix: null, date: new Date(), isStale: true, hasMix: false }
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch daily mix: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      dailyMix: data.dailyMix,
      date: new Date(data.date),
      isStale: data.isStale,
      hasMix: data.hasMix,
    }
  } catch (error) {
    console.error('Error fetching daily mix:', error)
    throw error
  }
}

/**
 * Save daily mix
 */
export async function saveDailyMixAPI(
  mixData: DailyMix,
  date?: Date
): Promise<void> {
  try {
    const response = await fetch('/api/daily-mix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mixData,
        date: date || new Date(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to save daily mix: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error saving daily mix:', error)
    throw error
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if user is authenticated
 */
export async function checkAuth(): Promise<boolean> {
  try {
    const response = await fetch('/api/profile', {
      method: 'GET',
    })

    // If we get 401, user is not authenticated
    if (response.status === 401) {
      return false
    }

    return true
  } catch (error) {
    console.error('Error checking auth:', error)
    return false
  }
}
