/**
 * Test Utilities for Component Testing
 * Provides custom render with providers and helper functions
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
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

/**
 * Mock window.matchMedia for responsive testing
 */
export function mockMatchMedia(query: string) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((q) => ({
      matches: q === query,
      media: q,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

/**
 * Mock IntersectionObserver for lazy loading tests
 */
export function mockIntersectionObserver() {
  global.IntersectionObserver = class IntersectionObserver {
    constructor(
      public callback: IntersectionObserverCallback,
      public options?: IntersectionObserverInit
    ) {}
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = '';
    thresholds = [];
  } as any;
}

/**
 * Mock ResizeObserver for component size tests
 */
export function mockResizeObserver() {
  global.ResizeObserver = class ResizeObserver {
    constructor(public callback: ResizeObserverCallback) {}
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  } as any;
}

/**
 * Mock sessionStorage
 */
export const mockSessionStorage = (() => {
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

/**
 * Mock fetch for API testing
 */
export function mockFetch(response: any, ok = true, status = 200) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      headers: new Headers(),
    } as Response)
  );
}

/**
 * Create a mock Date.now() for time-based tests
 */
export function mockDateNow(date: Date) {
  const original = Date.now;
  Date.now = vi.fn(() => date.getTime());

  return {
    restore: () => {
      Date.now = original;
    },
  };
}

/**
 * Test data generators
 */
export const testUtils = {
  /** Generate a random ID */
  randomId: () => Math.random().toString(36).substring(7),

  /** Generate a future date */
  futureDate: (days = 7) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  },

  /** Generate a past date */
  pastDate: (days = 7) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  },

  /** Create a delay for testing async behavior */
  delay: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  /** Generate random XP value */
  randomXP: (min = 0, max = 1000) =>
    Math.floor(Math.random() * (max - min + 1)) + min,

  /** Generate random accuracy percentage */
  randomAccuracy: () => Math.random() * 0.3 + 0.7, // 70-100%
};

/**
 * Wait for async state updates
 */
export const waitForUpdate = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithContext as render };
export { default as userEvent } from '@testing-library/user-event';
