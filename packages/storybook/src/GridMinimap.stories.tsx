import { GridMinimap } from '@game-of-life/ui-grid';
import { useThemeMode } from '@game-of-life/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactElement } from 'react';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

const meta = {
  title: 'Product/Grid/GridMinimap',
  component: GridMinimap,
  args: {
    gameStatus: { '0,0': '#22c55e', '1,0': '#22c55e', '20,20': '#3b82f6' },
    viewportMetrics: { columns: 30, rows: 20, offsetX: 0, offsetY: 0 },
    cellSize: 10,
    minCellSize: 2,
    maxCellSize: 24,
    isBoardMaximized: false,
    handlePanUp: fn(),
    handlePanDown: fn(),
    handlePanLeft: fn(),
    handlePanRight: fn(),
    handleCenter: fn(),
    handleZoomIn: fn(),
    handleZoomOut: fn(),
    panViewportToWorldCoordinate: fn(),
    toggleBoardMaximized: fn(),
  },
  render: function Render(args): ReactElement {
    const [, updateArgs] = useArgs<ComponentProps<typeof GridMinimap>>();
    const { mode } = useThemeMode();
    return (
      <div className="grid-stage storybook-grid" data-theme-mode={mode}>
        <GridMinimap
          {...args}
          handleZoomIn={() => {
            args.handleZoomIn();
            updateArgs({ cellSize: Math.min(args.maxCellSize, args.cellSize + 1) });
          }}
          handleZoomOut={() => {
            args.handleZoomOut();
            updateArgs({ cellSize: Math.max(args.minCellSize, args.cellSize - 1) });
          }}
          toggleBoardMaximized={() => {
            args.toggleBoardMaximized?.();
            updateArgs({ isBoardMaximized: !args.isBoardMaximized });
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof GridMinimap>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const EmptyBoard: Story = { args: { gameStatus: {} } };
export const ZoomLimit: Story = { args: { cellSize: 24 } };
export const Maximized: Story = { args: { isBoardMaximized: true } };
