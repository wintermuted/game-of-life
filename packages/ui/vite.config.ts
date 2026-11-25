import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@game-of-life/ui': path.resolve(import.meta.dirname, './src/index.ts'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rolldownOptions: {
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^@game-of-life\//,
        /^@wintermuted\//,
        'react-i18next',
        'i18next',
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
