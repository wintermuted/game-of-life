import { PatternCatalogToolbar, type PatternCatalogToolbarProps } from '@game-of-life/ui-patterns';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { ReactElement } from 'react';

const meta = {
  title: 'Product/Compositions/Patterns/PatternCatalogToolbar',
  component: PatternCatalogToolbar,
  parameters: {
    docs: {
      description: {
        component:
          'Product catalog toolbar combining canonical ToggleGroup, grouping, filters, and sorting. State and URL synchronization belong to the host; not a generic toolbar primitive.',
      },
    },
  },
  args: {
    viewMode: 'cards',
    groupMode: 'none',
    favoritesOnly: false,
    forkedOnly: false,
    sortField: 'favorites',
    sortDirection: 'desc',
    onViewModeChange: fn(),
    onGroupModeChange: fn(),
    onFavoritesOnlyChange: fn(),
    onForkedOnlyChange: fn(),
    onSortFieldChange: fn(),
    onSortDirectionChange: fn(),
  },
  render: function Render(args): ReactElement {
    const [, updateArgs] = useArgs<PatternCatalogToolbarProps>();
    return (
      <PatternCatalogToolbar
        {...args}
        onViewModeChange={(viewMode) => {
          args.onViewModeChange(viewMode);
          updateArgs({ viewMode });
        }}
        onGroupModeChange={(groupMode) => {
          args.onGroupModeChange(groupMode);
          updateArgs({ groupMode });
        }}
        onFavoritesOnlyChange={(favoritesOnly) => {
          args.onFavoritesOnlyChange(favoritesOnly);
          updateArgs({ favoritesOnly });
        }}
        onForkedOnlyChange={(forkedOnly) => {
          args.onForkedOnlyChange(forkedOnly);
          updateArgs({ forkedOnly });
        }}
        onSortFieldChange={(sortField) => {
          args.onSortFieldChange(sortField);
          updateArgs({ sortField });
        }}
        onSortDirectionChange={(sortDirection) => {
          args.onSortDirectionChange(sortDirection);
          updateArgs({ sortDirection });
        }}
      />
    );
  },
} satisfies Meta<typeof PatternCatalogToolbar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const GroupedTable: Story = {
  args: { viewMode: 'table', groupMode: 'category', sortField: 'name', sortDirection: 'asc' },
};
export const Filtered: Story = { args: { favoritesOnly: true, forkedOnly: true } };
export const Spanish: Story = { globals: { locale: 'es' } };
export const FilterInteraction: Story = {
  play: async ({ canvasElement, args }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Favorites only' }));
    await expect(args.onFavoritesOnlyChange).toHaveBeenCalledWith(true);
    await expect(canvas.getByRole('button', { name: 'Favorites only' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};
