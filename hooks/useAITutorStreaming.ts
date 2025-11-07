/**
 * React Hook for AI Tutor Streaming
 * Provides easy-to-use interface for streaming AI responses
 *
 * Features:
 * - Real-time text streaming as AI generates response
 * - Abort support (cancel mid-stream)
 * - Error handling with fallbacks
 * - Loading states
 * - Type-safe
 *
 * Usage:
 * ```tsx
 * const { streamResponse, response, isStreaming, error, abort } = useAITutorStreaming();
 *
 * const handleChat = async () => {
 *   await streamResponse({
 *     userMessage: "Hur behandlar man höftfraktur?",
 *     conversationHistory: [],
 *     context: { userLevel: 'ST3', currentDomain: 'trauma' }
 *   });
 * };
 * ```
 */

import { useState, useCallback, useRef } from 'react';
import { chatWithAITutorStreaming } from '@/lib/ai-service';
import { Domain } from '@/types/onboarding';
import { MCQQuestion } from '@/data/questions';

interface StreamingParams {
  userMessage: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: {
    currentTopic?: string;
    userLevel?: string;
    currentDomain?: Domain;
    recentQuestions?: MCQQuestion[];
  };
}

interface UseAITutorStreamingReturn {
  /** Current streamed response (updates in real-time) */
  response: string;

  /** Whether currently streaming */
  isStreaming: boolean;

  /** Error if streaming failed */
  error: string | null;

  /** Start streaming a response */
  streamResponse: (params: StreamingParams) => Promise<void>;

  /** Abort current stream */
  abort: () => void;

  /** Clear current response */
  clear: () => void;
}

export function useAITutorStreaming(): UseAITutorStreamingReturn {
  const [response, setResponse] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResponse('');
    setError(null);
  }, []);

  const streamResponse = useCallback(async (params: StreamingParams) => {
    // Reset state
    setResponse('');
    setError(null);
    setIsStreaming(true);

    // Create abort controller for this stream
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Start streaming
      for await (const chunk of chatWithAITutorStreaming(params, {
        abortSignal: controller.signal,
      })) {
        // Update response in real-time
        setResponse(prev => prev + chunk);
      }

      // Stream completed successfully
      setIsStreaming(false);
      abortControllerRef.current = null;
    } catch (err) {
      // Handle errors
      if (err instanceof Error && err.name === 'AbortError') {
        // User cancelled - this is expected
        setError('Avbruten');
      } else {
        console.error('Streaming error:', err);
        setError('Ett fel inträffade. Försök igen.');
      }

      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, []);

  return {
    response,
    isStreaming,
    error,
    streamResponse,
    abort,
    clear,
  };
}

/**
 * Example Component Usage:
 *
 * ```tsx
 * export function AITutorChat() {
 *   const { streamResponse, response, isStreaming, abort } = useAITutorStreaming();
 *   const [input, setInput] = useState('');
 *
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     if (!input.trim() || isStreaming) return;
 *
 *     await streamResponse({
 *       userMessage: input,
 *       conversationHistory: [],
 *       context: {
 *         userLevel: 'ST3',
 *         currentDomain: 'trauma'
 *       }
 *     });
 *
 *     setInput('');
 *   };
 *
 *   return (
 *     <div>
 *       <form onSubmit={handleSubmit}>
 *         <input
 *           value={input}
 *           onChange={(e) => setInput(e.target.value)}
 *           disabled={isStreaming}
 *           placeholder="Ställ en fråga..."
 *         />
 *         <button type="submit" disabled={isStreaming || !input.trim()}>
 *           Skicka
 *         </button>
 *         {isStreaming && (
 *           <button type="button" onClick={abort}>
 *             Avbryt
 *           </button>
 *         )}
 *       </form>
 *
 *       <div className="response">
 *         {response}
 *         {isStreaming && <span className="cursor">▊</span>}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
