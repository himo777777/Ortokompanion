import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'data/**', // Exclude large data files
        'scripts/**', // Exclude utility scripts
        '.next/**',
        'public/**',
        '**/__tests__/**',
        '**/mocks/**',
      ],
      // Target >99% coverage
      thresholds: {
        lines: 99,
        functions: 99,
        branches: 95,
        statements: 99,
      },
      all: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
