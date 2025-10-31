# Socialstyrelsen Integration

Senast uppdaterad: 2025-10-30

## Översikt

Ortokompanion är nu fullt integrerat med Socialstyrelsens officiella utbildningsmål för:
- **Läkarprogrammet** - Grundläggande mål för läkarstudenter
- **AT (Allmäntjänstgöring)** - Mål för AT-läkare
- **ST Ortopedi** - Specialistutbildning år 1-5

Denna integration säkerställer att all utbildning i systemet är kopplad till officiella kompetenskrav och att användare kan följa sin progress mot dessa mål i realtid.

---

## Komponenter

### 1. GoalProgressTracker

Huvudkomponenten för att visa och spåra Socialstyrelsen mål.

**Fil:** `components/learning/GoalProgressTracker.tsx`

**Features:**
- Visar alla relevanta mål för användarens nivå
- Interaktiv expandering för att se bedömningskriterier
- Klickbara kriterier för att markera progress
- Filtrering per kompetensområde:
  - 📘 Medicinsk kunskap
  - 🩺 Klinisk färdighet
  - 💬 Kommunikation
  - 🏆 Professionalism
  - 👥 Samverkan
  - 💡 Utveckling
- Automatisk sparning till localStorage
- Progress visualization med progress bars
- Visar antal bevis insamlade för varje mål

**Användning:**
```tsx
import GoalProgressTracker from '@/components/learning/GoalProgressTracker';

<GoalProgressTracker
  userLevel="st1"
  showAllLevels={false} // För ST-läkare: visa även tidigare års mål
/>
```

---

### 2. Enhanced Analytics Dashboard

Analytics Dashboard har förbättrats med en ny sektion som visar Socialstyrelsen mål progress.

**Fil:** `components/analytics/AnalyticsDashboard.tsx`

**Nya Features:**
- **Övergripande progress** - Procentuell måluppfyllelse
- **Progress per kompetensområde** - Detaljerad breakdown
- **Senaste aktivitet** - De 3 senaste målen du arbetat med
- **Länk till full målsida** - "Se alla mål" knapp

**Mock Data:**
```typescript
import { generateMockAnalytics } from '@/components/analytics/AnalyticsDashboard';

const analytics = generateMockAnalytics();
// Inkluderar nu goalProgress med mock data
```

---

### 3. Goals Page

Dedikerad sida för att visa och hantera Socialstyrelsen mål.

**Fil:** `app/goals/page.tsx`

**Features:**
- Nivåväljare (Student/AT/ST1-ST5)
- Checkbox för att visa tidigare års mål (för ST-läkare)
- Informationsbox om Socialstyrelsens mål
- Länk tillbaka till dashboard
- Responsiv design

**URL:** `/goals`

---

## Datamodeller

### SocialstyrelseMål Interface

```typescript
export interface SocialstyrelseMål {
  id: string;                    // Unikt ID (t.ex. 'st1-01')
  category: string;              // Kategori (t.ex. 'Traumaortopedi')
  title: string;                 // Kort titel
  description: string;           // Beskrivning av målet
  level: 'student' | 'at' | 'st1' | 'st2' | 'st3' | 'st4' | 'st5';
  competencyArea: 'medicinsk-kunskap' | 'klinisk-färdighet' |
                   'kommunikation' | 'professionalism' |
                   'samverkan' | 'utveckling';
  required: boolean;             // Obligatorisk eller valfri
  assessmentCriteria: string[];  // Lista av bedömningskriterier
}
```

### MålProgress Interface

```typescript
export interface MålProgress {
  målId: string;              // Referens till mål-ID
  achieved: boolean;          // Helt uppnått?
  progress: number;           // 0-100
  evidenceCount: number;      // Antal bevis/aktiviteter
  lastUpdated: Date;          // Senaste uppdateringen
}
```

### SocialstyrelseMålProgress (för Analytics)

```typescript
export interface SocialstyrelseMålProgress {
  totalGoals: number;
  achievedGoals: number;
  percentage: number;
  byCompetencyArea: Record<string, { total: number; achieved: number }>;
  recentActivity: Array<{
    goalId: string;
    goalTitle: string;
    timestamp: Date;
    activityType: string;
  }>;
}
```

---

## Innehållslänkning

All lärande content kan nu länkas till Socialstyrelsen mål via `relatedGoals` fältet:

### PlanItem (7-dagarsplan)
```typescript
export interface PlanItem {
  // ... befintliga fält
  relatedGoals?: string[]; // Array av mål-IDs
}
```

### ClinicalPearl
```typescript
export interface ClinicalPearl {
  // ... befintliga fält
  relatedGoals?: string[]; // Array av mål-IDs
}
```

### CaseVignette
```typescript
export interface CaseVignette {
  // ... befintliga fält
  relatedGoals?: string[]; // Array av mål-IDs
}
```

### AdaptiveQuestion
```typescript
export interface AdaptiveQuestion {
  // ... befintliga fält
  relatedGoals?: string[]; // Array av mål-IDs
}
```

### Flashcard
```typescript
export interface Flashcard {
  // ... befintliga fält
  relatedGoals?: string[]; // Array av mål-IDs
}
```

### Exempel

```typescript
const microcase: PlanItem = {
  id: 'hip-fracture-case-1',
  type: 'microcase',
  title: 'Höftfraktur hos äldre patient',
  description: 'Handlägg en patient med trokanterisk fraktur',
  estimatedMinutes: 8,
  xpReward: 15,
  completed: false,
  relatedGoals: ['st1-01', 'lp-04'], // Kopplar till ST1 höftfrakturer & LP röntgen
  content: {
    // microcase content...
  }
};
```

---

## Mål Hierarki

### Läkarprogrammet (5 mål)

```
LP-01: Grundläggande anatomi och fysiologi
LP-02: Inspektion, palpation, rörlighet
LP-03: ABCDE och primär bedömning
LP-04: Grundläggande röntgentolkning
LP-05: Patientkommunikation och samtycke
```

### AT-mål (5 mål)

```
AT-01: Handlägga vanliga frakturer
AT-02: Jour och akutmottagning
AT-03: Tillämpa kliniska beslutsstöd
AT-04: Korrekt journalföring
AT-05: Teamarbete i akutsituationer
```

### ST Ortopedi (4 mål per år × 5 år = 20 mål)

#### ST1 - Första året
```
ST1-01: Handlägga höftfrakturer
ST1-02: Grundläggande operationsteknik
ST1-03: Interna fixationsmetoder
ST1-04: Öppna frakturer
```

#### ST2 - Andra året
```
ST2-01: Artroskirurgi - grundläggande
ST2-02: Vanliga handskador
ST2-03: Vanliga barnortopediska tillstånd
ST2-04: Avancerad bildtolkning
```

#### ST3 - Tredje året
```
ST3-01: Total höftprotes (THA)
ST3-02: Knäartroskopi och ACL
ST3-03: Grundläggande ryggkirurgi
ST3-04: Perioperativa komplikationer
```

#### ST4 - Fjärde året
```
ST4-01: Total knäprotes (TKA)
ST4-02: Grundläggande revisionsartroplastik
ST4-03: Bentumörer - diagnostik
ST4-04: Vetenskapligt arbete
```

#### ST5 - Femte året
```
ST5-01: Avancerad subspecialistkunskap
ST5-02: Avancerad revisionskirurgi
ST5-03: Kliniskt ledarskap
ST5-04: Implementera ny kunskap
```

---

## Utility Functions

### getMålForLevel()
Hämta mål för en specifik nivå.

```typescript
import { getMålForLevel } from '@/data/socialstyrelsen-goals';

const st1Goals = getMålForLevel('st1'); // Returnerar 4 mål för ST1
```

### getAllMålForLevel()
Hämta alla mål upp till och med vald nivå (för ST-läkare).

```typescript
import { getAllMålForLevel } from '@/data/socialstyrelsen-goals';

const allGoals = getAllMålForLevel('st3');
// Returnerar ST1 + ST2 + ST3 mål = 12 mål
```

### calculateMålProgress()
Beräkna övergripande progress.

```typescript
import { calculateMålProgress } from '@/data/socialstyrelsen-goals';

const progress = calculateMålProgress(userProgressArray, 'st1');
// Returnerar: { total: 4, achieved: 2, percentage: 50 }
```

### getMålByCategory()
Filtrera mål per kategori.

```typescript
import { getMålByCategory } from '@/data/socialstyrelsen-goals';

const traumaGoals = getMålByCategory('st1', 'Traumaortopedi');
```

### getRequiredMål()
Hämta endast obligatoriska mål.

```typescript
import { getRequiredMål } from '@/data/socialstyrelsen-goals';

const requiredGoals = getRequiredMål('st2');
```

---

## localStorage Integration

Progress sparas automatiskt i localStorage:

**Key format:** `socialstyrelsen-progress-{level}`

**Exempel:**
```javascript
localStorage.getItem('socialstyrelsen-progress-st1')
// Returnerar JSON-array med MålProgress objekt
```

**Data struktur:**
```json
[
  {
    "målId": "st1-01",
    "achieved": false,
    "progress": 75,
    "evidenceCount": 3,
    "lastUpdated": "2025-10-30T10:00:00.000Z"
  },
  {
    "målId": "st1-02",
    "achieved": true,
    "progress": 100,
    "evidenceCount": 4,
    "lastUpdated": "2025-10-29T15:30:00.000Z"
  }
]
```

---

## Workflow - Hur det fungerar

### 1. User Journey

```
1. User slutför onboarding → Väljer nivå (t.ex. ST1)
2. System visar relevant content kopplat till ST1 mål
3. User slutför ett microcase → relatedGoals uppdateras automatiskt
4. User kan se progress i Analytics Dashboard
5. User klickar "Se alla mål" → Navigerar till /goals
6. User expanderar ett mål → Ser bedömningskriterier
7. User klickar på kriterium → Markeras som slutfört
8. Progress sparas automatiskt → Visas direkt i UI
```

### 2. Content Creation Workflow

När du skapar nytt innehåll (microcase, quiz, etc.):

```typescript
// 1. Identifiera vilket/vilka mål innehållet kopplar till
// 2. Lägg till relatedGoals array

const newMicrocase: PlanItem = {
  // ... content
  relatedGoals: ['st1-01', 'st1-03'], // Kopplar till höftfrakturer & fixation
};

// 3. När användaren slutför denna aktivitet:
// - Öka evidenceCount för dessa mål
// - Uppdatera progress
// - Logga till recentActivity
```

### 3. Automatisk Progress Tracking (Framtida implementation)

```typescript
// När user slutför en aktivitet med relatedGoals
function onActivityCompleted(activity: PlanItem) {
  if (activity.relatedGoals && activity.relatedGoals.length > 0) {
    activity.relatedGoals.forEach(goalId => {
      // Öka evidence count
      incrementEvidenceCount(goalId);

      // Uppdatera progress
      updateGoalProgress(goalId);

      // Logga aktivitet
      logGoalActivity(goalId, activity.title);
    });
  }
}
```

---

## Användningsexempel

### Exempel 1: Visa mål för ST1-läkare

```tsx
import GoalProgressTracker from '@/components/learning/GoalProgressTracker';

export default function MyGoalsPage() {
  return (
    <div>
      <h1>Mina Mål - ST1 Ortopedi</h1>
      <GoalProgressTracker userLevel="st1" />
    </div>
  );
}
```

### Exempel 2: Visa alla mål upp till ST3

```tsx
<GoalProgressTracker
  userLevel="st3"
  showAllLevels={true}
/>
// Visar ST1 + ST2 + ST3 mål
```

### Exempel 3: Integrera i Analytics

```tsx
import AnalyticsDashboard, { generateMockAnalytics } from '@/components/analytics/AnalyticsDashboard';

const analytics = generateMockAnalytics();

<AnalyticsDashboard analytics={analytics} />
// Analytics inkluderar automatiskt goalProgress section om data finns
```

### Exempel 4: Koppla microcase till mål

```typescript
const dayOneMicrocase: PlanItem = {
  id: 'day1-microcase',
  type: 'microcase',
  title: 'Akut fotledsskada',
  description: 'Tillämpa Ottawa Ankle Rules',
  estimatedMinutes: 8,
  xpReward: 15,
  completed: false,
  relatedGoals: ['at-03', 'lp-04'], // Ottawa Rules & Röntgentolkning
  content: {
    scenario: '...',
    questions: [...]
  }
};
```

---

## Framtida Förbättringar

### Planerade Features

1. **Automatisk Progress Tracking**
   - Auto-increment progress när användare slutför relaterat innehåll
   - Smart detection av kompetensdemonstration

2. **Evidensportfölj**
   - Upload av bilder/dokument som bevis
   - Länka till verkliga kliniska fall
   - Portfolio export för specialistansökan

3. **Handledare Integration**
   - Handledare kan validera måluppfyllelse
   - Digital signering av bedömningskriterier
   - Feedback och kommentarer

4. **AI-Powered Recommendations**
   - AI föreslår nästa mål att fokusera på
   - Personalized learning path baserat på progress
   - Gap analysis: "Du behöver mer träning i..."

5. **Progress Reports**
   - Generera PDF-rapporter för AT/ST-dokumentation
   - Officiella bevis för Socialstyrelsen
   - Progress timeline visualization

6. **Peer Comparison**
   - Anonym jämförelse med andra på samma nivå
   - Benchmark mot genomsnittet
   - Identifiera starka/svaga områden

7. **Milstolpar & Certifikat**
   - Digital badge när alla mål i en kategori är uppnådda
   - Delbart på sociala medier
   - Certifikat för kompletta nivåer

---

## Integration Checklist

När du integrerar Socialstyrelsen mål i ditt innehåll:

- [ ] Identifiera relevanta mål för innehållet
- [ ] Lägg till `relatedGoals` array med mål-IDs
- [ ] Säkerställ att content matchar bedömningskriterierna
- [ ] Testa att progress uppdateras korrekt
- [ ] Verifiera att mål visas i Analytics
- [ ] Dokumentera kopplingen i content metadata

---

## API Endpoints (Framtida Backend)

### GET /api/goals/:level
Hämta mål för en specifik nivå.

### POST /api/goals/progress
Uppdatera progress för ett mål.

### GET /api/user/goal-progress
Hämta användarens totala progress.

### POST /api/goals/evidence
Ladda upp bevis för måluppfyllelse.

---

## Säkerhet & Integritet

- All progress data lagras lokalt (localStorage) för GDPR-compliance
- Ingen data skickas till externa servrar utan användarens samtycke
- Framtida backend kommer använda end-to-end encryption
- Användare äger sin egen data och kan exportera/radera när som helst

---

## Support & Dokumentation

**Officiella källor:**
- [Socialstyrelsen - Specialistutbildning Ortopedi](https://www.socialstyrelsen.se/)
- [Sveriges läkarförbund - ST-läkare](https://slf.se/)

**Intern dokumentation:**
- [NEW_FEATURES.md](./NEW_FEATURES.md) - Översikt av alla v2.0 features
- [README.md](../README.md) - Huvuddokumentation

---

**Version:** 1.0
**Datum:** 2025-10-30
**Status:** ✅ MVP Implementerat
**Nästa steg:** Automatisk progress tracking & Backend integration
