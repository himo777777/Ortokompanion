#!/usr/bin/env node

/**
 * Script to validate source dates and prevent future-dated sources
 */

import { VERIFIED_SOURCES } from '../data/verified-sources';
import { logger } from '../lib/logger';
import {
import { logger } from '../lib/logger';
  validateAllSources,
  getValidationSummary,
} from '../lib/source-validation';

console.log('🔍 Starting source date validation...\n');

// Run validation on all sources
const validationResults = validateAllSources(VERIFIED_SOURCES);

// Get summary
const summary = getValidationSummary(validationResults);

// Print summary
console.log('📊 Validation Summary:');
console.log(`Total sources: ${summary.totalSources}`);
console.log(`✅ Valid sources: ${summary.validSources}`);
console.log(`❌ Invalid sources: ${summary.invalidSources}`);
console.log(`⚠️  Total errors: ${summary.totalErrors}`);
console.log(`💡 Total warnings: ${summary.totalWarnings}`);
console.log('\n');

// Check for future-dated sources specifically
console.log('🗓️  Checking for future-dated sources...');
const currentYear = new Date().getFullYear();
let futureDatedCount = 0;

Object.entries(VERIFIED_SOURCES).forEach(([id, source]) => {
  let hasFutureDate = false;

  if (source.year > currentYear) {
    futureDatedCount++;
    hasFutureDate = true;
    console.log(`  ❌ ${id}: year ${source.year} is in the future`);
  }

  if (source.publicationDate) {
    const pubYear = source.publicationDate.getFullYear();
    if (pubYear > currentYear) {
      if (!hasFutureDate) futureDatedCount++;
      hasFutureDate = true;
      console.log(`  ❌ ${id}: publication date ${pubYear} is in the future`);
    }
  }

  if (source.lastVerified) {
    const verYear = source.lastVerified.getFullYear();
    if (verYear > currentYear) {
      if (!hasFutureDate) futureDatedCount++;
      console.log(`  ❌ ${id}: last verified date ${verYear} is in the future`);
    }
  }
});

if (futureDatedCount === 0) {
  console.log('  ✅ No future-dated sources found');
}

// Swedish source check
console.log('\n🇸🇪 Swedish Source Priority Check:');
let swedishSourceCount = 0;
let swedishManuallyVerified = 0;

Object.entries(VERIFIED_SOURCES).forEach(([id, source]) => {
  const swedishKeywords = ['svenska', 'svensk', 'socialstyrelsen', 'rikshöft', 'riksknä', 'svorf', 'karolinska', 'läkemedelsverket', 'sbu', 'löf'];
  const isSwedish = swedishKeywords.some(keyword =>
    source.title?.toLowerCase().includes(keyword) ||
    source.author?.toLowerCase().includes(keyword) ||
    source.url?.includes('.se/')
  );

  if (isSwedish) {
    swedishSourceCount++;
    if (source.verifiedBy === 'Manual') {
      swedishManuallyVerified++;
    }
  }
});

console.log(`  Total Swedish sources: ${swedishSourceCount}`);
console.log(`  Manually verified: ${swedishManuallyVerified} (${Math.round(swedishManuallyVerified / swedishSourceCount * 100)}%)`);
console.log(`  AI verified: ${swedishSourceCount - swedishManuallyVerified}`);

// Print detailed errors for invalid sources
if (summary.invalidSources > 0) {
  console.log('\n❌ Invalid Sources - Details:');
  summary.invalidSourceIds.forEach(id => {
    const result = validationResults.get(id);
    const source = VERIFIED_SOURCES[id];
    console.log(`\n  ${id}`);
    console.log(`    Title: ${source?.title || 'Unknown'}`);

    if (result?.errors.length) {
      console.log('    Errors:');
      result.errors.forEach(error => {
        console.log(`      - ${error}`);
      });
    }
  });
}

// Exit with appropriate code
if (futureDatedCount > 0 || summary.invalidSources > 0) {
  console.log('\n❌ Validation failed. Please fix the errors above.');
  process.exit(1);
} else if (summary.totalWarnings > 0) {
  console.log('\n⚠️  Validation passed with warnings.');
  process.exit(0);
} else {
  console.log('\n✅ All sources validated successfully!');
  process.exit(0);
}