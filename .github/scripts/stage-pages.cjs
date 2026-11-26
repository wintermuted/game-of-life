const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const destination = process.argv[2];
  if (!destination) throw new Error('A Pages deployment directory is required.');

  const app = path.resolve('packages', 'app', 'build');
  const storybook = path.resolve('packages', 'storybook', 'build');
  await Promise.all([
    fs.access(path.join(app, 'index.html')),
    fs.access(path.join(storybook, 'index.html')),
    fs.access(path.join(storybook, 'iframe.html')),
    fs.access(path.join(storybook, 'index.json')),
  ]);

  await fs.mkdir(destination, { recursive: true });
  await fs.cp(app, destination, { recursive: true });
  await fs.cp(storybook, path.join(destination, 'storybook'), { recursive: true });
  console.log('Staged the demo app and Storybook together for GitHub Pages.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
