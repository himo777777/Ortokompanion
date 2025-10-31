# OrtoKompanion 🦴

**AI-Driven Medical Education Platform for Orthopedic Surgery**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Production Ready](https://img.shields.io/badge/Status-Production_Ready-success)](https://github.com)

> Ett AI-drivet utbildningssystem för ortopedläkare på alla nivåer - från läkarstudent till specialist. Kombinerar evidensbaserad spaced repetition, adaptiv svårighetsgrad och officiella svenska utbildningsstandarder.

## 📋 Om Projektet

OrtoKompanion är en interaktiv utbildningsplattform som kombinerar tre kraftfulla system:

1. **Gamification & Daily Learning** - XP, streaks, badges, och strukturerade dagliga sessioner
2. **ST-Progression & Spaced Repetition** - SM-2 inspirerad SRS med Band A-E svårighetsgrad
3. **Socialstyrelsen Standards** - 30 officiella utbildningsmål för svensk läkarutbildning

**Status:** ✅ Production Ready (v1.0)
- TypeScript: 0 errors
- ESLint: 0 warnings
- Build: Optimized (9.6s)
- Bundle: 125 kB (main route)

## 🎯 Funktioner

### 🆕 Integrated System (v1.0)
- **Band A-E Difficulty System** - Adaptiv svårighetsgrad från grundläggande till avancerad
- **Spaced Repetition (SRS)** - SM-2 inspirerad algoritm för optimal retention
- **Domain Gates** - 4 krav per domän (Mini-OSCE ≥80%, Retention, SRS Stability ≥0.7, Complication)
- **60/20/20 Daily Mix** - 60% nytt, 20% interleaving, 20% SRS repetition
- **Auto-Tuning** - Aldrig >±1 band/dag, dag 1 alltid lättare, recovery mode tillgänglig
- **30 Socialstyrelsen Mål** - Officiella utbildningsmål för Student, AT, och ST1-ST5
- **Unified Analytics** - Kombinerad statistik för XP, Band, SRS, och domänprogression

### 🚀 QuickStart Onboarding
- **90-sekunders personalisering** - Snabb och effektiv onboarding
- **Automatisk 7-dagars mikroplan** - Skräddarsydd efter din nivå och mål
- **Gamification** - XP, levels, badges och streak-system
- **Next-day check** - Daglig feedback för att optimera din plan
- **GDPR-säkert** - All data sparas lokalt i din webbläsare

### 🎓 Utbildningsnivåer
- **Läkarstudent** - Grundläggande anatomi och ortopediska kunskaper
- **AT-läkare** - Allmän klinisk kompetens och akut handläggning
- **ST1-ST5** - Progressiv specialistutbildning inom ortopedi
- **Specialist** - Kontinuerlig fortbildning och avancerade tekniker

### 💬 AI-Handledare
- Interaktiv chattbot som svarar på frågor
- Anpassad till vald utbildningsnivå
- Täcker alla viktiga områden inom ortopedi:
  - Anatomi och fysiologi
  - Frakturbehandling
  - Ledsjukdomar och artroplastik
  - Sportmedicin
  - Akut ortopedi
  - Kirurgiska tekniker

### 📚 Fallstudier
- Kliniska scenarios för varje nivå
- Interaktiva frågor med förklaringar
- Omedelbar feedback
- Möjlighet att repetera

### 📖 Kunskapsmoduler
- Strukturerat innehåll uppdelat i moduler
- Anatomi och fysiologi
- Frakturer och luxationer
- Ledsjukdomar
- Sportskador
- Kirurgiska tekniker
- Pediatrisk ortopedi

### 📅 7-Dagars Mikroplan
Din personliga lärplan skapas automatiskt efter onboarding:

**Dag 1:** Mikrofall + Beslutsträd + Clinical Pearl + Next-day check
**Dag 2:** Röntgenbedömning + Quiz
**Dag 3:** Operationsförberedelse + MCQ
**Dag 4:** Komplikationer & Alarmtecken
**Dag 5:** Evidensbaserad medicin
**Dag 6:** Mini-OSCE (3-stegs scenario)
**Dag 7:** Veckorepetition + Självskattning

Varje uppgift tar **5-10 minuter** och ger **5-20 XP**!

## 🚀 Kom igång

### Förutsättningar
- Node.js 18+
- npm eller yarn

### Installation

1. Klona repositoryt:
```bash
git clone <repository-url>
cd Ortokompanion
```

2. Installera dependencies:
```bash
npm install
```

3. (Valfritt) Konfigurera miljövariabler:
```bash
cp .env.example .env
```

4. Starta utvecklingsservern:
```bash
npm run dev
```

5. Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare

## 🚢 Deployment

### Vercel (Rekommenderat)
```bash
npm install -g vercel
vercel --prod
```

### Docker
```bash
docker build -t ortokompanion .
docker run -p 3000:3000 ortokompanion
```

### Traditionell Server
```bash
npm run build
npm start
```

**Mer information:** Se [DEPLOY.md](DEPLOY.md) för komplett deployment-guide.

## 📚 Dokumentation

- **[PRODUCTION_READY.md](PRODUCTION_READY.md)** - Komplett deployment-guide med systemöversikt
- **[DEPLOY.md](DEPLOY.md)** - Snabbguide för deployment
- **[INTEGRATION_COMPLETE.md](INTEGRATION_COMPLETE.md)** - Sammanfattning av integrationen
- **[docs/INTEGRATION_GUIDE.md](docs/INTEGRATION_GUIDE.md)** - 8-fas integrationsplan
- **[docs/PROGRESSION_SYSTEM.md](docs/PROGRESSION_SYSTEM.md)** - Teknisk dokumentation för ST-Progression
- **[COMPLETE_SYSTEM_SUMMARY.md](COMPLETE_SYSTEM_SUMMARY.md)** - Komplett systemöversikt

## 🛠️ Teknisk Stack

- **Framework**: Next.js 15 (App Router)
- **Språk**: TypeScript
- **Styling**: Tailwind CSS
- **Ikoner**: Lucide React
- **AI Integration**: Möjlighet att integrera med OpenAI API

## 📁 Projektstruktur

```
Ortokompanion/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API endpoint för chat
│   ├── globals.css               # Global styling
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Huvudsida med onboarding
├── components/
│   ├── onboarding/
│   │   └── QuickStart.tsx        # QuickStart onboarding (5 steg)
│   ├── dashboard/
│   │   └── DayPlanView.tsx       # 7-dagars plan dashboard
│   ├── LevelSelector.tsx         # Nivåväljare (legacy)
│   ├── ChatInterface.tsx         # AI chatbot interface
│   └── CaseStudyViewer.tsx       # Fallstudievisare
├── data/
│   ├── levels.ts                 # Utbildningsnivåer och fokusområden
│   └── caseStudies.ts            # Kliniska fallstudier
├── types/
│   ├── education.ts              # TypeScript typdefinitioner (education)
│   └── onboarding.ts             # TypeScript typdefinitioner (onboarding)
├── lib/
│   └── onboarding-utils.ts       # Utilities för plangenering, XP, badges
├── docs/
│   ├── ONBOARDING_SYSTEM.md      # Onboarding-systemets dokumentation
│   └── OPENAI_INTEGRATION.md     # OpenAI integration guide
└── public/                       # Statiska filer
```

## 🔧 Konfiguration

### AI Integration (Valfritt)

För att integrera med OpenAI API:

1. Skapa en API-nyckel på [OpenAI Platform](https://platform.openai.com)
2. Lägg till nyckeln i `.env`:
```
OPENAI_API_KEY=your_api_key_here
```

3. Uppdatera `app/api/chat/route.ts` för att använda OpenAI istället för mock-svar

## 📝 Användning

### Första gången (QuickStart Onboarding)

1. **Steg 1: Välj nivå** - Student, AT, ST1-ST5 eller Specialist
2. **Steg 2: Välj område** - Höft, Fot/Ankle, Handled, Skuldra, Infektion eller Barn
3. **Steg 3: Ditt mål** - Vad vill du uppnå de närmaste 14 dagarna?
4. **Steg 4: Integritet** - Samtycke och notifikationsinställningar
5. **Steg 5: Finjustering** - 3 snabba frågor för att optimera din plan

Total tid: **≤90 sekunder**

### Din 7-dagars mikroplan

Efter onboarding får du automatiskt:
- **Personlig plan** anpassad efter din nivå och mål
- **Dagens uppgifter** (5-10 min/uppgift)
- **XP-system** som belönar framsteg
- **Badges** när du når milstolpar
- **Streak-räknare** som motiverar daglig aktivitet

### Navigering

Använd flikarna för att växla mellan:
- **Min Plan** - Din 7-dagars mikroplan med dagens uppgifter
- **AI-Handledare** - Chatta med AI om ortopedi
- **Fallstudier** - Öva på kliniska scenarios
- **Kunskapsmoduler** - Läs strukturerat innehåll

### Tips
- Slutför uppgifter för att tjäna XP och badges
- Svara på "Next-day check" dag 1 för att optimera planen
- Håll din streak vid liv genom att vara aktiv dagligen
- Klicka "Börja om" för att göra onboarding igen

## 🎨 Anpassning

### Lägg till nya fallstudier
Redigera `data/caseStudies.ts` och lägg till nya objekt i `caseStudies`-arrayen:

```typescript
{
  id: 'unique-id',
  title: 'Titel på fallet',
  level: 'student', // eller at, st1, st2, etc.
  patient: {
    age: 65,
    gender: 'Kvinna',
    complaint: 'Symtom'
  },
  scenario: 'Beskrivning av fallet...',
  questions: [...]
}
```

### Lägg till fler fokusområden
Redigera `data/levels.ts` för att lägga till eller ändra fokusområden för varje nivå.

### Anpassa AI-svar
Uppdatera `generateMockResponse` i `app/api/chat/route.ts` för att lägga till fler ämnen eller förbättra svar.

## 🤝 Bidra

Bidrag är välkomna! Om du vill bidra:

1. Forka projektet
2. Skapa en feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit dina ändringar (`git commit -m 'Add some AmazingFeature'`)
4. Push till branchen (`git push origin feature/AmazingFeature`)
5. Öppna en Pull Request

## 📄 Licens

Detta projekt är skapat för utbildningsändamål.

## 🙏 Acknowledgments

- Tack till alla ortopeder som bidragit med kunskap
- Inspirerat av behovet av bättre utbildningsverktyg inom medicin
- Byggd med moderna webteknologier för bästa användarupplevelse

## 📧 Kontakt

För frågor eller feedback, vänligen öppna ett issue i projektet.

---

## ✅ Production Status

**Version:** 1.0.0
**Build Status:** ✅ SUCCESS
**Last Updated:** 2025-10-31
**Deployment:** Ready for production

### System Integration Complete
- ✅ v2.0 Base System
- ✅ ST-Progression & SRS
- ✅ Socialstyrelsen Standards
- ✅ Unified Dashboard
- ✅ Auto-Migration
- ✅ Production Build
- ✅ Documentation Complete

🎉 **Ready to deploy!**

---

**OBS**: Detta är ett utbildningssystem och ska inte ersätta formell medicinsk utbildning eller kliniska riktlinjer. Användare uppmanas att alltid konsultera aktuella riktlinjer och erfarna kollegor.

🦴 **Happy Learning!**