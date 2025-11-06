/**
 * TutorMode Component Tests
 * Tests hint system, XP calculation, and answer validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import TutorMode from '../TutorMode';
import { mockQuestion, createMockQuestion } from '@/lib/__tests__/mocks/mockData';

// Mock AI service
vi.mock('@/lib/ai-service', () => ({
  generateAdaptiveHints: vi.fn().mockResolvedValue({
    hints: ['AI hint 1', 'AI hint 2', 'AI hint 3'],
  }),
  generatePersonalizedExplanation: vi.fn().mockResolvedValue({
    explanation: 'Detta är en AI-genererad förklaring.',
    keyTakeaway: 'Viktig lärdom att komma ihåg.',
    relatedConcepts: ['Relaterat koncept 1', 'Relaterat koncept 2'],
    confidenceLevel: 0.9,
  }),
}));

describe('TutorMode', () => {
  const mockOnAnswer = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== RENDERING ====================
  describe('Rendering', () => {
    it('should render question with all options', () => {
      render(
        <TutorMode
          question={mockQuestion}
          onAnswer={mockOnAnswer}
        />
      );

      expect(screen.getByText(/motorcykelolycka/i)).toBeInTheDocument();
      expect(screen.getByText(/A\) Kontrollera andning/i)).toBeInTheDocument();
      expect(screen.getByText(/B\) Säkra luftvägen/i)).toBeInTheDocument();
      expect(screen.getByText(/C\) Stoppa blödning/i)).toBeInTheDocument();
      expect(screen.getByText(/D\) Bedöma medvetandegrad/i)).toBeInTheDocument();
    });

    it('should not show hints initially', () => {
      render(
        <TutorMode
          question={mockQuestion}
          onAnswer={mockOnAnswer}
        />
      );

      // Hints should not be visible initially
      expect(screen.queryByText(/ABCDE-principen/i)).not.toBeInTheDocument();
    });

    it('should render with AI disabled', () => {
      render(
        <TutorMode
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          enableAI={false}
        />
      );

      expect(screen.getByText(/motorcykelolycka/i)).toBeInTheDocument();
    });
  });

  // ==================== ANSWER SELECTION ====================
  describe('Answer Selection', () => {
    it('should allow selecting an answer', async () => {
      const user = userEvent.setup();

      render(
        <TutorMode
          question={mockQuestion}
          onAnswer={mockOnAnswer}
        />
      );

      const optionB = screen.getByText(/B\) Säkra luftvägen/i);
      await user.click(optionB);

      // Option should be selected (visual feedback)
      expect(optionB.closest('button')).toHaveClass(/selected|border-blue|bg-blue/);
    });

    it('should allow changing selection before submission', async () => {
      const user = userEvent.setup();

      render(
        <TutorMode
          question={mockQuestion}
          onAnswer={mockOnAnswer}
        />
      );

      // Select option A
      await user.click(screen.getByText(/A\) Kontrollera andning/i));

      // Change to option B
      await user.click(screen.getByText(/B\) Säkra luftvägen/i));

      const optionB = screen.getByText(/B\) Säkra luftvägen/i);
      expect(optionB.closest('button')).toHaveClass(/selected|border-blue|bg-blue/);
    });
  });

  // ==================== HINT PROGRESSION ====================
  describe('Hint Progression', () => {
    it('should reveal first hint when requested', async () => {
      const user = userEvent.setup();

      render(
        <TutorMode
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          enableAI={false}
        />
      );

      // Click hint button
      const hintButton = screen.getByText(/Visa ledtråd/i);
      await user.click(hintButton);

      // First hint should appear
      await waitFor(() => {
        expect(screen.getByText(/ABCDE-principen/i)).toBeInTheDocument();
      });
    });

    it('should show XP penalty when revealing hint', async () => {
      const user = userEvent.setup();

      render(
        <TutorMode
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          baseXP={20}
          enableAI={false}
        />
      );

      // Reveal hint
      const hintButton = screen.getByText(/Visa ledtråd/i);
      await user.click(hintButton);

      // Should show penalty (-20%)
      await waitFor(() => {
        expect(screen.getByText(/-20%/i) || screen.getByText(/16 XP/i)).toBeInTheDocument();
      });
    });

    it('should reveal up to 3 hints progressively', async () => {
      const user = userEvent.setup();

      render(
        <TutorMode
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          enableAI={false}
        />
      );

      // Reveal hint 1
      await user.click(screen.getByText(/Visa ledtråd/i));
      await waitFor(() => expect(screen.getByText(/ABCDE-principen/i)).toBeInTheDocument());

      // Reveal hint 2
      await user.click(screen.getByText(/Visa nästa ledtråd/i));
      await waitFor(() => expect(screen.getByText(/A står för Airway/i)).toBeInTheDocument());

      // Reveal hint 3
      await user.click(screen.getByText(/Visa sista ledtråden/i));
      await waitFor(() => expect(screen.getByText(/säkrar man alltid luftvägen först/i)).toBeInTheDocument());
    });
  });

  // ==================== ANSWER SUBMISSION - CORRECT ====================
  describe('Answer Submission - Correct', () => {
    it('should call onAnswer with correct data when submitting correct answer', async () => {
      const user = userEvent.setup();

      render(
        <TutorMode
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          baseXP={20}
        />
      );

      // Select correct answer (B)
      await user.click(screen.getByText(/B\) Säkra luftvägen/i));

      // Submit
      await user.click(screen.getByText(/Svara/i));

      await waitFor(() => {
        expect(mockOnAnswer).toHaveBeenCalledWith(
          expect.objectContaining({
            selectedAnswer: 1,
            correct: true,
            hintsUsed: 0,
            xpEarned: 20,
          })
        );
      });
    });

    it('should calculate XP with hint penalty', async () => {
      const user = userEvent.setup();

      render(
        <TutorMode
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          baseXP={20}
          enableAI={false}
        />
      );

      // Reveal 1 hint
      await user.click(screen.getByText(/Visa ledtråd/i));
      await waitFor(() => expect(screen.getByText(/ABCDE-principen/i)).toBeInTheDocument());

      // Select correct answer
      await user.click(screen.getByText(/B\) Säkra luftvägen/i));

      // Submit
      await user.click(screen.getByText(/Svara/i));

      await waitFor(() => {
        expect(mockOnAnswer).toHaveBeenCalledWith(
          expect.objectContaining({
            correct: true,
            hintsUsed: 1,
            xpEarned: 16, // 20 * 0.8 (20% penalty)
          })
        );
      });
    });
  });

  // ==================== ANSWER SUBMISSION - WRONG ====================
  describe('Answer Submission - Wrong', () => {
    it('should show explanation when submitting wrong answer', async () => {
      const user = userEvent.setup();

      render(
        <TutorMode
          question={mockQuestion}
          onAnswer={mockOnAnswer}
        />
      );

      // Select wrong answer (A)
      await user.click(screen.getByText(/A\) Kontrollera andning/i));

      // Submit
      await user.click(screen.getByText(/Svara/i));

      // Explanation should appear
      await waitFor(() => {
        expect(screen.getByText(/ATLS-protokollet/i)).toBeInTheDocument();
      });
    });

    it('should give 0 XP for wrong answer', async () => {
      const user = userEvent.setup();

      render(
        <TutorMode
          question={mockQuestion}
          onAnswer={mockOnAnswer}
        />
      );

      // Select wrong answer
      await user.click(screen.getByText(/A\) Kontrollera andning/i));
      await user.click(screen.getByText(/Svara/i));

      await waitFor(() => {
        expect(mockOnAnswer).toHaveBeenCalledWith(
          expect.objectContaining({
            correct: false,
            xpEarned: 0,
          })
        );
      });
    });
  });

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle question without tutorMode data', () => {
      const questionNoTutor = createMockQuestion({
        tutorMode: undefined,
      });

      render(
        <TutorMode
          question={questionNoTutor}
          onAnswer={mockOnAnswer}
        />
      );

      // Should still render question
      expect(screen.getByText(/motorcykelolycka/i)).toBeInTheDocument();
    });

    it('should prevent submission without selection', async () => {
      const user = userEvent.setup();

      render(
        <TutorMode
          question={mockQuestion}
          onAnswer={mockOnAnswer}
        />
      );

      // Try to submit without selecting
      const submitButton = screen.getByText(/Svara/i);
      expect(submitButton).toBeDisabled();
    });
  });
});
