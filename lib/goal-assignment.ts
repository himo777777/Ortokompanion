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
  getAllMålForLevel,
  SocialstyrelseMål,
  LÄKARPROGRAMMET_MÅL,
  AT_MÅL,
  ST_ORTOPEDI_MÅL,
  ST_ALLMÄNMEDICIN_ORTOPEDI_MÅL,
  ST_AKUTSJUKVÅRD_ORTOPEDI_MÅL,
  SPECIALIST_FORTBILDNING_MÅL,
} from '@/data/socialstyrelsen-goals';

/**
 * Assign goals for a specific rotation based on domain
 */
export function assignGoalsForRotation(
  rotation: Rotation,
  userLevel: EducationLevel
): string[] {
  // Get all goals for user's level
  const allGoals = getAllMålForLevel(userLevel as any);

  // Domain-specific keywords to match goals
  const domainKeywords: Record<Domain, string[]> = {
    'trauma': ['trauma', 'fraktur', 'luxation', 'akut', 'skada', 'öppen'],
    'höft': ['höft', 'femur', 'THA', 'höftfraktur', 'artroplastik'],
    'knä': ['knä', 'TKA', 'menisk', 'ligament', 'artroskopi', 'patella'],
    'axel-armbåge': ['axel', 'armbåge', 'rotator', 'humerus', 'impingement'],
    'hand-handled': ['hand', 'finger', 'karpaltunnel', 'handled', 'metacarpal'],
    'fot-fotled': ['fot', 'fotled', 'ankel', 'metatarsal', 'akillessena'],
    'rygg': ['rygg', 'kotpelare', 'vertebra', 'ryggkirurgi', 'spinal'],
    'sport': ['sport', 'idrottsskada', 'rehabilitering', 'korsband'],
    'tumör': ['tumör', 'cancer', 'metastas', 'sarkom', 'skelettumör'],
  };

  const keywords = domainKeywords[rotation.domain] || [];

  // Filter goals that match domain keywords
  const relevantGoals = allGoals.filter(goal => {
    const searchText = `${goal.title} ${goal.description} ${goal.category}`.toLowerCase();
    return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
  });

  // Also include general goals (professionalism, communication, etc.)
  const generalGoals = allGoals.filter(goal =>
    goal.competencyArea === 'professionalism' ||
    goal.competencyArea === 'kommunikation' ||
    goal.competencyArea === 'samverkan'
  );

  // Combine and deduplicate
  const combined = [...new Set([...relevantGoals, ...generalGoals])];

  // Return goal IDs, max 8 per rotation
  return combined.slice(0, 8).map(g => g.id);
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
 * Main function: Auto-assign goals based on user profile
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
    const allGoals = getAllMålForLevel(level as any);
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
  const allGoals = getMålForLevel(level as any);
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
  const allGoals = getMålForLevel(profile.role as any);

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
