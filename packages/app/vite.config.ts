import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_URL || '/game-of-life/',
  resolve: {
    alias: {
      '@game-of-life/core': path.resolve(__dirname, '../core/src/index.ts'),
      '@game-of-life/ui': path.resolve(__dirname, '../ui/src/index.ts'),
      '@game-of-life/ui-grid': path.resolve(__dirname, '../ui-grid/src/index.ts'),
      '@game-of-life/ui-patterns': path.resolve(__dirname, '../ui-patterns/src/index.ts'),
      '@game-of-life/ui-controls': path.resolve(__dirname, '../ui-controls/src/index.ts'),
      '@game-of-life/api': path.resolve(__dirname, '../api/src/index.ts'),
      '@game-of-life/util': path.resolve(__dirname, '../util/src/index.ts'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
  },
});
