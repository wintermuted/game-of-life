import { PatternMetadataBadges } from '@game-of-life/ui-patterns';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta = {
  title: 'Product/Patterns/PatternMetadataBadges',
  component: PatternMetadataBadges,
  parameters: {
    docs: {
      description: {
        component:
          'DEDUPLICATE-LATER: ExplorePatternTable keeps separate category, ruleset and tag cells.',
      },
    },
  },
  args: {
    category: 'Spaceships',
    rulesetId: 'standard',
    rulesetLabel: "Conway's Game of Life",
    tags: ['moving', 'small'],
    onCategorySelect: fn(),
    onRulesetSelect: fn(),
    onTagSelect: fn(),
  },
} satisfies Meta<typeof PatternMetadataBadges>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const NoTags: Story = { args: { tags: [] } };
export const SelectTag: Story = {
  play: async ({ canvasElement, args }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /moving/ }));
    await expect(args.onTagSelect).toHaveBeenCalledWith('moving');
  },
};
