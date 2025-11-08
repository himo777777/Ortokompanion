import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BandProgressIndicator from '../BandProgressIndicator';

describe('BandProgressIndicator', () => {
  it('should render current band', () => {
    render(<BandProgressIndicator currentBand="C" streak={3} />);
    expect(screen.getByText(/Band C/i)).toBeInTheDocument();
  });

  it('should display streak information', () => {
    render(<BandProgressIndicator currentBand="C" streak={5} />);
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });
});
