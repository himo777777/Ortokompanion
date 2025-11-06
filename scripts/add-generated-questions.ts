/**
 * Script: Add AI-generated questions to question bank
 *
 * Generates questions using AI and automatically adds approved ones (≥99% on all metrics)
 * to the appropriate domain in data/questions.ts
 *
 * Run with: npx tsx scripts/add-generated-questions.ts <count>
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { aiContentFactory } from '../lib/ai-content-factory';
import type { ContentGenerationRequest } from '../lib/ai-content-factory';
import type { Domain } from '../types/onboarding';
import type { EducationLevel } from '../types/education';
import type { DifficultyBand } from '../types/progression';
import type { MCQQuestion } from '../data/questions';

// Domain to array name mapping
const DOMAIN_TO_ARRAY: Record<Domain, string> = {
  'trauma': 'TRAUMA_QUESTIONS',
  'höft': 'HOEFT_QUESTIONS',
  'fot-fotled': 'FOT_FOTLED_QUESTIONS',
  'hand-handled': 'HAND_HANDLED_QUESTIONS',
  'knä': 'KNA_QUESTIONS',
  'axel-armbåge': 'AXEL_ARMBAGE_QUESTIONS',
  'rygg': 'RYGG_QUESTIONS',
  'sport': 'SPORT_QUESTIONS',
  'tumör': 'TUMOR_QUESTIONS',
};

interface GenerationConfig {
  domain: Domain;
  level: EducationLevel;
  band: DifficultyBand;
  topic: string;
  count: number; // How many attempts to generate for this topic
}

// Default generation configurations
const DEFAULT_CONFIGS: GenerationConfig[] = [
  { domain: 'trauma', level: 'st3', band: 'C', topic: 'Öppna frakturer och Gustilo-Anderson klassifikation', count: 1 },
  { domain: 'trauma', level: 'st2', band: 'B', topic: 'Femurfrakturer och stabilisering', count: 1 },
  { domain: 'höft', level: 'st3', band: 'C', topic: 'Femurhalsfrakturer hos äldre', count: 1 },
  { domain: 'höft', level: 'st2', band: 'B', topic: 'Höftledsartros och behandling', count: 1 },
  { domain: 'knä', level: 'st3', band: 'C', topic: 'ACL-ruptur diagnostik och behandling', count: 1 },
  { domain: 'knä', level: 'st2', band: 'B', topic: 'Meniskskador och behandling', count: 1 },
  { domain: 'hand-handled', level: 'st2', band: 'B', topic: 'Scaphoid fraktur', count: 1 },
  { domain: 'hand-handled', level: 'st3', band: 'C', topic: 'Handled frakturer och klassifikation', count: 1 },
  { domain: 'rygg', level: 'st2', band: 'B', topic: 'Ländryggsmärta differentialdiagnos', count: 1 },
  { domain: 'rygg', level: 'st3', band: 'C', topic: 'Spinala frakturer och stabilitet', count: 1 },
];

async function generateAndFilterQuestions(configs: GenerationConfig[]): Promise<Map<Domain, MCQQuestion[]>> {
  const approvedQuestions = new Map<Domain, MCQQuestion[]>();

  console.log('='.repeat(80));
  console.log('🤖 AI QUESTION GENERATION - AUTO-ADD TO QUESTION BANK');
  console.log('='.repeat(80));
  console.log(`\nGenerating questions for ${configs.length} topics...`);
  console.log(`Approval threshold: ≥99% on ALL 4 metrics\n`);

  let totalGenerated = 0;
  let totalApproved = 0;

  for (const config of configs) {
    console.log(`\n📝 Generating ${config.count} question(s) for ${config.domain} (${config.level}, Band ${config.band})`);
    console.log(`   Topic: ${config.topic}`);

    for (let i = 0; i < config.count; i++) {
      try {
        const request: ContentGenerationRequest = {
          type: 'question',
          domain: config.domain,
          level: config.level,
          band: config.band,
          topic: config.topic,
        };

        const result = await aiContentFactory.generateSingle(request);
        totalGenerated++;

        // Get final validation metrics
        const finalValidation = result.validationResults[result.validationResults.length - 1];
        const metrics = finalValidation.metrics;

        // Check if ALL 4 metrics are ≥99%
        const allMetricsPass =
          metrics.sourceAccuracy >= 0.99 &&
          metrics.medicalAccuracy >= 0.99 &&
          metrics.pedagogicalQuality >= 0.99 &&
          metrics.technicalValidity >= 0.99;

        console.log(`\n   Attempt ${i + 1}/${config.count}:`);
        console.log(`      Overall: ${(result.confidenceScore * 100).toFixed(1)}%`);
        console.log(`      Source: ${(metrics.sourceAccuracy * 100).toFixed(1)}% ${metrics.sourceAccuracy >= 0.99 ? '✅' : '❌'}`);
        console.log(`      Medical: ${(metrics.medicalAccuracy * 100).toFixed(1)}% ${metrics.medicalAccuracy >= 0.99 ? '✅' : '❌'}`);
        console.log(`      Pedagogical: ${(metrics.pedagogicalQuality * 100).toFixed(1)}% ${metrics.pedagogicalQuality >= 0.99 ? '✅' : '❌'}`);
        console.log(`      Technical: ${(metrics.technicalValidity * 100).toFixed(1)}% ${metrics.technicalValidity >= 0.99 ? '✅' : '❌'}`);
        console.log(`      Rounds: ${result.generationRounds}, Cost: $${result.generationMetadata.cost.toFixed(4)}`);

        if (allMetricsPass) {
          console.log(`      ✅ APPROVED - Adding to ${config.domain} question bank`);
          totalApproved++;

          // Convert to MCQQuestion format
          const content = result.content as any;
          const question: MCQQuestion = {
            id: content.id,
            domain: config.domain,
            level: config.level,
            band: config.band,
            question: content.question,
            options: content.options,
            correctAnswer: content.correctAnswer,
            explanation: content.explanation,
            references: content.references,
            tags: content.tags,
            competency: content.competency,
            relatedGoals: content.relatedGoals,
            contentVersion: content.contentVersion,
            lastContentUpdate: new Date(content.lastContentUpdate),
            needsReview: content.needsReview,
          };

          // Add to approved questions map
          if (!approvedQuestions.has(config.domain)) {
            approvedQuestions.set(config.domain, []);
          }
          approvedQuestions.get(config.domain)!.push(question);

        } else {
          console.log(`      ❌ REJECTED - Did not meet 99% threshold on all metrics`);
        }

      } catch (error) {
        console.log(`      ❌ FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total generated: ${totalGenerated}`);
  console.log(`Total approved: ${totalApproved} (${((totalApproved / totalGenerated) * 100).toFixed(1)}%)`);
  console.log(`Total rejected: ${totalGenerated - totalApproved} (${(((totalGenerated - totalApproved) / totalGenerated) * 100).toFixed(1)}%)`);

  return approvedQuestions;
}

function addQuestionsToFile(approvedQuestions: Map<Domain, MCQQuestion[]>, filePath: string) {
  console.log('\n' + '='.repeat(80));
  console.log('📝 ADDING QUESTIONS TO QUESTION BANK');
  console.log('='.repeat(80));

  // Read the current file
  let fileContent = readFileSync(filePath, 'utf-8');

  for (const [domain, questions] of approvedQuestions.entries()) {
    const arrayName = DOMAIN_TO_ARRAY[domain];
    console.log(`\n✏️  Adding ${questions.length} question(s) to ${arrayName}...`);

    for (const question of questions) {
      // Format the question as TypeScript code
      const questionCode = formatQuestionAsCode(question);

      // Find the array in the file
      const arrayRegex = new RegExp(`export const ${arrayName}: MCQQuestion\\[\\] = \\[`, 'g');
      const match = arrayRegex.exec(fileContent);

      if (!match) {
        console.log(`   ❌ Could not find ${arrayName} in file`);
        continue;
      }

      // Find the closing bracket of this array (next line after array declaration that starts with ];)
      const startIndex = match.index + match[0].length;
      let searchIndex = startIndex;
      let bracketCount = 1;
      let insertIndex = -1;

      // Find matching closing bracket
      while (searchIndex < fileContent.length && bracketCount > 0) {
        const char = fileContent[searchIndex];
        if (char === '[' || char === '{') bracketCount++;
        if (char === ']' || char === '}') bracketCount--;

        // When we find the closing bracket of the array
        if (bracketCount === 0 && char === ']') {
          insertIndex = searchIndex;
          break;
        }
        searchIndex++;
      }

      if (insertIndex === -1) {
        console.log(`   ❌ Could not find closing bracket for ${arrayName}`);
        continue;
      }

      // Check if there are existing questions (array is not empty)
      const beforeInsert = fileContent.substring(startIndex, insertIndex).trim();

      // Check if we need a comma - only if there's content and it doesn't already end with a comma
      const hasContent = beforeInsert.length > 0;
      const endsWithComma = beforeInsert.endsWith(',');
      const needsComma = hasContent && !endsWithComma;

      // Insert the question before the closing bracket
      const prefix = needsComma ? ',\n  ' : hasContent ? '\n  ' : '\n  ';
      fileContent =
        fileContent.substring(0, insertIndex) +
        prefix + questionCode + '\n' +
        fileContent.substring(insertIndex);

      console.log(`   ✅ Added question "${question.question.substring(0, 60)}..."`);
    }
  }

  // Write the updated file
  writeFileSync(filePath, fileContent, 'utf-8');
  console.log('\n✅ Successfully updated question bank file!');
}

function formatQuestionAsCode(question: MCQQuestion): string {
  const lines: string[] = ['{'];

  // Basic fields
  lines.push(`    id: '${question.id}',`);
  lines.push(`    domain: '${question.domain}',`);
  lines.push(`    level: '${question.level}',`);
  lines.push(`    band: '${question.band}',`);
  lines.push(`    question: '${escapeString(question.question)}',`);

  // Options array
  lines.push(`    options: [`);
  question.options.forEach((opt, i) => {
    const comma = i < question.options.length - 1 ? ',' : '';
    lines.push(`      '${escapeString(opt)}'${comma}`);
  });
  lines.push(`    ],`);

  lines.push(`    correctAnswer: '${escapeString(question.correctAnswer)}',`);
  lines.push(`    explanation: '${escapeString(question.explanation)}',`);
  lines.push(`    competency: '${question.competency}',`);

  // Tags array
  lines.push(`    tags: [${question.tags.map(t => `'${t}'`).join(', ')}],`);

  // Optional arrays
  if (question.references && question.references.length > 0) {
    lines.push(`    references: [${question.references.map(r => `'${r}'`).join(', ')}],`);
  }

  if (question.relatedGoals && question.relatedGoals.length > 0) {
    lines.push(`    relatedGoals: [${question.relatedGoals.map(g => `'${g}'`).join(', ')}],`);
  }

  // Content versioning
  if (question.contentVersion) {
    lines.push(`    contentVersion: '${question.contentVersion}',`);
  }

  if (question.lastContentUpdate) {
    lines.push(`    lastContentUpdate: new Date('${question.lastContentUpdate.toISOString()}'),`);
  }

  if (question.needsReview !== undefined) {
    lines.push(`    needsReview: ${question.needsReview},`);
  }

  lines.push('  }');

  return lines.join('\n  ');
}

function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const requestedCount = args[0] ? parseInt(args[0]) : 10;

  console.log(`Requested: ${requestedCount} questions total\n`);

  // Use default configs but limit total attempts
  const configs = DEFAULT_CONFIGS.slice(0, requestedCount);

  const approvedQuestions = await generateAndFilterQuestions(configs);

  if (approvedQuestions.size === 0) {
    console.log('\n⚠️  No questions were approved. Try generating more questions or adjusting quality thresholds.\n');
    process.exit(0);
  }

  const questionsFilePath = join(process.cwd(), 'data', 'questions.ts');
  addQuestionsToFile(approvedQuestions, questionsFilePath);

  console.log('\n' + '='.repeat(80));
  console.log('✅ DONE!');
  console.log('='.repeat(80));
  console.log('\nApproved questions have been added to the question bank.');
  console.log('Restart your dev server to see the changes.\n');

  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
