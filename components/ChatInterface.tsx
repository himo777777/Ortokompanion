'use client';

import { useState, useRef, useEffect } from 'react';
import { EducationLevel } from '@/types/education';
import { educationLevels } from '@/data/levels';
import { Send, Loader2, User, Bot, Lightbulb } from 'lucide-react';
import { Domain } from '@/types/onboarding';
import { logger } from '@/lib/logger';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UserContext {
  currentAccuracy?: number;
  weakDomains?: Domain[];
  recentTopics?: string[];
  currentGoals?: string[];
  mistakePatterns?: Array<{ topic: string; count: number }>;
  currentBand?: string;
  totalXP?: number;
  level?: number;
  streak?: number;
}

interface ChatInterfaceProps {
  level: EducationLevel;
  userContext?: UserContext;
}

export default function ChatInterface({ level, userContext }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const levelInfo = educationLevels.find(l => l.id === level);

  // Generate smart suggestions based on user context
  const smartSuggestions = [
    ...(userContext?.weakDomains && userContext.weakDomains.length > 0
      ? [`Hjälp mig förbättra inom ${userContext.weakDomains[0]}`]
      : []),
    ...(userContext?.mistakePatterns && userContext.mistakePatterns.length > 0
      ? [`Varför har jag problem med ${userContext.mistakePatterns[0].topic}?`]
      : []),
    ...(userContext?.currentGoals && userContext.currentGoals.length > 0
      ? [`Tips för att nå mitt mål: ${userContext.currentGoals[0]}`]
      : []),
    'Ge mig en minnesregel för en vanlig fraktur',
    'Förklara en klassifikation steg för steg',
    'Vad är viktigt att kunna för mitt examen?',
  ].slice(0, 4);

  useEffect(() => {
    // Välkomstmeddelande när nivå väljs
    const welcomeMessage: Message = {
      role: 'assistant',
      content: `Välkommen till Ortokompanion! Jag är din AI-handledare för ortopedi på ${levelInfo?.name}-nivå.\n\nJag kan hjälpa dig med:\n${levelInfo?.focusAreas.map(area => `• ${area}`).join('\n')}\n\nVad skulle du vilja lära dig om idag?`
    };
    setMessages([welcomeMessage]);
  }, [level, levelInfo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Validate input length
    if (trimmedInput.length > 5000) {
      logger.warn('Message exceeds character limit', { length: trimmedInput.length, limit: 5000 });
      return;
    }

    const userMessage: Message = { role: 'user', content: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Hide suggestions when user starts chatting
    setShowSuggestions(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          level: level,
          userContext: userContext
        })
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      logger.error('Chat error', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Tyvärr uppstod ett fel. Försök igen senare.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className={`${levelInfo?.color} text-white p-4 rounded-t-xl`}>
        <h2 className="text-xl font-semibold">
          AI-Handledare - {levelInfo?.name}
        </h2>
        <p className="text-sm opacity-90">{levelInfo?.description}</p>
      </div>

      {/* Smart Suggestions */}
      {showSuggestions && messages.length <= 1 && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-medium text-gray-700">Föreslagna frågor:</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {smartSuggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(suggestion);
                  handleSend();
                }}
                className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Skriv din fråga här..."
            maxLength={5000}
            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
