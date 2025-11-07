/**
 * AI Chat Streaming API Route (Secure & Optimized)
 * NEW: Real-time streaming responses for better UX
 * - Streams responses as they are generated
 * - Rate limiting (100 req/min per user)
 * - Timeout protection (30s)
 * - Proper error handling with graceful fallbacks
 */

import { NextRequest } from 'next/server';
import { checkRateLimit, RateLimitPresets, createRateLimitHeaders } from '@/lib/rate-limiter';

export const runtime = 'edge';

/**
 * Streaming POST handler
 * Returns Server-Sent Events (SSE) stream
 */
export async function POST(request: NextRequest) {
  try {
    // Check rate limit FIRST
    const rateLimitResult = checkRateLimit(request, RateLimitPresets.AI_CHAT);

    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          error: 'För många förfrågningar. Vänligen vänta innan du försöker igen.',
          code: 'RATE_LIMIT_EXCEEDED',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...createRateLimitHeaders(rateLimitResult),
          },
        }
      );
    }

    const body = await request.json();
    const { model, messages, temperature, max_tokens, stream } = body;

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Saknar meddelanden i förfrågan' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'AI-tjänsten är inte konfigurerad korrekt' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Call OpenAI streaming API
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
          stream: true, // CRITICAL: Enable streaming
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('OpenAI streaming error:', {
          status: response.status,
          error,
          timestamp: new Date().toISOString(),
        });

        return new Response(
          JSON.stringify({
            error: 'AI-tjänsten returnerade ett fel',
            code: 'OPENAI_ERROR',
          }),
          {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Return streaming response
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const stream = new ReadableStream({
        async start(controller) {
          if (!response.body) {
            controller.close();
            return;
          }

          const reader = response.body.getReader();

          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                // Send completion signal
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
                break;
              }

              // Decode and forward the chunk
              const chunk = decoder.decode(value, { stream: true });
              controller.enqueue(encoder.encode(chunk));
            }
          } catch (streamError) {
            console.error('Stream processing error:', streamError);
            controller.error(streamError);
          }
        },
      });

      // Return streaming response with appropriate headers
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no', // Disable nginx buffering
          ...createRateLimitHeaders(rateLimitResult),
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('OpenAI streaming timeout');
        return new Response(
          JSON.stringify({
            error: 'Förfrågan tog för lång tid. Försök igen.',
            code: 'TIMEOUT',
          }),
          {
            status: 408,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      throw fetchError;
    }
  } catch (error) {
    // Log full error server-side
    console.error('AI streaming error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Return generic error
    return new Response(
      JSON.stringify({
        error: 'Ett internt fel inträffade. Försök igen senare.',
        code: 'INTERNAL_ERROR',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
