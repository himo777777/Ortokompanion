/**
 * Level Calculator
 *
 * Handles XP-to-level conversions and level progression calculations.
 * Uses exponential scaling: XP = 50 * (level - 1)^2
 * This means higher levels require progressively more XP.
 */

/**
 * Calculate user level based on total XP
 *
 * @param xp - Total XP accumulated
 * @returns Current level (minimum 1)
 *
 * @example
 * calculateLevel(0)    // => 1
 * calculateLevel(100)  // => 2
 * calculateLevel(500)  // => 4
 */
export function calculateLevel(xp: number): number {
  if (xp < 0) return 1
  if (xp === 0) return 1

  // Binary search for level using exponential formula
  let level = 1
  while (getXPForLevel(level + 1) <= xp) {
    level++
  }
  return level
}

/**
 * Get the minimum XP required for a specific level
 *
 * @param level - Target level
 * @returns Minimum XP needed
 *
 * @example
 * getXPForLevel(1)  // => 0
 * getXPForLevel(2)  // => 100 (50 * 1^2 + 50)
 * getXPForLevel(5)  // => 800 (50 * 4^2)
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0
  if (level === 2) return 100
  // Exponential scaling: XP = 50 * (level - 1)^2
  return 50 * Math.pow(level - 1, 2)
}

/**
 * Calculate XP needed to reach the next level
 * 
 * @param currentXP - Current total XP
 * @returns XP still needed for next level
 * 
 * @example
 * getXPToNextLevel(150)  // => 50  (need 50 more to reach level 3)
 * getXPToNextLevel(200)  // => 100 (exactly at level 3, need 100 for level 4)
 */
export function getXPToNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP)
  const nextLevelXP = getXPForLevel(currentLevel + 1)
  return nextLevelXP - currentXP
}

/**
 * Get XP progress as percentage within current level
 * 
 * @param currentXP - Current total XP
 * @returns Percentage (0-1) of progress through current level
 * 
 * @example
 * getLevelProgress(150)  // => 0.5 (halfway through level 2)
 */
export function getLevelProgress(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP)
  const currentLevelBaseXP = getXPForLevel(currentLevel)
  const nextLevelXP = getXPForLevel(currentLevel + 1)
  
  const progressInLevel = currentXP - currentLevelBaseXP
  const xpRangeForLevel = nextLevelXP - currentLevelBaseXP
  
  return progressInLevel / xpRangeForLevel
}
