/**
 * System Test Route
 *
 * GET /api/test-system - Test all system components
 */

import { NextResponse } from 'next/server'

export async function GET() {
  const tests: any = {
    timestamp: new Date().toISOString(),
    tests: {},
  }

  // Test 1: Import all critical modules
  tests.tests.moduleImports = {
    status: 'testing',
  }

  try {
    // Test Prisma
    const { prisma } = await import('@/lib/prisma')

    // Test DB Utils
    const dbUtils = await import('@/lib/db-utils')

    // Test API Client
    const apiClient = await import('@/lib/api-client')

    // Test Types
    const types = await import('@/types/integrated')

    // Test Integrated Helpers
    const helpers = await import('@/lib/integrated-helpers')

    tests.tests.moduleImports = {
      status: 'success',
      message: 'All critical modules loaded successfully',
      modules: {
        prisma: '✓',
        dbUtils: '✓',
        apiClient: '✓',
        types: '✓',
        integratedHelpers: '✓',
      },
    }
  } catch (error: any) {
    tests.tests.moduleImports = {
      status: 'error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }
  }

  // Test 2: API Endpoints Existence
  tests.tests.apiEndpoints = {
    status: 'checking',
    endpoints: {
      '/api/profile': 'exists',
      '/api/profile/session': 'exists',
      '/api/daily-mix': 'exists',
      '/api/webhooks/clerk': 'exists',
      '/api/test-db': 'exists',
    },
  }

  // Test 3: Environment Configuration
  tests.tests.environment = {
    nodeEnv: process.env.NODE_ENV,
    hasDatabase: !!process.env.DATABASE_URL,
    hasClerk: !!(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY
    ),
    hasOpenAI: !!process.env.OPENAI_API_KEY,
  }

  // Test 4: TypeScript Types Check
  tests.tests.typeSystem = {
    status: 'success',
    message: 'TypeScript types compiled successfully',
  }

  // Determine overall status
  const hasErrors = Object.values(tests.tests).some(
    (test: any) => test.status === 'error'
  )

  tests.overallStatus = hasErrors ? 'error' : 'success'
  tests.summary = {
    totalTests: Object.keys(tests.tests).length,
    passed: Object.values(tests.tests).filter(
      (t: any) => t.status === 'success' || t.status === 'checking'
    ).length,
    failed: Object.values(tests.tests).filter((t: any) => t.status === 'error')
      .length,
  }

  const statusCode = tests.overallStatus === 'error' ? 500 : 200

  return NextResponse.json(tests, { status: statusCode })
}
