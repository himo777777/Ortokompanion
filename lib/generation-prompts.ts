/**
 * AI Prompt Templates for Question Generation
 *
 * Structured prompts for generating high-quality Swedish medical questions
 * aligned with Socialstyrelsen requirements and verified evidence-based sources.
 */

import { EducationLevel } from '@/types/education';
import { Domain } from '@/types/onboarding';
import { DifficultyBand } from '@/types/progression';
import { SocialstyrelseMål } from '@/data/socialstyrelsen-goals';
import { SourceReference } from '@/types/verification';

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================

export const QUESTION_GENERATOR_SYSTEM_PROMPT = `Du är en erfaren svensk ortopedkirurg och medicinsk pedagog som arbetar för Socialstyrelsen med att skapa utbildningsmaterial för svenska läkare.

DIN ROLL:
- Skapa kliniskt realistiska MCQ-frågor för OrtoKompanion
- Säkerställ medicinsk korrekthet >99% enligt svenska och internationella riktlinjer
- Använd evidensbaserad medicin och citera källor korrekt
- Skriv på korrekt medicinsk svenska utan anglicismer

KÄLLHIERARKI (KRITISKT VIKTIGT - FÖLJ DENNA ORDNING):
1. **SVENSKA KÄLLOR (ALLTID PRIORITERA FÖRST)**:
   - Socialstyrelsen målbeskrivningar och nationella riktlinjer
   - SVORF (Svenska Ortopediska Föreningen) vårdprogram
   - SBU-rapporter (Statens Beredning för medicinsk Utvärdering)
   - Rikshöft/Riksknä/HAKIR årsrapporter (använd senaste årsdata!)
   - Läkemedelsverket behandlingsrekommendationer
   - Karolinska/Sahlgrenska/Akademiska sjukhus riktlinjer

2. **INTERNATIONELLA KÄLLOR (I ANDRA HAND)**:
   - NICE guidelines (UK)
   - AAOS guidelines (USA)
   - Campbell's Operative Orthopaedics
   - Rockwood & Green's Fractures

KVALITETSKRAV (>99% MEDICINSK KORREKTHET):
- Alla frågor MÅSTE baseras på minst 2 verifierade källor
- ALLTID citera SPECIFIKA svenska källor FÖRST när tillgängligt
- Förklaringar MÅSTE innehålla EXAKTA data: "enligt Rikshöft 2024, 10-års överlevnad 96,2%" INTE "enligt studier visar..."
- Använd ALLTID svenska registredata (Rikshöft, Riksknä etc.) när relevant
- Svarsalternativ MÅSTE vara plausibla och kliniskt relevanta (inga absurda distraktorer)
- Undvik "Benglish" - använd korrekta svenska medicinska termer
- Svenska termer: "höftfraktur" INTE "hip fracture", "märgspik" INTE "IM nail"

PEDAGOGISK PRINCIP:
Frågor ska LÄRA, inte bara testa. Fokusera på:
- Kliniskt beslutsfattande (inte bara faktaåtergivning)
- Vanliga misstag och fallgropar
- Evidensbaserad praxis med svenska vårdkontexter
- Realistiska svenska kliniska scenarios (svenska sjukvården, inte US healthcare)`;

export const TUTORMODE_GENERATOR_SYSTEM_PROMPT = `Du är en medicinsk pedagog specialiserad på orthopedic training för svenska ST-läkare.

DIN UPPGIFT:
Skapa TutorMode-innehåll som hjälper studenter att FÖRSTÅ och LÄRA SIG, inte bara memorera svar.

HINTS-PRINCIPER:
✅ BRA hints är DIREKTA och HANDLINGSBARA:
   "ATLS prioriterar alltid Airway före Breathing enligt ABC-principen"
   "Garden I-II frakturer är odislokerade, ofta stabila - kan mobiliseras direkt"

❌ DÅLIGA hints är vaga frågor:
   "Tänk på vad ATLS säger om prioritering"
   "Vad är skillnaden mellan Garden I och Garden II?"

COMMON MISTAKES:
Förklara VARFÖR fel svar är lockande:
"Många väljer protes för alla >65 år, men aktiva patienter <70 kan få fixation enligt Rikshöft"

TEACHING POINTS:
Nyckelfakta som student ska komma ihåg:
- Korta, koncisa
- Kliniskt relevanta
- Evidensbaserade

MNEMONICS:
Minnesregler när möjligt (svenska eller internationella):
"DeLee 1-2-3 = Kranial-Mitten-Kaudal (som en sandklocka)"`;

// ============================================================================
// BAND DESCRIPTIONS
// ============================================================================

export const BAND_DESCRIPTIONS: Record<DifficultyBand, string> = {
  'A': 'Grundläggande faktakunskap - Anatomi, definitioner, basala klassifikationer. Student/AT-nivå.',
  'B': 'Tillämpning av kärnkunskap - Diagnos, behandlingsval, vanliga tillstånd. ST1-ST2-nivå.',
  'C': 'Klinisk problemlösning - Differentialdiagnostik, komplex handläggning, multimorbiditet. ST2-ST3-nivå.',
  'D': 'Komplikationer och avancerad vård - Svåra fall, revisioner, ovanliga presentationer. ST4-ST5-nivå.',
  'E': 'Expertnivå - Sällsynta tillstånd, subspecialisering, gränsfall i guidelines. Specialist-nivå.',
};

export const BAND_DISTRIBUTION = {
  'A': 0.25,  // 25%
  'B': 0.30,  // 30%
  'C': 0.25,  // 25%
  'D': 0.15,  // 15%
  'E': 0.05,  // 5%
};

// ============================================================================
// DOMAIN-SPECIFIC ASPECTS
// ============================================================================

export const DOMAIN_ASPECTS: Record<Domain, string[]> = {
  'trauma': [
    'Frakturklassifikationer (AO, Garden, Gartland, etc.)',
    'Akut omhändertagande enligt ATLS',
    'Fixationsmetoder (K-tråd, platta, märg, extern fixation)',
    'Mjukdelsskador (ligament, senor, nerver, kärl)',
    'Kompartmentsyndrom och vaskulära skador',
  ],
  'höft': [
    'Total höftartroplastik (primär och revision)',
    'Höftfrakturer (collum, trokanter)',
    'Acetabulär dysplasi och periacetabulär osteotomi',
    'Höftartros och konservativ behandling',
    'Pediatrisk höft (DDH, Perthes, epifysiolys)',
  ],
  'fot-fotled': [
    'Fotledsfrakturer (Weber, Lauge-Hansen)',
    'Hallux valgus kirurgi',
    'Achillesruptur och tendinopati',
    'Ankelartros och artrodés',
    'Diabetisk fot och Charcot',
  ],
  'hand-handled': [
    'Distala radiusfrakturer',
    'Karpaltunnelsyndrom och nervkompressioner',
    'Tenderskador (flexor/extensor)',
    'Handled artros och artrodés',
    'Dupuytrens kontraktur',
  ],
  'knä': [
    'Total knäartroplastik',
    'Främre korsbandsrekonstruktion',
    'Meniskkirurgi',
    'Patellofemoral problematik',
    'Proximala tibiafrakturer',
  ],
  'axel-armbåge': [
    'Rotatorkuff-patologi',
    'Axelinstabilitet',
    'Total axelartroplastik',
    'Armbågsfrakturer',
    'Armbågs- och axelartros',
  ],
  'rygg': [
    'Ländryggsmärta och diskbråck',
    'Spinal stenos',
    'Kotfrakturer (osteoporotiska, traumatiska)',
    'Skolios',
    'Spondylodiscit',
  ],
  'sport': [
    'ACL-rekonstruktion',
    'Meniskskador hos idrottare',
    'Axelinstabilitet hos kastathleter',
    'Stress-frakturer',
    'Hälsenerupturer och tenderskador',
  ],
  'tumör': [
    'Skelettmetastaser och patologiska frakturer',
    'Benigna tumörer (enchondrom, osteokondrrom, fibrösa lesioner)',
    'Maligna primära tumörer (osteosarkom, Ewings)',
    'Diagnostisk workup och biopsi',
    'Multidisciplinär handläggning',
  ],
};

// ============================================================================
// QUESTION GENERATION PROMPT BUILDER
// ============================================================================

export function buildQuestionGenerationPrompt(params: {
  domain: Domain;
  level: EducationLevel;
  band: DifficultyBand;
  count: number;
  sources: SourceReference[];
  goals: SocialstyrelseMål[];
  startId?: number;
}): string {
  const { domain, level, band, count, sources, goals, startId = 1 } = params;

  const sourceList = sources
    .map(s => `- ${s.id}: "${s.title}" (${s.type}, evidensgrad ${s.evidenceLevel || 'N/A'})`)
    .join('\n');

  const goalList = goals
    .map(g => `- ${g.id}: ${g.title} (${g.category})`)
    .join('\n');

  const aspects = DOMAIN_ASPECTS[domain] || [];
  const aspectList = aspects.map((a, i) => `${i + 1}. ${a}`).join('\n');

  const bandDesc = BAND_DESCRIPTIONS[band];

  return `# UPPGIFT: Generera ${count} MCQ-frågor för OrtoKompanion

## SPECIFIKATIONER

**Domän**: ${domain}
**Nivå**: ${level}
**Band**: ${band} - ${bandDesc}
**Antal**: ${count} frågor
**Start-ID**: ${domain}-${String(startId).padStart(3, '0')}

## TILLGÄNGLIGA KÄLLOR

${sourceList}

## RELEVANTA SOCIALSTYRELSEN-MÅL

${goalList}

## DOMÄN-ASPEKTER ATT TÄCKA

${aspectList}

## KRAV

### 1. Frågestruktur
- **Kliniskt scenario**: Realistisk patient-presentation (ålder, kön, symtom, fynd)
- **4 svarsalternativ**: 1 korrekt + 3 plausibla distraktorer
- **Specifikt svar**: Exakt formulering (inte "A" eller "alternativ 1")

### 2. Förklaring
- Börja med VARFÖR rätt svar är korrekt
- Citera SPECIFIKA data: "Enligt Rikshöft 2024 har cementerad protes 5-årsöverlevnad på 96% hos >75-åriga"
- Förklara varför fel alternativ är felaktiga
- Använd svenska registredata när tillgängligt

### 3. Källor
- Använd ENDAST källor från listan ovan
- Minst 2 källor per fråga
- Prioritera svenska sources (Rikshöft, Riksknä, etc.)

### 4. Taggning
- 3-5 relevanta tags
- Inkludera klassifikationer, tekniker, anatomiska strukturer
- Använd svenska termer

### 5. Kompetensområde
Välj från: 'medicinsk-kunskap' | 'klinisk-färdighet' | 'kirurgisk-färdighet' | 'kommunikation' | 'professionalism' | 'samverkan'

### 6. Målkoppling
- Koppla till minst 1-2 Socialstyrelsen-mål från listan ovan
- Använd goal ID (t.ex. "st2-01", "at-exam-02")

### 7. TutorMode
För varje fråga, inkludera:
- **3 progressiva hints**: Direkta, handlingsbara ledtrådar (inte frågor!)
- **3-4 common mistakes**: Varför fel svar är lockande
- **3-5 teaching points**: Nyckelfakta att komma ihåg
- **Mnemonic** (om möjligt): Minnesregel på svenska eller engelska

### 8. Språk och stil
- ✅ Korrekt medicinsk svenska
- ✅ Svenska anatomiska termer
- ❌ Inga "Benglish" ord (treatment, imaging, fixation → behandling, bilddiagnostik, fixation OK)
- ❌ Inga stavfel eller typos

## EXEMPEL PÅ BRA FRÅGA

\`\`\`json
{
  "id": "höft-045",
  "domain": "höft",
  "level": "st2",
  "band": "C",
  "question": "En 78-årig kvinna faller hemma och får en högersidig collum femoris-fraktur (Garden III). Hon är tidigare välfungerande, går utan hjälpmedel och bor i lägenhet. ASA 2. Vad är mest lämplig behandling?",
  "options": [
    "Hemiprotes - cementerad",
    "Total höftprotes - cementerad",
    "Intern fixation med glidskruvar",
    "Konservativ behandling med tåbelastning"
  ],
  "correctAnswer": "Total höftprotes - cementerad",
  "explanation": "Garden III-IV frakturer hos äldre är dislokerade och har hög risk för avaskulär nekros samt pseudartros vid intern fixation. Enligt Rikshöft 2024 har total höftprotes (THP) bättre funktionellt resultat än hemiprotes hos välfungerande patienter >70 år, med lägre reoperation rate (8% vs 18% efter 2 år). Cementering rekommenderas hos >75-åriga enligt svenska riktlinjer pga bättre primär stabilitet och lägre periprotesisk fraktur risk. Intern fixation är kontraindicerat vid Garden III-IV hos >65-åriga (Rikshöft). Konservativ behandling leder till smärta, funktionsnedsättning och är inte indicerat vid opererbart tillstånd.",
  "competency": "kirurgisk-färdighet",
  "tags": ["collum femoris", "Garden klassifikation", "höftprotes", "cementering", "Rikshöft"],
  "references": ["rikshoft-2024", "socialstyrelsen-höftfraktur", "nice-hip-fracture-2023"],
  "relatedGoals": ["st2-02", "st2-03"],
  "tutorMode": {
    "hints": [
      "Garden III-IV frakturer hos äldre har mycket hög risk för avaskulär nekros och pseudartros - fixation fungerar sällan",
      "Välj mellan hemiprotes (billigare, enklare) och total protes (bättre funktion). Rikshöft visar THP överlägsen hos välfungerande patienter",
      "Cementering hos >75-åriga enligt svenska riktlinjer - ger bättre primär stabilitet och lägre risk för periprotesisk fraktur"
    ],
    "commonMistakes": [
      "Välja intern fixation - Garden III-IV har >50% misslyckande hos >65-åriga enligt Rikshöft",
      "Välja hemiprotes - THP har bättre funktionellt resultat hos aktiva patienter trots högre initial kostnad",
      "Glömma cementering - ocementerad protes har högre periprotesisk fraktur risk hos äldre"
    ],
    "teachingPoints": [
      "Garden I-II = odislokerade (kan fixeras), Garden III-IV = dislokerade (protes hos >65-åriga)",
      "THP > hemiprotes hos välfungerande patienter enligt Rikshöft 2024",
      "Cementering rekommenderas hos >75-åriga i Sverige",
      "ASA-klassifikation påverkar val: ASA 1-2 kan få THP, ASA 4 kanske endast hemiprotes"
    ],
    "mnemonicOrTrick": "Garden 1-2 Fix it, Garden 3-4 Replace it (hos äldre)"
  }
}
\`\`\`

## OUTPUT-FORMAT

Returnera en JSON-array med ${count} frågor enligt strukturen ovan.

\`\`\`json
[
  {
    "id": "${domain}-${String(startId).padStart(3, '0')}",
    "domain": "${domain}",
    "level": "${level}",
    "band": "${band}",
    "question": "...",
    "options": [...],
    "correctAnswer": "...",
    "explanation": "...",
    "competency": "...",
    "tags": [...],
    "references": [...],
    "relatedGoals": [...],
    "tutorMode": {
      "hints": [...],
      "commonMistakes": [...],
      "teachingPoints": [...],
      "mnemonicOrTrick": "..." eller null
    }
  }
]
\`\`\`

VIKTIGT:
- Täck OLIKA aspekter av ${domain} (använd listan ovan)
- Använd ENDAST källor från listan
- VARIERA kompetensområden
- UNDVIK dubbletter mellan frågor`;
}

// ============================================================================
// TUTORMODE GENERATION PROMPT BUILDER
// ============================================================================

export function buildTutorModePrompt(question: {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  domain: Domain;
  level: EducationLevel;
  band: DifficultyBand;
}): string {
  const wrongOptions = question.options.filter(o => o !== question.correctAnswer);

  return `# UPPGIFT: Skapa TutorMode för befintlig fråga

## BEFINTLIG FRÅGA

**ID**: ${question.id}
**Domän**: ${question.domain}
**Nivå**: ${question.level}
**Band**: ${question.band}

**Fråga**:
${question.question}

**Rätt svar**:
${question.correctAnswer}

**Felaktiga alternativ**:
${wrongOptions.map((o, i) => `${i + 1}. ${o}`).join('\n')}

**Förklaring**:
${question.explanation}

## UPPGIFT

Skapa TutorMode-innehåll som hjälper studenter att LÄRA SIG och FÖRSTÅ, inte bara memorera rätt svar.

## KRAV

### 1. PROGRESSIVA HINTS (3 st)

Hints ska vara DIREKTA och HANDLINGSBARA, inte frågor.

**Progression**:
- **Hint 1**: Generell klinisk princip eller utgångspunkt
- **Hint 2**: Mer specifik vägledning, eliminera några fel alternativ
- **Hint 3**: Tydlig pekare mot rätt svar (men ge inte svaret direkt)

**Exempel DÅLIGA hints** (undvik dessa!):
❌ "Tänk på vad ATLS säger"
❌ "Vilken klassifikation är relevant här?"
❌ "Vad står det i riktlinjerna?"

**Exempel BRA hints**:
✅ "ATLS prioriterar alltid Airway före Breathing enligt ABC-principen"
✅ "Garden III-IV frakturer är dislokerade och har hög risk för avaskulär nekros - fixation fungerar sällan hos >65-åriga"
✅ "Svenska riktlinjer rekommenderar cementering hos >75-åriga pga lägre risk för periprotesisk fraktur"

### 2. COMMON MISTAKES (3-4 st)

Förklara VARFÖR varje felaktigt alternativ är lockande:

**Format**: "Många väljer [fel svar] eftersom [lockande aspekt], men [varför det är fel]"

**Exempel**:
- "Många väljer protes för alla >65 år, men aktiva patienter <70 med Garden I-II kan få fixation enligt Rikshöft"
- "Intern fixation verkar mindre invasivt, men Garden III-IV har >50% misslyckande hos äldre enligt svenska data"

### 3. TEACHING POINTS (3-5 st)

Nyckelfakta som studenten ska komma ihåg:
- Korta, koncisa punkter
- Kliniskt relevanta
- Evidensbaserade (citera data)
- Praktiskt användbara

**Exempel**:
- "Garden I-II = odislokerade frakturer, ofta stabila"
- "THP har 8% reoperationsrisk vs 18% för hemiprotes efter 2 år (Rikshöft 2024)"
- "Cementering rekommenderas hos >75-åriga i Sverige"

### 4. MNEMONIC/TRICK (om möjligt)

Minnesregel på svenska eller engelska (internationella OK):
- Akronymer
- Rhymes
- Visualiseringar
- Sifferregler

**Exempel**:
- "DeLee 1-2-3 = Kranial-Mitten-Kaudal (som en sandklocka)"
- "Garden 1-2 Fix it, Garden 3-4 Replace it (hos äldre)"
- "ATLS ABC = Airway, Breathing, Circulation - alltid i denna ordning"

Om ingen bra mnemonic finns, returnera \`null\`.

## OUTPUT-FORMAT

\`\`\`json
{
  "hints": [
    "Hint 1 - generell princip",
    "Hint 2 - mer specifik vägledning",
    "Hint 3 - tydlig pekare mot rätt svar"
  ],
  "commonMistakes": [
    "Förklaring av misstag 1",
    "Förklaring av misstag 2",
    "Förklaring av misstag 3"
  ],
  "teachingPoints": [
    "Nyckelfakta 1",
    "Nyckelfakta 2",
    "Nyckelfakta 3",
    "Nyckelfakta 4"
  ],
  "mnemonicOrTrick": "Minnesregel här" eller null
}
\`\`\``;
}

// ============================================================================
// BATCH GENERATION CONFIG
// ============================================================================

export interface BatchGenerationConfig {
  domain: Domain;
  level: EducationLevel;
  bandDistribution: Record<DifficultyBand, number>;
  totalCount: number;
  startId: number;
  outputFile: string;
}

export const GENERATION_BATCHES: BatchGenerationConfig[] = [
  // Priority 1: ST5 (critical for progression system)
  {
    domain: 'höft',
    level: 'st5',
    bandDistribution: { 'A': 0, 'B': 0, 'C': 3, 'D': 4, 'E': 1 },
    totalCount: 8,
    startId: 1,
    outputFile: 'st5-hoeft-questions.json',
  },
  {
    domain: 'knä',
    level: 'st5',
    bandDistribution: { 'A': 0, 'B': 0, 'C': 2, 'D': 4, 'E': 1 },
    totalCount: 7,
    startId: 1,
    outputFile: 'st5-kna-questions.json',
  },
  {
    domain: 'trauma',
    level: 'st5',
    bandDistribution: { 'A': 0, 'B': 0, 'C': 2, 'D': 3, 'E': 2 },
    totalCount: 7,
    startId: 1,
    outputFile: 'st5-trauma-questions.json',
  },

  // Priority 2: Sport domain expansion (20 → 50)
  {
    domain: 'sport',
    level: 'st2',
    bandDistribution: { 'A': 3, 'B': 5, 'C': 2, 'D': 0, 'E': 0 },
    totalCount: 10,
    startId: 21,
    outputFile: 'sport-st2-questions.json',
  },
  {
    domain: 'sport',
    level: 'st3',
    bandDistribution: { 'A': 0, 'B': 4, 'C': 5, 'D': 1, 'E': 0 },
    totalCount: 10,
    startId: 31,
    outputFile: 'sport-st3-questions.json',
  },
  {
    domain: 'sport',
    level: 'st4',
    bandDistribution: { 'A': 0, 'B': 2, 'C': 4, 'D': 3, 'E': 1 },
    totalCount: 10,
    startId: 41,
    outputFile: 'sport-st4-questions.json',
  },

  // Priority 3: Tumör domain expansion (20 → 50)
  {
    domain: 'tumör',
    level: 'st2',
    bandDistribution: { 'A': 3, 'B': 5, 'C': 2, 'D': 0, 'E': 0 },
    totalCount: 10,
    startId: 21,
    outputFile: 'tumor-st2-questions.json',
  },
  {
    domain: 'tumör',
    level: 'st3',
    bandDistribution: { 'A': 0, 'B': 4, 'C': 5, 'D': 1, 'E': 0 },
    totalCount: 10,
    startId: 31,
    outputFile: 'tumor-st3-questions.json',
  },
  {
    domain: 'tumör',
    level: 'st4',
    bandDistribution: { 'A': 0, 'B': 2, 'C': 4, 'D': 3, 'E': 1 },
    totalCount: 10,
    startId: 41,
    outputFile: 'tumor-st4-questions.json',
  },
];
