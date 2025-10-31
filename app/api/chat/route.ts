import { NextRequest, NextResponse } from 'next/server';
import { EducationLevel } from '@/types/education';
import { educationLevels } from '@/data/levels';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { messages, level, context } = await request.json();

    // Get OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback to mock response if no API key
      const levelInfo = educationLevels.find(l => l.id === level);
      const mockResponse = generateMockResponse(messages[messages.length - 1].content, level, levelInfo);
      return NextResponse.json({ message: mockResponse });
    }

    const levelInfo = educationLevels.find(l => l.id === level);

    // Build AI system prompt
    const systemPrompt = `Du är en erfaren svensk ortopedkirurg och expert pedagog.

ANVÄNDARENS NIVÅ: ${level} (${levelInfo?.name})

DIN ROLL:
- Ge pedagogiska, kliniskt relevanta svar på svenska
- Anpassa svårighetsgrad till användarens nivå
- Använd svenska medicinska termer
- Hänvisa till svenska riktlinjer (SVORF, Socialstyrelsen, ATLS Sverige)
- Ge konkreta exempel från klinisk praktik
- Var uppmuntrande och tydlig

NIVÅANPASSNING:
- Student: Grundläggande koncept, enkla förklaringar, patofysiologi
- AT: Praktisk tillämpning, vanliga tillstånd, akut handläggning
- ST1-ST2: Fördjupade kunskaper, operativa principer, klassifikationer
- ST3-ST5: Avancerade tekniker, komplikationer, subspecialisering
- Specialist: Expert-nivå, rare cases, senaste forskning

FOKUSOMRÅDEN FÖR ${levelInfo?.name}:
${levelInfo?.focusAreas.map(area => `- ${area}`).join('\n')}

${context?.currentTopic ? `AKTUELLT ÄMNE: ${context.currentTopic}` : ''}

Ge alltid:
1. Konkret svar på frågan (svenska termer!)
2. Kliniskt exempel om relevant
3. Referenser till svenska källor när möjligt (SVORF, Rikshöft, Riksknä, Socialstyrelsen)
4. Tips för att komma ihåg (mnemonik om relevant)`;

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error');
      // Fallback to mock
      const mockResponse = generateMockResponse(messages[messages.length - 1].content, level, levelInfo);
      return NextResponse.json({ message: mockResponse });
    }

    const data = await response.json();

    return NextResponse.json({
      message: data.choices[0].message.content,
      usage: data.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    // Fallback to mock on error
    const { messages, level } = await request.json();
    const levelInfo = educationLevels.find(l => l.id === level);
    const mockResponse = generateMockResponse(messages[messages.length - 1].content, level, levelInfo);
    return NextResponse.json({ message: mockResponse });
  }
}

function generateMockResponse(userMessage: string, level: EducationLevel, levelInfo: any): string {
  const lowerMessage = userMessage.toLowerCase();

  // Fraktur-relaterade frågor
  if (lowerMessage.includes('fraktur') || lowerMessage.includes('brott')) {
    if (level === 'student') {
      return `Som läkarstudent är det viktigt att förstå grunderna i frakturbehandling:

1. **ABCDE-bedömning först** - särskilt vid trauma
2. **Klinisk undersökning**: Inspektion (deformitet, svullnad), palpation (smärta, krepitationer), funktion (rörelse, belastning), neurovaskulär status
3. **Bilddiagnostik**: Röntgen i två plan som minimum
4. **Klassificering**: Öppen vs sluten, lokalisation, frakturtyp

**Vanliga frakturer att kunna:**
- Colles fraktur (distala radius)
- Scaphoidfraktur
- Collumfraktur (höftled)
- Fotledsfraktur

Har du frågor om någon specifik frakturtyp?`;
    } else if (level === 'at') {
      return `Som AT-läkare ska du kunna handlägga de flesta frakturer akut:

**Akut handläggning:**
1. Smärtlindring (adekvat!)
2. Reposition om indikerat
3. Immobilisering
4. Neurovaskulär kontroll före/efter reposition
5. Beslut om konservativ vs kirurgisk behandling

**Gipsning:**
- Kan du göra säkert: Colles, fotled, underarm
- Viktigt: Max 2/3 av omkretsen initialt (svullnad!)
- Kontroll av neurovaskulär status

**När ska patienten till ortopedjouren?**
- Öppna frakturer
- Neurovaskulär påverkan
- Ledengagerade frakturer
- Instabila frakturer
- Dislokerade frakturer som kräver operation

Vill du gå igenom någon specifik situation?`;
    } else {
      return `På ST-nivå förväntas du kunna:

**Operativ behandling:**
- Välja rätt fixationsmetod (K-tråd, platta, märgspik, extern fixation)
- Förstå biomekanimiska principer
- Komplikationshantering

**Avancerade koncept:**
- AO-klassifikation
- Mjukdelsskador vid frakturer
- Kompartmentsyndrom
- Pseudartros och malunion

**För ${levelInfo?.name}:**
${levelInfo?.focusAreas.map((area: string) => `- ${area}`).join('\n')}

Vilken specifik aspekt vill du fördjupa dig i?`;
    }
  }

  // Artros och ledersättning
  if (lowerMessage.includes('artros') || lowerMessage.includes('protes') || lowerMessage.includes('tha') || lowerMessage.includes('tka')) {
    if (level === 'student' || level === 'at') {
      return `**Artros - grundläggande kunskaper:**

**Patofysiologi:**
- Nedbrytning av ledbrosk
- Subkondral skleros
- Osteofyter
- Synovit

**Kliniska fynd:**
- Smärta (belastningsutlöst, värre vid dagens slut)
- Stelhet (morgonstelhet <30 min)
- Krepitationer
- Begränsad rörelseomfång
- Eventuell deformitet

**Konservativ behandling (första linje):**
1. Viktnedgång om övervikt
2. Fysioterapi och träning
3. NSAID/paracetamol
4. Hjälpmedel (käpp, rollator)
5. Intraartikulära injektioner (kortison, hyaluronsyra)

**Kirurgi övervägs när:**
- Konservativ behandling misslyckas
- Betydande funktionsinskränkning
- Nedsatt livskvalitet
- Röntgenförändringar stämmer med symtom`;
    } else {
      return `**Artroplastik - avancerad nivå:**

**Preoperativ planering:**
- Templering för korrekt implantatstorlek
- Bedömning av benkvalitet
- Deformitetskorrigering
- Val av fixationsmetod (cementerad/ocementerad)

**Operativa överväganden:**
- Tillvägagångssätt (lateral, posterior, anterior)
- Implantatval och design
- Soft tissue balansering
- Benförberedelse

**Komplikationer:**
- Infektion (tidig <3 mån, sen >3 mån, PJI)
- Luxation
- Benförlust
- Aseptisk lossning
- Neurologisk/vaskulär skada

**Revisionskirurgi (specialist-nivå):**
- Paprosky-klassificering av benförlust
- Augments och custom-implantat
- Dual mobility cups
- Komplexa rekonstruktioner

Vad vill du fokusera på?`;
    }
  }

  // Akuta ortopediska tillstånd
  if (lowerMessage.includes('akut') || lowerMessage.includes('trauma')) {
    return `**Akut ortopedi - prioriteringar:**

**ATLS-principer gäller:**
1. A - Airway (med c-spine kontroll)
2. B - Breathing
3. C - Circulation (blödningskontroll!)
4. D - Disability
5. E - Exposure

**Life-threatening ortopediska skador:**
- Öppen bäckenfraktur (massiv blödning)
- Bilateral femurfraktur (blodsock)
- Öppen ledskada
- Vaskulär skada
- Kompartmentsyndrom

**Tidskritiska ortopediska åtgärder:**
1. **Omedelbart (0-2h):**
   - Öppna frakturer (debridering)
   - Vaskulär skada
   - Kompartmentsyndrom

2. **Akut (2-24h):**
   - Instabila frakturer
   - Dislocerade ledfrakturer
   - Femurfraktur hos polytrauma

3. **Brådskande (24-48h):**
   - Höftfraktur hos äldre
   - Andra instabila frakturer

Som ${levelInfo?.name} ska du kunna prioritera och initiera rätt behandling.`;
  }

  // Sportmedicin
  if (lowerMessage.includes('sport') || lowerMessage.includes('knä') || lowerMessage.includes('korsband')) {
    return `**Sportortopedi:**

**Vanliga knäskador:**

**Främre korsbandsskada (ACL):**
- Mekanism: Rotationstrauma, hyperextension
- Klinik: "Pang", svullnad, instabilitet
- Undersökning: Lachman, anterior drawer, pivot shift
- Behandling: Konservativ möjlig om låg aktivitet, rekonstruktion för aktiva

**Meniskskada:**
- Typer: Radiär, hink-öra (bucket handle), degenerativ
- Klinik: Smärta, låsning, svullnad
- Behandling: Partiell meniskektomi vs menisksutur

**Fotbollsskador:**
- ACL + MCL + menisk = "Terrible triad"
- Isolerad MCL: Ofta konservativ
- Lateral kollateralband: Mer sällan, ofta kombinerad skada

**Rehabilitering:**
- Fas 1: Svullnadskontroll, ROM
- Fas 2: Styrka, proprioception
- Fas 3: Sport-specifik träning
- Return to sport: 9-12 månader efter ACL-rekonstruktion

Specifik fråga om något?`;
  }

  // Default svar
  return `Tack för din fråga! Som ${levelInfo?.name} kan jag hjälpa dig med:

${levelInfo?.focusAreas.map((area: string) => `• ${area}`).join('\n')}

Jag är här för att hjälpa dig lära dig ortopedi på din nivå. Några förslag på vad vi kan diskutera:

- Specifika skador eller tillstånd
- Behandlingsalgoritmer
- Operativa tekniker
- Kliniska fall
- Röntgenbildstolkning
- Komplikationshantering

Vad skulle du vilja veta mer om?`;
}
