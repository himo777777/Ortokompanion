/**
 * AI Generation API Route (Secure & Optimized)
 * Handles OpenAI API calls for content generation
 * - Sanitized error messages (no sensitive data leak)
 * - Rate limiting (60 req/min per user)
 * - Proper error handling
 * - Request timeout (30s)
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RateLimitPresets, createRateLimitHeaders } from '@/lib/rate-limiter';

export const runtime = 'edge';

/**
 * Sanitizes OpenAI errors for client consumption
 * Prevents leaking API keys, internal details, or stack traces
 */
function sanitizeOpenAIError(error: any, status: number): { error: string; code?: string } {
  // Rate limit error
  if (status === 429) {
    return {
      error: 'För många förfrågningar. Vänta en stund och försök igen.',
      code: 'RATE_LIMIT',
    };
  }

  // Server errors (5xx)
  if (status >= 500) {
    return {
      error: 'AI-tjänsten är tillfälligt otillgänglig. Försök igen om en stund.',
      code: 'SERVICE_UNAVAILABLE',
    };
  }

  // Invalid request (4xx)
  if (status >= 400) {
    return {
      error: 'Ogiltig förfrågan. Kontakta support om problemet kvarstår.',
      code: 'INVALID_REQUEST',
    };
  }

  // Generic error
  return {
    error: 'Ett oväntat fel inträffade. Försök igen.',
    code: 'UNKNOWN_ERROR',
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit FIRST (before any processing)
    const rateLimitResult = checkRateLimit(request, RateLimitPresets.AI_STANDARD);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'För många förfrågningar. Vänligen vänta innan du försöker igen.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        {
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const body = await request.json();
    const { model, messages, temperature, max_tokens, response_format } = body;

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Saknar meddelanden i förfrågan' },
        { status: 400 }
      );
    }

    // Get OpenAI API key from environment
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'AI-tjänsten är inte konfigurerad korrekt' },
        { status: 500 }
      );
    }

    // Call OpenAI API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages,
          temperature: temperature || 0.7,
          max_tokens: max_tokens || 1000,
          response_format,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        // Log full error server-side for debugging
        console.error('OpenAI API error:', {
          status: response.status,
          error,
          model,
          timestamp: new Date().toISOString(),
        });

        // Return sanitized error to client
        const sanitizedError = sanitizeOpenAIError(error, response.status);
        return NextResponse.json(sanitizedError, { status: response.status });
      }

      const data = await response.json();

      // Validate response structure
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid OpenAI response structure:', data);
        return NextResponse.json(
          { error: 'Ogiltigt svar från AI-tjänsten' },
          { status: 500 }
        );
      }

      // Return the generated content with rate limit headers
      return NextResponse.json(
        {
          content: data.choices[0].message.content,
          usage: data.usage,
        },
        {
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('OpenAI request timeout');
        return NextResponse.json(
          { error: 'Förfrågan tog för lång tid. Försök igen.', code: 'TIMEOUT' },
          { status: 408 }
        );
      }

      throw fetchError;
    }
  } catch (error) {
    // Log full error server-side
    console.error('AI generation error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Return generic error to client (no details)
    return NextResponse.json(
      { error: 'Ett internt fel inträffade. Försök igen senare.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
