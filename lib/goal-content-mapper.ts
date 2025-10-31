/**
 * Goal-Content Mapping System
 * Maps content (questions, cases) to Socialstyrelsen learning objectives
 * Tracks progress toward goal achievement
 */

import { MCQQuestion } from '@/data/questions';
import { CaseStudy } from '@/types/education';
import { SocialstyrelseMål } from '@/data/socialstyrelsen-goals';
import { Domain } from '@/types/onboarding';

/**
 * Content-Goal Mapping
 * Links a piece of content to one or more goals
 */
export interface ContentGoalMapping {
  contentId: string;
  contentType: 'question' | 'case' | 'mini-osce' | 'pearl';
  goalIds: string[];
  domain: Domain;
  contributionWeight: number; // 0-1, how much this content contributes to goal
}

/**
 * Goal Progress Calculation
 */
export interface GoalProgress {
  goalId: string;
  totalContent: number; // Total content items linked to this goal
  completedContent: number; // Completed content items
  percentage: number; // 0-100
  lastActivity?: Date;
  achieved: boolean; // True if 100% complete
}

/**
 * Maps content to goals based on relatedGoals field
 *
 * @param content - Question or case with relatedGoals
 * @returns Array of goal IDs
 */
export function mapContentToGoals(
  content: MCQQuestion | CaseStudy
): string[] {
  return content.relatedGoals || [];
}

/**
 * Gets all content linked to a specific goal
 *
 * @param goalId - Socialstyrelsen goal ID
 * @param allQuestions - All MCQ questions
 * @param allCases - All case studies
 * @returns Content items linked to this goal
 */
export function getContentByGoal(
  goalId: string,
  allQuestions: MCQQuestion[],
  allCases: CaseStudy[]
): {
  questions: MCQQuestion[];
  cases: CaseStudy[];
  totalItems: number;
} {
  const questions = allQuestions.filter(
    (q) => q.relatedGoals && q.relatedGoals.includes(goalId)
  );

  const cases = allCases.filter(
    (c) => c.relatedGoals && c.relatedGoals.includes(goalId)
  );

  return {
    questions,
    cases,
    totalItems: questions.length + cases.length,
  };
}

/**
 * Gets all goals addressed by a domain
 *
 * @param domain - Orthopedic domain
 * @param allQuestions - All questions
 * @param allGoals - All Socialstyrelsen goals
 * @returns Goals relevant to this domain
 */
export function getGoalsByDomain(
  domain: Domain,
  allQuestions: MCQQuestion[],
  allGoals: SocialstyrelseMål[]
): SocialstyrelseMål[] {
  // Get all goal IDs from questions in this domain
  const goalIds = new Set<string>();

  allQuestions
    .filter((q) => q.domain === domain)
    .forEach((q) => {
      if (q.relatedGoals) {
        q.relatedGoals.forEach((goalId) => goalIds.add(goalId));
      }
    });

  // Return goal objects
  return allGoals.filter((goal) => goalIds.has(goal.id));
}

/**
 * Calculates progress toward a specific goal
 *
 * @param goalId - Goal ID
 * @param allQuestions - All questions
 * @param allCases - All cases
 * @param completedQuestionIds - IDs of completed questions
 * @param completedCaseIds - IDs of completed cases
 * @returns Progress calculation
 */
export function calculateGoalProgress(
  goalId: string,
  allQuestions: MCQQuestion[],
  allCases: CaseStudy[],
  completedQuestionIds: Set<string>,
  completedCaseIds: Set<string>
): GoalProgress {
  const content = getContentByGoal(goalId, allQuestions, allCases);

  const completedQuestions = content.questions.filter((q) =>
    completedQuestionIds.has(q.id)
  ).length;

  const completedCases = content.cases.filter((c) =>
    completedCaseIds.has(c.id)
  ).length;

  const completedContent = completedQuestions + completedCases;
  const totalContent = content.totalItems;

  const percentage =
    totalContent > 0 ? (completedContent / totalContent) * 100 : 0;

  return {
    goalId,
    totalContent,
    completedContent,
    percentage,
    achieved: percentage >= 100,
  };
}

/**
 * Gets all goals with their progress
 *
 * @param allGoals - All Socialstyrelsen goals
 * @param allQuestions - All questions
 * @param allCases - All cases
 * @param completedQuestionIds - Completed question IDs
 * @param completedCaseIds - Completed case IDs
 * @returns Array of goals with progress
 */
export function getAllGoalsProgress(
  allGoals: SocialstyrelseMål[],
  allQuestions: MCQQuestion[],
  allCases: CaseStudy[],
  completedQuestionIds: Set<string>,
  completedCaseIds: Set<string>
): Array<SocialstyrelseMål & { progress: GoalProgress }> {
  return allGoals.map((goal) => ({
    ...goal,
    progress: calculateGoalProgress(
      goal.id,
      allQuestions,
      allCases,
      completedQuestionIds,
      completedCaseIds
    ),
  }));
}

/**
 * Groups goals by competency area
 *
 * @param goalsWithProgress - Goals with progress data
 * @returns Goals grouped by competency
 */
export function groupGoalsByCompetency(
  goalsWithProgress: Array<SocialstyrelseMål & { progress: GoalProgress }>
): Record<
  string,
  {
    goals: Array<SocialstyrelseMål & { progress: GoalProgress }>;
    totalGoals: number;
    achievedGoals: number;
    percentage: number;
  }
> {
  const grouped: Record<
    string,
    {
      goals: Array<SocialstyrelseMål & { progress: GoalProgress }>;
      totalGoals: number;
      achievedGoals: number;
      percentage: number;
    }
  > = {};

  goalsWithProgress.forEach((goal) => {
    const competency = goal.competencyArea || 'other';

    if (!grouped[competency]) {
      grouped[competency] = {
        goals: [],
        totalGoals: 0,
        achievedGoals: 0,
        percentage: 0,
      };
    }

    grouped[competency].goals.push(goal);
    grouped[competency].totalGoals++;

    if (goal.progress.achieved) {
      grouped[competency].achievedGoals++;
    }
  });

  // Calculate percentages
  Object.keys(grouped).forEach((competency) => {
    const group = grouped[competency];
    group.percentage =
      group.totalGoals > 0
        ? (group.achievedGoals / group.totalGoals) * 100
        : 0;
  });

  return grouped;
}

/**
 * Gets recommended content to work on next goals
 *
 * @param allGoals - All goals
 * @param allQuestions - All questions
 * @param allCases - All cases
 * @param completedQuestionIds - Completed questions
 * @param completedCaseIds - Completed cases
 * @param limit - Max recommendations
 * @returns Recommended content
 */
export function getRecommendedContentForGoals(
  allGoals: SocialstyrelseMål[],
  allQuestions: MCQQuestion[],
  allCases: CaseStudy[],
  completedQuestionIds: Set<string>,
  completedCaseIds: Set<string>,
  limit: number = 5
): {
  questions: MCQQuestion[];
  cases: CaseStudy[];
  targetGoalIds: string[];
} {
  // Find goals with lowest progress (but not 0)
  const goalsWithProgress = getAllGoalsProgress(
    allGoals,
    allQuestions,
    allCases,
    completedQuestionIds,
    completedCaseIds
  );

  // Sort by progress (ascending) and filter out completed goals
  const incompleteGoals = goalsWithProgress
    .filter((g) => !g.progress.achieved && g.progress.totalContent > 0)
    .sort((a, b) => a.progress.percentage - b.progress.percentage)
    .slice(0, 3); // Top 3 goals to work on

  const targetGoalIds = incompleteGoals.map((g) => g.id);

  // Get content for these goals that hasn't been completed
  const recommendedQuestions: MCQQuestion[] = [];
  const recommendedCases: CaseStudy[] = [];

  incompleteGoals.forEach((goal) => {
    const content = getContentByGoal(goal.id, allQuestions, allCases);

    // Add uncompleted questions
    content.questions
      .filter((q) => !completedQuestionIds.has(q.id))
      .forEach((q) => {
        if (
          !recommendedQuestions.find((rq) => rq.id === q.id) &&
          recommendedQuestions.length < limit
        ) {
          recommendedQuestions.push(q);
        }
      });

    // Add uncompleted cases
    content.cases
      .filter((c) => !completedCaseIds.has(c.id))
      .forEach((c) => {
        if (
          !recommendedCases.find((rc) => rc.id === c.id) &&
          recommendedCases.length < limit
        ) {
          recommendedCases.push(c);
        }
      });
  });

  return {
    questions: recommendedQuestions.slice(0, limit),
    cases: recommendedCases.slice(0, Math.floor(limit / 2)),
    targetGoalIds,
  };
}

/**
 * Tracks which goals were addressed in a session
 *
 * @param completedContentIds - IDs of content completed
 * @param allQuestions - All questions
 * @param allCases - All cases
 * @returns Goal IDs addressed
 */
export function getGoalsAddressedInSession(
  completedContentIds: string[],
  allQuestions: MCQQuestion[],
  allCases: CaseStudy[]
): string[] {
  const goalIds = new Set<string>();

  completedContentIds.forEach((contentId) => {
    // Check questions
    const question = allQuestions.find((q) => q.id === contentId);
    if (question && question.relatedGoals) {
      question.relatedGoals.forEach((goalId) => goalIds.add(goalId));
    }

    // Check cases
    const caseStudy = allCases.find((c) => c.id === contentId);
    if (caseStudy && caseStudy.relatedGoals) {
      caseStudy.relatedGoals.forEach((goalId) => goalIds.add(goalId));
    }
  });

  return Array.from(goalIds);
}

/**
 * Gets goals that are ready for assessment (≥80% complete)
 *
 * @param goalsWithProgress - Goals with progress
 * @returns Goals ready for assessment
 */
export function getGoalsReadyForAssessment(
  goalsWithProgress: Array<SocialstyrelseMål & { progress: GoalProgress }>
): Array<SocialstyrelseMål & { progress: GoalProgress }> {
  return goalsWithProgress.filter(
    (g) => g.progress.percentage >= 80 && !g.progress.achieved
  );
}

/**
 * Generates goal achievement summary
 *
 * @param allGoals - All goals
 * @param allQuestions - All questions
 * @param allCases - All cases
 * @param completedQuestionIds - Completed questions
 * @param completedCaseIds - Completed cases
 * @returns Summary statistics
 */
export function generateGoalSummary(
  allGoals: SocialstyrelseMål[],
  allQuestions: MCQQuestion[],
  allCases: CaseStudy[],
  completedQuestionIds: Set<string>,
  completedCaseIds: Set<string>
): {
  totalGoals: number;
  achievedGoals: number;
  percentage: number;
  byCompetency: Record<string, { total: number; achieved: number; percentage: number }>;
  readyForAssessment: number;
  inProgress: number;
  notStarted: number;
} {
  const goalsWithProgress = getAllGoalsProgress(
    allGoals,
    allQuestions,
    allCases,
    completedQuestionIds,
    completedCaseIds
  );

  const achievedGoals = goalsWithProgress.filter((g) => g.progress.achieved).length;
  const readyForAssessment = getGoalsReadyForAssessment(goalsWithProgress).length;
  const inProgress = goalsWithProgress.filter(
    (g) => g.progress.percentage > 0 && g.progress.percentage < 100
  ).length;
  const notStarted = goalsWithProgress.filter(
    (g) => g.progress.percentage === 0
  ).length;

  const byCompetency: Record<string, { total: number; achieved: number; percentage: number }> = {};
  const grouped = groupGoalsByCompetency(goalsWithProgress);

  Object.keys(grouped).forEach((competency) => {
    byCompetency[competency] = {
      total: grouped[competency].totalGoals,
      achieved: grouped[competency].achievedGoals,
      percentage: grouped[competency].percentage,
    };
  });

  return {
    totalGoals: allGoals.length,
    achievedGoals,
    percentage: allGoals.length > 0 ? (achievedGoals / allGoals.length) * 100 : 0,
    byCompetency,
    readyForAssessment,
    inProgress,
    notStarted,
  };
}

/**
 * Estimates time to complete a goal (in days)
 *
 * @param goalId - Goal ID
 * @param allQuestions - All questions
 * @param allCases - All cases
 * @param completedQuestionIds - Completed questions
 * @param avgQuestionsPerDay - Average questions completed per day
 * @returns Estimated days
 */
export function estimateGoalCompletionTime(
  goalId: string,
  allQuestions: MCQQuestion[],
  allCases: CaseStudy[],
  completedQuestionIds: Set<string>,
  completedCaseIds: Set<string>,
  avgQuestionsPerDay: number = 5
): number {
  const content = getContentByGoal(goalId, allQuestions, allCases);

  const remainingQuestions = content.questions.filter(
    (q) => !completedQuestionIds.has(q.id)
  ).length;

  const remainingCases = content.cases.filter(
    (c) => !completedCaseIds.has(c.id)
  ).length;

  // Estimate: 1 case = 2 questions in time
  const totalQuestionEquivalents = remainingQuestions + remainingCases * 2;

  return Math.ceil(totalQuestionEquivalents / avgQuestionsPerDay);
}
