/**
 * Level & Band Utilities
 * Helper functions for education level hierarchy and band matching
 */

import { EducationLevel } from '@/types/education';
import { DifficultyBand } from '@/types/progression';

/**
 * Check if a question level is appropriate for a user's level
 * Implements hierarchical level matching:
 * - Students can see student-level content
 * - AT can see student + AT content
 * - ST1 can see student + AT + ST1 content
 * - ST3 can see up to ST3 (includes ST1, ST2)
 * - Specialists can see all content
 *
 * @param questionLevel - The education level of the question
 * @param userLevel - The user's current education level
 * @returns true if question is appropriate for user
 */
export function isLevelAppropriate(
  questionLevel: EducationLevel,
  userLevel: EducationLevel
): boolean {
  // Specialists can see everything
  if (userLevel === 'specialist-ortopedi') {
    return true;
  }

  // Exact match is always OK
  if (questionLevel === userLevel) {
    return true;
  }

  // Student level is OK for everyone
  if (questionLevel === 'student') {
    return true;
  }

  // Extract numeric levels from ST years
  const getUserSTLevel = (level: EducationLevel): number | null => {
    const match = level.match(/^st(\d)$/);
    return match ? parseInt(match[1]) : null;
  };

  const userSTLevel = getUserSTLevel(userLevel);
  const questionSTLevel = getUserSTLevel(questionLevel);

  // Both are ST levels - user can see equal or lower ST levels
  if (userSTLevel !== null && questionSTLevel !== null) {
    return questionSTLevel <= userSTLevel;
  }

  // Handle AT level
  if (userLevel === 'at') {
    return ['student', 'at'].includes(questionLevel as string);
  }

  // ST can see student and AT content
  if (userSTLevel !== null) {
    return ['student', 'at'].includes(questionLevel as string);
  }

  return false;
}

/**
 * Get appropriate bands for a user based on their target band
 * Allows some flexibility: user can see target band ± range
 *
 * @param targetBand - The user's target difficulty band
 * @param strict - If true, only return exact band. If false, allow ±range variation
 * @param range - Number of bands above/below target to include (default: 1, max: 2)
 * @returns Array of appropriate bands
 */
export function getAppropriateBands(
  targetBand: DifficultyBand,
  strict: boolean = false,
  range: number = 1
): DifficultyBand[] {
  if (strict) {
    return [targetBand];
  }

  const bandOrder: DifficultyBand[] = ['A', 'B', 'C', 'D', 'E'];
  const targetIndex = bandOrder.indexOf(targetBand);
  const effectiveRange = Math.min(range, 2); // Cap at ±2

  const appropriateBands: DifficultyBand[] = [targetBand];

  // Add easier bands (target - range to target - 1)
  for (let i = 1; i <= effectiveRange; i++) {
    if (targetIndex - i >= 0) {
      appropriateBands.push(bandOrder[targetIndex - i]);
    }
  }

  // Add harder bands (target + 1 to target + range)
  for (let i = 1; i <= effectiveRange; i++) {
    if (targetIndex + i < bandOrder.length) {
      appropriateBands.push(bandOrder[targetIndex + i]);
    }
  }

  return appropriateBands;
}

/**
 * Get readable description of education level
 */
export function getEducationLevelLabel(level: EducationLevel): string {
  const labels: Record<EducationLevel, string> = {
    'student': 'Student',
    'at': 'AT-läkare',
    'st1': 'ST1 Ortopedi',
    'st2': 'ST2 Ortopedi',
    'st3': 'ST3 Ortopedi',
    'st4': 'ST4 Ortopedi',
    'st5': 'ST5 Ortopedi',
    'st-allmänmedicin': 'ST Allmänmedicin',
    'st-akutsjukvård': 'ST Akutsjukvård',
    'specialist-ortopedi': 'Specialist Ortopedi',
    'specialist-allmänmedicin': 'Specialist Allmänmedicin',
    'specialist-akutsjukvård': 'Specialist Akutsjukvård',
  };

  return labels[level] || level;
}

/**
 * Get readable description of difficulty band
 */
export function getBandLabel(band: DifficultyBand): string {
  const labels: Record<DifficultyBand, string> = {
    'A': 'Grundläggande (A)',
    'B': 'Medel (B)',
    'C': 'Avancerad (C)',
    'D': 'Expert (D)',
    'E': 'Master (E)',
  };

  return labels[band];
}

/**
 * Calculate effective level number for sorting/comparison
 * Returns 0-7 where higher = more advanced
 */
export function getLevelNumericValue(level: EducationLevel): number {
  const values: Record<EducationLevel, number> = {
    'student': 0,
    'at': 1,
    'st1': 2,
    'st2': 3,
    'st3': 4,
    'st4': 5,
    'st5': 6,
    'st-allmänmedicin': 3, // Similar to ST3
    'st-akutsjukvård': 3, // Similar to ST3
    'specialist-ortopedi': 7,
    'specialist-allmänmedicin': 7,
    'specialist-akutsjukvård': 7,
  };

  return values[level] || 0;
}

/**
 * Calculate effective band number for sorting/comparison
 * Returns 0-4 where higher = more difficult
 */
export function getBandNumericValue(band: DifficultyBand): number {
  const values: Record<DifficultyBand, number> = {
    'A': 0,
    'B': 1,
    'C': 2,
    'D': 3,
    'E': 4,
  };

  return values[band];
}
