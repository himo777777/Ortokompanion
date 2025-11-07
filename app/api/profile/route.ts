/**
 * Profile API Routes
 *
 * GET    /api/profile - Get current user's profile
 * POST   /api/profile - Create new profile (onboarding)
 * PUT    /api/profile - Update profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  getOrCreateUser,
  getProfileByUserId,
  createProfile,
  updateProfile,
  profileToIntegratedUserProfile,
} from '@/lib/db-utils'
import {
  CreateProfileSchema,
  UpdateProfileSchema,
  validateRequest,
  formatValidationError,
} from '@/lib/api-validation'
import { logger } from '@/lib/logger'
import type { IntegratedUserProfile } from '@/types/integrated'

/**
 * GET /api/profile
 * Get the current user's profile
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create user (in case webhook didn't fire)
    const user = await getOrCreateUser(clerkId, '') // Email will be filled from Clerk if needed

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get profile
    const profile = await getProfileByUserId(user.id)

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found', hasProfile: false },
        { status: 404 }
      )
    }

    // Convert to IntegratedUserProfile
    const userProfile = profileToIntegratedUserProfile(profile)

    return NextResponse.json({ profile: userProfile, hasProfile: true })
  } catch (error) {
    logger.error('Failed to fetch profile', error, { clerkId: 'hidden' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/profile
 * Create a new profile for the current user (onboarding)
 */
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate request body
    const body = await req.json()
    const validation = validateRequest(CreateProfileSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: formatValidationError(validation.error),
        },
        { status: 400 }
      )
    }

    const { profile: profileData, email } = validation.data
    const user = await getOrCreateUser(clerkId, email || '')

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Check if profile already exists
    const existingProfile = await getProfileByUserId(user.id)

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists' },
        { status: 400 }
      )
    }

    // Create new profile
    if (!profileData.role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      )
    }

    const profile = await createProfile(user.id, profileData as Partial<IntegratedUserProfile>)

    const userProfile = profileToIntegratedUserProfile(profile)

    return NextResponse.json(
      { profile: userProfile, message: 'Profile created successfully' },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Failed to create profile', error, { operation: 'POST /api/profile' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/profile
 * Update the current user's profile
 */
export async function PUT(req: NextRequest) {
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

    // Get existing profile
    const existingProfile = await getProfileByUserId(user.id)

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profile not found. Create one first.' },
        { status: 404 }
      )
    }

    // Validate request body
    const body = await req.json()
    const validation = validateRequest(UpdateProfileSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: formatValidationError(validation.error),
        },
        { status: 400 }
      )
    }

    const { updates } = validation.data
    const updatedProfile = await updateProfile(user.id, updates as Partial<IntegratedUserProfile>)

    const userProfile = profileToIntegratedUserProfile(updatedProfile)

    return NextResponse.json({
      profile: userProfile,
      message: 'Profile updated successfully',
    })
  } catch (error) {
    logger.error('Failed to update profile', error, { operation: 'PUT /api/profile' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
