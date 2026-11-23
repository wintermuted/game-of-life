import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { CanvasGrid } from '@game-of-life/ui-grid';
import { DEFAULT_LIVE_CELL_COLOR, LifeGrid } from '@game-of-life/core';

describe('CanvasGrid selection rendering', () => {
  const grid: LifeGrid = { '0,0': DEFAULT_LIVE_CELL_COLOR };

  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(32);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(32);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('redraws when the selected cells change without changing the game grid', () => {
    const { container, rerender } = render(<CanvasGrid grid={grid} gridSize={4} cellSize={7} />);
    const context = container.querySelector('canvas')?.getContext('2d');
    if (!context) throw new Error('Expected a canvas drawing context');

    vi.mocked(context.clearRect).mockClear();
    vi.mocked(context.strokeRect).mockClear();
    rerender(<CanvasGrid grid={grid} gridSize={4} cellSize={7} selectionGrid={grid} />);

    expect(context.clearRect).toHaveBeenCalled();
    expect(context.strokeRect).toHaveBeenCalledWith(16.5, 8.5, 6, 6);
  });

  test('redraws the selection rectangle when its endpoints change', () => {
    const { container, rerender } = render(<CanvasGrid grid={grid} gridSize={4} cellSize={7} />);
    const context = container.querySelector('canvas')?.getContext('2d');
    if (!context) throw new Error('Expected a canvas drawing context');

    vi.mocked(context.clearRect).mockClear();
    vi.mocked(context.setLineDash).mockClear();
    rerender(
      <CanvasGrid
        grid={grid}
        gridSize={4}
        cellSize={7}
        selectionStartCoordinate="0,0"
        selectionEndCoordinate="1,1"
      />,
    );

    expect(context.clearRect).toHaveBeenCalled();
    expect(context.setLineDash).toHaveBeenCalledWith([4, 3]);
  });
});
