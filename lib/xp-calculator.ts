/**
 * XP Calculator
 * 
 * Calculates XP rewards based on question difficulty, performance, and speed.
 */

import type { DifficultyBand } from '@/types/progression'

const BAND_MULTIPLIERS: Record<DifficultyBand, number> = {
  A: 0.8,
  B: 0.9,
  C: 1.0,
  D: 1.2,
  E: 1.5,
}

export interface XPCalculationParams {
  correct: boolean
  band: DifficultyBand
  hintsUsed: number
  timeSpent: number
}

export function calculateXP(params: XPCalculationParams): number {
  const { correct, band, hintsUsed, timeSpent } = params

  if (!correct) {
    return Math.min(2, Math.round(BAND_MULTIPLIERS[band]))
  }

  let xp = 10
  xp *= BAND_MULTIPLIERS[band]

  const hintPenalty = Math.max(0.5, 1 - (hintsUsed * 0.15))
  xp *= hintPenalty

  if (timeSpent <= 30) {
    xp *= 1.3
  } else if (timeSpent > 180) {
    xp *= 0.9
  }

  return Math.round(xp)
}

export function getXPMultipliers(): Record<DifficultyBand, number> {
  return { ...BAND_MULTIPLIERS }
}
