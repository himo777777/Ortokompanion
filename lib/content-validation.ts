/**
 * Content Validation
 * Validates AI-generated content for quality and correctness
 */

export interface ContentToValidate {
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
  domain?: string
  band?: string
}

export interface ValidationResult {
  isValid: boolean
  errors?: string[]
}

export function validateContent(content: ContentToValidate): ValidationResult {
  const errors: string[] = []
  
  if (!content.question || content.question.length < 10) {
    errors.push('Question must be at least 10 characters long')
  }
  
  if (!content.options || !Array.isArray(content.options)) {
    errors.push('Options must be an array')
  } else if (content.options.length !== 4) {
    errors.push('Must have exactly 4 options')
  }
  
  if (!content.correctAnswer) {
    errors.push('Must specify correct answer')
  } else {
    const answerIndex = parseInt(content.correctAnswer)
    if (isNaN(answerIndex) || answerIndex < 0 || answerIndex >= 4) {
      errors.push('Correct answer must be a valid index (0-3)')
    }
  }
  
  if (!content.explanation || content.explanation.length < 10) {
    errors.push('Explanation must be at least 10 characters long')
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  }
}

export function checkQualityThresholds(score: number): boolean {
  return score >= 0.8
}

export function scoreContentQuality(content: ContentToValidate): number {
  let score = 1.0
  
  if (content.question.length < 50) score *= 0.7
  if (content.explanation.length < 50) score *= 0.8
  
  const allOptionsShort = content.options?.every(opt => opt.length < 10)
  if (allOptionsShort) score *= 0.6
  
  const hasSwedishChars = /[åäöÅÄÖ]/.test(content.question + content.explanation)
  if (!hasSwedishChars) score *= 0.9
  
  return Math.max(0, Math.min(1, score))
}
