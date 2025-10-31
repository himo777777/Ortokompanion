/**
 * AI Chat API Route
 * Handles conversational AI interactions
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, messages, temperature, max_tokens } = body;

    // Get OpenAI API key from environment
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Call OpenAI API for chat
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
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI chat error:', error);
      return NextResponse.json(
        { error: 'OpenAI API error', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the chat response
    return NextResponse.json({
      content: data.choices[0].message.content,
      usage: data.usage,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
