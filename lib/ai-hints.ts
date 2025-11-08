/**
 * AI Hints System
 * Provides progressive hints for questions using OpenAI integration
 */

import OpenAI from 'openai'
import { logger } from './logger'
import type { MCQQuestion } from '@/data/questions'

// Lazy OpenAI client creation to avoid initialization errors in test environments
let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
      dangerouslyAllowBrowser: true, // Allow in test environments
    })
  }
  return openaiClient
}

export interface HintRequest {
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
  hintLevel: number
  previousHints?: string[]
}

export interface HintResponse {
  hint: string
  level: number
  confidence: number
}

/**
 * Generate a progressive hint for a question (core implementation)
 * Level 1: General guidance without revealing answer
 * Level 2: More specific clue pointing toward correct reasoning
 * Level 3: Strong hint that narrows down to answer
 */
async function generateHintCore(request: HintRequest): Promise<HintResponse> {
  try {
    const { question, options, correctAnswer, explanation, hintLevel, previousHints } = request

    const systemPrompt = `You are a dental education tutor providing progressive hints.
Level 1: Give general guidance about the concept without revealing the answer.
Level 2: Provide more specific reasoning that points toward the correct approach.
Level 3: Give a strong hint that significantly narrows down the answer.

Always respond in Swedish. Keep hints concise (1-2 sentences).`

    const userPrompt = `Question: ${question}

Options:
${options.map((opt, i) => `${i}. ${opt}`).join('\n')}

Correct answer: ${correctAnswer}
Explanation: ${explanation}

Current hint level: ${hintLevel}
${previousHints && previousHints.length > 0 ? `Previous hints:\n${previousHints.join('\n')}` : ''}

Provide a hint at level ${hintLevel}.`

    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 150,
    })

    const hint = response.choices[0]?.message?.content || 'Ledtråd kunde inte genereras.'

    logger.info('AI hint generated', {
      hintLevel,
      questionPreview: question.substring(0, 50),
    })

    return {
      hint,
      level: hintLevel,
      confidence: 0.9,
    }
  } catch (error) {
    logger.error('Failed to generate AI hint', { error })
    throw new Error('Failed to generate hint')
  }
}

/**
 * Validate hint quality before presenting to user
 */
export function validateHint(hint: string, level: number): boolean {
  if (!hint || hint.length < 10) return false
  if (hint.length > 300) return false

  const forbiddenPhrases = [
    'svaret är',
    'det rätta svaret',
    'correct answer',
    'the answer is',
  ]

  const lowerHint = hint.toLowerCase()
  const hasRevealingPhrase = forbiddenPhrases.some(phrase =>
    lowerHint.includes(phrase.toLowerCase())
  )

  if (level < 3 && hasRevealingPhrase) {
    return false
  }

  return true
}

/**
 * Get maximum allowed hints for a question
 */
export function getMaxHints(): number {
  return 3
}

/**
 * Generate a hint for a question (test-friendly interface)
 * Checks for predefined hints first, falls back to AI generation
 */
export async function generateHint(question: MCQQuestion, level: number): Promise<string> {
  // Check for predefined hints
  if (question.tutorMode?.hints && question.tutorMode.hints.length > 0) {
    const hintIndex = Math.min(level - 1, question.tutorMode.hints.length - 1)
    return question.tutorMode.hints[hintIndex]
  }

  // Fallback to AI generation
  try {
    const response = await generateHintCore({
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      hintLevel: level,
    })
    return response.hint
  } catch (error) {
    // Return generic hint on error
    logger.error('Failed to generate hint, using fallback', { error })
    return 'Tänk igenom alternativens för- och nackdelar systematiskt.'
  }
}

/**
 * Generate progressive hints for a question (test-friendly interface)
 * Returns an array of 3 hints with increasing specificity
 */
export async function getProgressiveHints(question: MCQQuestion): Promise<string[]> {
  const hints: string[] = []

  for (let level = 1; level <= 3; level++) {
    try {
      const hint = await generateHint(question, level)
      hints.push(hint)
    } catch (error) {
      logger.error(`Failed to generate hint at level ${level}`, { error })
      // Continue with remaining hints even if one fails
    }
  }

  return hints
}
