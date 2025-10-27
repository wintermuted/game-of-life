import { useEffect, useRef } from 'react';
import { LifeGrid } from '../../interfaces';

interface Props {
  grid: LifeGrid;
  size?: number; // Size in pixels for the preview canvas
}

function PatternPreview({ grid, size = 60 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

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

      ctx.fillStyle = '#1976d2'; // Material UI primary color
      // Ensure at least 1px cell size is drawn
      const renderSize = Math.max(1, cellSize - 1);
      ctx.fillRect(drawX, drawY, renderSize, renderSize);
    });
  }, [grid, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#f5f5f5'
      }}
    />
  );
}

export default PatternPreview;
