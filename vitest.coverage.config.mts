import path from 'node:path';
import { defineConfig, type TestProjectInlineConfiguration } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      ['core', 'vitest.config.mts'],
      ['util', 'vitest.config.mts'],
      ['api', 'vitest.config.mts'],
      ['ui', 'vite.config.ts'],
      ['ui-grid', 'vite.config.ts'],
      ['ui-patterns', 'vite.config.ts'],
      ['app', 'vite.config.mts'],
    ].map(([name, config]): TestProjectInlineConfiguration => ({
      extends: `./packages/${name}/${config}`,
      root: path.resolve(import.meta.dirname, 'packages', name),
      test: { name },
    })),
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: ['**/*.{spec,test}.{ts,tsx}', '**/*.d.ts', '**/setupTests.ts'],
      reporter: ['text', 'json-summary'],
      reportsDirectory: './coverage',
    },
  },
});
