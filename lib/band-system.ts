/**
 * Difficulty Band System (A-E)
 * Auto-tuning without damaging confidence
 *
 * Core features:
 * - Band definitions (A = easiest, E = hardest)
 * - Auto-promotion based on performance
 * - Auto-demotion with recovery support
 * - Never > ±1 band per day
 * - Day 1 always slightly easier
 */

import {
  DifficultyBand,
  BandDefinition,
  UserBandStatus,
  BandAdjustment,
  BAND_THRESHOLDS,
} from '@/types/progression';
import { EducationLevel } from '@/types/education';

/**
 * Band Definitions (A-E)
 * From spec: A = supportive, E = complex with time pressure
 */
export const BAND_DEFINITIONS: Record<DifficultyBand, BandDefinition> = {
  A: {
    band: 'A',
    label: 'Grundläggande',
    description: 'Stödjande guidning, tydliga ledtrådar, 1 beslutspunkt',
    decisionPoints: 1,
    hints: 'many',
    pitfalls: 'none',
    timeConstraint: 'none',
    supportLevel: 'high',
  },
  B: {
    band: 'B',
    label: 'Utvecklande',
    description: '1-2 beslutspunkter, lätta fallgropar, tydlig Pearl',
    decisionPoints: 2,
    hints: 'some',
    pitfalls: 'obvious',
    timeConstraint: 'relaxed',
    supportLevel: 'medium',
  },
  C: {
    band: 'C',
    label: 'Mellannivå',
    description: '2-3 beslutspunkter, diskreta fallgropar, kort diktering',
    decisionPoints: 3,
    hints: 'few',
    pitfalls: 'subtle',
    timeConstraint: 'moderate',
    supportLevel: 'medium',
  },
  D: {
    band: 'D',
    label: 'Avancerad',
    description: '3-4 beslutspunkter, prioritering under osäkerhet, röntgen-twist',
    decisionPoints: 4,
    hints: 'minimal',
    pitfalls: 'multiple',
    timeConstraint: 'moderate',
    supportLevel: 'low',
  },
  E: {
    band: 'E',
    label: 'Expert',
    description: '4-5 beslutspunkter, konflikterande data, komplikationer, tidsbegränsning',
    decisionPoints: 5,
    hints: 'minimal',
    pitfalls: 'multiple',
    timeConstraint: 'tight',
    supportLevel: 'low',
  },
};

/**
 * Get starting band based on education level
 * From spec: Level determines starting track
 *
 * @param level - User's education level
 * @returns Recommended starting band
 */
export function getStartingBand(level: EducationLevel): DifficultyBand {
  switch (level) {
    case 'student':
      return 'A';
    case 'at':
      return 'B';
    case 'st1':
      return 'C';
    case 'st2':
      return 'C';
    case 'st3':
      return 'D';
    case 'st4':
      return 'D';
    case 'st5':
      return 'E';
    case 'specialist':
      return 'E';
    default:
      return 'B';
  }
}

/**
 * Get band one level easier (for Day 1 or recovery)
 * From spec: Day 1 always delivered slightly easier
 *
 * @param band - Current band
 * @returns One band easier (or same if already at A)
 */
export function getEasierBand(band: DifficultyBand): DifficultyBand {
  const bands: DifficultyBand[] = ['A', 'B', 'C', 'D', 'E'];
  const index = bands.indexOf(band);
  return index > 0 ? bands[index - 1] : band;
}

/**
 * Get band one level harder
 *
 * @param band - Current band
 * @returns One band harder (or same if already at E)
 */
export function getHarderBand(band: DifficultyBand): DifficultyBand {
  const bands: DifficultyBand[] = ['A', 'B', 'C', 'D', 'E'];
  const index = bands.indexOf(band);
  return index < bands.length - 1 ? bands[index + 1] : band;
}

/**
 * Determine if band promotion is warranted
 * Criteria: 2-3 days streak with 70-85% correct, low hint usage
 *
 * @param bandStatus - Current band status
 * @returns True if should promote
 */
export function shouldPromoteBand(bandStatus: UserBandStatus): boolean {
  const { streakAtBand, recentPerformance } = bandStatus;

  // Check promotion criteria
  const hasStreakP = streakAtBand >= BAND_THRESHOLDS.PROMOTION_STREAK;
  const hasGoodCorrectRate = recentPerformance.correctRate >= BAND_THRESHOLDS.PROMOTION_CORRECT_RATE;
  const hasLowHintUsage = recentPerformance.hintUsage <= BAND_THRESHOLDS.PROMOTION_MAX_HINT_USAGE;

  return hasStreakP && hasGoodCorrectRate && hasLowHintUsage;
}

/**
 * Determine if band demotion is warranted
 * Criteria: 2 difficult days or leech detection
 *
 * @param recentDays - Performance over recent days
 * @returns True if should demote
 */
export function shouldDemoteBand(recentDays: Array<{ correctRate: number; difficult: boolean }>): boolean {
  // Count difficult days in last few days
  const difficultDaysCount = recentDays.filter((day) => day.difficult).length;

  if (difficultDaysCount >= BAND_THRESHOLDS.DEMOTION_DIFFICULT_DAYS) {
    return true;
  }

  // Check if recent performance is very poor
  const avgCorrectRate =
    recentDays.reduce((sum, day) => sum + day.correctRate, 0) / recentDays.length;

  if (avgCorrectRate < BAND_THRESHOLDS.DEMOTION_CORRECT_RATE) {
    return true;
  }

  return false;
}

/**
 * Calculate band adjustment based on performance
 * Returns null if no adjustment needed
 *
 * @param bandStatus - Current band status
 * @param recentDays - Recent performance data
 * @returns Band adjustment or null
 */
export function calculateBandAdjustment(
  bandStatus: UserBandStatus,
  recentDays: Array<{ date: Date; correctRate: number; hintUsage: number; difficult: boolean }>
): BandAdjustment | null {
  const currentBand = bandStatus.currentBand;

  // Check if already promoted/demoted today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bandStatus.lastPromotion) {
    const lastPromo = new Date(bandStatus.lastPromotion);
    lastPromo.setHours(0, 0, 0, 0);
    if (lastPromo.getTime() === today.getTime()) {
      return null; // Already promoted today
    }
  }

  if (bandStatus.lastDemotion) {
    const lastDemo = new Date(bandStatus.lastDemotion);
    lastDemo.setHours(0, 0, 0, 0);
    if (lastDemo.getTime() === today.getTime()) {
      return null; // Already demoted today
    }
  }

  // Check for promotion
  if (shouldPromoteBand(bandStatus) && currentBand !== 'E') {
    const avgCorrectRate =
      recentDays.slice(0, 3).reduce((sum, day) => sum + day.correctRate, 0) / 3;
    const avgHintUsage =
      recentDays.slice(0, 3).reduce((sum, day) => sum + day.hintUsage, 0) / 3;

    return {
      fromBand: currentBand,
      toBand: getHarderBand(currentBand),
      reason: 'Stark prestanda över flera dagar - redo för nästa nivå!',
      date: new Date(),
      performanceMetrics: {
        streak: bandStatus.streakAtBand,
        avgCorrectRate,
        avgHintUsage,
      },
    };
  }

  // Check for demotion
  if (shouldDemoteBand(recentDays.slice(0, 3)) && currentBand !== 'A') {
    const avgCorrectRate =
      recentDays.slice(0, 2).reduce((sum, day) => sum + day.correctRate, 0) / 2;
    const avgHintUsage =
      recentDays.slice(0, 2).reduce((sum, day) => sum + day.hintUsage, 0) / 2;

    return {
      fromBand: currentBand,
      toBand: getEasierBand(currentBand),
      reason: 'Låt oss ta ett steg tillbaka och stärka grunderna',
      date: new Date(),
      performanceMetrics: {
        streak: 0, // Reset streak on demotion
        avgCorrectRate,
        avgHintUsage,
      },
    };
  }

  return null; // No adjustment needed
}

/**
 * Apply band adjustment to user status
 *
 * @param bandStatus - Current band status
 * @param adjustment - Band adjustment to apply
 * @returns Updated band status
 */
export function applyBandAdjustment(
  bandStatus: UserBandStatus,
  adjustment: BandAdjustment
): UserBandStatus {
  const isPromotion = adjustment.toBand > adjustment.fromBand;

  return {
    currentBand: adjustment.toBand,
    bandHistory: [
      ...bandStatus.bandHistory,
      {
        band: adjustment.toBand,
        date: adjustment.date,
        reason: adjustment.reason,
      },
    ],
    streakAtBand: 0, // Reset streak at new band
    lastPromotion: isPromotion ? adjustment.date : bandStatus.lastPromotion,
    lastDemotion: !isPromotion ? adjustment.date : bandStatus.lastDemotion,
    recentPerformance: bandStatus.recentPerformance, // Preserve for now
  };
}

/**
 * Create initial band status for new user
 *
 * @param level - User's education level
 * @returns Initial band status
 */
export function createInitialBandStatus(level: EducationLevel): UserBandStatus {
  const startingBand = getStartingBand(level);

  return {
    currentBand: startingBand,
    bandHistory: [
      {
        band: startingBand,
        date: new Date(),
        reason: 'Startpunkt baserat på din utbildningsnivå',
      },
    ],
    streakAtBand: 0,
    recentPerformance: {
      correctRate: 0.7, // Assume reasonable starting performance
      hintUsage: 1.5,
      timeEfficiency: 0.8,
      confidence: 0.6,
    },
  };
}

/**
 * Get band for Day 1 (always slightly easier)
 * From spec: Day 1 delivered always one notch easier
 *
 * @param calculatedBand - The band calculated for user
 * @returns Band for Day 1 (one easier)
 */
export function getDayOneBand(calculatedBand: DifficultyBand): DifficultyBand {
  return getEasierBand(calculatedBand);
}

/**
 * Check if two difficult days in a row (trigger recovery)
 *
 * @param recentDays - Recent performance
 * @returns True if two difficult days in a row
 */
export function hasTwoDifficultDaysInRow(
  recentDays: Array<{ difficult: boolean }>
): boolean {
  if (recentDays.length < 2) return false;

  // Check last two days
  return recentDays[0].difficult && recentDays[1].difficult;
}

/**
 * Generate recovery mix after difficult day
 * From spec: After difficult day → easier mix + rescue hints
 *
 * @param currentBand - Current band
 * @returns Recovery recommendations
 */
export function generateRecoveryMix(currentBand: DifficultyBand): {
  targetBand: DifficultyBand;
  extraHints: boolean;
  encouragement: string;
} {
  return {
    targetBand: getEasierBand(currentBand),
    extraHints: true,
    encouragement:
      'Vi tar det lite lugnare idag. Fokus på att bygga självförtroende och repetera det du redan kan. Du klarar det här!',
  };
}

/**
 * Update recent performance metrics
 *
 * @param currentMetrics - Current performance metrics
 * @param todayResults - Today's results
 * @returns Updated metrics (exponential moving average)
 */
export function updatePerformanceMetrics(
  currentMetrics: {
    correctRate: number;
    hintUsage: number;
    timeEfficiency: number;
    confidence: number;
  },
  todayResults: {
    correctRate: number;
    hintUsage: number;
    timeEfficiency: number;
    confidence: number;
  }
): {
  correctRate: number;
  hintUsage: number;
  timeEfficiency: number;
  confidence: number;
} {
  // Use exponential moving average with alpha = 0.3 (weight today's result)
  const alpha = 0.3;

  return {
    correctRate: alpha * todayResults.correctRate + (1 - alpha) * currentMetrics.correctRate,
    hintUsage: alpha * todayResults.hintUsage + (1 - alpha) * currentMetrics.hintUsage,
    timeEfficiency:
      alpha * todayResults.timeEfficiency + (1 - alpha) * currentMetrics.timeEfficiency,
    confidence: alpha * todayResults.confidence + (1 - alpha) * currentMetrics.confidence,
  };
}

/**
 * Get user-friendly band description with encouragement
 *
 * @param band - Difficulty band
 * @returns Encouraging description
 */
export function getBandDescription(band: DifficultyBand): string {
  const def = BAND_DEFINITIONS[band];

  const encouragement: Record<DifficultyBand, string> = {
    A: 'Du bygger en stark grund. Varje steg framåt räknas!',
    B: 'Bra jobbat! Du utvecklas stadigt och säkert.',
    C: 'Du ligger på rätt nivå och gör verkliga framsteg!',
    D: 'Imponerande! Du hanterar avancerade situationer med säkerhet.',
    E: 'Exceptionellt! Du arbetar på expertnivå.',
  };

  return `${def.label}: ${def.description}\n\n${encouragement[band]}`;
}
