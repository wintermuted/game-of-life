throw new Error(
  [
    'Root Vite config is deprecated.',
    'Use the canonical app at packages/app instead:',
    '  npm run dev',
    '  npm run build',
    'or direct Vite from packages/app: npx -C packages/app vite',
  ].join('\n')
);
