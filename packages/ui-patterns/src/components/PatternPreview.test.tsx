import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { PatternPreview } from '@game-of-life/ui-patterns';
import { block } from '@game-of-life/core';
import { getPaletteById, ThemeModeProvider } from '@game-of-life/ui';

const testPalette = getPaletteById('classic');

// Mock canvas getContext to avoid JSDOM canvas errors
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
  })) as any;
});

describe('PatternPreview', () => {
  test('renders without crashing', () => {
    const { container } = render(<PatternPreview grid={block} palette={testPalette} />);

    // Check that a canvas element is rendered
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  test('renders with default size', () => {
    const { container } = render(<PatternPreview grid={block} palette={testPalette} />);

    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveAttribute('width', '60');
    expect(canvas).toHaveAttribute('height', '60');
  });

  test('renders with custom size', () => {
    const { container } = render(<PatternPreview grid={block} size={100} palette={testPalette} />);

    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveAttribute('width', '100');
    expect(canvas).toHaveAttribute('height', '100');
  });

  test('renders with empty grid', () => {
    const { container } = render(<PatternPreview grid={{}} palette={testPalette} />);

    // Should still render canvas even with empty grid
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  test('updates its theme from the shared provider in the base UI package', () => {
    const { container, rerender } = render(
      <ThemeModeProvider mode="light" toggleTheme={vi.fn()}>
        <PatternPreview grid={{}} palette={testPalette} />
      </ThemeModeProvider>,
    );
    expect(container.querySelector('canvas')).toHaveStyle({ backgroundColor: '#ebedf0' });

    rerender(
      <ThemeModeProvider mode="dark" toggleTheme={vi.fn()}>
        <PatternPreview grid={{}} palette={testPalette} />
      </ThemeModeProvider>,
    );
    expect(container.querySelector('canvas')).toHaveStyle({ backgroundColor: '#161b22' });
  });
});
