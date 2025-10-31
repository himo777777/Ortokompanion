# OpenAI Integration Guide

Denna guide visar hur du integrerar Ortokompanion med OpenAI för att använda riktig AI istället för mock-svar.

## Steg 1: Skaffa API-nyckel

1. Gå till [OpenAI Platform](https://platform.openai.com)
2. Logga in eller skapa ett konto
3. Navigera till API Keys
4. Skapa en ny API-nyckel
5. Kopiera nyckeln (du kommer inte kunna se den igen!)

## Steg 2: Konfigurera miljövariabler

1. Skapa en `.env.local` fil i projektets root:
```bash
cp .env.example .env.local
```

2. Lägg till din API-nyckel:
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Steg 3: Uppdatera Chat API

Ersätt innehållet i `app/api/chat/route.ts` med följande kod:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { EducationLevel } from '@/types/education';
import { educationLevels } from '@/data/levels';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, level } = await request.json();

    const levelInfo = educationLevels.find(l => l.id === level);

    if (!levelInfo) {
      return NextResponse.json(
        { error: 'Ogiltig utbildningsnivå' },
        { status: 400 }
      );
    }

    // Skapa system-prompt baserat på nivå
    const systemPrompt = \`Du är en expert inom ortopedi och fungerar som handledare för en \${levelInfo.name}.

Din roll:
- Ge tydliga, pedagogiska förklaringar anpassade efter nivån \${levelInfo.name}
- Fokusera på: \${levelInfo.focusAreas.join(', ')}
- Använd ett professionellt men tillgängligt språk
- Ge exempel från klinisk praktik när det är relevant
- Uppmuntra kritiskt tänkande
- Vid frågor om behandling, nämn alltid vikten av att konsultera aktuella riktlinjer

Svara alltid på svenska och anpassa svårighetsgraden efter användarens nivå.

Viktiga principer:
1. Säkerhet först - betona vikten av patientens välbefinnande
2. Evidensbaserad medicin - referera till aktuell forskning när relevant
3. Praktisk tillämpning - koppla teorin till klinisk praktik
4. Stegvis förklaring - börja enkelt och fördjupa vid behov

OBS: Detta är ett utbildningssystem. Uppmana alltid användaren att konsultera erfarna kollegor och aktuella kliniska riktlinjer i verkliga situationer.\`;

    // Anropa OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // eller "gpt-3.5-turbo" för lägre kostnad
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage = completion.choices[0].message.content;

    return NextResponse.json({
      message: assistantMessage
    });

  } catch (error: any) {
    console.error('OpenAI API error:', error);

    // Hantera specifika fel
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Ogiltig API-nyckel' },
        { status: 401 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'För många förfrågningar. Försök igen om en stund.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Ett fel uppstod vid kommunikation med AI' },
      { status: 500 }
    );
  }
}
```

## Steg 4: Testa integrationen

1. Starta utvecklingsservern:
```bash
npm run dev
```

2. Öppna [http://localhost:3000](http://localhost:3000)
3. Välj en utbildningsnivå
4. Ställ en fråga i AI-Handledaren
5. Verifiera att du får ett svar från OpenAI

## Kostnadsoptimering

### Val av modell

- **GPT-4 Turbo** (Rekommenderad): Bäst kvalitet, högre kostnad (~$0.01/1K tokens)
- **GPT-3.5 Turbo**: God kvalitet, lägre kostnad (~$0.0015/1K tokens)

### Tips för att minska kostnader

1. **Begränsa max_tokens**: Sätt ett lämpligt tak för svarlängd
2. **Cachning**: Implementera caching för vanliga frågor
3. **Rate limiting**: Begränsa antal förfrågningar per användare
4. **Streaming**: Använd streaming för bättre UX utan högre kostnad

```typescript
// Exempel med streaming
const stream = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [...],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  // Skicka innehåll till klienten
}
```

## Avancerade funktioner

### Fine-tuning

För ännu bättre resultat kan du fine-tuna en modell på ortopedisk data:

1. Samla in konversationer och exempel
2. Formatera data enligt OpenAI:s format
3. Använd OpenAI Fine-tuning API
4. Uppdatera modellnamnet i koden

### Embeddings för kunskapsbas

Använd embeddings för att skapa en semantisk sökning i ditt innehåll:

```typescript
// Skapa embeddings för dina fallstudier och moduler
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: "Ortopedisk text...",
});

// Använd för att hitta relevant innehåll baserat på användarfrågor
```

### Multimodal (Bilder)

Integrera GPT-4 Vision för att analysera röntgenbilder:

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4-vision-preview",
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "Analysera denna röntgenbild" },
        {
          type: "image_url",
          image_url: {
            url: imageUrl,
          },
        },
      ],
    },
  ],
});
```

## Säkerhet

### Bästa praxis

1. **Aldrig committa API-nycklar**: Använd .env-filer (redan i .gitignore)
2. **Använd miljövariabler**: Lagra känslig data i miljövariabler
3. **Rate limiting**: Implementera begränsningar per användare/IP
4. **Input validering**: Validera all användarinput
5. **Error handling**: Exponera inte känslig information i felmeddelanden

### Serverless-miljöer

Om du deployer till Vercel, Netlify eller liknande:

1. Lägg till miljövariabler i plattformens dashboard
2. Tänk på timeout-begränsningar (öka vid behov)
3. Överväg edge functions för bättre latency

## Felsökning

### Vanliga problem

**"Invalid API key"**
- Kontrollera att nyckeln är korrekt i .env.local
- Starta om utvecklingsservern efter att ha lagt till nyckeln

**"Rate limit exceeded"**
- Du har nått din kvot
- Uppgradera din OpenAI-plan eller vänta tills kvoten återställs

**Långa svarstider**
- Överväg att byta till GPT-3.5 Turbo
- Implementera streaming för bättre UX
- Reducera max_tokens

**Tomma svar**
- Kontrollera att du har tillräcklig kredit på ditt OpenAI-konto
- Verifiera att systemprompten inte är för restriktiv

## Support

För frågor eller problem:
- OpenAI Documentation: https://platform.openai.com/docs
- OpenAI Community: https://community.openai.com
- Projekt Issues: [GitHub Issues](projekt-url)

---

**OBS**: Håll alltid din API-nyckel hemlig. Dela aldrig den publikt eller committa den till git!
