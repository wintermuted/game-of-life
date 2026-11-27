import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatternInput } from '@game-of-life/ui-patterns';
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

describe('PatternInput', () => {
  test('renders with Starter Patterns tab selected by default', () => {
    const mockHandler = vi.fn();
    render(<PatternInput onLoadPattern={mockHandler} />);

    // Check that tabs are rendered
    expect(screen.getByText('Starter Patterns')).toBeInTheDocument();
    expect(screen.getByText('Custom Pattern')).toBeInTheDocument();

    // Check that pattern list is visible (starter patterns should be selected)
    expect(screen.getByText(formatPatternTitle(patterns[0].name))).toBeInTheDocument();
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
    expect(screen.getByText(formatPatternTitle(patterns[0].name))).toBeInTheDocument();
  });

  test('disables pattern items when disabled prop is true', () => {
    const mockHandler = vi.fn();
    render(<PatternInput onLoadPattern={mockHandler} disabled={true} />);

    // Pattern list should still be visible but items should be disabled
    const firstPatternButton = screen.getByRole('button', {
      name: new RegExp(patterns[0].name, 'i'),
    });
    expect(firstPatternButton).toBeDisabled();
  });

  test('unmounts custom drafts, validation errors and help when switching panels', () => {
    render(<PatternInput onLoadPattern={vi.fn()} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Custom Pattern' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'invalid' } });
    fireEvent.click(screen.getByRole('button', { name: 'Load Custom Pattern' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    const help = screen.getByRole('button', { name: /show examples/i });
    fireEvent.click(help);
    expect(help).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('tab', { name: 'Starter Patterns' }));
    expect(screen.queryByRole('textbox', { hidden: true })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Custom Pattern' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show examples/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  test('links translated panels and supports arrow, Home and End focus navigation', () => {
    render(<PatternInput onLoadPattern={vi.fn()} disabled />);
    const starter = screen.getByRole('tab', { name: 'Starter Patterns' });
    const custom = screen.getByRole('tab', { name: 'Custom Pattern' });
    starter.focus();
    fireEvent.keyDown(starter, { key: 'ArrowRight' });
    expect(custom).toHaveFocus();
    expect(custom).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Custom Pattern' })).toHaveAttribute(
      'id',
      custom.getAttribute('aria-controls'),
    );
    expect(screen.getByRole('textbox')).toBeDisabled();
    fireEvent.keyDown(custom, { key: 'Home' });
    expect(starter).toHaveFocus();
    fireEvent.keyDown(starter, { key: 'End' });
    expect(custom).toHaveFocus();
    fireEvent.keyDown(custom, { key: 'ArrowRight' });
    expect(starter).toHaveFocus();
  });
});
