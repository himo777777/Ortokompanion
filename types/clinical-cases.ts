/**
 * Unified Clinical Cases Types
 *
 * Combines Step-by-Step and Case Study functionality into a single unified system
 */

import { EducationLevel } from './education';
import { Domain } from './onboarding';

/**
 * Clinical case presentation mode
 */
export type ClinicalCaseMode = 'guided' | 'scenario';

/**
 * Difficulty level for clinical cases
 */
export type ClinicalDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Clinical workflow step type (for guided mode)
 */
export type ClinicalStepType =
  | 'anamnes'
  | 'differential'
  | 'status'
  | 'investigation'
  | 'diagnosis'
  | 'treatment';

/**
 * Patient information
 */
export interface PatientInfo {
  age: number;
  gender: string;
  complaint: string;
}

/**
 * Individual question in a case (for scenario mode)
 */
export interface CaseQuestion {
  id: string;
  question: string;
  options?: string[]; // If undefined, free-text answer
  correctAnswer?: string;
  explanation: string;
}

/**
 * Individual step in clinical workflow (for guided mode)
 */
export interface ClinicalStep {
  id: string;
  title: string;
  type: ClinicalStepType;
  question: string;
  hints: string[];
  examples?: string[];
  correctAnswer?: string;
  feedback?: string;
}

/**
 * Unified Clinical Case
 *
 * Supports both:
 * - Guided mode: Step-by-step with hints and scaffolding
 * - Scenario mode: Traditional case study with questions
 */
export interface UnifiedClinicalCase {
  id: string;
  title: string;
  domain: Domain;
  difficulty: ClinicalDifficulty;
  level: EducationLevel;

  // Patient context (optional but recommended)
  patient?: PatientInfo;

  // Initial presentation/scenario
  initialPresentation: string;
  scenario?: string; // Additional scenario text (for scenario mode)

  // Mode determines which data is used
  mode: ClinicalCaseMode;

  // For guided mode (step-by-step)
  steps?: ClinicalStep[];

  // For scenario mode (case study)
  questions?: CaseQuestion[];

  // Learning objectives
  learningObjectives: string[];

  // References and goals
  references?: string[]; // Reference IDs from data/references.ts
  relatedGoals?: string[]; // Socialstyrelsen goal IDs

  // Content versioning fields for medical quality control
  contentVersion?: string; // Semantic version: "1.0.0"
  sourceVersions?: Array<{
    sourceId: string;
    version: string;
    publicationDate: Date;
  }>;
  lastContentUpdate?: Date; // When case was last reviewed/updated
  needsReview?: boolean; // Flag set when source is updated
  reviewNotes?: string; // Notes from last review
}

/**
 * Props for ClinicalCaseSession component
 */
export interface ClinicalCaseSessionProps {
  caseData: UnifiedClinicalCase;
  userMasteryLevel?: number; // 0-100, affects scaffolding in guided mode
  onComplete?: (results: ClinicalCaseResults) => void;
  onClose?: () => void;
}

/**
 * Results from completing a clinical case
 */
export interface ClinicalCaseResults {
  caseId: string;
  mode: ClinicalCaseMode;

  // For guided mode
  stepsCompleted?: number;
  hintsUsed?: number;

  // For scenario mode
  questionsAnswered?: number;
  correctAnswers?: number;

  // Common
  timeSpent: number;
  score: number; // 0-100
  xpEarned: number;
}

/**
 * Browser filter options
 */
export interface ClinicalCaseFilters {
  domain: Domain | 'all';
  difficulty: ClinicalDifficulty | 'all';
  mode: ClinicalCaseMode | 'all';
  level: EducationLevel | 'all';
  searchQuery?: string;
}
