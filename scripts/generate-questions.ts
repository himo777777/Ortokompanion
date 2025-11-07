#!/usr/bin/env tsx

/**
 * Question Generation Script
 *
 * CLI tool to generate medical questions using AI.
 *
 * Usage:
 *   npm run generate-questions -- --domain=sport --level=st2 --band=B --count=10
 *   npm run generate-questions -- --batch=st5-hoeft
 *   npm run generate-questions -- --config=batch-config.json
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { EducationLevel } from '@/types/education';
import { Domain } from '@/types/onboarding';
import { DifficultyBand } from '@/types/progression';
import { SourceReference } from '@/types/verification';
import { VERIFIED_SOURCES } from '@/data/verified-sources';
import { getMålForLevel, getMålForSubspecialty, getMålForDomain } from '@/data/socialstyrelsen-goals';
import {
  generateQuestionBatch,
  generateWithBandDistribution,
  validateQuestionBatch,
  estimateGenerationCost,
} from '@/lib/ai-question-generator';
import { GENERATION_BATCHES } from '@/lib/generation-prompts';

// ============================================================================
// TYPES
// ============================================================================

interface CLIOptions {
  domain?: Domain;
  level?: EducationLevel;
  band?: DifficultyBand;
  count?: number;
  startId?: number;
  batch?: string;
  config?: string;
  output?: string;
  dryRun?: boolean;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  console.log('🚀 OrtoKompanion Question Generator\n');

  // Parse CLI arguments
  const options = parseArguments();

  // Dry run - just estimate cost
  if (options.dryRun) {
    await runDryRun(options);
    return;
  }

  // Batch generation using predefined config
  if (options.batch) {
    await runBatchGeneration(options.batch);
    return;
  }

  // Config file generation
  if (options.config) {
    await runConfigGeneration(options.config);
    return;
  }

  // Single batch generation
  if (options.domain && options.level) {
    await runSingleGeneration(options);
    return;
  }

  // No valid options - show usage
  showUsage();
}

// ============================================================================
// GENERATION MODES
// ============================================================================

/**
 * Run dry run - estimate cost only
 */
async function runDryRun(options: CLIOptions) {
  console.log('💰 DRY RUN - Cost Estimation\n');

  const count = options.count || 10;
  const estimate = estimateGenerationCost({ count });

  console.log(estimate.breakdown);
  console.log('\n📝 No questions generated (dry run mode)');
}

/**
 * Run single generation
 */
async function runSingleGeneration(options: CLIOptions) {
  const {
    domain,
    level,
    band,
    count = 10,
    startId = 1,
    output,
  } = options;

  if (!domain || !level) {
    console.error('❌ Error: --domain and --level are required');
    process.exit(1);
  }

  console.log(`📊 Generating ${count} questions:`);
  console.log(`   Domain: ${domain}`);
  console.log(`   Level: ${level}`);
  console.log(`   Band: ${band || 'mixed'}`);
  console.log(`   Start ID: ${startId}\n`);

  // Get relevant sources
  const sources = filterSourcesByDomain(domain);
  console.log(`✅ Found ${sources.length} relevant sources\n`);

  // Get domain-specific goals (combines level + domain filtering)
  const goals = getMålForDomain(domain, level);
  console.log(`✅ Found ${goals.length} relevant goals for ${domain} @ ${level}\n`);

  // Generate
  let result;
  if (band) {
    result = await generateQuestionBatch({
      domain,
      level,
      band,
      count,
      sources,
      goals,
      startId,
    });
  } else {
    // Generate with band distribution
    result = await generateWithBandDistribution({
      domain,
      level,
      bandDistribution: {
        'A': Math.floor(count * 0.25),
        'B': Math.floor(count * 0.30),
        'C': Math.floor(count * 0.25),
        'D': Math.floor(count * 0.15),
        'E': Math.ceil(count * 0.05),
      },
      sources,
      goals,
      startId,
    });
  }

  // Validate
  const validation = validateQuestionBatch(result.questions);
  console.log(`\n📋 Validation Results:`);
  console.log(`   Valid: ${validation.validCount}`);
  console.log(`   Invalid: ${validation.invalidCount}`);

  if (validation.invalidCount > 0) {
    console.log('\n❌ Invalid questions found:');
    validation.results
      .filter(r => !r.valid)
      .forEach(r => {
        console.log(`   - ${r.questionId}: ${r.errors.join(', ')}`);
      });
  }

  // Save to file
  const outputPath = output || `generated/${domain}-${level}-questions.json`;
  await saveGeneratedQuestions(result.questions, outputPath, result.metadata);

  console.log(`\n✅ Saved ${result.questions.length} questions to ${outputPath}`);
}

/**
 * Run batch generation using predefined config
 */
async function runBatchGeneration(batchName: string) {
  const batch = GENERATION_BATCHES.find(b =>
    b.outputFile.replace('.json', '') === batchName
  );

  if (!batch) {
    console.error(`❌ Batch not found: ${batchName}`);
    console.log('\nAvailable batches:');
    GENERATION_BATCHES.forEach(b => {
      console.log(`  - ${b.outputFile.replace('.json', '')} (${b.domain}, ${b.level}, ${b.totalCount} questions)`);
    });
    process.exit(1);
  }

  console.log(`📦 Running batch: ${batchName}\n`);
  console.log(`   Domain: ${batch.domain}`);
  console.log(`   Level: ${batch.level}`);
  console.log(`   Total: ${batch.totalCount} questions`);
  console.log(`   Distribution:`, batch.bandDistribution);
  console.log();

  // Get sources and goals
  const sources = filterSourcesByDomain(batch.domain);
  const goals = getMålForDomain(batch.domain, batch.level);

  // Generate
  const result = await generateWithBandDistribution({
    domain: batch.domain,
    level: batch.level,
    bandDistribution: batch.bandDistribution,
    sources,
    goals,
    startId: batch.startId,
  });

  // Validate
  const validation = validateQuestionBatch(result.questions);
  console.log(`\n📋 Validation: ${validation.validCount} valid, ${validation.invalidCount} invalid`);

  // Save
  const outputPath = `generated/${batch.outputFile}`;
  await saveGeneratedQuestions(result.questions, outputPath, result.metadata);

  console.log(`✅ Saved to ${outputPath}`);
}

/**
 * Run generation from config file
 */
async function runConfigGeneration(configPath: string) {
  console.log(`📄 Loading config: ${configPath}\n`);

  // Load config
  const configContent = await fs.readFile(configPath, 'utf-8');
  const config = JSON.parse(configContent);

  // Validate config
  if (!config.batches || !Array.isArray(config.batches)) {
    console.error('❌ Invalid config: must have "batches" array');
    process.exit(1);
  }

  console.log(`Found ${config.batches.length} batches to generate\n`);

  // Generate each batch
  for (const batch of config.batches) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Generating batch: ${batch.name || 'Unnamed'}`);
    console.log('='.repeat(60));

    const sources = filterSourcesByDomain(batch.domain);
    const goals = getMålForDomain(batch.domain, batch.level);

    const result = await generateWithBandDistribution({
      domain: batch.domain,
      level: batch.level,
      bandDistribution: batch.bandDistribution,
      sources,
      goals,
      startId: batch.startId || 1,
    });

    // Save
    const outputPath = batch.output || `generated/${batch.domain}-${batch.level}.json`;
    await saveGeneratedQuestions(result.questions, outputPath, result.metadata);

    console.log(`✅ Saved ${result.questions.length} questions to ${outputPath}`);

    // Wait between batches
    if (config.batches.indexOf(batch) < config.batches.length - 1) {
      console.log('\n⏳ Waiting 5 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log(`\n🎉 All batches complete!`);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Filter sources by domain
 */
function filterSourcesByDomain(domain: Domain): SourceReference[] {
  // Domain-specific source mapping
  const domainSources: Record<Domain, string[]> = {
    'trauma': ['atls-sverige-2022', 'boast-open-fractures-2020', 'rikskna-2024', 'campbell-13ed'],
    'höft': ['rikshoft-2024', 'nice-hip-fracture-2023', 'campbell-13ed', 'paprosky-1994'],
    'fot-fotled': ['campbell-13ed', 'green-8ed', 'weber-1972'],
    'hand-handled': ['green-8ed', 'campbell-13ed'],
    'knä': ['rikskna-2024', 'campbell-13ed', 'ottawa-knee-rules-1997'],
    'axel-armbåge': ['campbell-13ed', 'rockwood-9ed', 'gartland-1959'],
    'rygg': ['campbell-13ed', 'nice-hip-fracture-2023'],
    'sport': ['campbell-13ed', 'rikskna-2024'],
    'tumör': ['campbell-13ed'],
  };

  const relevantSourceIds = domainSources[domain] || [];
  const allSources = Object.values(VERIFIED_SOURCES).flat();

  const filtered = allSources.filter(s => relevantSourceIds.includes(s.id));

  // If no specific sources, return general orthopedic sources
  if (filtered.length === 0) {
    return allSources.filter(s =>
      s.id === 'campbell-13ed' ||
      s.id === 'rockwood-9ed' ||
      s.id === 'green-8ed'
    );
  }

  return filtered;
}

/**
 * Save generated questions to file
 */
async function saveGeneratedQuestions(
  questions: any[],
  outputPath: string,
  metadata: any
) {
  const output = {
    metadata: {
      ...metadata,
      generatedAt: new Date().toISOString(),
      generator: 'OrtoKompanion AI Question Generator v1.0',
    },
    questions,
    status: 'pending-review',
    reviewedBy: null,
    approvedAt: null,
  };

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  await fs.mkdir(dir, { recursive: true });

  // Write file
  await fs.writeFile(
    outputPath,
    JSON.stringify(output, null, 2),
    'utf-8'
  );

  // Also create validation report
  const validationPath = outputPath.replace('.json', '-validation.json');
  const validation = validateQuestionBatch(questions);

  await fs.writeFile(
    validationPath,
    JSON.stringify(validation, null, 2),
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
    const [key, value] = arg.split('=');
    const cleanKey = key.replace(/^--/, '');

    switch (cleanKey) {
      case 'domain':
        options.domain = value as Domain;
        break;
      case 'level':
        options.level = value as EducationLevel;
        break;
      case 'band':
        options.band = value as DifficultyBand;
        break;
      case 'count':
        options.count = parseInt(value, 10);
        break;
      case 'startId':
        options.startId = parseInt(value, 10);
        break;
      case 'batch':
        options.batch = value;
        break;
      case 'config':
        options.config = value;
        break;
      case 'output':
        options.output = value;
        break;
      case 'dry-run':
        options.dryRun = true;
        break;
    }
  }

  return options;
}

/**
 * Show usage information
 */
function showUsage() {
  console.log(`
Usage:
  npm run generate-questions -- [options]

Options:
  --domain=<domain>       Domain (trauma, höft, fot-fotled, etc.)
  --level=<level>         Education level (student, at, st1-st5, etc.)
  --band=<band>           Difficulty band (A, B, C, D, E) [optional]
  --count=<number>        Number of questions to generate [default: 10]
  --startId=<number>      Starting ID number [default: 1]
  --output=<path>         Output file path [default: generated/<domain>-<level>.json]
  --batch=<name>          Use predefined batch config
  --config=<path>         Use config file for multiple batches
  --dry-run               Estimate cost only, don't generate

Examples:
  # Generate 10 sport questions for ST2, Band B
  npm run generate-questions -- --domain=sport --level=st2 --band=B --count=10

  # Generate mixed band distribution for ST5 höft
  npm run generate-questions -- --domain=höft --level=st5 --count=20

  # Use predefined batch config
  npm run generate-questions -- --batch=st5-hoeft

  # Dry run to estimate cost
  npm run generate-questions -- --domain=tumör --level=st3 --count=30 --dry-run

Available batches:
${GENERATION_BATCHES.map(b => `  - ${b.outputFile.replace('.json', '')} (${b.domain}, ${b.level}, ${b.totalCount}q)`).join('\n')}
  `);
}

// ============================================================================
// RUN
// ============================================================================

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
