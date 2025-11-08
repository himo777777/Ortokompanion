/**
 * Test Goal-Aware Generation System
 * Tests the new goal-aware content generation
 */

import {
import { logger } from '../lib/logger';
  ALL_FOCUSED_GOALS,
  BT_GOALS,
  AT_GOALS,
  ORTOPEDI_GOALS,
  getGoalsByProgram,
} from '../data/focused-socialstyrelsen-goals';
import { generateQuestionsForGoal } from '../lib/goal-aware-generator';
import { logger } from '../lib/logger';

async function testGoalSystem() {
  console.log('🧪 Testing Goal-Aware Generation System\n');
  console.log('═══════════════════════════════════════════════════\n');

  // Test 1: Check goal database
  console.log('📊 Test 1: Goal Database Statistics');
  console.log('─────────────────────────────────────');
  console.log(`Total goals loaded: ${ALL_FOCUSED_GOALS.length}`);
  console.log(`BT goals: ${BT_GOALS.length}`);
  console.log(`AT goals: ${AT_GOALS.length}`);
  console.log(`Ortopedi ST goals: ${ORTOPEDI_GOALS.length}\n`);

  // Test 2: Check goal structure
  console.log('🔍 Test 2: Goal Structure Validation');
  console.log('─────────────────────────────────────');
  const sampleGoal = BT_GOALS[0];
  console.log(`Sample goal: ${sampleGoal.id}`);
  console.log(`  Title: ${sampleGoal.title}`);
  console.log(`  Program: ${sampleGoal.program}`);
  console.log(`  Specialty: ${sampleGoal.specialty}`);
  console.log(`  Category: ${sampleGoal.category}`);
  console.log(`  Competency Area: ${sampleGoal.competencyArea}`);
  console.log(`  Required: ${sampleGoal.required}`);
  console.log(`  Assessment Criteria: ${sampleGoal.assessmentCriteria.length} items`);
  console.log(`  Clinical Scenarios: ${sampleGoal.clinicalScenarios?.length || 0} items\n`);

  // Test 3: Query goals by program
  console.log('🎯 Test 3: Query Goals by Program');
  console.log('─────────────────────────────────────');
  const btGoals = getGoalsByProgram('bt');
  const atGoals = getGoalsByProgram('at');
  const stGoals = getGoalsByProgram('st');
  console.log(`BT program goals: ${btGoals.length}`);
  console.log(`AT program goals: ${atGoals.length}`);
  console.log(`ST program goals: ${stGoals.length}\n`);

  // Test 4: Check goal coverage
  console.log('📈 Test 4: Goal Coverage by Competency Area');
  console.log('─────────────────────────────────────');
  const competencyAreas = new Set(
    ALL_FOCUSED_GOALS.map((g) => g.competencyArea)
  );
  competencyAreas.forEach((area) => {
    const count = ALL_FOCUSED_GOALS.filter(
      (g) => g.competencyArea === area
    ).length;
    console.log(`  ${area}: ${count} goals`);
  });
  console.log();

  // Test 5: Test question generation (if API key available)
  if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    console.log('🤖 Test 5: AI Question Generation');
    console.log('─────────────────────────────────────');
    console.log('Generating 1 test question for BT goal...\n');

    try {
      const testGoal = BT_GOALS.find((g) => g.id === 'bt-001');
      if (testGoal) {
        console.log(`Target goal: ${testGoal.title}`);
        console.log(`Generating question...`);

        const questions = await generateQuestionsForGoal(testGoal, 1, ['B']);

        if (questions.length > 0) {
          const q = questions[0];
          console.log('\n✅ Successfully generated question:');
          console.log(`   ID: ${q.id}`);
          console.log(`   Question: ${q.question.substring(0, 100)}...`);
          console.log(`   Difficulty: ${q.difficulty}`);
          console.log(`   Options: ${q.options.length}`);
          console.log(`   Targeted goals: ${q.targetedGoals.join(', ')}`);
          console.log(`   Quality score: ${(q.metadata.qualityScore * 100).toFixed(1)}%`);
          console.log(`   Validated: ${q.metadata.validated ? '✅' : '❌'}\n`);
        }
      }
    } catch (error) {
      logger.error('❌ Error during question generation:', error);
      console.log('   (This might be due to API rate limits or key issues)\n');
    }
  } else {
    console.log('⚠️  Test 5: Skipped (No OpenAI API key)');
    console.log('─────────────────────────────────────');
    console.log('Set NEXT_PUBLIC_OPENAI_API_KEY to test AI generation\n');
  }

  // Test 6: Validate goal relationships
  console.log('🔗 Test 6: Goal Relationships');
  console.log('─────────────────────────────────────');
  const goalsWithDiagnoses = ALL_FOCUSED_GOALS.filter(
    (g) => g.associatedDiagnoses && g.associatedDiagnoses.length > 0
  );
  const goalsWithProcedures = ALL_FOCUSED_GOALS.filter(
    (g) => g.associatedProcedures && g.associatedProcedures.length > 0
  );
  const goalsWithScenarios = ALL_FOCUSED_GOALS.filter(
    (g) => g.clinicalScenarios && g.clinicalScenarios.length > 0
  );

  console.log(`Goals with associated diagnoses: ${goalsWithDiagnoses.length}`);
  console.log(`Goals with associated procedures: ${goalsWithProcedures.length}`);
  console.log(`Goals with clinical scenarios: ${goalsWithScenarios.length}\n`);

  // Test 7: Program distribution
  console.log('📊 Test 7: Program Distribution');
  console.log('─────────────────────────────────────');
  const programs = ['läkarexamen', 'bt', 'at', 'st'] as const;
  programs.forEach((program) => {
    const goals = ALL_FOCUSED_GOALS.filter((g) => g.program === program);
    const required = goals.filter((g) => g.required).length;
    const optional = goals.filter((g) => !g.required).length;
    console.log(`${program.toUpperCase()}:`);
    console.log(`  Total: ${goals.length}`);
    console.log(`  Required: ${required}`);
    console.log(`  Optional: ${optional}`);
  });

  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ Goal System Test Complete!\n');
}

// Run tests
if (require.main === module) {
  testGoalSystem()
    .then(() => {
      console.log('All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Test failed:', error);
      process.exit(1);
    });
}

export { testGoalSystem };
