/**
 * Content Selector
 * Functions for selecting and filtering questions based on various criteria
 */

import { getQuestionsByDomain, ALL_QUESTIONS } from '@/data/questions'
import type { MCQQuestion } from '@/data/questions'
import type { Domain } from '@/types/onboarding'
import type { DifficultyBand } from '@/types/progression'

export interface QuestionSelectionParams {
  domain: Domain
  band: DifficultyBand
  count: number
  goals: string[]
}

export function selectQuestions(params: QuestionSelectionParams): MCQQuestion[] {
  const { domain, band, count, goals } = params
  
  let questions = getQuestionsByDomain(domain)
  questions = filterByBand(questions, band)
  questions = prioritizeByGoals(questions, goals)
  
  return questions.slice(0, count)
}

export function filterByBand(
  questions: MCQQuestion[],
  band: DifficultyBand,
  includeAdjacent: boolean = false
): MCQQuestion[] {
  if (!includeAdjacent) {
    return questions.filter(q => q.band === band)
  }
  
  const bandOrder: DifficultyBand[] = ['A', 'B', 'C', 'D', 'E']
  const bandIndex = bandOrder.indexOf(band)
  const allowedBands = [
    bandOrder[Math.max(0, bandIndex - 1)],
    band,
    bandOrder[Math.min(4, bandIndex + 1)],
  ].filter(Boolean)
  
  return questions.filter(q => allowedBands.includes(q.band))
}

export function filterByDomain(questions: MCQQuestion[], domain: Domain): MCQQuestion[] {
  return questions.filter(q => q.domain === domain)
}

export function prioritizeByGoals(questions: MCQQuestion[], goalIds: string[]): MCQQuestion[] {
  if (goalIds.length === 0) return questions
  
  const goalRelated: MCQQuestion[] = []
  const nonGoalRelated: MCQQuestion[] = []
  
  questions.forEach(q => {
    const hasRelatedGoal = q.relatedGoals?.some(g => goalIds.includes(g))
    if (hasRelatedGoal) {
      goalRelated.push(q)
    } else {
      nonGoalRelated.push(q)
    }
  })
  
  return [...goalRelated, ...nonGoalRelated]
}
