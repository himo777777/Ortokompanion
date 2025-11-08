#!/usr/bin/env tsx
/**
 * Integrates generated TutorMode additions into existing questions
 */

import * as fs from 'fs';
import { logger } from '../lib/logger';
import * as path from 'path';
import { logger } from '../lib/logger';

async function main() {
  const questionsFile = path.join(__dirname, '../data/questions.ts');
  const tutormodeFile = path.join(__dirname, '../generated/tutormode-additions.json');

  // Read files
  const questionsContent = fs.readFileSync(questionsFile, 'utf-8');
  const tutormodeData = JSON.parse(fs.readFileSync(tutormodeFile, 'utf-8'));

  let updatedContent = questionsContent;
  let successCount = 0;
  let skipCount = 0;

  console.log(`📚 Processing ${tutormodeData.results.length} TutorMode additions\n`);

  for (const result of tutormodeData.results) {
    const questionId = result.questionId;
    const tutorMode = result.tutorMode;

    // Skip if tutorMode is null (generation failed)
    if (!tutorMode) {
      console.log(`⏭️  ${questionId} - generation failed, skipping`);
      skipCount++;
      continue;
    }

    // Check if question already has tutorMode
    const questionRegex = new RegExp(`(\\s+id: '${questionId}',.*?)(\\s+\\},)`, 's');
    const match = updatedContent.match(questionRegex);

    if (!match) {
      console.log(`⚠️  Question ${questionId} not found`);
      skipCount++;
      continue;
    }

    const questionBlock = match[1];

    // Check if already has tutorMode
    if (questionBlock.includes('tutorMode:')) {
      console.log(`⏭️  ${questionId} already has TutorMode`);
      skipCount++;
      continue;
    }

    // Format tutorMode for TypeScript
    let tutorModeStr = '    tutorMode: {\n';
    tutorModeStr += `      hints: ${JSON.stringify(tutorMode.hints, null, 8).replace(/\n/g, '\n      ')},\n`;

    if (tutorMode.commonMistakes && tutorMode.commonMistakes.length > 0) {
      tutorModeStr += `      commonMistakes: ${JSON.stringify(tutorMode.commonMistakes, null, 8).replace(/\n/g, '\n      ')},\n`;
    }

    if (tutorMode.teachingPoints && tutorMode.teachingPoints.length > 0) {
      tutorModeStr += `      teachingPoints: ${JSON.stringify(tutorMode.teachingPoints, null, 8).replace(/\n/g, '\n      ')},\n`;
    }

    if (tutorMode.mnemonicOrTrick) {
      tutorModeStr += `      mnemonicOrTrick: ${JSON.stringify(tutorMode.mnemonicOrTrick)},\n`;
    }

    tutorModeStr += '    },\n';

    // Insert tutorMode before closing },
    updatedContent = updatedContent.replace(
      questionRegex,
      `$1\n${tutorModeStr}$2`
    );

    console.log(`✅ ${questionId}`);
    successCount++;
  }

  // Write updated content
  fs.writeFileSync(questionsFile, updatedContent, 'utf-8');

  console.log(`\n📊 Integration complete:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`\n✅ TutorMode additions integrated into data/questions.ts`);
}

main().catch((error) => { logger.error('Script error', error); process.exit(1); });
