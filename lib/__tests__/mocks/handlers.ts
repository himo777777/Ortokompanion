/**
 * MSW (Mock Service Worker) Handlers
 * Mocks API calls for testing (OpenAI, etc.)
 */

import { http, HttpResponse } from 'msw';

// Mock OpenAI API responses
export const handlers = [
  // Mock OpenAI Chat Completions (for AI hints and explanations)
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      id: 'chatcmpl-mock',
      object: 'chat.completion',
      created: Date.now(),
      model: 'gpt-4-turbo',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'Detta är en mockad AI-respons för testing.',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 20,
        total_tokens: 70,
      },
    });
  }),

  // Mock OpenAI Embeddings (for semantic search)
  http.post('https://api.openai.com/v1/embeddings', () => {
    return HttpResponse.json({
      object: 'list',
      data: [
        {
          object: 'embedding',
          index: 0,
          embedding: new Array(1536).fill(0.1), // Mock embedding vector
        },
      ],
      model: 'text-embedding-3-large',
      usage: {
        prompt_tokens: 10,
        total_tokens: 10,
      },
    });
  }),
];

// Mock internal API routes
export const apiHandlers = [
  // Mock /api/profile
  http.get('/api/profile', () => {
    return HttpResponse.json({
      id: 'test-user-001',
      role: 'st3',
      stYear: 3,
      gamification: {
        xp: 500,
        level: 5,
        streak: 3,
      },
    });
  }),

  // Mock /api/profile/session
  http.post('/api/profile/session', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      xpGained: 70,
      newLevel: 5,
    });
  }),

  // Mock /api/daily-mix
  http.get('/api/daily-mix', () => {
    return HttpResponse.json({
      date: new Date().toISOString(),
      newContent: {
        domain: 'trauma',
        questionIds: ['q1', 'q2', 'q3'],
        estimatedTime: 15,
      },
      srsReviews: {
        dueCards: [],
        estimatedTime: 0,
      },
      isRecoveryDay: false,
    });
  }),

  // Mock /api/chat
  http.post('/api/chat', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      message: 'Detta är ett mockat AI-svar för testing.',
    });
  }),
];

// Error handlers for testing error scenarios
export const errorHandlers = [
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json(
      {
        error: {
          message: 'API error for testing',
          type: 'invalid_request_error',
          code: 'test_error',
        },
      },
      { status: 400 }
    );
  }),
];

// All handlers combined
export const allHandlers = [...handlers, ...apiHandlers];
