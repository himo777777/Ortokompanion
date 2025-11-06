# OrtoKompanion - Produktionssetup Guide

## 🚀 Snabbstart

OrtoKompanion är nu produktionsklar med äkta autentisering och databaspersistens! Följ denna guide för att sätta upp din egen instans.

---

## 📋 Förutsättningar

- Node.js 18+ och npm
- Git
- Konto på Clerk.com (gratis)
- Konto på Supabase.com (gratis)
- OpenAI API-nyckel (betald)

---

## 🔧 Setup Steg-för-Steg

### 1. Klona och installera

```bash
git clone https://github.com/your-repo/ortokompanion.git
cd ortokompanion
npm install
```

### 2. Skapa Clerk-konto (Autentisering)

1. Gå till https://clerk.com och skapa ett gratis konto
2. Skapa en ny applikation:
   - Välj "Email & Password" som sign-in metod
   - Välj "Email" som identifier
   - Aktivera "Swedish" som språk (valfritt)
3. Gå till **API Keys** i sidomenyn
4. Kopiera:
   - `Publishable key` (börjar med `pk_test_...`)
   - `Secret key` (börjar med `sk_test_...`)

### 3. Skapa Supabase-projekt (Databas)

1. Gå till https://supabase.com och skapa ett gratis konto
2. Skapa ett nytt projekt:
   - Välj projektnamn: "ortokompanion"
   - Välj stark databas-lösenord (spara det!)
   - Välj region: "Europe North (Stockholm)" för svensk hosting
3. Vänta ~2 minuter medan projektet skapas
4. Gå till **Project Settings > Database**
5. Under "Connection string", välj **URI** och kopiera hela strängen
   - Den ser ut så här: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`
   - Ersätt `[YOUR-PASSWORD]` med ditt databas-lösenord

### 4. Konfigurera Environment Variables

Kopiera `.env.local` filen och fyll i dina nycklar:

```bash
# .env.local

# OpenAI (REQUIRED)
OPENAI_API_KEY=sk-...

# Clerk Authentication (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Database (REQUIRED)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### 5. Initiera Databasen

```bash
# Generera Prisma Client
npx prisma generate

# Kör databas-migrationer (skapar tabeller)
npx prisma migrate dev --name init

# Valfritt: Öppna Prisma Studio för att se din databas
npx prisma studio
```

### 6. Starta Development Server

```bash
npm run dev
```

Appen körs nu på http://localhost:3000

---

## 🎯 Första Användning

1. **Skapa konto**: Klicka "Sign Up" och skapa ditt första konto
2. **Onboarding**: Gå igenom onboarding-processen (välj roll, domäner, etc.)
3. **Börja träna**: Din progress sparas nu automatiskt i databasen!

---

## 🗄️ Databas-arkitektur

### Tabeller:

**User** - Clerk-länkad användaridentitet
- `id` - Intern ID
- `clerkId` - Clerk user ID
- `email` - Användarens email

**Profile** - Användarens fullständiga profil och progress
- Gamification: XP, level, streak, badges
- Progression: Domain status, Band status, SRS cards
- Goals: Socialstyrelsen mål-progress
- Rotation/Placement: ST-läkare rotationer

**Session** - Varje träningspass
- Questions answered, accuracy, XP gained
- Topics covered, mistakes made
- Related Socialstyrelsen goals

**DailyMix** - Cachade dagliga träningsplaner

---

## 🔒 Säkerhet

### Vad är skyddat:
- ✅ Alla routes kräver autentisering via Clerk
- ✅ API routes validerar användaridentitet
- ✅ Databas-access via Prisma ORM (SQL injection-säker)
- ✅ Environment variables aldrig exponerade till klient

### Best Practices:
- Aldrig committa `.env.local` till Git
- Använd starka databas-lösenord
- Rotera API-nycklar regelbundet
- Aktivera 2FA på Clerk och Supabase

---

## 📊 Datamigrering från localStorage

Om du har befintlig data i localStorage, kör migrations-scriptet:

```bash
npm run migrate-localstorage
```

Detta kommer:
1. Läsa din gamla data från localStorage
2. Konvertera till databas-format
3. Spara till PostgreSQL
4. Backa up localStorage-data till fil

---

## 🚢 Deployment (Produktion)

### Rekommenderad Stack:

**Frontend + API**: Vercel (gratis)
- `vercel --prod`
- Automatisk CI/CD från Git
- Edge functions för snabba API routes

**Databas**: Supabase (gratis upp till 500MB)
- Redan konfigurerad!
- Automatiska backups
- Connection pooling inbyggt

**Autentisering**: Clerk (gratis upp till 10,000 användare/månad)
- Redan konfigurerad!
- Hanterar email-verifiering, 2FA, etc.

### Environment Variables i Vercel:

Lägg till samma variabler som i `.env.local` i Vercel:
1. Gå till Vercel Project Settings > Environment Variables
2. Lägg till alla REQUIRED variabler
3. Deploy!

---

## 🐛 Troubleshooting

### Problem: "Database connection failed"
**Lösning**:
- Kontrollera att DATABASE_URL är korrekt
- Verifiera att ditt Supabase-projekt är aktivt
- Kolla att du använt rätt lösenord

### Problem: "Clerk authentication error"
**Lösning**:
- Verifiera att NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY börjar med `pk_`
- Verifiera att CLERK_SECRET_KEY börjar med `sk_`
- Kolla att båda är från samma Clerk-projekt

### Problem: "OpenAI API error"
**Lösning**:
- Kontrollera att du har credits på ditt OpenAI-konto
- Verifiera att API-nyckeln är aktiv
- Kolla rate limits på OpenAI dashboard

---

## 📈 Nästa Steg

Efter grundsetup, överväg:

1. **Email-notifikationer**: Lägg till Resend för dagliga påminnelser
2. **Analytics**: Integrera Posthog för användarbeteende
3. **Error Tracking**: Lägg till Sentry för production monitoring
4. **Content Expansion**: Lägg till fler kliniska fall och frågor
5. **Mobile App**: Bygg React Native-version med samma backend

---

## 💡 Support

- **Dokumentation**: Se `/docs` mappen
- **Issues**: GitHub Issues
- **Community**: Discord server (länk kommer)

---

## 📝 License

Proprietary - All rights reserved
