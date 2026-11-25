import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Game } from '@game-of-life/core';
import { Grid } from '@game-of-life/ui-grid';

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(328);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(168);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Grid minimap integration', () => {
  test('keeps pan, zoom, center, and maximize controls connected to the board', () => {
    const toggleBoardMaximized = vi.fn();
    const { container, rerender } = render(
      <Grid game={new Game({})} toggleBoardMaximized={toggleBoardMaximized} />,
    );
    const readout = container.querySelector('.grid-overlay-readout');
    const zoom = container.querySelector('.grid-overlay-minimap-zoom-value');

    fireEvent.click(screen.getByRole('button', { name: 'Pan right' }));
    expect(readout).toHaveTextContent('Center: (10, -1)');
    fireEvent.click(screen.getByRole('button', { name: 'Pan up' }));
    expect(readout).toHaveTextContent('Center: (10, 9)');
    fireEvent.click(screen.getByRole('button', { name: 'Center view' }));
    expect(readout).toHaveTextContent('Center: (0, -1)');

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(zoom).toHaveTextContent('8');
    fireEvent.keyDown(window, { key: 'q' });
    expect(zoom).toHaveTextContent('7');
    for (let index = 0; index < 5; index++) {
      fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    }
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Maximize board' }));
    expect(toggleBoardMaximized).toHaveBeenCalledOnce();
    rerender(
      <Grid game={new Game({})} isBoardMaximized toggleBoardMaximized={toggleBoardMaximized} />,
    );
    expect(screen.getByRole('button', { name: 'Restore layout' })).toBeInTheDocument();
  });

  test('renders live cell colors and pans from minimap gestures without losing external centering', () => {
    const game = new Game({ '0,0': '#ff0000', '2,1': '#00ff00' });
    const { container, rerender } = render(<Grid game={game} showBirthDeathPreview={false} />);
    const minimap = container.querySelector('svg.grid-overlay-minimap-canvas');
    if (!minimap) throw new Error('Expected the minimap');
    vi.spyOn(minimap, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 152, 152));
    expect(minimap.querySelectorAll('rect[fill]')).toHaveLength(2);
    expect(minimap.querySelector('rect[fill="#ff0000"]')).toBeInTheDocument();
    const readout = container.querySelector('.grid-overlay-readout');
    const initialCenter = readout?.textContent;

    fireEvent.mouseDown(minimap, { clientX: 140, clientY: 76, button: 0 });
    expect(minimap).toHaveClass('grid-overlay-minimap-canvas-panning');
    expect(readout?.textContent).not.toBe(initialCenter);
    fireEvent.mouseUp(minimap);
    expect(minimap).not.toHaveClass('grid-overlay-minimap-canvas-panning');

    rerender(
      <Grid
        game={game}
        showBirthDeathPreview={false}
        centerCoordinateRequest={{ coordinate: '20,-10', requestKey: 1 }}
      />,
    );
    expect(readout).toHaveTextContent('Center: (20, -10)');
  });
});
