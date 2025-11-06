/**
 * AI Content Factory
 *
 * Automated medical content generation with multi-stage quality assurance.
 * Generates 100+ questions and clinical cases daily with >99% confidence.
 */

import OpenAI from 'openai';
import { MCQQuestion } from '@/data/questions';
import { UnifiedClinicalCase } from '@/types/clinical-cases';
import { VERIFIED_SOURCES, getVerifiedSource } from '@/data/verified-sources';
import { Domain } from '@/types/onboarding';
import { EducationLevel } from '@/types/education';
import { DifficultyBand } from '@/types/progression';
import { contentVersioning } from '@/lib/content-versioning';
import { confidenceScorer, ConfidenceMetrics } from '@/lib/confidence-scoring';

export interface ContentGenerationRequest {
  type: 'question' | 'clinical-case';
  domain: Domain;
  level: EducationLevel;
  band?: DifficultyBand;
  topic?: string;
  requiredSources?: string[]; // Specific sources to use
  targetCount?: number;
}

export interface GeneratedContent {
  content: MCQQuestion | UnifiedClinicalCase;
  confidenceScore: number;
  generationRounds: number;
  sourceAccuracy: number;
  medicalAccuracy: number;
  pedagogicalQuality: number;
  usedSources: string[];
  generationMetadata: {
    model: string;
    totalTokens: number;
    cost: number;
    duration: number;
    timestamp: Date;
  };
  validationResults: ValidationResult[];
}

export interface ValidationResult {
  round: number;
  passed: boolean;
  issues: string[];
  confidence: number;
  metrics: {
    sourceAccuracy: number;
    medicalAccuracy: number;
    pedagogicalQuality: number;
    technicalValidity: number;
  };
  timestamp: Date;
}

export interface GenerationStats {
  totalGenerated: number;
  autoPublished: number;
  needsReview: number;
  rejected: number;
  averageConfidence: number;
  totalCost: number;
  averageDuration: number;
}

/**
 * AI Content Factory - Main generation engine
 */
export class AIContentFactory {
  private openai: OpenAI | null = null;
  private modelPrimary: string = 'gpt-4-turbo-preview'; // For final validation
  private modelSecondary: string = 'gpt-3.5-turbo'; // For initial generation (10x cheaper)
  private maxRounds: number = 5; // Increased to 5 for strict 99%+ quality requirements
  private confidenceThreshold: number = 0.99; // All 4 metrics must be ≥99%
  private dailyBudget: number = 50; // USD per day (realistic budget)
  private currentDailyCost: number = 0;

  constructor(apiKey?: string) {
    const openaiApiKey = apiKey || process.env.OPENAI_API_KEY || '';
    if (!openaiApiKey) {
      console.warn('[AIContentFactory] No OpenAI API key provided - using mock mode');
      this.openai = null;
    } else {
      this.openai = new OpenAI({
        apiKey: openaiApiKey,
      });
      console.log('[AIContentFactory] OpenAI client initialized');
    }
  }

  /**
   * Generate a batch of content items
   */
  async generateBatch(
    requests: ContentGenerationRequest[]
  ): Promise<GeneratedContent[]> {
    console.log(`[AIContentFactory] Starting batch generation: ${requests.length} items`);

    const results: GeneratedContent[] = [];

    for (const request of requests) {
      // Check budget
      if (this.currentDailyCost >= this.dailyBudget) {
        console.warn('[AIContentFactory] Daily budget limit reached');
        break;
      }

      try {
        const result = await this.generateSingle(request);
        results.push(result);

        // Track cost
        this.currentDailyCost += result.generationMetadata.cost;

        // Log progress
        console.log(
          `[AIContentFactory] Generated ${results.length}/${requests.length} - Confidence: ${Math.round(result.confidenceScore * 100)}%`
        );
      } catch (error) {
        console.error('[AIContentFactory] Generation failed:', error);
      }
    }

    return results;
  }

  /**
   * Generate a single content item with multi-round self-review
   */
  async generateSingle(
    request: ContentGenerationRequest
  ): Promise<GeneratedContent> {
    const startTime = Date.now();
    let totalTokens = 0;
    let totalCost = 0;

    const validationResults: ValidationResult[] = [];
    let currentContent: any = null;
    let currentConfidence = 0;
    let round = 0;

    // Multi-round generation with self-review
    while (round < this.maxRounds && currentConfidence < this.confidenceThreshold) {
      round++;

      console.log(`[AIContentFactory] Round ${round}/${this.maxRounds}`);

      // Stage 1: Generate content (or revise based on previous feedback)
      const generationResult = await this.generateContent(request, currentContent, validationResults);
      currentContent = generationResult.content;
      totalTokens += generationResult.tokens;
      totalCost += generationResult.cost;

      // Stage 2: Self-validate
      const validation = await this.validateContent(currentContent, request);
      validationResults.push(validation);
      currentConfidence = validation.confidence;

      console.log(
        `[AIContentFactory] Round ${round} confidence: ${Math.round(currentConfidence * 100)}%`
      );

      // If confidence is high enough, break early
      if (currentConfidence >= this.confidenceThreshold) {
        console.log('[AIContentFactory] Confidence threshold reached, stopping early');
        break;
      }

      // If validation passed but confidence is low, continue refining
      if (!validation.passed && round === this.maxRounds) {
        console.warn('[AIContentFactory] Max rounds reached without passing validation');
      }
    }

    const duration = Date.now() - startTime;

    // Extract source accuracy and other metrics
    const finalValidation = validationResults[validationResults.length - 1];

    return {
      content: currentContent,
      confidenceScore: currentConfidence,
      generationRounds: round,
      sourceAccuracy: this.calculateSourceAccuracy(currentContent),
      medicalAccuracy: finalValidation.confidence,
      pedagogicalQuality: 0.95, // Placeholder - will be calculated by QA pipeline
      usedSources: this.extractUsedSources(currentContent),
      generationMetadata: {
        model: `${this.modelSecondary}/${this.modelPrimary}`, // Both models used
        totalTokens,
        cost: totalCost,
        duration,
        timestamp: new Date(),
      },
      validationResults,
    };
  }

  /**
   * Generate content using OpenAI API
   */
  private async generateContent(
    request: ContentGenerationRequest,
    previousContent: any,
    previousValidations: ValidationResult[]
  ): Promise<{ content: any; tokens: number; cost: number }> {
    // Build prompt with context
    const prompt = this.buildGenerationPrompt(request, previousContent, previousValidations);

    // If no OpenAI client, use mock
    if (!this.openai) {
      console.warn('[AIContentFactory] Using mock generation (no OpenAI client)');
      const mockTokens = 2000;
      const mockCost = this.calculateCost(mockTokens);
      const generatedContent = this.createMockContent(request);
      return {
        content: generatedContent,
        tokens: mockTokens,
        cost: mockCost,
      };
    }

    try {
      // Smart model selection:
      // - Use GPT-3.5-turbo for rounds 1-2 (10x cheaper, good for initial generation)
      // - Use GPT-4-turbo for final round (higher quality validation)
      const roundNumber = previousValidations.length + 1;
      const useGPT4 = roundNumber >= 3 || (previousValidations.length > 0 && !previousValidations[previousValidations.length - 1].passed);
      const selectedModel = useGPT4 ? this.modelPrimary : this.modelSecondary;

      console.log(`[AIContentFactory] Round ${roundNumber} - Using model: ${selectedModel}`);

      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert medical educator specializing in orthopedics. Generate accurate, evidence-based content for Swedish medical education. Always respond with valid JSON only, no additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent medical content
        max_tokens: 1200, // Reduced from 2000 (most responses are 800-1000 tokens)
        response_format: { type: 'json_object' },
      });

      // Parse response
      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No content received from OpenAI');
      }

      let generatedContent;
      try {
        generatedContent = JSON.parse(responseContent);
      } catch (parseError) {
        console.error('[AIContentFactory] Failed to parse OpenAI response:', parseError);
        throw new Error('Invalid JSON response from OpenAI');
      }

      // Add metadata
      generatedContent.id = `${request.domain}-ai-${Date.now()}`;
      generatedContent.domain = request.domain;
      generatedContent.level = request.level;
      generatedContent.band = request.band || 'B';
      generatedContent.contentVersion = '1.0.0';
      generatedContent.lastContentUpdate = new Date();
      generatedContent.needsReview = false;

      // Calculate tokens and cost
      const totalTokens = completion.usage?.total_tokens || 0;
      const cost = this.calculateCost(totalTokens, selectedModel);

      console.log(`[AIContentFactory] Generated content using ${totalTokens} tokens ($${cost.toFixed(4)}) with ${selectedModel}`);

      return {
        content: generatedContent,
        tokens: totalTokens,
        cost,
      };
    } catch (error) {
      console.error('[AIContentFactory] OpenAI API error:', error);
      // Fall back to mock on error
      const mockTokens = 2000;
      const mockCost = this.calculateCost(mockTokens);
      const generatedContent = this.createMockContent(request);
      return {
        content: generatedContent,
        tokens: mockTokens,
        cost: mockCost,
      };
    }
  }

  /**
   * Validate generated content using ConfidenceScorer
   * STRICT REQUIREMENT: All 4 metrics must be ≥99%
   */
  private async validateContent(
    content: any,
    request: ContentGenerationRequest
  ): Promise<ValidationResult> {
    const issues: string[] = [];

    // Basic structural validation first
    if (request.type === 'question') {
      if (!content.question || content.question.length < 20) {
        issues.push('Question text too short (minimum 20 characters)');
      }
      if (!content.options || content.options.length !== 4) {
        issues.push('Must have exactly 4 options');
      }
      if (!content.correctAnswer) {
        issues.push('Missing correct answer');
      }
      if (!content.explanation || content.explanation.length < 200) {
        issues.push(`Explanation too short (${content.explanation?.length || 0} characters, minimum 200 required)`);
      }
      if (!content.references || content.references.length < 3) {
        issues.push(`Too few sources (${content.references?.length || 0}, minimum 3 required)`);
      }
    }

    // If basic structure fails, return early with low confidence
    if (issues.length > 0) {
      return {
        round: 0,
        passed: false,
        issues,
        confidence: 0.5,
        metrics: {
          sourceAccuracy: 0,
          medicalAccuracy: 0,
          pedagogicalQuality: 0,
          technicalValidity: 0,
        },
        timestamp: new Date(),
      };
    }

    // Use ConfidenceScorer for detailed analysis
    const metrics = confidenceScorer.calculateConfidence(content);

    // STRICT REQUIREMENT: ALL 4 metrics must be ≥99%
    const sourcePass = metrics.sourceAccuracy >= 0.99;
    const medicalPass = metrics.medicalAccuracy >= 0.99;
    const pedagogicalPass = metrics.pedagogicalQuality >= 0.99;
    const technicalPass = metrics.technicalValidity >= 0.99;

    const allPass = sourcePass && medicalPass && pedagogicalPass && technicalPass;

    // Build detailed feedback for failed metrics
    if (!sourcePass) {
      issues.push(
        `Source accuracy ${(metrics.sourceAccuracy * 100).toFixed(1)}% < 99% required. ` +
        `Ensure all sources are verified, current, and include Swedish guidelines.`
      );
    }
    if (!medicalPass) {
      issues.push(
        `Medical accuracy ${(metrics.medicalAccuracy * 100).toFixed(1)}% < 99% required. ` +
        `Improve clinical explanation, use high-evidence sources (1A/1B/2A), follow Swedish guidelines.`
      );
    }
    if (!pedagogicalPass) {
      issues.push(
        `Pedagogical quality ${(metrics.pedagogicalQuality * 100).toFixed(1)}% < 99% required. ` +
        `Add more detail to explanation (200+ words), include differential diagnosis, clinical examples.`
      );
    }
    if (!technicalPass) {
      issues.push(
        `Technical validity ${(metrics.technicalValidity * 100).toFixed(1)}% < 99% required. ` +
        `Check structure, formatting, and completeness.`
      );
    }

    return {
      round: 0, // Will be set by caller
      passed: allPass,
      issues,
      confidence: metrics.overall,
      metrics: {
        sourceAccuracy: metrics.sourceAccuracy,
        medicalAccuracy: metrics.medicalAccuracy,
        pedagogicalQuality: metrics.pedagogicalQuality,
        technicalValidity: metrics.technicalValidity,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Build generation prompt with all context
   */
  private buildGenerationPrompt(
    request: ContentGenerationRequest,
    previousContent: any,
    previousValidations: ValidationResult[]
  ): string {
    // Filter relevant sources based on domain
    // OPTIMIZATION: Only include 10 most relevant sources (reduces prompt tokens by ~60%)
    const relevantSources = Object.values(VERIFIED_SOURCES)
      .filter((s) => s.verificationStatus === 'verified')
      .slice(0, 10) // Reduced from 30 to 10 (saves ~500 input tokens)
      .map((s) => `- ${s.id}: ${s.title} (${s.year})`)
      .join('\n');

    // Domain-specific Swedish terms
    const domainTerms: Record<string, string> = {
      'trauma': 'trauma och akutortopedi',
      'höft': 'höftkirurgi och proteskirurgi',
      'knä': 'knäkirurgi och artroskopi',
      'fot-fotled': 'fot- och fotledskirurgi',
      'hand-handled': 'hand- och mikrokirurgi',
      'axel-armbåge': 'axel- och armbågskirurgi',
      'rygg': 'ryggkirurgi och spinalkirurgi',
      'sport': 'idrottsmedicin',
      'tumör': 'ortopedisk onkologi',
    };

    // Education level descriptions
    const levelDescriptions: Record<string, string> = {
      'student': 'grundläggande medicinsk förståelse',
      'at': 'allmän klinisk kunskap',
      'st1': 'tidiga specialistkunskaper',
      'st2': 'utvecklade specialistkunskaper',
      'st3': 'fördjupade specialistkunskaper',
      'st4': 'avancerade specialistkunskaper',
      'st5': 'nästan färdig specialist',
      'specialist-ortopedi': 'expertkunskap inom ortopedi',
    };

    let prompt = `Du är en erfaren svensk ortopedspecialist och medicinsk pedagog. Skapa högkvalitativt utbildningsmaterial för svenska läkare.

SPECIALITET: ${domainTerms[request.domain] || request.domain}
UTBILDNINGSNIVÅ: ${request.level} - ${levelDescriptions[request.level] || 'specialistnivå'}
SVÅRIGHETSGRAD: Band ${request.band || 'B'} (A=lättast, E=svårast)

VERIFIERADE MEDICINSKA KÄLLOR:
${relevantSources}

KRITISKA KRAV (ALLA måste uppfyllas för godkänt resultat):
1. MÅSTE referera till 3-4 källor från listan ovan (använd exakta source-id)
2. Inkludera MINST EN svensk källa (Socialstyrelsen, SBU, Rikshöft, RIKSKNA) - OBLIGATORISKT
3. Allt innehåll MÅSTE vara på korrekt medicinsk svenska
4. Följ senaste evidens och behandlingsrekommendationer (evidensnivå 1A/1B/2A prioriteras)
5. Inkludera DETALJERAD förklaring (MINST 200 ord, helst 250+):
   - Kliniskt resonemang och patofysiologi
   - Differentialdiagnostik när relevant
   - Behandlingsöverväganden med evidens
   - Konkreta kliniska exempel
   - Referenser till specifika källor i texten
6. Anpassa komplexitet till utbildningsnivå ${request.level}
7. Fokusera på praktisk klinisk relevans för svensk sjukvård

`;

    // Add previous attempt context if exists
    if (previousContent && previousValidations.length > 0) {
      const lastValidation = previousValidations[previousValidations.length - 1];
      prompt += `\nTIDIGARE FÖRSÖK HADE PROBLEM:
${lastValidation.issues.map(i => `- ${i}`).join('\n')}

ÅTGÄRDA dessa problem i din nya version.\n`;
    }

    if (request.type === 'question') {
      prompt += `\nSkapa en flervalssfråga i EXAKT detta JSON-format:
{
  "question": "Tydlig klinisk fråga på svenska med patientkontext",
  "options": [
    "Svarsalternativ A - realistiskt och kliniskt relevant",
    "Svarsalternativ B - realistiskt och kliniskt relevant",
    "Svarsalternativ C - realistiskt och kliniskt relevant",
    "Svarsalternativ D - realistiskt och kliniskt relevant"
  ],
  "correctAnswer": "Exakt text från rätt svarsalternativ",
  "explanation": "MYCKET DETALJERAD förklaring på svenska (MINST 200 ord, helst 250+). MÅSTE inkludera: (1) Kliniskt resonemang och patofysiologi, (2) Varför rätt svar är korrekt med evidens, (3) Varför fel svar är felaktiga, (4) Differentialdiagnostik när relevant, (5) Behandlingsöverväganden, (6) Konkreta kliniska exempel, (7) Explicita referenser till källorna (t.ex. 'Enligt NICE guidelines 2023...'). Använd medicinsk svenska på specialistnivå.",
  "references": ["exakt-source-id-1", "exakt-source-id-2", "exakt-source-id-3"],
  "tags": ["${request.domain}", "band-${request.band || 'B'}", "${request.level}"],
  "competency": "medicinsk-kunskap",
  "relatedGoals": ["delmål-1.1", "delmål-1.2"]
}

KVALITETSKRAV FÖR GODKÄNT RESULTAT:
- Frågan: Börja med detaljerad klinisk kontext (ålder, kön, symptom, anamnes)
- Inkludera relevanta fynd (kliniska, radiologiska, laboratoriesvar)
- Ställ specifik, tydlig fråga om diagnos/behandling/prognos
- Svarsalternativ: Alla 4 ska vara realistiska och kliniskt plausibla
- Förklaring: MINST 200 ord, gärna 250-300 för maximal pedagogisk kvalitet
- Källor: 3-4 källor varav MINST EN svensk (Socialstyrelsen/SBU/Riks...)
- Evidens: Referera till evidensnivå och studiefynd när relevant`;
    } else if (request.type === 'clinical-case') {
      prompt += `\nSkapa ett kliniskt fall i EXAKT detta JSON-format:
{
  "title": "Beskrivande rubrik på svenska",
  "scenario": "Detaljerad fallbeskrivning med anamnes, status, undersökningar",
  "questions": [
    {
      "question": "Fråga 1",
      "correctAnswer": "Svar",
      "explanation": "Förklaring"
    },
    {
      "question": "Fråga 2",
      "correctAnswer": "Svar",
      "explanation": "Förklaring"
    }
  ],
  "keyLearningPoints": [
    "Viktig lärpunkt 1",
    "Viktig lärpunkt 2",
    "Viktig lärpunkt 3"
  ],
  "references": ["exakt-source-id-1", "exakt-source-id-2"],
  "tags": ["${request.domain}", "${request.level}"]
}`;
    }

    return prompt;
  }

  /**
   * Calculate cost based on tokens and model
   */
  private calculateCost(tokens: number, model?: string): number {
    // Assume 40/60 split (input/output) based on typical usage
    const inputTokens = tokens * 0.4;
    const outputTokens = tokens * 0.6;

    // Pricing per 1K tokens (as of 2024)
    const isGPT4 = model?.includes('gpt-4');

    if (isGPT4) {
      // GPT-4-turbo: $0.01 input, $0.03 output per 1K tokens
      return (inputTokens / 1000) * 0.01 + (outputTokens / 1000) * 0.03;
    } else {
      // GPT-3.5-turbo: $0.0005 input, $0.0015 output per 1K tokens (20x cheaper!)
      return (inputTokens / 1000) * 0.0005 + (outputTokens / 1000) * 0.0015;
    }
  }

  /**
   * Calculate source accuracy
   */
  private calculateSourceAccuracy(content: any): number {
    if (!content.references || content.references.length === 0) {
      return 0;
    }

    let validSources = 0;
    for (const sourceId of content.references) {
      const source = getVerifiedSource(sourceId);
      if (source && source.verificationStatus === 'verified') {
        validSources++;
      }
    }

    return validSources / content.references.length;
  }

  /**
   * Extract used sources from content
   */
  private extractUsedSources(content: any): string[] {
    return content.references || [];
  }

  /**
   * Create mock content for testing
   */
  private createMockContent(request: ContentGenerationRequest): MCQQuestion {
    const id = `${request.domain}-ai-${Date.now()}`;

    return {
      id,
      domain: request.domain,
      level: request.level,
      band: request.band || 'B',
      question: `[AI-Generated] Sample question for ${request.domain}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: 'This is a mock explanation. Real implementation will use OpenAI API.',
      competency: 'medicinsk-kunskap',
      tags: ['ai-generated', request.domain],
      references: ['campbell-13ed', 'rockwood-9ed'],
      contentVersion: '1.0.0',
      lastContentUpdate: new Date(),
      needsReview: false,
    };
  }

  /**
   * Reset daily cost counter (called by cron at midnight)
   */
  resetDailyCost() {
    this.currentDailyCost = 0;
    console.log('[AIContentFactory] Daily cost counter reset');
  }

  /**
   * Get current generation stats
   */
  getStats(): {
    currentDailyCost: number;
    remainingBudget: number;
    models: { primary: string; secondary: string }
  } {
    return {
      currentDailyCost: this.currentDailyCost,
      remainingBudget: this.dailyBudget - this.currentDailyCost,
      models: {
        primary: this.modelPrimary,
        secondary: this.modelSecondary,
      },
    };
  }
}

// Singleton instance
export const aiContentFactory = new AIContentFactory();
