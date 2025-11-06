/**
 * Source validation utilities for ensuring data integrity
 */

import { SourceReference } from '@/types/verification';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate that a source doesn't have future dates
 */
export function validateSourceDates(source: SourceReference): ValidationResult {
  const currentYear = new Date().getFullYear();
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check publication year
  if (source.year > currentYear) {
    errors.push(`Publication year ${source.year} is in the future (current year: ${currentYear})`);
  }

  // Check lastVerified date if it exists
  if (source.lastVerified) {
    const verifiedYear = source.lastVerified.getFullYear();
    if (verifiedYear > currentYear) {
      errors.push(`Last verified date is in the future (${verifiedYear})`);
    }
  }

  // Check publicationDate if it exists
  if (source.publicationDate) {
    const pubYear = source.publicationDate.getFullYear();
    if (pubYear > currentYear) {
      errors.push(`Publication date is in the future (${pubYear})`);
    }
  }

  // Warn about sources older than 10 years (except for classic references)
  if (source.year < currentYear - 10 && source.type !== 'classification-system') {
    warnings.push(`Source is more than 10 years old (${source.year}). Consider finding a more recent source.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate URL format and accessibility (basic check)
 */
export function validateSourceURL(source: SourceReference): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (source.url) {
    try {
      const url = new URL(source.url);

      // Check for secure protocol
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        errors.push(`Invalid URL protocol: ${url.protocol}`);
      }

      // Warn about non-HTTPS
      if (url.protocol === 'http:') {
        warnings.push('URL uses HTTP instead of HTTPS. Consider using a secure connection.');
      }

      // Check for suspicious domains
      const suspiciousDomains = ['example.com', 'test.com', 'localhost'];
      if (suspiciousDomains.some(domain => url.hostname.includes(domain))) {
        errors.push(`Suspicious domain: ${url.hostname}`);
      }

    } catch (error) {
      errors.push(`Invalid URL format: ${source.url}`);
    }
  }

  // Check for DOI format if present
  if (source.doi) {
    const doiRegex = /^10\.\d{4,9}\/[-._;()\/:A-Za-z0-9]+$/;
    if (!doiRegex.test(source.doi)) {
      errors.push(`Invalid DOI format: ${source.doi}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate Swedish priority sources
 */
export function validateSwedishSource(source: SourceReference): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // List of known Swedish medical organizations
  const swedishOrganizations = [
    'Socialstyrelsen',
    'Svenska Ortopediska Föreningen',
    'SVORF',
    'Rikshöft',
    'Riksknä',
    'SBU',
    'Läkemedelsverket',
    'Karolinska',
    'LÖF',
    'Landsting',
  ];

  const isSwedishSource =
    swedishOrganizations.some(org =>
      source.author?.includes(org) ||
      source.title?.includes(org) ||
      source.url?.includes('.se/')
    );

  if (isSwedishSource) {
    // Swedish sources should have Manual verification
    if (source.verifiedBy !== 'Manual') {
      warnings.push('Swedish source should be manually verified');
    }

    // Swedish sources should have high reliability
    if (source.reliability && source.reliability < 95) {
      warnings.push(`Swedish source has low reliability score (${source.reliability}). Consider manual review.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Comprehensive source validation
 */
export function validateSource(source: SourceReference): ValidationResult {
  const dateValidation = validateSourceDates(source);
  const urlValidation = validateSourceURL(source);
  const swedishValidation = validateSwedishSource(source);

  return {
    valid: dateValidation.valid && urlValidation.valid,
    errors: [
      ...dateValidation.errors,
      ...urlValidation.errors,
      ...swedishValidation.errors,
    ],
    warnings: [
      ...dateValidation.warnings,
      ...urlValidation.warnings,
      ...swedishValidation.warnings,
    ],
  };
}

/**
 * Validate all sources in a collection
 */
export function validateAllSources(
  sources: Record<string, SourceReference>
): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>();

  for (const [id, source] of Object.entries(sources)) {
    results.set(id, validateSource(source));
  }

  return results;
}

/**
 * Get validation summary
 */
export function getValidationSummary(
  results: Map<string, ValidationResult>
): {
  totalSources: number;
  validSources: number;
  invalidSources: number;
  totalErrors: number;
  totalWarnings: number;
  invalidSourceIds: string[];
} {
  let validSources = 0;
  let invalidSources = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  const invalidSourceIds: string[] = [];

  results.forEach((result, id) => {
    if (result.valid) {
      validSources++;
    } else {
      invalidSources++;
      invalidSourceIds.push(id);
    }
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
  });

  return {
    totalSources: results.size,
    validSources,
    invalidSources,
    totalErrors,
    totalWarnings,
    invalidSourceIds,
  };
}