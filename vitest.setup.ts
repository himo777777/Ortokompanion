/**
 * Vitest setup file
 * Runs before all tests
 */

import '@testing-library/jest-dom/vitest';

// Clear OpenAI API key to force mock mode in tests
delete process.env.OPENAI_API_KEY;

// Setup test environment
export {};
