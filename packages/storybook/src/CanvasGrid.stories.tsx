import { DEFAULT_LIVE_CELL_COLOR, glider, type LifeGrid } from '@game-of-life/core';
import { DEFAULT_PALETTE_ID, getPaletteById } from '@game-of-life/ui';
import { CanvasGrid } from '@game-of-life/ui-grid';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, type ComponentProps, type ReactElement } from 'react';
import { useArgs } from 'storybook/preview-api';
import { expect, fireEvent, fn, waitFor } from 'storybook/test';

const meta = {
  title: 'Product/Grid/CanvasGrid',
  component: CanvasGrid,
  args: {
    grid: glider,
    gridSize: 20,
    cellSize: 16,
    palette: getPaletteById(DEFAULT_PALETTE_ID),
    isEditMode: false,
    activeEditTool: 'pencil',
    onCellPaint: fn(),
    onHoverCoordinateChange: fn(),
  },
  argTypes: {
    cellSize: { control: { type: 'range', min: 4, max: 32, step: 2 } },
    activeEditTool: { control: 'select', options: ['pencil', 'eraser'] },
  },
  render: function Render(args): ReactElement {
    const [, updateArgs] = useArgs<ComponentProps<typeof CanvasGrid>>();
    const gridRef = useRef(args.grid);
    useEffect(() => {
      gridRef.current = args.grid;
    }, [args.grid]);
    return (
      <div className="storybook-grid">
        <CanvasGrid
          {...args}
          onCellPaint={(coordinate, color) => {
            args.onCellPaint?.(coordinate, color);
            const grid: LifeGrid = { ...gridRef.current };
            if (color === null) delete grid[coordinate];
            else grid[coordinate] = color;
            gridRef.current = grid;
            updateArgs({ grid });
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof CanvasGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { grid: {} } };
export const Editable: Story = {
  args: { isEditMode: true },
  play: async ({ canvasElement, args }): Promise<void> => {
    const canvas = canvasElement.querySelector('canvas');
    if (!canvas) throw new Error('Editable grid canvas is missing.');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Editable grid canvas context is unavailable.');
    const stride = args.cellSize + 1;
    const inset = Math.floor(args.cellSize / 2);
    const color = args.activeDrawColor ?? DEFAULT_LIVE_CELL_COLOR;
    const expected = [
      Number.parseInt(color.slice(1, 3), 16),
      Number.parseInt(color.slice(3, 5), 16),
      Number.parseInt(color.slice(5, 7), 16),
      255,
    ];
    await waitFor(async (): Promise<void> => {
      await expect(canvas.width).toBeGreaterThan(stride * 2);
    });
    const bounds = canvas.getBoundingClientRect();
    const firstCell = { clientX: bounds.left + inset, clientY: bounds.top + inset, button: 0 };
    const secondCell = { ...firstCell, clientX: firstCell.clientX + stride };
    fireEvent.mouseDown(canvas, firstCell);
    fireEvent.mouseMove(canvas, secondCell);
    fireEvent.mouseUp(canvas, secondCell);
    fireEvent.mouseLeave(canvas);
    await waitFor(async (): Promise<void> => {
      await expect(Array.from(context.getImageData(inset, inset, 1, 1).data)).toStrictEqual(
        expected,
      );
      await expect(
        Array.from(context.getImageData(inset + stride, inset, 1, 1).data),
      ).toStrictEqual(expected);
    });
  },
};
export const Dark: Story = { globals: { theme: 'dark' } };
