# Snabbstart - Ortokompanion

Kom igång med Ortokompanion på 5 minuter!

## 🚀 Snabbstart

### 1. Installera dependencies
```bash
npm install
```

### 2. Starta utvecklingsservern
```bash
npm run dev
```

### 3. Öppna i webbläsaren
Gå till [http://localhost:3000](http://localhost:3000)

## 🎯 Första stegen

1. **Välj din utbildningsnivå**
   - Klicka på den nivå som passar dig bäst
   - Se fokusområden för din nivå

2. **Utforska AI-Handledaren**
   - Ställ frågor om ortopedi
   - Få svar anpassade till din nivå
   - Exempel på frågor:
     - "Hur behandlar man en Colles fraktur?"
     - "Berätta om höftledsartros"
     - "Vilka är indikationerna för ACL-rekonstruktion?"

3. **Testa Fallstudier**
   - Klicka på "Fallstudier"-fliken
   - Välj ett kliniskt case
   - Svara på frågor
   - Få direkt feedback

4. **Bläddra i Kunskapsmoduler**
   - Upptäck strukturerat innehåll
   - Läs om olika ortopediska områden

## 📝 Vanliga kommandon

```bash
# Utveckling
npm run dev

# Bygga för produktion
npm run build

# Starta produktionsserver
npm start

# Linting
npm run lint
```

## 🎨 Anpassa systemet

### Lägg till egna fallstudier
Redigera [data/caseStudies.ts](data/caseStudies.ts)

### Ändra fokusområden
Redigera [data/levels.ts](data/levels.ts)

### Integrera med riktig AI
Se [docs/OPENAI_INTEGRATION.md](docs/OPENAI_INTEGRATION.md)

## 💡 Tips

- Systemet använder mock-svar som default (ingen API-nyckel behövs för att testa)
- För bästa resultat, integrera med OpenAI (valfritt)
- Lägg till fler fallstudier för att öka lärandet
- Anpassa innehållet efter dina behov

## 🐛 Problem?

Vanliga lösningar:

**Port 3000 upptagen?**
```bash
PORT=3001 npm run dev
```

**Dependencies-problem?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**TypeScript-fel?**
```bash
npm run build
```

## 📚 Nästa steg

- Läs den fullständiga [README.md](README.md)
- Utforska [OpenAI Integration Guide](docs/OPENAI_INTEGRATION.md)
- Anpassa innehållet för dina behov
- Bidra med nya fallstudier!

---

Lycka till med din ortopediutbildning! 🦴
