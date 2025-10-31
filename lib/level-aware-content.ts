/**
 * Level-Aware Content Filtering System
 * Filters and organizes content by education level
 * Ensures proper progression from student → specialist
 */

import { EducationLevel } from '@/types/education';
import { MCQQuestion } from '@/data/questions';
import { CaseStudy } from '@/types/education';
import { Domain } from '@/types/onboarding';
import { DifficultyBand } from '@/types/progression';

/**
 * Education level hierarchy
 * Used to determine content accessibility
 */
export const LEVEL_HIERARCHY: EducationLevel[] = [
  'student',
  'at',
  'st1',
  'st2',
  'st3',
  'st4',
  'st5',
  'specialist',
];

/**
 * Gets numeric index for education level
 * Higher number = more advanced
 */
export function getLevelIndex(level: EducationLevel): number {
  return LEVEL_HIERARCHY.indexOf(level);
}

/**
 * Checks if user level meets minimum requirement
 *
 * @param userLevel - Current user education level
 * @param requiredLevel - Required minimum level
 * @returns True if user meets requirement
 */
export function meetsLevelRequirement(
  userLevel: EducationLevel,
  requiredLevel: EducationLevel
): boolean {
  return getLevelIndex(userLevel) >= getLevelIndex(requiredLevel);
}

/**
 * Filters questions by education level
 * Returns questions appropriate for user's level
 *
 * @param questions - All questions
 * @param userLevel - User's education level
 * @param includeEarlier - Include content from earlier levels (default: true)
 * @returns Filtered questions
 */
export function getQuestionsForLevel(
  questions: MCQQuestion[],
  userLevel: EducationLevel,
  includeEarlier: boolean = true
): MCQQuestion[] {
  const userLevelIndex = getLevelIndex(userLevel);

  return questions.filter((q) => {
    const questionLevelIndex = getLevelIndex(q.level);

    if (includeEarlier) {
      // Include all questions up to and including user's level
      return questionLevelIndex <= userLevelIndex;
    } else {
      // Only exact level match
      return q.level === userLevel;
    }
  });
}

/**
 * Gets questions for a specific domain and level
 *
 * @param questions - All questions
 * @param domain - Target domain
 * @param userLevel - User's education level
 * @param includeEarlier - Include earlier level content
 * @returns Filtered questions
 */
export function getQuestionsForDomainAndLevel(
  questions: MCQQuestion[],
  domain: Domain,
  userLevel: EducationLevel,
  includeEarlier: boolean = true
): MCQQuestion[] {
  const levelFiltered = getQuestionsForLevel(questions, userLevel, includeEarlier);
  return levelFiltered.filter((q) => q.domain === domain);
}

/**
 * Gets case studies for education level
 *
 * @param cases - All case studies
 * @param userLevel - User's education level
 * @param includeEarlier - Include earlier level content
 * @returns Filtered cases
 */
export function getCasesForLevel(
  cases: CaseStudy[],
  userLevel: EducationLevel,
  includeEarlier: boolean = true
): CaseStudy[] {
  const userLevelIndex = getLevelIndex(userLevel);

  return cases.filter((c) => {
    const caseLevelIndex = getLevelIndex(c.level);

    if (includeEarlier) {
      return caseLevelIndex <= userLevelIndex;
    } else {
      return c.level === userLevel;
    }
  });
}

/**
 * Gets content statistics by level
 *
 * @param questions - All questions
 * @param cases - All case studies
 * @param userLevel - User's education level
 * @returns Statistics object
 */
export function getContentStatsByLevel(
  questions: MCQQuestion[],
  cases: CaseStudy[],
  userLevel: EducationLevel
): {
  questionsAtLevel: number;
  questionsAvailable: number;
  casesAtLevel: number;
  casesAvailable: number;
  byDomain: Record<Domain, { questions: number; cases: number }>;
} {
  const questionsAtLevel = questions.filter((q) => q.level === userLevel).length;
  const questionsAvailable = getQuestionsForLevel(questions, userLevel).length;
  const casesAtLevel = cases.filter((c) => c.level === userLevel).length;
  const casesAvailable = getCasesForLevel(cases, userLevel).length;

  // Group by domain
  const byDomain: Record<string, { questions: number; cases: number }> = {};
  const domains: Domain[] = [
    'trauma',
    'axel-armbåge',
    'hand-handled',
    'höft',
    'knä',
    'fot-fotled',
    'rygg',
    'sport',
    'tumör',
  ];

  domains.forEach((domain) => {
    const domainQuestions = getQuestionsForDomainAndLevel(
      questions,
      domain,
      userLevel
    );
    const domainCases = getCasesForLevel(cases, userLevel).filter(
      (c) => c.domain === domain
    );

    byDomain[domain] = {
      questions: domainQuestions.length,
      cases: domainCases.length,
    };
  });

  return {
    questionsAtLevel,
    questionsAvailable,
    casesAtLevel,
    casesAvailable,
    byDomain: byDomain as Record<Domain, { questions: number; cases: number }>,
  };
}

/**
 * Recommends appropriate difficulty band for education level
 *
 * @param level - Education level
 * @returns Recommended starting band
 */
export function getRecommendedBandForLevel(level: EducationLevel): DifficultyBand {
  const bandMap: Record<EducationLevel, DifficultyBand> = {
    student: 'A',
    at: 'B',
    st1: 'B',
    st2: 'C',
    st3: 'C',
    st4: 'D',
    st5: 'D',
    specialist: 'E',
  };

  return bandMap[level];
}

/**
 * Gets next education level in progression
 *
 * @param currentLevel - Current education level
 * @returns Next level or null if already at highest
 */
export function getNextLevel(currentLevel: EducationLevel): EducationLevel | null {
  const currentIndex = getLevelIndex(currentLevel);
  if (currentIndex >= LEVEL_HIERARCHY.length - 1) {
    return null; // Already at specialist
  }
  return LEVEL_HIERARCHY[currentIndex + 1];
}

/**
 * Gets previous education level
 *
 * @param currentLevel - Current education level
 * @returns Previous level or null if already at lowest
 */
export function getPreviousLevel(currentLevel: EducationLevel): EducationLevel | null {
  const currentIndex = getLevelIndex(currentLevel);
  if (currentIndex <= 0) {
    return null; // Already at student
  }
  return LEVEL_HIERARCHY[currentIndex - 1];
}

/**
 * Generates level progression roadmap
 *
 * @param currentLevel - User's current level
 * @param targetLevel - Target level to reach
 * @returns Array of levels to progress through
 */
export function getProgressionPath(
  currentLevel: EducationLevel,
  targetLevel: EducationLevel
): EducationLevel[] {
  const startIndex = getLevelIndex(currentLevel);
  const endIndex = getLevelIndex(targetLevel);

  if (startIndex >= endIndex) {
    return [currentLevel]; // Already at or past target
  }

  return LEVEL_HIERARCHY.slice(startIndex, endIndex + 1);
}

/**
 * Estimates time to complete level (in days)
 * Based on average content and complexity
 *
 * @param level - Education level
 * @param questionsCount - Number of questions at this level
 * @param casesCount - Number of cases at this level
 * @returns Estimated days
 */
export function estimateLevelCompletionTime(
  level: EducationLevel,
  questionsCount: number,
  casesCount: number
): number {
  // Estimates:
  // - 5 questions per day (Band A-B)
  // - 3 questions per day (Band C-D-E)
  // - 1 case per 2 days
  // - Multiply by complexity factor

  const complexityFactor: Record<EducationLevel, number> = {
    student: 1.0,
    at: 1.2,
    st1: 1.3,
    st2: 1.5,
    st3: 1.7,
    st4: 2.0,
    st5: 2.2,
    specialist: 2.5,
  };

  const band = getRecommendedBandForLevel(level);
  const questionsPerDay = ['A', 'B'].includes(band) ? 5 : 3;
  const caseDays = casesCount * 2;

  const questionDays = questionsCount / questionsPerDay;
  const totalDays = (questionDays + caseDays) * complexityFactor[level];

  return Math.ceil(totalDays);
}

/**
 * Checks if user should advance to next level
 *
 * @param currentLevel - User's current level
 * @param completionRate - Completion rate at current level (0-1)
 * @param avgAccuracy - Average accuracy (0-1)
 * @param daysSinceStart - Days at current level
 * @returns True if ready to advance
 */
export function shouldAdvanceLevel(
  currentLevel: EducationLevel,
  completionRate: number,
  avgAccuracy: number,
  daysSinceStart: number
): boolean {
  // Criteria for advancement:
  // 1. Completion: ≥80% of level content
  // 2. Accuracy: ≥75% average
  // 3. Time: At least 14 days at level (except student)
  // 4. Not already at highest level

  if (currentLevel === 'specialist') {
    return false; // Already at max
  }

  const minCompletionRate = 0.8;
  const minAccuracy = 0.75;
  const minDays = currentLevel === 'student' ? 7 : 14;

  return (
    completionRate >= minCompletionRate &&
    avgAccuracy >= minAccuracy &&
    daysSinceStart >= minDays
  );
}

/**
 * Gets level display information
 *
 * @param level - Education level
 * @returns Display info object
 */
export function getLevelDisplayInfo(level: EducationLevel): {
  name: string;
  shortName: string;
  color: string;
  description: string;
  focusAreas: string[];
} {
  const displayInfo: Record<
    EducationLevel,
    {
      name: string;
      shortName: string;
      color: string;
      description: string;
      focusAreas: string[];
    }
  > = {
    student: {
      name: 'Läkarstudent',
      shortName: 'Student',
      color: 'blue',
      description: 'Grundläggande ortopedi och traumatologi',
      focusAreas: ['Basala frakturer', 'Undersökningstekniker', 'Akut omhändertagande'],
    },
    at: {
      name: 'AT-läkare',
      shortName: 'AT',
      color: 'green',
      description: 'Allmän tjänstgöring med ortopedi rotation',
      focusAreas: ['Vanliga skador', 'Gips och ortoser', 'Remisskriterier'],
    },
    st1: {
      name: 'ST-läkare År 1',
      shortName: 'ST1',
      color: 'purple',
      description: 'Specialiseringstjänstgöring – grund',
      focusAreas: ['Frakturbehandling', 'Preoperativ planering', 'Journalföring'],
    },
    st2: {
      name: 'ST-läkare År 2',
      shortName: 'ST2',
      color: 'purple',
      description: 'Specialiseringstjänstgöring – fortsättning',
      focusAreas: ['Operativa tekniker', 'Komplikationer', 'Proteser grund'],
    },
    st3: {
      name: 'ST-läkare År 3',
      shortName: 'ST3',
      color: 'purple',
      description: 'Specialiseringstjänstgöring – fördjupning',
      focusAreas: ['Artroplastik', 'Artroskopi', 'Spine grund'],
    },
    st4: {
      name: 'ST-läkare År 4',
      shortName: 'ST4',
      color: 'orange',
      description: 'Specialiseringstjänstgöring – avancerad',
      focusAreas: ['Komplex trauma', 'Revision kirurgi', 'Subspecialisering'],
    },
    st5: {
      name: 'ST-läkare År 5',
      shortName: 'ST5',
      color: 'orange',
      description: 'Specialiseringstjänstgöring – senior',
      focusAreas: ['Självständiga operationer', 'Handledning', 'Forskning'],
    },
    specialist: {
      name: 'Specialist',
      shortName: 'Spec',
      color: 'red',
      description: 'Specialistkompetens ortopedi',
      focusAreas: ['Expert nivå', 'Rare cases', 'Subspecialisering fördjupning'],
    },
  };

  return displayInfo[level];
}
