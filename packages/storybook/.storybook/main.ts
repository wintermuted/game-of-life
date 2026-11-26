import type { StorybookConfig } from '@storybook/react-vite';
import path from 'node:path';
import { mergeConfig, type UserConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: { viteConfigPath: false },
    },
  },
  core: { disableTelemetry: true },
  async viteFinal(viteConfig): Promise<UserConfig> {
    return mergeConfig(viteConfig, {
      resolve: {
        alias: {
          '@game-of-life/core': path.resolve(import.meta.dirname, '../../core/src/index.ts'),
          '@game-of-life/ui': path.resolve(import.meta.dirname, '../../ui/src/index.ts'),
          '@game-of-life/ui-grid': path.resolve(import.meta.dirname, '../../ui-grid/src/index.ts'),
          '@game-of-life/ui-patterns': path.resolve(
            import.meta.dirname,
            '../../ui-patterns/src/index.ts',
          ),
          '@game-of-life/ui-controls': path.resolve(
            import.meta.dirname,
            '../../ui-controls/src/index.ts',
          ),
          '@game-of-life/util': path.resolve(import.meta.dirname, '../../util/src/index.ts'),
        },
      },
    });
  },
};

export default config;
