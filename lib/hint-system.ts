/**
 * Hint System for Tutor Mode
 * Provides progressive 3-level hints to support learning
 */

import { MCQQuestion, TutorModeData } from '@/data/questions';

export type HintLevel = 1 | 2 | 3;

/**
 * Gets a hint for a specific level
 *
 * @param tutorData - Tutor mode data
 * @param level - Hint level (1-3)
 * @returns Hint text
 */
export function getHint(tutorData: TutorModeData, level: HintLevel): string {
  return tutorData.hints[level - 1];
}

/**
 * Gets all hints up to a specific level
 *
 * @param tutorData - Tutor mode data
 * @param maxLevel - Maximum hint level to return
 * @returns Array of hints
 */
export function getHintsUpTo(
  tutorData: TutorModeData,
  maxLevel: HintLevel
): string[] {
  return tutorData.hints.slice(0, maxLevel);
}

/**
 * Calculates XP penalty for using hints
 *
 * @param hintsUsed - Number of hints used (0-3)
 * @param baseXP - Base XP for answering correctly
 * @returns Adjusted XP
 */
export function calculateHintPenalty(hintsUsed: number, baseXP: number): number {
  // Penalty: -20% per hint
  const penaltyPerHint = 0.2;
  const totalPenalty = Math.min(hintsUsed * penaltyPerHint, 0.6); // Max 60% penalty
  return Math.floor(baseXP * (1 - totalPenalty));
}

/**
 * Generates default hints for a question if none exist
 * Uses question data to create intelligent fallback hints
 *
 * @param question - MCQ question
 * @returns Default tutor mode data
 */
export function generateDefaultHints(question: MCQQuestion): TutorModeData {
  // Hint 1: General topic guidance
  const hint1 = `Detta är en fråga om ${question.domain}. Tänk på grundläggande principer inom detta område.`;

  // Hint 2: Eliminate wrong answers
  const hint2 = `Fundera på varje alternativ systematiskt. Vilka kan du omedelbart utesluta?`;

  // Hint 3: Direct guidance from explanation
  const explanationWords = question.explanation.split(' ');
  const hint3 =
    explanationWords.length > 20
      ? explanationWords.slice(0, 20).join(' ') + '...'
      : question.explanation.slice(0, 100) + '...';

  return {
    hints: [hint1, hint2, hint3],
    commonMistakes: [
      'Läser inte frågan noggrant',
      'Glömmer klinisk kontext',
      'Förväxlar liknande tillstånd',
    ],
    teachingPoints: question.tags || [],
  };
}

/**
 * Tracks hint usage for analytics
 */
export interface HintUsageTracker {
  questionId: string;
  hintsUsed: number;
  hintLevelsUsed: HintLevel[];
  stillCorrect: boolean;
  timeSpent: number;
  timestamp: Date;
}

/**
 * Creates a hint usage record
 *
 * @param params - Tracking parameters
 * @returns Hint usage record
 */
export function trackHintUsage(params: {
  questionId: string;
  hintsUsed: number;
  hintLevelsUsed: HintLevel[];
  stillCorrect: boolean;
  timeSpent: number;
}): HintUsageTracker {
  return {
    ...params,
    timestamp: new Date(),
  };
}

/**
 * Analyzes hint usage patterns to identify learning gaps
 *
 * @param usageHistory - Array of hint usage records
 * @returns Analysis results
 */
export function analyzeHintUsage(usageHistory: HintUsageTracker[]): {
  avgHintsPerQuestion: number;
  questionsNeedingHints: number;
  totalQuestions: number;
  mostDifficultTopics: string[];
  improvementTrend: 'improving' | 'stable' | 'declining';
} {
  const totalQuestions = usageHistory.length;
  const questionsNeedingHints = usageHistory.filter(
    (h) => h.hintsUsed > 0
  ).length;
  const avgHintsPerQuestion =
    totalQuestions > 0
      ? usageHistory.reduce((sum, h) => sum + h.hintsUsed, 0) / totalQuestions
      : 0;

  // Trend analysis (last 10 vs previous 10)
  const recent = usageHistory.slice(-10);
  const previous = usageHistory.slice(-20, -10);
  const recentAvg =
    recent.length > 0
      ? recent.reduce((sum, h) => sum + h.hintsUsed, 0) / recent.length
      : 0;
  const previousAvg =
    previous.length > 0
      ? previous.reduce((sum, h) => sum + h.hintsUsed, 0) / previous.length
      : 0;

  let improvementTrend: 'improving' | 'stable' | 'declining';
  if (recentAvg < previousAvg - 0.3) {
    improvementTrend = 'improving';
  } else if (recentAvg > previousAvg + 0.3) {
    improvementTrend = 'declining';
  } else {
    improvementTrend = 'stable';
  }

  return {
    avgHintsPerQuestion,
    questionsNeedingHints,
    totalQuestions,
    mostDifficultTopics: [], // TODO: Extract from questions
    improvementTrend,
  };
}

/**
 * Suggests next learning action based on hint usage
 *
 * @param analysis - Hint usage analysis
 * @returns Recommended action
 */
export function suggestLearningAction(analysis: {
  avgHintsPerQuestion: number;
  improvementTrend: 'improving' | 'stable' | 'declining';
}): {
  action: 'continue' | 'review' | 'easier_content' | 'harder_content';
  message: string;
} {
  // High hint usage (>2 per question)
  if (analysis.avgHintsPerQuestion > 2) {
    return {
      action: 'review',
      message:
        'Du använder många ledtrådar. Överväg att repetera grundläggande koncept.',
    };
  }

  // Declining performance
  if (analysis.improvementTrend === 'declining') {
    return {
      action: 'easier_content',
      message:
        'Din prestanda försämras. Testa lättare innehåll för att bygga självförtroende.',
    };
  }

  // Improving and low hint usage
  if (
    analysis.improvementTrend === 'improving' &&
    analysis.avgHintsPerQuestion < 1
  ) {
    return {
      action: 'harder_content',
      message:
        'Utmärkt framsteg! Du är redo för mer utmanande innehåll.',
    };
  }

  // Default: continue
  return {
    action: 'continue',
    message: 'Fortsätt så här! Din inlärning utvecklas bra.',
  };
}

/**
 * Formats hint display with progressive reveal
 *
 * @param hint - Hint text
 * @param level - Hint level
 * @returns Formatted hint object for UI
 */
export function formatHintForDisplay(hint: string, level: HintLevel): {
  level: HintLevel;
  icon: string;
  color: string;
  label: string;
  text: string;
} {
  const config = {
    1: { icon: '💡', color: 'blue', label: 'Ledtråd 1: Generell riktning' },
    2: { icon: '🎯', color: 'yellow', label: 'Ledtråd 2: Avgränsa alternativ' },
    3: { icon: '🔍', color: 'orange', label: 'Ledtråd 3: Direkt vägledning' },
  } as const;

  const { icon, color, label } = config[level];

  return {
    level,
    icon,
    color,
    label,
    text: hint,
  };
}
