/**
 * Exam Preparation Module Types
 * For Swedish medical exams: Specialist, AT, and Kunskapsprovet
 */

import { Domain } from './onboarding';
import { EducationLevel } from './education';

/**
 * Exam types in Swedish medical education
 */
export type ExamType =
  | 'specialist-ortopedi'      // Specialistexamen i ortopedi
  | 'at-tentamen'               // AT-läkare tentamen (ortopedi fokus)
  | 'kunskapsprovet';           // Kunskapsprovet (ortopedi fokus)

/**
 * Exam question difficulty aligned with actual exam standards
 */
export type ExamDifficulty =
  | 'standard'    // Standard exam question
  | 'challenging' // Above average difficulty
  | 'expert';     // Expert-level, rare cases

/**
 * Question source/origin
 */
export interface QuestionSource {
  type: 'previous-exam' | 'predicted' | 'guideline-based';
  year?: number; // Year of exam if previous-exam
  reference: string; // Guideline, textbook, or exam reference
  verifiedBy?: string; // Who verified accuracy
}

/**
 * Exam question with full metadata
 */
export interface ExamQuestion {
  id: string;
  examType: ExamType;
  domain: Domain;
  difficulty: ExamDifficulty;

  // Question content
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;

  // Educational metadata
  learningObjectives: string[];
  clinicalRelevance: string;
  commonMistakes?: string[];

  // Source verification
  sources: QuestionSource[];
  references: string[]; // Full references (guidelines, books, articles)

  // Exam metadata
  estimatedTime: number; // seconds
  keywords: string[];
  relatedTopics: string[];

  // For Socialstyrelsen målbeskrivning
  socialstyrelseMål?: string[];
}

/**
 * Exam session configuration
 */
export interface ExamSession {
  id: string;
  examType: ExamType;
  title: string;
  description: string;

  // Exam parameters
  totalQuestions: number;
  timeLimit: number; // minutes
  passingScore: number; // percentage

  // Question selection
  questionIds: string[];
  domainDistribution?: Record<Domain, number>; // Number of questions per domain

  // Exam mode settings
  allowReview: boolean;
  showAnswersAfter: boolean;
  randomizeOrder: boolean;
}

/**
 * User's exam attempt
 */
export interface ExamAttempt {
  id: string;
  sessionId: string;
  examType: ExamType;

  // Timing
  startTime: Date;
  endTime?: Date;
  timeSpent: number; // seconds

  // Results
  answers: Record<string, string>; // questionId -> selectedAnswer
  score: number; // percentage
  passed: boolean;

  // Performance breakdown
  correctByDomain: Record<Domain, number>;
  totalByDomain: Record<Domain, number>;

  // Question-level results
  questionResults: Array<{
    questionId: string;
    correct: boolean;
    timeSpent: number;
    markedForReview?: boolean;
  }>;
}

/**
 * Exam preparation statistics
 */
export interface ExamPrepStats {
  examType: ExamType;

  // Overall progress
  questionsCompleted: number;
  totalQuestions: number;
  averageScore: number;

  // By difficulty
  standardCorrect: number;
  standardTotal: number;
  challengingCorrect: number;
  challengingTotal: number;
  expertCorrect: number;
  expertTotal: number;

  // Mock exams
  mockExamsTaken: number;
  mockExamsPassRate: number;
  bestScore: number;
  latestScore: number;

  // Readiness
  estimatedReadiness: 'not-ready' | 'needs-work' | 'ready' | 'well-prepared';
  weakDomains: Domain[];
  strongDomains: Domain[];

  // Predictions
  predictedScore?: number;
  recommendedStudyTime?: number; // hours
}
