/**
 * OpenAI Client Singleton
 * Central OpenAI client for the application
 */

import OpenAI from 'openai';

// Lazy initialize OpenAI client only when needed
let openaiInstance: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    openaiInstance = new OpenAI({
      apiKey,
      maxRetries: 3,
      timeout: 60000, // 60 seconds
    });
  }

  return openaiInstance;
}

// Export a lazy-loaded openai instance
// Note: accessing any property will initialize the client
export const openai = new Proxy({} as OpenAI, {
  get: (target, prop) => {
    const client = getOpenAIClient();
    return (client as any)[prop];
  }
});
