/**
 * Goal ID Compatibility Layer
 * Handles migration from old goal ID system to new focused-socialstyrelsen-goals
 *
 * Old system: lp-01, bt-01, at-01, st1-01, st2-01, etc.
 * New system: lex-001, akut-001, allm-001, ort-001, etc.
 */

import { ALL_FOCUSED_GOALS } from '@/data/focused-socialstyrelsen-goals';

// Legacy goal ID patterns
const LEGACY_PATTERNS = {
  'lp-': 'läkarexamen', // Läkarprogrammet
  'bt-': 'bt',
  'at-': 'at',
  'st1-': 'st',
  'st2-': 'st',
  'st3-': 'st',
  'st4-': 'st',
  'st5-': 'st',
  'delmål-': 'läkarexamen',
};

/**
 * Check if a goal ID is using legacy format
 */
export function isLegacyGoalId(goalId: string): boolean {
  return Object.keys(LEGACY_PATTERNS).some((pattern) => goalId.startsWith(pattern));
}

/**
 * Get program type from legacy goal ID
 */
function getProgramFromLegacyId(goalId: string): string | null {
  for (const [pattern, program] of Object.entries(LEGACY_PATTERNS)) {
    if (goalId.startsWith(pattern)) {
      return program;
    }
  }
  return null;
}

/**
 * Find best matching goal in new system for legacy goal ID
 * Uses fuzzy matching based on program and competency areas
 */
export function findCompatibleGoal(legacyGoalId: string): {
  id: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
} | null {
  const program = getProgramFromLegacyId(legacyGoalId);

  if (!program) {
    console.warn(`[Goal Compatibility] Unknown legacy pattern: ${legacyGoalId}`);
    return null;
  }

  // Find goals matching the program
  const matchingGoals = ALL_FOCUSED_GOALS.filter((g) => g.program === program);

  if (matchingGoals.length === 0) {
    console.warn(`[Goal Compatibility] No goals found for program: ${program} (legacy: ${legacyGoalId})`);
    return null;
  }

  // For now, map to first required goal in that program
  // This is a conservative approach that ensures users work on required goals
  const firstRequiredGoal = matchingGoals.find((g) => g.required);

  if (firstRequiredGoal) {
    return {
      id: firstRequiredGoal.id,
      confidence: 'medium',
      reason: `Mapped legacy ${legacyGoalId} to first required ${program} goal`,
    };
  }

  // Fallback to first goal in program
  return {
    id: matchingGoals[0].id,
    confidence: 'low',
    reason: `Mapped legacy ${legacyGoalId} to first ${program} goal (fallback)`,
  };
}

/**
 * Normalize goal IDs - convert legacy IDs to new system
 * Returns array of new goal IDs
 */
export function normalizeGoalIds(goalIds: string[]): {
  normalized: string[];
  warnings: string[];
} {
  const normalized: string[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();

  for (const goalId of goalIds) {
    // Already new format - use directly
    if (!isLegacyGoalId(goalId)) {
      if (!seen.has(goalId)) {
        normalized.push(goalId);
        seen.add(goalId);
      }
      continue;
    }

    // Legacy format - try to map
    const compatible = findCompatibleGoal(goalId);

    if (compatible) {
      if (!seen.has(compatible.id)) {
        normalized.push(compatible.id);
        seen.add(compatible.id);
      }

      if (compatible.confidence === 'low') {
        warnings.push(`${goalId} → ${compatible.id} (${compatible.reason})`);
      }
    } else {
      warnings.push(`Could not map legacy goal: ${goalId}`);
    }
  }

  return { normalized, warnings };
}

/**
 * Get goal by ID with fallback to legacy mapping
 */
export function getGoalByIdCompatible(goalId: string): {
  found: boolean;
  goalId: string | null;
  wasLegacy: boolean;
  warning?: string;
} {
  // Check if it exists in new system
  const goal = ALL_FOCUSED_GOALS.find((g) => g.id === goalId);

  if (goal) {
    return {
      found: true,
      goalId: goal.id,
      wasLegacy: false,
    };
  }

  // Try legacy mapping
  if (isLegacyGoalId(goalId)) {
    const compatible = findCompatibleGoal(goalId);

    if (compatible) {
      return {
        found: true,
        goalId: compatible.id,
        wasLegacy: true,
        warning: compatible.reason,
      };
    }
  }

  return {
    found: false,
    goalId: null,
    wasLegacy: isLegacyGoalId(goalId),
    warning: `Goal not found: ${goalId}`,
  };
}

/**
 * Log legacy goal usage statistics
 */
export function analyzeLegacyGoalUsage(goalIds: string[]): {
  total: number;
  legacy: number;
  new: number;
  unmappable: number;
  details: Record<string, number>;
} {
  const details: Record<string, number> = {};
  let legacy = 0;
  let unmappable = 0;

  for (const goalId of goalIds) {
    if (isLegacyGoalId(goalId)) {
      legacy++;
      const program = getProgramFromLegacyId(goalId);
      if (program) {
        details[program] = (details[program] || 0) + 1;
      } else {
        unmappable++;
      }
    }
  }

  return {
    total: goalIds.length,
    legacy,
    new: goalIds.length - legacy,
    unmappable,
    details,
  };
}
