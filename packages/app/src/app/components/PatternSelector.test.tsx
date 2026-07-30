import { vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PatternSelector from './PatternSelector';
import { patterns } from '@game-of-life/core';

function formatPatternTitle(name: string) {
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Mock canvas getContext to avoid JSDOM canvas errors
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
  })) as any;
});

describe('PatternSelector', () => {
  test('renders all patterns', () => {
    const mockHandler = vi.fn();
    render(<PatternSelector onSelectPattern={mockHandler} />);
    
    // Check that all pattern names are rendered
    patterns.forEach(pattern => {
      expect(screen.getByText(formatPatternTitle(pattern.name))).toBeInTheDocument();
    });
    
    // Check that categories are rendered (some may appear multiple times)
    const categories = new Set(patterns.map(p => p.category));
    categories.forEach(category => {
      expect(screen.getAllByText(category).length).toBeGreaterThan(0);
    });
  });

  test('calls onSelectPattern when a pattern is clicked', () => {
    const mockHandler = vi.fn();
    render(<PatternSelector onSelectPattern={mockHandler} />);
    
    // Click on the first pattern
    const firstPattern = screen.getByText(formatPatternTitle(patterns[0].name));
    fireEvent.click(firstPattern);
    
    // Check that the handler was called with the correct grid
    expect(mockHandler).toHaveBeenCalledWith(patterns[0].grid, patterns[0].rulesetId);
  });

  test('selects the HighLife ruleset with the replicator pattern', () => {
    const mockHandler = vi.fn();
    const replicator = patterns.find((pattern) => pattern.name === 'HighLife Replicator');

    expect(replicator).toBeDefined();
    render(<PatternSelector onSelectPattern={mockHandler} />);
    fireEvent.click(screen.getByText('Highlife Replicator'));

    expect(mockHandler).toHaveBeenCalledWith(replicator?.grid, 'highlife');
  });

  test.each([
    ['Day & Night Seed', 'Day & Night Seed', 'day-and-night'],
    ['Life without Death Ladder', 'Life Without Death Ladder', 'life-without-death'],
  ])('selects the matching ruleset with %s', (patternName, displayName, rulesetId) => {
    const mockHandler = vi.fn();
    const pattern = patterns.find((entry) => entry.name === patternName);

    expect(pattern).toBeDefined();
    render(<PatternSelector onSelectPattern={mockHandler} />);
    fireEvent.click(screen.getByText(displayName));

    expect(mockHandler).toHaveBeenCalledWith(pattern?.grid, rulesetId);
  });

  test('does not call onSelectPattern when disabled', () => {
    const mockHandler = vi.fn();
    render(<PatternSelector onSelectPattern={mockHandler} disabled={true} />);
    
    // Try to click on a pattern
    const firstPattern = screen.getByText(formatPatternTitle(patterns[0].name));
    fireEvent.click(firstPattern);
    
    // Handler should not be called when disabled
    expect(mockHandler).not.toHaveBeenCalled();
  });

  test('displays pattern categories correctly', () => {
    const mockHandler = vi.fn();
    render(<PatternSelector onSelectPattern={mockHandler} />);
    
    // Check that different categories are displayed
    // Using getAllByText since categories can appear multiple times
    expect(screen.getAllByText('Still Life').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Oscillator').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Spaceship').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Methuselah').length).toBeGreaterThan(0);
  });

  test('lists the applied ruleset beneath the category', () => {
    const mockHandler = vi.fn();
    render(<PatternSelector onSelectPattern={mockHandler} />);

    const ladderButton = screen.getByText('Life Without Death Ladder').closest('button');
    expect(ladderButton).not.toBeNull();
    expect(within(ladderButton as HTMLButtonElement).getByText('Alternative Rules')).toHaveClass('pattern-selector-badge');
    expect(within(ladderButton as HTMLButtonElement).getByText('Life without Death')).toHaveClass('pattern-selector-badge');
  });
});
