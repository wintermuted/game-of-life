const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { gzipSync } = require('node:zlib');
const { describe, test } = require('node:test');

const script = path.join(__dirname, 'bundle-size.cjs');

async function fixture(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'life-bundle-size-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  return directory;
}

function run(directory) {
  return spawnSync(process.execPath, [script, directory], { encoding: 'utf8' });
}

describe('browser bundle size badges', () => {
  test('sums JS and CSS including nested optional chunks, compressing each file separately', async (t) => {
    const directory = await fixture(t);
    const files = {
      'index.js': 'console.log("hello");'.repeat(100),
      'index.css': '.app { color: red; }'.repeat(50),
      'nested/optional.js': 'export default 42;'.repeat(20),
    };
    await fs.mkdir(path.join(directory, 'assets', 'nested'), { recursive: true });
    for (const [filename, content] of Object.entries(files)) {
      await fs.writeFile(path.join(directory, 'assets', filename), content);
    }
    await fs.writeFile(path.join(directory, 'assets', 'index.js.map'), 'ignored'.repeat(1_000));
    await fs.writeFile(path.join(directory, 'assets', 'logo.svg'), '<svg/>');
    await fs.writeFile(path.join(directory, 'index.html'), '<html/>');

    const result = run(directory);
    assert.equal(result.status, 0, result.stderr);
    const raw = Object.values(files).reduce((sum, content) => sum + Buffer.byteLength(content), 0);
    const gzip = Object.values(files).reduce((sum, content) => sum + gzipSync(content).length, 0);
    const rawBadge = await fs.readFile(
      path.join(directory, 'badges', 'bundle-uncompressed.svg'),
      'utf8',
    );
    const gzipBadge = await fs.readFile(path.join(directory, 'badges', 'bundle-gzip.svg'), 'utf8');
    assert.ok(
      rawBadge.includes(`<title>JS + CSS (uncompressed): ${(raw / 1_000).toFixed(1)} KB</title>`),
    );
    assert.ok(
      gzipBadge.includes(`<title>JS + CSS (gzip): ${(gzip / 1_000).toFixed(1)} KB</title>`),
    );
    assert.match(result.stdout, /3 assets/);

    await fs.writeFile(path.join(directory, 'assets', 'index.js'), 'updated');
    const updated = run(directory);
    assert.equal(updated.status, 0, updated.stderr);
    assert.notEqual(
      await fs.readFile(path.join(directory, 'badges', 'bundle-uncompressed.svg'), 'utf8'),
      rawBadge,
    );
  });

  test('formats larger bundles in MB', async (t) => {
    const directory = await fixture(t);
    await fs.mkdir(path.join(directory, 'assets'));
    await fs.writeFile(path.join(directory, 'assets', 'index.js'), 'x'.repeat(1_250_000));
    const result = run(directory);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /1\.25 MB raw/);
  });

  test('fails instead of publishing zero-size badges for an empty assets directory', async (t) => {
    const directory = await fixture(t);
    await fs.mkdir(path.join(directory, 'assets'));
    const result = run(directory);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /No JavaScript or CSS assets found/);
    await assert.rejects(fs.access(path.join(directory, 'badges')), { code: 'ENOENT' });
  });

  test('fails when the app build is missing', async (t) => {
    const directory = await fixture(t);
    const result = run(directory);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /ENOENT/);
  });
});
