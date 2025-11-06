# Goal-Aware AI System

Komplett dokumentation för OrtoKompanions goal-aware AI-system som kopplar allt innehåll till Socialstyrelsens officiella mål.

## 📋 Innehållsförteckning

- [Översikt](#översikt)
- [Arkitektur](#arkitektur)
- [Socialstyrelsen Mål](#socialstyrelsen-mål)
- [Komponenter](#komponenter)
- [Användning](#användning)
- [API Reference](#api-reference)
- [Exempel](#exempel)

---

## Översikt

### Vad är Goal-Aware systemet?

Goal-Aware systemet är OrtoKompanions AI-drivna motor som:

1. **Spårar progression** mot Socialstyrelsens officiella mål
2. **Genererar innehåll** som direkt testar specifika bedömningskriterier
3. **Mappar automatiskt** befintligt innehåll till relevanta mål
4. **Personaliserar lärande** baserat på användarens gaps och svaga områden
5. **Kvalitetssäkrar** att allt innehåll har pedagogiskt värde

### Nyckelfunktioner

✅ **74 detaljerade Socialstyrelsen-mål**
- Läkarexamen (10 mål)
- BT - Bastjänstgöring (15 mål)
- AT - Allmäntjänstgöring (20 mål)
- ST - Specialisttjänstgöring Ortopedi (29 mål)

✅ **Semantisk sökning med vektorembeddings**
- OpenAI text-embedding-3-large (1536 dimensioner)
- Cosine similarity för content-to-goal mapping
- Keyword extraction för snabb filtrering

✅ **AI-driven innehållsgenerering**
- Målstyrda frågor med GPT-4o
- Kliniska fall som täcker flera mål
- Kompletta lärandeområden (teori + praktik)
- Automatisk kvalitetsbedömning

✅ **Progress tracking**
- Per kompetensområde
- Per kategori
- Per bedömningskriterium
- Visualiserad dashboard

---

## Arkitektur

### Systemöversikt

```
┌─────────────────────────────────────────────────────────┐
│                  Goal-Aware System                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────┐      ┌──────────────────┐         │
│  │ Goal Database   │──────│  Goal Taxonomy   │         │
│  │ (74 mål)        │      │  (Embeddings)    │         │
│  └─────────────────┘      └──────────────────┘         │
│           │                         │                    │
│           ▼                         ▼                    │
│  ┌─────────────────────────────────────────────┐       │
│  │        Content-Goal Mapping Engine          │       │
│  │  (Semantic Search + Keyword Matching)       │       │
│  └─────────────────────────────────────────────┘       │
│           │                         │                    │
│           ▼                         ▼                    │
│  ┌─────────────────┐      ┌──────────────────┐         │
│  │ Goal-Aware      │      │  Progress         │         │
│  │ Generator       │      │  Tracker          │         │
│  └─────────────────┘      └──────────────────┘         │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Dataflöde

```
1. GENERATION FLOW
   User Request → Goal Selection → AI Generation → Quality Check → Content

2. MAPPING FLOW
   Existing Content → Embedding → Similarity Search → Goal Mapping → Storage

3. PROGRESSION FLOW
   User Activity → Criteria Update → Progress Calc → Dashboard Update
```

---

## Socialstyrelsen Mål

### Struktur

Varje mål följer denna struktur:

```typescript
interface SocialstyrelsensGoal {
  id: string;                    // t.ex. "bt-001"
  program: 'läkarexamen' | 'bt' | 'at' | 'st';
  specialty: string;              // ortopedi, allmänmedicin, etc.
  year?: number;                  // för läkarexamen
  title: string;
  description: string;
  category: string;
  competencyArea: string;         // medicinsk-kunskap, klinisk-färdighet, etc.
  required: boolean;
  assessmentCriteria: string[];   // Vad läkaren ska kunna
  clinicalScenarios?: string[];   // Realistiska situationer
  associatedDiagnoses?: string[]; // ICD-10-SE koder
  associatedProcedures?: string[];// KVÅ koder
  minimumCases?: number;
  minimumProcedures?: number;
  references?: string[];          // Svenska riktlinjer
}
```

### Program

#### BT - Bastjänstgöring (15 mål)
Obligatorisk 6-månaders tjänstgöring sedan 2021.

**Kategorier:**
- Akut omhändertagande (ABCDE, HLR)
- Grundläggande klinisk kompetens
- Medicinsk behandling
- Kommunikation
- Samverkan
- Patientsäkerhet
- Ortopedisk kompetens
- Professionalism

**Exempel:**
```typescript
{
  id: 'bt-001',
  program: 'bt',
  title: 'Initial bedömning enligt ABCDE',
  assessmentCriteria: [
    'Utföra systematisk ABCDE-bedömning',
    'Identifiera livshotande tillstånd',
    'Prioritera åtgärder baserat på fynd',
  ],
  minimumCases: 50
}
```

#### AT - Allmäntjänstgöring (20 mål)
Historisk 21-månaders tjänstgöring (till 2020).

**Indelning:**
- Internmedicin (6 månader)
- Kirurgi (6 månader)
- Psykiatri (3 månader)
- Allmänmedicin (3 månader)
- Valbar tjänstgöring (3 månader)

#### ST - Specialisttjänstgöring (29 mål)
Fokus på ortopedi.

**Områden:**
- Traumaortopedi
- Elektiv ortopedi
- Barnortopedi
- Handkirurgi
- Fotkirurgi
- Ryggkirurgi
- Sportmedicin
- Tumörkirurgi

---

## Komponenter

### 1. Goal Database

**Fil:** `data/focused-socialstyrelsen-goals.ts`

Innehåller alla 74 Socialstyrelsen-mål strukturerade för AT, BT, och ST.

```typescript
import { ALL_FOCUSED_GOALS, BT_GOALS, getGoalsByProgram } from '@/data/focused-socialstyrelsen-goals';

// Få alla BT-mål
const btGoals = BT_GOALS;

// Få mål för program
const stGoals = getGoalsByProgram('st');

// Få mål för specialitet
const ortoGoals = ALL_FOCUSED_GOALS.filter(g => g.specialty === 'ortopedi');
```

### 2. Goal Taxonomy

**Fil:** `lib/goal-taxonomy.ts`

Semantic search och content mapping.

```typescript
import {
  generateGoalEmbedding,
  findSimilarGoals,
  mapQuestionToGoals,
  calculateGoalProgress
} from '@/lib/goal-taxonomy';

// Generera embedding för mål
const embedding = await generateGoalEmbedding(goal);

// Hitta liknande mål för innehåll
const matches = await findSimilarGoals(questionText, embeddings, {
  topK: 5,
  minSimilarity: 0.7
});

// Mappa fråga till mål
const mapping = await mapQuestionToGoals(
  questionId,
  questionText,
  answer,
  explanation,
  domain,
  embeddings
);

// Beräkna progression
const progress = calculateGoalProgress('bt', 'ortopedi', activities);
```

### 3. Goal-Aware Generator

**Fil:** `lib/goal-aware-generator.ts`

Generera målstyrt innehåll.

```typescript
import {
  generateQuestionsForGoal,
  generateClinicalCaseForGoals,
  generateLearningModuleForGoal,
  generatePersonalizedContent
} from '@/lib/goal-aware-generator';

// Generera frågor för specifikt mål
const questions = await generateQuestionsForGoal(
  goal,
  5,              // antal
  ['B', 'C', 'D'] // svårighetsgrader
);

// Generera kliniskt fall
const clinicalCase = await generateClinicalCaseForGoals(
  [goal1, goal2],
  'medel'
);

// Generera lärandeområde
const module = await generateLearningModuleForGoal(goal);

// Personaliserat innehåll
const content = await generatePersonalizedContent(
  userId,
  'bt',
  'ortopedi',
  completedGoalIds,
  ['klinisk-färdighet']
);
```

### 4. Goals Dashboard

**Fil:** `components/progression/SocialstyrelsensGoalsDashboard.tsx`

React-komponent för att visa progression.

```tsx
import { SocialstyrelsensGoalsDashboard } from '@/components/progression/SocialstyrelsensGoalsDashboard';

// I din app
<SocialstyrelsensGoalsDashboard />
```

**Features:**
- Översikt per program (BT/AT/ST)
- Progress per kompetensområde
- Detaljvy per mål
- Checklista för bedömningskriterier
- Filterering per kategori

---

## Användning

### Scripts

#### 1. Testa Goal System

```bash
npm run test-goal-system
```

Validerar att:
- Alla 74 mål laddas korrekt
- Strukturen är korrekt
- Program distribution stämmer
- Kompetensområden täcks

#### 2. Generera Goal-Styrda Frågor

```bash
# Generera för BT-programmet (standard 3 frågor per mål)
npm run generate-goal-questions bt

# Generera för specifikt mål
npm run generate-goal-questions bt bt-001 5

# Generera för AT-programmet
npm run generate-goal-questions at

# Generera för ST-programmet
npm run generate-goal-questions st
```

Output:
- `generated/goal-questions-[program]-[date].json` - Alla frågor
- `generated/goal-questions-[program]-[date]-summary.txt` - Läsbar sammanfattning

#### 3. Mappa Befintligt Innehåll

```bash
npm run map-content-to-goals
```

Mappar automatiskt:
- Befintliga frågor → Mål
- Clinical pearls → Mål
- Cases → Mål

Output:
- `generated/content-goal-mappings.json` - Alla mappings
- `generated/mapping-report.json` - Rapport

---

## API Reference

### Goal Taxonomy

#### `generateGoalEmbedding(goal: SocialstyrelsensGoal): Promise<GoalEmbedding>`

Genererar semantic embedding för ett mål.

**Returns:**
```typescript
{
  goalId: string;
  embedding: number[]; // 1536 dimensioner
  metadata: {
    program: string;
    specialty: string;
    category: string;
    competencyArea: string;
    keywords: string[];
  }
}
```

#### `findSimilarGoals(contentText: string, embeddings: GoalEmbedding[], options): Promise<GoalMatch[]>`

Hitta mål som matchar innehåll.

**Options:**
- `topK`: Antal resultat (default: 5)
- `minSimilarity`: Minimum likhet (default: 0.7)
- `filterProgram`: Filtrera på program
- `filterSpecialty`: Filtrera på specialitet

**Returns:**
```typescript
{
  goal: SocialstyrelsensGoal;
  similarity: number;
  matchReason: string;
}[]
```

#### `calculateGoalProgress(program, specialty, activities): ProgressReport`

Beräkna användarens progression.

**Returns:**
```typescript
{
  totalGoals: number;
  completedGoals: number;
  progressPercentage: number;
  goalsByCategory: Record<string, {total: number, completed: number}>;
  goalsByCompetency: Record<string, {total: number, completed: number}>;
}
```

### Goal-Aware Generator

#### `generateQuestionsForGoal(goal, count, difficulties): Promise<GoalAwareQuestion[]>`

Generera frågor för specifikt mål.

**Parameters:**
- `goal`: SocialstyrelsensGoal
- `count`: Antal frågor (default: 5)
- `difficulties`: Array av 'A' | 'B' | 'C' | 'D' | 'E'

**Returns:**
```typescript
{
  id: string;
  domain: string;
  question: string;
  options: {id: string, text: string}[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'A' | 'B' | 'C' | 'D' | 'E';
  targetedGoals: string[];
  goalAlignment: {
    goalId: string;
    goalTitle: string;
    criteriaAddressed: string[];
    alignmentScore: number;
  }[];
  metadata: {
    qualityScore: number;
    validated: boolean;
  }
}[]
```

#### `generateClinicalCaseForGoals(goals, difficulty): Promise<GoalAwareClinicalCase>`

Generera kliniskt fall.

**Parameters:**
- `goals`: Array av SocialstyrelsensGoal
- `difficulty`: 'grundläggande' | 'medel' | 'avancerad'

#### `generatePersonalizedContent(userId, program, specialty, completedGoalIds, weakAreas)`

Generera personaliserat innehåll baserat på progression.

---

## Exempel

### Exempel 1: Generera Frågor för BT-mål

```typescript
import { BT_GOALS } from '@/data/focused-socialstyrelsen-goals';
import { generateQuestionsForGoal } from '@/lib/goal-aware-generator';

// Välj ABCDE-målet
const abcdeGoal = BT_GOALS.find(g => g.id === 'bt-001');

// Generera 3 frågor i olika svårighetsgrader
const questions = await generateQuestionsForGoal(
  abcdeGoal,
  3,
  ['B', 'C', 'D']
);

// Visa resultat
questions.forEach(q => {
  console.log(`${q.id}: ${q.question}`);
  console.log(`Quality: ${(q.metadata.qualityScore * 100).toFixed(1)}%`);
  console.log(`Validated: ${q.metadata.validated}`);
});
```

### Exempel 2: Spåra Användarens Progression

```typescript
import { calculateGoalProgress } from '@/lib/goal-taxonomy';

const activities = [
  { goalId: 'bt-001', activityType: 'question', completedAt: new Date() },
  { goalId: 'bt-002', activityType: 'case', completedAt: new Date() },
];

const progress = calculateGoalProgress('bt', 'ortopedi', activities);

console.log(`Completed: ${progress.completedGoals}/${progress.totalGoals}`);
console.log(`Progress: ${progress.progressPercentage.toFixed(1)}%`);

// Visa progression per kompetensområde
Object.entries(progress.goalsByCompetency).forEach(([area, stats]) => {
  console.log(`${area}: ${stats.completed}/${stats.total}`);
});
```

### Exempel 3: Mappa Befintlig Fråga till Mål

```typescript
import { generateAllGoalEmbeddings, mapQuestionToGoals } from '@/lib/goal-taxonomy';

// Generera embeddings en gång
const embeddings = await generateAllGoalEmbeddings();

// Mappa fråga
const mapping = await mapQuestionToGoals(
  'hoeft-001',
  'En 75-årig kvinna ramlar hemma och får smärtor i höften...',
  'A',
  'Klinisk bild och röntgen talar för...',
  'HÖFT',
  embeddings
);

console.log(`Confidence: ${(mapping.confidence * 100).toFixed(1)}%`);
mapping.mappedGoals.forEach(match => {
  console.log(`- ${match.goal.title} (${(match.similarity * 100).toFixed(1)}%)`);
  console.log(`  Reason: ${match.matchReason}`);
});
```

### Exempel 4: Personaliserad Lärandeplan

```typescript
import { generateGoalBasedLearningPath } from '@/lib/goal-taxonomy';

const learningPath = await generateGoalBasedLearningPath(
  'bt',                              // user program
  'ortopedi',                        // user specialty
  ['bt-001', 'bt-002'],             // completed goals
  ['klinisk-färdighet', 'kirurgisk-färdighet'] // weak areas
);

console.log('Recommended next goals:');
learningPath.nextGoals.forEach((goal, i) => {
  console.log(`${i+1}. ${goal.title}`);
});

console.log('\nRecommendations:');
learningPath.recommendations.forEach(rec => console.log(`- ${rec}`));

console.log(`\nEstimated time: ${learningPath.estimatedTime} cases`);
```

---

## Kvalitetssäkring

### Automated Quality Checks

Varje genererad fråga går genom:

1. **Structural Validation** (Zod schema)
   - Rätt antal svarsalternativ
   - Förklaring minst 100 tecken
   - Referenser finns

2. **Goal Alignment Check** (AI-driven)
   - Testar bedömningskriterier från målet
   - Klinisk relevans
   - Pedagogiskt värde
   - Score 0-100%

3. **Auto-validation Threshold**
   - Frågor med >85% quality score markeras som validerade
   - <85% flaggas för manuell granskning

### Manual Review Process

För frågor som inte auto-valideras:

```bash
# Granska low-confidence mappings
cat generated/mapping-report.json | jq '.lowConfidenceMappings'

# Filtrera på kvalitet
cat generated/goal-questions-bt-2025-11-04.json | jq '.questions[] | select(.metadata.qualityScore < 0.85)'
```

---

## Framtida Utveckling

### Planerade Features

- [ ] Multi-language support (engelska för internationella studenter)
- [ ] Expert review workflow
- [ ] Automatic source updates when guidelines change
- [ ] Integration med journal systems för real case tracking
- [ ] Collaborative goal achievement (study groups)
- [ ] AI tutor för steg-för-steg genomgång av mål

### Optimization

- [ ] Cache embeddings i localStorage
- [ ] Batch embedding generation
- [ ] Incremental goal progress updates
- [ ] Lazy loading av mål per program

---

## Support & Bidrag

### Rapportera Problem

Om du hittar fel i mål eller generat innehåll:

1. Notera `goalId` och `questionId`
2. Beskriv problemet
3. Föreslå korrigering med källreferens

### Lägga till Nya Mål

För att lägga till mål från andra specialiteter:

1. Öppna `data/focused-socialstyrelsen-goals.ts`
2. Följ befintlig struktur
3. Lägg till i rätt program-array (BT/AT/ST)
4. Uppdatera `ALL_FOCUSED_GOALS`
5. Kör `npm run test-goal-system` för validering

---

## Licens & Användning

Detta system är utvecklat för **OrtoKompanion** och baseras på:

- **Socialstyrelsen HSLF-FS 2021:8** (officiella specialitetsmål)
- **Svenska Ortopediska Föreningen** riktlinjer
- **Campbell's Operative Orthopaedics** och andra medicinska referenser

All AI-genererat innehåll ska granskas av medicinskt kunnig personal innan klinisk användning.

---

**Version:** 1.0.0
**Senast uppdaterad:** 2025-11-04
**Författare:** OrtoKompanion Development Team
