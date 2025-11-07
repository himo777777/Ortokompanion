/**
 * Session API Routes
 *
 * POST /api/profile/session - Save a learning session
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getOrCreateUser, createSession, updateStreak, incrementXP } from '@/lib/db-utils'
import {
  CreateSessionSchema,
  validateRequest,
  formatValidationError,
} from '@/lib/api-validation'

/**
 * POST /api/profile/session
 * Save a learning session and update gamification
 */
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await getOrCreateUser(clerkId, '')

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate request body
    const body = await req.json()
    const validation = validateRequest(CreateSessionSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: formatValidationError(validation.error),
        },
        { status: 400 }
      )
    }

    const {
      questionsAnswered,
      correctAnswers,
      xpGained,
      domain,
      band,
      activityType,
      topics,
      mistakes,
      relatedGoals,
    } = validation.data

    // Create session record
    const session = await createSession(user.id, {
      questionsAnswered,
      correctAnswers,
      xpGained,
      domain,
      band,
      activityType,
      topics: topics || [],
      mistakes: mistakes || [],
      relatedGoals: relatedGoals || [],
    })

    // Update streak
    const streakUpdate = await updateStreak(user.id)

    // Increment XP
    const xpUpdate = await incrementXP(user.id, xpGained)

    return NextResponse.json({
      message: 'Session saved successfully',
      session: {
        id: session.id,
        timestamp: session.timestamp,
      },
      gamification: {
        xp: xpUpdate.xp,
        level: xpUpdate.level,
        leveledUp: xpUpdate.leveledUp,
        streak: streakUpdate.streak,
        longestStreak: streakUpdate.longestStreak,
        usedFreezeToken: streakUpdate.usedFreezeToken,
      },
    })
  } catch (error) {
    console.error('Error saving session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
