# Guide: Expandera Frågebanken till 2,000 Frågor

## 📊 Nuläge

- **Totalt antal frågor**: 526
- **Målsättning**: 2,000 frågor
- **Gap**: +1,474 frågor att generera

## 🎯 System som finns på plats

Ni har redan ett komplett AI-generation system! ✅

### Befintliga verktyg:

1. **`lib/ai-question-generator.ts`**
   - Komplett OpenAI GPT-4 integration
   - Zod-validering av genererade frågor
   - Content versioning
   - Batch generation med band-distribution

2. **`lib/generation-prompts.ts`**
   - Professional system prompts för svenska medicinska frågor
   - Band-specifika instruktioner (A-E)
   - Domän-specifika aspects
   - TutorMode generation

3. **`scripts/generate-questions.ts`**
   - CLI-interface för question generation
   - Dry-run mode för kostnadsuppskattning
   - Batch-generation med fördefinierade configs
   - Automatisk validering

## 🚀 Steg-för-Steg Implementation

### Fas 1: Setup (1 dag)

#### 1. Verifiera OpenAI API Key
```bash
# Kontrollera att nyckeln finns i .env.local
grep OPENAI_API_KEY .env.local

# Testa med en liten batch
npm run generate-questions -- --domain=trauma --level=student --band=A --count=5 --dry-run
```

#### 2. Installera dependencies (redan gjort!)
```bash
npm install dotenv openai zod
```

### Fas 2: Pilot Generation (1 vecka)

#### Steg 1: Generera första 50 frågor
```bash
# Trauma Band A (10 frågor)
npm run generate-questions -- --domain=trauma --level=student --band=A --count=10

# Trauma Band B (10 frågor)
npm run generate-questions -- --domain=trauma --level=at --band=B --count=10

# Tumör Band A (10 frågor) - Prioriterat gap
npm run generate-questions -- --domain=tumör --level=student --band=A --count=10

# Sport Band A (10 frågor) - Prioriterat gap
npm run generate-questions -- --domain=sport --level=at --band=A --count=10

# Höft Band B (10 frågor)
npm run generate-questions -- --domain=höft --level=st1 --band=B --count=10
```

#### Steg 2: Medical Review
- [ ] Granska alla 50 pilot-frågor
- [ ] Kontrollera medicinska fakta mot källor
- [ ] Verifiera svenska terminologi
- [ ] Godkänn för integration

#### Steg 3: Integration
```bash
# Lägg till godkända frågor i data/questions.ts
# Uppdatera ALL_QUESTIONS array
# Kör tester
npm run test:run
```

### Fas 3: Batch Production (8 veckor)

#### Vecka 1-2: Fylla Kritiska Gap (280 frågor)
```bash
# Använd batch-generation för effektivitet
npm run generate-questions -- --config=config/week1-trauma-tumor.json

# Eller individuellt:
npm run generate-questions -- --domain=trauma --level=at --count=120
npm run generate-questions -- --domain=tumör --level=st1 --count=80
npm run generate-questions -- --domain=sport --level=st2 --count=80
```

**Week 1-2 Config (config/week1-trauma-tumor.json)**:
```json
{
  "batches": [
    {
      "name": "Trauma Expansion",
      "domain": "trauma",
      "level": "at",
      "bandDistribution": {
        "A": 30,
        "B": 40,
        "C": 30,
        "D": 15,
        "E": 5
      },
      "totalCount": 120,
      "startId": 501,
      "output": "generated/trauma-at-120q.json"
    },
    {
      "name": "Tumör Foundation",
      "domain": "tumör",
      "level": "st1",
      "bandDistribution": {
        "A": 20,
        "B": 30,
        "C": 20,
        "D": 8,
        "E": 2
      },
      "totalCount": 80,
      "startId": 621,
      "output": "generated/tumor-st1-80q.json"
    }
  ]
}
```

#### Vecka 3-4: Balansera Domäner (240 frågor)
- Höft: +60
- Knä: +60
- Axel-Armbåge: +60
- Hand-Handled: +40
- Fot-Fotled: +20

#### Vecka 5-6: Höja Band A och B (280 frågor)
- Fokus på grundläggande och intermediär nivå
- Student och AT-level över alla domäner

#### Vecka 7-8: ST3-ST5 och Specialist (200 frågor)
- Avancerade Band D och E frågor
- Subspecialisering och sällsynta fall

### Fas 4: Massive Expansion (10 veckor till 2,000)

#### Produktionsplan: 100 frågor/vecka
```bash
# Automatisera med cronjob eller wekly script
# weekly-generation.sh

#!/bin/bash
WEEK=$1  # Veckonummer

# Veckovis domänrotation
case $WEEK in
  1) DOMAIN="trauma";;
  2) DOMAIN="höft";;
  3) DOMAIN="knä";;
  4) DOMAIN="axel-armbåge";;
  5) DOMAIN="rygg";;
  6) DOMAIN="hand-handled";;
  7) DOMAIN="fot-fotled";;
  8) DOMAIN="sport";;
  9) DOMAIN="tumör";;
  10) DOMAIN="trauma";; # Återgå till start
esac

npm run generate-questions -- \
  --domain=$DOMAIN \
  --level=mixed \
  --count=100 \
  --output=generated/week$WEEK-$DOMAIN.json

echo "✅ Vecka $WEEK klar: 100 $DOMAIN frågor"
```

## 🔍 Kvalitetskontroll Process

### Automatisk Validering
Systemet validerar automatiskt:
- ✅ Korrekt format (Zod schema)
- ✅ 4 svarsalternativ
- ✅ Minst 2 references
- ✅ Minst 1 Socialstyrelsen-mål
- ✅ 3 hints i TutorMode
- ✅ Tags 3-5 st

### Manuell Medical Review

**Checklista per fråga**:
- [ ] Medicinsk korrekthet (jämför mot källor)
- [ ] Svenska terminologi (inga anglicismer)
- [ ] Klinisk relevans (realistiska scenarios)
- [ ] Svarsalternativ plausibla
- [ ] Explanation citera specifika data
- [ ] TutorMode pedagogiskt värdefullt

**Reviewer-rotation**:
- 1 legitimerad ortoped (20 frågor/timme)
- 2 ST-läkare peer review (30 frågor/timme)

### Integration Workflow

```bash
# 1. Generera batch
npm run generate-questions -- --domain=trauma --count=100

# 2. Validera automatiskt
node scripts/validate-batch.js generated/trauma-*.json

# 3. Medical review
# Öppna frågor i review-tool eller manuellt

# 4. Flagga approved frågor
node scripts/approve-questions.js generated/trauma-*.json

# 5. Merge till main questions.ts
node scripts/merge-questions.js generated/trauma-*-approved.json data/questions.ts

# 6. Kör tester
npm run test:run

# 7. Commit
git add data/questions.ts
git commit -m "feat: Add 100 trauma questions (Band A-C, AT/ST1 level)"
git push
```

## 💰 Kostnadsuppskattning

### OpenAI API Costs (GPT-4o-mini)
- Input: $0.150 / 1M tokens
- Output: $0.600 / 1M tokens

**Per fråga**:
- Prompt: ~2,000 tokens (sources, examples, instructions)
- Output: ~800 tokens (question + tutorMode)
- Cost: ~$0.002 per fråga

**För 1,474 frågor**:
- Total cost: $0.002 × 1,474 = **~$3 USD (30 SEK)**

Detta är extremt billigt! 🎉

### Personalkostnader (Större kostnad)

**Medical Review** (kritisk):
- 1,474 frågor × 3 min/fråga = 74 timmar
- 74h × 800 kr/h = **59,200 SEK**

**Peer Review**:
- 1,474 frågor × 1.5 min/fråga = 37 timmar
- 37h × 500 kr/h = **18,500 SEK**

**Total kostnad**: ~80,000 SEK för 1,474 frågor

## 📈 Success Metrics

### Kvantitativa
- [ ] 2,000+ frågor totalt
- [ ] Alla domäner >150 frågor
- [ ] Band A >350 frågor
- [ ] >98% pass automatic validation
- [ ] >95% pass medical review

### Kvalitativa
- [ ] User rating >4.2/5
- [ ] <5% rapporterade felaktigheter
- [ ] Positiv feedback från ST-läkare
- [ ] Godkänd av legitimerad ortoped

## 🚨 Risker och Mitigation

| Risk | Mitigation |
|------|------------|
| AI hallucinations | Kräv sources, medical review |
| För US-centriskt | Explicit Swedish guidelines i prompts |
| Bristande pedagogik | Review tutorMode separat |
| Reviewer bottleneck | Parallellisera, incentivera |

## 📝 Nästa Steg (Action Items)

### Omedelbart (Denna vecka)
1. [ ] Verifiera OpenAI API key fungerar i er miljö
2. [ ] Generera 50 pilot-frågor enligt Fas 2
3. [ ] Rekrytera 1 ortoped + 2 ST-läkare för review
4. [ ] Sätt upp review-process och tools

### Kort sikt (Månad 1)
1. [ ] Genomför Fas 3 (500 frågor)
2. [ ] Integrera och testa
3. [ ] Samla user feedback
4. [ ] Iterera på quality

### Medellång sikt (Månad 2-5)
1. [ ] Fas 4 production (1,500 frågor)
2. [ ] Kontinuerlig review och integration
3. [ ] A/B test nya frågor vs gamla
4. [ ] **Nå 2,000 frågor! 🎉**

## 🛠️ Praktiska Kommandon

### Generate
```bash
# Single batch
npm run generate-questions -- --domain=trauma --level=at --band=B --count=10

# Multiple bands
npm run generate-questions -- --domain=höft --level=st2 --count=20

# Dry run (cost estimate)
npm run generate-questions -- --domain=sport --count=100 --dry-run
```

### Validate
```bash
# Check existing questions
npm run test:run

# Validate generated batch
node -e "const v = require('./lib/ai-question-generator'); console.log(v.validateQuestionBatch(require('./generated/pilot.json').questions))"
```

### Stats
```bash
# Count questions
grep -c "id: '" data/questions.ts

# By domain
grep "domain: '" data/questions.ts | sort | uniq -c

# By band
grep "band: '" data/questions.ts | sort | uniq -c
```

## 💡 Tips för Framgång

1. **Start Small**: Börja med 50 frågor, lär er processen
2. **Quality First**: Bättre 1,000 perfekta än 2,000 dåliga
3. **Continuous Integration**: Lägg till 50-100 frågor/vecka, inte allt på en gång
4. **User Feedback**: Beta-test med riktiga ST-läkare
5. **Version Control**: Commit ofta, tagga releases
6. **Documentation**: Dokumentera sources för alla frågor

## 📚 Resources

- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [Ortopedhandboken.se](https://ortopedhandboken.se)
- [SVORF Vårdprogram](https://svorf.se)
- [Socialstyrelsen](https://www.socialstyrelsen.se)

---

**Status**: READY TO START! 🚀

Systemet är komplett. Ni behöver bara:
1. Säkerställa OpenAI API access
2. Rekrytera reviewers
3. Börja generera!

**Estimated timeline till 2,000 frågor**: 20 veckor (5 månader)
