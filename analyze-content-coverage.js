#!/usr/bin/env node
/**
 * Comprehensive Content Coverage Analysis for Quality Control System
 */

const fs = require('fs');
const path = require('path');

// Import the data files
const questionsPath = path.join(__dirname, 'data/questions.ts');
const casesPath = path.join(__dirname, 'data/unified-clinical-cases.ts');
const sourcesPath = path.join(__dirname, 'data/verified-sources.ts');

// Read and evaluate the files
let ALL_QUESTIONS = [];
let UNIFIED_CLINICAL_CASES = [];
let VERIFIED_SOURCES = {};

try {
  // Read questions
  const questionsContent = fs.readFileSync(questionsPath, 'utf8');
  // Extract the array - find the export line
  const questionsMatch = questionsContent.match(/export const ALL_QUESTIONS[^=]*=\s*(\[[\s\S]*?\n\]);/);
  if (questionsMatch) {
    // Use eval in a safer way - we control this code
    ALL_QUESTIONS = eval(questionsMatch[1]);
  }

  // Read cases
  const casesContent = fs.readFileSync(casesPath, 'utf8');
  const casesMatch = casesContent.match(/export const UNIFIED_CLINICAL_CASES[^=]*=\s*(\[[\s\S]*?\n\]);/);
  if (casesMatch) {
    UNIFIED_CLINICAL_CASES = eval(casesMatch[1]);
  }

  // Read sources
  const sourcesContent = fs.readFileSync(sourcesPath, 'utf8');
  const sourcesMatch = sourcesContent.match(/export const VERIFIED_SOURCES[^=]*=\s*(\{[\s\S]*?\n\});/);
  if (sourcesMatch) {
    // Helper function for dates
    const createDate = (year, month, day) => new Date(year, month - 1, day);
    VERIFIED_SOURCES = eval('(' + sourcesMatch[1] + ')');
  }
} catch (error) {
  console.error('Error loading data:', error.message);
  process.exit(1);
}

console.log('='.repeat(80));
console.log('ORTOKOMPANION QUALITY CONTROL SYSTEM - COMPREHENSIVE CONTENT COVERAGE AUDIT');
console.log('='.repeat(80));
console.log();

// ============================================================================
// 1. CONTENT COVERAGE ANALYSIS
// ============================================================================
console.log('1. CONTENT COVERAGE ANALYSIS');
console.log('-'.repeat(80));

// Questions Analysis
const totalQuestions = ALL_QUESTIONS.length;
const questionsWithReferences = ALL_QUESTIONS.filter(q => q.references && q.references.length > 0);
const questionsWithoutReferences = ALL_QUESTIONS.filter(q => !q.references || q.references.length === 0);

console.log(`\nQUESTIONS:`);
console.log(`  Total questions: ${totalQuestions}`);
console.log(`  Questions with references: ${questionsWithReferences.length} (${(questionsWithReferences.length / totalQuestions * 100).toFixed(1)}%)`);
console.log(`  Questions WITHOUT references: ${questionsWithoutReferences.length} (${(questionsWithoutReferences.length / totalQuestions * 100).toFixed(1)}%)`);

// Show first 10 examples of questions without references
console.log(`\n  First 10 questions WITHOUT references:`);
questionsWithoutReferences.slice(0, 10).forEach((q, i) => {
  console.log(`    ${i + 1}. ID: ${q.id}`);
  console.log(`       Domain: ${q.domain || 'N/A'}`);
  console.log(`       Question: ${q.question?.substring(0, 80) || q.stem?.substring(0, 80) || 'N/A'}...`);
});

// Clinical Cases Analysis
const totalCases = UNIFIED_CLINICAL_CASES.length;
const casesWithReferences = UNIFIED_CLINICAL_CASES.filter(c => c.references && c.references.length > 0);
const casesWithoutReferences = UNIFIED_CLINICAL_CASES.filter(c => !c.references || c.references.length === 0);

console.log(`\nCLINICAL CASES:`);
console.log(`  Total cases: ${totalCases}`);
console.log(`  Cases with references: ${casesWithReferences.length} (${(casesWithReferences.length / totalCases * 100).toFixed(1)}%)`);
console.log(`  Cases WITHOUT references: ${casesWithoutReferences.length} (${(casesWithoutReferences.length / totalCases * 100).toFixed(1)}%)`);

console.log(`\n  Cases WITHOUT references:`);
casesWithoutReferences.forEach((c, i) => {
  console.log(`    ${i + 1}. ID: ${c.id}`);
  console.log(`       Title: ${c.title}`);
  console.log(`       Domain: ${c.domain}`);
  console.log(`       Mode: ${c.mode}, Level: ${c.level}`);
});

// ============================================================================
// 2. SOURCE USAGE STATISTICS
// ============================================================================
console.log('\n\n2. SOURCE USAGE STATISTICS');
console.log('-'.repeat(80));

// Count source usage
const sourceUsageCount = {};
const allSourceIds = Object.keys(VERIFIED_SOURCES);

// Initialize counts
allSourceIds.forEach(id => {
  sourceUsageCount[id] = 0;
});

// Count from questions
questionsWithReferences.forEach(q => {
  if (q.references) {
    q.references.forEach(ref => {
      if (sourceUsageCount.hasOwnProperty(ref)) {
        sourceUsageCount[ref]++;
      } else {
        // Track unknown sources
        if (!sourceUsageCount['__INVALID__']) sourceUsageCount['__INVALID__'] = [];
        sourceUsageCount['__INVALID__'].push({ type: 'question', id: q.id, ref });
      }
    });
  }
});

// Count from cases
casesWithReferences.forEach(c => {
  if (c.references) {
    c.references.forEach(ref => {
      if (sourceUsageCount.hasOwnProperty(ref)) {
        sourceUsageCount[ref]++;
      } else {
        if (!sourceUsageCount['__INVALID__']) sourceUsageCount['__INVALID__'] = [];
        sourceUsageCount['__INVALID__'].push({ type: 'case', id: c.id, ref });
      }
    });
  }
});

// Top 10 most used sources
const sortedSources = Object.entries(sourceUsageCount)
  .filter(([id]) => id !== '__INVALID__')
  .sort((a, b) => b[1] - a[1]);

console.log('\nTop 10 Most Used Sources:');
sortedSources.slice(0, 10).forEach(([id, count], i) => {
  const source = VERIFIED_SOURCES[id];
  console.log(`  ${i + 1}. ${id}`);
  console.log(`     Usage count: ${count}`);
  console.log(`     Title: ${source?.title || 'N/A'}`);
  console.log(`     Type: ${source?.type || 'N/A'}`);
});

// Unused sources
const unusedSources = sortedSources.filter(([id, count]) => count === 0);
console.log(`\nUnused Sources (${unusedSources.length} total):`);
unusedSources.slice(0, 10).forEach(([id]) => {
  const source = VERIFIED_SOURCES[id];
  console.log(`  - ${id}: ${source?.title || 'N/A'} (${source?.type || 'N/A'})`);
});

// Invalid source references
if (sourceUsageCount['__INVALID__']) {
  console.log(`\nINVALID SOURCE REFERENCES FOUND (${sourceUsageCount['__INVALID__'].length}):`);
  sourceUsageCount['__INVALID__'].slice(0, 10).forEach(item => {
    console.log(`  - ${item.type.toUpperCase()} ${item.id}: references non-existent source "${item.ref}"`);
  });
  if (sourceUsageCount['__INVALID__'].length > 10) {
    console.log(`  ... and ${sourceUsageCount['__INVALID__'].length - 10} more`);
  }
}

// ============================================================================
// 3. DOMAIN COVERAGE
// ============================================================================
console.log('\n\n3. DOMAIN COVERAGE');
console.log('-'.repeat(80));

const domainStats = {};
const domains = ['trauma', 'höft', 'knä', 'axel', 'fot-fotled', 'hand-handled', 'rygg', 'sport', 'tumor'];

domains.forEach(domain => {
  const domainQuestions = ALL_QUESTIONS.filter(q =>
    q.domain === domain || q.domains?.includes(domain)
  );
  const withRefs = domainQuestions.filter(q => q.references && q.references.length > 0);

  domainStats[domain] = {
    total: domainQuestions.length,
    withReferences: withRefs.length,
    withoutReferences: domainQuestions.length - withRefs.length,
    percentage: domainQuestions.length > 0
      ? (withRefs.length / domainQuestions.length * 100).toFixed(1)
      : 0
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

const questionsWithVersion = ALL_QUESTIONS.filter(q => q.contentVersion);
const questionsWithSourceVersions = ALL_QUESTIONS.filter(q => q.sourceVersions);
const questionsWithLastUpdate = ALL_QUESTIONS.filter(q => q.lastContentUpdate);

const casesWithVersion = UNIFIED_CLINICAL_CASES.filter(c => c.contentVersion);
const casesWithSourceVersions = UNIFIED_CLINICAL_CASES.filter(c => c.sourceVersions);
const casesWithLastUpdate = UNIFIED_CLINICAL_CASES.filter(c => c.lastContentUpdate);

console.log('\nQUESTIONS:');
console.log(`  With contentVersion field: ${questionsWithVersion.length} / ${totalQuestions} (${(questionsWithVersion.length / totalQuestions * 100).toFixed(1)}%)`);
console.log(`  With sourceVersions field: ${questionsWithSourceVersions.length} / ${totalQuestions} (${(questionsWithSourceVersions.length / totalQuestions * 100).toFixed(1)}%)`);
console.log(`  With lastContentUpdate field: ${questionsWithLastUpdate.length} / ${totalQuestions} (${(questionsWithLastUpdate.length / totalQuestions * 100).toFixed(1)}%)`);

console.log('\nCLINICAL CASES:');
console.log(`  With contentVersion field: ${casesWithVersion.length} / ${totalCases} (${(casesWithVersion.length / totalCases * 100).toFixed(1)}%)`);
console.log(`  With sourceVersions field: ${casesWithSourceVersions.length} / ${totalCases} (${(casesWithSourceVersions.length / totalCases * 100).toFixed(1)}%)`);
console.log(`  With lastContentUpdate field: ${casesWithLastUpdate.length} / ${totalCases} (${(casesWithLastUpdate.length / totalCases * 100).toFixed(1)}%)`);

console.log('\nNOTE: These fields are optional and used for tracking. If populated, they enable:');
console.log('  - Automatic alerts when source materials are updated');
console.log('  - Content version history tracking');
console.log('  - Identification of stale content needing review');

// ============================================================================
// 5. QUALITY ISSUES
// ============================================================================
console.log('\n\n5. QUALITY ISSUES');
console.log('-'.repeat(80));

// Questions with suspiciously many references
const questionsWithManyRefs = questionsWithReferences.filter(q => q.references.length > 5);
console.log(`\nQuestions with >5 references (${questionsWithManyRefs.length}):`);
questionsWithManyRefs.slice(0, 5).forEach(q => {
  console.log(`  - ${q.id}: ${q.references.length} references`);
  console.log(`    ${q.question?.substring(0, 60) || q.stem?.substring(0, 60)}...`);
});

// Questions with only 1 reference
const questionsWithOneRef = questionsWithReferences.filter(q => q.references.length === 1);
console.log(`\nQuestions with exactly 1 reference (${questionsWithOneRef.length}):`);
console.log(`  Note: Single references might need additional sources for verification`);
console.log(`  Sample (first 5):`);
questionsWithOneRef.slice(0, 5).forEach(q => {
  console.log(`    - ${q.id}: ${q.references[0]}`);
});

// Recent questions - check last 20
const recentQuestions = ALL_QUESTIONS.slice(-20);
const recentWithRefs = recentQuestions.filter(q => q.references && q.references.length > 0);
console.log(`\nRecent Questions Analysis (last 20):`);
console.log(`  Questions with references: ${recentWithRefs.length} / 20 (${(recentWithRefs.length / 20 * 100).toFixed(1)}%)`);
console.log(`  Questions without references: ${20 - recentWithRefs.length} / 20`);

// ============================================================================
// 6. MONITORING EFFECTIVENESS
// ============================================================================
console.log('\n\n6. MONITORING EFFECTIVENESS');
console.log('-'.repeat(80));

const totalContent = totalQuestions + totalCases;
const monitoredContent = questionsWithReferences.length + casesWithReferences.length;
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
console.log(`  - ${questionsWithoutReferences.length} questions without references`);
console.log(`  - ${casesWithoutReferences.length} clinical cases without references`);
console.log(`  - These items will not trigger alerts when medical knowledge updates`);

// ============================================================================
// EXECUTIVE SUMMARY
// ============================================================================
console.log('\n\n');
console.log('='.repeat(80));
console.log('EXECUTIVE SUMMARY');
console.log('='.repeat(80));

console.log(`\nCOVERAGE STATISTICS:`);
console.log(`  Questions: ${questionsWithReferences.length}/${totalQuestions} (${(questionsWithReferences.length / totalQuestions * 100).toFixed(1)}%) have references`);
console.log(`  Clinical Cases: ${casesWithReferences.length}/${totalCases} (${(casesWithReferences.length / totalCases * 100).toFixed(1)}%) have references`);
console.log(`  Overall: ${monitoredContent}/${totalContent} (${(monitoredContent / totalContent * 100).toFixed(1)}%) content is source-tracked`);

console.log(`\nKEY FINDINGS:`);
console.log(`  ✓ ${sortedSources.filter(([id, count]) => count > 0).length} sources are actively used`);
console.log(`  ✗ ${unusedSources.length} verified sources are not referenced in any content`);
if (sourceUsageCount['__INVALID__']) {
  console.log(`  ⚠ ${sourceUsageCount['__INVALID__'].length} invalid source references found`);
}
console.log(`  ⚠ ${unmonitoredContent} content items are invisible to quality monitoring`);

console.log(`\nVERSION TRACKING:`);
console.log(`  Current Implementation: Optional fields (contentVersion, sourceVersions, lastContentUpdate)`);
console.log(`  Questions tracked: ${questionsWithVersion.length}/${totalQuestions}`);
console.log(`  Cases tracked: ${casesWithVersion.length}/${totalCases}`);
console.log(`  Potential: If all ${monitoredContent} referenced items were tracked, system could monitor version drift`);

console.log(`\nRECOMMENDATIONS:`);
console.log(`  1. Add references to ${questionsWithoutReferences.length} questions currently untracked`);
console.log(`  2. Add references to ${casesWithoutReferences.length} clinical cases currently untracked`);
console.log(`  3. Review ${questionsWithOneRef.length} questions with only single reference - add secondary sources`);
if (sourceUsageCount['__INVALID__']) {
  console.log(`  4. Fix ${sourceUsageCount['__INVALID__'].length} invalid source references`);
}
console.log(`  5. Consider removing ${unusedSources.length} unused sources or creating content for them`);
console.log(`  6. Implement systematic version tracking for high-priority content`);

console.log('\n' + '='.repeat(80));
console.log('END OF REPORT');
console.log('='.repeat(80));
