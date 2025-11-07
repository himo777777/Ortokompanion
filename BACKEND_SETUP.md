# Backend Integration Setup Guide

## Översikt

Backend-integrationen för Ortokompanion är nu klar med Prisma + Supabase + Clerk. Detta dokument beskriver vad som har implementerats och hur du sätter upp systemet.

## Vad som har implementerats

### ✅ Databas Schema (Prisma)
- **User Model**: Kopplad till Clerk authentication
- **Profile Model**: Huvudsaklig användardata och progression
- **Session Model**: Spårar varje learning activity
- **DailyMix Model**: Cachear genererad daglig mix

Filer:
- `prisma/schema.prisma` - Databas schema
- `lib/prisma.ts` - Prisma client singleton

### ✅ Databas Utility Functions
Komplett uppsättning funktioner för CRUD operations:
- User operations (create, get, delete)
- Profile operations (create, update, get)
- Session tracking
- Daily mix caching
- XP och streak management

Fil: `lib/db-utils.ts`

### ✅ API Endpoints

#### Profile API (`/api/profile`)
- **GET** - Hämta användarens profil
- **POST** - Skapa ny profil (vid onboarding)
- **PUT** - Uppdatera profil

#### Session API (`/api/profile/session`)
- **POST** - Spara learning session och uppdatera gamification

#### Daily Mix API (`/api/daily-mix`)
- **GET** - Hämta dagens mix
- **POST** - Spara/uppdatera daily mix

#### Clerk Webhooks (`/api/webhooks/clerk`)
- **POST** - Hantera user.created, user.updated, user.deleted events

### ✅ Authentication & Authorization
- Clerk integration i `app/layout.tsx`
- Middleware för route protection i `middleware.ts`
- Webhook handlers för user synkning

### ✅ Client-Side API Functions
Helper functions för att kommunicera med backend:
- `fetchProfile()` - Hämta profil
- `createProfile()` - Skapa profil
- `updateProfileAPI()` - Uppdatera profil
- `saveSession()` - Spara session
- `fetchDailyMix()` - Hämta daily mix
- `saveDailyMixAPI()` - Spara daily mix

Fil: `lib/api-client.ts`

---

## Setup Instruktioner

### Steg 1: Skaffa Supabase Projekt

1. Gå till [supabase.com](https://supabase.com) och skapa ett gratis konto
2. Skapa ett nytt projekt:
   - Välj region: **Europe (eu-central-1)** (närmare Sverige)
   - Sätt ett starkt databas lösenord (spara detta!)
   - Vänta ~2 minuter medan projektet skapas

3. Hämta connection strings:
   - Gå till **Project Settings** → **Database**
   - Kopiera **Connection Pooling** URL (för DATABASE_URL)
   - Kopiera **Direct connection** URL (för DIRECT_URL)

4. Hämta Supabase URL och Keys (valfritt):
   - Gå till **Project Settings** → **API**
   - Kopiera **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - Kopiera **anon/public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### Steg 2: Skaffa Clerk Projekt

1. Gå till [clerk.com](https://clerk.com) och skapa konto
2. Skapa en ny application:
   - Välj **Email** som authentication method
   - Välj **Email Code** eller **Email + Password**

3. Hämta API keys:
   - Gå till **API Keys** i Clerk dashboard
   - Kopiera **Publishable key** (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
   - Kopiera **Secret key** (CLERK_SECRET_KEY)

4. Skapa webhook för user synkning:
   - Gå till **Webhooks** i Clerk dashboard
   - Klicka **+ Add Endpoint**
   - URL: `https://your-app-domain.com/api/webhooks/clerk`
     - Under development: Använd ngrok eller lokal tunnel
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
   - Kopiera **Signing Secret** (CLERK_WEBHOOK_SECRET)

### Steg 3: Konfigurera Environment Variables

1. Öppna `.env.local` i projektets root
2. Fyll i dina nyss kopierade värden:

```bash
# OpenAI API Key
OPENAI_API_KEY=sk-your_openai_key_here

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase/Prisma Database
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Supabase (Optional)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**VIKTIGT:** Ersätt `[PROJECT-REF]` och `[PASSWORD]` med dina faktiska värden från Supabase!

### Steg 4: Kör Databas Migrations

Nu när du har konfigurerat database URL, kör migrations för att skapa tabellerna:

```bash
# Generera Prisma client (redan gjort)
npm run db:generate

# Push schema till databasen (skapar tabellerna)
npm run db:push

# Alternativt: Kör migrations (för production)
npm run db:migrate
```

Du bör se output som:
```
✔ Generated Prisma Client
Your database is now in sync with your schema.
```

### Steg 5: Verifiera Setup

1. Öppna Supabase dashboard
2. Gå till **Table Editor**
3. Du ska nu se tabellerna:
   - `User`
   - `Profile`
   - `Session`
   - `DailyMix`

### Steg 6: Testa Lokalt

```bash
# Starta utvecklingsservern
npm run dev

# Öppna http://localhost:3000
```

Vid första användning:
1. Du redirectas till Clerk sign-in
2. Skapa ett konto (email + code)
3. Clerk webhook triggar → User skapas i databasen
4. Du redirectas till onboarding för att skapa profil

---

## Nästa Steg: Uppdatera IntegratedContext

För att **fullständigt integrera** backend med frontend, behöver `IntegratedContext.tsx` uppdateras för att använda API istället för localStorage.

### Ändringar som behövs:

#### 1. Ladda profil från API vid mount

```typescript
// Nuvarande (localStorage):
useEffect(() => {
  const profile = safeGetItem('ortokompanion_integrated_profile', null);
  setProfileState(profile);
  setIsLoading(false);
}, []);

// Ny version (API):
useEffect(() => {
  async function loadProfile() {
    try {
      const { profile, hasProfile } = await fetchProfile();
      setProfileState(profile);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  }
  loadProfile();
}, []);
```

#### 2. Spara profil till API när den uppdateras

```typescript
// Lägg till debounced save funktion
const saveProfileDebounced = useCallback(
  debounce(async (profile: IntegratedUserProfile) => {
    try {
      await updateProfileAPI(profile);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }, 1000),
  []
);

// I updateProfile function:
const updateProfile = (updates: Partial<IntegratedUserProfile>) => {
  setProfileState((prev) => {
    if (!prev) return null;
    const updated = { ...prev, ...updates };
    saveProfileDebounced(updated); // Spara till API
    return updated;
  });
};
```

#### 3. Ladda Daily Mix från API

```typescript
useEffect(() => {
  if (!profile) return;

  async function loadDailyMix() {
    const { dailyMix, isStale } = await fetchDailyMix();

    if (!dailyMix || isStale) {
      refreshDailyMix();
    } else {
      setDailyMix(dailyMix);
    }
  }

  loadDailyMix();
}, [profile]);
```

#### 4. Spara sessions till API

```typescript
// I completeSession function:
const completeSession = async (results: SessionResults) => {
  // ... existing logic ...

  // Spara till API
  try {
    const sessionData = await saveSession({
      questionsAnswered: results.summary.questionsAnswered,
      correctAnswers: results.summary.correctAnswers,
      xpGained: results.summary.xpEarned,
      domain: /* extract from results */,
      band: /* extract from results */,
      activityType: 'new', // or 'interleave', 'srs'
      topics: [],
      mistakes: results.wrongAnswers,
      relatedGoals: results.relatedGoals,
    });

    // Uppdatera profile med nya gamification values
    updateProfile({
      gamification: {
        ...profile.gamification,
        xp: sessionData.gamification.xp,
        level: sessionData.gamification.level,
        streak: sessionData.gamification.streak,
      },
    });
  } catch (error) {
    console.error('Failed to save session:', error);
  }
};
```

### Hybrid Approach (Rekommenderat för övergång)

Under övergången kan du behålla localStorage som **fallback**:

```typescript
// Load from API, fallback to localStorage
const { profile: apiProfile } = await fetchProfile();
if (apiProfile) {
  setProfileState(apiProfile);
} else {
  const localProfile = safeGetItem('ortokompanion_integrated_profile', null);
  if (localProfile) {
    // Migrera till API
    await createProfile(localProfile);
    setProfileState(localProfile);
  }
}
```

---

## Testing

### Test Database Connection

Skapa en test route: `app/api/test-db/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({
      success: true,
      userCount,
      message: 'Database connection successful',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
```

Besök: `http://localhost:3000/api/test-db`

### Test Clerk Webhook

Under development, använd Clerk Dashboard för att trigga test events:
1. Gå till **Webhooks** → Din endpoint
2. Klicka **Testing** tab
3. Send test `user.created` event

---

## Prisma Studio (Database GUI)

Öppna en grafisk vy av databasen:

```bash
npm run db:studio
```

Detta öppnar `http://localhost:5555` där du kan:
- Se alla tabeller
- Browsea data
- Redigera records manuellt (för testing)

---

## Produktionsdeploy

### Environment Variables på Vercel/Railway

När du deployer till produktion, lägg till alla environment variables i din hosting platform:

**Vercel:**
1. Gå till Project Settings → Environment Variables
2. Lägg till alla variabler från `.env.local`

**Railway:**
1. Gå till Variables tab
2. Lägg till alla variabler

### Database Migrations i Production

```bash
# Push schema (rekommenderas för tidigt development)
npm run db:push

# Eller använd migrations för proper versioning
npm run db:migrate
```

### Clerk Webhook Production URL

Uppdatera Clerk webhook endpoint URL till din production domain:
```
https://your-app.vercel.app/api/webhooks/clerk
```

---

## Troubleshooting

### Prisma Connection Error

**Problem:** `Can't reach database server`

**Lösning:**
1. Kontrollera att DATABASE_URL är korrekt
2. Verifiera lösenord och project reference
3. Testa direct connection string i Supabase dashboard

### Clerk Webhook Fails

**Problem:** Webhook får 401/403

**Lösning:**
1. Verifiera CLERK_WEBHOOK_SECRET i `.env.local`
2. Kontrollera att middleware inte blockerar `/api/webhooks/clerk`
3. Se webhook logs i Clerk dashboard

### Migration Errors

**Problem:** `Migration failed to apply`

**Lösning:**
```bash
# Reset database (WARNING: Raderar all data!)
npx prisma migrate reset

# Eller push schema direkt
npm run db:push
```

---

## Arkitektur Översikt

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  IntegratedContext (React Context)                     │ │
│  │    ↓                                                   │ │
│  │  lib/api-client.ts (API calls)                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ /api/profile│  │ /api/session │  │ /api/daily-mix    │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
│         ↓                 ↓                    ↓             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            lib/db-utils.ts (Business Logic)           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  lib/prisma.ts (Prisma Client)               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL Database                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐   │
│  │  User   │  │ Profile │  │ Session │  │  DailyMix   │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────────┘

                Clerk (External)
                      │
                      ↓ Webhooks
         /api/webhooks/clerk
```

---

## Slutsats

Backend-infrastrukturen är nu **komplett och redo att användas**. Nästa steg är att uppdatera `IntegratedContext.tsx` för att använda API:et istället för localStorage.

För frågor eller problem, se:
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
