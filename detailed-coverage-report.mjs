#!/usr/bin/env node
/**
 * DETAILED Content Coverage Analysis
 * Comprehensive audit with specific examples and actionable recommendations
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const questionsFile = readFileSync(join(__dirname, 'data/questions.ts'), 'utf8');
const casesFile = readFileSync(join(__dirname, 'data/unified-clinical-cases.ts'), 'utf8');
const sourcesFile = readFileSync(join(__dirname, 'data/verified-sources.ts'), 'utf8');

console.log('='.repeat(100));
console.log('ORTOKOMPANION QUALITY CONTROL SYSTEM - DETAILED COVERAGE AUDIT');
console.log('Date:', new Date().toISOString().split('T')[0]);
console.log('='.repeat(100));
console.log();

// Extract all verified source IDs
const sourceIdMatches = [...sourcesFile.matchAll(/['"]([a-z0-9-]+)['"]:\s*{/g)];
const verifiedSources = [...new Set(sourceIdMatches.map(m => m[1]))].filter(id =>
  !['type', 'title', 'author', 'year', 'edition', 'url', 'verificationStatus', 'lastVerified',
    'verifiedBy', 'publicationDate', 'expirationDate', 'updateFrequency', 'evidenceLevel',
    'reliability', 'publisher', 'doi'].includes(id)
);

// Get source titles for reporting
const sourceDetails = {};
verifiedSources.forEach(id => {
  const sourceMatch = sourcesFile.match(new RegExp(`'${id}':\\s*{[^}]*title:\\s*'([^']*)'[^}]*type:\\s*'([^']*)'`, 's'));
  if (sourceMatch) {
    sourceDetails[id] = { title: sourceMatch[1], type: sourceMatch[2] };
  }
});

// Count questions
const questionMatches = [...questionsFile.matchAll(/{\s*id:\s*['"]([^'"]+)['"]/g)];
const totalQuestions = questionMatches.length;

// Analyze all references
const allQuestionRefs = [...questionsFile.matchAll(/id:\s*['"]([^'"]+)['"][^}]*?references:\s*\[([^\]]*)\]/gs)];
const allCaseRefs = [...casesFile.matchAll(/id:\s*['"]([^'"]+)['"][^}]*?references:\s*\[([^\]]*)\]/gs)];

const invalidRefs = [];
const validRefCounts = {};
verifiedSources.forEach(id => validRefCounts[id] = 0);

// Process question references
allQuestionRefs.forEach(match => {
  const questionId = match[1];
  const refsStr = match[2];
  const refs = [...refsStr.matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]);

  refs.forEach(ref => {
    if (verifiedSources.includes(ref)) {
      validRefCounts[ref]++;
    } else {
      invalidRefs.push({ type: 'question', id: questionId, invalidRef: ref });
    }
  });
});

// Process case references
allCaseRefs.forEach(match => {
  const caseId = match[1];
  const refsStr = match[2];
  const refs = [...refsStr.matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]);

  refs.forEach(ref => {
    if (verifiedSources.includes(ref)) {
      validRefCounts[ref]++;
    } else {
      invalidRefs.push({ type: 'case', id: caseId, invalidRef: ref });
    }
  });
});

// Get unique invalid references
const uniqueInvalidRefs = {};
invalidRefs.forEach(item => {
  if (!uniqueInvalidRefs[item.invalidRef]) {
    uniqueInvalidRefs[item.invalidRef] = [];
  }
  uniqueInvalidRefs[item.invalidRef].push(item);
});

// Domain analysis
const domains = ['trauma', 'höft', 'knä', 'axel-armbåge', 'fot-fotled', 'hand-handled', 'rygg', 'sport', 'tumör'];
const domainStats = {};

domains.forEach(domain => {
  const domainPattern = new RegExp(`domain:\\s*['"]${domain.replace('ö', '[öo]')}['"]`, 'gi');
  const domainQuestions = [...questionsFile.matchAll(domainPattern)];

  // Find questions with references in this domain
  const domainWithRefs = [...questionsFile.matchAll(
    new RegExp(`domain:\\s*['"]${domain.replace('ö', '[öo]')}['"][\\s\\S]{0,2000}?references:\\s*\\[[^\\]]+\\]`, 'gi')
  )];

  domainStats[domain] = {
    total: domainQuestions.length,
    withRefs: domainWithRefs.length,
    withoutRefs: domainQuestions.length - domainWithRefs.length,
    coverage: domainQuestions.length > 0 ? ((domainWithRefs.length / domainQuestions.length) * 100).toFixed(1) : '0.0'
  };
});

// Clinical cases analysis
const totalCases = [...casesFile.matchAll(/{\s*id:\s*['"]([^'"]+)['"]/g)].length;
const casesWithRefs = allCaseRefs.length;
const casesWithoutRefs = totalCases - casesWithRefs;

// Find cases without references
const allCaseIds = [...casesFile.matchAll(/id:\s*['"]([^'"]+)['"],\s*title:\s*['"]([^'"]+)['"],\s*domain:\s*['"]([^'"]+)['"]/g)];
const caseIdsWithRefs = new Set(allCaseRefs.map(m => m[1]));
const casesWithoutRefsList = allCaseIds
  .filter(m => !caseIdsWithRefs.has(m[1]))
  .map(m => ({ id: m[1], title: m[2], domain: m[3] }));

// ============================================================================
console.log('📊 1. EXECUTIVE SUMMARY');
console.log('='.repeat(100));
console.log();
console.log('OVERALL COVERAGE:');
console.log(`  Total Content Items: ${totalQuestions + totalCases}`);
console.log(`  ├─ Questions: ${totalQuestions}`);
console.log(`  └─ Clinical Cases: ${totalCases}`);
console.log();
console.log(`  Content with Source References: ${allQuestionRefs.length + casesWithRefs} (${((allQuestionRefs.length + casesWithRefs) / (totalQuestions + totalCases) * 100).toFixed(1)}%)`);
console.log(`  ├─ Questions with refs: ${allQuestionRefs.length}/${totalQuestions} (${(allQuestionRefs.length / totalQuestions * 100).toFixed(1)}%)`);
console.log(`  └─ Cases with refs: ${casesWithRefs}/${totalCases} (${(casesWithRefs / totalCases * 100).toFixed(1)}%)`);
console.log();
console.log(`  Content WITHOUT References (INVISIBLE TO QC SYSTEM): ${totalQuestions - allQuestionRefs.length + casesWithoutRefs}`);
console.log(`  ├─ Questions: ${totalQuestions - allQuestionRefs.length}`);
console.log(`  └─ Clinical Cases: ${casesWithoutRefs}`);
console.log();

// QUALITY RATING
const overallCoverage = ((allQuestionRefs.length + casesWithRefs) / (totalQuestions + totalCases)) * 100;
let rating, color;
if (overallCoverage >= 95) { rating = 'EXCELLENT'; color = '🟢'; }
else if (overallCoverage >= 85) { rating = 'GOOD'; color = '🟢'; }
else if (overallCoverage >= 70) { rating = 'ADEQUATE'; color = '🟡'; }
else if (overallCoverage >= 50) { rating = 'POOR'; color = '🟠'; }
else { rating = 'CRITICAL'; color = '🔴'; }

console.log(`QUALITY CONTROL COVERAGE RATING: ${color} ${rating} (${overallCoverage.toFixed(1)}%)`);
console.log();

// ============================================================================
console.log();
console.log('📚 2. SOURCE USAGE STATISTICS');
console.log('='.repeat(100));
console.log();

const sortedSources = Object.entries(validRefCounts).sort((a, b) => b[1] - a[1]);
const usedSources = sortedSources.filter(([id, count]) => count > 0);
const unusedSources = sortedSources.filter(([id, count]) => count === 0);

console.log(`VERIFIED SOURCES: ${verifiedSources.length} total`);
console.log(`  ├─ Used in content: ${usedSources.length} (${(usedSources.length / verifiedSources.length * 100).toFixed(1)}%)`);
console.log(`  └─ Unused: ${unusedSources.length} (${(unusedSources.length / verifiedSources.length * 100).toFixed(1)}%)`);
console.log();

console.log('TOP 10 MOST USED SOURCES:');
usedSources.slice(0, 10).forEach(([id, count], i) => {
  const details = sourceDetails[id] || { title: 'Unknown', type: 'unknown' };
  console.log(`  ${(i + 1).toString().padStart(2)}. ${id.padEnd(35)} [${count.toString().padStart(4)} uses]`);
  console.log(`      ${details.title}`);
  console.log(`      Type: ${details.type}`);
});
console.log();

console.log(`UNUSED SOURCES (${unusedSources.length} total):`);
if (unusedSources.length > 0) {
  unusedSources.forEach(([id]) => {
    const details = sourceDetails[id] || { title: 'Unknown', type: 'unknown' };
    console.log(`  ⚠  ${id}`);
    console.log(`     ${details.title}`);
  });
} else {
  console.log('  ✓ All verified sources are used in content');
}
console.log();

// ============================================================================
console.log();
console.log('🔍 3. INVALID SOURCE REFERENCES');
console.log('='.repeat(100));
console.log();

if (Object.keys(uniqueInvalidRefs).length > 0) {
  console.log(`❌ FOUND ${invalidRefs.length} INVALID REFERENCES TO ${Object.keys(uniqueInvalidRefs).length} NON-EXISTENT SOURCES:`);
  console.log();

  Object.entries(uniqueInvalidRefs).forEach(([refId, items]) => {
    console.log(`  Invalid Source ID: "${refId}" (${items.length} occurrences)`);
    console.log(`  Used in:`);
    items.slice(0, 5).forEach(item => {
      console.log(`    - ${item.type}: ${item.id}`);
    });
    if (items.length > 5) {
      console.log(`    ... and ${items.length - 5} more`);
    }
    console.log();
  });

  console.log('  RECOMMENDATION: These sources should either be:');
  console.log('    1. Added to data/verified-sources.ts if they are legitimate sources');
  console.log('    2. Corrected if they are typos (e.g., socialstyrelsen-2024 → socialstyrelsen-2021)');
  console.log('    3. Removed from content if they are invalid');
} else {
  console.log('✓ No invalid source references found - all references point to verified sources');
}
console.log();

// ============================================================================
console.log();
console.log('🎯 4. DOMAIN-BY-DOMAIN COVERAGE');
console.log('='.repeat(100));
console.log();

console.log('Domain             Total Qs    With Refs   Without    Coverage    Rating');
console.log('-'.repeat(80));
Object.entries(domainStats).forEach(([domain, stats]) => {
  let domainRating;
  const cov = parseFloat(stats.coverage);
  if (cov === 100) domainRating = '🟢 PERFECT';
  else if (cov >= 90) domainRating = '🟢 EXCELLENT';
  else if (cov >= 75) domainRating = '🟢 GOOD';
  else if (cov >= 50) domainRating = '🟡 ADEQUATE';
  else if (cov >= 25) domainRating = '🟠 POOR';
  else domainRating = '🔴 CRITICAL';

  console.log(
    `${domain.padEnd(18)} ` +
    `${stats.total.toString().padStart(6)}    ` +
    `${stats.withRefs.toString().padStart(6)}    ` +
    `${stats.withoutRefs.toString().padStart(6)}    ` +
    `${stats.coverage.padStart(6)}%    ` +
    `${domainRating}`
  );
});
console.log();

const poorDomains = Object.entries(domainStats).filter(([d, s]) => parseFloat(s.coverage) < 75);
if (poorDomains.length > 0) {
  console.log('⚠  DOMAINS NEEDING ATTENTION (< 75% coverage):');
  poorDomains.forEach(([domain, stats]) => {
    console.log(`  - ${domain}: ${stats.withoutRefs} questions need source references`);
  });
} else {
  console.log('✓ All domains have good coverage (≥ 75%)');
}
console.log();

// ============================================================================
console.log();
console.log('📖 5. CLINICAL CASES COVERAGE');
console.log('='.repeat(100));
console.log();

console.log(`Total Clinical Cases: ${totalCases}`);
console.log(`  ├─ With references: ${casesWithRefs} (${(casesWithRefs / totalCases * 100).toFixed(1)}%)`);
console.log(`  └─ WITHOUT references: ${casesWithoutRefs} (${(casesWithoutRefs / totalCases * 100).toFixed(1)}%)`);
console.log();

if (casesWithoutRefsList.length > 0) {
  console.log(`⚠  CLINICAL CASES WITHOUT REFERENCES (${casesWithoutRefsList.length} total):`);
  console.log();
  casesWithoutRefsList.forEach((caseData, i) => {
    console.log(`  ${(i + 1).toString().padStart(2)}. ID: ${caseData.id}`);
    console.log(`      Title: ${caseData.title}`);
    console.log(`      Domain: ${caseData.domain}`);
    console.log();
  });

  console.log('  RECOMMENDATION: Add medical source references to all clinical cases');
  console.log('  Priority: HIGH - Clinical cases are primary learning content');
} else {
  console.log('✓ All clinical cases have source references');
}
console.log();

// ============================================================================
console.log();
console.log('📅 6. VERSION TRACKING STATUS');
console.log('='.repeat(100));
console.log();

const versionFields = {
  questions: {
    contentVersion: [...questionsFile.matchAll(/contentVersion:/g)].length,
    sourceVersions: [...questionsFile.matchAll(/sourceVersions:/g)].length,
    lastContentUpdate: [...questionsFile.matchAll(/lastContentUpdate:/g)].length,
  },
  cases: {
    contentVersion: [...casesFile.matchAll(/contentVersion:/g)].length,
    sourceVersions: [...casesFile.matchAll(/sourceVersions:/g)].length,
    lastContentUpdate: [...casesFile.matchAll(/lastContentUpdate:/g)].length,
  }
};

console.log('VERSION TRACKING IMPLEMENTATION STATUS:');
console.log();
console.log('Questions:');
console.log(`  contentVersion fields:     ${versionFields.questions.contentVersion}/${totalQuestions} (${(versionFields.questions.contentVersion / totalQuestions * 100).toFixed(1)}%)`);
console.log(`  sourceVersions fields:     ${versionFields.questions.sourceVersions}/${totalQuestions} (${(versionFields.questions.sourceVersions / totalQuestions * 100).toFixed(1)}%)`);
console.log(`  lastContentUpdate fields:  ${versionFields.questions.lastContentUpdate}/${totalQuestions} (${(versionFields.questions.lastContentUpdate / totalQuestions * 100).toFixed(1)}%)`);
console.log();
console.log('Clinical Cases:');
console.log(`  contentVersion fields:     ${versionFields.cases.contentVersion}/${totalCases} (${(versionFields.cases.contentVersion / totalCases * 100).toFixed(1)}%)`);
console.log(`  sourceVersions fields:     ${versionFields.cases.sourceVersions}/${totalCases} (${(versionFields.cases.sourceVersions / totalCases * 100).toFixed(1)}%)`);
console.log(`  lastContentUpdate fields:  ${versionFields.cases.lastContentUpdate}/${totalCases} (${(versionFields.cases.lastContentUpdate / totalCases * 100).toFixed(1)}%)`);
console.log();

const totalTrackable = allQuestionRefs.length + casesWithRefs;
if (versionFields.questions.contentVersion + versionFields.cases.contentVersion === 0) {
  console.log('🔴 VERSION TRACKING: NOT IMPLEMENTED');
  console.log();
  console.log('  Impact:');
  console.log(`    - ${totalTrackable} content items with references have no version tracking`);
  console.log('    - System cannot detect when content becomes outdated');
  console.log('    - No automated alerts when source materials are updated');
  console.log('    - Manual review required to find stale content');
  console.log();
  console.log('  Recommendation:');
  console.log('    - Phase 1: Add version tracking to high-priority content (e.g., ATLS, clinical guidelines)');
  console.log('    - Phase 2: Gradually extend to all referenced content');
  console.log('    - Phase 3: Implement automated monitoring system');
} else {
  console.log('🟡 VERSION TRACKING: PARTIALLY IMPLEMENTED');
}
console.log();

// ============================================================================
console.log();
console.log('⚡ 7. MONITORING EFFECTIVENESS');
console.log('='.repeat(100));
console.log();

const monitoredContent = allQuestionRefs.length + casesWithRefs;
const unmonitoredContent = (totalQuestions + totalCases) - monitoredContent;

console.log('WHAT HAPPENS IF A SOURCE IS UPDATED TODAY?');
console.log();
console.log('Example: If Campbell\'s Operative Orthopaedics publishes 14th edition tomorrow:');
console.log();
console.log(`  ✓ Content flagged for review: ${validRefCounts['campbell-13ed'] || 0} items reference Campbell's`);
console.log(`  ✗ Content that stays outdated: Unknown (no version tracking)`);
console.log(`  ⚠  Unmonitored content: ${unmonitoredContent} items would remain unaware`);
console.log();
console.log('SYSTEM COVERAGE:');
console.log(`  Can monitor: ${monitoredContent}/${totalQuestions + totalCases} items (${(monitoredContent / (totalQuestions + totalCases) * 100).toFixed(1)}%)`);
console.log(`  Blind spots: ${unmonitoredContent} items (${(unmonitoredContent / (totalQuestions + totalCases) * 100).toFixed(1)}%)`);
console.log();

if (unmonitoredContent > 0) {
  console.log('⚠  INVISIBLE CONTENT (cannot be monitored):');
  console.log(`  - ${totalQuestions - allQuestionRefs.length} questions without source references`);
  console.log(`  - ${casesWithoutRefs} clinical cases without source references`);
  console.log('  - These will NOT receive alerts when medical knowledge is updated');
  console.log('  - Risk: Students may learn from outdated information');
}
console.log();

// ============================================================================
console.log();
console.log('💡 8. RECOMMENDATIONS & ACTION ITEMS');
console.log('='.repeat(100));
console.log();

console.log('PRIORITY 1 - CRITICAL (Do Immediately):');
if (Object.keys(uniqueInvalidRefs).length > 0) {
  console.log(`  [ ] Fix ${invalidRefs.length} invalid source references`);
  console.log(`      → ${Object.keys(uniqueInvalidRefs).length} non-existent sources being referenced`);
}
if (casesWithoutRefs > totalCases * 0.5) {
  console.log(`  [ ] Add references to ${casesWithoutRefs} clinical cases (${(casesWithoutRefs / totalCases * 100).toFixed(0)}% missing!)`);
  console.log(`      → Clinical cases are primary learning content - must be source-verified`);
}

console.log();
console.log('PRIORITY 2 - HIGH (Do This Week):');
poorDomains.forEach(([domain, stats]) => {
  if (parseFloat(stats.coverage) < 50) {
    console.log(`  [ ] Improve ${domain} domain coverage (currently ${stats.coverage}%)`);
    console.log(`      → Add references to ${stats.withoutRefs} questions`);
  }
});
if (unusedSources.length > 0) {
  console.log(`  [ ] Review ${unusedSources.length} unused verified sources`);
  console.log(`      → Either create content or remove from verified sources list`);
}

console.log();
console.log('PRIORITY 3 - MEDIUM (Do This Month):');
console.log(`  [ ] Implement version tracking for high-value content`);
console.log(`      → Start with ${usedSources.slice(0, 5).map(s => s[0]).join(', ')}`);
console.log(`      → Add contentVersion, sourceVersions, lastContentUpdate fields`);
poorDomains.forEach(([domain, stats]) => {
  if (parseFloat(stats.coverage) >= 50 && parseFloat(stats.coverage) < 75) {
    console.log(`  [ ] Complete ${domain} domain coverage (currently ${stats.coverage}%)`);
    console.log(`      → Add references to ${stats.withoutRefs} questions`);
  }
});

console.log();
console.log('PRIORITY 4 - LOW (Future Enhancement):');
console.log('  [ ] Develop automated source monitoring system');
console.log('      → Periodic checks for source updates');
console.log('      → Automatic alerts to content creators');
console.log('  [ ] Create content review workflow');
console.log('      → When source updated → flag content → expert review → update/keep');
console.log('  [ ] Add secondary sources to single-reference questions');
console.log('      → Cross-verification improves reliability');
console.log();

// ============================================================================
console.log();
console.log('='.repeat(100));
console.log('END OF DETAILED COVERAGE REPORT');
console.log('='.repeat(100));
console.log();
console.log(`Generated: ${new Date().toISOString()}`);
console.log(`Report saved to: detailed-coverage-report.txt (recommended)`);
console.log();
