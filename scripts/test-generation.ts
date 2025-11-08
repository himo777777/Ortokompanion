/**
 * Test script: Generate 10 questions with real OpenAI API
 *
 * Run with: npx tsx scripts/test-generation.ts
 */

import { aiContentFactory } from '../lib/ai-content-factory';
import { logger } from '../lib/logger';
import type { ContentGenerationRequest } from '../lib/ai-content-factory';
import { logger } from '../lib/logger';
import type { Domain } from '../types/onboarding';
import { logger } from '../lib/logger';
import type { EducationLevel } from '../types/education';
import { logger } from '../lib/logger';
import type { DifficultyBand } from '../types/progression';
import { logger } from '../lib/logger';

// Test configuration - 5 questions with varied domains
const TEST_REQUESTS: ContentGenerationRequest[] = [
  // Trauma domain
  { type: 'question', domain: 'trauma', level: 'st3', band: 'C', topic: 'Öppna frakturer och Gustilo-Anderson' },

  // Höft domain
  { type: 'question', domain: 'höft', level: 'st3', band: 'C', topic: 'Femurhalsfrakturer hos äldre' },

  // Knä domain
  { type: 'question', domain: 'knä', level: 'st3', band: 'C', topic: 'ACL-ruptur diagnostik och behandling' },

  // Hand domain
  { type: 'question', domain: 'hand-handled', level: 'st2', band: 'B', topic: 'Scaphoid fraktur' },

  // Rygg domain
  { type: 'question', domain: 'rygg', level: 'st2', band: 'B', topic: 'Ländryggsmärta differentialdiagnos' },
];

interface TestResults {
  totalQuestions: number;
  successful: number;
  failed: number;
  autoPublishable: number; // >99% confidence
  needsReview: number; // 95-99% confidence
  rejected: number; // <95% confidence
  totalCost: number;
  totalTokens: number;
  totalDuration: number;
  averageConfidence: number;
  averageRounds: number;
  questions: Array<{
    domain: Domain;
    level: EducationLevel;
    confidence: number;
    sourceAccuracy: number;
    medicalAccuracy: number;
    pedagogicalQuality: number;
    technicalValidity: number;
    rounds: number;
    cost: number;
    tokens: number;
    duration: number;
    question: string;
    status: 'auto-publish' | 'review' | 'reject';
  }>;
}

async function runTest(): Promise<TestResults> {
  console.log('='.repeat(80));
  console.log('🧪 AI CONTENT GENERATION TEST');
  console.log('='.repeat(80));
  console.log(`\nGenerating ${TEST_REQUESTS.length} questions...`);
  console.log(`Budget: $${aiContentFactory.getStats().remainingBudget}\n`);

  const results: TestResults = {
    totalQuestions: TEST_REQUESTS.length,
    successful: 0,
    failed: 0,
    autoPublishable: 0,
    needsReview: 0,
    rejected: 0,
    totalCost: 0,
    totalTokens: 0,
    totalDuration: 0,
    averageConfidence: 0,
    averageRounds: 0,
    questions: [],
  };

  let questionNumber = 1;

  for (const request of TEST_REQUESTS) {
    console.log(`\n[${ questionNumber}/${TEST_REQUESTS.length}] Generating ${request.domain} question (${request.level}, Band ${request.band})...`);

    try {
      const startTime = Date.now();
      const result = await aiContentFactory.generateSingle(request);
      const duration = Date.now() - startTime;

      results.successful++;
      results.totalCost += result.generationMetadata.cost;
      results.totalTokens += result.generationMetadata.totalTokens;
      results.totalDuration += duration;

      // Determine status
      let status: 'auto-publish' | 'review' | 'reject';
      if (result.confidenceScore >= 0.99) {
        status = 'auto-publish';
        results.autoPublishable++;
      } else if (result.confidenceScore >= 0.95) {
        status = 'review';
        results.needsReview++;
      } else {
        status = 'reject';
        results.rejected++;
      }

      // Get final validation metrics
      const finalValidation = result.validationResults[result.validationResults.length - 1];

      results.questions.push({
        domain: request.domain,
        level: request.level,
        confidence: result.confidenceScore,
        sourceAccuracy: finalValidation.metrics.sourceAccuracy,
        medicalAccuracy: finalValidation.metrics.medicalAccuracy,
        pedagogicalQuality: finalValidation.metrics.pedagogicalQuality,
        technicalValidity: finalValidation.metrics.technicalValidity,
        rounds: result.generationRounds,
        cost: result.generationMetadata.cost,
        tokens: result.generationMetadata.totalTokens,
        duration,
        question: (result.content as any).question?.substring(0, 80) + '...' || 'N/A',
        status,
      });

      // Log result
      console.log(`   ✓ Overall Confidence: ${(result.confidenceScore * 100).toFixed(1)}%`);
      console.log(`      ├─ Source Accuracy: ${(finalValidation.metrics.sourceAccuracy * 100).toFixed(1)}% ${finalValidation.metrics.sourceAccuracy >= 0.99 ? '✅' : '❌'}`);
      console.log(`      ├─ Medical Accuracy: ${(finalValidation.metrics.medicalAccuracy * 100).toFixed(1)}% ${finalValidation.metrics.medicalAccuracy >= 0.99 ? '✅' : '❌'}`);
      console.log(`      ├─ Pedagogical Quality: ${(finalValidation.metrics.pedagogicalQuality * 100).toFixed(1)}% ${finalValidation.metrics.pedagogicalQuality >= 0.99 ? '✅' : '❌'}`);
      console.log(`      └─ Technical Validity: ${(finalValidation.metrics.technicalValidity * 100).toFixed(1)}% ${finalValidation.metrics.technicalValidity >= 0.99 ? '✅' : '❌'}`);
      console.log(`   ✓ Rounds: ${result.generationRounds}`);
      console.log(`   ✓ Cost: $${result.generationMetadata.cost.toFixed(4)}`);
      console.log(`   ✓ Tokens: ${result.generationMetadata.totalTokens}`);
      console.log(`   ✓ Duration: ${(duration / 1000).toFixed(1)}s`);
      console.log(`   ✓ Status: ${status === 'auto-publish' ? '🟢 AUTO-PUBLISH' : status === 'review' ? '🟡 NEEDS REVIEW' : '🔴 REJECT'}`);

      if ((result.content as any).question) {
        console.log(`   ✓ Question: "${(result.content as any).question.substring(0, 100)}..."`);
      }

    } catch (error) {
      results.failed++;
      console.log(`   ✗ FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    questionNumber++;
  }

  // Calculate averages
  if (results.successful > 0) {
    results.averageConfidence = results.questions.reduce((sum, q) => sum + q.confidence, 0) / results.successful;
    results.averageRounds = results.questions.reduce((sum, q) => sum + q.rounds, 0) / results.successful;
  }

  return results;
}

function printSummary(results: TestResults) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(80));

  console.log('\n📈 Generation Statistics:');
  console.log(`   Total Questions: ${results.totalQuestions}`);
  console.log(`   ✅ Successful: ${results.successful} (${((results.successful / results.totalQuestions) * 100).toFixed(0)}%)`);
  console.log(`   ❌ Failed: ${results.failed}`);

  console.log('\n🎯 Quality Distribution:');
  console.log(`   🟢 Auto-publish (≥99%): ${results.autoPublishable} (${((results.autoPublishable / results.successful) * 100).toFixed(0)}%)`);
  console.log(`   🟡 Needs review (95-99%): ${results.needsReview} (${((results.needsReview / results.successful) * 100).toFixed(0)}%)`);
  console.log(`   🔴 Reject (<95%): ${results.rejected} (${((results.rejected / results.successful) * 100).toFixed(0)}%)`);

  console.log('\n💰 Cost Analysis:');
  console.log(`   Total Cost: $${results.totalCost.toFixed(4)}`);
  console.log(`   Average Cost/Question: $${(results.totalCost / results.successful).toFixed(4)}`);
  console.log(`   Projected Cost/100 Questions: $${((results.totalCost / results.successful) * 100).toFixed(2)}`);
  console.log(`   Projected Cost/1000 Questions: $${((results.totalCost / results.successful) * 1000).toFixed(2)}`);

  console.log('\n⚡ Performance:');
  console.log(`   Total Tokens: ${results.totalTokens.toLocaleString()}`);
  console.log(`   Average Tokens/Question: ${Math.round(results.totalTokens / results.successful)}`);
  console.log(`   Average Rounds: ${results.averageRounds.toFixed(1)}`);
  console.log(`   Average Duration: ${(results.totalDuration / results.successful / 1000).toFixed(1)}s`);
  console.log(`   Total Duration: ${(results.totalDuration / 1000).toFixed(1)}s`);

  console.log('\n🎓 Quality Metrics:');
  console.log(`   Average Confidence: ${(results.averageConfidence * 100).toFixed(1)}%`);
  console.log(`   Min Confidence: ${(Math.min(...results.questions.map(q => q.confidence)) * 100).toFixed(1)}%`);
  console.log(`   Max Confidence: ${(Math.max(...results.questions.map(q => q.confidence)) * 100).toFixed(1)}%`);

  console.log('\n📋 Detailed Results:');
  console.log('   #  | Domain          | Level | Overall | Source | Medical | Pedagog | Technical | Rounds | Status');
  console.log('   ' + '-'.repeat(105));
  results.questions.forEach((q, i) => {
    const statusIcon = q.status === 'auto-publish' ? '🟢' : q.status === 'review' ? '🟡' : '🔴';
    console.log(
      `   ${(i + 1).toString().padStart(2)} | ${q.domain.padEnd(15)} | ${q.level.padEnd(5)} | ${(q.confidence * 100).toFixed(1).padStart(5)}% | ${(q.sourceAccuracy * 100).toFixed(1).padStart(5)}% | ${(q.medicalAccuracy * 100).toFixed(1).padStart(6)}% | ${(q.pedagogicalQuality * 100).toFixed(1).padStart(6)}% | ${(q.technicalValidity * 100).toFixed(1).padStart(8)}% | ${q.rounds}      | ${statusIcon} ${q.status}`
    );
  });

  console.log('\n' + '='.repeat(80));
  console.log('✅ Test Complete!');
  console.log('='.repeat(80) + '\n');
}

// Run test
runTest()
  .then(results => {
    printSummary(results);

    // Exit with appropriate code
    const successRate = results.successful / results.totalQuestions;
    if (successRate >= 0.9) {
      console.log('✅ Test PASSED: Success rate ≥90%\n');
      process.exit(0);
    } else {
      console.log('⚠️  Test WARNING: Success rate <90%\n');
      process.exit(1);
    }
  })
  .catch(error => {
    logger.error('\n❌ Test FAILED:', error);
    process.exit(1);
  });
