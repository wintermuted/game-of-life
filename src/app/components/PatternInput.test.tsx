import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PatternInput from './PatternInput';
import { patterns } from '../../data/patterns';

// Mock canvas getContext to avoid JSDOM canvas errors
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
  })) as any;
});

describe('PatternInput', () => {
  test('renders with Starter Patterns tab selected by default', () => {
    const mockHandler = vi.fn();
    render(<PatternInput onLoadPattern={mockHandler} />);
    
    // Check that tabs are rendered
    expect(screen.getByText('Starter Patterns')).toBeInTheDocument();
    expect(screen.getByText('Custom Pattern')).toBeInTheDocument();
    
    // Check that pattern list is visible (starter patterns should be selected)
    expect(screen.getByText(patterns[0].name)).toBeInTheDocument();
  });

  test('switches to Custom Pattern tab when clicked', () => {
    const mockHandler = vi.fn();
    render(<PatternInput onLoadPattern={mockHandler} />);
    
    // Click on Custom Pattern tab
    const customTab = screen.getByText('Custom Pattern');
    fireEvent.click(customTab);
    
    // Check that custom pattern input is visible
    expect(screen.getByPlaceholderText('Paste coordinates here...')).toBeInTheDocument();
  });

  test('switches back to Starter Patterns tab', () => {
    const mockHandler = vi.fn();
    render(<PatternInput onLoadPattern={mockHandler} />);
    
    // Switch to Custom Pattern tab
    fireEvent.click(screen.getByText('Custom Pattern'));
    
    // Switch back to Starter Patterns tab
    fireEvent.click(screen.getByText('Starter Patterns'));
    
    // Check that pattern list is visible again
    expect(screen.getByText(patterns[0].name)).toBeInTheDocument();
  });

  test('disables pattern items when disabled prop is true', () => {
    const mockHandler = vi.fn();
    render(<PatternInput onLoadPattern={mockHandler} disabled={true} />);
    
    // Pattern list should still be visible but items should be disabled
    const firstPatternButton = screen.getByRole('button', { name: new RegExp(patterns[0].name) });
    expect(firstPatternButton).toHaveAttribute('aria-disabled', 'true');
  });
});
