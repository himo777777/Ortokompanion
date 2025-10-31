# Nya Funktioner i Ortokompanion v2.0

Senast uppdaterad: 2025-10-30

## 🚀 Nya features implementerade

### 0. Socialstyrelsen Integration ⭐ NYA!

Fullständig integration med Socialstyrelsens officiella utbildningsmål för läkare.

#### **Omfattning**
- **Läkarprogrammet** - 5 grundläggande mål för läkarstudenter
- **AT (Allmäntjänstgöring)** - 5 mål för AT-läkare
- **ST Ortopedi** - 20 mål fördelade över 5 år (4 mål/år)

#### **GoalProgressTracker Component**
- Visar alla relevanta mål för användarens nivå
- Interaktiv expandering för bedömningskriterier
- Klickbara kriterier för progress tracking
- Filtrering per kompetensområde (6 områden)
- Automatisk sparning till localStorage
- Progress visualization med färgkodade progress bars
- Evidence counter för varje mål

#### **Analytics Integration**
- Ny sektion i Analytics Dashboard
- Övergripande progress percentage
- Breakdown per kompetensområde
- Senaste aktivitet feed
- Direct link till full målsida

#### **Goals Page** (`/goals`)
- Dedikerad sida för målhantering
- Nivåväljare (Student/AT/ST1-ST5)
- Option att visa tidigare års mål för ST-läkare
- Informationsbox om Socialstyrelsens mål
- Responsiv design

#### **Content Linking**
Allt lärande content kan nu kopplas till Socialstyrelsen mål:
- PlanItem (7-dagarsplan)
- ClinicalPearl
- CaseVignette
- AdaptiveQuestion
- Flashcard

Varje content-typ har nu ett `relatedGoals?: string[]` fält.

**Filer:**
- `data/socialstyrelsen-goals.ts` - Alla mål och utility functions
- `components/learning/GoalProgressTracker.tsx` - Huvudkomponent
- `app/goals/page.tsx` - Målsida
- `types/learning.ts` - Uppdaterade typer
- `types/onboarding.ts` - Uppdaterade typer

**Dokumentation:** Se [SOCIALSTYRELSEN_INTEGRATION.md](./SOCIALSTYRELSEN_INTEGRATION.md)

---

### 1. Daily Learning Session (10 minuter)

Ett strukturerat dagligt lärande uppdelat i 3 faser:

#### **READ (2-3 minuter)**
- Clinical Pearls - kortfattade kliniska tips
- Case Vignettes - korta patientfall
- Visuell timer
- Tydliga learning points

#### **QUIZ (3-4 minuter)**
- 3 adaptiva frågor
- Omedelbar feedback
- Förklaringar för varje fråga
- Progressbar som visar framsteg

#### **REVIEW (2-3 minuter)**
- 3-5 flashcards per session
- Interaktiv flip-funktion
- "Mastered" vs "Repetera senare"
- Spaced repetition (planerat för framtiden)

#### **SUMMARY (1 minut)**
- XP earned visualization
- Streak day counter
- Accuracy score
- Time spent
- Key insight
- Perfect day bonus

**Fil:** `components/learning/DailySession.tsx`

---

### 2. Visual Learning Roadmap

#### **Foundation → Intermediate → Advanced → Mastery**

Varje subspecialty (Höft, Knä, etc.) har sin egen visuella lärväg:

- **4 huvudstadier** med olika färgkodning
- **Progress tracking** för varje topic
- **Unlocking system** - måste slutföra tidigare stadier
- **Subtopics** med individuell tracking
- **Klickbara topics** med detaljerad information

**Färgkodning:**
- 🟢 Foundation - Grön
- 🔵 Intermediate - Blå
- 🟣 Advanced - Lila
- 🟡 Mastery - Gul

**Fil:** `components/learning/LearningRoadmap.tsx`

---

### 3. Förbättrad Analytics Dashboard

#### **Veckoöversikt**
- Sessioner slutförda (6/7)
- XP tjänad denna vecka
- Genomsnittlig accuracy
- Total tid spenderad
- Visual progress bar

#### **Precision & Träffsäkerhet**
- Övergripande accuracy
- Accuracy per svårighetsgrad (Easy/Medium/Hard)
- Accuracy per subspecialty
- Trend-indikator (Improving/Stable/Declining)

#### **Streak Information**
- Current streak
- Longest streak
- ❄️ Freeze tokens (för att behålla streak om man missar en dag)
- Visual flame icon

#### **Ämneskunskaper (Topic Mastery)**
- Mastery level per topic (0-100%)
- Accuracy per topic
- Antal frågor besvarade
- Progress bars

**Fil:** `components/analytics/AnalyticsDashboard.tsx`

---

### 4. Leaderboard System

#### **Tre typer av leaderboards:**
- **Global** - Alla användare
- **Subspecialty** - Bara ditt fokusområde
- **Peers** - Dina kollegor/klinik

#### **Fyra tidsperioder:**
- **Daily** - Dagens topplista
- **Weekly** - Veckans topplista
- **Monthly** - Månadens topplista
- **All-time** - Övergripande rankning

#### **Rankningar visar:**
- Placering (#1, #2, #3 + ikoner för topp 3)
- Level
- Total XP
- Current streak
- Subspecialty

#### **Din placering**
- Highlighted card med din rank
- Easy att se hur långt till nästa position

**Fil:** `components/community/Leaderboard.tsx`

---

### 5. Gamification Enhancements

#### **Freeze Tokens** ❄️
- Earn 1 freeze token per 7-day streak
- Use to protect your streak if you miss a day
- Max 3 freeze tokens
- Visual indicator in UI

#### **Perfect Day Bonus** 🌟
- Earn extra XP for 100% quiz accuracy + all flashcards mastered
- Special celebration in summary screen
- Badge awarded

#### **Streak Milestones**
- Day 7: First week badge
- Day 30: Month warrior badge
- Day 100: Century club badge
- Day 365: Year champion badge

---

### 6. Datamodeller

Nya TypeScript-typer i `types/learning.ts`:

```typescript
// Learning Session
- LearningSession
- ReadPhase (ClinicalPearl, CaseVignette)
- QuizPhase (AdaptiveQuestion)
- ReviewPhase (Flashcard)
- SessionSummary

// Roadmap
- LearningRoadmap
- RoadmapStage (foundation/intermediate/advanced/mastery)
- Topic & Subtopic

// Analytics
- UserAnalytics
- WeeklyStats
- AccuracyStats
- StreakInfo
- TopicMastery

// Leaderboard
- Leaderboard
- LeaderboardEntry

// Community (planerat)
- CasePost
- Comment

// Placement Quiz (planerat)
- PlacementQuiz
- PlacementQuestion
- PlacementResult
```

---

## 🎯 Användningsguide

### Starta en Daily Learning Session

```typescript
import DailySession from '@/components/learning/DailySession';

<DailySession
  onComplete={(summary) => {
    console.log('Session klar!', summary);
    // Uppdatera user profile med XP, streak, etc.
  }}
/>
```

### Visa Learning Roadmap

```typescript
import VisualRoadmap from '@/components/learning/LearningRoadmap';

<VisualRoadmap subspecialty="Höft" />
```

### Visa Analytics Dashboard

```typescript
import AnalyticsDashboard, { generateMockAnalytics } from '@/components/analytics/AnalyticsDashboard';

const analytics = generateMockAnalytics(); // eller hämta från din backend

<AnalyticsDashboard analytics={analytics} />
```

### Visa Leaderboard

```typescript
import LeaderboardComponent from '@/components/community/Leaderboard';

<LeaderboardComponent />
```

---

## 📊 Integration med befintligt system

De nya funktionerna kompletterar det befintliga onboarding-systemet:

1. **Efter onboarding** → User får sin första Daily Learning Session
2. **Slutförd session** → XP läggs till i gamification-systemet
3. **Progress tracking** → Uppdaterar både 7-dagarsplanen och roadmap
4. **Analytics** → Visar data från alla aktiviteter
5. **Leaderboard** → Rankar baserat på total XP och streak

---

## 🔜 Kommande features (Backlog)

### Placement Quiz
- Optional quiz vid onboarding
- 10-15 frågor för att bedöma kunskapsnivå
- Anpassar svårighetsgrad automatiskt
- Rekommenderar startpunkt på roadmap

### Spaced Repetition för Flashcards
- Algoritm för optimal repetition
- Automatiska påminnelser
- Anpassad till varje användares inlärningskurva

### Community Case Feed (Full version)
- Post anonymiserade cases
- Kommentera och diskutera
- Mark helpful replies
- Trending cases
- Filter per subspecialty

### Advanced Analytics
- Learning velocity graphs
- Prediction of mastery timeline
- Weak points identification
- Personalized recommendations

### Social Features
- Follow other residents
- Study groups
- Challenges and competitions
- Shared learning goals

---

## 🛠️ Tekniska detaljer

### State Management
- React hooks för komponentstate
- localStorage för persistence
- Planerat: Redux eller Zustand för global state

### Data Persistence
- localStorage för client-side data
- Mock data för demo
- Planerat: Backend API integration

### Performance
- Lazy loading av komponenter
- Optimerad rendering
- Minimal re-renders

### Styling
- Tailwind CSS för all styling
- Responsiv design (mobil, tablet, desktop)
- Dark mode (planerat)

---

## 📝 Exempel på komplett user journey

```
DAG 1:
1. User slutför onboarding (90 sek)
2. Ser sin 7-dagarsplan
3. Startar dagens Daily Learning Session
4. READ: Läser om Ottawa Ankle Rules (3 min)
5. QUIZ: Svarar på 3 frågor (95% accuracy)
6. REVIEW: Går igenom 5 flashcards (4 mastered)
7. SUMMARY: Tjänar 35 XP, ser streak day 1
8. Plan uppdaterad: Dag 1 markerad som slutförd

DAG 2-7:
- Fortsätter med dagliga sessioner
- Progress syns i roadmap
- Accuracy tracked i analytics
- Streak ökar varje dag

VECKA 2:
- Ser sin veckoöversikt i Analytics
- Jämför sig på Leaderboard
- Fortsätter till Intermediate stage på roadmap
- Får första Freeze Token efter 7-dagars streak
```

---

## 🤝 Bidra

För att lägga till nya features:

1. Skapa nya komponenter i rätt mapp
2. Uppdatera `types/learning.ts` om nya datatyper behövs
3. Testa lokalt
4. Uppdatera denna dokumentation

---

**Version:** 2.0
**Datum:** 2025-10-30
**Status:** ✅ MVP Implementerat
