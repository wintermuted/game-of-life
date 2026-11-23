import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@game-of-life/core': path.resolve(__dirname, '../core/src/index.ts'),
      '@game-of-life/util': path.resolve(__dirname, '../util/src/index.ts'),
      '@game-of-life/api': path.resolve(__dirname, './src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
