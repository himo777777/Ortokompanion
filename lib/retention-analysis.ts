/**
 * Retention Analysis
 * Analyzes learning retention and identifies weak areas
 */

import type { Domain } from '@/types/onboarding'

export interface Review {
  correct: boolean
}

export interface SessionData {
  date: Date
  correctRate: number
}

export interface DomainStats {
  domain: Domain
  retentionRate: number
}

export interface RetentionTrend {
  direction: 'improving' | 'declining' | 'stable'
}

export function calculateRetentionRate(reviews: Review[]): number {
  if (reviews.length === 0) return 0
  
  const correctCount = reviews.filter(r => r.correct).length
  return correctCount / reviews.length
}

export function analyzeRetentionTrends(sessions: SessionData[]): RetentionTrend {
  if (sessions.length < 2) {
    return { direction: 'stable' }
  }
  
  const firstRate = sessions[0].correctRate
  const lastRate = sessions[sessions.length - 1].correctRate
  const trend = lastRate - firstRate
  
  if (trend > 0.1) {
    return { direction: 'improving' }
  } else if (trend < -0.1) {
    return { direction: 'declining' }
  } else {
    return { direction: 'stable' }
  }
}

export function identifyWeakAreas(
  domainStats: DomainStats[],
  threshold: number
): Domain[] {
  return domainStats
    .filter(stats => stats.retentionRate < threshold)
    .map(stats => stats.domain)
}
