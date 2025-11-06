/**
 * Goal-Aware Content Generator
 * Generates questions, clinical cases, and learning materials targeting specific Socialstyrelsen goals
 */

import OpenAI from 'openai';
import {
  ALL_FOCUSED_GOALS,
  type SocialstyrelsensGoal,
  getGoalsByProgram,
} from '@/data/focused-socialstyrelsen-goals';
import { VERIFIED_SOURCES } from '@/data/verified-sources';
import { generateGoalTargetedQuestion } from './goal-taxonomy';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export interface GoalAwareQuestion {
  id: string;
  domain: string;
  subdomain: string;
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'A' | 'B' | 'C' | 'D' | 'E';
  targetedGoals: string[];
  goalAlignment: {
    goalId: string;
    goalTitle: string;
    criteriaAddressed: string[];
    alignmentScore: number;
  }[];
  sources: string[];
  metadata: {
    generatedAt: Date;
    model: string;
    validated: boolean;
    qualityScore: number;
  };
}

export interface GoalAwareClinicalCase {
  id: string;
  title: string;
  presentation: string;
  patientAge: number;
  patientGender: 'M' | 'F';
  chiefComplaint: string;
  history: string;
  examination: string;
  investigations: string[];
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
  targetedGoals: string[];
  learningObjectives: string[];
  difficulty: 'grundläggande' | 'medel' | 'avancerad';
  estimatedTime: number;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  targetedGoals: SocialstyrelsensGoal[];
  content: {
    theory: string;
    clinicalPearls: string[];
    practicalTips: string[];
    commonMistakes: string[];
  };
  assessmentQuestions: GoalAwareQuestion[];
  estimatedCompletionTime: number;
  prerequisites: string[];
}

// ==================== QUESTION GENERATION ====================

/**
 * Generate multiple questions targeting a specific goal
 */
export async function generateQuestionsForGoal(
  goal: SocialstyrelsensGoal,
  count: number = 5,
  difficulties: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['B', 'C', 'D']
): Promise<GoalAwareQuestion[]> {
  console.log(`🎯 Generating ${count} questions for goal: ${goal.title}`);

  const questions: GoalAwareQuestion[] = [];

  // Get relevant sources
  const sources = goal.references || ['Campbell\'s Operative Orthopaedics'];

  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[i % difficulties.length];

    try {
      const generatedQ = await generateGoalTargetedQuestion(
        [goal],
        difficulty,
        sources
      );

      // Calculate quality score
      const qualityScore = await calculateQuestionQuality(
        generatedQ.question,
        generatedQ.explanation,
        goal
      );

      const question: GoalAwareQuestion = {
        id: `${goal.id}-q${i + 1}`,
        domain: goal.specialty.toUpperCase(),
        subdomain: goal.category,
        question: generatedQ.question,
        options: generatedQ.options,
        correctAnswer: generatedQ.correctAnswer,
        explanation: generatedQ.explanation,
        difficulty,
        targetedGoals: [goal.id],
        goalAlignment: [
          {
            goalId: goal.id,
            goalTitle: goal.title,
            criteriaAddressed: goal.assessmentCriteria.slice(0, 2),
            alignmentScore: qualityScore,
          },
        ],
        sources,
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4o',
          validated: qualityScore >= 0.85,
          qualityScore,
        },
      };

      questions.push(question);
      console.log(`  ✅ Generated question ${i + 1}/${count} (quality: ${(qualityScore * 100).toFixed(1)}%)`);

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  ❌ Error generating question ${i + 1}:`, error);
    }
  }

  return questions;
}

/**
 * Calculate question quality based on goal alignment
 */
async function calculateQuestionQuality(
  question: string,
  explanation: string,
  goal: SocialstyrelsensGoal
): Promise<number> {
  const prompt = `Bedöm hur väl denna fråga testar följande mål från Socialstyrelsen:

MÅL: ${goal.title}
Bedömningskriterier:
${goal.assessmentCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

FRÅGA: ${question}
FÖRKLARING: ${explanation}

Bedöm på en skala 0-100 hur väl frågan:
1. Testar konkreta bedömningskriterier från målet
2. Är kliniskt relevant för målet
3. Har korrekt svårighetsgrad för målnivån
4. Ger pedagogiskt värdefull feedback i förklaringen

Svara endast med ett nummer 0-100.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Du är en expert på medicinsk bedömning och kvalitetssäkring.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0,
      max_tokens: 10,
    });

    const score = parseInt(response.choices[0].message.content?.trim() || '70');
    return Math.min(100, Math.max(0, score)) / 100;
  } catch (error) {
    console.warn('Could not calculate quality score, using default 0.7');
    return 0.7;
  }
}

// ==================== CLINICAL CASE GENERATION ====================

/**
 * Generate clinical case targeting multiple goals
 */
export async function generateClinicalCaseForGoals(
  goals: SocialstyrelsensGoal[],
  difficulty: 'grundläggande' | 'medel' | 'avancerad'
): Promise<GoalAwareClinicalCase> {
  const primaryGoal = goals[0];

  const prompt = `Du är en expert på att skapa realistiska kliniska fall för svensk läkarutbildning.

MÅLSTYRNING:
Detta fall ska testa följande mål från Socialstyrelsen:

${goals.map((g, i) => `
MÅL ${i + 1}: ${g.title} (${g.program.toUpperCase()})
Bedömningskriterier:
${g.assessmentCriteria.map((c) => `- ${c}`).join('\n')}
${g.clinicalScenarios ? `Scenarier: ${g.clinicalScenarios.join(', ')}` : ''}
`).join('\n')}

SVÅRIGHETSGRAD: ${difficulty}

Skapa ett realistiskt kliniskt fall som testar dessa mål. Fallet ska:
1. Vara baserat på verkliga kliniska scenarier från svenska sjukhus
2. Inkludera relevanta anamnes, status och utredningar
3. Ha 3-5 frågor som testar olika aspekter av målen
4. Vara pedagogiskt och ge lärandetillfällen

FORMATERA SOM JSON:
{
  "title": "Kort beskrivande titel",
  "presentation": "Patient kommer till...",
  "patientAge": 65,
  "patientGender": "M",
  "chiefComplaint": "Vad patienten söker för",
  "history": "Detaljerad anamnes...",
  "examination": "Fynd vid undersökning...",
  "investigations": ["Blodprover visar...", "Röntgen visar..."],
  "questions": [
    {
      "question": "Vad är din primära misstanke?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Förklaring med koppling till mål..."
    }
  ],
  "learningObjectives": ["Efter detta fall ska läkaren kunna..."],
  "estimatedTime": 15
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'Du är expert på klinisk medicinsk pedagogik och skapar realistiska fall.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });

  const caseData = JSON.parse(response.choices[0].message.content || '{}');

  const clinicalCase: GoalAwareClinicalCase = {
    id: `case-${primaryGoal.id}-${Date.now()}`,
    title: caseData.title,
    presentation: caseData.presentation,
    patientAge: caseData.patientAge,
    patientGender: caseData.patientGender,
    chiefComplaint: caseData.chiefComplaint,
    history: caseData.history,
    examination: caseData.examination,
    investigations: caseData.investigations,
    questions: caseData.questions,
    targetedGoals: goals.map((g) => g.id),
    learningObjectives: caseData.learningObjectives,
    difficulty,
    estimatedTime: caseData.estimatedTime || 20,
  };

  return clinicalCase;
}

// ==================== LEARNING MODULE GENERATION ====================

/**
 * Generate complete learning module for a goal
 */
export async function generateLearningModuleForGoal(
  goal: SocialstyrelsensGoal
): Promise<LearningModule> {
  console.log(`📚 Generating learning module for: ${goal.title}`);

  // Generate theory content
  const theoryPrompt = `Skapa pedagogiskt innehåll för följande Socialstyrelsen-mål:

MÅL: ${goal.title}
Beskrivning: ${goal.description}
Program: ${goal.program.toUpperCase()}

Bedömningskriterier som ska täckas:
${goal.assessmentCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Skapa:
1. Teoretisk genomgång (500 ord) med svensk terminologi
2. 5 kliniska pärlor (praktiska tips)
3. 5 praktiska råd för kliniken
4. 5 vanliga misstag att undvika

Använd källor: ${goal.references?.join(', ') || 'Standard svenska riktlinjer'}

Formatera som JSON.`;

  const theoryResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: theoryPrompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const theoryContent = JSON.parse(
    theoryResponse.choices[0].message.content || '{}'
  );

  // Generate assessment questions
  const assessmentQuestions = await generateQuestionsForGoal(goal, 5, [
    'B',
    'C',
    'C',
    'D',
    'D',
  ]);

  const learningModule: LearningModule = {
    id: `module-${goal.id}`,
    title: `Lärandeområde: ${goal.title}`,
    description: goal.description,
    targetedGoals: [goal],
    content: {
      theory: theoryContent.theory || '',
      clinicalPearls: theoryContent.clinicalPearls || [],
      practicalTips: theoryContent.practicalTips || [],
      commonMistakes: theoryContent.commonMistakes || [],
    },
    assessmentQuestions,
    estimatedCompletionTime: 45,
    prerequisites: [],
  };

  return learningModule;
}

// ==================== BATCH GENERATION ====================

/**
 * Generate content for all goals in a program
 */
export async function generateContentForProgram(
  program: 'bt' | 'at' | 'st',
  specialty: string,
  contentType: 'questions' | 'cases' | 'modules' = 'questions'
): Promise<{
  generated: number;
  failed: number;
  items: Array<GoalAwareQuestion | GoalAwareClinicalCase | LearningModule>;
}> {
  const goals = getGoalsByProgram(program).filter(
    (g) => g.specialty === specialty || specialty === 'all'
  );

  console.log(
    `🎯 Generating ${contentType} for ${goals.length} goals in ${program.toUpperCase()}`
  );

  const items: Array<
    GoalAwareQuestion | GoalAwareClinicalCase | LearningModule
  > = [];
  let generated = 0;
  let failed = 0;

  for (const goal of goals) {
    try {
      if (contentType === 'questions') {
        const questions = await generateQuestionsForGoal(goal, 3, ['B', 'C', 'D']);
        items.push(...questions);
        generated += questions.length;
      } else if (contentType === 'cases') {
        const clinicalCase = await generateClinicalCaseForGoals([goal], 'medel');
        items.push(clinicalCase);
        generated++;
      } else if (contentType === 'modules') {
        const learningModule = await generateLearningModuleForGoal(goal);
        items.push(learningModule);
        generated++;
      }

      console.log(`  ✅ Completed goal ${goal.id}: ${goal.title}`);

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`  ❌ Failed goal ${goal.id}:`, error);
      failed++;
    }
  }

  return { generated, failed, items };
}

// ==================== PROGRESS-BASED GENERATION ====================

/**
 * Generate personalized content based on user's progress
 */
export async function generatePersonalizedContent(
  userId: string,
  userProgram: 'bt' | 'at' | 'st',
  userSpecialty: string,
  completedGoalIds: string[],
  weakCompetencyAreas: string[]
): Promise<{
  recommendedGoals: SocialstyrelsensGoal[];
  generatedQuestions: GoalAwareQuestion[];
  generatedCases: GoalAwareClinicalCase[];
}> {
  // Find goals user hasn't completed
  const allRelevantGoals = getGoalsByProgram(userProgram).filter(
    (g) =>
      (g.specialty === userSpecialty || g.specialty === 'allmänmedicin') &&
      !completedGoalIds.includes(g.id)
  );

  // Prioritize goals in weak areas
  const prioritizedGoals = allRelevantGoals
    .map((goal) => {
      let priority = goal.required ? 10 : 5;

      weakCompetencyAreas.forEach((area) => {
        if (goal.competencyArea === area) priority += 5;
      });

      return { goal, priority };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)
    .map((g) => g.goal);

  console.log(`👤 Generating personalized content for user ${userId}`);
  console.log(`   Focusing on ${prioritizedGoals.length} priority goals`);

  // Generate content for top priority goals
  const generatedQuestions: GoalAwareQuestion[] = [];
  const generatedCases: GoalAwareClinicalCase[] = [];

  for (const goal of prioritizedGoals.slice(0, 3)) {
    // Top 3 goals
    const questions = await generateQuestionsForGoal(goal, 2, ['C', 'D']);
    generatedQuestions.push(...questions);
  }

  // Generate one clinical case covering multiple goals
  if (prioritizedGoals.length >= 2) {
    const clinicalCase = await generateClinicalCaseForGoals(
      prioritizedGoals.slice(0, 2),
      'medel'
    );
    generatedCases.push(clinicalCase);
  }

  return {
    recommendedGoals: prioritizedGoals,
    generatedQuestions,
    generatedCases,
  };
}

const GoalAwareGenerator = {
  generateQuestionsForGoal,
  generateClinicalCaseForGoals,
  generateLearningModuleForGoal,
  generateContentForProgram,
  generatePersonalizedContent,
};

export default GoalAwareGenerator;
