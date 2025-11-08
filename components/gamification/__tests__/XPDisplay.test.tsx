import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import XPDisplay from '../XPDisplay';

describe('XPDisplay', () => {
  it('should display XP amount', () => {
    render(<XPDisplay xp={500} level={5} />);
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('should display level', () => {
    render(<XPDisplay xp={500} level={5} />);
    expect(screen.getByText(/Level: 5/)).toBeInTheDocument();
  });
});
