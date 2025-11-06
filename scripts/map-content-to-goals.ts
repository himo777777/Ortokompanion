/**
 * Automatic Content-to-Goals Mapping Script
 * Maps all existing questions and content to Socialstyrelsen goals using semantic search
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  generateAllGoalEmbeddings,
  mapQuestionToGoals,
  mapClinicalPearlToGoals,
  type ContentGoalMapping,
  type GoalEmbedding,
} from '../lib/goal-taxonomy';

// Import questions and pearls
const questionsPath = path.join(process.cwd(), 'data', 'questions.ts');
const pearlsPath = path.join(process.cwd(), 'data', 'clinical-pearls.ts');

interface MappingReport {
  totalContent: number;
  mappedContent: number;
  unmappedContent: number;
  averageConfidence: number;
  mappingsByGoal: Record<
    string,
    { goalTitle: string; count: number; averageConfidence: number }
  >;
  lowConfidenceMappings: Array<{
    contentId: string;
    contentType: string;
    confidence: number;
  }>;
}

/**
 * Extract questions from questions.ts file
 */
function extractQuestions(content: string): Array<{
  id: string;
  question: string;
  correctAnswer: string;
  explanation: string;
  domain: string;
}> {
  const questions: Array<{
    id: string;
    question: string;
    correctAnswer: string;
    explanation: string;
    domain: string;
  }> = [];

  // Parse questions using regex (simplified)
  const questionBlocks = content.split(/export const \w+_QUESTIONS/);

  questionBlocks.forEach((block) => {
    // Extract question objects
    const idMatches = block.matchAll(/id:\s*['"]([^'"]+)['"]/g);
    const questionMatches = block.matchAll(/question:\s*['"]([^'"]+)['"]/g);
    const explanationMatches = block.matchAll(/explanation:\s*['"]([^'"]+)['"]/g);

    const ids = Array.from(idMatches).map((m) => m[1]);
    const questionTexts = Array.from(questionMatches).map((m) => m[1]);
    const explanations = Array.from(explanationMatches).map((m) => m[1]);

    // Domain from block name
    const domainMatch = block.match(/TRAUMA|HOEFT|FOT|HAND|KNA|AXEL|RYGG/);
    const domain = domainMatch ? domainMatch[0] : 'UNKNOWN';

    for (let i = 0; i < Math.min(ids.length, questionTexts.length); i++) {
      questions.push({
        id: ids[i],
        question: questionTexts[i],
        correctAnswer: 'A', // Placeholder
        explanation: explanations[i] || '',
        domain,
      });
    }
  });

  return questions;
}

/**
 * Extract clinical pearls from clinical-pearls.ts file
 */
function extractClinicalPearls(content: string): Array<{
  id: string;
  pearl: string;
  category: string;
}> {
  const pearls: Array<{ id: string; pearl: string; category: string }> = [];

  // Parse pearls using regex (simplified)
  const pearlBlocks = content.split(/export const \w+_CLINICAL_PEARLS/);

  pearlBlocks.forEach((block) => {
    const idMatches = block.matchAll(/id:\s*['"]([^'"]+)['"]/g);
    const pearlMatches = block.matchAll(/pearl:\s*['"]([^'"]+)['"]/g);
    const categoryMatches = block.matchAll(/category:\s*['"]([^'"]+)['"]/g);

    const ids = Array.from(idMatches).map((m) => m[1]);
    const pearlTexts = Array.from(pearlMatches).map((m) => m[1]);
    const categories = Array.from(categoryMatches).map((m) => m[1]);

    for (let i = 0; i < Math.min(ids.length, pearlTexts.length); i++) {
      pearls.push({
        id: ids[i],
        pearl: pearlTexts[i],
        category: categories[i] || 'General',
      });
    }
  });

  return pearls;
}

/**
 * Main mapping function
 */
async function mapAllContentToGoals() {
  console.log('🎯 Starting automatic content-to-goals mapping...\n');

  // Step 1: Generate goal embeddings
  console.log('📊 Step 1/4: Generating goal embeddings...');
  const goalEmbeddings: GoalEmbedding[] = await generateAllGoalEmbeddings();
  console.log(`✅ Generated embeddings for ${goalEmbeddings.length} goals\n`);

  // Step 2: Extract questions
  console.log('📚 Step 2/4: Extracting questions...');
  const questionsContent = fs.readFileSync(questionsPath, 'utf-8');
  const questions = extractQuestions(questionsContent);
  console.log(`✅ Extracted ${questions.length} questions\n`);

  // Step 3: Extract clinical pearls
  console.log('💎 Step 3/4: Extracting clinical pearls...');
  let pearls: Array<{ id: string; pearl: string; category: string }> = [];
  try {
    const pearlsContent = fs.readFileSync(pearlsPath, 'utf-8');
    pearls = extractClinicalPearls(pearlsContent);
    console.log(`✅ Extracted ${pearls.length} clinical pearls\n`);
  } catch (error) {
    console.log('⚠️  No clinical pearls file found, skipping...\n');
  }

  // Step 4: Map content to goals
  console.log('🔗 Step 4/4: Mapping content to goals...');
  const allMappings: ContentGoalMapping[] = [];

  // Map questions (sample first 10 for testing)
  const sampleQuestions = questions.slice(0, 10);
  for (let i = 0; i < sampleQuestions.length; i++) {
    const q = sampleQuestions[i];
    console.log(`  Mapping question ${i + 1}/${sampleQuestions.length}: ${q.id}`);

    try {
      const mapping = await mapQuestionToGoals(
        q.id,
        q.question,
        q.correctAnswer,
        q.explanation,
        q.domain,
        goalEmbeddings
      );
      allMappings.push(mapping);
    } catch (error) {
      console.error(`  ❌ Error mapping question ${q.id}:`, error);
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Map clinical pearls (sample first 5 for testing)
  const samplePearls = pearls.slice(0, 5);
  for (let i = 0; i < samplePearls.length; i++) {
    const p = samplePearls[i];
    console.log(`  Mapping pearl ${i + 1}/${samplePearls.length}: ${p.id}`);

    try {
      const mapping = await mapClinicalPearlToGoals(
        p.id,
        p.pearl,
        p.category,
        goalEmbeddings
      );
      allMappings.push(mapping);
    } catch (error) {
      console.error(`  ❌ Error mapping pearl ${p.id}:`, error);
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\n✅ Completed mapping for ${allMappings.length} items\n`);

  // Generate report
  const report = generateMappingReport(allMappings);

  // Save mappings
  const outputPath = path.join(process.cwd(), 'generated', 'content-goal-mappings.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(allMappings, null, 2));
  console.log(`💾 Saved mappings to: ${outputPath}\n`);

  // Save report
  const reportPath = path.join(process.cwd(), 'generated', 'mapping-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📊 Saved report to: ${reportPath}\n`);

  // Print summary
  printMappingReport(report);
}

/**
 * Generate mapping report
 */
function generateMappingReport(mappings: ContentGoalMapping[]): MappingReport {
  const totalContent = mappings.length;
  const mappedContent = mappings.filter((m) => m.mappedGoals.length > 0).length;
  const unmappedContent = totalContent - mappedContent;

  const confidences = mappings
    .filter((m) => m.mappedGoals.length > 0)
    .map((m) => m.confidence);
  const averageConfidence =
    confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;

  // Group by goal
  const mappingsByGoal: Record<
    string,
    { goalTitle: string; count: number; confidences: number[] }
  > = {};

  mappings.forEach((mapping) => {
    mapping.mappedGoals.forEach((match) => {
      if (!mappingsByGoal[match.goal.id]) {
        mappingsByGoal[match.goal.id] = {
          goalTitle: match.goal.title,
          count: 0,
          confidences: [],
        };
      }
      mappingsByGoal[match.goal.id].count++;
      mappingsByGoal[match.goal.id].confidences.push(match.similarity);
    });
  });

  // Calculate average confidence per goal
  const mappingsByGoalReport: Record<
    string,
    { goalTitle: string; count: number; averageConfidence: number }
  > = {};

  Object.entries(mappingsByGoal).forEach(([goalId, data]) => {
    mappingsByGoalReport[goalId] = {
      goalTitle: data.goalTitle,
      count: data.count,
      averageConfidence:
        data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length,
    };
  });

  // Find low confidence mappings
  const lowConfidenceMappings = mappings
    .filter((m) => m.confidence < 0.7 && m.mappedGoals.length > 0)
    .map((m) => ({
      contentId: m.contentId,
      contentType: m.contentType,
      confidence: m.confidence,
    }))
    .sort((a, b) => a.confidence - b.confidence);

  return {
    totalContent,
    mappedContent,
    unmappedContent,
    averageConfidence,
    mappingsByGoal: mappingsByGoalReport,
    lowConfidenceMappings,
  };
}

/**
 * Print mapping report to console
 */
function printMappingReport(report: MappingReport) {
  console.log('═══════════════════════════════════════════════════');
  console.log('           📊 MAPPING REPORT');
  console.log('═══════════════════════════════════════════════════\n');

  console.log('📈 Overall Statistics:');
  console.log(`   Total content items: ${report.totalContent}`);
  console.log(`   Successfully mapped: ${report.mappedContent} (${((report.mappedContent / report.totalContent) * 100).toFixed(1)}%)`);
  console.log(`   Unmapped: ${report.unmappedContent}`);
  console.log(`   Average confidence: ${(report.averageConfidence * 100).toFixed(1)}%\n`);

  console.log('🎯 Top 10 Most Mapped Goals:');
  const sortedGoals = Object.entries(report.mappingsByGoal)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  sortedGoals.forEach(([goalId, data], i) => {
    console.log(
      `   ${i + 1}. ${goalId}: ${data.goalTitle} (${data.count} mappings, ${(data.averageConfidence * 100).toFixed(1)}% confidence)`
    );
  });

  if (report.lowConfidenceMappings.length > 0) {
    console.log(`\n⚠️  Low Confidence Mappings (${report.lowConfidenceMappings.length} items):`);
    report.lowConfidenceMappings.slice(0, 5).forEach((item) => {
      console.log(
        `   ${item.contentId} (${item.contentType}): ${(item.confidence * 100).toFixed(1)}% confidence`
      );
    });
  }

  console.log('\n═══════════════════════════════════════════════════\n');
}

// Run if called directly
if (require.main === module) {
  mapAllContentToGoals()
    .then(() => {
      console.log('✅ Mapping complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error during mapping:', error);
      process.exit(1);
    });
}

export { mapAllContentToGoals, generateMappingReport };
