/**
 * Auto Source Discovery System
 *
 * Automatically discovers, validates, and adds new medical sources
 * to the verified sources database. Monitors official medical websites,
 * registries, and guidelines for updates.
 */

import { SourceReference, SourceType } from '@/types/verification';
import { Domain } from '@/types/onboarding';

export interface SourceCandidate {
  url: string;
  title: string;
  type: SourceType;
  suggestedId: string;
  discoveredDate: Date;
  confidence: number; // 0-1
  metadata: {
    authors?: string[];
    year?: number;
    publisher?: string;
    evidenceLevel?: string;
    language?: string;
    relevantDomains?: Domain[];
  };
  validationChecks: ValidationCheck[];
}

export interface ValidationCheck {
  type: 'url-accessible' | 'content-medical' | 'authority-verified' | 'recency' | 'language';
  passed: boolean;
  details: string;
  weight: number;
}

export interface DiscoveryRun {
  timestamp: Date;
  duration: number;
  sourcesDiscovered: number;
  sourcesValidated: number;
  sourcesAdded: number;
  candidates: SourceCandidate[];
  errors: string[];
}

/**
 * Known authoritative medical sources to monitor
 */
const MONITORED_SOURCES = [
  // Swedish National Authorities
  {
    name: 'Socialstyrelsen',
    baseUrl: 'https://www.socialstyrelsen.se',
    searchPaths: ['/kunskapsstod', '/riktlinjer'],
    language: 'sv',
  },
  {
    name: 'SBU (Statens beredning för medicinsk och social utvärdering)',
    baseUrl: 'https://www.sbu.se',
    searchPaths: ['/sv/publikationer'],
    language: 'sv',
  },
  // Swedish Quality Registries
  {
    name: 'Rikshöft',
    baseUrl: 'https://rikshoft.se',
    searchPaths: ['/arsrapporter', '/rapporter'],
    language: 'sv',
  },
  {
    name: 'Svenska Höftprotesregistret',
    baseUrl: 'https://shpr.registercentrum.se',
    searchPaths: ['/arsrapporter'],
    language: 'sv',
  },
  // International Guidelines
  {
    name: 'NICE (National Institute for Health and Care Excellence)',
    baseUrl: 'https://www.nice.org.uk',
    searchPaths: ['/guidance'],
    language: 'en',
  },
  {
    name: 'AAOS (American Academy of Orthopaedic Surgeons)',
    baseUrl: 'https://www.aaos.org',
    searchPaths: ['/quality/quality-programs/clinical-practice-guidelines'],
    language: 'en',
  },
];

/**
 * Auto Source Discovery Engine
 */
export class AutoSourceDiscovery {
  private minimumConfidence = 0.7; // Minimum confidence to suggest a source

  /**
   * Run discovery process
   */
  async runDiscovery(): Promise<DiscoveryRun> {
    const startTime = Date.now();
    const candidates: SourceCandidate[] = [];
    const errors: string[] = [];

    // Phase 1: Scan monitored sources for new content
    for (const source of MONITORED_SOURCES) {
      try {
        const newCandidates = await this.scanSource(source);
        candidates.push(...newCandidates);
      } catch (error) {
        errors.push(`Failed to scan ${source.name}: ${error}`);
      }
    }

    // Phase 2: Validate candidates
    const validated = await this.validateCandidates(candidates);

    // Phase 3: Filter high-confidence sources
    const highConfidence = validated.filter((c) => c.confidence >= this.minimumConfidence);

    return {
      timestamp: new Date(),
      duration: Date.now() - startTime,
      sourcesDiscovered: candidates.length,
      sourcesValidated: validated.length,
      sourcesAdded: highConfidence.length,
      candidates: highConfidence,
      errors,
    };
  }

  /**
   * Scan a single source for new content
   */
  private async scanSource(source: typeof MONITORED_SOURCES[0]): Promise<SourceCandidate[]> {
    const candidates: SourceCandidate[] = [];

    // In production, this would make actual HTTP requests to the source
    // For now, this is a mock implementation that demonstrates the structure

    // Mock: Simulate discovering 1-3 new sources from each monitored source
    const mockCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < mockCount; i++) {
      const candidate: SourceCandidate = {
        url: `${source.baseUrl}${source.searchPaths[0]}/new-guideline-${Date.now()}-${i}`,
        title: `Mock ${source.name} Guideline ${i + 1}`,
        type: this.inferSourceType(source.name),
        suggestedId: this.generateSourceId(source.name, i),
        discoveredDate: new Date(),
        confidence: 0,
        metadata: {
          publisher: source.name,
          year: new Date().getFullYear(),
          language: source.language,
          relevantDomains: this.inferDomains(source.name),
        },
        validationChecks: [],
      };

      candidates.push(candidate);
    }

    return candidates;
  }

  /**
   * Validate multiple candidates
   */
  private async validateCandidates(candidates: SourceCandidate[]): Promise<SourceCandidate[]> {
    return Promise.all(candidates.map((c) => this.validateCandidate(c)));
  }

  /**
   * Validate a single candidate
   */
  private async validateCandidate(candidate: SourceCandidate): Promise<SourceCandidate> {
    const checks: ValidationCheck[] = [];

    // Check 1: URL is accessible
    const urlAccessible = await this.checkUrlAccessible(candidate.url);
    checks.push({
      type: 'url-accessible',
      passed: urlAccessible,
      details: urlAccessible ? 'URL is accessible' : 'URL is not accessible',
      weight: 3.0,
    });

    // Check 2: Content appears to be medical
    const isMedical = this.checkContentMedical(candidate.title, candidate.metadata);
    checks.push({
      type: 'content-medical',
      passed: isMedical,
      details: isMedical ? 'Content appears medical' : 'Content may not be medical',
      weight: 2.5,
    });

    // Check 3: Authority verified (from known source)
    const isAuthority = this.checkAuthority(candidate.url);
    checks.push({
      type: 'authority-verified',
      passed: isAuthority,
      details: isAuthority
        ? 'Source is from known authority'
        : 'Source authority could not be verified',
      weight: 3.0,
    });

    // Check 4: Recency (published within last 5 years)
    const isRecent = this.checkRecency(candidate.metadata.year);
    checks.push({
      type: 'recency',
      passed: isRecent,
      details: isRecent
        ? `Published ${candidate.metadata.year} (recent)`
        : `Published ${candidate.metadata.year} (may be outdated)`,
      weight: 1.5,
    });

    // Check 5: Language is Swedish or English
    const languageOk = this.checkLanguage(candidate.metadata.language);
    checks.push({
      type: 'language',
      passed: languageOk,
      details: languageOk
        ? `Language: ${candidate.metadata.language} (acceptable)`
        : `Language: ${candidate.metadata.language} (not supported)`,
      weight: 2.0,
    });

    // Calculate overall confidence
    const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
    const passedWeight = checks
      .filter((check) => check.passed)
      .reduce((sum, check) => sum + check.weight, 0);

    candidate.validationChecks = checks;
    candidate.confidence = passedWeight / totalWeight;

    return candidate;
  }

  /**
   * Check if URL is accessible
   */
  private async checkUrlAccessible(url: string): Promise<boolean> {
    // In production, this would make a HEAD request to verify the URL exists
    // Mock: 90% of URLs are accessible
    return Math.random() > 0.1;
  }

  /**
   * Check if content appears to be medical
   */
  private checkContentMedical(
    title: string,
    metadata: SourceCandidate['metadata']
  ): boolean {
    const medicalKeywords = [
      'ortoped',
      'fraktur',
      'guideline',
      'riktlinje',
      'behandling',
      'diagnos',
      'kirurgi',
      'rehabilitation',
      'patient',
      'clinical',
      'surgery',
      'fracture',
      'joint',
      'bone',
    ];

    const titleLower = title.toLowerCase();
    const hasMedicalKeyword = medicalKeywords.some((keyword) => titleLower.includes(keyword));

    const hasValidPublisher =
      metadata.publisher &&
      (metadata.publisher.includes('Socialstyrelsen') ||
        metadata.publisher.includes('SBU') ||
        metadata.publisher.includes('NICE') ||
        metadata.publisher.includes('AAOS') ||
        metadata.publisher.includes('Riks'));

    return hasMedicalKeyword || !!hasValidPublisher;
  }

  /**
   * Check if source is from known authority
   */
  private checkAuthority(url: string): boolean {
    const authorityDomains = [
      'socialstyrelsen.se',
      'sbu.se',
      'rikshoft.se',
      'rikskna.se',
      'shpr.registercentrum.se',
      'nice.org.uk',
      'aaos.org',
      'aofas.org',
      'boa.ac.uk',
    ];

    return authorityDomains.some((domain) => url.includes(domain));
  }

  /**
   * Check if source is recent
   */
  private checkRecency(year?: number): boolean {
    if (!year) return false;

    const currentYear = new Date().getFullYear();
    return year >= currentYear - 5; // Within last 5 years
  }

  /**
   * Check if language is supported
   */
  private checkLanguage(language?: string): boolean {
    if (!language) return false;
    return language === 'sv' || language === 'en';
  }

  /**
   * Infer source type from source name
   */
  private inferSourceType(sourceName: string): SourceType {
    if (sourceName.includes('Socialstyrelsen') || sourceName.includes('SBU') || sourceName.includes('NICE') || sourceName.includes('AAOS')) {
      return 'clinical-guideline';
    }
    if (sourceName.includes('Riks') || sourceName.includes('registret')) {
      return 'registry-data';
    }
    return 'clinical-guideline';
  }

  /**
   * Generate a unique source ID
   */
  private generateSourceId(sourceName: string, index: number): string {
    const prefix = sourceName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 20);
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}-${index}`;
  }

  /**
   * Infer relevant domains from source name
   */
  private inferDomains(sourceName: string): Domain[] {
    const domains: Domain[] = [];

    if (sourceName.includes('Höft') || sourceName.includes('Hip')) {
      domains.push('höft');
    }
    if (sourceName.includes('Knä') || sourceName.includes('Knee')) {
      domains.push('knä');
    }
    if (sourceName.includes('Trauma')) {
      domains.push('trauma');
    }

    // If no specific domain, suggest all
    if (domains.length === 0) {
      return ['trauma', 'höft', 'knä', 'fot-fotled', 'hand-handled', 'axel-armbåge', 'rygg', 'sport', 'tumör'];
    }

    return domains;
  }

  /**
   * Convert candidate to SourceReference
   */
  convertToSourceReference(candidate: SourceCandidate): SourceReference {
    return {
      id: candidate.suggestedId,
      title: candidate.title,
      type: candidate.type,
      author: candidate.metadata.publisher,
      year: candidate.metadata.year || new Date().getFullYear(),
      url: candidate.url,
      verificationStatus: 'pending',
      lastVerified: candidate.discoveredDate,
      verifiedBy: 'auto-discovery',
      publicationDate: candidate.discoveredDate,
      expirationDate: this.calculateExpirationDate(candidate.type, candidate.metadata.year),
      updateFrequency: 'annual',
      evidenceLevel: (candidate.metadata.evidenceLevel as '1A' | '1B' | '2A' | '2B' | '3' | '4' | '5' | undefined) || '2B',
      reliability: Math.round(candidate.confidence * 100),
    };
  }

  /**
   * Calculate expiration date based on source type
   */
  private calculateExpirationDate(type: SourceType, year?: number): Date {
    const now = new Date();

    switch (type) {
      case 'clinical-guideline':
        // Clinical guidelines expire after 5 years
        return new Date(now.getFullYear() + 5, now.getMonth(), now.getDate());

      case 'registry-data':
        // Registry data expires after 1 year
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

      case 'textbook':
        // Textbooks expire after 10 years
        return new Date(now.getFullYear() + 10, now.getMonth(), now.getDate());

      case 'journal-article':
      case 'clinical-trial':
        // Research expires after 5 years
        return new Date(now.getFullYear() + 5, now.getMonth(), now.getDate());

      default:
        // Default: 3 years
        return new Date(now.getFullYear() + 3, now.getMonth(), now.getDate());
    }
  }

  /**
   * Generate tags for a source candidate
   */
  private generateTags(candidate: SourceCandidate): string[] {
    const tags: string[] = [];

    // Add type tag
    tags.push(candidate.type);

    // Add language tag
    if (candidate.metadata.language) {
      tags.push(candidate.metadata.language);
    }

    // Add domain tags
    if (candidate.metadata.relevantDomains) {
      tags.push(...candidate.metadata.relevantDomains);
    }

    // Add year tag
    if (candidate.metadata.year) {
      tags.push(`${candidate.metadata.year}`);
    }

    return tags;
  }

  /**
   * Generate discovery report
   */
  generateReport(run: DiscoveryRun): string {
    const lines: string[] = [];

    lines.push('=== AUTO SOURCE DISCOVERY REPORT ===');
    lines.push(`Timestamp: ${run.timestamp.toISOString()}`);
    lines.push(`Duration: ${(run.duration / 1000).toFixed(1)}s`);
    lines.push('');
    lines.push(`Sources Discovered: ${run.sourcesDiscovered}`);
    lines.push(`Sources Validated: ${run.sourcesValidated}`);
    lines.push(`High-Confidence Sources: ${run.sourcesAdded}`);
    lines.push('');

    if (run.candidates.length > 0) {
      lines.push('HIGH-CONFIDENCE CANDIDATES:');
      run.candidates.forEach((candidate, i) => {
        lines.push(
          `  ${i + 1}. ${candidate.title} (${(candidate.confidence * 100).toFixed(1)}%)`
        );
        lines.push(`     URL: ${candidate.url}`);
        lines.push(`     Suggested ID: ${candidate.suggestedId}`);
        lines.push(`     Type: ${candidate.type}`);
      });
    }

    if (run.errors.length > 0) {
      lines.push('');
      lines.push('ERRORS:');
      run.errors.forEach((error) => lines.push(`  - ${error}`));
    }

    return lines.join('\n');
  }
}

// Singleton instance
export const autoSourceDiscovery = new AutoSourceDiscovery();
