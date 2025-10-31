# Ortokompanion

**Ortokompanion** är en evidensbaserad ortodontisk referensapplikation som innehåller omfattande information om kliniska case, vanliga frågor och referensinformation - alla med fullständiga källhänvisningar.

## Översikt

Detta projekt tillhandahåller en strukturerad databas av ortodontisk kunskap med fokus på:

- ✅ **Evidensbaserad information**: All information är kopplad till akademiska källor
- ✅ **Fullständiga källhänvisningar**: Varje case, fråga och informationspost har detaljerade referenser
- ✅ **Svensk och engelsk text**: Innehåll på svenska med engelska översättningar där relevant
- ✅ **Strukturerad data**: JSON-format för enkel integration med applikationer

## Projektstruktur

```
Ortokompanion/
├── README.md                          # Denna fil
├── data/
│   ├── cases/                        # Kliniska case
│   │   └── cases.json               # Case-databas med källhänvisningar
│   ├── questions/                    # Vanliga kliniska frågor
│   │   └── questions.json           # Frågor och svar med källor
│   ├── information/                  # Referensinformation
│   │   └── info.json                # Informationsartiklar med källor
│   └── sources/                      # Källregister
│       └── sources.json             # Centraliserat källregister
└── docs/                             # Ytterligare dokumentation
```

## Datastruktur

### Källregister (sources.json)

Centraliserat register över alla akademiska källor som används i projektet.

**Källtyper:**
- `journal` - Textböcker och större verk
- `journal_article` - Vetenskapliga artiklar
- `clinical_guideline` - Kliniska riktlinjer
- `book` - Fackböcker

**Exempel på källpost:**
```json
{
  "id": "ref_001",
  "type": "journal",
  "title": "Contemporary Orthodontics",
  "authors": ["William R. Proffit", "Henry W. Fields Jr.", "David M. Sarver"],
  "edition": "6th Edition",
  "publisher": "Elsevier",
  "year": 2019,
  "isbn": "978-0323543873",
  "url": "https://www.elsevier.com/...",
  "reliability": "high",
  "notes": "Standard reference textbook in orthodontics"
}
```

### Kliniska Case (cases.json)

Detaljerade kliniska case med diagnos, behandlingsplan och utfall.

**Struktur:**
- **Presentation**: Kliniska fynd och cephalometrisk analys
- **Diagnos**: Fullständig ortodontisk diagnos
- **Behandlingsplan**: Detaljerad plan med apparater och mekanik
- **Utfall**: Behandlingsresultat och långtidsstabilitet
- **Källor**: Array av källhänvisningar med specifik relevans

**Exempel:**
```json
{
  "id": "case_001",
  "title": "Klass II Division 1 Malokklusion med Överbett",
  "category": "Class II malocclusion",
  "diagnosis": "Skeletal Class II with dental compensation...",
  "sources": [
    {
      "sourceId": "ref_001",
      "relevance": "Treatment approach based on...",
      "pages": "456-489"
    }
  ]
}
```

### Frågor och Svar (questions.json)

Vanliga kliniska frågor med evidensbaserade svar.

**Struktur:**
- **Fråga**: På svenska och engelska
- **Svar**: Sammanfattning och detaljerat svar
- **Kliniska tips**: Praktiska råd
- **Källor**: Källhänvisningar med specifika fynd
- **Evidence level**: Nivå av evidens (Level 1-3)

**Svårighetsgrader:**
- `basic` - Grundläggande kunskaper
- `intermediate` - Klinisk nivå
- `advanced` - Specialistnivå

### Referensinformation (info.json)

Omfattande informationsartiklar om ortodontiska ämnen.

**Kategorier:**
- Classification (klassifikationssystem)
- Cephalometrics (cephalometrisk analys)
- Biomechanics (biomekanik)
- Growth and development (tillväxt)
- Treatment modalities (behandlingsmetoder)

## Källhantering

### Källkvalitet

Alla källor är graderade efter tillförlitlighet:
- **high**: Peer-reviewed publikationer, standardtextböcker, kliniska riktlinjer
- **medium**: Kliniska studier med begränsningar
- **low**: Opinionsartiklar, äldre källor (används minimalt)

### Evidence Levels

Information kategoriseras efter evidensnivå:
- **Level 1**: Systematiska reviews, meta-analyser, RCTs
- **Level 2**: Kliniska studier, kohortstudier
- **Level 3**: Expert opinion, case reports

### Källcitation

Varje datapunkt innehåller:
1. **sourceId**: Referens till källregister
2. **relevance**: Beskrivning av källans relevans
3. **specificFindings**: Specifika fynd från källan
4. **pages/chapters**: Exakta sidor eller kapitel (när tillämpligt)

**Exempel:**
```json
"sources": [
  {
    "sourceId": "ref_003",
    "relevance": "Long-term stability data and retention protocols",
    "specificFindings": "Studies show continued relapse even 10-20 years...",
    "pages": "595-620",
    "chapters": ["19"]
  }
]
```

## Användning

### Läsa Data

Alla datafiler är i JSON-format och kan läsas med standard JSON-parsers.

**JavaScript exempel:**
```javascript
// Läs källor
const sources = require('./data/sources/sources.json');

// Läs case
const cases = require('./data/cases/cases.json');

// Hitta specifik källa
const source = sources.sources.find(s => s.id === 'ref_001');
console.log(source.title); // "Contemporary Orthodontics"
```

**Python exempel:**
```python
import json

# Läs källor
with open('data/sources/sources.json', 'r', encoding='utf-8') as f:
    sources_data = json.load(f)

# Läs case
with open('data/cases/cases.json', 'r', encoding='utf-8') as f:
    cases_data = json.load(f)

# Hitta case
case = next(c for c in cases_data['cases'] if c['id'] == 'case_001')
print(case['title'])
```

### Validera Källor

Se till att alla sourceId:n refererar till giltiga källor:

```python
def validate_sources(data_file, sources):
    """Validera att alla källor existerar"""
    valid_ids = {s['id'] for s in sources['sources']}

    for item in data_file['cases']:  # eller 'questions', 'topics'
        for source in item.get('sources', []):
            if source['sourceId'] not in valid_ids:
                print(f"Invalid source: {source['sourceId']} in {item['id']}")
```

## Bidragande

### Lägga till Nytt Innehåll

**1. Lägg först till källan i sources.json:**
```json
{
  "id": "ref_NEW",
  "type": "journal_article",
  "title": "Article Title",
  "authors": ["Author Name"],
  ...
}
```

**2. Referera sedan till källan i ditt innehåll:**
```json
{
  "id": "case_NEW",
  "title": "New Case",
  ...
  "sources": [
    {
      "sourceId": "ref_NEW",
      "relevance": "Why this source is relevant",
      "specificFindings": "What the source says"
    }
  ]
}
```

### Riktlinjer för Källhänvisningar

**VIKTIGT**: Varje påstående, behandlingsrekommendation eller kliniskt råd MÅSTE ha:

1. ✅ Minst en källhänvisning
2. ✅ Relevans-beskrivning som förklarar varför källan citeras
3. ✅ Specifika fynd från källan
4. ✅ Sidnummer eller kapitel när tillämpligt

**Exempel på god källhänvisning:**
```json
{
  "sourceId": "ref_007",
  "relevance": "Comprehensive review of TAD biomechanics and clinical applications",
  "specificFindings": "Success rates 80-90% with proper placement and loading protocols",
  "pages": "520-535"
}
```

**Exempel på bristfällig källhänvisning (undvik):**
```json
{
  "sourceId": "ref_007"
  // ❌ Saknar relevance, specificFindings, pages
}
```

## Datavalidering

### Obligatoriska Fält

**Cases:**
- ✅ id, title, category, diagnosis, treatmentPlan, sources
- ✅ Minst en källhänvisning
- ✅ evidenceLevel
- ✅ lastReviewed

**Questions:**
- ✅ id, question, answer, sources
- ✅ Minst en källhänvisning
- ✅ evidenceLevel
- ✅ category, difficulty

**Information:**
- ✅ id, title, content, sources
- ✅ Minst en källhänvisning
- ✅ evidenceLevel

**Sources:**
- ✅ id, type, title, authors, year
- ✅ url eller doi eller isbn
- ✅ reliability

## Källtyper och Format

### Vetenskaplig Artikel (journal_article)
```json
{
  "id": "ref_XXX",
  "type": "journal_article",
  "title": "Article Title",
  "authors": ["First Author", "Second Author"],
  "journal": "Journal Name",
  "year": 2023,
  "volume": 10,
  "issue": 5,
  "pages": "100-110",
  "doi": "10.xxxx/xxxxx",
  "url": "https://doi.org/...",
  "reliability": "high"
}
```

### Textbok (journal/book)
```json
{
  "id": "ref_XXX",
  "type": "journal",
  "title": "Book Title",
  "authors": ["Author Name"],
  "edition": "6th Edition",
  "publisher": "Publisher Name",
  "year": 2019,
  "isbn": "978-XXXXXXXXX",
  "reliability": "high"
}
```

### Klinisk Riktlinje (clinical_guideline)
```json
{
  "id": "ref_XXX",
  "type": "clinical_guideline",
  "title": "Guideline Title",
  "organization": "Organization Name",
  "year": 2023,
  "url": "https://...",
  "reliability": "high"
}
```

## Kvalitetssäkring

### Före Commit

Kontrollera att:
1. ✅ Alla nya källor är tillagda i sources.json
2. ✅ Alla sourceId:n refererar till existerande källor
3. ✅ Varje källa har relevance och specificFindings
4. ✅ evidenceLevel är satt
5. ✅ lastReviewed datum är uppdaterat
6. ✅ JSON-syntax är giltig (använd linter)

### Kodgranskning

Innan merge, verifiera:
- Källornas akademiska kvalitet
- Korrekthet i klinisk information
- Fullständighet i källhänvisningar
- Konsistens i dataformat

## Licens

Copyright © 2025 Ortokompanion Project

## Kontakt

För frågor om projektet eller källhänvisningar, kontakta projektansvariga.

---

## Status

**Version:** 1.0
**Senast uppdaterad:** 2025-10-31
**Antal källor:** 10
**Antal case:** 3
**Antal frågor:** 5
**Antal informationsartiklar:** 3

**Källkvalitet:**
- High reliability: 100%
- Medium reliability: 0%
- Low reliability: 0%

**Evidence Distribution:**
- Level 1: 80%
- Level 2: 20%
- Level 3: 0%
