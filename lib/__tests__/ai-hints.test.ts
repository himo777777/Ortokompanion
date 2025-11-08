/**
 * Tests for ai-hints.ts
 * Testing AI hint generation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateHint, getProgressiveHints } from '../ai-hints';
import { createMockQuestion } from './mocks/mockData';

describe('AI Hints', () => {
  beforeEach(() => {
    // Mock fetch for OpenAI calls
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: 'Detta är ett AI-genererat hint.',
                },
              },
            ],
          }),
      } as Response)
    );
  });

  describe('generateHint', () => {
    it('should generate a hint for a question', async () => {
      const question = createMockQuestion();
      const hint = await generateHint(question, 1);

      expect(hint).toBeDefined();
      expect(typeof hint).toBe('string');
      expect(hint.length).toBeGreaterThan(0);
    });

    it('should use predefined hints when available', async () => {
      const question = createMockQuestion({
        tutorMode: {
          hints: ['Hint 1', 'Hint 2'],
          teachingPoints: [],
        },
      });

      const hint = await generateHint(question, 1);

      expect(['Hint 1', 'Hint 2']).toContain(hint);
    });

    it('should handle API errors gracefully', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        } as Response)
      );

      const question = createMockQuestion();
      const hint = await generateHint(question, 1);

      // Should fallback to generic hint
      expect(hint).toBeDefined();
      expect(typeof hint).toBe('string');
    });
  });

  describe('getProgressiveHints', () => {
    it('should return hints in progressive difficulty', async () => {
      const question = createMockQuestion();
      const hints = await getProgressiveHints(question);

      expect(Array.isArray(hints)).toBe(true);
      expect(hints.length).toBeGreaterThan(0);
      expect(hints.length).toBeLessThanOrEqual(3);
    });

    it('should start with subtle hints', async () => {
      const question = createMockQuestion();
      const hints = await getProgressiveHints(question);

      // First hint should be shorter/more subtle
      expect(hints[0].length).toBeLessThan(hints[hints.length - 1].length);
    });
  });
});
