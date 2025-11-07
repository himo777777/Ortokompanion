/**
 * Database Connection Test Route
 *
 * GET /api/test-db - Test database connectivity and return diagnostics
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {},
  }

  try {
    // Check 1: Prisma Client Connection
    diagnostics.checks.prismaClient = {
      status: 'testing',
    }

    try {
      await prisma.$connect()
      diagnostics.checks.prismaClient = {
        status: 'success',
        message: 'Prisma client connected successfully',
      }
    } catch (error: any) {
      diagnostics.checks.prismaClient = {
        status: 'error',
        error: error.message,
      }
    }

    // Check 2: Database Query Test
    diagnostics.checks.databaseQuery = {
      status: 'testing',
    }

    try {
      const userCount = await prisma.user.count()
      const profileCount = await prisma.profile.count()
      const sessionCount = await prisma.session.count()
      const dailyMixCount = await prisma.dailyMix.count()

      diagnostics.checks.databaseQuery = {
        status: 'success',
        message: 'Database queries successful',
        counts: {
          users: userCount,
          profiles: profileCount,
          sessions: sessionCount,
          dailyMixes: dailyMixCount,
        },
      }
    } catch (error: any) {
      diagnostics.checks.databaseQuery = {
        status: 'error',
        error: error.message,
      }
    }

    // Check 3: Environment Variables
    diagnostics.checks.environmentVariables = {
      status: 'checking',
      variables: {
        DATABASE_URL: process.env.DATABASE_URL ? '✓ Set' : '✗ Missing',
        DIRECT_URL: process.env.DIRECT_URL ? '✓ Set' : '✗ Missing',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env
          .NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
          ? '✓ Set'
          : '✗ Missing',
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY
          ? '✓ Set'
          : '✗ Missing',
        CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET
          ? '✓ Set'
          : '✗ Missing',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing',
      },
    }

    // Determine overall status
    const hasErrors = Object.values(diagnostics.checks).some(
      (check: any) => check.status === 'error'
    )
    const hasMissingEnvVars = Object.values(
      diagnostics.checks.environmentVariables.variables
    ).some((v) => v === '✗ Missing')

    diagnostics.overallStatus = hasErrors
      ? 'error'
      : hasMissingEnvVars
      ? 'warning'
      : 'success'

    const statusCode =
      diagnostics.overallStatus === 'error'
        ? 500
        : diagnostics.overallStatus === 'warning'
        ? 200
        : 200

    return NextResponse.json(diagnostics, { status: statusCode })
  } catch (error: any) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        overallStatus: 'error',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
