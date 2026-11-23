import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@game-of-life/core': path.resolve(import.meta.dirname, '../core/src/index.ts'),
      '@game-of-life/util': path.resolve(import.meta.dirname, '../util/src/index.ts'),
      '@game-of-life/api': path.resolve(import.meta.dirname, './src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
