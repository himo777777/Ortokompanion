#!/usr/bin/env tsx

/**
 * Test Domain-Specific Goal Mapping
 *
 * Verifies that getMålForDomain() returns comprehensive goals for each domain
 */

import { getMålForDomain } from '@/data/socialstyrelsen-goals';

console.log('🎯 Testing Domain-Specific Goal Mappings\n');
console.log('='.repeat(70));

const domains = [
  'trauma',
  'höft',
  'knä',
  'axel-armbåge',
  'hand-handled',
  'fot-fotled',
  'rygg',
  'sport',
  'tumör',
] as const;

const levels = ['student', 'st1', 'st2', 'st3', 'st4', 'st5'] as const;

// Test each domain at different levels
for (const domain of domains) {
  console.log(`\n📊 Domain: ${domain.toUpperCase()}`);
  console.log('-'.repeat(70));

  for (const level of levels) {
    const goals = getMålForDomain(domain, level);

    // Group goals by category
    const categoryCounts: Record<string, number> = {};
    goals.forEach(goal => {
      categoryCounts[goal.category] = (categoryCounts[goal.category] || 0) + 1;
    });

    console.log(`\n  Level: ${level} → ${goals.length} mål`);

    // Show top categories
    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    topCategories.forEach(([category, count]) => {
      console.log(`    • ${category}: ${count}`);
    });

    // Show some example goal IDs
    const exampleIds = goals.slice(0, 5).map(g => g.id).join(', ');
    console.log(`    Examples: ${exampleIds}`);
  }
}

// Summary statistics
console.log('\n\n📈 SUMMARY');
console.log('='.repeat(70));

for (const domain of domains) {
  const st2Goals = getMålForDomain(domain, 'st2');
  const st5Goals = getMålForDomain(domain, 'st5');

  console.log(`${domain.padEnd(20)} ST2: ${String(st2Goals.length).padStart(3)} mål  |  ST5: ${String(st5Goals.length).padStart(3)} mål`);
}

// Detailed breakdown for one domain
console.log('\n\n🔍 DETAILED BREAKDOWN: Sport @ ST3');
console.log('='.repeat(70));

const sportST3 = getMålForDomain('sport', 'st3');
console.log(`Total: ${sportST3.length} mål\n`);

const sportCategories: Record<string, string[]> = {};
sportST3.forEach(goal => {
  if (!sportCategories[goal.category]) {
    sportCategories[goal.category] = [];
  }
  sportCategories[goal.category].push(`${goal.id}: ${goal.title}`);
});

Object.entries(sportCategories)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([category, goals]) => {
    console.log(`\n${category} (${goals.length} mål):`);
    goals.forEach(goal => console.log(`  • ${goal}`));
  });

console.log('\n\n✅ Test complete!');
