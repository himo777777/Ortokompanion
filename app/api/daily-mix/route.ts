/**
 * Daily Mix API Routes
 *
 * GET  /api/daily-mix - Get today's daily mix
 * POST /api/daily-mix - Save/update daily mix
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getOrCreateUser, getDailyMix, saveDailyMix, isDailyMixStale } from '@/lib/db-utils'
import {
  SaveDailyMixSchema,
  validateRequest,
  formatValidationError,
} from '@/lib/api-validation'
import { logger } from '@/lib/logger'
import type { DailyMix } from '@/types/progression'

/**
 * GET /api/daily-mix
 * Get the current user's daily mix
 */
export async function GET() {
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

    // Get daily mix
    const dailyMix = await getDailyMix(user.id)

    if (!dailyMix) {
      return NextResponse.json(
        { error: 'Daily mix not found', hasMix: false },
        { status: 404 }
      )
    }

    // Check if stale
    const isStale = await isDailyMixStale(user.id)

    return NextResponse.json({
      dailyMix: dailyMix.mixData,
      date: dailyMix.date,
      isStale,
      hasMix: true,
    })
  } catch (error) {
    logger.error('Failed to fetch daily mix', error, { operation: 'GET /api/daily-mix' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/daily-mix
 * Save/update the current user's daily mix
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
    const validation = validateRequest(SaveDailyMixSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: formatValidationError(validation.error),
        },
        { status: 400 }
      )
    }

    const { mixData, date } = validation.data

    // Save daily mix
    const mixDate = date || new Date()
    const savedMix = await saveDailyMix(user.id, mixDate, mixData as unknown as DailyMix)

    return NextResponse.json({
      message: 'Daily mix saved successfully',
      dailyMix: savedMix.mixData,
      date: savedMix.date,
    })
  } catch (error) {
    logger.error('Failed to save daily mix', error, { operation: 'POST /api/daily-mix' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
