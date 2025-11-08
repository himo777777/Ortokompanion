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
import type { IntegratedUserProfile } from '@/types/integrated'
import { logger } from '@/lib/logger'

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
    logger.error('Error fetching profile', error)
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

    // Get or create user
    const body = await req.json()
    const email = body.email || ''
    const user = await getOrCreateUser(clerkId, email)

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
    const profileData: Partial<IntegratedUserProfile> = body.profile

    if (!profileData.role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      )
    }

    const profile = await createProfile(user.id, profileData)

    const userProfile = profileToIntegratedUserProfile(profile)

    return NextResponse.json(
      { profile: userProfile, message: 'Profile created successfully' },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Error creating profile', error)
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

    // Update profile
    const body = await req.json()
    const updates: Partial<IntegratedUserProfile> = body.updates

    const updatedProfile = await updateProfile(user.id, updates)

    const userProfile = profileToIntegratedUserProfile(updatedProfile)

    return NextResponse.json({
      profile: userProfile,
      message: 'Profile updated successfully',
    })
  } catch (error) {
    logger.error('Error updating profile', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
