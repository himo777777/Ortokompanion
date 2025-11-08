#!/usr/bin/env tsx

/**
 * TutorMode Addition Script
 *
 * Adds TutorMode content to existing questions that don't have it.
 *
 * Usage:
 *   npm run add-tutormode -- --missing-only
 *   npm run add-tutormode -- --question=höft-045
 *   npm run add-tutormode -- --level=st2 --count=10
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ALL_QUESTIONS } from '@/data/questions';
import { EducationLevel } from '@/types/education';
import {
  generateTutorMode,
  generateTutorModeBatch,
  findQuestionsWithoutTutorMode,
  estimateTutorModeTime,
  generateTutorModeReport,
} from '@/lib/tutormode-generator';

// ============================================================================
// TYPES
// ============================================================================

interface CLIOptions {
  missingOnly?: boolean;
  question?: string;
  level?: EducationLevel;
  count?: number;
  output?: string;
  dryRun?: boolean;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  console.log('🎓 OrtoKompanion TutorMode Generator\n');

  // Parse CLI arguments
  const options = parseArguments();

  // Find questions without TutorMode
  const questionsWithoutTutorMode = findQuestionsWithoutTutorMode(ALL_QUESTIONS);
  console.log(`📊 Found ${questionsWithoutTutorMode.length} questions without TutorMode\n`);

  // Dry run - estimate only
  if (options.dryRun) {
    await runDryRun(questionsWithoutTutorMode);
    return;
  }

  // Single question mode
  if (options.question) {
    await runSingleQuestion(options.question);
    return;
  }

  // Filter by level if specified
  let targetQuestions = questionsWithoutTutorMode;
  if (options.level) {
    targetQuestions = targetQuestions.filter(q => q.level === options.level);
    console.log(`📍 Filtered to ${targetQuestions.length} questions at level ${options.level}\n`);
  }

  // Limit count if specified
  if (options.count) {
    targetQuestions = targetQuestions.slice(0, options.count);
    console.log(`🎯 Limited to ${targetQuestions.length} questions\n`);
  }

  // Missing only mode (default)
  if (options.missingOnly || !options.question) {
    await runBatchGeneration(targetQuestions, options.output);
    return;
  }

  // No valid options - show usage
  showUsage();
}

// ============================================================================
// GENERATION MODES
// ============================================================================

/**
 * Run dry run - estimate only
 */
async function runDryRun(questions: any[]) {
  console.log('💰 DRY RUN - Time & Cost Estimation\n');

  const estimate = estimateTutorModeTime(questions.length);

  console.log(`Questions to process: ${questions.length}`);
  console.log(`AI generation time: ${Math.floor(estimate.aiGenerationTime / 60)}m ${estimate.aiGenerationTime % 60}s`);
  console.log(`Total time (with rate limiting): ${Math.floor(estimate.totalTimeWithRateLimit / 60)}m ${estimate.totalTimeWithRateLimit % 60}s`);
  console.log(`Estimated cost: $${estimate.estimatedCost.toFixed(4)}\n`);

  console.log('📝 No TutorMode generated (dry run mode)');
}

/**
 * Generate TutorMode for single question
 */
async function runSingleQuestion(questionId: string) {
  console.log(`🎯 Generating TutorMode for: ${questionId}\n`);

  const question = ALL_QUESTIONS.find(q => q.id === questionId);
  if (!question) {
    logger.error(`❌ Question not found: ${questionId}`);
    process.exit(1);
  }

  if (question.tutorMode) {
    console.log(`⚠️  Question already has TutorMode`);
    console.log(`   Hints: ${question.tutorMode.hints.length}`);
    console.log(`   Common mistakes: ${question.tutorMode.commonMistakes?.length || 0}`);
    console.log(`   Teaching points: ${question.tutorMode.teachingPoints?.length || 0}`);
    console.log(`\n❓ Generate anyway? (This will replace existing TutorMode)`);
    // In CLI, we'll proceed anyway
  }

  try {
    const tutorMode = await generateTutorMode(question);

    console.log(`\n✅ TutorMode generated successfully!\n`);
    console.log('Preview:');
    console.log('─'.repeat(60));
    console.log('\n📝 Hints:');
    tutorMode.hints.forEach((hint, i) => {
      console.log(`  ${i + 1}. ${hint}`);
    });
    if (tutorMode.commonMistakes) {
      console.log('\n⚠️  Common Mistakes:');
      tutorMode.commonMistakes.forEach((mistake, i) => {
        console.log(`  ${i + 1}. ${mistake}`);
      });
    }
    if (tutorMode.teachingPoints) {
      console.log('\n💡 Teaching Points:');
      tutorMode.teachingPoints.forEach((point, i) => {
        console.log(`  ${i + 1}. ${point}`);
      });
    }
    if (tutorMode.mnemonicOrTrick) {
      console.log(`\n🧠 Mnemonic: ${tutorMode.mnemonicOrTrick}`);
    }
    console.log('─'.repeat(60));

    // Save to output file
    const output = {
      questionId: question.id,
      tutorMode,
      generatedAt: new Date().toISOString(),
    };

    const outputPath = 'generated/tutormode-single.json';
    await saveToFile(outputPath, output);

    console.log(`\n💾 Saved to ${outputPath}`);
    console.log('\n📋 Next: Review and manually integrate into questions.ts');

  } catch (error) {
    logger.error(`\n❌ Failed to generate TutorMode:`, error);
    process.exit(1);
  }
}

/**
 * Generate TutorMode for batch of questions
 */
async function runBatchGeneration(questions: any[], outputPath?: string) {
  if (questions.length === 0) {
    console.log('✅ All questions already have TutorMode!');
    return;
  }

  console.log(`🚀 Generating TutorMode for ${questions.length} questions\n`);

  // Estimate time
  const estimate = estimateTutorModeTime(questions.length);
  console.log(`⏱️  Estimated time: ${Math.floor(estimate.totalTimeWithRateLimit / 60)}m ${estimate.totalTimeWithRateLimit % 60}s`);
  console.log(`💰 Estimated cost: $${estimate.estimatedCost.toFixed(4)}\n`);
  console.log(`Starting in 3 seconds...\n`);

  await new Promise(resolve => setTimeout(resolve, 3000));

  // Generate TutorMode for all questions
  const results = await generateTutorModeBatch(questions);

  // Generate report
  const report = generateTutorModeReport(results);

  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 GENERATION REPORT');
  console.log('='.repeat(60));
  console.log(`Total questions: ${report.totalQuestions}`);
  console.log(`✅ Success: ${report.successCount}`);
  console.log(`❌ Failed: ${report.failureCount}`);
  console.log(`\nQuality breakdown:`);
  console.log(`  Perfect: ${report.qualityReport.perfectCount}`);
  console.log(`  Has warnings: ${report.qualityReport.hasWarningsCount}`);
  console.log(`  Has errors: ${report.qualityReport.hasErrorsCount}`);

  if (report.failedQuestions.length > 0) {
    console.log(`\n❌ Failed questions:`);
    report.failedQuestions.forEach(id => console.log(`  - ${id}`));
  }

  // Save results
  const output = {
    metadata: {
      totalQuestions: report.totalQuestions,
      successCount: report.successCount,
      failureCount: report.failureCount,
      qualityReport: report.qualityReport,
      generatedAt: new Date().toISOString(),
    },
    results,
  };

  const filePath = outputPath || 'generated/tutormode-additions.json';
  await saveToFile(filePath, output);

  console.log(`\n💾 Saved to ${filePath}`);

  // Save validation report
  const validationPath = filePath.replace('.json', '-validation.json');
  await saveToFile(validationPath, report);

  console.log(`📋 Validation report: ${validationPath}`);
  console.log(`\n✅ Generation complete!`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Review generated TutorMode in ${filePath}`);
  console.log(`   2. Manually integrate approved content into data/questions.ts`);
  console.log(`   3. Run validation: npm run validate-all`);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Save data to JSON file
 */
async function saveToFile(filePath: string, data: any) {
  // Ensure directory exists
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  // Write file
  await fs.writeFile(
    filePath,
    JSON.stringify(data, null, 2),
    'utf-8'
  );
}

/**
 * Parse command line arguments
 */
function parseArguments(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};

  for (const arg of args) {
    if (arg === '--missing-only') {
      options.missingOnly = true;
      continue;
    }
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    const [key, value] = arg.split('=');
    const cleanKey = key.replace(/^--/, '');

    switch (cleanKey) {
      case 'question':
        options.question = value;
        break;
      case 'level':
        options.level = value as EducationLevel;
        break;
      case 'count':
        options.count = parseInt(value, 10);
        break;
      case 'output':
        options.output = value;
        break;
    }
  }

  return options;
}

/**
 * Show usage information
 */
function showUsage() {
  const questionsWithoutTutorMode = findQuestionsWithoutTutorMode(ALL_QUESTIONS);
  const estimate = estimateTutorModeTime(questionsWithoutTutorMode.length);

  console.log(`
Usage:
  npm run add-tutormode -- [options]

Options:
  --missing-only          Generate for all questions without TutorMode [default]
  --question=<id>         Generate for specific question
  --level=<level>         Filter by education level
  --count=<number>        Limit number of questions to process
  --output=<path>         Output file path [default: generated/tutormode-additions.json]
  --dry-run               Estimate time/cost only, don't generate

Examples:
  # Generate for all missing TutorMode
  npm run add-tutormode -- --missing-only

  # Generate for specific question
  npm run add-tutormode -- --question=höft-045

  # Generate for 10 ST2 questions
  npm run add-tutormode -- --level=st2 --count=10

  # Dry run to estimate
  npm run add-tutormode -- --dry-run

Current status:
  Questions without TutorMode: ${questionsWithoutTutorMode.length}
  Estimated time: ${Math.floor(estimate.totalTimeWithRateLimit / 60)}m ${estimate.totalTimeWithRateLimit % 60}s
  Estimated cost: $${estimate.estimatedCost.toFixed(4)}
  `);
}

// ============================================================================
// RUN
// ============================================================================

main().catch(error => {
  logger.error('\n❌ Fatal error:', error);
  process.exit(1);
});
