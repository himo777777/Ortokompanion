/**
 * Content-Source Mapping System
 *
 * Creates bidirectional mapping between medical sources and content (questions, cases).
 * Enables quick lookup of which content is affected when a source is updated.
 */

import { ALL_QUESTIONS } from '@/data/questions';
import { UNIFIED_CLINICAL_CASES } from '@/data/unified-clinical-cases';

/**
 * Reverse index: sourceId → contentIds[]
 * Used to find all content that references a specific source
 */
export interface SourceContentMap {
  questions: Map<string, string[]>;
  cases: Map<string, string[]>;
  all: Map<string, string[]>;
}

/**
 * Content metadata for tracking
 */
export interface ContentReference {
  id: string;
  type: 'question' | 'case';
  title?: string;
  domain?: string;
  sources: string[];
}

/**
 * Build reverse index mapping sources to questions
 */
export function buildQuestionSourceMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();

  ALL_QUESTIONS.forEach((question) => {
    if (question.references && question.references.length > 0) {
      question.references.forEach((sourceId) => {
        if (!map.has(sourceId)) {
          map.set(sourceId, []);
        }
        map.get(sourceId)!.push(question.id);
      });
    }
  });

  return map;
}

/**
 * Build reverse index mapping sources to clinical cases
 */
export function buildCaseSourceMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();

  UNIFIED_CLINICAL_CASES.forEach((clinicalCase) => {
    if (clinicalCase.references && clinicalCase.references.length > 0) {
      clinicalCase.references.forEach((sourceId) => {
        if (!map.has(sourceId)) {
          map.set(sourceId, []);
        }
        map.get(sourceId)!.push(clinicalCase.id);
      });
    }
  });

  return map;
}

/**
 * Build complete source-content mapping
 */
export function buildSourceContentMap(): SourceContentMap {
  const questionMap = buildQuestionSourceMap();
  const caseMap = buildCaseSourceMap();

  // Merge into combined map
  const allMap = new Map<string, string[]>();

  questionMap.forEach((questionIds, sourceId) => {
    allMap.set(sourceId, [...questionIds]);
  });

  caseMap.forEach((caseIds, sourceId) => {
    if (allMap.has(sourceId)) {
      allMap.get(sourceId)!.push(...caseIds);
    } else {
      allMap.set(sourceId, [...caseIds]);
    }
  });

  return {
    questions: questionMap,
    cases: caseMap,
    all: allMap,
  };
}

/**
 * Get all content IDs that reference a specific source
 */
export function getContentBySource(
  sourceId: string,
  contentType?: 'question' | 'case' | 'all'
): string[] {
  const maps = buildSourceContentMap();

  switch (contentType) {
    case 'question':
      return maps.questions.get(sourceId) || [];
    case 'case':
      return maps.cases.get(sourceId) || [];
    case 'all':
    default:
      return maps.all.get(sourceId) || [];
  }
}

/**
 * Get detailed content references for a source
 */
export function getContentReferencesBySource(sourceId: string): ContentReference[] {
  const references: ContentReference[] = [];

  // Add questions
  ALL_QUESTIONS.forEach((question) => {
    if (question.references?.includes(sourceId)) {
      references.push({
        id: question.id,
        type: 'question',
        title: question.question,
        domain: question.domain,
        sources: question.references,
      });
    }
  });

  // Add cases
  UNIFIED_CLINICAL_CASES.forEach((clinicalCase) => {
    if (clinicalCase.references?.includes(sourceId)) {
      references.push({
        id: clinicalCase.id,
        type: 'case',
        title: clinicalCase.title,
        domain: clinicalCase.domain,
        sources: clinicalCase.references,
      });
    }
  });

  return references;
}

/**
 * Get statistics about source usage
 */
export interface SourceUsageStats {
  sourceId: string;
  questionCount: number;
  caseCount: number;
  totalContent: number;
  domains: Set<string>;
}

export function getSourceUsageStats(sourceId: string): SourceUsageStats {
  const references = getContentReferencesBySource(sourceId);
  const domains = new Set<string>();

  references.forEach((ref) => {
    if (ref.domain) {
      domains.add(ref.domain);
    }
  });

  return {
    sourceId,
    questionCount: references.filter((r) => r.type === 'question').length,
    caseCount: references.filter((r) => r.type === 'case').length,
    totalContent: references.length,
    domains,
  };
}

/**
 * Get all sources used in content
 */
export function getAllUsedSources(): Set<string> {
  const sources = new Set<string>();

  ALL_QUESTIONS.forEach((question) => {
    question.references?.forEach((sourceId) => sources.add(sourceId));
  });

  UNIFIED_CLINICAL_CASES.forEach((clinicalCase) => {
    clinicalCase.references?.forEach((sourceId) => sources.add(sourceId));
  });

  return sources;
}

/**
 * Find content with multiple conflicting sources
 */
export function findContentWithConflictingSources(): ContentReference[] {
  const conflicting: ContentReference[] = [];

  // Questions with 2+ sources (potential conflicts)
  ALL_QUESTIONS.forEach((question) => {
    if (question.references && question.references.length >= 2) {
      conflicting.push({
        id: question.id,
        type: 'question',
        title: question.question,
        domain: question.domain,
        sources: question.references,
      });
    }
  });

  // Cases with 2+ sources
  UNIFIED_CLINICAL_CASES.forEach((clinicalCase) => {
    if (clinicalCase.references && clinicalCase.references.length >= 2) {
      conflicting.push({
        id: clinicalCase.id,
        type: 'case',
        title: clinicalCase.title,
        domain: clinicalCase.domain,
        sources: clinicalCase.references,
      });
    }
  });

  return conflicting;
}

/**
 * Generate mapping report for monitoring/debugging
 */
export function generateMappingReport(): {
  totalSources: number;
  usedSources: number;
  unusedSources: number;
  totalContent: number;
  contentWithoutSources: number;
  averageSourcesPerContent: number;
  topSources: Array<{ sourceId: string; contentCount: number }>;
} {
  const mapping = buildSourceContentMap();
  const usedSources = getAllUsedSources();

  const contentWithSources = ALL_QUESTIONS.filter((q) => q.references && q.references.length > 0).length +
    UNIFIED_CLINICAL_CASES.filter((c) => c.references && c.references.length > 0).length;

  const totalContent = ALL_QUESTIONS.length + UNIFIED_CLINICAL_CASES.length;
  const contentWithoutSources = totalContent - contentWithSources;

  // Calculate average sources per content
  let totalSourceReferences = 0;
  ALL_QUESTIONS.forEach((q) => {
    totalSourceReferences += q.references?.length || 0;
  });
  UNIFIED_CLINICAL_CASES.forEach((c) => {
    totalSourceReferences += c.references?.length || 0;
  });

  const averageSourcesPerContent = contentWithSources > 0
    ? totalSourceReferences / contentWithSources
    : 0;

  // Find most-used sources
  const sourceUsageCounts = Array.from(mapping.all.entries())
    .map(([sourceId, contentIds]) => ({
      sourceId,
      contentCount: contentIds.length,
    }))
    .sort((a, b) => b.contentCount - a.contentCount)
    .slice(0, 10);

  return {
    totalSources: usedSources.size,
    usedSources: mapping.all.size,
    unusedSources: usedSources.size - mapping.all.size,
    totalContent,
    contentWithoutSources,
    averageSourcesPerContent: Math.round(averageSourcesPerContent * 10) / 10,
    topSources: sourceUsageCounts,
  };
}
