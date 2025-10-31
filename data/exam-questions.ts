/**
 * Exam Questions - Combined Export
 * All exam preparation questions for OrtoKompanion
 */

import { ExamQuestion, ExamType } from '@/types/exam';
import { specialistExamQuestions, specialistQuestionsByDomain } from './exam-questions-specialist';
import { atExamQuestions, atQuestionsByCategory } from './exam-questions-at';
import { kunskapsprovQuestions, kunskapsprovQuestionsByCategory } from './exam-questions-kunskapsprov';

/**
 * All exam questions combined
 */
export const allExamQuestions: ExamQuestion[] = [
  ...specialistExamQuestions,
  ...atExamQuestions,
  ...kunskapsprovQuestions,
];

/**
 * Questions by exam type
 */
export const questionsByExamType: Record<ExamType, ExamQuestion[]> = {
  'specialist-ortopedi': specialistExamQuestions,
  'at-tentamen': atExamQuestions,
  'kunskapsprovet': kunskapsprovQuestions,
};

/**
 * Get questions for specific exam type
 */
export function getQuestionsForExam(examType: ExamType): ExamQuestion[] {
  return questionsByExamType[examType] || [];
}

/**
 * Get exam statistics
 */
export function getExamStats(examType: ExamType) {
  const questions = getQuestionsForExam(examType);

  const difficultyCount = {
    standard: questions.filter(q => q.difficulty === 'standard').length,
    challenging: questions.filter(q => q.difficulty === 'challenging').length,
    expert: questions.filter(q => q.difficulty === 'expert').length,
  };

  const domainCount: Record<string, number> = {};
  questions.forEach(q => {
    domainCount[q.domain] = (domainCount[q.domain] || 0) + 1;
  });

  const sourceTypes = {
    previousExam: questions.filter(q =>
      q.sources.some(s => s.type === 'previous-exam')
    ).length,
    predicted: questions.filter(q =>
      q.sources.some(s => s.type === 'predicted')
    ).length,
    guidelineBased: questions.filter(q =>
      q.sources.some(s => s.type === 'guideline-based')
    ).length,
  };

  return {
    total: questions.length,
    byDifficulty: difficultyCount,
    byDomain: domainCount,
    bySourceType: sourceTypes,
    avgTimeSeconds: Math.round(
      questions.reduce((sum, q) => sum + q.estimatedTime, 0) / questions.length
    ),
  };
}

/**
 * Search exam questions
 */
export function searchExamQuestions(
  searchTerm: string,
  filters?: {
    examType?: ExamType;
    difficulty?: string;
    domain?: string;
  }
): ExamQuestion[] {
  let questions = allExamQuestions;

  // Apply filters
  if (filters?.examType) {
    questions = questions.filter(q => q.examType === filters.examType);
  }
  if (filters?.difficulty) {
    questions = questions.filter(q => q.difficulty === filters.difficulty);
  }
  if (filters?.domain) {
    questions = questions.filter(q => q.domain === filters.domain);
  }

  // Search in question text, keywords, and related topics
  const term = searchTerm.toLowerCase();
  return questions.filter(q =>
    q.question.toLowerCase().includes(term) ||
    q.keywords.some(k => k.toLowerCase().includes(term)) ||
    q.relatedTopics.some(t => t.toLowerCase().includes(term)) ||
    q.explanation.toLowerCase().includes(term)
  );
}

/**
 * Get recommended study order based on difficulty and domain
 */
export function getRecommendedStudyOrder(
  examType: ExamType,
  userLevel: string = 'student'
): ExamQuestion[] {
  const questions = getQuestionsForExam(examType);

  // Sort by: 1) difficulty (standard first), 2) domain, 3) estimated time
  return [...questions].sort((a, b) => {
    // Difficulty priority
    const diffOrder = { standard: 1, challenging: 2, expert: 3 };
    const diffA = diffOrder[a.difficulty] || 2;
    const diffB = diffOrder[b.difficulty] || 2;
    if (diffA !== diffB) return diffA - diffB;

    // Domain grouping (same domain questions together)
    if (a.domain !== b.domain) return a.domain.localeCompare(b.domain);

    // Time (shorter first within same domain)
    return a.estimatedTime - b.estimatedTime;
  });
}

/**
 * Generate mock exam
 */
export function generateMockExam(
  examType: ExamType,
  numberOfQuestions: number,
  options?: {
    domainDistribution?: Record<string, number>;
    includeDifficulties?: string[];
  }
): ExamQuestion[] {
  let availableQuestions = getQuestionsForExam(examType);

  // Filter by difficulty if specified
  if (options?.includeDifficulties) {
    availableQuestions = availableQuestions.filter(q =>
      options.includeDifficulties!.includes(q.difficulty)
    );
  }

  // Domain distribution
  let selectedQuestions: ExamQuestion[] = [];

  if (options?.domainDistribution) {
    // Select specific number from each domain
    Object.entries(options.domainDistribution).forEach(([domain, count]) => {
      const domainQuestions = availableQuestions.filter(q => q.domain === domain);
      const selected = shuffleArray(domainQuestions).slice(0, count);
      selectedQuestions.push(...selected);
    });
  } else {
    // Random selection
    selectedQuestions = shuffleArray(availableQuestions).slice(0, numberOfQuestions);
  }

  return shuffleArray(selectedQuestions);
}

/**
 * Helper: Shuffle array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Export organized questions
 */
export {
  specialistExamQuestions,
  specialistQuestionsByDomain,
  atExamQuestions,
  atQuestionsByCategory,
  kunskapsprovQuestions,
  kunskapsprovQuestionsByCategory,
};

/**
 * Exam titles and descriptions (Swedish)
 */
export const examInfo = {
  'specialist-ortopedi': {
    title: 'Specialistexamen i Ortopedi',
    description: 'Förberedelse för specialistexamen i ortopedi. Inkluderar gamla provfrågor och förutsedda frågor baserade på SVORF, Socialstyrelsen och internationella riktlinjer.',
    passingScore: 70,
    recommendedTime: 180, // minutes
  },
  'at-tentamen': {
    title: 'AT-Tentamen (Ortopedi)',
    description: 'Ortopediska kunskaper för AT-tentamen. Fokus på akut ortopedi, gipsteknik, remisskriterier och basal handläggning.',
    passingScore: 75,
    recommendedTime: 120,
  },
  'kunskapsprovet': {
    title: 'Kunskapsprovet (Ortopedi)',
    description: 'Ortopediska frågor relevanta för Kunskapsprovet. Täcker anatomi, fysiologi, farmakologi och grundläggande klinisk medicin.',
    passingScore: 80,
    recommendedTime: 90,
  },
};
