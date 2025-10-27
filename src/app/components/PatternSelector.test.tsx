import { render, screen, fireEvent } from '@testing-library/react';
import PatternSelector from './PatternSelector';
import { patterns } from '../../data/patterns';

// Mock canvas getContext to avoid JSDOM canvas errors
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    fillStyle: '',
  })) as any;
});

describe('PatternSelector', () => {
  test('renders all patterns', () => {
    const mockHandler = jest.fn();
    render(<PatternSelector onSelectPattern={mockHandler} />);
    
    // Check that all pattern names are rendered
    patterns.forEach(pattern => {
      expect(screen.getByText(pattern.name)).toBeInTheDocument();
    });
    
    // Check that categories are rendered (some may appear multiple times)
    const categories = new Set(patterns.map(p => p.category));
    categories.forEach(category => {
      expect(screen.getAllByText(category).length).toBeGreaterThan(0);
    });
  });

  test('calls onSelectPattern when a pattern is clicked', () => {
    const mockHandler = jest.fn();
    render(<PatternSelector onSelectPattern={mockHandler} />);
    
    // Click on the first pattern
    const firstPattern = screen.getByText(patterns[0].name);
    fireEvent.click(firstPattern);
    
    // Check that the handler was called with the correct grid
    expect(mockHandler).toHaveBeenCalledWith(patterns[0].grid);
  });

  test('does not call onSelectPattern when disabled', () => {
    const mockHandler = jest.fn();
    render(<PatternSelector onSelectPattern={mockHandler} disabled={true} />);
    
    // Try to click on a pattern
    const firstPattern = screen.getByText(patterns[0].name);
    fireEvent.click(firstPattern);
    
    // Handler should not be called when disabled
    expect(mockHandler).not.toHaveBeenCalled();
  });

  test('displays pattern categories correctly', () => {
    const mockHandler = jest.fn();
    render(<PatternSelector onSelectPattern={mockHandler} />);
    
    // Check that different categories are displayed
    // Using getAllByText since categories can appear multiple times
    expect(screen.getAllByText('Still Life').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Oscillator').length).toBeGreaterThan(0);
    expect(screen.getByText('Spaceship')).toBeInTheDocument();
    expect(screen.getByText('Methuselah')).toBeInTheDocument();
  });
});
