/**
 * Adaptive Difficulty System
 * Wraps band-system.ts functions with test-friendly interface
 */

import {
  calculateBandAdjustment,
  getStartingBand,
  shouldPromoteBand,
  shouldDemoteBand,
} from './band-system'
import type { IntegratedUserProfile } from '@/types/integrated'
import type { DifficultyBand } from '@/types/progression'

export interface SessionPerformance {
  questionsAnswered: number
  correctAnswers: number
  hintsUsed: number
  avgTimePerQuestion: number
}

export interface DifficultyAdjustment {
  shouldAdjust: boolean
  newBand?: DifficultyBand
  reason?: string
}

export function adjustDifficulty(
  profile: IntegratedUserProfile,
  sessionData: SessionPerformance
): DifficultyAdjustment {
  const correctRate = sessionData.correctAnswers / sessionData.questionsAnswered
  const hintUsage = sessionData.hintsUsed / sessionData.questionsAnswered

  // Check session-level thresholds first
  // Only adjust if performance is clearly above or below thresholds
  const isExcellentPerformance = correctRate >= 0.85 && hintUsage <= 1.0
  const isPoorPerformance = correctRate <= 0.4 || hintUsage >= 0.8

  // Don't adjust for average performance
  if (!isExcellentPerformance && !isPoorPerformance) {
    return {
      shouldAdjust: false,
    }
  }

  // Create recent days array with current session as today's performance
  const recentDays = [
    {
      date: new Date(),
      correctRate,
      hintUsage,
      difficult: correctRate < 0.5,
    }
  ]

  const result = calculateBandAdjustment(profile.progression.bandStatus, recentDays)

  if (!result) {
    return {
      shouldAdjust: false,
    }
  }

  return {
    shouldAdjust: true,
    newBand: result.toBand,
    reason: result.reason || 'Difficulty adjusted based on performance',
  }
}

export function calculateOptimalBand(profile: IntegratedUserProfile): DifficultyBand {
  // Handle generic 'specialist' role (used in tests) by mapping to specialist-ortopedi
  let role = profile.role
  if (role === 'specialist' as any) {
    role = 'specialist-ortopedi' as any
  }
  return getStartingBand(role)
}
