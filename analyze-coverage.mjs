#!/usr/bin/env node
/**
 * Comprehensive Content Coverage Analysis for Quality Control System
 * Uses dynamic import to analyze TypeScript files
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// We'll parse the files as text since they're TypeScript
import { readFileSync } from 'fs';

console.log('='.repeat(80));
console.log('ORTOKOMPANION QUALITY CONTROL SYSTEM - COMPREHENSIVE CONTENT COVERAGE AUDIT');
console.log('='.repeat(80));
console.log();

// Load and parse questions file
const questionsFile = readFileSync(join(__dirname, 'data/questions.ts'), 'utf8');
const casesFile = readFileSync(join(__dirname, 'data/unified-clinical-cases.ts'), 'utf8');
const sourcesFile = readFileSync(join(__dirname, 'data/verified-sources.ts'), 'utf8');

// Count questions by parsing the file
const questionMatches = [...questionsFile.matchAll(/{\s*id:\s*['"]([^'"]+)['"]/g)];
const totalQuestions = questionMatches.length;

// Count questions with references
const referencesMatches = [...questionsFile.matchAll(/references:\s*\[([^\]]*)\]/g)];
const questionsWithReferencesCount = referencesMatches.filter(m => m[1].trim().length > 0).length;
const questionsWithoutReferencesCount = totalQuestions - questionsWithReferencesCount;

// Count clinical cases
const casesMatches = [...casesFile.matchAll(/{\s*id:\s*['"]([^'"]+)['"]/g)];
const totalCases = casesMatches.length;

// Count cases with references
const caseReferencesMatches = [...casesFile.matchAll(/references:\s*\[([^\]]*)\]/g)];
const casesWithReferencesCount = caseReferencesMatches.filter(m => m[1].trim().length > 0).length;
const casesWithoutReferencesCount = totalCases - casesWithReferencesCount;

console.log('1. CONTENT COVERAGE ANALYSIS');
console.log('-'.repeat(80));
console.log(`\nQUESTIONS:`);
console.log(`  Total questions: ${totalQuestions}`);
console.log(`  Questions with references: ${questionsWithReferencesCount} (${(questionsWithReferencesCount / totalQuestions * 100).toFixed(1)}%)`);
console.log(`  Questions WITHOUT references: ${questionsWithoutReferencesCount} (${(questionsWithoutReferencesCount / totalQuestions * 100).toFixed(1)}%)`);

// Extract sample questions without references
console.log(`\n  Sample questions WITHOUT references (first 10):`);
let count = 0;
let inQuestion = false;
let currentQ = {};
const lines = questionsFile.split('\n');

for (let i = 0; i < lines.length && count < 10; i++) {
  const line = lines[i];

  if (line.match(/{\s*$/)) {
    inQuestion = true;
    currentQ = {};
    continue;
  }

  if (inQuestion) {
    const idMatch = line.match(/id:\s*['"]([^'"]+)['"]/);
    if (idMatch) currentQ.id = idMatch[1];

    const domainMatch = line.match(/domain:\s*['"]([^'"]+)['"]/);
    if (domainMatch) currentQ.domain = domainMatch[1];

    const questionMatch = line.match(/question:\s*['"]([^'"]+)['"]/);
    if (questionMatch) currentQ.question = questionMatch[1];

    const refMatch = line.match(/references:\s*\[/);
    if (refMatch) currentQ.hasRefs = true;

    if (line.match(/},?\s*$/)) {
      if (currentQ.id && !currentQ.hasRefs) {
        count++;
        console.log(`    ${count}. ID: ${currentQ.id}`);
        console.log(`       Domain: ${currentQ.domain || 'N/A'}`);
        if (currentQ.question) {
          console.log(`       Question: ${currentQ.question.substring(0, 60)}...`);
        }
      }
      inQuestion = false;
      currentQ = {};
    }
  }
}

console.log(`\nCLINICAL CASES:`);
console.log(`  Total cases: ${totalCases}`);
console.log(`  Cases with references: ${casesWithReferencesCount} (${(casesWithReferencesCount / totalCases * 100).toFixed(1)}%)`);
console.log(`  Cases WITHOUT references: ${casesWithoutReferencesCount} (${(casesWithoutReferencesCount / totalCases * 100).toFixed(1)}%)`);

// Extract cases without references
console.log(`\n  Cases WITHOUT references:`);
const caseIdMatches = [...casesFile.matchAll(/id:\s*['"]([^'"]+)['"],[^}]*?title:\s*['"]([^'"]+)['"],[^}]*?domain:\s*['"]([^'"]+)['"]/g)];
let caseCount = 0;
for (const match of caseIdMatches) {
  // Check if this case has references
  const caseId = match[1];
  const caseStart = casesFile.indexOf(`id: '${caseId}'`);
  const nextCaseStart = casesFile.indexOf('  {', caseStart + 1);
  const caseSection = casesFile.substring(caseStart, nextCaseStart > 0 ? nextCaseStart : casesFile.length);

  if (!caseSection.includes('references:')) {
    caseCount++;
    console.log(`    ${caseCount}. ID: ${match[1]}`);
    console.log(`       Title: ${match[2]}`);
    console.log(`       Domain: ${match[3]}`);
  }
}

// ============================================================================
// 2. SOURCE USAGE STATISTICS
// ============================================================================
console.log('\n\n2. SOURCE USAGE STATISTICS');
console.log('-'.repeat(80));

// Extract all source IDs from verified-sources.ts
const sourceIdMatches = [...sourcesFile.matchAll(/['"]([a-z0-9-]+)['"]:\s*{/g)];
const allSources = [...new Set(sourceIdMatches.map(m => m[1]))].filter(id =>
  !['type', 'title', 'author', 'year', 'edition', 'url', 'verificationStatus', 'lastVerified', 'verifiedBy', 'publicationDate', 'expirationDate', 'updateFrequency', 'evidenceLevel', 'reliability', 'publisher', 'doi'].includes(id)
);

console.log(`\nTotal verified sources in database: ${allSources.length}`);

// Count source usage in questions
const sourceUsage = {};
allSources.forEach(id => sourceUsage[id] = 0);

// Count in questions
const questionRefMatches = [...questionsFile.matchAll(/references:\s*\[([^\]]+)\]/g)];
questionRefMatches.forEach(match => {
  const refs = match[1].match(/['"]([^'"]+)['"]/g);
  if (refs) {
    refs.forEach(ref => {
      const cleanRef = ref.replace(/['"]/g, '');
      if (sourceUsage.hasOwnProperty(cleanRef)) {
        sourceUsage[cleanRef]++;
      } else {
        console.log(`  ⚠ Invalid reference found in questions: ${cleanRef}`);
      }
    });
  }
});

// Count in cases
const caseRefMatches = [...casesFile.matchAll(/references:\s*\[([^\]]+)\]/g)];
caseRefMatches.forEach(match => {
  const refs = match[1].match(/['"]([^'"]+)['"]/g);
  if (refs) {
    refs.forEach(ref => {
      const cleanRef = ref.replace(/['"]/g, '');
      if (sourceUsage.hasOwnProperty(cleanRef)) {
        sourceUsage[cleanRef]++;
      }
    });
  }
});

// Sort by usage
const sortedSources = Object.entries(sourceUsage).sort((a, b) => b[1] - a[1]);

console.log('\nTop 10 Most Used Sources:');
sortedSources.slice(0, 10).forEach(([id, count], i) => {
  console.log(`  ${i + 1}. ${id}: ${count} usages`);
});

const unusedSources = sortedSources.filter(([id, count]) => count === 0);
console.log(`\nUnused Sources (${unusedSources.length} total):`);
unusedSources.slice(0, 10).forEach(([id], i) => {
  console.log(`  ${i + 1}. ${id}`);
});
if (unusedSources.length > 10) {
  console.log(`  ... and ${unusedSources.length - 10} more`);
}

// ============================================================================
// 3. DOMAIN COVERAGE
// ============================================================================
console.log('\n\n3. DOMAIN COVERAGE');
console.log('-'.repeat(80));

const domains = ['trauma', 'höft', 'knä', 'axel', 'fot-fotled', 'hand-handled', 'rygg', 'sport', 'tumor'];
const domainStats = {};

domains.forEach(domain => {
  const domainQuestions = [...questionsFile.matchAll(new RegExp(`domain:\\s*['"]${domain}['"]`, 'g'))];
  const domainQuestionsWithRefs = [...questionsFile.matchAll(new RegExp(`domain:\\s*['"]${domain}['"][\\s\\S]{0,1000}references:\\s*\\[[^\\]]+\\]`, 'g'))];

  const total = domainQuestions.length;
  const withRefs = domainQuestionsWithRefs.length;

  domainStats[domain] = {
    total,
    withReferences: withRefs,
    withoutReferences: total - withRefs,
    percentage: total > 0 ? ((withRefs / total) * 100).toFixed(1) : '0.0'
  };
});

console.log('\nDomain-by-Domain Breakdown:');
console.log('Domain              Total    With Refs    Without    Coverage %');
console.log('-'.repeat(70));
Object.entries(domainStats).forEach(([domain, stats]) => {
  console.log(
    `${domain.padEnd(18)} ${String(stats.total).padStart(6)} ${String(stats.withReferences).padStart(12)} ${String(stats.withoutReferences).padStart(11)} ${String(stats.percentage).padStart(10)}%`
  );
});

// ============================================================================
// 4. VERSION TRACKING STATUS
// ============================================================================
console.log('\n\n4. VERSION TRACKING STATUS');
console.log('-'.repeat(80));

const contentVersionMatches = [...questionsFile.matchAll(/contentVersion:/g)];
const sourceVersionsMatches = [...questionsFile.matchAll(/sourceVersions:/g)];
const lastUpdateMatches = [...questionsFile.matchAll(/lastContentUpdate:/g)];

const casesContentVersionMatches = [...casesFile.matchAll(/contentVersion:/g)];
const casesSourceVersionsMatches = [...casesFile.matchAll(/sourceVersions:/g)];
const casesLastUpdateMatches = [...casesFile.matchAll(/lastContentUpdate:/g)];

console.log('\nQUESTIONS:');
console.log(`  With contentVersion field: ${contentVersionMatches.length} / ${totalQuestions} (${(contentVersionMatches.length / totalQuestions * 100).toFixed(1)}%)`);
console.log(`  With sourceVersions field: ${sourceVersionsMatches.length} / ${totalQuestions} (${(sourceVersionsMatches.length / totalQuestions * 100).toFixed(1)}%)`);
console.log(`  With lastContentUpdate field: ${lastUpdateMatches.length} / ${totalQuestions} (${(lastUpdateMatches.length / totalQuestions * 100).toFixed(1)}%)`);

console.log('\nCLINICAL CASES:');
console.log(`  With contentVersion field: ${casesContentVersionMatches.length} / ${totalCases} (${(casesContentVersionMatches.length / totalCases * 100).toFixed(1)}%)`);
console.log(`  With sourceVersions field: ${casesSourceVersionsMatches.length} / ${totalCases} (${(casesSourceVersionsMatches.length / totalCases * 100).toFixed(1)}%)`);
console.log(`  With lastContentUpdate field: ${casesLastUpdateMatches.length} / ${totalCases} (${(casesLastUpdateMatches.length / totalCases * 100).toFixed(1)}%)`);

console.log('\nNOTE: These fields are optional and used for tracking. If populated, they enable:');
console.log('  - Automatic alerts when source materials are updated');
console.log('  - Content version history tracking');
console.log('  - Identification of stale content needing review');

// ============================================================================
// 5. QUALITY ISSUES
// ============================================================================
console.log('\n\n5. QUALITY ISSUES');
console.log('-'.repeat(80));

// Find questions with many references (>5)
const manyRefsMatches = [...questionsFile.matchAll(/references:\s*\[([^\]]+)\]/g)];
const questionsWithManyRefs = manyRefsMatches.filter(m => {
  const refs = m[1].match(/['"]([^'"]+)['"]/g);
  return refs && refs.length > 5;
});

console.log(`\nQuestions with >5 references: ${questionsWithManyRefs.length}`);
if (questionsWithManyRefs.length > 0) {
  console.log(`  (May indicate over-citation or complex topics)`);
}

// Questions with exactly 1 reference
const singleRefMatches = manyRefsMatches.filter(m => {
  const refs = m[1].match(/['"]([^'"]+)['"]/g);
  return refs && refs.length === 1;
});

console.log(`\nQuestions with exactly 1 reference: ${singleRefMatches.length}`);
console.log(`  Note: Single references might need additional sources for verification`);

// ============================================================================
// 6. MONITORING EFFECTIVENESS
// ============================================================================
console.log('\n\n6. MONITORING EFFECTIVENESS');
console.log('-'.repeat(80));

const totalContent = totalQuestions + totalCases;
const monitoredContent = questionsWithReferencesCount + casesWithReferencesCount;
const unmonitoredContent = totalContent - monitoredContent;

console.log(`\nOverall Coverage:`);
console.log(`  Total content items: ${totalContent}`);
console.log(`  Monitored (with references): ${monitoredContent} (${(monitoredContent / totalContent * 100).toFixed(1)}%)`);
console.log(`  Unmonitored (no references): ${unmonitoredContent} (${(unmonitoredContent / totalContent * 100).toFixed(1)}%)`);

console.log(`\nIf all sources were updated today:`);
console.log(`  - ${monitoredContent} content items would be flagged for review`);
console.log(`  - ${unmonitoredContent} content items would remain untracked`);
console.log(`  - Quality system can only monitor ${(monitoredContent / totalContent * 100).toFixed(1)}% of all content`);

console.log(`\nInvisible Content (not tracked by quality system):`);
console.log(`  - ${questionsWithoutReferencesCount} questions without references`);
console.log(`  - ${casesWithoutReferencesCount} clinical cases without references`);
console.log(`  - These items will NOT trigger alerts when medical knowledge updates`);

// ============================================================================
// EXECUTIVE SUMMARY
// ============================================================================
console.log('\n\n');
console.log('='.repeat(80));
console.log('EXECUTIVE SUMMARY');
console.log('='.repeat(80));

console.log(`\nCOVERAGE STATISTICS:`);
console.log(`  Questions: ${questionsWithReferencesCount}/${totalQuestions} (${(questionsWithReferencesCount / totalQuestions * 100).toFixed(1)}%) have references`);
console.log(`  Clinical Cases: ${casesWithReferencesCount}/${totalCases} (${(casesWithReferencesCount / totalCases * 100).toFixed(1)}%) have references`);
console.log(`  Overall: ${monitoredContent}/${totalContent} (${(monitoredContent / totalContent * 100).toFixed(1)}%) content is source-tracked`);

console.log(`\nKEY FINDINGS:`);
console.log(`  ✓ ${sortedSources.filter(([id, count]) => count > 0).length} sources are actively used`);
console.log(`  ✗ ${unusedSources.length} verified sources are not referenced in any content`);
console.log(`  ⚠ ${unmonitoredContent} content items are invisible to quality monitoring`);

console.log(`\nCRITICAL GAPS:`);
if (questionsWithoutReferencesCount / totalQuestions > 0.5) {
  console.log(`  🔴 MAJOR GAP: ${((questionsWithoutReferencesCount / totalQuestions) * 100).toFixed(0)}% of questions lack source references!`);
} else if (questionsWithoutReferencesCount / totalQuestions > 0.2) {
  console.log(`  🟡 MODERATE GAP: ${((questionsWithoutReferencesCount / totalQuestions) * 100).toFixed(0)}% of questions lack source references`);
} else {
  console.log(`  🟢 Good coverage: Only ${((questionsWithoutReferencesCount / totalQuestions) * 100).toFixed(0)}% of questions lack references`);
}

console.log(`\nVERSION TRACKING:`);
console.log(`  Current Implementation: Optional fields (contentVersion, sourceVersions, lastContentUpdate)`);
console.log(`  Questions tracked: ${contentVersionMatches.length}/${totalQuestions} (${(contentVersionMatches.length / totalQuestions * 100).toFixed(1)}%)`);
console.log(`  Cases tracked: ${casesContentVersionMatches.length}/${totalCases} (${(casesContentVersionMatches.length / totalCases * 100).toFixed(1)}%)`);
console.log(`  Potential: If all ${monitoredContent} referenced items were tracked, system could monitor version drift`);

console.log(`\nRECOMMENDATIONS:`);
console.log(`  1. URGENT: Add references to ${questionsWithoutReferencesCount} questions currently untracked`);
console.log(`  2. Add references to ${casesWithoutReferencesCount} clinical cases currently untracked`);
console.log(`  3. Review ${singleRefMatches.length} questions with only single reference - add secondary sources`);
console.log(`  4. Consider removing or creating content for ${unusedSources.length} unused sources`);
console.log(`  5. Implement version tracking fields for high-priority content (${monitoredContent} items)`);
console.log(`  6. Establish review process for content when sources are updated`);

console.log('\n' + '='.repeat(80));
console.log('END OF REPORT');
console.log('='.repeat(80));
