/**
 * Test script for goal ID compatibility layer
 * Verifies that legacy goal IDs are properly mapped to new system
 */

import {
  isLegacyGoalId,
  normalizeGoalIds,
  analyzeLegacyGoalUsage,
  getGoalByIdCompatible,
} from '../lib/goal-id-compatibility';

// Sample legacy goal IDs from questions.ts
const testGoalIds = [
  'lp-01',
  'lp-03',
  'bt-01',
  'at-01',
  'st1-01',
  'st2-04',
  'st3-01',
  'st5-02',
  'delmål-1.1',
  'delmål-1.2',
  'lex-001', // New format
  'akut-001', // New format
];

console.log('🧪 Testing Goal ID Compatibility Layer\n');
console.log('=' .repeat(60));

// Test 1: Legacy detection
console.log('\n📋 Test 1: Legacy Goal ID Detection');
console.log('-'.repeat(60));
testGoalIds.forEach((id) => {
  const isLegacy = isLegacyGoalId(id);
  console.log(`  ${id.padEnd(15)} → ${isLegacy ? '❌ Legacy' : '✅ New format'}`);
});

// Test 2: Normalization
console.log('\n📋 Test 2: Goal ID Normalization');
console.log('-'.repeat(60));
const { normalized, warnings } = normalizeGoalIds(testGoalIds);
console.log(`  Input:  ${testGoalIds.length} goal IDs`);
console.log(`  Output: ${normalized.length} normalized IDs`);
console.log(`  Warnings: ${warnings.length}`);
if (warnings.length > 0) {
  console.log('\n  ⚠️  Warnings:');
  warnings.forEach((w) => console.log(`     ${w}`));
}
console.log('\n  Normalized IDs:');
normalized.forEach((id) => console.log(`     ${id}`));

// Test 3: Usage analysis
console.log('\n📋 Test 3: Legacy Goal Usage Analysis');
console.log('-'.repeat(60));
const analysis = analyzeLegacyGoalUsage(testGoalIds);
console.log(`  Total goal IDs: ${analysis.total}`);
console.log(`  Legacy format:  ${analysis.legacy} (${((analysis.legacy / analysis.total) * 100).toFixed(1)}%)`);
console.log(`  New format:     ${analysis.new} (${((analysis.new / analysis.total) * 100).toFixed(1)}%)`);
console.log(`  Unmappable:     ${analysis.unmappable}`);
console.log('\n  By program:');
Object.entries(analysis.details).forEach(([program, count]) => {
  console.log(`     ${program}: ${count}`);
});

// Test 4: Individual lookups
console.log('\n📋 Test 4: Individual Goal Lookups');
console.log('-'.repeat(60));
const lookupTests = ['lp-01', 'st2-04', 'lex-001', 'nonexistent-123'];
lookupTests.forEach((id) => {
  const result = getGoalByIdCompatible(id);
  console.log(`\n  ${id}:`);
  console.log(`     Found: ${result.found ? '✅ Yes' : '❌ No'}`);
  console.log(`     Legacy: ${result.wasLegacy ? 'Yes' : 'No'}`);
  if (result.goalId) {
    console.log(`     Mapped to: ${result.goalId}`);
  }
  if (result.warning) {
    console.log(`     ⚠️  ${result.warning}`);
  }
});

// Test 5: Real-world scenario - question with mixed goal IDs
console.log('\n📋 Test 5: Real-World Scenario');
console.log('-'.repeat(60));
const questionGoalIds = ['lp-03', 'st1-01', 'lex-001']; // Mixed old and new
console.log('  Question has relatedGoals:', JSON.stringify(questionGoalIds));
const { normalized: normalizedQuestionGoals, warnings: questionWarnings } =
  normalizeGoalIds(questionGoalIds);
console.log('  After normalization:', JSON.stringify(normalizedQuestionGoals));
if (questionWarnings.length > 0) {
  console.log('  Warnings:');
  questionWarnings.forEach((w) => console.log(`     ${w}`));
}

console.log('\n' + '='.repeat(60));
console.log('✅ Goal ID Compatibility Layer Test Complete\n');
