/**
 * Automatic Socialstyrelsen Goal Assignment
 *
 * Automatically assigns relevant Socialstyrelsen goals based on:
 * - User's education level
 * - Current rotation (for ST-ortopedi)
 * - Placement type (for ST-other specialties)
 * - User preferences
 */

import { UserProfile, Domain } from '@/types/onboarding';
import { EducationLevel } from '@/types/education';
import { Rotation, OrthoPlacement, getCurrentRotation } from '@/types/rotation';
import {
  getMålForLevel,
  getMålForDomain,
  getAllMålForLevel,
  SocialstyrelseMål,
  LÄKARPROGRAMMET_MÅL,
  AT_MÅL,
  ST_ORTOPEDI_MÅL,
  ST_ALLMÄNMEDICIN_ORTOPEDI_MÅL,
  ST_AKUTSJUKVÅRD_ORTOPEDI_MÅL,
  SPECIALIST_FORTBILDNING_MÅL,
} from '@/data/socialstyrelsen-goals';
import { toLevelType } from '@/lib/ai-utils';

/**
 * Assigns relevant goals for a specific rotation based on domain
 *
 * Uses getMålForDomain() to get domain-specific goals including:
 * - Level-specific goals (student/AT/ST1-5)
 * - Domain-specific goals (trauma, höft, knä, etc.)
 * - Subspecialty goals (hand, fot, sport, tumör)
 *
 * @param rotation - Current rotation with domain information
 * @param userLevel - User's education level (student, AT, ST1-5, specialist)
 * @returns Array of goal IDs relevant to the rotation (max 10 goals)
 *
 * @example
 * ```typescript
 * const rotation = { domain: 'trauma', name: 'Traumakirurgi', ... };
 * const goals = assignGoalsForRotation(rotation, 'st1');
 * // Returns: ['st1-01', 'lp-03', 'at-01', ...] - domain-specific trauma goals
 * ```
 */
export function assignGoalsForRotation(
  rotation: Rotation,
  userLevel: EducationLevel
): string[] {
  // Get domain-specific goals using enhanced getMålForDomain()
  const validLevel = toLevelType(userLevel);
  if (!validLevel) return [];

  // Get goals that combine level + domain + subspecialty
  const domainGoals = getMålForDomain(
    rotation.domain as Domain,
    validLevel as EducationLevel
  );

  // Prioritize required goals first, then optional
  const sortedGoals = domainGoals.sort((a, b) => {
    if (a.required && !b.required) return -1;
    if (!a.required && b.required) return 1;
    return 0;
  });

  // Return goal IDs, max 10 per rotation (increased from 8 due to better filtering)
  return sortedGoals.slice(0, 10).map(g => g.id);
}

/**
 * Assign goals for ortho placement (ST-allmänmedicin, ST-akutsjukvård)
 */
export function assignGoalsForPlacement(
  placement: OrthoPlacement,
  specialty: 'allmänmedicin' | 'akutsjukvård'
): string[] {
  // For ST-allmänmedicin and ST-akutsjukvård, return all their placement goals
  if (specialty === 'allmänmedicin') {
    return ST_ALLMÄNMEDICIN_ORTOPEDI_MÅL.map(g => g.id);
  } else {
    return ST_AKUTSJUKVÅRD_ORTOPEDI_MÅL.map(g => g.id);
  }
}

/**
 * Assign goals for student/AT based on placement timing
 */
export function assignGoalsForStudentAT(
  level: 'student' | 'at',
  placementTiming?: 'current' | 'soon' | 'later' | 'none'
): string[] {
  const allGoals = level === 'student' ? LÄKARPROGRAMMET_MÅL : AT_MÅL;

  // Prioritize based on timing
  if (placementTiming === 'current' || placementTiming === 'soon') {
    // Return all goals - they need to prepare/complete everything
    return allGoals.filter(g => g.required).map(g => g.id);
  } else {
    // Focus on foundational goals first
    return allGoals
      .filter(g => g.required)
      .slice(0, 3)
      .map(g => g.id);
  }
}

/**
 * Assign goals for specialists (fortbildning mode)
 */
export function assignGoalsForSpecialist(
  domains: Domain[]
): string[] {
  // Specialists get all fortbildning goals
  return SPECIALIST_FORTBILDNING_MÅL.map(g => g.id);
}

/**
 * Automatically assigns Socialstyrelsen goals based on user profile
 *
 * Determines which goals are relevant for the user based on:
 * - Education level (student, AT, ST1-5, specialist)
 * - Current rotation (for ST-ortopedi)
 * - Ortho placement (for ST-allmänmedicin, ST-akutsjukvård)
 * - Placement timing (for students/AT)
 *
 * @param profile - Complete user profile with role, rotations, and placement information
 * @returns Array of goal IDs that should be assigned to this user
 *
 * @example
 * ```typescript
 * const profile = {
 *   role: 'st1',
 *   rotationTimeline: { rotations: [{ domain: 'trauma', ... }] }
 * };
 * const goalIds = autoAssignGoals(profile);
 * // Returns: ['st-ortopedi-1', 'st-ortopedi-2', ...]
 * ```
 */
export function autoAssignGoals(profile: UserProfile): string[] {
  const level = profile.role;

  // ST-Ortopedi with rotations
  if (level.match(/^st[1-5]$/) && profile.rotationTimeline) {
    const currentRotation = getCurrentRotation(profile.rotationTimeline);
    if (currentRotation) {
      return assignGoalsForRotation(currentRotation, level);
    }
    // If no current rotation, assign general goals for their year
    const validLevel = toLevelType(level);
    if (!validLevel) return [];
    const allGoals = getAllMålForLevel(validLevel as EducationLevel);
    return allGoals.map(g => g.id);
  }

  // ST-Allmänmedicin with ortho placement
  if (level === 'st-allmänmedicin' && profile.orthoPlacement) {
    return assignGoalsForPlacement(profile.orthoPlacement, 'allmänmedicin');
  }

  // ST-Akutsjukvård with ortho placement
  if (level === 'st-akutsjukvård' && profile.orthoPlacement) {
    return assignGoalsForPlacement(profile.orthoPlacement, 'akutsjukvård');
  }

  // Student or AT
  if (level === 'student' || level === 'at') {
    return assignGoalsForStudentAT(level, profile.placementTiming);
  }

  // Specialists
  if (level.startsWith('specialist')) {
    return assignGoalsForSpecialist(profile.domains);
  }

  // Fallback: return all required goals for level
  const validLevel = toLevelType(level);
  if (!validLevel) return [];
  const allGoals = getMålForLevel(validLevel as EducationLevel);
  return allGoals.filter(g => g.required).map(g => g.id);
}

/**
 * Get priority goals that need most attention
 */
export function getPriorityGoalsForUser(
  profile: UserProfile,
  completedGoalIds: string[]
): string[] {
  const assignedGoals = autoAssignGoals(profile);

  // Filter out completed goals
  const incompleteGoals = assignedGoals.filter(id => !completedGoalIds.includes(id));

  // For ST-ortopedi with current rotation, prioritize rotation-specific goals
  if (profile.role.match(/^st[1-5]$/) && profile.rotationTimeline) {
    const currentRotation = getCurrentRotation(profile.rotationTimeline);
    if (currentRotation && currentRotation.goals) {
      const rotationGoals = currentRotation.goals.filter(id =>
        incompleteGoals.includes(id)
      );
      // Return rotation goals first, then others
      const otherGoals = incompleteGoals.filter(id => !currentRotation.goals.includes(id));
      return [...rotationGoals, ...otherGoals].slice(0, 5);
    }
  }

  // Return top 5 incomplete goals
  return incompleteGoals.slice(0, 5);
}

/**
 * Get goal recommendations with reasoning
 */
export function getGoalRecommendations(
  profile: UserProfile,
  completedGoalIds: string[]
): Array<{
  goalId: string;
  goal: SocialstyrelseMål;
  reason: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}> {
  const priorityGoals = getPriorityGoalsForUser(profile, completedGoalIds);
  const validLevel = toLevelType(profile.role);
  if (!validLevel) return [];
  const allGoals = getMålForLevel(validLevel as EducationLevel);

  return priorityGoals.map((goalId, index) => {
    const goal = allGoals.find(g => g.id === goalId);
    if (!goal) return null;

    // Determine priority
    let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
    let reason = '';

    // Check if rotation-related
    if (profile.role.match(/^st[1-5]$/) && profile.rotationTimeline) {
      const currentRotation = getCurrentRotation(profile.rotationTimeline);
      if (currentRotation?.goals.includes(goalId)) {
        priority = index === 0 ? 'critical' : 'high';
        reason = `Kritiskt för din nuvarande ${currentRotation.domain}-rotation`;
      }
    }

    // Check if placement-related
    if (profile.placementTiming === 'current') {
      priority = index === 0 ? 'critical' : 'high';
      reason = 'Viktigt för din pågående placering';
    } else if (profile.placementTiming === 'soon') {
      priority = 'high';
      reason = 'Viktigt att förbereda innan placering';
    }

    // Specialist fortbildning
    if (profile.role.startsWith('specialist')) {
      priority = 'medium';
      reason = 'Del av kontinuerlig fortbildning';
    }

    // Default reason
    if (!reason) {
      reason = goal.required ? 'Obligatoriskt för din nivå' : 'Rekommenderat för utveckling';
    }

    return {
      goalId,
      goal,
      reason,
      priority,
    };
  }).filter(Boolean) as Array<{
    goalId: string;
    goal: SocialstyrelseMål;
    reason: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
  }>;
}
