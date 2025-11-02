/**
 * Source Validation Utility
 * Validates DOIs and URLs for source references
 */

import { SourceReference } from '@/types/verification';

export interface ValidationResult {
  isValid: boolean;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: {
    statusCode?: number;
    redirectUrl?: string;
    contentType?: string;
    lastChecked?: Date;
  };
}

export interface SourceValidationReport {
  sourceId: string;
  doiValidation?: ValidationResult;
  urlValidation?: ValidationResult;
  overallStatus: 'valid' | 'warning' | 'invalid';
  lastValidated: Date;
}

/**
 * Validate a DOI using the CrossRef API
 */
export async function validateDOI(doi: string): Promise<ValidationResult> {
  if (!doi || doi.trim() === '') {
    return {
      isValid: false,
      status: 'error',
      message: 'DOI is empty',
    };
  }

  // Clean the DOI (remove https://doi.org/ if present)
  const cleanDOI = doi.replace(/^https?:\/\/doi\.org\//, '').trim();

  // Basic DOI format validation (10.xxxx/...)
  const doiRegex = /^10\.\d{4,}(\.\d+)*\/\S+$/;
  if (!doiRegex.test(cleanDOI)) {
    return {
      isValid: false,
      status: 'error',
      message: `Invalid DOI format: ${cleanDOI}`,
    };
  }

  try {
    // Check DOI via CrossRef API
    const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(cleanDOI)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        isValid: true,
        status: 'success',
        message: 'DOI is valid and accessible',
        details: {
          statusCode: response.status,
          contentType: response.headers.get('content-type') || undefined,
          lastChecked: new Date(),
        },
      };
    } else if (response.status === 404) {
      return {
        isValid: false,
        status: 'error',
        message: 'DOI not found in CrossRef database',
        details: {
          statusCode: 404,
          lastChecked: new Date(),
        },
      };
    } else {
      return {
        isValid: false,
        status: 'warning',
        message: `DOI validation returned status ${response.status}`,
        details: {
          statusCode: response.status,
          lastChecked: new Date(),
        },
      };
    }
  } catch (error) {
    return {
      isValid: false,
      status: 'warning',
      message: `Failed to validate DOI: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: {
        lastChecked: new Date(),
      },
    };
  }
}

/**
 * Validate a URL by checking if it's accessible
 */
export async function validateURL(url: string): Promise<ValidationResult> {
  if (!url || url.trim() === '') {
    return {
      isValid: false,
      status: 'error',
      message: 'URL is empty',
    };
  }

  // Basic URL format validation
  try {
    new URL(url);
  } catch {
    return {
      isValid: false,
      status: 'error',
      message: 'Invalid URL format',
    };
  }

  try {
    // Use HEAD request to check accessibility without downloading content
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);

    if (response.ok) {
      return {
        isValid: true,
        status: 'success',
        message: 'URL is accessible',
        details: {
          statusCode: response.status,
          contentType: response.headers.get('content-type') || undefined,
          lastChecked: new Date(),
        },
      };
    } else if (response.status === 404) {
      return {
        isValid: false,
        status: 'error',
        message: 'URL returns 404 Not Found',
        details: {
          statusCode: 404,
          lastChecked: new Date(),
        },
      };
    } else if (response.status >= 400 && response.status < 500) {
      return {
        isValid: false,
        status: 'error',
        message: `URL returns client error ${response.status}`,
        details: {
          statusCode: response.status,
          lastChecked: new Date(),
        },
      };
    } else if (response.status >= 500) {
      return {
        isValid: false,
        status: 'warning',
        message: `URL returns server error ${response.status} (may be temporary)`,
        details: {
          statusCode: response.status,
          lastChecked: new Date(),
        },
      };
    } else {
      return {
        isValid: false,
        status: 'warning',
        message: `URL returns unexpected status ${response.status}`,
        details: {
          statusCode: response.status,
          lastChecked: new Date(),
        },
      };
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        isValid: false,
        status: 'warning',
        message: 'URL validation timed out (10 seconds)',
        details: {
          lastChecked: new Date(),
        },
      };
    }

    return {
      isValid: false,
      status: 'warning',
      message: `Failed to validate URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: {
        lastChecked: new Date(),
      },
    };
  }
}

/**
 * Validate a complete source reference
 */
export async function validateSource(source: SourceReference): Promise<SourceValidationReport> {
  const report: SourceValidationReport = {
    sourceId: source.id,
    overallStatus: 'valid',
    lastValidated: new Date(),
  };

  // Validate DOI if present
  if (source.doi) {
    report.doiValidation = await validateDOI(source.doi);
    if (!report.doiValidation.isValid) {
      report.overallStatus = report.doiValidation.status === 'error' ? 'invalid' : 'warning';
    }
  }

  // Validate URL if present
  if (source.url) {
    report.urlValidation = await validateURL(source.url);
    if (!report.urlValidation.isValid) {
      // If DOI is valid, URL invalidity is just a warning
      if (report.doiValidation?.isValid) {
        if (report.overallStatus === 'valid') {
          report.overallStatus = 'warning';
        }
      } else {
        report.overallStatus = report.urlValidation.status === 'error' ? 'invalid' : 'warning';
      }
    }
  }

  // If neither DOI nor URL, mark as warning
  if (!source.doi && !source.url) {
    report.overallStatus = 'warning';
  }

  return report;
}

/**
 * Validate multiple sources in batch
 */
export async function validateSourcesBatch(
  sources: SourceReference[],
  options?: {
    maxConcurrent?: number;
    onProgress?: (completed: number, total: number) => void;
  }
): Promise<SourceValidationReport[]> {
  const maxConcurrent = options?.maxConcurrent || 5;
  const results: SourceValidationReport[] = [];
  let completed = 0;

  // Process sources in batches to avoid overwhelming the network
  for (let i = 0; i < sources.length; i += maxConcurrent) {
    const batch = sources.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(batch.map(source => validateSource(source)));
    results.push(...batchResults);

    completed += batch.length;
    if (options?.onProgress) {
      options.onProgress(completed, sources.length);
    }
  }

  return results;
}

/**
 * Check if a source needs validation based on last check time
 */
export function needsValidation(source: SourceReference, maxAgeDays: number = 30): boolean {
  if (!source.lastVerified) {
    return true; // Never validated
  }

  const lastVerified = new Date(source.lastVerified);
  const now = new Date();
  const daysSinceValidation = (now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceValidation > maxAgeDays;
}

/**
 * Get sources that need validation
 */
export function getSourcesNeedingValidation(
  sources: SourceReference[],
  maxAgeDays: number = 30
): SourceReference[] {
  return sources.filter(source => needsValidation(source, maxAgeDays));
}

/**
 * Format validation report for display
 */
export function formatValidationReport(report: SourceValidationReport): string {
  const lines: string[] = [];

  lines.push(`Source: ${report.sourceId}`);
  lines.push(`Overall Status: ${report.overallStatus.toUpperCase()}`);
  lines.push(`Last Validated: ${report.lastValidated.toLocaleString('sv-SE')}`);

  if (report.doiValidation) {
    lines.push('');
    lines.push('DOI Validation:');
    lines.push(`  Status: ${report.doiValidation.status}`);
    lines.push(`  ${report.doiValidation.message}`);
    if (report.doiValidation.details?.statusCode) {
      lines.push(`  HTTP Status: ${report.doiValidation.details.statusCode}`);
    }
  }

  if (report.urlValidation) {
    lines.push('');
    lines.push('URL Validation:');
    lines.push(`  Status: ${report.urlValidation.status}`);
    lines.push(`  ${report.urlValidation.message}`);
    if (report.urlValidation.details?.statusCode) {
      lines.push(`  HTTP Status: ${report.urlValidation.details.statusCode}`);
    }
  }

  return lines.join('\n');
}

/**
 * Get validation summary statistics
 */
export function getValidationSummary(reports: SourceValidationReport[]): {
  total: number;
  valid: number;
  warnings: number;
  invalid: number;
  validPercentage: number;
} {
  const total = reports.length;
  const valid = reports.filter(r => r.overallStatus === 'valid').length;
  const warnings = reports.filter(r => r.overallStatus === 'warning').length;
  const invalid = reports.filter(r => r.overallStatus === 'invalid').length;
  const validPercentage = total > 0 ? Math.round((valid / total) * 100) : 0;

  return { total, valid, warnings, invalid, validPercentage };
}
