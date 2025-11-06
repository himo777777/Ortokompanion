/**
 * Test endpoint for AI content generation
 *
 * Use this to test the AI Content Factory with real OpenAI API calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiContentFactory } from '@/lib/ai-content-factory';
import { Domain } from '@/types/onboarding';
import { EducationLevel } from '@/types/education';
import { DifficultyBand } from '@/types/progression';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for testing

/**
 * GET /api/test/generate-content
 * Test single content generation
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[TEST] Starting AI content generation test...');

    // Test parameters
    const testRequest = {
      type: 'question' as const,
      domain: 'trauma' as Domain,
      level: 'st3' as EducationLevel,
      band: 'C' as DifficultyBand,
      topic: 'Öppna frakturer och Gustilo-Anderson klassifikation',
    };

    console.log('[TEST] Request:', testRequest);

    // Generate single item
    const result = await aiContentFactory.generateSingle(testRequest);

    console.log('[TEST] Generation complete!');
    console.log(`[TEST] Confidence: ${(result.confidenceScore * 100).toFixed(1)}%`);
    console.log(`[TEST] Rounds: ${result.generationRounds}`);
    console.log(`[TEST] Cost: $${result.generationMetadata.cost.toFixed(4)}`);

    return NextResponse.json({
      success: true,
      message: 'AI content generation test complete',
      request: testRequest,
      result: {
        content: result.content,
        confidence: result.confidenceScore,
        rounds: result.generationRounds,
        sourceAccuracy: result.sourceAccuracy,
        medicalAccuracy: result.medicalAccuracy,
        pedagogicalQuality: result.pedagogicalQuality,
        usedSources: result.usedSources,
        metadata: {
          model: result.generationMetadata.model,
          tokens: result.generationMetadata.totalTokens,
          cost: result.generationMetadata.cost,
          duration: result.generationMetadata.duration,
        },
        validationResults: result.validationResults,
      },
    });
  } catch (error) {
    console.error('[TEST] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/test/generate-content
 * Test with custom parameters
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.domain || !body.level) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: domain and level',
        },
        { status: 400 }
      );
    }

    const testRequest = {
      type: (body.type || 'question') as 'question' | 'clinical-case',
      domain: body.domain as Domain,
      level: body.level as EducationLevel,
      band: (body.band || 'B') as DifficultyBand,
      topic: body.topic,
    };

    console.log('[TEST] Custom request:', testRequest);

    // Generate content
    const result = await aiContentFactory.generateSingle(testRequest);

    // Check if confidence meets threshold
    const autoPublishable = result.confidenceScore >= 0.99;

    return NextResponse.json({
      success: true,
      autoPublishable,
      confidence: result.confidenceScore,
      content: result.content,
      stats: {
        rounds: result.generationRounds,
        tokens: result.generationMetadata.totalTokens,
        cost: result.generationMetadata.cost,
        duration: result.generationMetadata.duration,
        sourceAccuracy: result.sourceAccuracy,
        medicalAccuracy: result.medicalAccuracy,
        pedagogicalQuality: result.pedagogicalQuality,
      },
      validation: result.validationResults,
    });
  } catch (error) {
    console.error('[TEST] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}