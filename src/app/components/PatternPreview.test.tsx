import { render } from '@testing-library/react';
import PatternPreview from './PatternPreview';
import { block } from '../../data/stillLifes';

// Mock canvas getContext to avoid JSDOM canvas errors
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    fillStyle: '',
  })) as any;
});

describe('PatternPreview', () => {
  test('renders without crashing', () => {
    const { container } = render(<PatternPreview grid={block} />);
    
    // Check that a canvas element is rendered
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  test('renders with default size', () => {
    const { container } = render(<PatternPreview grid={block} />);
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveAttribute('width', '60');
    expect(canvas).toHaveAttribute('height', '60');
  });

  test('renders with custom size', () => {
    const { container } = render(<PatternPreview grid={block} size={100} />);
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveAttribute('width', '100');
    expect(canvas).toHaveAttribute('height', '100');
  });

  test('renders with empty grid', () => {
    const { container } = render(<PatternPreview grid={{}} />);
    
    // Should still render canvas even with empty grid
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
