import { PatternGallerySection, PatternPreview } from '@game-of-life/ui-patterns';
import { glider } from '@game-of-life/core';
import { Star } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Product/Compositions/Patterns/PatternGallerySection',
  component: PatternGallerySection,
  parameters: {
    docs: {
      description: {
        component:
          'Product gallery shell shared by Explore and Profile: title, optional icon, count, and host-rendered cards/table/empty content. It does not own filtering or board actions.',
      },
    },
  },
  args: {
    title: 'Spaceships',
    count: 1,
    viewMode: 'cards',
    children: (
      <div className="explore-patterns-grid">
        <PatternPreview grid={glider} size={88} />
      </div>
    ),
  },
  argTypes: { children: { control: false }, icon: { control: false } },
} satisfies Meta<typeof PatternGallerySection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Cards: Story = {};
export const ProfileSection: Story = {
  args: { title: 'Starred boards', icon: <Star size={16} />, viewMode: undefined },
};
export const Empty: Story = {
  args: { count: 0, children: <p className="profile-persistence-note">No boards yet.</p> },
};
export const Table: Story = {
  args: {
    viewMode: 'table',
    children: (
      <div className="profile-boards-table-wrap">
        <table className="profile-boards-table">
          <thead>
            <tr>
              <th>Board</th>
              <th>Stars</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Glider</td>
              <td>3</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
};
