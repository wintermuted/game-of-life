import { glider, type LifeGrid } from '@game-of-life/core';
import { DEFAULT_PALETTE_ID, getPaletteById } from '@game-of-life/ui';
import { CanvasGrid } from '@game-of-life/ui-grid';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactElement } from 'react';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

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
    return (
      <div className="storybook-grid">
        <CanvasGrid
          {...args}
          onCellPaint={(coordinate, color) => {
            args.onCellPaint?.(coordinate, color);
            const grid: LifeGrid = { ...args.grid };
            if (color === null) delete grid[coordinate];
            else grid[coordinate] = color;
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
export const Editable: Story = { args: { isEditMode: true } };
export const Dark: Story = { globals: { theme: 'dark' } };
