# Subspecialties Update - Ortokompanion

**Datum:** 2025-10-30
**Version:** 2.1

## Uppdaterade fokusområden

Systemet har uppdaterats med nya, mer specifika subspecialiteter inom ortopedi.

### Tidigare områden (6 st)
- Höft
- Fot & Fotled
- Handled
- Skuldra
- Infektion
- Barnortopedi

### Nya områden (9 st)

| ID | Namn | Beskrivning |
|----|------|-------------|
| `trauma` | **Trauma** | Multitrauma, polytrauma, ATLS-principer |
| `axel-armbåge` | **Axel & Armbåge** | Axelluxation, rotatorcuff, armbågsskador |
| `hand-handled` | **Hand & Handled** | Colles fraktur, scaphoid, karpaltunnel |
| `rygg` | **Rygg** | Ryggmärgsskada, discbråck, ländryggssmärta |
| `höft` | **Höft** | Höftfrakturer, THA, höftledsartros |
| `knä` | **Knä** | ACL-skador, meniskskador, TKA |
| `fot-fotled` | **Fot & Fotled** | Fotledsdistorsion, Ottawa Rules, fotskador |
| `sport` | **Sportmedicin** | Idrottsskador, return to play, rehabilitation |
| `tumör` | **Tumörortopedi** | Bentumörer, sarkom, metastaser |

## Filändringar

### 1. `types/onboarding.ts`

**Uppdaterad Domain type:**
```typescript
export type Domain =
  | 'trauma'
  | 'axel-armbåge'
  | 'hand-handled'
  | 'rygg'
  | 'höft'
  | 'knä'
  | 'fot-fotled'
  | 'sport'
  | 'tumör';
```

**Uppdaterad DOMAIN_LABELS:**
```typescript
export const DOMAIN_LABELS: Record<Domain, string> = {
  'trauma': 'Trauma',
  'axel-armbåge': 'Axel & Armbåge',
  'hand-handled': 'Hand & Handled',
  'rygg': 'Rygg',
  'höft': 'Höft',
  'knä': 'Knä',
  'fot-fotled': 'Fot & Fotled',
  'sport': 'Sportmedicin',
  'tumör': 'Tumörortopedi',
};
```

### 2. `lib/onboarding-utils.ts`

**Uppdaterade funktioner:**

#### `getDayOneMicrocase()`
Nya mikrofall för varje område:

- **Trauma:** Multitrauma - ATLS & Prioritering / Pelvis fraktur - Stabilisering
- **Axel/Armbåge:** Axelluxation - Handläggning / Rotatorcuff - Konservativ behandling
- **Hand/Handled:** Colles fraktur - Reposition / Karpaltunnelsyndrom - Bedömning
- **Rygg:** Ryggmärgsskada - Akut handläggning / Ländryggssmärta - Utredning
- **Höft:** Proximal femurfraktur - Triage & Smärtlindring / Elektiv THA
- **Knä:** ACL-skada - Diagnostik / TKA - Indikationer
- **Fot/Fotled:** Fotledsdistorsion - Ottawa Rules / Hälseneinflammation
- **Sport:** Idrottsskada - Akut bedömning & Return to play
- **Tumör:** Bentumör - Initial utredning

#### `getPearlForDomain()`
Nya clinical pearls:

- **Trauma:** "ATLS-principer alltid! Life before limb - stabilisera patient innan du fokuserar på extremiteter"
- **Axel/Armbåge:** "Dokumentera neurovaskulär status före och efter reposition - axillaris vid axelluxation!"
- **Hand/Handled:** "Kontrollera scaphoidfossa vid trauma även om initial röntgen är normal - gips vid misstanke"
- **Rygg:** "Red flags: progressiv neurologisk deficit, kauda equina, trauma med frakturmisstanke - akut MR!"
- **Höft:** "Alltid neurovaskulär status + adekvat smärtlindring INNAN röntgen vid höftfraktur"
- **Knä:** "Ottawa Knee Rules + Lachman test är guldstandard för ACL-bedömning på akuten"
- **Fot/Fotled:** "Ottawa Ankle Rules minskar onödiga röntgen med 30-40% utan missade frakturer"
- **Sport:** "Return to play kräver: smärtfrihet, full ROM, 90% styrka jämfört med friska sidan"
- **Tumör:** "Nattsmärta + svullnad utan trauma = bentumör tills motsatsen bevisats - MR + utredning!"

#### `getDomainName()`
Uppdaterade namn för alla områden.

### 3. `components/onboarding/QuickStart.tsx`

**Uppdaterad Step2Domain:**

```typescript
const domains: Domain[] = [
  'trauma',
  'axel-armbåge',
  'hand-handled',
  'rygg',
  'höft',
  'knä',
  'fot-fotled',
  'sport',
  'tumör'
];
```

**Layout-förbättring:**
- Ändrat från `grid-cols-2` till `grid-cols-2 md:grid-cols-3`
- Ger 3 kolumner på större skärmar (3x3 grid)
- 2 kolumner på mobil

## UI/UX Förbättringar

### Responsiv design
- **Mobil:** 2 kolumner (4-5 rader)
- **Tablet/Desktop:** 3 kolumner (3 rader)
- Snyggare layout med bättre utnyttjande av skärmutrymme

### Visuell hierarki
Områdena presenteras i logisk ordning:
1. Trauma (övergripande akut)
2. Anatomi-specifika: Axel/Armbåge → Hand/Handled → Rygg → Höft → Knä → Fot/Fotled
3. Specialiserade: Sport, Tumör

## Bakåtkompatibilitet

⚠️ **Breaking change:** Användare som har befintliga profiler med gamla områden behöver göra onboarding igen.

**Hantering:**
- Systemet kommer automatiskt be om ny onboarding om gamla domäner hittas
- localStorage rensar automatiskt vid inkompatibilitet

**För att migrera befintliga användare (framtida feature):**
```typescript
// Migration mapping
const DOMAIN_MIGRATION: Record<string, Domain> = {
  'fot-ankle': 'fot-fotled',
  'handled': 'hand-handled',
  'skuldra': 'axel-armbåge',
  'infektion': 'trauma', // Default migration
  'barn': 'trauma', // Default migration
};
```

## Testning

### Manuell testning utförd:
- ✅ Onboarding-flöde med alla nya områden
- ✅ Steg 2 visar alla 9 områden korrekt
- ✅ Val av 1-3 områden fungerar
- ✅ 7-dagars plan genereras korrekt för alla områden
- ✅ Clinical pearls visas korrekt för varje område
- ✅ Responsiv layout fungerar på olika skärmstorlekar
- ✅ Kompilering utan fel eller varningar

### Verifierad funktionalitet:
- Mikrofall för dag 1 finns för alla områden
- Clinical pearls finns för alla områden
- Domain names mappas korrekt
- UI visar rätt etiketter

## Användning

### Välja områden vid onboarding
Användaren kan nu välja från 9 specifika subspecialiteter:

1. **Trauma** - För de som jobbar med polytrauma och akut traumakirurgi
2. **Axel & Armbåge** - Övre extremitet fokus
3. **Hand & Handled** - Handkirurgi och distala övre extremitet
4. **Rygg** - Spinal kirurgi och ryggproblem
5. **Höft** - Höftkirurgi inklusive proteser
6. **Knä** - Knäkirurgi, ACL, menisk
7. **Fot & Fotled** - Undre extremitetens distala delar
8. **Sportmedicin** - Idrottsskador och rehabilitering
9. **Tumörortopedi** - Bentumörer och onkologi

### Exempel på användningsfall

**AT-läkare på jour:**
- Väljer: Trauma, Höft, Fot/Fotled
- Får akutinriktat innehåll

**ST3 med sportintresse:**
- Väljer: Sport, Knä, Axel/Armbåge
- Får sportmedicinskt fokus

**ST5 inför subspecialisering:**
- Väljer: Tumör
- Får onkologiskt ortopediskt innehåll

## Framtida utbyggnad

### Planerade tillägg per subspeciality:

**Trauma:**
- ATLS-algoritmer
- Polytrauma-protokoll
- Damage control surgery

**Axel/Armbåge:**
- Artroskopiska tekniker
- Rotatorcuff-reparation
- Instabilitetskirurgi

**Hand/Handled:**
- Nervskador
- Senrupturer
- Mikrokirurgi

**Rygg:**
- Discbråck
- Spinal stenos
- Deformitetskorrigering

**Höft:**
- THA-tekniker
- Revisionskirurgi
- Höftartroskopi

**Knä:**
- ACL-rekonstruktion
- Meniskkirurgi
- TKA-tekniker

**Fot/Fotled:**
- Fotledsartrodes
- Hallux valgus
- Achillesrupturer

**Sport:**
- Return to play-protokoll
- Prevention
- Rehabilitering

**Tumör:**
- Biopsi-tekniker
- Sarkomkirurgi
- Metastasbehandling

---

**Status:** ✅ Implementerat och testat
**Kompileringar:** ✅ Utan fel
**Breaking changes:** ⚠️ Ja (gamla profiler behöver ny onboarding)
