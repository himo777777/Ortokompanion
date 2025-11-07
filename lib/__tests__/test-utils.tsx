/**
 * Test Utilities for Component Testing
 * Provides custom render with providers and helper functions
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { beforeEach } from 'vitest';
import { IntegratedProvider } from '@/context/IntegratedContext';
import type { IntegratedUserProfile } from '@/types/integrated';
import type { DailyMix } from '@/types/progression';

// Mock localStorage
export const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get store() {
      return { ...store };
    },
  };
})();

// Setup mock localStorage globally
beforeEach(() => {
  mockLocalStorage.clear();
  global.localStorage = mockLocalStorage as any;
});

// Custom render with IntegratedContext provider
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialProfile?: IntegratedUserProfile | null;
  initialDailyMix?: DailyMix | null;
}

export function renderWithContext(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { initialProfile, initialDailyMix, ...renderOptions } = options || {};

  // Pre-populate localStorage if needed
  if (initialProfile) {
    mockLocalStorage.setItem('integrated-profile', JSON.stringify(initialProfile));
  }
  if (initialDailyMix) {
    mockLocalStorage.setItem('daily-mix', JSON.stringify(initialDailyMix));
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <IntegratedProvider>{children}</IntegratedProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithContext as render };
