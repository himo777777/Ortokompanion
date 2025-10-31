/**
 * AI Service - OpenAI Integration
 * Next-level AI intelligence for OrtoKompanion
 *
 * Features:
 * - Personalized explanations
 * - Knowledge gap analysis
 * - Adaptive hints generation
 * - Clinical reasoning analysis
 * - Study plan generation
 * - Conversational tutoring
 */

import { MCQQuestion } from '@/data/questions';
import { SRSCard } from '@/types/progression';
import { Domain } from '@/types/onboarding';

// AI Service Configuration
const AI_CONFIG = {
  model: 'gpt-4o-mini', // Fast and cost-effective
  temperature: 0.7,
  maxTokens: 1000,
};

/**
 * AI-powered personalized explanation generator
 * Explains why the user got a question wrong based on their answer
 */
export async function generatePersonalizedExplanation(params: {
  question: MCQQuestion;
  userAnswer: string;
  correctAnswer: string;
  previousMistakes?: string[]; // Topics user struggles with
}): Promise<{
  explanation: string;
  keyTakeaway: string;
  relatedConcepts: string[];
  studyRecommendation: string;
}> {
  const prompt = `Du är en erfaren svensk ortopedkirurg och pedagog. En ST-läkare har precis svarat fel på denna fråga:

FRÅGA: ${params.question.question}

KORREKT SVAR: ${params.correctAnswer}
ANVÄNDARENS SVAR: ${params.userAnswer}

STANDARDFÖRKLARING: ${params.question.explanation}

${params.previousMistakes ? `TIDIGARE SVÅRIGHETER: Användaren har tidigare haft problem med: ${params.previousMistakes.join(', ')}` : ''}

Ge en PERSONLIG förklaring anpassad för denna användare som:
1. Förklarar varför deras svar var felaktigt (utan att vara nedlåtande)
2. Kopplar till eventuella tidigare svårigheter
3. Ger konkreta tips för att komma ihåg detta nästa gång
4. Är kortfattad men pedagogisk (max 150 ord)

Svara i JSON-format:
{
  "explanation": "Din personliga förklaring här",
  "keyTakeaway": "Den viktigaste lärdomen (1 mening)",
  "relatedConcepts": ["Koncept 1", "Koncept 2", "Koncept 3"],
  "studyRecommendation": "Vad användaren bör studera härnäst"
}`;

  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          { role: 'system', content: 'Du är en expert svensk ortopedkirurg och pedagog.' },
          { role: 'user', content: prompt }
        ],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    return JSON.parse(data.content);
  } catch (error) {
    console.error('AI explanation error:', error);
    // Fallback to standard explanation
    return {
      explanation: params.question.explanation,
      keyTakeaway: 'Se standardförklaring ovan',
      relatedConcepts: params.question.tags || [],
      studyRecommendation: 'Repetera detta ämne',
    };
  }
}

/**
 * AI-powered knowledge gap analysis
 * Analyzes user performance and identifies specific gaps
 */
export async function analyzeKnowledgeGaps(params: {
  performanceHistory: Array<{
    questionId: string;
    question: MCQQuestion;
    correct: boolean;
    hintsUsed: number;
    timeSpent: number;
  }>;
  userLevel: string;
  targetGoals?: string[];
}): Promise<{
  gaps: Array<{
    topic: string;
    severity: 'critical' | 'moderate' | 'minor';
    evidence: string[];
    recommendation: string;
  }>;
  strengths: string[];
  overallAssessment: string;
  priorityStudyTopics: string[];
}> {
  const recentPerformance = params.performanceHistory.slice(-20); // Last 20 questions

  const prompt = `Du är en AI-driven pedagogisk assistent för ortopedisk utbildning.

Analysera denna användarens prestationshistorik:

ANVÄNDARENS NIVÅ: ${params.userLevel}

SENASTE 20 FRÅGOR:
${recentPerformance.map((p, i) => `
${i + 1}. Domän: ${p.question.domain}, Band: ${p.question.band}
   Korrekt: ${p.correct ? 'Ja' : 'Nej'}
   Hints: ${p.hintsUsed}
   Tid: ${p.timeSpent}s
   Tags: ${p.question.tags.join(', ')}
`).join('\n')}

${params.targetGoals ? `MÅL: ${params.targetGoals.join(', ')}` : ''}

Identifiera:
1. Kunskapsluckor (topics där användaren konsekvent misslyckas)
2. Styrkor (topics där användaren presterar bra)
3. Prioriterade studieområden
4. Övergripande bedömning

Svara i JSON-format:
{
  "gaps": [
    {
      "topic": "Ämne",
      "severity": "critical/moderate/minor",
      "evidence": ["Bevis 1", "Bevis 2"],
      "recommendation": "Vad ska göras"
    }
  ],
  "strengths": ["Styrka 1", "Styrka 2"],
  "overallAssessment": "Övergripande bedömning (2-3 meningar)",
  "priorityStudyTopics": ["Prioritet 1", "Prioritet 2", "Prioritet 3"]
}`;

  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          { role: 'system', content: 'Du är en expert på medicinsk pedagogik och kunskapsanalys.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5, // Lower for more analytical response
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    return JSON.parse(data.content);
  } catch (error) {
    console.error('AI gap analysis error:', error);
    return {
      gaps: [],
      strengths: [],
      overallAssessment: 'Kunde inte analysera data',
      priorityStudyTopics: [],
    };
  }
}

/**
 * AI-generated adaptive hints
 * Creates personalized hints based on user's learning style and history
 */
export async function generateAdaptiveHints(params: {
  question: MCQQuestion;
  userLevel: string;
  learningStyle?: 'visual' | 'analytical' | 'clinical' | 'mixed';
  previousAttempts?: number;
}): Promise<{
  hints: [string, string, string]; // 3 progressive hints
  teachingPoints: string[];
  mnemonicOrTrick?: string;
}> {
  const prompt = `Du är en pedagog som skapar adaptiva ledtrådar för ortopedisk utbildning.

FRÅGA: ${params.question.question}

ALTERNATIV:
${params.question.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}

KORREKT SVAR: ${params.question.correctAnswer}

ANVÄNDARNIVÅ: ${params.userLevel}
INLÄRNINGSSTIL: ${params.learningStyle || 'mixed'}
${params.previousAttempts ? `TIDIGARE FÖRSÖK: ${params.previousAttempts}` : ''}

Skapa 3 progressiva ledtrådar:
- Hint 1: Generell riktning, inga direkta svar
- Hint 2: Avgränsa alternativ, uteslut fel svar
- Hint 3: Direkt vägledning mot rätt svar

Anpassa efter inlärningsstil:
- Visual: Anatomiska landmärken, visuella referenser
- Analytical: Systematisk uteslutning, differentialdiagnoser
- Clinical: Kliniska tecken, praktiska tips
- Mixed: Kombination

Lägg till minnesregler om möjligt.

Svara i JSON-format:
{
  "hints": ["Hint 1", "Hint 2", "Hint 3"],
  "teachingPoints": ["Punkt 1", "Punkt 2", "Punkt 3"],
  "mnemonicOrTrick": "Minnesregel (om relevant)"
}`;

  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          { role: 'system', content: 'Du är expert på pedagogik och minnesregler inom medicin.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8, // Higher for creativity
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    return JSON.parse(data.content);
  } catch (error) {
    console.error('AI hints error:', error);
    // Fallback to basic hints
    return {
      hints: [
        'Tänk på grundläggande principer inom detta område.',
        'Fundera på vilket alternativ som verkar minst troligt.',
        'Överväg de vanligaste scenarierna i klinisk praktik.'
      ],
      teachingPoints: params.question.tags || [],
      mnemonicOrTrick: undefined,
    };
  }
}

/**
 * AI conversational tutor
 * Interactive Q&A about orthopedic topics
 */
export async function chatWithAITutor(params: {
  userMessage: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: {
    currentTopic?: string;
    userLevel?: string;
    recentQuestions?: MCQQuestion[];
  };
}): Promise<{
  response: string;
  suggestedQuestions?: string[];
  relatedContent?: string[];
}> {
  const systemPrompt = `Du är en erfaren svensk ortopedkirurg och pedagog som hjälper ST-läkare att lära sig ortopedi.

REGLER:
- Svara på svenska
- Var pedagogisk och uppmuntrande
- Ge konkreta, kliniskt relevanta svar
- Använd svenska medicinska termer
- Hänvisa till svenska riktlinjer när relevant (SVORF, Socialstyrelsen)
- Förklara komplexa koncept steg-för-steg
- Ge exempel från klinisk praktik

${params.context?.currentTopic ? `AKTUELLT ÄMNE: ${params.context.currentTopic}` : ''}
${params.context?.userLevel ? `ANVÄNDARNIVÅ: ${params.context.userLevel}` : ''}`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...params.conversationHistory,
    { role: 'user' as const, content: params.userMessage },
  ];

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    // Generate suggested follow-up questions
    const suggestedQuestions = await generateFollowUpQuestions({
      topic: params.context?.currentTopic || 'ortopedi',
      userLevel: params.context?.userLevel || 'st1',
    });

    return {
      response: data.content,
      suggestedQuestions: suggestedQuestions.slice(0, 3),
      relatedContent: [],
    };
  } catch (error) {
    console.error('AI chat error:', error);
    return {
      response: 'Jag har för tillfället problem med att svara. Försök igen snart!',
      suggestedQuestions: [],
      relatedContent: [],
    };
  }
}

/**
 * AI-generated follow-up questions
 * Creates deeper learning questions based on topic
 */
async function generateFollowUpQuestions(params: {
  topic: string;
  userLevel: string;
}): Promise<string[]> {
  const prompt = `Generera 3 uppföljningsfrågor för en ${params.userLevel} om ${params.topic}.
Frågorna ska:
- Fördjupa förståelsen
- Vara kliniskt relevanta
- Bygga på grundkonceptet

Svara med en array av frågor: ["Fråga 1", "Fråga 2", "Fråga 3"]`;

  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Du genererar pedagogiska följdfrågor.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    const parsed = JSON.parse(data.content);
    return parsed.questions || [];
  } catch (error) {
    return [];
  }
}

/**
 * AI-powered SRS optimization
 * Predicts which cards user will forget and adjusts scheduling
 */
export async function optimizeSRSSchedule(params: {
  cards: SRSCard[];
  recentPerformance: Array<{
    cardId: string;
    grade: number;
    timeSpent: number;
    hintsUsed: number;
  }>;
}): Promise<{
  predictions: Array<{
    cardId: string;
    forgettingProbability: number; // 0-1
    recommendedReviewDate: Date;
    reason: string;
  }>;
  optimizationSuggestions: string[];
}> {
  // This would use ML model in production, for now use heuristics + AI insights
  const predictions = params.cards.map(card => {
    const performance = params.recentPerformance.find(p => p.cardId === card.id);

    let forgettingProbability = 0.5; // Default

    if (performance) {
      // Higher probability if: low grade, many hints, slow time
      forgettingProbability =
        (1 - (performance.grade / 5)) * 0.5 +
        (performance.hintsUsed / 3) * 0.3 +
        (performance.timeSpent > 120 ? 0.2 : 0);
    }

    // Adjust based on stability
    forgettingProbability *= (1 - card.stability);

    // Recommend earlier review if high probability
    const daysToAdd = forgettingProbability > 0.7 ?
      Math.floor(card.interval * 0.5) :
      card.interval;

    const recommendedDate = new Date();
    recommendedDate.setDate(recommendedDate.getDate() + daysToAdd);

    return {
      cardId: card.id,
      forgettingProbability,
      recommendedReviewDate: recommendedDate,
      reason: forgettingProbability > 0.7 ?
        'Hög risk att glömma - tidig repetition rekommenderas' :
        forgettingProbability > 0.4 ?
        'Måttlig retention - följ standardschema' :
        'God retention - kan vänta'
    };
  });

  return {
    predictions: predictions.sort((a, b) => b.forgettingProbability - a.forgettingProbability),
    optimizationSuggestions: [
      'Fokusera på kort med hög glömskesannolikhet',
      'Använd aktiv recall istället för passiv läsning',
      'Repetera svåra kort samma dag',
    ],
  };
}

/**
 * AI clinical reasoning analyzer
 * Analyzes decision-making in clinical cases
 */
export async function analyzeDecisionMaking(params: {
  caseId: string;
  userDecisions: Array<{
    nodeId: string;
    optionChosen: string;
    isOptimal: boolean;
    timeSpent: number;
  }>;
  caseContext: string;
}): Promise<{
  reasoningQuality: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  strengths: string[];
  weaknesses: string[];
  specificFeedback: Array<{
    decision: string;
    feedback: string;
    improvement: string;
  }>;
  overallRecommendation: string;
}> {
  const prompt = `Analysera denna ST-läkares kliniska beslutsfattande:

CASE: ${params.caseContext}

BESLUT:
${params.userDecisions.map((d, i) => `
Beslut ${i + 1}: ${d.optionChosen}
- Optimalt: ${d.isOptimal ? 'Ja' : 'Nej'}
- Beslutst: ${d.timeSpent}s
`).join('\n')}

Analysera:
1. Kvalitet på kliniskt resonemang
2. Styrkor i beslutsfattandet
3. Svagheter och förbättringsområden
4. Specifik feedback per beslut
5. Övergripande rekommendation

Svara i JSON-format med bedömning och konstruktiv feedback.`;

  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          { role: 'system', content: 'Du är en klinisk handledare som analyserar ST-läkares beslutsfattande.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    return JSON.parse(data.content);
  } catch (error) {
    console.error('AI decision analysis error:', error);
    return {
      reasoningQuality: 'good',
      strengths: ['Slutförde caset'],
      weaknesses: [],
      specificFeedback: [],
      overallRecommendation: 'Fortsätt öva på beslutsfattande',
    };
  }
}

/**
 * AI study plan generator
 * Creates personalized study plan based on goals and performance
 */
export async function generateStudyPlan(params: {
  userLevel: string;
  targetGoals: string[];
  weakDomains: Domain[];
  availableTimePerDay: number; // minutes
  deadline?: Date;
}): Promise<{
  weeklyPlan: Array<{
    day: number;
    activities: Array<{
      type: 'questions' | 'cases' | 'reading' | 'review';
      domain: Domain;
      estimatedTime: number;
      priority: 'high' | 'medium' | 'low';
      goal: string;
    }>;
  }>;
  milestones: Array<{
    week: number;
    goal: string;
    successCriteria: string;
  }>;
  recommendations: string[];
}> {
  const prompt = `Skapa en personlig studieplan för en ${params.userLevel}:

MÅL: ${params.targetGoals.join(', ')}
SVAGA OMRÅDEN: ${params.weakDomains.join(', ')}
TILLGÄNGLIG TID: ${params.availableTimePerDay} min/dag
${params.deadline ? `DEADLINE: ${params.deadline.toLocaleDateString('sv-SE')}` : ''}

Skapa en 4-veckors plan som:
- Prioriterar svaga områden
- Balanserar nya koncept och repetition
- Inkluderar varierade aktivitetstyper
- Är realistisk för tillgänglig tid
- Sätter tydliga milstolpar

Svara i JSON-format med daglig plan och veckoplstolpar.`;

  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          { role: 'system', content: 'Du är en expert på medicinsk studieplanering.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    return JSON.parse(data.content);
  } catch (error) {
    console.error('AI study plan error:', error);
    return {
      weeklyPlan: [],
      milestones: [],
      recommendations: ['Studera regelbundet', 'Fokusera på svaga områden'],
    };
  }
}

/**
 * AI performance insights and coaching
 * Provides motivational coaching based on performance trends
 */
export async function generatePerformanceInsights(params: {
  recentSessions: Array<{
    date: Date;
    accuracy: number;
    xpEarned: number;
    timeSpent: number;
    hintsUsed: number;
  }>;
  currentStreak: number;
  goalsAchieved: number;
  totalGoals: number;
}): Promise<{
  insights: string[];
  encouragement: string;
  recommendations: string[];
  nextMilestone: string;
  estimatedTimeToMilestone: string;
}> {
  const recentAccuracy = params.recentSessions.slice(-7).reduce((sum, s) => sum + s.accuracy, 0) /
    Math.min(7, params.recentSessions.length);

  const trend = params.recentSessions.length >= 2 ?
    params.recentSessions[params.recentSessions.length - 1].accuracy >
    params.recentSessions[params.recentSessions.length - 2].accuracy ?
    'förbättring' : 'försämring' : 'stabil';

  const prompt = `Ge motiverande feedback till en ST-läkare:

SENASTE 7 DAGARNA:
- Genomsnittlig träffsäkerhet: ${(recentAccuracy * 100).toFixed(0)}%
- Trend: ${trend}
- Streak: ${params.currentStreak} dagar
- Mål uppnådda: ${params.goalsAchieved}/${params.totalGoals}

Ge:
1. 3-4 specifika insikter om prestationen
2. Personlig uppmuntran
3. Konkreta rekommendationer
4. Nästa milstolpe att sikta på
5. Uppskattad tid till milstolpen

Var positiv och specifik, inte generisk!

Svara i JSON-format.`;

  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Du är en uppmuntrande lärarcoach inom medicin.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    return JSON.parse(data.content);
  } catch (error) {
    console.error('AI insights error:', error);
    return {
      insights: ['Du gör framsteg!'],
      encouragement: 'Fortsätt så här!',
      recommendations: ['Fortsätt träna regelbundet'],
      nextMilestone: 'Nästa mål',
      estimatedTimeToMilestone: '2 veckor',
    };
  }
}
