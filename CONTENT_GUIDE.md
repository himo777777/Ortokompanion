# OrtoKompanion - Innehållsguide

## Kvalitetskrav för Allt Innehåll

Alla frågor, fall och kliniska pärlor i OrtoKompanion måste uppfylla följande krav:

### 1. Evidensbasering
- **ALLA** frågor måste ha verifierade referenser
- Använd primärt källor från 2020 eller senare
- Prioritera i denna ordning:
  1. Svenska nationella riktlinjer (Socialstyrelsen, SVORF)
  2. Svenska kvalitetsregister (Rikshöft, Riksknä)
  3. Internationella guidelines (NICE, AAOS, BOA)
  4. Peer-reviewed läroböcker (Campbell, Rockwood, Green)

### 2. Källverifiering
Innan du använder en källa, verifiera:
- ✅ Finns i `data/verified-sources.ts`
- ✅ `verificationStatus: 'verified'`
- ✅ Inte passerat `expirationDate`
- ✅ `lastVerified` inom senaste året

**Verktyg**: Kör `lib/content-validation.ts` för att kontrollera källor

### 3. Frågestruktur

#### Obligatoriska Fält
```typescript
{
  id: string;              // Format: "domain-###"
  domain: Domain;          // En av 9 domäner
  level: EducationLevel;   // student, at, st1, st2, specialist
  band: DifficultyBand;    // A, B, C, D, E
  question: string;        // Kliniskt scenario
  options: string[];       // 4 alternativ
  correctAnswer: string;   // Exakt match med ett option
  explanation: string;     // Omfattande förklaring
  competency: string;      // En av 6 kärnkompetenser
  tags: string[];         // 3-5 relevanta taggar
  references: string[];    // Minst 1, helst 2-3
}
```

#### Starkt Rekommenderat
```typescript
{
  relatedGoals?: string[];  // Socialstyrelsen specialiseringsmål
  tutorMode?: {
    hints: [string, string, string];    // 3 progressiva ledtrådar
    commonMistakes?: string[];          // Varför fel svar väljs
    teachingPoints?: string[];          // Viktiga koncept att minnas
    mnemonicOrTrick?: string;          // Minnesregel
  }
}
```

### 4. Band och Nivå Distribution

**Optimal fördelning för 50 frågor per domän:**

| Band | Antal | % | Fokus |
|------|-------|---|-------|
| A | 12-13 | 25% | Grundläggande faktakunskap |
| B | 15 | 30% | Tillämpning av kärnkunskap |
| C | 12-13 | 25% | Klinisk problemlösning |
| D | 7-8 | 15% | Komplicerade fall, komplikationer |
| E | 2-3 | 5% | Expertnivå, ovanliga situationer |

| Nivå | Antal | % | Fokus |
|------|-------|---|-------|
| student | 10 | 20% | Grundläggande anatomi, fysiologi |
| at | 12-13 | 25% | Klinisk handläggning, riktlinjer |
| st1 | 12-13 | 25% | Behandlingsval, komplikationer |
| st2 | 10 | 20% | Avancerad kirurgi, revision |
| specialist | 5 | 10% | Sällsynta tillstånd, forskning |

**Verktyg**: `suggestOptimalDistribution(50)` i `lib/content-validation.ts`

### 5. Skriv Högkvalitativa Frågor

#### ✅ BRA Exempel
```typescript
{
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
  tutorMode: {
    hints: [
      'Titta på CRP och SR - är de förhöjda eller normala?',
      'DeLee-Charnley används för att beskriva zoner runt acetabulum',
      'Radiolucent zon >2mm talar för lösning',
    ],
    commonMistakes: [
      'Missuppfatta normala infektionsmarkörer som uteslutande infektion (10-20% PPI har normal CRP)',
      'Glömma att aseptisk lösning är vanligaste revisionorsaken enligt svenska registret',
      'Inte känna till DeLee-Charnley klassificering',
    ],
    teachingPoints: [
      'Aseptisk lösning: smärta + radiolucent zon >2mm + normala infektionsmarkörer',
      'DeLee-Charnley: Zon 1 (cranial), 2 (anterior/posterior), 3 (caudal)',
      'Svenska registret följer alla revisionsorsaker - aseptisk lösning 35-45%',
      'Vid tveksamhet: ledpunktion för odling och LP-analys',
    ],
    mnemonicOrTrick: 'DeLee 1-2-3 = Cranial-Mitten-Caudal (som en sandklocka)',
  },
}
```

#### ❌ DÅLIGT Exempel
```typescript
{
  id: 'hoeft-bad',
  domain: 'höft',
  level: 'at',
  band: 'B',
  question: 'Vad är Garden klassifikation?',  // ❌ För vag
  options: [
    'En klassifikation',  // ❌ Meningslösa alternativ
    'För frakturer',
    'I höften',
    'Garden I-IV',
  ],
  correctAnswer: 'Garden I-IV',  // ❌ Inget kliniskt sammanhang
  explanation: 'Garden klassificering används för höftfrakturer.',  // ❌ För kort
  competency: 'medicinsk-kunskap',
  tags: ['höft'],  // ❌ För få taggar
  references: [],  // ❌ SAKNAR REFERENSER!
}
```

### 6. TutorMode - Best Practices

#### Hints (3 progressiva ledtrådar)
1. **Första hinten**: Generell riktning utan att ge bort svaret
   - "Tänk på patientens ålder och aktivitetsnivå"
2. **Andra hinten**: Mer specifik information
   - "Svenska kvalitetsregister visar att X är vanligaste..."
3. **Tredje hinten**: Nästan ger svaret
   - "NICE-riktlinjen 2023 rekommenderar Y vid denna situation"

#### Common Mistakes
Förklara VARFÖR fel svar är lockande:
```typescript
commonMistakes: [
  'Välja operation A för att det är "vanligast" - men inte rätt för denna åldersgrupp',
  'Missa att patienten har kontraindikation X',
  'Glömma svenska registerdatan som visar att...',
]
```

#### Teaching Points
3-5 nyckelpunkter att komma ihåg:
```typescript
teachingPoints: [
  'Garden I-II = odislokerade frakturer, ofta stabil',
  'Garden III-IV = dislokerade, hög risk AVN',
  'Ålder <70: fixation, >70: protes (riktlinje)',
  'Svenska Höftregistret visar 90-dagars mortalitet 10-15%',
]
```

### 7. Referenser - Best Practices

#### Prioritering av Källor
1. **Nationella riktlinjer** (högst prioritet)
   ```typescript
   references: ['socialstyrelsen-2024', 'svorf-guideline-2023']
   ```

2. **Svenska kvalitetsregister**
   ```typescript
   references: ['rikshoft-2024', 'rikskna-2024']
   ```

3. **Internationella guidelines**
   ```typescript
   references: ['nice-hip-fracture-2023', 'aaos-acl-2022']
   ```

4. **Klassiska klassifikationer**
   ```typescript
   references: ['garden-1961', 'gustilo-1976', 'weber-1972']
   ```

5. **Läroböcker** (senaste utgåvan)
   ```typescript
   references: ['campbell-13ed', 'rockwood-9ed']
   ```

#### Lägg Till Nya Källor
1. Lägg till i `data/verified-sources.ts`:
```typescript
'svorf-artros-2024': {
  id: 'svorf-artros-2024',
  type: 'clinical-guideline',
  title: 'Nationella riktlinjer för behandling av artros',
  author: 'SVORF',
  year: 2024,
  url: 'https://svorf.se/riktlinjer/artros',
  verificationStatus: 'verified',
  lastVerified: createDate(2024, 11, 15),
  verifiedBy: 'Human',
  publicationDate: createDate(2024, 3, 1),
  expirationDate: createDate(2027, 3, 1),
  updateFrequency: 'triannual',
  evidenceLevel: '1A',
  reliability: 98,
}
```

2. Referera i frågor:
```typescript
references: ['svorf-artros-2024', 'rikshoft-2024']
```

### 8. Validering och Kvalitetskontroll

#### Innan du lägger till frågor
```typescript
import { validateQuestion, generateQualityReport } from '@/lib/content-validation';

// Validera en fråga
const result = validateQuestion(myQuestion);
if (!result.valid) {
  console.error('Errors:', result.errors);
}

// Generera kvalitetsrapport för domän
const report = generateQualityReport(HOEFT_QUESTIONS, 'höft');
console.log(`Quality Score: ${report.qualityScore}/100`);
```

#### Kvalitetsmål
- ✅ Alla frågor: 100% giltiga referenser
- ✅ Minst 80% har TutorMode-data
- ✅ Ingen expired källa används
- ✅ Quality Score > 85 för varje domän

### 9. Workflow för Nya Frågor

```bash
1. Identifiera gap i domän (kör quality report)
2. Välj band och nivå baserat på optimal distribution
3. Identifiera relevant källa (senaste riktlinje/registret)
4. Skriv kliniskt scenario med källan i åtanke
5. Skriv 4 alternativ (1 rätt, 3 plausibla distraktorer)
6. Skriv omfattande explanation med källa
7. Lägg till TutorMode (3 hints, mistakes, teaching points)
8. Validera frågan (validateQuestion)
9. Commit med tydligt meddelande
```

### 10. Underhåll och Uppdatering

#### Månadsvis
- [ ] Kör `checkSourcesNeedingUpdate()`
- [ ] Uppdatera källor som snart går ut
- [ ] Granska frågor med expirande referenser

#### Kvartalsvis
- [ ] Granska alla quality reports per domän
- [ ] Fyll i gap i band/level distribution
- [ ] Lägg till nya TutorMode-data där det saknas

#### Årligen
- [ ] Uppdatera alla källor till senaste versionen
- [ ] Granska alla frågor mot nya riktlinjer
- [ ] Expandera innehåll till minst 50 frågor/domän

## Verktyg och Scripts

### Generera Quality Report
```typescript
import { generateQualityReport } from '@/lib/content-validation';
import { HOEFT_QUESTIONS } from '@/data/questions';

const report = generateQualityReport(HOEFT_QUESTIONS, 'höft');
console.log(report);
```

### Kontrollera Källor
```typescript
import { checkSourcesNeedingUpdate } from '@/lib/content-validation';

const status = checkSourcesNeedingUpdate();
console.log('Expired:', status.expired);
console.log('Expiring soon:', status.expiringSoon);
```

### Föreslå Distribution
```typescript
import { suggestOptimalDistribution } from '@/lib/content-validation';

const distribution = suggestOptimalDistribution(50);
console.log('Bands:', distribution.bands);
console.log('Levels:', distribution.levels);
```

## Kontakt och Bidrag

För frågor om innehåll eller förslag på nya källor:
- Öppna issue på GitHub
- Tagga med `content-quality` eller `source-update`
- Inkludera referenser och evidensnivå

---

**Senast uppdaterad**: 2024-11-15
**Version**: 1.0
