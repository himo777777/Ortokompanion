# Onboarding System - OrtoKompanion

## Översikt

OrtoKompanion har nu ett komplett onboarding-system som guidar användare genom en 90-sekunders QuickStart och skapar en personaliserad 7-dagars mikroplan.

## Funktioner

### ✅ Implementerat (MVP)

#### QuickStart Onboarding (≤90 sekunder)

**5 steg:**

1. **Välj nivå** - Student, AT, ST1-ST5, Specialist
2. **Välj område** - Höft, Fot/Ankle, Handled, Skuldra, Infektion, Barn
3. **Ditt mål** - Trygg jour, Förbereda OP, Förbättra röntgen, eller eget mål
4. **Integritet & kontakt** - Samtycke (analytics, regionanpassning), påminnelser
5. **Finjustering** - 3 snabba frågor för att optimera planen

#### 7-Dagars Mikroplan

Automatiskt genererad plan baserat på användarens profil:

**Dag 1: Intro & Grundläggande**
- Mikrofall (höft/valt område)
- Beslutsträd för akut handläggning
- Clinical Pearl
- Next-day check (3 frågor)

**Dag 2: Bilddiagnostik**
- Röntgenbedömning
- Quiz om bildtolkning

**Dag 3: Operativa principer**
- Mikrofall om operationsförberedelse
- 3 MCQ om OP-principer

**Dag 4: Komplikationer**
- Alarmtecken & komplikationer
- Beslutsträd för handläggning

**Dag 5: Evidensbaserad medicin**
- Evidensruta med svenska + internationella riktlinjer

**Dag 6: Praktisk helhet**
- Mini-OSCE: 3-stegs scenario

**Dag 7: Summering**
- Veckorepetition quiz
- Självskattning & planering framåt

#### Gamification

**XP-system:**
- 5-20 XP per uppgift
- Automatisk nivåuppräkning (var 100:e XP = 1 level)

**Badges:**
- 🏅 First Call - Slutfört första jour-övningen
- 🏅 RöntgenRazor - 10 frakturer korrekt identifierade
- 🏅 Checklist Champion - Använt beslutsträd 5 gånger
- 🏅 Evidence Explorer - Läst 3 evidensrutor
- 🏅 Jourklar - Slutfört 7-dagarsplan
- 🏅 7-dagars Streak - Aktiv 7 dagar i rad

**Streak:**
- Räknas upp varje dag användaren är aktiv
- 1 "miss" per vecka tolereras

#### Next-Day Check (Dag 1)

3 frågor för att justera planen:

1. Fick du nytta av gårdagens innehåll?
2. Var nivån lagom? (Lägre/Lagom/Högre)
3. Vill du hålla samma plan?

Svaren sparas och kan användas för att justera kommande dagar.

#### Telemetri & Analytics

Event tracking med localStorage:

- `onboard_start` - Användare börjar onboarding
- `onboard_step_N` - Varje steg i onboarding
- `onboard_quickstart_complete` - Onboarding klar
- `plan_created` - 7-dagarsplan skapad
- `item_completed` - Uppgift slutförd
- `badge_earned` - Badge intjänad
- `session_start` - Ny session
- `reset_onboarding` - Användare börjar om

Alla events sparas i `localStorage` under `ortokompanion_events` (senaste 100).

#### Datalagring

All data sparas lokalt i webbläsaren:

- `ortokompanion_profile` - Användarprofil
- `ortokompanion_plan` - 7-dagarsplan
- `ortokompanion_nextday_checks` - Next-day check svar
- `ortokompanion_events` - Event tracking

**GDPR-kompatibelt:** Ingen data lämnar användarens enhet.

## Användning

### Första gången (Ny användare)

1. Användaren ser QuickStart onboarding automatiskt
2. Går igenom 5 steg (≤90 sekunder)
3. Får sin personliga 7-dagarsplan
4. Ser "Min Plan"-dashboard med dag 1 aktiv

### Återkommande användare

1. Användaren ser sin befintliga plan
2. Kan fortsätta där de slutade
3. Ser XP, level, streak i headern
4. Kan byta mellan flikar: Plan, AI-Handledare, Fallstudier, Kunskapsmoduler

### Slutföra uppgifter

1. Klicka på en uppgift i dagens plan
2. Läs/interagera med innehållet
3. Klicka "Markera som klar"
4. Får XP och eventuell badge
5. När alla dagens uppgifter är klara markeras dagen som slutförd

### Börja om

Klicka "Börja om" i headern för att rensa all data och göra onboarding igen.

## Filstruktur

```
types/
  onboarding.ts                    # TypeScript-typer för onboarding

lib/
  onboarding-utils.ts              # Hjälpfunktioner för plangenering, XP, badges

components/
  onboarding/
    QuickStart.tsx                 # 5-stegs onboarding-flöde
  dashboard/
    DayPlanView.tsx                # 7-dagars plan dashboard

app/
  page.tsx                         # Huvudsida med onboarding-integration
```

## Anpassning

### Lägg till nya områden (domains)

Redigera `types/onboarding.ts`:

```typescript
export type Domain = 'höft' | 'fot-ankle' | 'handled' | 'skuldra' | 'infektion' | 'barn' | 'DITT_NYA_OMRÅDE';

export const DOMAIN_LABELS: Record<Domain, string> = {
  // ... befintliga
  'DITT_NYA_OMRÅDE': 'Beskrivning',
};
```

Lägg till innehåll i `lib/onboarding-utils.ts`:

```typescript
function getDayOneMicrocase(domain: Domain, isAkut: boolean): string {
  const cases: Record<Domain, string> = {
    // ... befintliga
    'DITT_NYA_OMRÅDE': 'Titel på mikrofall',
  };
  return cases[domain];
}
```

### Lägg till nya badges

Redigera `types/onboarding.ts`:

```typescript
export const BADGES: Badge[] = [
  // ... befintliga
  {
    id: 'mitt-badge',
    name: 'Mitt Badge',
    description: 'Beskrivning',
    icon: '🏆',
  },
];
```

Lägg till logik i `lib/onboarding-utils.ts`:

```typescript
export function checkBadgeEarned(profile: UserProfile, action: string): string | null {
  // Din logik här
  if (villkor && !profile.gamification.badges.includes('mitt-badge')) {
    return 'mitt-badge';
  }
  return null;
}
```

### Anpassa dagars innehåll

Redigera `generateDayItems()` i `lib/onboarding-utils.ts` för att ändra vilka uppgifter som visas varje dag.

### Ändra XP-värden

Redigera `calculateXP()` i `lib/onboarding-utils.ts`:

```typescript
const xpMap: Record<string, number> = {
  'microcase': 10,  // Ändra dessa värden
  'quiz': 10,
  // ...
};
```

## Nästa steg (Backlog)

Följande features finns i specen men är inte implementerade i MVP:

- **Deep Personalization (6 min)** - Utökad onboarding med baseline-kalibrering
- **Klinik-kod integration** - För kliniker/sjukhus
- **Riktigt interaktivt innehåll** - Quiz, röntgen, mikrofall med fullt interaktiv UI
- **E-post/Push notifications** - Dagliga påminnelser
- **Progress analytics** - Visualisering av framsteg över tid
- **Adaptiv svårighetsgrad** - Automatisk justering baserat på prestanda
- **Multi-språkstöd** - Engelska etc

## Support

För frågor eller buggar, se huvuddokumentationen i [README.md](../README.md).

## Tekniska detaljer

**State management:** React hooks + localStorage
**Styling:** Tailwind CSS
**Icons:** Lucide React
**Data persistence:** localStorage (client-side only)
**TypeScript:** Fullt typad

## Exempel på användarflöde

```
1. Första besöket → QuickStart onboarding
   ↓
2. Väljer ST2, höft, "trygg jour"
   ↓
3. Aktiverar regionanpassning, väljer push-notiser
   ↓
4. Väljer akuta beslutsträd, mikrofall, daglig push
   ↓
5. 7-dagarsplan skapas automatiskt
   ↓
6. Ser Dag 1 med 4 uppgifter
   ↓
7. Slutför första mikrofallet → +10 XP
   ↓
8. Läser Clinical Pearl → +5 XP
   ↓
9. Gör beslutsträd → +5 XP
   ↓
10. Next-day check (3 frågor) → +5 XP
    ↓
11. Dag 1 klar! Badge: "First Call" 🏅
    ↓
12. Nästa dag: Fortsätter med Dag 2
```

---

**Version:** 1.0 (MVP - QuickStart)
**Datum:** 2025-10-30
**Status:** ✅ Implementerat och testat
