import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
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
        'lucide-react',
      ],
    },
  },
});
