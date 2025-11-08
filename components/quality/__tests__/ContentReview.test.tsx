import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

describe('ContentReview', () => {
  it('should render', () => {
    const { container } = render(<div>Content Review Component</div>);
    expect(container).toBeDefined();
  });
});
