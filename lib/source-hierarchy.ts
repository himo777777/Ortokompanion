/**
 * Source Hierarchy System for Medical Information Priority
 *
 * Ensures Swedish sources have highest priority, followed by Nordic, European, and International.
 * Implements conflict resolution based on evidence levels and publication dates.
 */

import { SourceReference } from '@/types/verification';

export type SourceRegion =
  | 'swedish-national'
  | 'swedish-regional'
  | 'nordic'
  | 'european'
  | 'international';

export type EvidenceLevel = '1A' | '1B' | '1C' | '2A' | '2B' | '2C' | '3' | '4' | '5';

export interface SourcePriority {
  level: 1 | 2 | 3 | 4 | 5;
  region: SourceRegion;
  evidenceWeight: number; // 0-1, multiplier for evidence level
  description: string;
}

export interface SourceWithPriority extends SourceReference {
  priority: SourcePriority;
  conflictScore?: number; // Calculated score for conflict resolution
}

export interface ConflictResolution {
  primarySource: SourceWithPriority;
  conflictingSources: SourceWithPriority[];
  resolution: 'automatic' | 'manual-review';
  reason: string;
  confidence: number; // 0-1
}

/**
 * Source hierarchy definition with Swedish sources as highest priority
 */
export const SOURCE_HIERARCHY: Record<SourceRegion, SourcePriority> = {
  'swedish-national': {
    level: 1,
    region: 'swedish-national',
    evidenceWeight: 1.0,
    description: 'Svenska nationella riktlinjer och register'
  },
  'swedish-regional': {
    level: 2,
    region: 'swedish-regional',
    evidenceWeight: 0.9,
    description: 'Svenska regionala och universitetssjukhus'
  },
  'nordic': {
    level: 3,
    region: 'nordic',
    evidenceWeight: 0.8,
    description: 'Nordiska riktlinjer (Norge, Danmark, Finland)'
  },
  'european': {
    level: 4,
    region: 'european',
    evidenceWeight: 0.7,
    description: 'Europeiska riktlinjer (NICE, BOA, etc.)'
  },
  'international': {
    level: 5,
    region: 'international',
    evidenceWeight: 0.6,
    description: 'Internationella källor (AAOS, Campbell, etc.)'
  }
};

/**
 * Swedish national sources - highest priority
 */
export const SWEDISH_NATIONAL_SOURCES = [
  'socialstyrelsen',
  'sbu',
  'svorf',
  'rikshoft',
  'rikskna',
  'lakemedelsverket',
  'lof',
  'sfom'
];

/**
 * Swedish regional/university hospital sources
 */
export const SWEDISH_REGIONAL_SOURCES = [
  'karolinska',
  'sahlgrenska',
  'akademiska',
  'lund',
  'uppsala',
  'linkoping'
];

/**
 * Nordic sources
 */
export const NORDIC_SOURCES = [
  'norwegian-health',
  'danish-health',
  'finnish-health',
  'sundhedsstyrelsen',
  'helsedirektoratet'
];

/**
 * European sources
 */
export const EUROPEAN_SOURCES = [
  'nice',
  'boa',
  'esmo',
  'efort',
  'esceo',
  'sign'
];

/**
 * International sources
 */
export const INTERNATIONAL_SOURCES = [
  'aaos',
  'campbell',
  'rockwood',
  'who',
  'acsm',
  'jospt',
  'jbjs'
];

/**
 * Evidence level weights for scoring
 */
const EVIDENCE_WEIGHTS: Record<EvidenceLevel, number> = {
  '1A': 1.0,
  '1B': 0.9,
  '1C': 0.8,
  '2A': 0.7,
  '2B': 0.6,
  '2C': 0.5,
  '3': 0.4,
  '4': 0.3,
  '5': 0.2
};

/**
 * Determine the region of a source based on ID or metadata
 */
export function getSourceRegion(source: SourceReference): SourceRegion {
  const sourceId = source.id.toLowerCase();

  // Check Swedish national
  if (SWEDISH_NATIONAL_SOURCES.some(id => sourceId.includes(id))) {
    return 'swedish-national';
  }

  // Check Swedish regional
  if (SWEDISH_REGIONAL_SOURCES.some(id => sourceId.includes(id))) {
    return 'swedish-regional';
  }

  // Check by URL for Swedish sources
  if (source.url?.includes('.se/') || source.url?.includes('sweden')) {
    return source.author?.includes('Universitets') ? 'swedish-regional' : 'swedish-national';
  }

  // Check Nordic
  if (NORDIC_SOURCES.some(id => sourceId.includes(id)) ||
      source.url?.includes('.no/') ||
      source.url?.includes('.dk/') ||
      source.url?.includes('.fi/')) {
    return 'nordic';
  }

  // Check European
  if (EUROPEAN_SOURCES.some(id => sourceId.includes(id)) ||
      source.url?.includes('.eu/') ||
      source.url?.includes('.uk/')) {
    return 'european';
  }

  // Default to international
  return 'international';
}

/**
 * Calculate conflict resolution score for a source
 */
export function calculateConflictScore(source: SourceWithPriority): number {
  const hierarchyWeight = 1 - (source.priority.level - 1) * 0.2; // 1.0 for level 1, 0.8 for level 2, etc.
  const evidenceWeight = EVIDENCE_WEIGHTS[source.evidenceLevel as EvidenceLevel] || 0.1;
  const reliabilityWeight = (source.reliability || 50) / 100;

  // Factor in publication recency (newer is better)
  const currentYear = new Date().getFullYear();
  const yearsSincePublication = currentYear - source.year;
  const recencyWeight = Math.max(0, 1 - (yearsSincePublication / 10)); // Loses 10% per year, max 10 years

  // Calculate weighted score
  const score = (
    hierarchyWeight * 0.4 +    // 40% weight on hierarchy
    evidenceWeight * 0.3 +      // 30% weight on evidence level
    reliabilityWeight * 0.2 +   // 20% weight on reliability
    recencyWeight * 0.1         // 10% weight on recency
  );

  // Apply region multiplier
  return score * source.priority.evidenceWeight;
}

/**
 * Add priority information to a source
 */
export function enrichSourceWithPriority(source: SourceReference): SourceWithPriority {
  const region = getSourceRegion(source);
  const priority = SOURCE_HIERARCHY[region];

  const enrichedSource: SourceWithPriority = {
    ...source,
    priority
  };

  enrichedSource.conflictScore = calculateConflictScore(enrichedSource);

  return enrichedSource;
}

/**
 * Resolve conflicts between multiple sources
 */
export function resolveSourceConflict(
  sources: SourceReference[],
  requireManualReview = false
): ConflictResolution {
  // Enrich all sources with priority
  const enrichedSources = sources.map(enrichSourceWithPriority);

  // Sort by conflict score (highest first)
  enrichedSources.sort((a, b) => (b.conflictScore || 0) - (a.conflictScore || 0));

  const primarySource = enrichedSources[0];
  const conflictingSources = enrichedSources.slice(1);

  // Determine if manual review is needed
  const scoreDifference = (primarySource.conflictScore || 0) - (conflictingSources[0]?.conflictScore || 0);
  const needsManualReview = requireManualReview ||
    scoreDifference < 0.1 || // Sources are too close in score
    primarySource.priority.level > 2 && conflictingSources.some(s => s.priority.level <= 2); // Lower priority source selected over Swedish

  // Calculate confidence
  const confidence = Math.min(1, scoreDifference * 2); // 0.5 difference = 100% confidence

  // Generate reason
  let reason = `Primär källa: ${primarySource.title} (${primarySource.priority.description})`;
  reason += ` med evidensnivå ${primarySource.evidenceLevel || 'N/A'}`;
  reason += ` och tillförlitlighet ${primarySource.reliability || 'N/A'}%.`;

  if (needsManualReview) {
    reason += ' Manuell granskning krävs på grund av närliggande poäng eller prioritetskonflikt.';
  }

  return {
    primarySource,
    conflictingSources,
    resolution: needsManualReview ? 'manual-review' : 'automatic',
    reason,
    confidence
  };
}

/**
 * Check if a source is Swedish (any level)
 */
export function isSwedishSource(source: SourceReference): boolean {
  const region = getSourceRegion(source);
  return region === 'swedish-national' || region === 'swedish-regional';
}

/**
 * Get sources organized by hierarchy
 */
export function organizeSourcesByHierarchy(
  sources: SourceReference[]
): Record<SourceRegion, SourceWithPriority[]> {
  const organized: Record<SourceRegion, SourceWithPriority[]> = {
    'swedish-national': [],
    'swedish-regional': [],
    'nordic': [],
    'european': [],
    'international': []
  };

  for (const source of sources) {
    const enriched = enrichSourceWithPriority(source);
    organized[enriched.priority.region].push(enriched);
  }

  // Sort each region by conflict score
  for (const region of Object.keys(organized) as SourceRegion[]) {
    organized[region].sort((a, b) => (b.conflictScore || 0) - (a.conflictScore || 0));
  }

  return organized;
}

/**
 * Generate a source priority report
 */
export function generatePriorityReport(sources: SourceReference[]): {
  totalSources: number;
  swedishNational: number;
  swedishRegional: number;
  nordic: number;
  european: number;
  international: number;
  swedishPercentage: number;
  recommendations: string[];
} {
  const organized = organizeSourcesByHierarchy(sources);

  const swedishNational = organized['swedish-national'].length;
  const swedishRegional = organized['swedish-regional'].length;
  const totalSwedish = swedishNational + swedishRegional;
  const total = sources.length;
  const swedishPercentage = total > 0 ? (totalSwedish / total) * 100 : 0;

  const recommendations: string[] = [];

  if (swedishPercentage < 30) {
    recommendations.push('⚠️ Mindre än 30% svenska källor. Överväg att lägga till fler svenska riktlinjer.');
  }

  if (swedishNational < 5) {
    recommendations.push('📚 Lägg till fler svenska nationella källor (Socialstyrelsen, SBU, etc.)');
  }

  if (organized['international'].length > totalSwedish * 2) {
    recommendations.push('🌍 För många internationella källor relativt svenska. Prioritera svenska källor.');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Bra balans mellan svenska och internationella källor!');
  }

  return {
    totalSources: total,
    swedishNational,
    swedishRegional,
    nordic: organized['nordic'].length,
    european: organized['european'].length,
    international: organized['international'].length,
    swedishPercentage,
    recommendations
  };
}