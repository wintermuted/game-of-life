import { PatternCard, PatternMetadataBadges, PatternSourceBadge } from '@game-of-life/ui-patterns';
import { glider } from '@game-of-life/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactElement } from 'react';
import { useArgs } from 'storybook/preview-api';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

const meta = {
  title: 'Product/Patterns/PatternCard',
  component: PatternCard,
  parameters: {
    docs: {
      description: {
        component:
          'DEDUPLICATE-LATER: ProfileBoardSection retains its profile card. Routing and recent-board tracking belong to app adapters.',
      },
    },
  },
  args: {
    name: 'Glider',
    grid: glider,
    href: '#glider',
    favorite: false,
    favoriteCount: 12,
    forkCount: 3,
    onOpen: fn(),
    onFork: fn(),
    onFavorite: fn(),
  },
  render: function Render(args): ReactElement {
    const [, updateArgs] = useArgs<ComponentProps<typeof PatternCard>>();
    return (
      <PatternCard
        {...args}
        sourceBadge={<PatternSourceBadge source="system" />}
        metadata={
          <PatternMetadataBadges
            category="Spaceships"
            rulesetId="standard"
            rulesetLabel="Conway's Game of Life"
            tags={['moving']}
            onCategorySelect={fn()}
            onRulesetSelect={fn()}
            onTagSelect={fn()}
          />
        }
        onFavorite={() => {
          args.onFavorite();
          updateArgs({
            favorite: !args.favorite,
            favoriteCount: args.favoriteCount + (args.favorite ? -1 : 1),
          });
        }}
      />
    );
  },
} satisfies Meta<typeof PatternCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Favorited: Story = { args: { favorite: true } };
export const LongTitle: Story = {
  args: { name: 'A long descriptive pattern title for a community-created spaceship' },
};
export const ToggleFavorite: Story = {
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    const favoriteButton = canvas
      .getAllByRole('button')
      .find((button) => button.classList.contains('explore-favorite-btn'));
    if (!favoriteButton) throw new Error('Favorite button is missing.');
    await userEvent.click(favoriteButton);
    await waitFor(async (): Promise<void> => {
      await expect(favoriteButton).toHaveTextContent('13');
      await expect(favoriteButton.querySelector('svg')).toHaveAttribute('fill', 'currentColor');
    });
  },
};
