#!/usr/bin/env tsx
/**
 * Integrates generated questions into data/questions.ts
 * - Filters out problematic questions
 * - Renumbers IDs to avoid collisions
 * - Translates English mnemonics to Swedish
 */

import * as fs from 'fs';
import { logger } from '../lib/logger';
import * as path from 'path';
import { logger } from '../lib/logger';

// Questions to EXCLUDE (problematic ones)
const EXCLUDED_IDS = new Set([
  'trauma-003-003', // Medical error
  'sport-027',      // Incomplete
  'höft-004-04',    // Duplicate
  'sport-024',      // Duplicate
  'sport-026',      // Duplicate
  'sport-030',      // Duplicate
]);

// ID mapping (old → new)
const ID_MAPPING: Record<string, string> = {
  'trauma-001': 'trauma-051',
  'trauma-002': 'trauma-052',
  'trauma-003-001': 'trauma-053',
  'trauma-003-002': 'trauma-054',
  'trauma-006': 'trauma-055',
  'trauma-007': 'trauma-056',

  'höft-001': 'hoeft-052',
  'höft-002': 'hoeft-053',
  'höft-003': 'hoeft-054',
  'höft-004-01': 'hoeft-055',
  'höft-004-02': 'hoeft-056',
  'höft-004-03': 'hoeft-057',

  'knä-001': 'kna-051',
  'knä-002': 'kna-052',

  'sport-021': 'sport-021',
  'sport-022': 'sport-022',
  'sport-023': 'sport-023',
  'sport-025': 'sport-024',
  'sport-028': 'sport-025',
  'sport-029': 'sport-026',
};

// Mnemonic translations (English → Swedish)
const MNEMONIC_TRANSLATIONS: Record<string, string> = {
  "5 P:s: Pain, Paresthesia, Pallor, Pulselessness, Paralysis (symtom på kompartmentsyndrom)": "5 P:n: Smärta (Pain), Parestesier, Blekhet (Pallor), Pulslöshet, Paralys",
  "A-B-C: Antibiotika först, sedan Bedömning och stabilisering": "A-B-C: Antibiotika först, sedan Bedömning och stabilisering",
  "FAST - Fixation And Stabilization for Trauma": "FAST - Fixering Av Skador vid Trauma",
  "SPLAT - Swelling, Pain, Loss of function, Acuteness, Time for fasciotomi": "SPLAT - Svullnad, Smärta, Funktionsförlust, Akut, Tid för fasciotomi",
  "CIRCUIT - Circulation Issues Require Critical Urgent Intervention Today": "CIRKEL - Cirkulationsproblem Kräver Kritisk Akut Intervention Omedelbart",
  "ABCDE - Airway, Breathing, Circulation, Disability, Exposure": "ABCDE - Luftväg (Airway), Andning (Breathing), Cirkulation, Disability, Exponering",
  "Märgen ger stabilitet - Märgspikning för diaphysära frakturer!": "Märgen ger stabilitet - Märgspikning för diaphysära frakturer!",

  "Garden 3-4? Replace it!": "Garden 3-4? Ersätt det!",
  "Dysplasi? Osteotomi!": "Dysplasi? Osteotomi!",
  "Smärta + svullnad = Tänk infektion!": "Smärta + svullnad = Tänk infektion!",
  "Typ 2 - Icke-cementerad för bästa fäste!": "Typ 2 - Ocementerad för bästa fäste!",
  "Konservativ först, kirurgi sen!": "Konservativ först, kirurgi sen!",
  "Tänk DVT - Djupt Venöst Trombos efter operation!": "Tänk DVT - Djup Ventrombos efter operation!",
  "Dysplasi? Osteotomi för bästa korrigering!": "Dysplasi? Osteotomi för bästa korrigering!",

  "Mäta smärtan i knäet - Meniskens smärta kommer när det är bråttom!": "Meniskskada: Smärta vid vridning och instabilitet",
  "Knee pain? Consider the total fix - the prothesis mix!": "Knäsmärta? Överväg total lösning - knäprotes!",

  "ACL - Anterior Cruciate Ligament = Always Check Lachman": "ACL - Främre korsbandet = Alltid Kolla Lachman",
  "Axelinstabilitet = Always Examine Apprehension": "Axelinstabilitet = Alltid Undersök med Apprehension-test",
  "Stress = Sudden Training Rise Equals Stress Fracture": "STRESS = Snabb Träningsökning Resulterar i Stressfraktur",
  "KAST (Kasta, Axelsmärta, Stabilitet, Testa rörlighet)": "KAST - Kastande rörelse, Axelsmärta, Stabilitet, Testa rörlighet",
  "FOT (Fraktur, Ökad belastning, Tidig diagnos)": "FOT - Fraktur, Ökad belastning, Tidig diagnos",
  "RUGBY (Rugby, Utsatt axel, Grad av skada, Bedömning och Ytterligare undersökning)": "RUGBY - Rugby, Utsatt axel, Grad av skada, Bedömning och Ytterligare undersökning",
  "MR = Mjukdelar och Rätt diagnos!": "MR = Mjukdelar och Rätt diagnos!",
  "Apprehension = Axelinstabilitet!": "Apprehension = Axelinstabilitet!",
};

function translateMnemonic(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return MNEMONIC_TRANSLATIONS[text] || text;
}

function processQuestion(q: any): any {
  // Skip excluded questions
  if (EXCLUDED_IDS.has(q.id)) {
    return null;
  }

  // Remap ID
  const newId = ID_MAPPING[q.id] || q.id;

  // Translate mnemonic
  if (q.tutorMode?.mnemonicOrTrick) {
    q.tutorMode.mnemonicOrTrick = translateMnemonic(q.tutorMode.mnemonicOrTrick);
  }

  return {
    ...q,
    id: newId,
  };
}

function generateTypeScriptCode(questions: any[]): string {
  let code = '';

  for (const q of questions) {
    code += `  {\n`;
    code += `    id: '${q.id}',\n`;
    code += `    domain: '${q.domain}',\n`;
    code += `    level: '${q.level}',\n`;
    code += `    band: '${q.band}',\n`;
    code += `    question: ${JSON.stringify(q.question)},\n`;
    code += `    options: ${JSON.stringify(q.options, null, 6).replace(/\n/g, '\n    ')},\n`;
    code += `    correctAnswer: ${JSON.stringify(q.correctAnswer)},\n`;
    code += `    explanation: ${JSON.stringify(q.explanation)},\n`;

    if (q.relatedGoals && q.relatedGoals.length > 0) {
      code += `    relatedGoals: ${JSON.stringify(q.relatedGoals)},\n`;
    }

    code += `    competency: '${q.competency}',\n`;
    code += `    tags: ${JSON.stringify(q.tags)},\n`;

    if (q.references && q.references.length > 0) {
      code += `    references: ${JSON.stringify(q.references)},\n`;
    }

    if (q.tutorMode) {
      code += `    tutorMode: {\n`;
      code += `      hints: ${JSON.stringify(q.tutorMode.hints, null, 8).replace(/\n/g, '\n      ')},\n`;

      if (q.tutorMode.commonMistakes && q.tutorMode.commonMistakes.length > 0) {
        code += `      commonMistakes: ${JSON.stringify(q.tutorMode.commonMistakes, null, 8).replace(/\n/g, '\n      ')},\n`;
      }

      if (q.tutorMode.teachingPoints && q.tutorMode.teachingPoints.length > 0) {
        code += `      teachingPoints: ${JSON.stringify(q.tutorMode.teachingPoints, null, 8).replace(/\n/g, '\n      ')},\n`;
      }

      if (q.tutorMode.mnemonicOrTrick) {
        code += `      mnemonicOrTrick: ${JSON.stringify(q.tutorMode.mnemonicOrTrick)},\n`;
      }

      code += `    },\n`;
    }

    code += `  },\n`;
  }

  return code;
}

async function main() {
  const generatedDir = path.join(__dirname, '../generated');
  const outputFile = path.join(generatedDir, 'typescript-questions.txt');

  // Read generated question files
  const files = [
    'st5-trauma-questions.json',
    'st5-hoeft-questions.json',
    'st5-kna-questions.json',
    'sport-st2-questions.json',
  ];

  let allQuestions: any[] = [];

  for (const file of files) {
    const filePath = path.join(generatedDir, file);
    if (!fs.existsSync(filePath)) {
      logger.warn(`⚠️  File not found: ${file}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    const questions = data.questions || [];

    for (const q of questions) {
      const processed = processQuestion(q);
      if (processed) {
        allQuestions.push(processed);
      }
    }
  }

  console.log(`✅ Processed ${allQuestions.length} questions`);
  console.log(`❌ Excluded ${EXCLUDED_IDS.size} problematic questions`);

  // Group by domain
  const byDomain: Record<string, any[]> = {};
  for (const q of allQuestions) {
    const domain = q.domain;
    if (!byDomain[domain]) byDomain[domain] = [];
    byDomain[domain].push(q);
  }

  // Generate TypeScript code
  let output = '';

  for (const [domain, questions] of Object.entries(byDomain)) {
    output += `\n// ========================================\n`;
    output += `// ${domain.toUpperCase()} - ${questions.length} questions\n`;
    output += `// ========================================\n\n`;
    output += generateTypeScriptCode(questions);
  }

  fs.writeFileSync(outputFile, output, 'utf-8');
  console.log(`\n📝 Generated TypeScript code saved to: ${outputFile}`);
  console.log(`\nNext: Copy the code from this file and paste into data/questions.ts`);
}

main().catch((error) => { logger.error('Script error', error); process.exit(1); });
