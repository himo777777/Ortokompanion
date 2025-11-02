/**
 * QUESTION TEMPLATE
 *
 * Use this template when creating new questions for OrtoKompanion.
 * Follow the CONTENT_GUIDE.md for detailed instructions.
 *
 * Before submitting:
 * 1. Verify all references exist in verified-sources.ts
 * 2. Run validateQuestion() to check for errors
 * 3. Ensure TutorMode data is complete
 * 4. Check band/level appropriateness
 */

import { MCQQuestion } from '@/data/questions';

/**
 * TEMPLATE: Basic Question (Minimum Required)
 */
export const BASIC_QUESTION_TEMPLATE: MCQQuestion = {
  id: 'domain-###', // Replace with domain-001, hoeft-025, etc.
  domain: 'höft', // One of: trauma, höft, fot-fotled, hand-handled, knä, axel-armbåge, rygg, sport, tumör
  level: 'at', // One of: student, at, st1, st2, specialist
  band: 'B', // One of: A, B, C, D, E

  // Clinical scenario - be specific, include relevant details
  question: 'En 65-årig patient med [condition] presenterar med [symptoms]. [Key findings]. Vilken är [next step/diagnosis/treatment]?',

  // 4 options - make distractors plausible
  options: [
    'Correct answer - should be clear best choice',
    'Plausible distractor - common mistake',
    'Plausible distractor - alternative approach',
    'Less likely option - but not obviously wrong',
  ],

  // Must match one option exactly
  correctAnswer: 'Correct answer - should be clear best choice',

  // Comprehensive explanation citing sources
  explanation: 'Correct answer is X because [reasoning]. According to [Source Year], [key evidence]. Distractor Y is wrong because [reason]. Swedish registry data shows [relevant statistics]. Differential diagnosis includes [alternatives] but [why ruled out].',

  // Link to Socialstyrelsen specialization goals
  relatedGoals: ['st1-01'], // Optional but recommended

  // One of 6 core competencies
  competency: 'medicinsk-kunskap', // medicinsk-kunskap, klinisk-färdighet, kommunikation, professionalism, samverkan, utveckling

  // 3-5 relevant tags
  tags: ['specific-condition', 'treatment-type', 'classification', 'domain-specific'],

  // At least 1, ideally 2-3 references from verified-sources.ts
  references: ['source-id-2023', 'textbook-edition'], // REQUIRED
};

/**
 * TEMPLATE: Complete Question with TutorMode (Recommended)
 */
export const COMPLETE_QUESTION_TEMPLATE: MCQQuestion = {
  id: 'hoeft-025',
  domain: 'höft',
  level: 'st1',
  band: 'C',

  question: 'En 68-årig kvinna med total höftprotes sedan 2 år söker för smärta i ljumske. CRP 3, SR 12. Röntgen visar radiolucent zon 5mm runt acetabulumkomponenten i DeLee-Charnley zon 1. Vilken diagnos är mest sannolik?',

  options: [
    'Periprostetisk infektion',
    'Aseptisk lösning - acetabulum',
    'Impingement',
    'Trochanterit',
  ],

  correctAnswer: 'Aseptisk lösning - acetabulum',

  explanation: 'Aseptisk lösning presenterar med gradvis ökande smärta, normala infektionsmarkörer och radiolucent zon >2mm. DeLee-Charnley zon 1 (cranial) är prognostiskt viktigt. Enligt Rikshöft 2024 är aseptisk lösning fortfarande huvudorsaken till acetabulumrevision (45%). Infektion skulle ge högre CRP. Differentialdiagnos kräver ledpunktion vid tveksamhet.',

  relatedGoals: ['st1-07'],
  competency: 'medicinsk-kunskap',
  tags: ['aseptisk lösning', 'total höftprotes', 'DeLee-Charnley', 'differentialdiagnos'],
  references: ['rikshoft-2024', 'campbell-13ed', 'delee-charnley-1976'],

  // TutorMode - STRONGLY RECOMMENDED
  tutorMode: {
    // 3 progressive hints
    hints: [
      'Titta på CRP och SR - är de förhöjda eller normala?',
      'DeLee-Charnley används för att beskriva zoner runt acetabulum',
      'Radiolucent zon >2mm talar för lösning',
    ],

    // Why students pick wrong answers
    commonMistakes: [
      'Missuppfatta normala infektionsmarkörer som uteslutande infektion (10-20% PPI har normal CRP)',
      'Glömma att aseptisk lösning är vanligaste revisionorsaken enligt svenska registret',
      'Inte känna till DeLee-Charnley klassificering',
    ],

    // Key concepts to remember
    teachingPoints: [
      'Aseptisk lösning: smärta + radiolucent zon >2mm + normala infektionsmarkörer',
      'DeLee-Charnley: Zon 1 (cranial), 2 (anterior/posterior), 3 (caudal)',
      'Svenska registret följer alla revisionsorsaker - aseptisk lösning 35-45%',
      'Vid tveksamhet: ledpunktion för odling och LP-analys',
    ],

    // Memory aid (optional)
    mnemonicOrTrick: 'DeLee 1-2-3 = Cranial-Mitten-Caudal (som en sandklocka)',
  },
};

/**
 * TEMPLATE GUIDE BY BAND
 */

// BAND A - Foundation Knowledge
export const BAND_A_TEMPLATE: MCQQuestion = {
  id: 'domain-###',
  domain: 'höft',
  level: 'student', // Usually student or at
  band: 'A',
  question: 'Vad är den primära blodförsörjningen till caput femoris?',
  options: [
    'A. circumflexa femoris medialis',
    'A. femoralis',
    'A. profunda femoris',
    'A. iliaca interna',
  ],
  correctAnswer: 'A. circumflexa femoris medialis',
  explanation: 'A. circumflexa femoris medialis är den viktigaste blodförsörjningen. Denna kunskap är grundläggande för att förstå avaskulär nekros vid collumfrakturer.',
  competency: 'medicinsk-kunskap',
  tags: ['anatomi', 'vaskulär försörjning', 'grundläggande'],
  references: ['campbell-13ed'],
};

// BAND B - Core Clinical Knowledge
export const BAND_B_TEMPLATE: MCQQuestion = {
  id: 'domain-###',
  domain: 'höft',
  level: 'at', // Usually at or st1
  band: 'B',
  question: 'En 75-årig patient med Garden IV höftfraktur. Vilken behandling rekommenderas enligt NICE-riktlinjen?',
  options: [
    'Intern fixation med skruvar',
    'Hemiartroplastik',
    'Total höftprotes',
    'Konservativ behandling',
  ],
  correctAnswer: 'Hemiartroplastik',
  explanation: 'Garden IV är dislokerad collumfraktur hos äldre. Hemiartroplastik är förstahandsval enligt NICE 2023. Total höftprotes övervägs vid artros.',
  competency: 'medicinsk-kunskap',
  tags: ['höftfraktur', 'Garden', 'behandlingsval'],
  references: ['nice-hip-fracture-2023', 'garden-1961'],
};

// BAND C - Clinical Problem-Solving
export const BAND_C_TEMPLATE: MCQQuestion = {
  id: 'domain-###',
  domain: 'höft',
  level: 'st1', // Usually st1 or st2
  band: 'C',
  question: 'En 45-årig patient 6 månader efter höftfrakturbehandling har smärta vid belastning. MR visar signalförändringar i caput femoris. Vilken diagnos och handläggning?',
  options: [
    'Nonunion - operativ revision',
    'Avaskulär nekros - observation och smärtlindring',
    'Infektiös komplikation - antibiotika',
    'Stress-fraktur - avlastning',
  ],
  correctAnswer: 'Avaskulär nekros - observation och smärtlindring',
  explanation: 'Tidiga AVN-tecken (6 mån) med MR-förändringar. Observation är rätt initial handläggning. Operation (kärndekomprression eller protes) endast vid progression eller symtomgivande collapse.',
  competency: 'klinisk-färdighet',
  tags: ['avaskulär nekros', 'AVN', 'komplikation', 'MR'],
  references: ['campbell-13ed', 'rockwood-9ed'],
};

// BAND D - Complications/Advanced
export const BAND_D_TEMPLATE: MCQQuestion = {
  id: 'domain-###',
  domain: 'höft',
  level: 'st2', // Usually st2 or specialist
  band: 'D',
  question: 'En 65-årig patient med THP utvecklar feber 38.5°C dag 3 postop. CRP 145, LP visar 45000 leukocyter. Odling växer S. aureus. Protes är stabil. Vilken åtgärd?',
  options: [
    'IV antibiotika i 6 veckor',
    'Akut reoperation - DAIR (debridement, antibiotics, irrigation, retention)',
    'Planerad 1-stegs revision om 2 veckor',
    'Planerad 2-stegs revision om 4 veckor',
  ],
  correctAnswer: 'Akut reoperation - DAIR (debridement, antibiotics, irrigation, retention)',
  explanation: 'Tidig postoperativ infektion (<4v) med stabil protes = DAIR-indikation. Förutsättningar: <3v symtom, stabil implantat, känd känslig bakterie. Svensk data visar 70-80% framgång vid korrekt indikation.',
  competency: 'klinisk-färdighet',
  tags: ['periprostetisk infektion', 'PPI', 'DAIR', 'komplikation'],
  references: ['rikshoft-2024', 'campbell-13ed'],
  tutorMode: {
    hints: [
      'Tidig infektion (<4 veckor) har olika handläggning än sen',
      'DAIR = Debridement, Antibiotics, Irrigation, Retention',
      'Stabil protes är nyckel - annars revision',
    ],
    commonMistakes: [
      'Vänta för länge - DAIR är mest effektivt inom första veckorna',
      'Missa att bakteriekänslighet krävs',
      'Inte följa svenska riktlinjer',
    ],
    teachingPoints: [
      'PPI timing: Tidig <3 mån, Försenad 3-24 mån, Sen >24 mån',
      'DAIR krav: <3v symtom, stabil protes, känd bakterie',
      'Rikshöft följer alla PPI-fall',
    ],
  },
};

// BAND E - Expert Level
export const BAND_E_TEMPLATE: MCQQuestion = {
  id: 'domain-###',
  domain: 'höft',
  level: 'specialist-ortopedi',
  band: 'E',
  question: 'En 32-årig patient med Perthes i anamnesen har nu avancerad artros. Acetabulär dysplasi med CE-vinkel 18°. LCE-vinkel 15°. Planerar THP. Vilken är största utmaningen och lösning?',
  options: [
    'Ökad luxationsrisk - dual mobility cup',
    'Dålig benstock proximalt - impaction bone grafting',
    'Abnorm anatomi - patient-specific instrument',
    'Acetabulär undercover - medialisering eller structural graft',
  ],
  correctAnswer: 'Acetabulär undercover - medialisering eller structural graft',
  explanation: 'CE <20° = betydande dysplasi. Acetabulumkomponent kräver medialisering till true acetabulum eller structural bone graft för täckning. Enligt svenska registret har dysplasi ökad revisionsrisk (HR 1.6). Optimal täckning >70% är kritisk för långtidshållbarhet.',
  competency: 'klinisk-färdighet',
  tags: ['acetabulär dysplasi', 'Perthes', 'THP', 'avancerad kirurgi'],
  references: ['rikshoft-2024', 'campbell-13ed', 'crowe-classification'],
  tutorMode: {
    hints: [
      'CE-vinkel <20° = betydande dysplasi',
      'True acetabulum vs anatomiskt acetabulum',
      'Svenska registret visar ökad revisionsrisk vid dysplasi',
    ],
    commonMistakes: [
      'Placera cup för lateralt - ger undercover och tidig lösning',
      'Inte bedöma benstock preoperativt',
      'Glömma att dysplasi ökar luxations- och lösningsrisk',
    ],
    teachingPoints: [
      'CE-vinkel: <20° dysplasi, <15° svår dysplasi',
      'Crowe klassificering används för höftdysplasi',
      'Medialisering till true acetabulum ger bättre täckning',
      'Structural graft (bulk eller impaction) vid stor defekt',
    ],
  },
};

/**
 * VALIDATION CHECKLIST
 *
 * Before submitting, verify:
 * ✅ ID follows format "domain-###"
 * ✅ Domain is one of 9 valid domains
 * ✅ Level and Band are appropriate for difficulty
 * ✅ Question is clear clinical scenario
 * ✅ 4 plausible options
 * ✅ correctAnswer matches an option exactly
 * ✅ Explanation cites sources
 * ✅ All references exist in verified-sources.ts
 * ✅ References are not expired
 * ✅ TutorMode has 3 hints
 * ✅ Related to Socialstyrelsen goals (if applicable)
 * ✅ Run validateQuestion() - no errors
 */

/**
 * EXAMPLE USAGE
 *
 * import { validateQuestion } from '@/lib/content-validation';
 *
 * const myQuestion: MCQQuestion = {
 *   // ... your question data
 * };
 *
 * const result = validateQuestion(myQuestion);
 * if (result.valid) {
 *   console.log('✅ Question is valid!');
 * } else {
 *   console.error('❌ Errors:', result.errors);
 * }
 */
