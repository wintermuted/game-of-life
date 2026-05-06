import { useEffect, useRef } from 'react';
import { LifeGrid } from '@game-of-life/core';
import { useThemeMode } from '../ThemeContext';
import { ColorPalette } from '../constants/colors';

interface Props {
  grid: LifeGrid;
  size?: number; // Size in pixels for the preview canvas
  palette: ColorPalette;
}

function PatternPreview({ grid, size = 60, palette }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Fill background using the active palette so previews match the board styling.
    ctx.fillStyle = isDark ? palette.deadCellDark : palette.deadCell;
    ctx.fillRect(0, 0, size, size);

    // Find the bounds of the pattern
    const coordinates = Object.keys(grid);
    if (coordinates.length === 0) return;

    const points = coordinates.map(coord => {
      const [x, y] = coord.split(',').map(Number);
      return { x, y };
    });

    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    const patternWidth = maxX - minX + 1;
    const patternHeight = maxY - minY + 1;

    // Calculate cell size to fit the pattern with padding
    const padding = 4;
    const availableSize = size - (2 * padding);
    const maxDimension = Math.max(patternWidth, patternHeight);
    const calculatedCellSize = Math.floor(availableSize / maxDimension);
    // Ensure minimum cell size of 2 pixels for visibility
    const cellSize = Math.max(2, calculatedCellSize);

    // Center the pattern
    const offsetX = padding + (availableSize - (patternWidth * cellSize)) / 2;
    const offsetY = padding + (availableSize - (patternHeight * cellSize)) / 2;

    // Draw the cells
    points.forEach(({ x, y }) => {
      const drawX = offsetX + ((x - minX) * cellSize);
      const drawY = offsetY + ((y - minY) * cellSize);

      ctx.fillStyle = palette.liveCell;
      // Ensure at least 1px cell size is drawn
      const renderSize = Math.max(1, cellSize - 1);
      ctx.fillRect(drawX, drawY, renderSize, renderSize);
    });
  }, [grid, size, isDark, palette]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        border: `1px solid ${isDark ? palette.centerCellDark : palette.centerCell}`,
        borderRadius: '4px',
        backgroundColor: isDark ? palette.deadCellDark : palette.deadCell
      }}
    />
  );
}

export default PatternPreview;
