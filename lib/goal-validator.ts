/**
 * Goal Validator
 * Validates goal selections against user education level and prerequisites
 */

export interface GoalValidationResult {
  isValid: boolean
  errors: string[]
}

// Level hierarchy: student < at/bt (parallel) < st1 < st2 < st3 < specialist
const LEVEL_HIERARCHY = [
  'student',
  'at',
  'bt',
  'st1',
  'st2',
  'st3',
  'specialist',
  'specialist-advanced'
]

// AT and BT are parallel tracks at the same level
const EQUIVALENT_LEVELS: Record<string, string[]> = {
  'at': ['at', 'bt'],
  'bt': ['at', 'bt'],
}

function getLevelRank(level: string): number {
  const index = LEVEL_HIERARCHY.indexOf(level.toLowerCase())
  return index === -1 ? 0 : index
}

function extractLevelFromGoalId(goalId: string): string {
  // Extract level prefix from goal ID (e.g., 'st-trauma-001' -> 'st', 'bt-basics-001' -> 'bt')
  const match = goalId.match(/^(st\d?|at|bt|student|specialist)/)
  return match ? match[1] : 'student'
}

export function validateGoals(goalIds: string[], userLevel: string): GoalValidationResult {
  const errors: string[] = []

  // Empty goal list is valid
  if (!goalIds || goalIds.length === 0) {
    return { isValid: true, errors: [] }
  }

  // Check for duplicates
  const duplicates = goalIds.filter((goal, index) => goalIds.indexOf(goal) !== index)
  if (duplicates.length > 0) {
    const uniqueDuplicates = Array.from(new Set(duplicates))
    errors.push(`duplicate goals found: ${uniqueDuplicates.join(', ')}`)
  }

  // Check if goals are compatible with user level
  const userRank = getLevelRank(userLevel)
  for (const goalId of goalIds) {
    if (!isGoalCompatible(goalId, userLevel)) {
      const goalLevel = extractLevelFromGoalId(goalId)
      const goalRank = getLevelRank(goalLevel)
      if (goalRank > userRank) {
        errors.push(`Goal ${goalId} requires level ${goalLevel} but user is ${userLevel}`)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function isGoalCompatible(goalId: string, userLevel: string): boolean {
  const goalLevel = extractLevelFromGoalId(goalId)

  // Check if levels are equivalent (e.g., AT and BT)
  const equivalentLevels = EQUIVALENT_LEVELS[userLevel.toLowerCase()]
  if (equivalentLevels && equivalentLevels.includes(goalLevel.toLowerCase())) {
    return true
  }

  const goalRank = getLevelRank(goalLevel)
  const userRank = getLevelRank(userLevel)

  return userRank >= goalRank
}

export function getGoalDependencies(goalId: string): string[] {
  // Extract level and check for advanced goals
  if (goalId.includes('advanced')) {
    // Advanced goals depend on basic version
    const basicGoalId = goalId.replace('-advanced', '')
    return [basicGoalId]
  }

  // Basic goals have no dependencies
  return []
}
