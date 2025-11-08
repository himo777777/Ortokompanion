import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAdaptiveDifficulty } from '../useAdaptiveDifficulty';

describe('useAdaptiveDifficulty', () => {
  it('should initialize', () => {
    const { result } = renderHook(() => useAdaptiveDifficulty());
    expect(result.current).toBeDefined();
  });
});
