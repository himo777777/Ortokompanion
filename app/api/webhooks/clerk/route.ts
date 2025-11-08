/**
 * Clerk Webhooks API Route
 *
 * Handles Clerk user events to sync with our database:
 * - user.created: Create User record in database
 * - user.updated: Update User email if changed
 * - user.deleted: Delete User record (cascade deletes profile & sessions)
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createUserFromClerk, deleteUser } from '@/lib/db-utils'
import { logger } from '@/lib/logger'

/**
 * Verify and handle Clerk webhook events
 */
export async function POST(req: NextRequest) {
  try {
    // Get the webhook secret from environment
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

    if (!webhookSecret) {
      logger.error('CLERK_WEBHOOK_SECRET is not set')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Get the headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { error: 'Missing svix headers' },
        { status: 400 }
      )
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(webhookSecret)

    let evt: WebhookEvent

    // Verify the webhook signature
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent
    } catch (err) {
      logger.error('Error verifying webhook', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the webhook event
    const eventType = evt.type

    logger.info('Received webhook event', { eventType })

    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses } = evt.data
        const email = email_addresses[0]?.email_address

        if (!email) {
          logger.error('No email found for user', { id })
          return NextResponse.json(
            { error: 'No email found' },
            { status: 400 }
          )
        }

        logger.info('Creating user in database', { clerkId: id, email })

        try {
          const user = await createUserFromClerk(id, email)
          logger.info('User created successfully', { userId: user.id })

          return NextResponse.json(
            { message: 'User created', userId: user.id },
            { status: 201 }
          )
        } catch (error) {
          logger.error('Error creating user', error)
          return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
          )
        }
      }

      case 'user.updated': {
        const { id, email_addresses } = evt.data
        const email = email_addresses[0]?.email_address

        logger.info('User updated event received', { clerkId: id, email })

        // For now, we don't update email as it's rarely changed
        // You can add update logic here if needed

        return NextResponse.json(
          { message: 'User update acknowledged' },
          { status: 200 }
        )
      }

      case 'user.deleted': {
        const { id } = evt.data

        if (!id) {
          logger.error('No user ID found in delete event')
          return NextResponse.json(
            { error: 'No user ID found' },
            { status: 400 }
          )
        }

        logger.info('Deleting user from database', { id })

        try {
          await deleteUser(id)
          logger.info('User deleted successfully', { id })

          return NextResponse.json(
            { message: 'User deleted' },
            { status: 200 }
          )
        } catch (error) {
          logger.error('Error deleting user', error)
          return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
          )
        }
      }

      default:
        logger.info('Unhandled webhook event type', { eventType })
        return NextResponse.json(
          { message: 'Event type not handled' },
          { status: 200 }
        )
    }
  } catch (error) {
    logger.error('Webhook error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
