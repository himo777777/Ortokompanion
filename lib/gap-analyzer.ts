/**
 * Content Gap Analyzer
 *
 * Identifies gaps in content coverage and prioritizes what to generate.
 * Analyzes distribution across domains, levels, bands, topics, and sources.
 */

import { ALL_QUESTIONS, MCQQuestion } from '@/data/questions';
import { UNIFIED_CLINICAL_CASES } from '@/data/unified-clinical-cases';
import { Domain } from '@/types/onboarding';
import { EducationLevel } from '@/types/education';
import { DifficultyBand } from '@/types/progression';
import { VERIFIED_SOURCES } from '@/data/verified-sources';
import { ContentGenerationRequest } from './ai-content-factory';

// Define arrays of all values for iteration
const ALL_DOMAINS: Domain[] = [
  'trauma',
  'höft',
  'knä',
  'fot-fotled',
  'hand-handled',
  'axel-armbåge',
  'rygg',
  'sport',
  'tumör',
];

const ALL_EDUCATION_LEVELS: EducationLevel[] = [
  'student',
  'at',
  'st1',
  'st2',
  'st3',
  'st4',
  'st5',
  'specialist-ortopedi',
];

const ALL_DIFFICULTY_BANDS: DifficultyBand[] = ['A', 'B', 'C', 'D', 'E'];

export interface ContentGap {
  type: 'domain' | 'level' | 'band' | 'topic' | 'source-usage' | 'goal-coverage';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  currentCount: number;
  targetCount: number;
  deficit: number;
  recommendations: ContentGenerationRequest[];
}

export interface CoverageMetrics {
  total: {
    questions: number;
    clinicalCases: number;
    totalContent: number;
  };
  byDomain: Map<Domain, number>;
  byLevel: Map<EducationLevel, number>;
  byBand: Map<DifficultyBand, number>;
  bySourceUsage: Map<string, number>;
  domainLevelMatrix: Map<string, number>; // "domain:level" -> count
  sourceUtilization: number; // % of sources used
  gaps: ContentGap[];
}

export interface GenerationPlan {
  totalItems: number;
  breakdown: {
    domain: Domain;
    level: EducationLevel;
    band: DifficultyBand;
    count: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
  }[];
  estimatedCost: number;
  estimatedDuration: number;
}

/**
 * Gap Analyzer
 */
export class GapAnalyzer {
  private targetQuestionsPerDomain = 100; // Ideal: 100 questions per domain
  private targetQuestionsPerLevel = 150; // Ideal: 150 questions per level
  private targetBandDistribution = {
    A: 0.2, // 20% Band A
    B: 0.3, // 30% Band B
    C: 0.3, // 30% Band C
    D: 0.15, // 15% Band D
    E: 0.05, // 5% Band E
  };

  /**
   * Analyze current content coverage and identify gaps
   */
  analyzeCoverage(): CoverageMetrics {
    const questions = ALL_QUESTIONS.filter(q => q != null);
    const cases = UNIFIED_CLINICAL_CASES.filter(c => c != null);

    // Count by domain
    const byDomain = new Map<Domain, number>();
    ALL_DOMAINS.forEach((domain) => {
      const count = questions.filter((q) => q.domain === domain).length;
      byDomain.set(domain, count);
    });

    // Count by level
    const byLevel = new Map<EducationLevel, number>();
    ALL_EDUCATION_LEVELS.forEach((level) => {
      const count = questions.filter((q) => q.level === level).length;
      byLevel.set(level, count);
    });

    // Count by band
    const byBand = new Map<DifficultyBand, number>();
    ALL_DIFFICULTY_BANDS.forEach((band) => {
      const count = questions.filter((q) => q.band === band).length;
      byBand.set(band, count);
    });

    // Count source usage
    const bySourceUsage = new Map<string, number>();
    questions.forEach((q) => {
      if (q.references) {
        q.references.forEach((sourceId) => {
          bySourceUsage.set(sourceId, (bySourceUsage.get(sourceId) || 0) + 1);
        });
      }
    });

    // Domain-Level matrix
    const domainLevelMatrix = new Map<string, number>();
    ALL_DOMAINS.forEach((domain) => {
      ALL_EDUCATION_LEVELS.forEach((level) => {
        const key = `${domain}:${level}`;
        const count = questions.filter((q) => q.domain === domain && q.level === level).length;
        domainLevelMatrix.set(key, count);
      });
    });

    // Calculate source utilization
    const totalSources = Object.keys(VERIFIED_SOURCES).length;
    const usedSources = bySourceUsage.size;
    const sourceUtilization = usedSources / totalSources;

    // Identify gaps
    const gaps = this.identifyGaps(
      byDomain,
      byLevel,
      byBand,
      bySourceUsage,
      domainLevelMatrix
    );

    return {
      total: {
        questions: questions.length,
        clinicalCases: cases.length,
        totalContent: questions.length + cases.length,
      },
      byDomain,
      byLevel,
      byBand,
      bySourceUsage,
      domainLevelMatrix,
      sourceUtilization,
      gaps,
    };
  }

  /**
   * Identify content gaps
   */
  private identifyGaps(
    byDomain: Map<Domain, number>,
    byLevel: Map<EducationLevel, number>,
    byBand: Map<DifficultyBand, number>,
    bySourceUsage: Map<string, number>,
    domainLevelMatrix: Map<string, number>
  ): ContentGap[] {
    const gaps: ContentGap[] = [];

    // Gap 1: Domain coverage
    ALL_DOMAINS.forEach((domain) => {
      const current = byDomain.get(domain) || 0;
      const deficit = this.targetQuestionsPerDomain - current;

      if (deficit > 0) {
        gaps.push({
          type: 'domain',
          priority: deficit > 50 ? 'critical' : deficit > 20 ? 'high' : 'medium',
          description: `Domain "${domain}" needs more questions`,
          currentCount: current,
          targetCount: this.targetQuestionsPerDomain,
          deficit,
          recommendations: this.generateDomainRecommendations(domain, deficit),
        });
      }
    });

    // Gap 2: Level coverage
    ALL_EDUCATION_LEVELS.forEach((level) => {
      const current = byLevel.get(level) || 0;
      const deficit = this.targetQuestionsPerLevel - current;

      if (deficit > 0) {
        gaps.push({
          type: 'level',
          priority: deficit > 75 ? 'critical' : deficit > 30 ? 'high' : 'medium',
          description: `Level "${level}" needs more questions`,
          currentCount: current,
          targetCount: this.targetQuestionsPerLevel,
          deficit,
          recommendations: this.generateLevelRecommendations(level, deficit),
        });
      }
    });

    // Gap 3: Band distribution
    const totalQuestions = ALL_QUESTIONS.length;
    ALL_DIFFICULTY_BANDS.forEach((band) => {
      const current = byBand.get(band) || 0;
      const targetCount = Math.round(totalQuestions * this.targetBandDistribution[band]);
      const deficit = targetCount - current;

      if (deficit > 10) {
        // Only report significant deficits
        gaps.push({
          type: 'band',
          priority: deficit > 50 ? 'high' : 'medium',
          description: `Band "${band}" distribution is ${Math.round((current / totalQuestions) * 100)}% (target: ${Math.round(this.targetBandDistribution[band] * 100)}%)`,
          currentCount: current,
          targetCount,
          deficit,
          recommendations: [], // Will be filled by other gap types
        });
      }
    });

    // Gap 4: Underutilized sources
    const unusedSources = Object.keys(VERIFIED_SOURCES).filter(
      (sourceId) => !bySourceUsage.has(sourceId)
    );

    if (unusedSources.length > 0) {
      gaps.push({
        type: 'source-usage',
        priority: 'low',
        description: `${unusedSources.length} verified sources are not being used`,
        currentCount: bySourceUsage.size,
        targetCount: Object.keys(VERIFIED_SOURCES).length,
        deficit: unusedSources.length,
        recommendations: this.generateSourceUtilizationRecommendations(unusedSources),
      });
    }

    // Gap 5: Domain-Level matrix gaps (critical combinations missing)
    ALL_DOMAINS.forEach((domain) => {
      ALL_EDUCATION_LEVELS.forEach((level) => {
        const key = `${domain}:${level}`;
        const current = domainLevelMatrix.get(key) || 0;
        const target = 20; // At least 20 questions per domain-level combo

        if (current < target) {
          gaps.push({
            type: 'topic',
            priority: current === 0 ? 'critical' : current < 5 ? 'high' : 'medium',
            description: `Domain "${domain}" at level "${level}" has only ${current} questions`,
            currentCount: current,
            targetCount: target,
            deficit: target - current,
            recommendations: this.generateDomainLevelRecommendations(domain, level, target - current),
          });
        }
      });
    });

    // Sort gaps by priority
    return gaps.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Generate recommendations for a domain
   */
  private generateDomainRecommendations(
    domain: Domain,
    count: number
  ): ContentGenerationRequest[] {
    const recommendations: ContentGenerationRequest[] = [];

    // Distribute across levels
    const levelsToUse: EducationLevel[] = ['student', 'at', 'st1', 'st2', 'st3'];
    const perLevel = Math.ceil(count / levelsToUse.length);

    levelsToUse.forEach((level) => {
      recommendations.push({
        type: 'question',
        domain,
        level,
        band: this.selectAppropriateBand(level),
        targetCount: Math.min(perLevel, count),
      });
    });

    return recommendations.slice(0, count);
  }

  /**
   * Generate recommendations for a level
   */
  private generateLevelRecommendations(
    level: EducationLevel,
    count: number
  ): ContentGenerationRequest[] {
    const recommendations: ContentGenerationRequest[] = [];

    // Distribute across domains
    const domainsToUse = ALL_DOMAINS.slice(); // All domains
    const perDomain = Math.ceil(count / domainsToUse.length);

    domainsToUse.forEach((domain) => {
      recommendations.push({
        type: 'question',
        domain,
        level,
        band: this.selectAppropriateBand(level),
        targetCount: Math.min(perDomain, count),
      });
    });

    return recommendations.slice(0, count);
  }

  /**
   * Generate recommendations for domain-level combination
   */
  private generateDomainLevelRecommendations(
    domain: Domain,
    level: EducationLevel,
    count: number
  ): ContentGenerationRequest[] {
    return [
      {
        type: 'question',
        domain,
        level,
        band: this.selectAppropriateBand(level),
        targetCount: count,
      },
    ];
  }

  /**
   * Generate recommendations for underutilized sources
   */
  private generateSourceUtilizationRecommendations(
    unusedSources: string[]
  ): ContentGenerationRequest[] {
    const recommendations: ContentGenerationRequest[] = [];

    // For each unused source, suggest content that would use it
    unusedSources.slice(0, 10).forEach((sourceId) => {
      const source = VERIFIED_SOURCES[sourceId];
      if (!source) return;

      // Infer domain from source (simple heuristic)
      let suggestedDomain: Domain = 'trauma'; // default

      if (sourceId.includes('knee') || sourceId.includes('kna')) {
        suggestedDomain = 'knä';
      } else if (sourceId.includes('hip') || sourceId.includes('hoft')) {
        suggestedDomain = 'höft';
      } else if (sourceId.includes('hand')) {
        suggestedDomain = 'hand-handled';
      }

      recommendations.push({
        type: 'question',
        domain: suggestedDomain,
        level: 'st1',
        requiredSources: [sourceId],
        targetCount: 2,
      });
    });

    return recommendations;
  }

  /**
   * Select appropriate band for education level
   */
  private selectAppropriateBand(level: EducationLevel): DifficultyBand {
    const bandMap: Record<EducationLevel, DifficultyBand> = {
      student: 'A',
      at: 'B',
      st1: 'B',
      st2: 'C',
      st3: 'C',
      st4: 'D',
      st5: 'D',
      'st-allmänmedicin': 'B',
      'st-akutsjukvård': 'B',
      'specialist-ortopedi': 'E',
      'specialist-allmänmedicin': 'D',
      'specialist-akutsjukvård': 'D',
    };
    return bandMap[level] || 'B';
  }

  /**
   * Create a daily generation plan (100+ items)
   */
  createDailyPlan(targetCount: number = 100): GenerationPlan {
    const coverage = this.analyzeCoverage();
    const criticalGaps = coverage.gaps.filter((g) => g.priority === 'critical');
    const highGaps = coverage.gaps.filter((g) => g.priority === 'high');

    const breakdown: GenerationPlan['breakdown'] = [];

    let remaining = targetCount;

    // First, fill critical gaps (40% of daily quota)
    const criticalQuota = Math.floor(targetCount * 0.4);
    criticalGaps.forEach((gap) => {
      if (remaining <= 0) return;

      const toGenerate = Math.min(gap.deficit, criticalQuota, remaining);
      gap.recommendations.slice(0, toGenerate).forEach((req) => {
        breakdown.push({
          domain: req.domain,
          level: req.level,
          band: req.band || 'B',
          count: 1,
          priority: 'critical',
        });
        remaining--;
      });
    });

    // Second, fill high-priority gaps (40% of daily quota)
    const highQuota = Math.floor(targetCount * 0.4);
    highGaps.forEach((gap) => {
      if (remaining <= 0) return;

      const toGenerate = Math.min(gap.deficit, highQuota, remaining);
      gap.recommendations.slice(0, toGenerate).forEach((req) => {
        breakdown.push({
          domain: req.domain,
          level: req.level,
          band: req.band || 'B',
          count: 1,
          priority: 'high',
        });
        remaining--;
      });
    });

    // Third, fill medium-priority gaps (20% of daily quota)
    const mediumGaps = coverage.gaps.filter((g) => g.priority === 'medium');
    mediumGaps.forEach((gap) => {
      if (remaining <= 0) return;

      const toGenerate = Math.min(gap.deficit, remaining);
      gap.recommendations.slice(0, toGenerate).forEach((req) => {
        breakdown.push({
          domain: req.domain,
          level: req.level,
          band: req.band || 'B',
          count: 1,
          priority: 'medium',
        });
        remaining--;
      });
    });

    // Estimate cost and duration
    const estimatedCost = targetCount * 0.5; // $0.50 per question
    const estimatedDuration = targetCount * 60; // 60 seconds per question

    return {
      totalItems: breakdown.length,
      breakdown,
      estimatedCost,
      estimatedDuration,
    };
  }

  /**
   * Generate coverage report
   */
  generateReport(metrics: CoverageMetrics): string {
    const lines: string[] = [];

    lines.push('=== CONTENT COVERAGE REPORT ===');
    lines.push(`Total Questions: ${metrics.total.questions}`);
    lines.push(`Total Clinical Cases: ${metrics.total.clinicalCases}`);
    lines.push(`Total Content: ${metrics.total.totalContent}`);
    lines.push(`Source Utilization: ${(metrics.sourceUtilization * 100).toFixed(1)}%`);
    lines.push('');

    lines.push('DOMAIN DISTRIBUTION:');
    metrics.byDomain.forEach((count, domain) => {
      const percentage = (count / metrics.total.questions) * 100;
      lines.push(`  ${domain}: ${count} (${percentage.toFixed(1)}%)`);
    });
    lines.push('');

    lines.push('LEVEL DISTRIBUTION:');
    metrics.byLevel.forEach((count, level) => {
      const percentage = (count / metrics.total.questions) * 100;
      lines.push(`  ${level}: ${count} (${percentage.toFixed(1)}%)`);
    });
    lines.push('');

    lines.push(`IDENTIFIED GAPS: ${metrics.gaps.length}`);
    metrics.gaps.slice(0, 10).forEach((gap) => {
      lines.push(
        `  [${gap.priority.toUpperCase()}] ${gap.description} (deficit: ${gap.deficit})`
      );
    });

    return lines.join('\n');
  }

  /**
   * Alias for backward compatibility with tests
   */
  createGenerationPlan(targetCount: number): GenerationPlan {
    return this.createDailyPlan(targetCount);
  }
}

// Singleton instance
export const gapAnalyzer = new GapAnalyzer();
