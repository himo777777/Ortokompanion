/**
 * Content Validation System
 *
 * Ensures all content in OrtoKompanion meets quality standards:
 * - Based on latest verified sources
 * - Proper distribution across bands and levels
 * - Complete TutorMode data
 * - Valid references
 */

import { MCQQuestion } from '@/data/questions';
import { VERIFIED_SOURCES } from '@/data/verified-sources';
import { Domain } from '@/types/onboarding';
import { EducationLevel } from '@/types/education';
import { DifficultyBand } from '@/types/progression';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ContentQualityReport {
  domain: Domain;
  totalQuestions: number;
  bandDistribution: Record<DifficultyBand, number>;
  levelDistribution: Record<EducationLevel, number>;
  questionsWithTutorMode: number;
  questionsWithReferences: number;
  expiredReferences: string[];
  missingReferences: string[];
  qualityScore: number;
}

/**
 * Validate a single question
 */
export function validateQuestion(question: MCQQuestion): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Required fields
  if (!question.id) errors.push('Missing question ID');
  if (!question.domain) errors.push('Missing domain');
  if (!question.level) errors.push('Missing education level');
  if (!question.band) errors.push('Missing difficulty band');
  if (!question.question || question.question.trim().length === 0) {
    errors.push('Missing or empty question text');
  }
  if (!question.options || question.options.length < 2) {
    errors.push('Must have at least 2 options');
  }
  if (!question.correctAnswer) errors.push('Missing correct answer');
  if (!question.explanation || question.explanation.trim().length === 0) {
    errors.push('Missing or empty explanation');
  }
  if (!question.competency) errors.push('Missing competency');
  if (!question.tags || question.tags.length === 0) {
    warnings.push('No tags provided');
  }

  // References validation
  if (!question.references || question.references.length === 0) {
    errors.push('Missing references - all questions must cite sources');
  } else {
    // Check if references exist in VERIFIED_SOURCES
    const missingRefs = question.references.filter(
      (ref) => !VERIFIED_SOURCES[ref]
    );
    if (missingRefs.length > 0) {
      errors.push(`References not found in VERIFIED_SOURCES: ${missingRefs.join(', ')}`);
    }

    // Check if references are expired or expiring soon
    question.references.forEach((refId) => {
      const source = VERIFIED_SOURCES[refId];
      if (source && source.expirationDate) {
        const now = new Date();
        const expirationDate = new Date(source.expirationDate);
        const daysUntilExpiry = Math.floor(
          (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry < 0) {
          errors.push(
            `Reference '${refId}' expired ${Math.abs(daysUntilExpiry)} days ago`
          );
        } else if (daysUntilExpiry < 90) {
          warnings.push(
            `Reference '${refId}' expires in ${daysUntilExpiry} days`
          );
        }
      }

      // Check verification status
      if (source && source.verificationStatus === 'needs-review') {
        warnings.push(`Reference '${refId}' needs review`);
      } else if (source && source.verificationStatus === 'outdated') {
        errors.push(`Reference '${refId}' is marked as outdated`);
      }
    });
  }

  // TutorMode validation
  if (!question.tutorMode) {
    suggestions.push('Consider adding TutorMode data (hints, commonMistakes, teachingPoints)');
  } else {
    if (!question.tutorMode.hints || question.tutorMode.hints.length < 3) {
      warnings.push('TutorMode should have 3 progressive hints');
    }
    if (!question.tutorMode.commonMistakes || question.tutorMode.commonMistakes.length === 0) {
      suggestions.push('Add common mistakes to TutorMode');
    }
    if (!question.tutorMode.teachingPoints || question.tutorMode.teachingPoints.length === 0) {
      suggestions.push('Add teaching points to TutorMode');
    }
  }

  // Socialstyrelsen goals
  if (!question.relatedGoals || question.relatedGoals.length === 0) {
    suggestions.push('Link to Socialstyrelsen specialization goals');
  }

  // Band-level appropriateness
  const bandLevelCheck = validateBandLevelAppropriate(question.band, question.level);
  if (!bandLevelCheck.appropriate) {
    warnings.push(bandLevelCheck.message);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Check if band and level combination is appropriate
 */
function validateBandLevelAppropriate(
  band: DifficultyBand,
  level: EducationLevel
): { appropriate: boolean; message: string } {
  // Band A-B should primarily be for student/at
  // Band C for at/st1
  // Band D for st1/st2
  // Band E for st2/specialist

  const levelOrder = ['student', 'at', 'st1', 'st2', 'specialist'];
  const bandOrder = ['A', 'B', 'C', 'D', 'E'];

  const levelIndex = levelOrder.indexOf(level);
  const bandIndex = bandOrder.indexOf(band);

  // Rough heuristic: band index should not be more than 2 ahead of level
  const diff = bandIndex - levelIndex;

  if (diff > 2) {
    return {
      appropriate: false,
      message: `Band ${band} might be too difficult for ${level} level`,
    };
  }

  if (diff < -1) {
    return {
      appropriate: false,
      message: `Band ${band} might be too easy for ${level} level`,
    };
  }

  return { appropriate: true, message: '' };
}

/**
 * Validate all questions in a domain
 */
export function validateDomainQuestions(
  questions: MCQQuestion[],
  domain: Domain
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  questions.forEach((q, index) => {
    if (q.domain !== domain) {
      errors.push(`Question ${q.id} (index ${index}) has wrong domain: ${q.domain}`);
    }

    const result = validateQuestion(q);
    result.errors.forEach((e) => errors.push(`[${q.id}] ${e}`));
    result.warnings.forEach((w) => warnings.push(`[${q.id}] ${w}`));
    result.suggestions.forEach((s) => suggestions.push(`[${q.id}] ${s}`));
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Generate quality report for a domain
 */
export function generateQualityReport(
  questions: MCQQuestion[],
  domain: Domain
): ContentQualityReport {
  const bandDistribution: Record<string, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
  };

  const levelDistribution: Record<string, number> = {
    student: 0,
    at: 0,
    st1: 0,
    st2: 0,
    specialist: 0,
  };

  let questionsWithTutorMode = 0;
  let questionsWithReferences = 0;
  const expiredReferences = new Set<string>();
  const missingReferences = new Set<string>();

  questions.forEach((q) => {
    // Band distribution
    if (q.band) {
      bandDistribution[q.band] = (bandDistribution[q.band] || 0) + 1;
    }

    // Level distribution
    if (q.level) {
      levelDistribution[q.level] = (levelDistribution[q.level] || 0) + 1;
    }

    // TutorMode
    if (q.tutorMode) {
      questionsWithTutorMode++;
    }

    // References
    if (q.references && q.references.length > 0) {
      questionsWithReferences++;

      q.references.forEach((refId) => {
        const source = VERIFIED_SOURCES[refId];
        if (!source) {
          missingReferences.add(refId);
        } else if (source.expirationDate) {
          const now = new Date();
          const expirationDate = new Date(source.expirationDate);
          if (expirationDate < now) {
            expiredReferences.add(refId);
          }
        }
      });
    }
  });

  // Calculate quality score (0-100)
  let qualityScore = 0;
  const totalQuestions = questions.length;

  if (totalQuestions > 0) {
    // 30% - Has references
    qualityScore += (questionsWithReferences / totalQuestions) * 30;

    // 30% - Has TutorMode
    qualityScore += (questionsWithTutorMode / totalQuestions) * 30;

    // 20% - No expired references
    const expiredRatio = expiredReferences.size / Math.max(1, questionsWithReferences);
    qualityScore += (1 - expiredRatio) * 20;

    // 20% - Good distribution across bands (should have at least some in each band)
    const bandsWithQuestions = Object.values(bandDistribution).filter((n) => n > 0).length;
    qualityScore += (bandsWithQuestions / 5) * 20;
  }

  return {
    domain,
    totalQuestions,
    bandDistribution: bandDistribution as Record<DifficultyBand, number>,
    levelDistribution: levelDistribution as Record<EducationLevel, number>,
    questionsWithTutorMode,
    questionsWithReferences,
    expiredReferences: Array.from(expiredReferences),
    missingReferences: Array.from(missingReferences),
    qualityScore: Math.round(qualityScore),
  };
}

/**
 * Check source expiration and suggest updates
 */
export function checkSourcesNeedingUpdate(): {
  expired: string[];
  expiringSoon: string[];
  needsReview: string[];
} {
  const expired: string[] = [];
  const expiringSoon: string[] = [];
  const needsReview: string[] = [];

  const now = new Date();

  Object.entries(VERIFIED_SOURCES).forEach(([id, source]) => {
    // Check expiration
    if (source.expirationDate) {
      const expirationDate = new Date(source.expirationDate);
      const daysUntilExpiry = Math.floor(
        (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry < 0) {
        expired.push(id);
      } else if (daysUntilExpiry < 90) {
        expiringSoon.push(id);
      }
    }

    // Check verification status
    if (source.verificationStatus === 'needs-review' || source.verificationStatus === 'outdated') {
      needsReview.push(id);
    }
  });

  return {
    expired,
    expiringSoon,
    needsReview,
  };
}

/**
 * Suggest optimal band/level distribution for a target number of questions
 */
export function suggestOptimalDistribution(totalQuestions: number): {
  bands: Record<DifficultyBand, number>;
  levels: Record<EducationLevel, number>;
} {
  // Recommended distribution based on progression system
  // Band distribution: More A-C questions, fewer D-E (pyramid)
  const bandRatios = {
    A: 0.25, // 25% - Foundation
    B: 0.30, // 30% - Core knowledge
    C: 0.25, // 25% - Application
    D: 0.15, // 15% - Complications/Advanced
    E: 0.05, // 5% - Expert level
  };

  // Level distribution: Gradual progression
  const levelRatios: Record<EducationLevel, number> = {
    'student': 0.20,    // 20%
    'at': 0.15,         // 15%
    'st1': 0.15,        // 15%
    'st2': 0.15,        // 15%
    'st3': 0.15,        // 15%
    'st4': 0.10,        // 10%
    'st5': 0.05,        // 5%
    'st-allmänmedicin': 0.05,      // 5%
    'st-akutsjukvård': 0.05,       // 5%
    'specialist-ortopedi': 0.10,   // 10%
    'specialist-allmänmedicin': 0.05, // 5%
    'specialist-akutsjukvård': 0.05,  // 5%
  };

  const bands = {
    A: Math.round(totalQuestions * bandRatios.A),
    B: Math.round(totalQuestions * bandRatios.B),
    C: Math.round(totalQuestions * bandRatios.C),
    D: Math.round(totalQuestions * bandRatios.D),
    E: Math.round(totalQuestions * bandRatios.E),
  };

  const levels: Record<EducationLevel, number> = {
    'student': Math.round(totalQuestions * levelRatios.student),
    'at': Math.round(totalQuestions * levelRatios.at),
    'st1': Math.round(totalQuestions * levelRatios.st1),
    'st2': Math.round(totalQuestions * levelRatios.st2),
    'st3': Math.round(totalQuestions * levelRatios.st3),
    'st4': Math.round(totalQuestions * levelRatios.st4),
    'st5': Math.round(totalQuestions * levelRatios.st5),
    'st-allmänmedicin': Math.round(totalQuestions * levelRatios['st-allmänmedicin']),
    'st-akutsjukvård': Math.round(totalQuestions * levelRatios['st-akutsjukvård']),
    'specialist-ortopedi': Math.round(totalQuestions * levelRatios['specialist-ortopedi']),
    'specialist-allmänmedicin': Math.round(totalQuestions * levelRatios['specialist-allmänmedicin']),
    'specialist-akutsjukvård': Math.round(totalQuestions * levelRatios['specialist-akutsjukvård']),
  };

  return { bands, levels };
}
