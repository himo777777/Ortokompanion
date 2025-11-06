/**
 * Generate Questions for Specific Goals
 * Uses the new goal-aware generation system
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  BT_GOALS,
  AT_GOALS,
  ORTOPEDI_GOALS,
  getGoalsByProgram,
  type SocialstyrelsensGoal,
} from '../data/focused-socialstyrelsen-goals';
import { generateQuestionsForGoal } from '../lib/goal-aware-generator';

interface GenerationOptions {
  program: 'bt' | 'at' | 'st';
  goalId?: string;
  count?: number;
  difficulties?: Array<'A' | 'B' | 'C' | 'D' | 'E'>;
  saveToFile?: boolean;
}

async function generateGoalQuestions(options: GenerationOptions) {
  const {
    program,
    goalId,
    count = 5,
    difficulties = ['B', 'C', 'D'],
    saveToFile = true,
  } = options;

  console.log('🎯 Goal-Aware Question Generation');
  console.log('═══════════════════════════════════════════════════\n');

  // Get goals
  let targetGoals: SocialstyrelsensGoal[];

  if (goalId) {
    // Find specific goal
    const goal = getGoalsByProgram(program).find((g) => g.id === goalId);
    if (!goal) {
      console.error(`❌ Goal ${goalId} not found in ${program.toUpperCase()} program`);
      process.exit(1);
    }
    targetGoals = [goal];
  } else {
    // Get all required goals for program
    targetGoals = getGoalsByProgram(program).filter((g) => g.required).slice(0, 3);
  }

  console.log(`📊 Program: ${program.toUpperCase()}`);
  console.log(`📚 Goals to process: ${targetGoals.length}`);
  console.log(`🎲 Questions per goal: ${count}`);
  console.log(`📈 Difficulties: ${difficulties.join(', ')}\n`);

  const allGeneratedQuestions: any[] = [];
  let totalGenerated = 0;
  let totalFailed = 0;

  for (const goal of targetGoals) {
    console.log(`\n🎯 Processing goal: ${goal.id}`);
    console.log(`   Title: ${goal.title}`);
    console.log(`   Category: ${goal.category}`);
    console.log(`   Competency: ${goal.competencyArea}`);

    try {
      const questions = await generateQuestionsForGoal(goal, count, difficulties);

      console.log(`   ✅ Generated ${questions.length} questions`);
      console.log(`   📊 Quality scores:`);
      questions.forEach((q, i) => {
        console.log(
          `      Q${i + 1}: ${(q.metadata.qualityScore * 100).toFixed(1)}% ${
            q.metadata.validated ? '✅' : '⚠️'
          }`
        );
      });

      allGeneratedQuestions.push(...questions);
      totalGenerated += questions.length;
    } catch (error) {
      console.error(`   ❌ Failed to generate questions:`, error);
      totalFailed++;
    }

    // Rate limiting between goals
    if (targetGoals.indexOf(goal) < targetGoals.length - 1) {
      console.log(`   ⏳ Waiting 2s before next goal...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 GENERATION SUMMARY');
  console.log('═══════════════════════════════════════════════════\n');
  console.log(`Goals processed: ${targetGoals.length}`);
  console.log(`Questions generated: ${totalGenerated}`);
  console.log(`Failed goals: ${totalFailed}`);

  // Calculate quality metrics
  const qualityScores = allGeneratedQuestions.map((q) => q.metadata.qualityScore);
  const avgQuality =
    qualityScores.length > 0
      ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
      : 0;
  const validatedCount = allGeneratedQuestions.filter((q) => q.metadata.validated).length;

  console.log(`\nQuality Metrics:`);
  console.log(`  Average quality: ${(avgQuality * 100).toFixed(1)}%`);
  console.log(`  Auto-validated: ${validatedCount}/${allGeneratedQuestions.length} (${((validatedCount / allGeneratedQuestions.length) * 100).toFixed(1)}%)`);

  // Save to file if requested
  if (saveToFile && allGeneratedQuestions.length > 0) {
    const outputDir = path.join(process.cwd(), 'generated');
    fs.mkdirSync(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `goal-questions-${program}-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);

    const output = {
      metadata: {
        program,
        generatedAt: new Date().toISOString(),
        totalQuestions: allGeneratedQuestions.length,
        goals: targetGoals.map((g) => ({
          id: g.id,
          title: g.title,
          category: g.category,
        })),
        qualityMetrics: {
          averageQuality: avgQuality,
          validatedCount,
          validatedPercentage: (validatedCount / allGeneratedQuestions.length) * 100,
        },
      },
      questions: allGeneratedQuestions,
    };

    fs.writeFileSync(filepath, JSON.stringify(output, null, 2));
    console.log(`\n💾 Saved to: ${filepath}`);

    // Also create a readable summary
    const summaryFile = path.join(outputDir, `goal-questions-${program}-${timestamp}-summary.txt`);
    const summary = `
Goal-Aware Question Generation Summary
=======================================

Program: ${program.toUpperCase()}
Generated: ${new Date().toISOString()}
Total Questions: ${allGeneratedQuestions.length}

Goals Processed:
${targetGoals.map((g, i) => `${i + 1}. ${g.id}: ${g.title}`).join('\n')}

Quality Metrics:
- Average Quality Score: ${(avgQuality * 100).toFixed(1)}%
- Auto-validated: ${validatedCount}/${allGeneratedQuestions.length}
- Validation Rate: ${((validatedCount / allGeneratedQuestions.length) * 100).toFixed(1)}%

Questions by Goal:
${targetGoals.map((goal) => {
  const goalQuestions = allGeneratedQuestions.filter((q) => q.targetedGoals.includes(goal.id));
  return `
${goal.id} - ${goal.title}
${'-'.repeat(50)}
  Questions: ${goalQuestions.length}
  Avg Quality: ${((goalQuestions.reduce((sum, q) => sum + q.metadata.qualityScore, 0) / goalQuestions.length) * 100).toFixed(1)}%
  Difficulties: ${Array.from(new Set(goalQuestions.map((q) => q.difficulty))).join(', ')}
`;
}).join('\n')}

Sample Question:
${allGeneratedQuestions[0] ? `
ID: ${allGeneratedQuestions[0].id}
Domain: ${allGeneratedQuestions[0].domain}
Difficulty: ${allGeneratedQuestions[0].difficulty}
Question: ${allGeneratedQuestions[0].question.substring(0, 200)}...
Quality: ${(allGeneratedQuestions[0].metadata.qualityScore * 100).toFixed(1)}%
Validated: ${allGeneratedQuestions[0].metadata.validated ? 'Yes' : 'No'}
` : 'No questions generated'}
    `.trim();

    fs.writeFileSync(summaryFile, summary);
    console.log(`📄 Summary saved to: ${summaryFile}`);
  }

  console.log('\n✅ Generation complete!\n');

  return allGeneratedQuestions;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  const program = (args[0] || 'bt') as 'bt' | 'at' | 'st';
  const goalId = args[1];
  const count = parseInt(args[2] || '3', 10);

  if (!['bt', 'at', 'st'].includes(program)) {
    console.error('❌ Invalid program. Use: bt, at, or st');
    console.log('\nUsage: npm run generate-goal-questions [program] [goalId] [count]');
    console.log('\nExamples:');
    console.log('  npm run generate-goal-questions bt');
    console.log('  npm run generate-goal-questions bt bt-001 5');
    console.log('  npm run generate-goal-questions at at-001 3');
    process.exit(1);
  }

  generateGoalQuestions({
    program,
    goalId,
    count,
    difficulties: ['B', 'C', 'D'],
    saveToFile: true,
  })
    .then(() => {
      console.log('✅ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export { generateGoalQuestions };
