/**
 * Level Unlock System
 * Manages progressive unlocking of education levels
 * Ensures proper prerequisite completion
 */

import { EducationLevel } from '@/types/education';
import {
  LEVEL_HIERARCHY,
  getLevelIndex,
  getPreviousLevel,
  getNextLevel,
} from './level-aware-content';

/**
 * Unlock requirements for each level
 */
export interface LevelUnlockRequirements {
  level: EducationLevel;
  prerequisites: {
    previousLevelComplete: boolean;
    minQuestionsCompleted: number;
    minCasesCompleted: number;
    minAccuracy: number; // 0-1
    minDaysAtPreviousLevel: number;
    miniOSCEPassed?: boolean;
  };
}

/**
 * User's progress toward unlocking a level
 */
export interface UnlockProgress {
  level: EducationLevel;
  isUnlocked: boolean;
  isActive: boolean; // Currently studying at this level
  progress: {
    questionsCompleted: number;
    questionsRequired: number;
    casesCompleted: number;
    casesRequired: number;
    accuracy: number;
    daysAtLevel: number;
    daysRequired: number;
    miniOSCEPassed: boolean;
  };
  canUnlockNext: boolean;
  nextLevel?: EducationLevel;
}

/**
 * Gets unlock requirements for a specific level
 *
 * @param level - Education level
 * @returns Unlock requirements
 */
export function getUnlockRequirements(level: EducationLevel): LevelUnlockRequirements {
  const requirements: Record<EducationLevel, LevelUnlockRequirements> = {
    student: {
      level: 'student',
      prerequisites: {
        previousLevelComplete: true, // Always unlocked
        minQuestionsCompleted: 0,
        minCasesCompleted: 0,
        minAccuracy: 0,
        minDaysAtPreviousLevel: 0,
      },
    },
    at: {
      level: 'at',
      prerequisites: {
        previousLevelComplete: true,
        minQuestionsCompleted: 15, // Must complete 15 student questions
        minCasesCompleted: 3, // 3 student cases
        minAccuracy: 0.7, // 70% accuracy
        minDaysAtPreviousLevel: 7, // 1 week as student
      },
    },
    st1: {
      level: 'st1',
      prerequisites: {
        previousLevelComplete: true,
        minQuestionsCompleted: 20,
        minCasesCompleted: 5,
        minAccuracy: 0.75,
        minDaysAtPreviousLevel: 14,
      },
    },
    st2: {
      level: 'st2',
      prerequisites: {
        previousLevelComplete: true,
        minQuestionsCompleted: 25,
        minCasesCompleted: 7,
        minAccuracy: 0.75,
        minDaysAtPreviousLevel: 21,
        miniOSCEPassed: true,
      },
    },
    st3: {
      level: 'st3',
      prerequisites: {
        previousLevelComplete: true,
        minQuestionsCompleted: 30,
        minCasesCompleted: 10,
        minAccuracy: 0.8,
        minDaysAtPreviousLevel: 28,
        miniOSCEPassed: true,
      },
    },
    st4: {
      level: 'st4',
      prerequisites: {
        previousLevelComplete: true,
        minQuestionsCompleted: 35,
        minCasesCompleted: 12,
        minAccuracy: 0.8,
        minDaysAtPreviousLevel: 30,
        miniOSCEPassed: true,
      },
    },
    st5: {
      level: 'st5',
      prerequisites: {
        previousLevelComplete: true,
        minQuestionsCompleted: 40,
        minCasesCompleted: 15,
        minAccuracy: 0.85,
        minDaysAtPreviousLevel: 30,
        miniOSCEPassed: true,
      },
    },
    specialist: {
      level: 'specialist',
      prerequisites: {
        previousLevelComplete: true,
        minQuestionsCompleted: 50,
        minCasesCompleted: 20,
        minAccuracy: 0.85,
        minDaysAtPreviousLevel: 60,
        miniOSCEPassed: true,
      },
    },
  };

  return requirements[level];
}

/**
 * Checks if a level is unlocked for user
 *
 * @param level - Level to check
 * @param userProgress - User's current progress
 * @returns True if unlocked
 */
export function isLevelUnlocked(
  level: EducationLevel,
  userProgress: {
    currentLevel: EducationLevel;
    completedLevels: EducationLevel[];
    questionsCompletedAtLevel: Record<EducationLevel, number>;
    casesCompletedAtLevel: Record<EducationLevel, number>;
    accuracyAtLevel: Record<EducationLevel, number>;
    daysAtLevel: Record<EducationLevel, number>;
    miniOSCEPassedAtLevel: Record<EducationLevel, boolean>;
  }
): boolean {
  // Student level always unlocked
  if (level === 'student') {
    return true;
  }

  // Check if already completed
  if (userProgress.completedLevels.includes(level)) {
    return true;
  }

  // Check if it's the next level in sequence
  const previousLevel = getPreviousLevel(level);
  if (!previousLevel) {
    return true; // No previous level, so unlocked
  }

  // Must complete previous level first
  if (!userProgress.completedLevels.includes(previousLevel)) {
    return false;
  }

  // Check specific requirements
  const requirements = getUnlockRequirements(level);
  const prevQuestionsCompleted =
    userProgress.questionsCompletedAtLevel[previousLevel] || 0;
  const prevCasesCompleted =
    userProgress.casesCompletedAtLevel[previousLevel] || 0;
  const prevAccuracy = userProgress.accuracyAtLevel[previousLevel] || 0;
  const prevDays = userProgress.daysAtLevel[previousLevel] || 0;
  const prevMiniOSCE =
    userProgress.miniOSCEPassedAtLevel[previousLevel] || false;

  // Check all prerequisites
  const meetsQuestions =
    prevQuestionsCompleted >= requirements.prerequisites.minQuestionsCompleted;
  const meetsCases =
    prevCasesCompleted >= requirements.prerequisites.minCasesCompleted;
  const meetsAccuracy =
    prevAccuracy >= requirements.prerequisites.minAccuracy;
  const meetsDays =
    prevDays >= requirements.prerequisites.minDaysAtPreviousLevel;
  const meetsMiniOSCE =
    !requirements.prerequisites.miniOSCEPassed || prevMiniOSCE;

  return (
    meetsQuestions && meetsCases && meetsAccuracy && meetsDays && meetsMiniOSCE
  );
}

/**
 * Gets detailed unlock progress for a level
 *
 * @param level - Level to check
 * @param userProgress - User's progress data
 * @returns Detailed unlock progress
 */
export function getUnlockProgress(
  level: EducationLevel,
  userProgress: {
    currentLevel: EducationLevel;
    completedLevels: EducationLevel[];
    questionsCompletedAtLevel: Record<EducationLevel, number>;
    casesCompletedAtLevel: Record<EducationLevel, number>;
    accuracyAtLevel: Record<EducationLevel, number>;
    daysAtLevel: Record<EducationLevel, number>;
    miniOSCEPassedAtLevel: Record<EducationLevel, boolean>;
  }
): UnlockProgress {
  const requirements = getUnlockRequirements(level);
  const isUnlocked = isLevelUnlocked(level, userProgress);
  const isActive = userProgress.currentLevel === level;

  const questionsCompleted =
    userProgress.questionsCompletedAtLevel[level] || 0;
  const casesCompleted = userProgress.casesCompletedAtLevel[level] || 0;
  const accuracy = userProgress.accuracyAtLevel[level] || 0;
  const daysAtLevel = userProgress.daysAtLevel[level] || 0;
  const miniOSCEPassed =
    userProgress.miniOSCEPassedAtLevel[level] || false;

  const nextLevel = getNextLevel(level);
  const nextRequirements = nextLevel
    ? getUnlockRequirements(nextLevel)
    : null;

  const canUnlockNext =
    nextLevel !== null &&
    questionsCompleted >=
      (nextRequirements?.prerequisites.minQuestionsCompleted || 0) &&
    casesCompleted >=
      (nextRequirements?.prerequisites.minCasesCompleted || 0) &&
    accuracy >= (nextRequirements?.prerequisites.minAccuracy || 0) &&
    daysAtLevel >=
      (nextRequirements?.prerequisites.minDaysAtPreviousLevel || 0) &&
    (!nextRequirements?.prerequisites.miniOSCEPassed || miniOSCEPassed);

  return {
    level,
    isUnlocked,
    isActive,
    progress: {
      questionsCompleted,
      questionsRequired: requirements.prerequisites.minQuestionsCompleted,
      casesCompleted,
      casesRequired: requirements.prerequisites.minCasesCompleted,
      accuracy,
      daysAtLevel,
      daysRequired: requirements.prerequisites.minDaysAtPreviousLevel,
      miniOSCEPassed,
    },
    canUnlockNext,
    nextLevel: nextLevel || undefined,
  };
}

/**
 * Gets all levels with their unlock status
 *
 * @param userProgress - User's progress data
 * @returns Array of unlock progress for all levels
 */
export function getAllLevelsUnlockProgress(userProgress: {
  currentLevel: EducationLevel;
  completedLevels: EducationLevel[];
  questionsCompletedAtLevel: Record<EducationLevel, number>;
  casesCompletedAtLevel: Record<EducationLevel, number>;
  accuracyAtLevel: Record<EducationLevel, number>;
  daysAtLevel: Record<EducationLevel, number>;
  miniOSCEPassedAtLevel: Record<EducationLevel, boolean>;
}): UnlockProgress[] {
  return LEVEL_HIERARCHY.map((level) =>
    getUnlockProgress(level, userProgress)
  );
}

/**
 * Gets missing requirements to unlock a level
 *
 * @param level - Target level
 * @param userProgress - User's progress
 * @returns Array of missing requirements with descriptions
 */
export function getMissingRequirements(
  level: EducationLevel,
  userProgress: {
    currentLevel: EducationLevel;
    completedLevels: EducationLevel[];
    questionsCompletedAtLevel: Record<EducationLevel, number>;
    casesCompletedAtLevel: Record<EducationLevel, number>;
    accuracyAtLevel: Record<EducationLevel, number>;
    daysAtLevel: Record<EducationLevel, number>;
    miniOSCEPassedAtLevel: Record<EducationLevel, boolean>;
  }
): Array<{ requirement: string; current: number; needed: number; description: string }> {
  const previousLevel = getPreviousLevel(level);
  if (!previousLevel) {
    return []; // Student level, no requirements
  }

  if (isLevelUnlocked(level, userProgress)) {
    return []; // Already unlocked
  }

  const requirements = getUnlockRequirements(level);
  const missing: Array<{
    requirement: string;
    current: number;
    needed: number;
    description: string;
  }> = [];

  // Check previous level completion
  if (!userProgress.completedLevels.includes(previousLevel)) {
    missing.push({
      requirement: 'previous_level',
      current: 0,
      needed: 1,
      description: `Slutför ${previousLevel.toUpperCase()} först`,
    });
  }

  const prevQuestionsCompleted =
    userProgress.questionsCompletedAtLevel[previousLevel] || 0;
  if (
    prevQuestionsCompleted < requirements.prerequisites.minQuestionsCompleted
  ) {
    missing.push({
      requirement: 'questions',
      current: prevQuestionsCompleted,
      needed: requirements.prerequisites.minQuestionsCompleted,
      description: `Slutför ${requirements.prerequisites.minQuestionsCompleted - prevQuestionsCompleted} fler frågor`,
    });
  }

  const prevCasesCompleted =
    userProgress.casesCompletedAtLevel[previousLevel] || 0;
  if (prevCasesCompleted < requirements.prerequisites.minCasesCompleted) {
    missing.push({
      requirement: 'cases',
      current: prevCasesCompleted,
      needed: requirements.prerequisites.minCasesCompleted,
      description: `Slutför ${requirements.prerequisites.minCasesCompleted - prevCasesCompleted} fler fall`,
    });
  }

  const prevAccuracy = userProgress.accuracyAtLevel[previousLevel] || 0;
  if (prevAccuracy < requirements.prerequisites.minAccuracy) {
    missing.push({
      requirement: 'accuracy',
      current: Math.round(prevAccuracy * 100),
      needed: Math.round(requirements.prerequisites.minAccuracy * 100),
      description: `Förbättra träffsäkerhet till ${Math.round(requirements.prerequisites.minAccuracy * 100)}%`,
    });
  }

  const prevDays = userProgress.daysAtLevel[previousLevel] || 0;
  if (prevDays < requirements.prerequisites.minDaysAtPreviousLevel) {
    missing.push({
      requirement: 'days',
      current: prevDays,
      needed: requirements.prerequisites.minDaysAtPreviousLevel,
      description: `Studera ${requirements.prerequisites.minDaysAtPreviousLevel - prevDays} dagar till`,
    });
  }

  if (requirements.prerequisites.miniOSCEPassed) {
    const prevMiniOSCE =
      userProgress.miniOSCEPassedAtLevel[previousLevel] || false;
    if (!prevMiniOSCE) {
      missing.push({
        requirement: 'mini_osce',
        current: 0,
        needed: 1,
        description: 'Klara Mini-OSCE',
      });
    }
  }

  return missing;
}

/**
 * Suggests next action to unlock a level
 *
 * @param level - Target level
 * @param userProgress - User's progress
 * @returns Suggested action
 */
export function suggestNextAction(
  level: EducationLevel,
  userProgress: {
    currentLevel: EducationLevel;
    completedLevels: EducationLevel[];
    questionsCompletedAtLevel: Record<EducationLevel, number>;
    casesCompletedAtLevel: Record<EducationLevel, number>;
    accuracyAtLevel: Record<EducationLevel, number>;
    daysAtLevel: Record<EducationLevel, number>;
    miniOSCEPassedAtLevel: Record<EducationLevel, boolean>;
  }
): {
  action: 'complete_questions' | 'complete_cases' | 'improve_accuracy' | 'wait' | 'take_mini_osce' | 'complete_previous_level' | 'unlocked';
  message: string;
  priority: number; // 1-5, higher = more urgent
} {
  if (isLevelUnlocked(level, userProgress)) {
    return {
      action: 'unlocked',
      message: `${level.toUpperCase()} är upplåst!`,
      priority: 5,
    };
  }

  const missing = getMissingRequirements(level, userProgress);
  if (missing.length === 0) {
    return {
      action: 'unlocked',
      message: 'Nivån är upplåst!',
      priority: 5,
    };
  }

  // Prioritize actions
  const previousLevelMissing = missing.find((m) => m.requirement === 'previous_level');
  if (previousLevelMissing) {
    return {
      action: 'complete_previous_level',
      message: previousLevelMissing.description,
      priority: 5,
    };
  }

  const miniOSCEMissing = missing.find((m) => m.requirement === 'mini_osce');
  if (miniOSCEMissing) {
    return {
      action: 'take_mini_osce',
      message: miniOSCEMissing.description,
      priority: 4,
    };
  }

  const questionsMissing = missing.find((m) => m.requirement === 'questions');
  if (questionsMissing) {
    return {
      action: 'complete_questions',
      message: questionsMissing.description,
      priority: 4,
    };
  }

  const casesMissing = missing.find((m) => m.requirement === 'cases');
  if (casesMissing) {
    return {
      action: 'complete_cases',
      message: casesMissing.description,
      priority: 3,
    };
  }

  const accuracyMissing = missing.find((m) => m.requirement === 'accuracy');
  if (accuracyMissing) {
    return {
      action: 'improve_accuracy',
      message: accuracyMissing.description,
      priority: 3,
    };
  }

  const daysMissing = missing.find((m) => m.requirement === 'days');
  if (daysMissing) {
    return {
      action: 'wait',
      message: daysMissing.description,
      priority: 1,
    };
  }

  return {
    action: 'unlocked',
    message: 'Nivån är upplåst!',
    priority: 5,
  };
}
