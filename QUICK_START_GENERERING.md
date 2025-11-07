# 🚀 Quick Start: Generera 50 Frågor med Svenska Källor

## Omedelbar Start (5 minuter)

### Metod 1: Enkel One-Command (REKOMMENDERAD)

```bash
# Från projekt-rot, kör:
./scripts/generate-pilot-50.sh
```

Detta kör ALLT automatiskt:
- ✅ Kontrollerar OpenAI API key
- ✅ Estimerar kostnad (~$0.10 USD)
- ✅ Genererar 5 batches (50 frågor totalt)
- ✅ Sparar till `generated/batch*.json`
- ✅ Ger dig nästa steg

**Tidsåtgång**: 5-10 minuter
**Kostnad**: ~$0.10 USD (~1 SEK)

### Metod 2: Manuell Batch-by-Batch

Om du vill mer kontroll:

```bash
# Batch 1: Trauma Band A (10 frågor)
npm run generate-questions -- \
  --domain=trauma \
  --level=student \
  --band=A \
  --count=10 \
  --output=generated/batch1-trauma-band-a.json

# Batch 2: Tumör Band A (10 frågor)
npm run generate-questions -- \
  --domain=tumör \
  --level=student \
  --band=A \
  --count=10 \
  --output=generated/batch2-tumor-band-a.json

# ... fortsätt för alla 5 batches
```

### Metod 3: Config-Fil (Avancerad)

```bash
# Använd förkonfigurerad batch-config
npm run generate-questions -- --config=config/pilot-swedish-sources.json
```

## 📋 Pre-Flight Checklist

Innan du kör, kontrollera:

- [ ] OpenAI API key finns i `.env.local`
  ```bash
  grep OPENAI_API_KEY .env.local
  # Ska visa: OPENAI_API_KEY=sk-...
  ```

- [ ] Dependencies installerade
  ```bash
  npm install
  ```

- [ ] `generated/` directory finns
  ```bash
  mkdir -p generated
  ```

## 🎯 Vad Genereras

| Batch | Domän | Band | Nivå | Antal | Svenska Källor |
|-------|-------|------|------|-------|----------------|
| 1 | Trauma | A | Student | 10 | atls-sverige-2022, svorf |
| 2 | Tumör | A | Student | 10 | sbu-ortopedi-2023, who |
| 3 | Sport | A | AT | 10 | rikskna-2024, aaos-acl |
| 4 | Höft | B | ST1 | 10 | rikshoft-2024, socialstyrelsen |
| 5 | Knä | B | ST1 | 10 | rikskna-2024, svorf |

**Total**: 50 frågor med svenska källor prioriterade

## 💰 Kostnad

- **Estimat**: ~$0.10 USD för alla 50 frågor
- **Faktisk**: Ses efter körning
- **Mycket billigt!** Huvudkostnaden är medical review

## ✅ Efter Generering

### Steg 1: Inspektera Output (2 min)

```bash
# Lista genererade filer
ls -lh generated/batch*.json

# Titta på första frågan i Batch 1
jq '.questions[0]' generated/batch1-trauma-band-a.json
```

### Steg 2: Validering (5 min)

Automatisk validering körs redan under generering, men verifiera:

```bash
# Kontrollera validation-rapporter
cat generated/batch1-trauma-band-a-validation.json
cat generated/batch2-tumor-band-a-validation.json
# ... etc

# Kör tester
npm run test:run
```

### Steg 3: Medical Review (2-3 timmar)

**KRITISKT STEG - OBLIGATORISKT!**

För varje fråga, kontrollera:

```
✓ Checklista per fråga:
  [ ] Medicinska fakta korrekt (>99%)
  [ ] Svenska källor citerade FÖRST i references
  [ ] Exakta siffror från register (inte "studier visar")
  [ ] Svenska medicinska termer (inga anglicismer)
  [ ] Kliniskt realistiskt svensk scenario
  [ ] Svarsalternativ plausibla
  [ ] Explanation pedagogiskt värdefullt
  [ ] TutorMode hints användbara
```

**Använd checklista i**: `SVENSKA_KALLOR_PRIORITET.md`

#### Review-Process:

1. **Primär Review** (Legitimerad ortoped):
   - Granska alla 50 frågor
   - Markera godkända/ej godkända
   - Notera korrigeringar

2. **Peer Review** (ST-läkare):
   - Andra-granska godkända frågor
   - Verifiera pedagogisk kvalitet

3. **Fact-Check** (Alla):
   - Verifiera varje siffra mot källa
   - Kontrollera referenser existerar
   - Dubbelkolla svenska termer

### Steg 4: Integration (30 min)

När godkända:

```bash
# 1. Öppna data/questions.ts
code data/questions.ts

# 2. Lägg till godkända frågor i respektive domän-array
# Exempel: TRAUMA_QUESTIONS, TUMOR_QUESTIONS etc.

# 3. Uppdatera ALL_QUESTIONS array
export const ALL_QUESTIONS: MCQQuestion[] = [
  ...TRAUMA_QUESTIONS,
  ...TUMOR_QUESTIONS,
  ...SPORT_QUESTIONS,
  ...HOEFT_QUESTIONS,
  ...KNA_QUESTIONS,
  // ... resten
];

# 4. Verifiera antal
npm run test:run | grep "Total questions"
# Ska visa: 526 + 50 = 576 questions

# 5. Commit
git add data/questions.ts generated/batch*.json
git commit -m "feat: Add 50 reviewed questions with Swedish sources (Trauma, Tumör, Sport, Höft, Knä)"
git push
```

## 🚨 Troubleshooting

### Problem: "OPENAI_API_KEY is missing"

**Lösning**:
```bash
# Lägg till i .env.local
echo "OPENAI_API_KEY=sk-your-key-here" >> .env.local

# Verifiera
grep OPENAI_API_KEY .env.local
```

### Problem: "Connection error / Network timeout"

**Lösning**:
```bash
# Kolla internet-anslutning
ping api.openai.com

# Om proxy behövs, sätt:
export HTTPS_PROXY=http://your-proxy:port

# Försök igen
./scripts/generate-pilot-50.sh
```

### Problem: "Rate limit exceeded"

**Lösning**:
```bash
# Vänta 60 sekunder
sleep 60

# Eller generera färre frågor åt gången
npm run generate-questions -- --domain=trauma --count=5
```

### Problem: "Invalid response / Parsing error"

**Lösning**:
```bash
# AI kan ibland generera ogiltig JSON
# Kör igen - den kommer generera nya frågor
npm run generate-questions -- --domain=trauma --count=10

# Om problemet kvarstår, rapportera bugg
```

## 📊 Produktionsschema

Efter första 50 frågorna:

### Vecka 1-2: Kritiska Gap (280 frågor)
```bash
# Trauma expansion (120 frågor)
npm run generate-questions -- --domain=trauma --level=at --count=120

# Tumör foundation (80 frågor)
npm run generate-questions -- --domain=tumör --level=st1 --count=80

# Sport expansion (80 frågor)
npm run generate-questions -- --domain=sport --level=st2 --count=80
```

### Vecka 3-4: Balansera Domäner (240 frågor)
```bash
# Höft (+60)
npm run generate-questions -- --domain=höft --level=st1 --count=60

# Knä (+60)
npm run generate-questions -- --domain=knä --level=st2 --count=60

# Axel-Armbåge (+60)
npm run generate-questions -- --domain=axel-armbåge --level=st1 --count=60

# Hand-Handled (+40)
npm run generate-questions -- --domain=hand-handled --level=at --count=40

# Fot-Fotled (+20)
npm run generate-questions -- --domain=fot-fotled --level=at --count=20
```

### Vecka 5+: Steady Production (100 frågor/vecka)
```bash
# Automatisera med weekly script
./scripts/weekly-generation.sh week5
```

**Timeline till 2,000 frågor**: 20 veckor (5 månader)

## 💡 Tips för Framgång

1. **Börja Små**: 10-50 frågor första gången för att lära processen
2. **Review Omedelbart**: Granska inom 24h medan frågorna är färska
3. **Batch Review**: Granska 10 frågor åt gången (mer effektivt)
4. **Dokumentera**: Anteckna vanliga fel för att förbättra prompts
5. **Iterera**: Uppdatera generation-prompts baserat på review-feedback
6. **Version Control**: Commit ofta, använd branches

## 📚 Relaterade Dokument

- `QUESTION_BANK_EXPANSION_PLAN.md` - Övergripande strategi
- `QUESTION_EXPANSION_GUIDE.md` - Detaljerad implementation
- `SVENSKA_KALLOR_PRIORITET.md` - Källprioritet och kvalitet
- `config/pilot-swedish-sources.json` - Batch-konfiguration

## ✅ Ready Checklist

Innan du börjar generera:

- [ ] OpenAI API key konfigurerad
- [ ] Läst genom SVENSKA_KALLOR_PRIORITET.md
- [ ] Rekryterat reviewer (1 ortoped + 1 ST-läkare)
- [ ] Avsatt tid för medical review (2-3h)
- [ ] Git branch skapad för nya frågor
- [ ] Förstått att AI-generering är billig ($0.10), men review är tidskrävande

---

## 🚀 START NU!

```bash
./scripts/generate-pilot-50.sh
```

**Tid**: 10 minuter
**Kostnad**: ~1 SEK
**Resultat**: 50 frågor med svenska källor!

Lycka till! 🎉
