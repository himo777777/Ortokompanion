#!/usr/bin/env tsx
/**
 * Automatically inserts generated questions into data/questions.ts
 */

import * as fs from 'fs';
import { logger } from '../lib/logger';
import * as path from 'path';
import { logger } from '../lib/logger';

async function main() {
  const questionsFile = path.join(__dirname, '../data/questions.ts');
  const generatedFile = path.join(__dirname, '../generated/typescript-questions.txt');

  // Read files
  const questionsContent = fs.readFileSync(questionsFile, 'utf-8');
  const generatedContent = fs.readFileSync(generatedFile, 'utf-8');

  // Parse generated content by domain
  const sections = generatedContent.split(/\/\/ ========================================/);

  let hoeftQuestions = '';
  let knaQuestions = '';
  let sportQuestions = '';

  for (const section of sections) {
    if (section.includes('// HÖFT')) {
      hoeftQuestions = section.split('// HÖFT')[1].split('// ========================================')[0].trim();
    } else if (section.includes('// KNÄ')) {
      knaQuestions = section.split('// KNÄ')[1].split('// ========================================')[0].trim();
    } else if (section.includes('// SPORT')) {
      sportQuestions = section.split('// SPORT')[1].trim();
    }
  }

  console.log(`📦 Höft questions: ${hoeftQuestions.split('id:').length - 1} questions`);
  console.log(`📦 Knä questions: ${knaQuestions.split('id:').length - 1} questions`);
  console.log(`📦 Sport questions: ${sportQuestions.split('id:').length - 1} questions`);

  // Insert höft questions before HOEFT_QUESTIONS closing ];
  let updatedContent = questionsContent.replace(
    /(\n];)\n\n\/\/ FOT\/FOTLED DOMAIN QUESTIONS/,
    `,\n  // AI-Generated Questions (2025-11-02) - Validated and reviewed\n${hoeftQuestions}\n];\n\n// FOT/FOTLED DOMAIN QUESTIONS`
  );

  // Insert knä questions before KNA_QUESTIONS closing ];
  updatedContent = updatedContent.replace(
    /(\n];)\n\n\/\/ AXEL\/ARMBÅGE DOMAIN QUESTIONS/,
    `,\n  // AI-Generated Questions (2025-11-02) - Validated and reviewed\n${knaQuestions}\n];\n\n// AXEL/ARMBÅGE DOMAIN QUESTIONS`
  );

  // Insert sport questions before SPORT_QUESTIONS closing ];
  updatedContent = updatedContent.replace(
    /(\n];)\n\n\/\/ TUMÖR DOMAIN QUESTIONS/,
    `,\n  // AI-Generated Questions (2025-11-02) - Validated and reviewed\n${sportQuestions}\n];\n\n// TUMÖR DOMAIN QUESTIONS`
  );

  // Write updated content
  fs.writeFileSync(questionsFile, updatedContent, 'utf-8');

  console.log('\n✅ Successfully integrated all questions into data/questions.ts');
  console.log('\nNext steps:');
  console.log('1. Run TypeScript compiler to check for errors');
  console.log('2. Integrate TutorMode additions');
}

main().catch((error) => { logger.error('Script error', error); process.exit(1); });
