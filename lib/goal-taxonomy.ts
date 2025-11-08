/**
 * Goal Taxonomy System
 * Semantic embedding-based goal classification and content mapping
 */

import OpenAI from 'openai';
import {
  ALL_FOCUSED_GOALS,
  type SocialstyrelsensGoal,
} from '@/data/focused-socialstyrelsen-goals';
import { logger } from './logger';

// Lazy initialize OpenAI client only when needed (optional for viewing existing content)
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is required for AI-powered features. Add NEXT_PUBLIC_OPENAI_API_KEY to .env.local');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export interface GoalEmbedding {
  goalId: string;
  embedding: number[];
  metadata: {
    program: string;
    specialty: string;
    category: string;
    competencyArea: string;
    keywords: string[];
  };
}

export interface GoalMatch {
  goal: SocialstyrelsensGoal;
  similarity: number;
  matchReason: string;
}

export interface ContentGoalMapping {
  contentId: string;
  contentType: 'question' | 'clinical-pearl' | 'case' | 'activity';
  mappedGoals: GoalMatch[];
  confidence: number;
  autoMapped: boolean;
}

// ==================== EMBEDDING GENERATION ====================

/**
 * Generate semantic embedding for a goal
 */
export async function generateGoalEmbedding(
  goal: SocialstyrelsensGoal
): Promise<GoalEmbedding> {
  // Create rich text representation of goal
  const goalText = `
    Program: ${goal.program}
    Specialty: ${goal.specialty}
    Title: ${goal.title}
    Description: ${goal.description}
    Category: ${goal.category}
    Competency Area: ${goal.competencyArea}
    Assessment Criteria: ${goal.assessmentCriteria.join('. ')}
    ${goal.clinicalScenarios ? `Clinical Scenarios: ${goal.clinicalScenarios.join('. ')}` : ''}
    ${goal.associatedDiagnoses ? `Diagnoses: ${goal.associatedDiagnoses.join(', ')}` : ''}
    ${goal.associatedProcedures ? `Procedures: ${goal.associatedProcedures.join(', ')}` : ''}
  `.trim();

  const client = getOpenAIClient();
  const response = await client.embeddings.create({
    model: 'text-embedding-3-large',
    input: goalText,
    dimensions: 1536,
  });

  // Extract keywords from goal
  const keywords = extractKeywords(goal);

  return {
    goalId: goal.id,
    embedding: response.data[0].embedding,
    metadata: {
      program: goal.program,
      specialty: goal.specialty,
      category: goal.category,
      competencyArea: goal.competencyArea,
      keywords,
    },
  };
}

/**
 * Extract keywords from goal for fast filtering
 */
function extractKeywords(goal: SocialstyrelsensGoal): string[] {
  const keywords = new Set<string>();

  // Add specialty and program
  keywords.add(goal.specialty.toLowerCase());
  keywords.add(goal.program.toLowerCase());

  // Add diagnoses (remove dots for ICD-10)
  goal.associatedDiagnoses?.forEach((d) =>
    keywords.add(d.toLowerCase().replace('.', ''))
  );

  // Add procedures (lowercase KVÅ)
  goal.associatedProcedures?.forEach((p) => keywords.add(p.toLowerCase()));

  // Extract key medical terms from title and description
  const text = `${goal.title} ${goal.description}`.toLowerCase();
  const medicalTerms = [
    'fraktur',
    'luxation',
    'artros',
    'protes',
    'ligament',
    'menisk',
    'rotatorkuff',
    'korsband',
    'höft',
    'knä',
    'axel',
    'handled',
    'fotled',
    'rygg',
    'nacke',
    'trauma',
    'akut',
    'elektiv',
    'barn',
    'pediatrisk',
    'geriatrisk',
    'idrottsskada',
    'arbetsrelaterad',
  ];

  medicalTerms.forEach((term) => {
    if (text.includes(term)) keywords.add(term);
  });

  return Array.from(keywords);
}

/**
 * Generate embeddings for all goals (batch process)
 */
export async function generateAllGoalEmbeddings(): Promise<GoalEmbedding[]> {
  logger.info('Generating embeddings for all goals', { totalGoals: ALL_FOCUSED_GOALS.length });

  const embeddings: GoalEmbedding[] = [];
  const batchSize = 10;

  for (let i = 0; i < ALL_FOCUSED_GOALS.length; i += batchSize) {
    const batch = ALL_FOCUSED_GOALS.slice(i, i + batchSize);
    const batchEmbeddings = await Promise.all(
      batch.map((goal) => generateGoalEmbedding(goal))
    );
    embeddings.push(...batchEmbeddings);

    logger.info('Generated goal embeddings batch', {
      current: embeddings.length,
      total: ALL_FOCUSED_GOALS.length
    });

    // Rate limiting
    if (i + batchSize < ALL_FOCUSED_GOALS.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return embeddings;
}

// ==================== SIMILARITY SEARCH ====================

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find most similar goals for given content
 */
export async function findSimilarGoals(
  contentText: string,
  goalEmbeddings: GoalEmbedding[],
  options: {
    topK?: number;
    minSimilarity?: number;
    filterProgram?: string;
    filterSpecialty?: string;
  } = {}
): Promise<GoalMatch[]> {
  const {
    topK = 5,
    minSimilarity = 0.7,
    filterProgram,
    filterSpecialty,
  } = options;

  // Generate embedding for content
  const client = getOpenAIClient();
  const response = await client.embeddings.create({
    model: 'text-embedding-3-large',
    input: contentText,
    dimensions: 1536,
  });

  const contentEmbedding = response.data[0].embedding;

  // Filter embeddings
  let filtered = goalEmbeddings;
  if (filterProgram) {
    filtered = filtered.filter((e) => e.metadata.program === filterProgram);
  }
  if (filterSpecialty) {
    filtered = filtered.filter((e) => e.metadata.specialty === filterSpecialty);
  }

  // Calculate similarities
  const similarities = filtered
    .map((goalEmb) => {
      const similarity = cosineSimilarity(contentEmbedding, goalEmb.embedding);
      const goal = ALL_FOCUSED_GOALS.find((g) => g.id === goalEmb.goalId);

      if (!goal) return null;

      // Generate match reason
      const matchReason = generateMatchReason(contentText, goal, similarity);

      return {
        goal,
        similarity,
        matchReason,
      };
    })
    .filter((m): m is GoalMatch => m !== null && m.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return similarities;
}

/**
 * Generate explanation for why content matches goal
 */
function generateMatchReason(
  contentText: string,
  goal: SocialstyrelsensGoal,
  similarity: number
): string {
  const contentLower = contentText.toLowerCase();
  const reasons: string[] = [];

  // Check for diagnosis match
  if (goal.associatedDiagnoses) {
    const matchedDiagnoses = goal.associatedDiagnoses.filter((d) =>
      contentLower.includes(d.toLowerCase())
    );
    if (matchedDiagnoses.length > 0) {
      reasons.push(`Matchar diagnoser: ${matchedDiagnoses.join(', ')}`);
    }
  }

  // Check for procedure match
  if (goal.associatedProcedures) {
    const matchedProcedures = goal.associatedProcedures.filter((p) =>
      contentLower.includes(p.toLowerCase())
    );
    if (matchedProcedures.length > 0) {
      reasons.push(`Matchar procedurer: ${matchedProcedures.join(', ')}`);
    }
  }

  // Check for keyword overlap
  const goalKeywords = extractKeywords(goal);
  const matchedKeywords = goalKeywords.filter((k) => contentLower.includes(k));
  if (matchedKeywords.length > 0) {
    reasons.push(`Nyckelord: ${matchedKeywords.slice(0, 3).join(', ')}`);
  }

  // Check competency area
  if (contentLower.includes(goal.competencyArea.replace('-', ' '))) {
    reasons.push(`Kompetensområde: ${goal.competencyArea}`);
  }

  if (reasons.length === 0) {
    reasons.push(`Semantisk likhet: ${(similarity * 100).toFixed(1)}%`);
  }

  return reasons.join('; ');
}

// ==================== CONTENT MAPPING ====================

/**
 * Map question to relevant goals
 */
export async function mapQuestionToGoals(
  questionId: string,
  questionText: string,
  correctAnswer: string,
  explanation: string,
  domain: string,
  goalEmbeddings: GoalEmbedding[]
): Promise<ContentGoalMapping> {
  // Create rich text for embedding
  const contentText = `
    Question: ${questionText}
    Correct Answer: ${correctAnswer}
    Explanation: ${explanation}
    Domain: ${domain}
  `.trim();

  // Find similar goals
  const matches = await findSimilarGoals(contentText, goalEmbeddings, {
    topK: 3,
    minSimilarity: 0.65,
  });

  // Calculate confidence based on top match
  const confidence = matches.length > 0 ? matches[0].similarity : 0;

  return {
    contentId: questionId,
    contentType: 'question',
    mappedGoals: matches,
    confidence,
    autoMapped: true,
  };
}

/**
 * Map clinical pearl to relevant goals
 */
export async function mapClinicalPearlToGoals(
  pearlId: string,
  pearlText: string,
  category: string,
  goalEmbeddings: GoalEmbedding[]
): Promise<ContentGoalMapping> {
  const contentText = `
    Clinical Pearl: ${pearlText}
    Category: ${category}
  `.trim();

  const matches = await findSimilarGoals(contentText, goalEmbeddings, {
    topK: 3,
    minSimilarity: 0.7,
  });

  const confidence = matches.length > 0 ? matches[0].similarity : 0;

  return {
    contentId: pearlId,
    contentType: 'clinical-pearl',
    mappedGoals: matches,
    confidence,
    autoMapped: true,
  };
}

// ==================== GOAL-AWARE GENERATION ====================

/**
 * Generate question targeting specific goals
 */
export async function generateGoalTargetedQuestion(
  goals: SocialstyrelsensGoal[],
  difficulty: 'A' | 'B' | 'C' | 'D' | 'E',
  sources: string[]
): Promise<{
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  targetedGoals: string[];
}> {
  const targetGoal = goals[0]; // Primary goal

  const prompt = `Du är en expert på att skapa medicinska frågor för svenska läkare.

MÅLSTYRNING:
Detta är ett officiellt mål från Socialstyrelsen som läkaren ska uppnå:

Program: ${targetGoal.program.toUpperCase()}
Titel: ${targetGoal.title}
Beskrivning: ${targetGoal.description}
Bedömningskriterier:
${targetGoal.assessmentCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

${targetGoal.clinicalScenarios ? `Kliniska scenarier:\n${targetGoal.clinicalScenarios.map((s, i) => `${i + 1}. ${s}`).join('\n')}` : ''}

UPPGIFT:
Skapa en flervalsfråga (4 svarsalternativ) som testar om läkaren uppfyller detta mål.

SVÅRIGHETSGRAD: ${difficulty}
${difficulty === 'A' ? '(Grundläggande - studentnivå)' : ''}
${difficulty === 'B' ? '(Grundläggande klinisk - BT/AT-nivå)' : ''}
${difficulty === 'C' ? '(Mellannivå - tidig ST)' : ''}
${difficulty === 'D' ? '(Avancerad - sen ST)' : ''}
${difficulty === 'E' ? '(Expertnivå - specialist)' : ''}

KÄLLOR: Använd information från: ${sources.join(', ')}

FORMATERA SVARET SOM JSON:
{
  "question": "Frågetexten här...",
  "options": [
    {"id": "A", "text": "Alternativ A"},
    {"id": "B", "text": "Alternativ B"},
    {"id": "C", "text": "Alternativ C"},
    {"id": "D", "text": "Alternativ D"}
  ],
  "correctAnswer": "A",
  "explanation": "Detaljerad förklaring som refererar till målets bedömningskriterier...",
  "targetedGoals": ["${targetGoal.id}"]
}

VIKTIGT:
- Frågan ska DIREKT testa något från bedömningskriterierna
- Förklaringen ska EXPLICIT referera till målet
- Frågan ska vara kliniskt relevant
- Använd realistiska scenarier från målets kliniska scenarier`;

  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'Du är en expert på medicinsk pedagogik och skapar målstyrda utbildningsfrågor.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result;
}

/**
 * Get learning path based on user's progress towards goals
 */
export async function generateGoalBasedLearningPath(
  userProgram: 'bt' | 'at' | 'st',
  userSpecialty: string,
  completedGoalIds: string[],
  weakAreas: string[]
): Promise<{
  nextGoals: SocialstyrelsensGoal[];
  recommendations: string[];
  estimatedTime: number;
}> {
  // Get relevant goals for user
  const relevantGoals = ALL_FOCUSED_GOALS.filter(
    (g) =>
      g.program === userProgram &&
      (g.specialty === userSpecialty ||
        g.specialty === 'läkarexamen' ||
        g.specialty === 'allmänmedicin')
  );

  // Filter out completed goals
  const remainingGoals = relevantGoals.filter(
    (g) => !completedGoalIds.includes(g.id)
  );

  // Prioritize required goals
  const requiredGoals = remainingGoals.filter((g) => g.required);

  // Prioritize goals related to weak areas
  const priorityGoals = requiredGoals
    .map((goal) => {
      let priority = goal.required ? 10 : 5;

      // Boost priority if related to weak area
      weakAreas.forEach((area) => {
        if (
          goal.category.toLowerCase().includes(area.toLowerCase()) ||
          goal.competencyArea.includes(area.toLowerCase())
        ) {
          priority += 5;
        }
      });

      return { goal, priority };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)
    .map((g) => g.goal);

  // Generate recommendations
  const recommendations = priorityGoals.map((goal, i) => {
    return `${i + 1}. ${goal.title} - ${goal.category} (${goal.minimumCases || 10} fall)`;
  });

  // Estimate time based on minimum cases
  const estimatedTime = priorityGoals.reduce((sum, goal) => {
    return sum + (goal.minimumCases || goal.minimumProcedures || 10);
  }, 0);

  return {
    nextGoals: priorityGoals,
    recommendations,
    estimatedTime,
  };
}

// ==================== PROGRESS TRACKING ====================

/**
 * Calculate user's progress towards all goals (detailed version for production use)
 */
export function calculateGoalProgressDetailed(
  userProgram: 'bt' | 'at' | 'st',
  userSpecialty: string,
  completedActivities: {
    goalId: string;
    activityType: string;
    completedAt: Date;
  }[]
): {
  totalGoals: number;
  completedGoals: number;
  progressPercentage: number;
  goalsByCategory: Record<string, { total: number; completed: number }>;
  goalsByCompetency: Record<string, { total: number; completed: number }>;
} {
  // Get relevant goals
  const relevantGoals = ALL_FOCUSED_GOALS.filter(
    (g) =>
      g.program === userProgram &&
      (g.specialty === userSpecialty || g.specialty === 'allmänmedicin')
  );

  // Track completed goals
  const completedGoalIds = new Set(
    completedActivities.map((a) => a.goalId)
  );

  const completedGoals = relevantGoals.filter((g) =>
    completedGoalIds.has(g.id)
  );

  // Group by category
  const goalsByCategory: Record<string, { total: number; completed: number }> =
    {};
  relevantGoals.forEach((goal) => {
    if (!goalsByCategory[goal.category]) {
      goalsByCategory[goal.category] = { total: 0, completed: 0 };
    }
    goalsByCategory[goal.category].total++;
    if (completedGoalIds.has(goal.id)) {
      goalsByCategory[goal.category].completed++;
    }
  });

  // Group by competency area
  const goalsByCompetency: Record<
    string,
    { total: number; completed: number }
  > = {};
  relevantGoals.forEach((goal) => {
    if (!goalsByCompetency[goal.competencyArea]) {
      goalsByCompetency[goal.competencyArea] = { total: 0, completed: 0 };
    }
    goalsByCompetency[goal.competencyArea].total++;
    if (completedGoalIds.has(goal.id)) {
      goalsByCompetency[goal.competencyArea].completed++;
    }
  });

  return {
    totalGoals: relevantGoals.length,
    completedGoals: completedGoals.length,
    progressPercentage: (completedGoals.length / relevantGoals.length) * 100,
    goalsByCategory,
    goalsByCompetency,
  };
}

/**
 * Calculate progress for a specific goal (simplified test interface)
 *
 * @param goalId - Goal identifier
 * @param completedContentIds - IDs of completed content items
 * @param allRelevantContentIds - IDs of all relevant content items
 * @returns Progress as a number between 0 and 1
 */
export function calculateGoalProgress(
  goalId: string,
  completedContentIds: string[],
  allRelevantContentIds: string[]
): number {
  if (allRelevantContentIds.length === 0) return 1;

  const completedCount = allRelevantContentIds.filter(id =>
    completedContentIds.includes(id)
  ).length;

  return completedCount / allRelevantContentIds.length;
}

const GoalTaxonomy = {
  generateGoalEmbedding,
  generateAllGoalEmbeddings,
  findSimilarGoals,
  mapQuestionToGoals,
  mapClinicalPearlToGoals,
  generateGoalTargetedQuestion,
  generateGoalBasedLearningPath,
  calculateGoalProgress,
  calculateGoalProgressDetailed,
};

export default GoalTaxonomy;
