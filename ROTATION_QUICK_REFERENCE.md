# Rotation System - Snabbreferens

**Quick lookup guide för OrtoKompanion Rotation System**

---

## Snabb Översikt

| Komponent | Fil | Syfte |
|-----------|-----|-------|
| **Rotation Types** | `types/rotation.ts` | Rotation, RotationTimeline, OrthoPlacement |
| **Goal Assignment** | `lib/goal-assignment.ts` | Auto-tilldelning av Socialstyrelsen-mål |
| **Progress Tracking** | `lib/rotation-tracker.ts` | Beräkna framsteg, prediktera completion |
| **Content Adaptation** | `lib/ai-content-adapter.ts` | AI-driven innehållsfiltrering |
| **Recommendations** | `lib/recommendation-engine.ts` | Urgensbaserade rekommendationer |
| **Dashboard UI** | `components/rotation/RotationDashboard.tsx` | Visa rotation progress |
| **Manager UI** | `components/rotation/RotationManager.tsx` | Lägg till/redigera rotationer |
| **Onboarding** | `components/onboarding/RotationSetup.tsx` | Setup vid onboarding |

---

## Vanliga Operationer

### Hämta Nuvarande Rotation

```typescript
import { getCurrentRotation } from '@/types/rotation';

const currentRotation = getCurrentRotation(profile.rotationTimeline);

if (currentRotation) {
  console.log(`Nuvarande: ${currentRotation.domain}`);
  console.log(`Dagar kvar: ${getDaysRemaining(currentRotation)}`);
}
```

### Beräkna Progress

```typescript
import { calculateRotationProgress } from '@/lib/rotation-tracker';

const progress = calculateRotationProgress(rotation, activityLog);

console.log(`Mål klara: ${progress.goalsCompleted.length}/${progress.totalGoals}`);
console.log(`Träffsäkerhet: ${progress.accuracy}%`);
console.log(`On track: ${progress.onTrack}`);
```

### Auto-Tilldela Mål

```typescript
import { autoAssignGoals } from '@/lib/goal-assignment';

const goalIds = autoAssignGoals(profile);
console.log(`Tilldelade ${goalIds.length} mål`);
```

### Generera Rekommendationer

```typescript
import { generateRecommendations } from '@/lib/recommendation-engine';

const recommendations = generateRecommendations({
  profile,
  timeOfDay: 'morning',
  activityLog,
  completedGoalIds
});

recommendations.forEach(rec => {
  console.log(`[${rec.priority}] ${rec.title}`);
});
```

### Skapa Ny Rotation

```typescript
const newRotation: Rotation = {
  id: `rot-${Date.now()}`,
  domain: 'knä',
  startDate: new Date('2025-03-01'),
  endDate: new Date('2025-07-31'),
  status: getRotationStatus(startDate, endDate),
  goals: autoAssignGoals({ ...profile, /* mock rotation */ }),
  progress: 0,
  hospital: 'Karolinska'
};

profile.rotationTimeline.rotations.push(newRotation);
```

---

## Urgency Levels

| Dagar Kvar | Urgency | Färg | Dagligt Mål |
|------------|---------|------|-------------|
| < 7 | Critical | 🔴 Red | 15+ frågor |
| < 30 | High | 🟠 Orange | 10 frågor |
| < 60 | Medium | 🟡 Yellow | 8 frågor |
| ≥ 60 | Low | 🟢 Green | 5 frågor |

---

## Goal Completion Kriterier

Ett mål räknas som **slutfört** när:
- ✅ Minst **3 frågor** besvarade för målet
- ✅ **≥70% träffsäkerhet** på mål-relaterade frågor

Exempel:
```typescript
// MÅL KLART:
{
  goalId: 'st2-trauma-01',
  questionsAnswered: 5,
  correctAnswers: 4,
  accuracy: 80% // ✓ >= 70%
}

// MÅL INTE KLART (för få frågor):
{
  goalId: 'st2-trauma-02',
  questionsAnswered: 2, // ✗ < 3
  correctAnswers: 2,
  accuracy: 100%
}

// MÅL INTE KLART (för låg träffsäkerhet):
{
  goalId: 'st2-trauma-03',
  questionsAnswered: 5,
  correctAnswers: 3,
  accuracy: 60% // ✗ < 70%
}
```

---

## Rotation Status

| Status | Beskrivning | Beräkning |
|--------|-------------|-----------|
| **upcoming** | Ej startad | `now < startDate` |
| **current** | Pågående | `startDate <= now <= endDate` |
| **completed** | Slutförd | `now > endDate` |

```typescript
function getRotationStatus(startDate: Date, endDate: Date): RotationStatus {
  const now = new Date();
  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'completed';
  return 'current';
}
```

---

## User Type Routing

```typescript
function determineRotationType(profile: UserProfile): string {
  // ST-Ortopedi
  if (profile.role.match(/^st[1-5]$/)) {
    return 'RotationTimeline'; // Flera rotationer
  }

  // ST-Other (Allmänmedicin, Akutsjukvård)
  if (profile.role === 'st-allmänmedicin' || profile.role === 'st-akutsjukvård') {
    return 'OrthoPlacement'; // En placering
  }

  // Student/AT
  if (profile.role === 'student' || profile.role === 'at') {
    return 'PlacementTiming'; // Timing-baserad
  }

  // Specialist
  if (profile.role.startsWith('specialist')) {
    return 'Fortbildning'; // Continuing education
  }

  return 'None';
}
```

---

## Troubleshooting

### Problem: "Ingen aktiv rotation visas"

**Orsak:** Alla rotationer är upcoming eller completed

**Lösning:**
```typescript
const current = getCurrentRotation(profile.rotationTimeline);
if (!current) {
  console.log('Ingen current rotation');
  const upcoming = profile.rotationTimeline.rotations
    .filter(r => r.status === 'upcoming')
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0];

  if (upcoming) {
    console.log(`Nästa rotation: ${upcoming.domain} startar ${upcoming.startDate}`);
  }
}
```

---

### Problem: "Progress uppdateras inte"

**Kontrollera:**
1. Är activity log items länkade till rätt `rotationId`?
2. Har activities `goalIds` satta?
3. Är memoization cached med gamla värden?

**Debug:**
```typescript
const rotationActivities = activityLog.filter(a => a.rotationId === rotation.id);
console.log(`${rotationActivities.length} activities för rotation ${rotation.id}`);

rotationActivities.forEach(a => {
  console.log(`Activity: ${a.questionId}, Goals: ${a.goalIds?.join(', ')}`);
});
```

---

### Problem: "Fel mål tilldelas"

**Orsak:** Domain keywords matchar inte goal titles/descriptions

**Lösning:** Uppdatera keywords i `lib/goal-assignment.ts`
```typescript
const domainKeywords: Record<Domain, string[]> = {
  'knä': ['knä', 'TKA', 'menisk', 'ligament', 'artroskopi', 'korsbandsskada'],
  // Lägg till fler keywords här ↑
};
```

**Verifiera:**
```typescript
const goals = getAllMål();
const keywords = domainKeywords['knä'];

goals.forEach(goal => {
  const searchText = `${goal.title} ${goal.description}`.toLowerCase();
  const matches = keywords.some(kw => searchText.includes(kw));

  if (matches) {
    console.log(`✓ ${goal.id}: ${goal.title}`);
  }
});
```

---

### Problem: "Urgency färger fel"

**Kontrollera threshold values:**
```typescript
// RotationDashboard.tsx
const urgency = daysRemaining < 7 ? 'critical'
  : daysRemaining < 30 ? 'high'
  : daysRemaining < 60 ? 'medium'
  : 'low';

console.log(`Dagar kvar: ${daysRemaining}, Urgency: ${urgency}`);
```

**Verifiera färgschema:**
```typescript
const urgencyColors = {
  critical: 'border-red-500 bg-red-50',
  high: 'border-orange-500 bg-orange-50',
  medium: 'border-yellow-500 bg-yellow-50',
  low: 'border-green-500 bg-green-50',
};
```

---

## API Reference

### Types

```typescript
// Rotation
interface Rotation {
  id: string;
  domain: Domain;
  startDate: Date;
  endDate: Date;
  status: 'current' | 'upcoming' | 'completed';
  goals: string[];
  progress: number;
  hospital?: string;
  supervisor?: string;
  notes?: string;
}

// RotationTimeline
interface RotationTimeline {
  rotations: Rotation[];
  currentRotationId?: string;
}

// RotationActivityLog
interface RotationActivityLog {
  id: string;
  rotationId: string;
  questionId: string;
  domain: Domain;
  correct: boolean;
  hintsUsed: number;
  timeSpent: number;
  timestamp: Date;
  goalIds?: string[];
}

// RotationProgress
interface RotationProgress {
  rotationId: string;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  goalsCompleted: string[];
  totalGoals: number;
  completionPercentage: number;
  daysRemaining: number;
  onTrack: boolean;
  recommendation: string;
}
```

### Functions

#### `getCurrentRotation(timeline: RotationTimeline): Rotation | null`
Returnerar den aktiva rotationen, eller null om ingen är aktiv.

#### `getDaysRemaining(rotation: Rotation | OrthoPlacement): number`
Beräknar antal dagar kvar (0 om redan slutförd).

#### `getRotationDuration(rotation: Rotation | OrthoPlacement): number`
Total längd av rotation i dagar.

#### `getRotationStatus(startDate: Date, endDate: Date): RotationStatus`
Auto-beräknar status baserat på datum.

#### `autoAssignGoals(profile: UserProfile): string[]`
Auto-tilldelar Socialstyrelsen-mål baserat på användartyp och rotation.

#### `assignGoalsForRotation(rotation: Rotation, level: EducationLevel): string[]`
Tilldelar mål för specifik rotation baserat på domän-keywords.

#### `calculateRotationProgress(rotation: Rotation, log: RotationActivityLog[]): RotationProgress`
Beräknar fullständig rotation progress.

#### `predictRotationCompletion(rotation: Rotation, progress: RotationProgress)`
Förutsäger om användaren hinner klara rotationen.

Returns:
```typescript
{
  willComplete: boolean;
  requiredDailyActivities: number;
  projectedCompletion: number;
}
```

#### `adaptContentForUser(context: ContentAdaptationContext, questions: MCQQuestion[]): AdaptedContentRecommendation`
AI-driven innehållsanpassning baserat på rotation/placement.

#### `generateRecommendations(context: RecommendationContext): StudyRecommendation[]`
Genererar top 5 rekommendationer med rotation-awareness.

---

## Testing Snippets

### Test Rotation Creation

```typescript
import { describe, it, expect } from '@jest/globals';
import { getRotationStatus, getDaysRemaining } from '@/types/rotation';

describe('Rotation Status', () => {
  it('should return "current" for ongoing rotation', () => {
    const start = new Date('2025-01-01');
    const end = new Date('2025-12-31');
    const status = getRotationStatus(start, end);
    expect(status).toBe('current');
  });

  it('should return "completed" for past rotation', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-06-30');
    const status = getRotationStatus(start, end);
    expect(status).toBe('completed');
  });
});
```

### Test Progress Calculation

```typescript
describe('Progress Calculation', () => {
  it('should mark goal as completed with 3+ correct answers at 70%+', () => {
    const rotation: Rotation = {
      id: 'rot-1',
      domain: 'trauma',
      goals: ['goal-1'],
      // ...
    };

    const activityLog: RotationActivityLog[] = [
      { rotationId: 'rot-1', correct: true, goalIds: ['goal-1'], /* ... */ },
      { rotationId: 'rot-1', correct: true, goalIds: ['goal-1'], /* ... */ },
      { rotationId: 'rot-1', correct: true, goalIds: ['goal-1'], /* ... */ },
      { rotationId: 'rot-1', correct: false, goalIds: ['goal-1'], /* ... */ },
    ];

    const progress = calculateRotationProgress(rotation, activityLog);

    expect(progress.goalsCompleted).toContain('goal-1');
    expect(progress.completionPercentage).toBe(100);
  });
});
```

### Test Goal Assignment

```typescript
describe('Goal Assignment', () => {
  it('should assign trauma goals for trauma rotation', () => {
    const rotation: Rotation = {
      id: 'rot-1',
      domain: 'trauma',
      // ...
    };

    const goals = assignGoalsForRotation(rotation, 'st2');

    expect(goals.length).toBeGreaterThan(0);
    expect(goals.length).toBeLessThanOrEqual(8);

    // Should contain trauma-related keywords
    const allGoals = getAllMål();
    const assignedGoals = allGoals.filter(g => goals.includes(g.id));
    const traumaRelated = assignedGoals.some(g =>
      g.title.toLowerCase().includes('trauma') ||
      g.description?.toLowerCase().includes('fraktur')
    );

    expect(traumaRelated).toBe(true);
  });
});
```

---

## Performance Tips

### 1. Memoize Progress Calculations

```typescript
import { useMemo } from 'react';

const progress = useMemo(
  () => calculateRotationProgress(rotation, activityLog),
  [rotation.id, activityLog.length]
);
```

### 2. Cache in Profile

```typescript
interface Rotation {
  // ...
  cachedProgress?: {
    value: RotationProgress;
    lastCalculated: Date;
    activityCount: number;
  };
}

function getCachedProgress(rotation: Rotation, log: RotationActivityLog[]) {
  const currentCount = log.filter(a => a.rotationId === rotation.id).length;

  if (
    rotation.cachedProgress &&
    rotation.cachedProgress.activityCount === currentCount
  ) {
    return rotation.cachedProgress.value;
  }

  const progress = calculateRotationProgress(rotation, log);
  rotation.cachedProgress = {
    value: progress,
    lastCalculated: new Date(),
    activityCount: currentCount
  };

  return progress;
}
```

### 3. Debounce Dashboard Updates

```typescript
import { debounce } from 'lodash';

const updateProgress = debounce(() => {
  const progress = calculateRotationProgress(rotation, activityLog);
  setProgress(progress);
}, 500);

useEffect(() => {
  updateProgress();
}, [activityLog.length]);
```

---

## Common Patterns

### Pattern: Check if User Has Active Rotation

```typescript
function hasActiveRotation(profile: UserProfile): boolean {
  if (!profile.rotationTimeline) return false;

  const current = getCurrentRotation(profile.rotationTimeline);
  return current !== null;
}
```

### Pattern: Get Next Upcoming Rotation

```typescript
function getNextRotation(timeline: RotationTimeline): Rotation | null {
  return timeline.rotations
    .filter(r => r.status === 'upcoming')
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0] || null;
}
```

### Pattern: Get All Completed Rotations

```typescript
function getCompletedRotations(timeline: RotationTimeline): Rotation[] {
  return timeline.rotations
    .filter(r => r.status === 'completed')
    .sort((a, b) => b.endDate.getTime() - a.endDate.getTime()); // Newest first
}
```

### Pattern: Calculate Total Questions Answered Across All Rotations

```typescript
function getTotalQuestions(timeline: RotationTimeline, log: RotationActivityLog[]): number {
  return timeline.rotations.reduce((total, rotation) => {
    const rotationActivities = log.filter(a => a.rotationId === rotation.id);
    return total + rotationActivities.length;
  }, 0);
}
```

### Pattern: Export Rotation Summary

```typescript
function exportRotationSummary(rotation: Rotation, log: RotationActivityLog[]): string {
  const progress = calculateRotationProgress(rotation, log);

  return `
# Rotation Summary: ${DOMAIN_LABELS[rotation.domain]}

**Period:** ${rotation.startDate.toLocaleDateString()} - ${rotation.endDate.toLocaleDateString()}
**Hospital:** ${rotation.hospital || 'N/A'}
**Supervisor:** ${rotation.supervisor || 'N/A'}

## Progress
- Questions Answered: ${progress.questionsAnswered}
- Accuracy: ${Math.round(progress.accuracy)}%
- Goals Completed: ${progress.goalsCompleted.length}/${progress.totalGoals}
- Final Completion: ${Math.round(progress.completionPercentage)}%

## Goals
${rotation.goals.map(goalId => {
  const goal = getAllMål().find(g => g.id === goalId);
  const completed = progress.goalsCompleted.includes(goalId);
  return `- [${completed ? 'x' : ' '}] ${goal?.title || goalId}`;
}).join('\n')}

---
Generated on ${new Date().toLocaleDateString()}
  `.trim();
}
```

---

## Cheat Sheet

| Task | Code |
|------|------|
| Get current rotation | `getCurrentRotation(profile.rotationTimeline)` |
| Days remaining | `getDaysRemaining(rotation)` |
| Auto-assign goals | `autoAssignGoals(profile)` |
| Calculate progress | `calculateRotationProgress(rotation, log)` |
| Predict completion | `predictRotationCompletion(rotation, progress)` |
| Generate recommendations | `generateRecommendations(context)` |
| Check if active | `getCurrentRotation(timeline) !== null` |
| Get next rotation | `timeline.rotations.filter(r => r.status === 'upcoming')[0]` |
| Filter by domain | `questions.filter(q => q.domain === rotation.domain)` |
| Urgency level | `days < 7 ? 'critical' : days < 30 ? 'high' : 'medium'` |

---

**För fullständig dokumentation, se:** [ROTATION_SYSTEM_QA.md](ROTATION_SYSTEM_QA.md)

**Version:** 1.0
**Senast uppdaterad:** 2025-11-01
