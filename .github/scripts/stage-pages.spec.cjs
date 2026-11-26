const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { describe, test } = require('node:test');

const script = path.join(__dirname, 'stage-pages.cjs');

async function write(directory, filename, content) {
  const target = path.join(directory, filename);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content);
}

async function fixture(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'life-pages-staging-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await write(directory, path.join('packages', 'app', 'build', 'index.html'), 'demo');
  await write(directory, path.join('packages', 'app', 'build', 'assets', 'demo.js'), 'demo code');
  await write(directory, path.join('packages', 'storybook', 'build', 'index.html'), 'catalog');
  await write(directory, path.join('packages', 'storybook', 'build', 'iframe.html'), 'preview');
  await write(directory, path.join('packages', 'storybook', 'build', 'index.json'), '{"v":5}');
  await write(
    directory,
    path.join('packages', 'storybook', 'build', 'sb-preview', 'runtime.js'),
    'catalog code',
  );
  return directory;
}

function run(directory, destination) {
  return spawnSync(process.execPath, [script, destination], {
    cwd: directory,
    encoding: 'utf8',
  });
}

describe('GitHub Pages app and Storybook staging', () => {
  test('places the app at root and the complete catalog in a sibling subdirectory', async (t) => {
    const directory = await fixture(t);
    const destination = path.join(directory, 'gh-pages-out');
    await write(destination, path.join('previews', 'pr-42', 'index.html'), 'existing preview');

    const result = run(directory, destination);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(await fs.readFile(path.join(destination, 'index.html'), 'utf8'), 'demo');
    assert.equal(
      await fs.readFile(path.join(destination, 'assets', 'demo.js'), 'utf8'),
      'demo code',
    );
    assert.equal(
      await fs.readFile(path.join(destination, 'storybook', 'index.html'), 'utf8'),
      'catalog',
    );
    assert.equal(
      await fs.readFile(path.join(destination, 'storybook', 'iframe.html'), 'utf8'),
      'preview',
    );
    assert.equal(
      await fs.readFile(path.join(destination, 'storybook', 'index.json'), 'utf8'),
      '{"v":5}',
    );
    assert.equal(
      await fs.readFile(path.join(destination, 'storybook', 'sb-preview', 'runtime.js'), 'utf8'),
      'catalog code',
    );
    assert.equal(
      await fs.readFile(path.join(destination, 'previews', 'pr-42', 'index.html'), 'utf8'),
      'existing preview',
    );
  });

  test('nests PR catalogs with their demo without overwriting production or other previews', async (t) => {
    const directory = await fixture(t);
    const root = path.join(directory, 'gh-pages-out');
    await write(root, 'index.html', 'production demo');
    await write(root, path.join('storybook', 'index.html'), 'production catalog');
    await write(root, path.join('previews', 'pr-41', 'index.html'), 'another preview');

    const result = run(directory, path.join(root, 'previews', 'pr-42'));
    assert.equal(result.status, 0, result.stderr);
    assert.equal(await fs.readFile(path.join(root, 'index.html'), 'utf8'), 'production demo');
    assert.equal(
      await fs.readFile(path.join(root, 'storybook', 'index.html'), 'utf8'),
      'production catalog',
    );
    assert.equal(
      await fs.readFile(path.join(root, 'previews', 'pr-41', 'index.html'), 'utf8'),
      'another preview',
    );
    assert.equal(
      await fs.readFile(path.join(root, 'previews', 'pr-42', 'storybook', 'index.html'), 'utf8'),
      'catalog',
    );
    assert.equal(
      await fs.readFile(path.join(root, 'previews', 'pr-42', 'index.html'), 'utf8'),
      'demo',
    );
  });

  test('rejects an incomplete Storybook build before changing the deployment directory', async (t) => {
    const directory = await fixture(t);
    const destination = path.join(directory, 'gh-pages-out');
    await write(destination, 'index.html', 'existing demo');
    await fs.unlink(path.join(directory, 'packages', 'storybook', 'build', 'iframe.html'));

    const result = run(directory, destination);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /ENOENT/);
    assert.equal(await fs.readFile(path.join(destination, 'index.html'), 'utf8'), 'existing demo');
    await assert.rejects(fs.access(path.join(destination, 'storybook')), { code: 'ENOENT' });
  });
});
