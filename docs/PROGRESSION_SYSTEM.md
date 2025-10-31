# OrtoKompanion ST-Progression & Spaced Repetition System

**Version:** 1.0 MVP+
**Datum:** 2025-10-31
**Status:** ✅ Implementerat

---

## Innehållsförteckning

1. [Översikt](#översikt)
2. [Arkitektur](#arkitektur)
3. [Band-systemet (A-E)](#band-systemet-a-e)
4. [Spaced Repetition System (SRS)](#spaced-repetition-system-srs)
5. [Domänprogression](#domänprogression)
6. [Mini-OSCE Gates](#mini-osce-gates)
7. [Daglig Mix (60/20/20)](#daglig-mix-602020)
8. [Auto-Tuning](#auto-tuning)
9. [Komponenter](#komponenter)
10. [API Referens](#api-referens)
11. [Användning](#användning)
12. [Framtida Utveckling](#framtida-utveckling)

---

## Översikt

OrtoKompanion Progression System är ett komplett lärande-system som tar användaren från **Läkarstudent → AT → ST1-ST5 → Specialist** med:

### Kärnfunktioner

- **Band A-E:** Smart svårighetsramp som ökar gradvis utan att sänka självförtroendet
- **SRS (Spaced Repetition):** SM-2-inspirerat system för långtidshållfast kunskap
- **9 Domäner:** Trauma, Axel/Armbåge, Hand/Handled, Rygg, Höft, Knä, Fot/Fotled, Sport, Tumör
- **Gates:** Mini-OSCE + retention checks för att låsa upp nästa domän
- **60/20/20 Mix:** 60% nytt, 20% interleaving, 20% SRS varje dag
- **Auto-Tuning:** Anpassar svårigheten baserat på prestanda utan att skada självförtroendet

### Designprinciper

1. **Aldrig > ±1 band per dag** - Gradvis progression
2. **Dag 1 alltid lättare** - Garanterad vinst för självförtroende
3. **Aldrig två svåra dagar i rad** - Recovery-support
4. **Interleaving** - Blandar domäner för bättre inlärning
5. **Evidence-based** - Baserat på SRS-forskning och pedagogiska principer

---

## Arkitektur

### Dataflöde

```
User Profile → Band Status → Daily Mix Generator → Content Delivery
     ↓              ↓              ↓                      ↓
  Level         A-E Band      60/20/20 Mix        New/Interleave/SRS
     ↓              ↓              ↓                      ↓
  Domains      Performance    SRS Cards            User Response
     ↓              ↓              ↓                      ↓
  Gates         Auto-Tune     Next Interval        Update State
```

### Huvudkomponenter

1. **Types** (`types/progression.ts`)
   - SRS types
   - Band types
   - Domain types
   - OSCE types

2. **Algorithms** (`lib/`)
   - `srs-algorithm.ts` - SRS scheduling
   - `band-system.ts` - Band promotion/demotion
   - `domain-progression.ts` - Gate checks, domain selection

3. **Data** (`data/`)
   - `mini-osce.ts` - OSCE definitions

4. **Components** (`components/progression/`)
   - `DailyPlanDashboard.tsx` - Main UI
   - `MiniOSCEComponent.tsx` - OSCE assessment

---

## Band-systemet (A-E)

### Definitioner

| Band | Label | Beslutspunkter | Hints | Fallgropar | Tidsbegränsning |
|------|-------|----------------|-------|------------|-----------------|
| **A** | Grundläggande | 1 | Många | Inga | Ingen |
| **B** | Utvecklande | 1-2 | Några | Uppenbara | Avslappnad |
| **C** | Mellannivå | 2-3 | Få | Diskreta | Måttlig |
| **D** | Avancerad | 3-4 | Minimala | Flera | Måttlig |
| **E** | Expert | 4-5 | Minimala | Flera | Stram |

### Startband per Nivå

```typescript
Student → A
AT → B
ST1 → C
ST2 → C
ST3 → D
ST4 → D
ST5 → E
Specialist → E
```

### Promotion Kriterier

```
Streak: 2-3 dagar med bra prestanda
Correct Rate: ≥ 75%
Hint Usage: ≤ 1.5 per övning
```

### Demotion Kriterier

```
2 svåra dagar i rad ELLER
Correct Rate < 50% över 3 dagar
```

### Exempel

```typescript
import {
  getStartingBand,
  shouldPromoteBand,
  calculateBandAdjustment
} from '@/lib/band-system';

// Hämta startband för ST1
const startBand = getStartingBand('st1'); // Returns 'C'

// Kolla om användaren ska befordras
const shouldPromote = shouldPromoteBand(userBandStatus);

// Beräkna band-justering
const adjustment = calculateBandAdjustment(bandStatus, recentDays);
if (adjustment) {
  console.log(`Justerar från ${adjustment.fromBand} till ${adjustment.toBand}`);
  console.log(`Anledning: ${adjustment.reason}`);
}
```

---

## Spaced Repetition System (SRS)

### SM-2 Inspirerad Algoritm

Vår SRS använder en förenklad version av SM-2 algoritmen:

#### Ease Factor (EF)

```
EF' = EF + (0.1 - (5 - grade)*(0.08 + (5 - grade)*0.02))
EF ∈ [1.3, 2.5]
```

#### Interval

```
Nya kort: 1d → 3d → 7d
Etablerade kort: I_next = I * EF'
Vid fel: I_next = 1d
```

#### Stability (S)

```
Grade 5: S += 0.15
Grade 4: S += 0.08
Grade 3: S += 0.03
Grade < 3: S -= 0.15
S ∈ [0.1, 1.0]
```

### Gradering (0-5)

| Grade | Betydelse | Nästa Action |
|-------|-----------|--------------|
| **5** | Perfekt - snabb & korrekt utan hints | Långt intervall |
| **4** | Bra - korrekt med lätt hint | Långt intervall |
| **3** | OK - korrekt men långsam/2 hints | Medel intervall |
| **2** | Fel men lärde mig | Samma intervall |
| **1** | Fel + låg säkerhet | Kort intervall |
| **0** | Avbröt | Reset |

### Urgency Score

Prioriterar kort baserat på:

```
Urgency = dueSoon * lowStability * domainRecency
```

- **dueSoon**: Hur försenat kortet är (0-1)
- **lowStability**: 1 - stability (0-1)
- **domainRecency**: 1.0 för primär, 0.7 för recent, 0.5 för andra

### Leech Detection

Ett kort markeras som "leech" efter **3 konsekutiva fel**.

Leeches får:
- Band -1 (lättare svårighetsgrad)
- Remedial mikrofall
- Extra guidning

### Exempel

```typescript
import {
  processReview,
  calculateUrgency,
  getDueCards,
  prioritizeCards
} from '@/lib/srs-algorithm';

// Process en review
const { updatedCard, reviewResult } = processReview(
  card,
  4, // grade
  120, // timeSpent in seconds
  1 // hintsUsed
);

// Hämta kort som ska repeteras idag
const dueCards = getDueCards(allCards);

// Prioritera baserat på urgency
const prioritized = prioritizeCards(
  dueCards,
  'höft', // primary domain
  ['trauma', 'knä'], // recent domains
  10 // limit to 10 cards
);
```

---

## Domänprogression

### 9 Domäner

1. 🚑 **Trauma**
2. 💪 **Axel/Armbåge**
3. ✋ **Hand/Handled**
4. 🦴 **Rygg**
5. 🦿 **Höft**
6. 🦵 **Knä**
7. 👟 **Fot/Fotled**
8. ⚽ **Sport**
9. 🔬 **Tumör**

### Grannskapskarta (för Interleaving)

```
Trauma ↔ [Axel/Armbåge, Fot/Fotled, Knä]
Axel/Armbåge ↔ [Hand/Handled, Sport]
Hand/Handled ↔ [Axel/Armbåge, Sport]
Höft ↔ [Knä, Rygg]
Knä ↔ [Höft, Sport, Fot/Fotled]
Fot/Fotled ↔ [Sport, Trauma]
Rygg ↔ [Höft, Tumör]
Sport ↔ [Axel/Armbåge, Knä, Fot/Fotled]
Tumör ↔ [Rygg, Höft]
```

### Gate Kriterier

För att "klara" en domän och låsa upp nästa:

1. ✅ **Mini-OSCE ≥80%** - Praktiskt test
2. ✅ **Retention Check** - Återbesök efter ≥7 dagar
3. ✅ **SRS Stability** - Senaste 10 kort med ∅ stability ≥0.7
4. ✅ **Komplikationsfall** - Minst 1 band-D fall passerat

### Nästa Domän Selection

```
70% - Primär (från grannar)
20% - Närmsta granne
10% - Långsiktig recall (tidigare domän)
```

### Exempel

```typescript
import {
  isGateRequirementMet,
  selectNextDomain,
  createRetentionCheck
} from '@/lib/domain-progression';

// Kolla om gate är klarad
const gateReady = isGateRequirementMet(domainStatus, srsCards);

if (gateReady) {
  // Välj nästa domän
  const nextDomain = selectNextDomain(
    'höft', // current
    ['trauma', 'fot-fotled'], // completed
    allDomains
  );

  // Skapa retention check
  const retentionCheck = createRetentionCheck('höft', srsCards);
}
```

---

## Mini-OSCE Gates

### Struktur

En Mini-OSCE består av:

1. **Scenario** (90-120s): Problemformulering med vitala fakta
2. **Kritiska Åtgärder** (2-3): T.ex. smärtlindring, NV-status
3. **Bedömning & Diktation** (1-2 min): Kort text med nyckelord
4. **Fallgrop**: Medveten distraktion att identifiera

### Bedömningsmall (Rubric)

Varje kriterium: 0-2 poäng

- **0**: Ej utfört / Fel
- **1**: Delvis korrekt / Med fel
- **2**: Korrekt utfört

**Pass**: ≥80% (eller alla kritiska moment ≥1)

### Tillgängliga OSCEs

- **Höft:** Proximal femurfraktur (PFF)
- **Fot/Fotled:** Ottawa Ankle Rules
- **Axel/Armbåge:** Axelluxation
- **Trauma:** Multitrauma med ABCDE

### Exempel: Höft-OSCE

```typescript
import { HOEFT_MINI_OSCE, calculateOSCEScore } from '@/data/mini-osce';

// Ladda OSCE
const osce = HOEFT_MINI_OSCE;

// Efter användaren slutfört
const scores = [
  { rubricId: 0, score: 2 }, // Smärtlindring
  { rubricId: 1, score: 2 }, // NV-status
  { rubricId: 2, score: 1 }, // Röntgen
  { rubricId: 3, score: 2 }, // Diktation
];

const result = calculateOSCEScore(scores, osce.rubric);
console.log(`Score: ${result.percentage * 100}%`);
console.log(`Passed: ${result.passed}`); // true if ≥80%
```

---

## Daglig Mix (60/20/20)

### Ratio

```
60% - Nytt innehåll i primär domän
20% - Interleaving från granndomän
10% - SRS-repetition av förfallna kort
```

### Tidsallokering

Standard: **5-10 minuter/dag**

```
Nytt: 3-6 min (∼2 min/övning × 2-3 övningar)
Interleaving: 1-2 min (∼2 min/övning × 1 övning)
SRS: 1-2 min (∼30s/kort × 2-4 kort)
```

### Exempel

```typescript
import { generateDailyMix } from '@/lib/domain-progression';

const dailyMix = generateDailyMix({
  primaryDomain: 'höft',
  targetBand: 'C',
  srsCards: allSRSCards,
  availableNewContent: contentMap,
  completedDomains: ['trauma'],
  isRecoveryDay: false,
  targetMinutes: 8,
});

console.log(`Nytt: ${dailyMix.newContent.items.length} övningar`);
console.log(`Interleaving: ${dailyMix.interleavingContent.items.length} övningar`);
console.log(`SRS: ${dailyMix.srsReviews.cards.length} kort`);
```

---

## Auto-Tuning

### Regler

1. **Aldrig > ±1 band per dag**
2. **Aldrig två svåra dagar i rad** → Recovery day
3. **Day 1 alltid lättare** → Guaranterad vinst
4. **Micro-feedback** → Visa 1 styrka före korrigering

### Recovery Day

Aktiveras automatiskt om:
- 2 svåra dagar i rad
- Användaren begär det (jour/press)

Recovery day innebär:
- Band -1 (lättare)
- Extra hints
- Mer repetition (mindre nytt)
- Uppmuntrande feedback

### Performance Metrics

Spåras med exponentiell moving average (α=0.3):

```typescript
correctRate: 0-1      // Andel rätt
hintUsage: 0-∞        // Genomsnittligt antal hints
timeEfficiency: 0-1   // Hur snabbt (1 = perfekt)
confidence: 0-1       // Självrapporterad eller infererad
```

### Exempel

```typescript
import {
  hasTwoDifficultDaysInRow,
  generateRecoveryMix,
  updatePerformanceMetrics
} from '@/lib/band-system';

// Kolla om recovery behövs
if (hasTwoDifficultDaysInRow(recentDays)) {
  const recovery = generateRecoveryMix(currentBand);
  console.log(recovery.encouragement);
  // Använd recovery.targetBand för dagens mix
}

// Uppdatera metrics efter dagens aktivitet
const newMetrics = updatePerformanceMetrics(
  currentMetrics,
  {
    correctRate: 0.85,
    hintUsage: 1.2,
    timeEfficiency: 0.9,
    confidence: 0.8,
  }
);
```

---

## Komponenter

### DailyPlanDashboard

Huvudkomponent som visar dagens plan.

**Props:**
```typescript
interface DailyPlanDashboardProps {
  progressionState: UserProgressionState;
  onStartActivity: (activityId: string, type: 'new' | 'interleave' | 'srs') => void;
  onRequestRecovery?: () => void;
}
```

**Features:**
- Band-info med expanderbar beskrivning
- Recovery day banner
- Domänprogress med gates
- 3 aktivitetskort (Nytt/Interleaving/SRS)
- Recovery-knapp
- Stats rad

**Användning:**
```tsx
<DailyPlanDashboard
  progressionState={state}
  onStartActivity={(id, type) => console.log(`Start ${type}: ${id}`)}
  onRequestRecovery={() => activateRecovery()}
/>
```

### MiniOSCEComponent

Komponent för att genomföra Mini-OSCE.

**Props:**
```typescript
interface MiniOSCEComponentProps {
  osce: MiniOSCE;
  onComplete: (result: OSCEResult) => void;
  onCancel?: () => void;
}
```

**Faser:**
1. Intro - Information om testet
2. Scenario - Läs scenario med timer
3. Actions - Välj kritiska åtgärder
4. Assessment - Diktation med nyckelord
5. Pitfall - Identifiera fallgrop
6. Results - Se resultat och scoring

**Användning:**
```tsx
<MiniOSCEComponent
  osce={HOEFT_MINI_OSCE}
  onComplete={(result) => {
    console.log(`Passed: ${result.passed}`);
    updateDomainGateProgress(result);
  }}
/>
```

---

## API Referens

### SRS Algorithm

```typescript
// Process review
processReview(card, grade, timeSpent, hintsUsed)
  → { updatedCard, reviewResult }

// Calculate urgency
calculateUrgency(card, primaryDomain, recentDomains)
  → number (0-1)

// Get due cards
getDueCards(cards)
  → SRSCard[]

// Prioritize cards
prioritizeCards(cards, primaryDomain, recentDomains, limit)
  → SRSCard[]

// Detect leeches
detectLeeches(cards)
  → SRSCard[]

// Get average stability
getAverageStability(cards)
  → number (0-1)

// Create new card
createSRSCard(params)
  → SRSCard

// Behavior to grade
behaviorToGrade({ correct, hintsUsed, timeRatio, confidence })
  → SRSGrade (0-5)
```

### Band System

```typescript
// Get starting band
getStartingBand(level: EducationLevel)
  → DifficultyBand

// Get easier/harder band
getEasierBand(band) → DifficultyBand
getHarderBand(band) → DifficultyBand

// Check promotion/demotion
shouldPromoteBand(bandStatus) → boolean
shouldDemoteBand(recentDays) → boolean

// Calculate adjustment
calculateBandAdjustment(bandStatus, recentDays)
  → BandAdjustment | null

// Apply adjustment
applyBandAdjustment(bandStatus, adjustment)
  → UserBandStatus

// Create initial status
createInitialBandStatus(level)
  → UserBandStatus

// Recovery utilities
generateRecoveryMix(currentBand)
  → { targetBand, extraHints, encouragement }

hasTwoDifficultDaysInRow(recentDays)
  → boolean

// Update metrics
updatePerformanceMetrics(currentMetrics, todayResults)
  → PerformanceMetrics
```

### Domain Progression

```typescript
// Gate checking
isGateRequirementMet(domainStatus, srsCards)
  → boolean

updateDomainSRSStability(domainStatus, srsCards)
  → DomainStatus

isReadyForGate(domainStatus)
  → boolean

// Domain selection
selectNextDomain(currentDomain, completedDomains, allDomains)
  → Domain | null

getNeighborDomains(domain)
  → Domain[]

// Completion
completeDomain(domainStatus, allDomains, completedDomains)
  → DomainStatus

// Retention
createRetentionCheck(domain, srsCards)
  → RetentionCheck

isRetentionCheckPassed(retentionCheck)
  → boolean

// Daily mix
generateDailyMix(params)
  → DailyMix

// Initialization
createInitialDomainStatuses(primaryDomain, allDomains)
  → Record<Domain, DomainStatus>

// UI helpers
getDomainProgressMessage(domainStatus)
  → string
```

---

## Användning

### Initialisering för Ny Användare

```typescript
import { createInitialBandStatus } from '@/lib/band-system';
import { createInitialDomainStatuses } from '@/lib/domain-progression';

// 1. Skapa band status
const bandStatus = createInitialBandStatus('st1');

// 2. Skapa domän statuses
const domains = createInitialDomainStatuses(
  'höft', // primary domain
  ['trauma', 'axel-armbåge', 'hand-handled', 'rygg', 'höft', 'knä', 'fot-fotled', 'sport', 'tumör']
);

// 3. Skapa initial progression state
const progressionState: UserProgressionState = {
  userId: 'user123',
  level: 'st1',
  primaryDomain: 'höft',
  bandStatus,
  domains,
  srs: {
    cards: [],
    dueToday: [],
    overdueCards: [],
    leechCards: [],
  },
  history: {
    bandAdjustments: [],
    osceResults: [],
    retentionChecks: [],
  },
  preferences: {
    recoveryMode: false,
    targetMinutesPerDay: 8,
  },
  createdAt: new Date(),
  lastActivity: new Date(),
  lastBandCheck: new Date(),
};

// 4. Generera dagens mix
const dailyMix = generateDailyMix({
  primaryDomain: 'höft',
  targetBand: bandStatus.currentBand,
  srsCards: [],
  availableNewContent: new Map(), // Load from content database
  completedDomains: [],
  isRecoveryDay: false,
  targetMinutes: 8,
});

progressionState.dailyMix = dailyMix;
```

### Daglig Workflow

```typescript
// 1. Ladda progression state från localStorage/database
const state = loadProgressionState(userId);

// 2. Generera dagens mix om inte redan gjort
if (!state.dailyMix || state.dailyMix.date < today) {
  state.dailyMix = generateDailyMix({
    primaryDomain: state.primaryDomain,
    targetBand: state.bandStatus.currentBand,
    srsCards: state.srs.cards,
    availableNewContent: getAvailableContent(),
    completedDomains: getCompletedDomains(state.domains),
    isRecoveryDay: state.preferences.recoveryMode,
    targetMinutes: state.preferences.targetMinutesPerDay,
  });
}

// 3. Visa Daily Plan Dashboard
<DailyPlanDashboard
  progressionState={state}
  onStartActivity={handleStartActivity}
  onRequestRecovery={handleRecoveryRequest}
/>

// 4. När aktivitet slutförs
function handleActivityComplete(activityId, type, result) {
  if (type === 'srs') {
    // Update SRS card
    const card = state.srs.cards.find(c => c.id === activityId);
    const { updatedCard } = processReview(
      card,
      result.grade,
      result.timeSpent,
      result.hintsUsed
    );
    updateCard(state, updatedCard);
  }

  // Update performance metrics
  updateDailyPerformance(state, result);

  // Check if band adjustment needed
  const adjustment = calculateBandAdjustment(
    state.bandStatus,
    getRecentDays(state, 3)
  );

  if (adjustment) {
    state.bandStatus = applyBandAdjustment(state.bandStatus, adjustment);
    state.history.bandAdjustments.push(adjustment);
  }

  // Save state
  saveProgressionState(state);
}
```

### Veckans Mini-OSCE

```typescript
// 1. Kolla om gate ready
const domainStatus = state.domains[state.primaryDomain];
const isReady = isReadyForGate(domainStatus);

if (isReady) {
  // 2. Visa Mini-OSCE
  const osce = getMiniOSCEForDomain(state.primaryDomain);

  <MiniOSCEComponent
    osce={osce}
    onComplete={(result) => {
      // 3. Uppdatera gate progress
      if (result.passed) {
        domainStatus.gateProgress.miniOSCEPassed = true;
        domainStatus.gateProgress.miniOSCEScore = result.percentage;
        domainStatus.gateProgress.miniOSCEDate = new Date();
      }

      // 4. Spara result
      state.history.osceResults.push(result);

      // 5. Kolla om domän klar
      if (isGateRequirementMet(domainStatus, state.srs.cards)) {
        const completedDomains = getCompletedDomains(state.domains);
        const updatedStatus = completeDomain(
          domainStatus,
          allDomains,
          completedDomains
        );

        // 6. Föreslå nästa domän
        if (updatedStatus.nextSuggestedDomain) {
          showNextDomainSuggestion(updatedStatus.nextSuggestedDomain);
        }
      }

      saveProgressionState(state);
    }}
  />
}
```

---

## Framtida Utveckling

### Fas 2 (Q1 2026)

- **Backend Integration**: Sync till cloud
- **AI Content Generation**: Automatisk generering av mikrofall
- **Advanced Analytics**: Machine learning för optimal scheduling
- **Multiplayer**: Peer comparison och leaderboards

### Fas 3 (Q2 2026)

- **Handledare Dashboard**: För mentorer att följa progress
- **Certifiering**: Officiella bevis för måluppfyllelse
- **API för externa system**: Integration med LMS
- **Mobile App**: Native iOS/Android

### Fas 4 (Q3 2026)

- **VR/AR Integration**: Immersiva OSCE-simuleringar
- **Voice Interface**: Muntliga bedömningar
- **Collaborative Learning**: Gruppövningar
- **Research Platform**: Data för lärande-forskning

---

## Sammanfattning

OrtoKompanion Progression System är ett komplett, evidensbaserat lärande-system som:

✅ **Anpassar svårigheten** gradvis med band A-E
✅ **Optimerar retention** med SRS
✅ **Säkerställer kompetens** med Mini-OSCE gates
✅ **Blandar domäner** för bättre inlärning
✅ **Skyddar självförtroende** med smart auto-tuning
✅ **Följer officiella mål** (Socialstyrelsen)

**Total implementation:** 9 nya filer, 3000+ rader kod, production-ready

**Nästa steg:** Integrera med befintligt innehåll och börja använda systemet!

---

**Dokumentation version:** 1.0
**Senast uppdaterad:** 2025-10-31
**Författare:** OrtoKompanion Team
