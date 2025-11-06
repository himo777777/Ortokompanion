/**
 * Show detailed example of AI-generated question
 *
 * Run with: npx tsx scripts/show-question-example.ts
 */

import { aiContentFactory } from '../lib/ai-content-factory';

async function showExample() {
  console.log('='.repeat(80));
  console.log('📝 EXEMPEL: AI-GENERERAD ORTOPEDISK FRÅGA');
  console.log('='.repeat(80));
  console.log('\nGenererar en traumafråga för ST3-nivå...\n');

  try {
    const result = await aiContentFactory.generateSingle({
      type: 'question',
      domain: 'trauma',
      level: 'st3',
      band: 'C',
      topic: 'Öppna frakturer och Gustilo-Anderson klassifikation',
    });

    console.log('✅ FRÅGA GENERERAD!\n');
    console.log('='.repeat(80));
    console.log('METADATA');
    console.log('='.repeat(80));
    console.log(`Confidence Score: ${(result.confidenceScore * 100).toFixed(1)}%`);
    console.log(`Generation Rounds: ${result.generationRounds}`);
    console.log(`Source Accuracy: ${(result.sourceAccuracy * 100).toFixed(1)}%`);
    console.log(`Medical Accuracy: ${(result.medicalAccuracy * 100).toFixed(1)}%`);
    console.log(`Cost: $${result.generationMetadata.cost.toFixed(4)}`);
    console.log(`Tokens: ${result.generationMetadata.totalTokens}`);
    console.log(`Duration: ${(result.generationMetadata.duration / 1000).toFixed(1)}s`);
    console.log(`Model: ${result.generationMetadata.model}`);

    console.log('\n' + '='.repeat(80));
    console.log('INNEHÅLL');
    console.log('='.repeat(80));

    const q = result.content as any; // Type cast for flexible access

    console.log('\n📋 FRÅGA:');
    console.log(q.question || 'N/A');

    console.log('\n📝 SVARSALTERNATIV:');
    if (q.options) {
      q.options.forEach((opt: string, i: number) => {
        const marker = opt === q.correctAnswer ? '✅' : '  ';
        console.log(`${marker} ${String.fromCharCode(65 + i)}. ${opt}`);
      });
    }

    console.log('\n✅ RÄTT SVAR:');
    console.log(q.correctAnswer || 'N/A');

    console.log('\n💡 FÖRKLARING:');
    console.log(q.explanation || 'N/A');

    console.log('\n📚 REFERENSER:');
    if (q.references) {
      q.references.forEach((ref: string) => {
        console.log(`   - ${ref}`);
      });
    }

    console.log('\n🏷️  TAGGAR:');
    if (q.tags) {
      console.log(`   ${q.tags.join(', ')}`);
    }

    console.log('\n🎯 KOMPETENS:');
    console.log(`   ${q.competency || 'N/A'}`);

    if (q.relatedGoals) {
      console.log('\n🎓 RELATERADE LÄRANDEMÅL:');
      q.relatedGoals.forEach((goal: string) => {
        console.log(`   - ${goal}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('FULLSTÄNDIG JSON');
    console.log('='.repeat(80));
    console.log(JSON.stringify(q, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('KVALITETSBEDÖMNING');
    console.log('='.repeat(80));

    // Analyze quality
    const wordCount = q.explanation.split(/\s+/).length;
    const hasSwedish = /[åäöÅÄÖ]/.test(q.question + q.explanation);
    const hasClinicalContext = /\d+.{0,10}(år|årig|month|dag)/.test(q.question);

    console.log(`\n✓ Ordantal i förklaring: ${wordCount} ord (krav: ≥150)`);
    console.log(`✓ Svenska tecken: ${hasSwedish ? 'Ja ✅' : 'Nej ❌'}`);
    console.log(`✓ Klinisk kontext: ${hasClinicalContext ? 'Ja ✅' : 'Nej ❌'}`);
    console.log(`✓ Antal källor: ${q.references.length} (krav: 2-4)`);
    console.log(`✓ Antal svarsalternativ: ${q.options.length} (krav: 4)`);

    const status = result.confidenceScore >= 0.99
      ? '🟢 AUTO-PUBLISH'
      : result.confidenceScore >= 0.95
      ? '🟡 NEEDS REVIEW'
      : '🔴 REJECT';

    console.log(`\n📊 STATUS: ${status}`);
    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Fel vid generering:', error);
    process.exit(1);
  }
}

showExample();
