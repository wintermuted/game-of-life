import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@game-of-life/ui-patterns': path.resolve(__dirname, './src/index.ts'),
      '@game-of-life/ui': path.resolve(__dirname, '../ui/src/index.ts'),
      '@game-of-life/core': path.resolve(__dirname, '../core/src/index.ts'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        /^react($|\/)/, /^react-dom($|\/)/, /^@game-of-life\//,
        'react-i18next', 'i18next',
      ],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
  },
});
