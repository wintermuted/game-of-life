const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { describe, test } = require('node:test');

const script = path.join(__dirname, 'coverage-badge.cjs');

async function fixture(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'life-coverage-badge-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  return {
    summary: path.join(directory, 'coverage-summary.json'),
    output: path.join(directory, 'badges', 'coverage.svg'),
  };
}

function run(files) {
  return spawnSync(process.execPath, [script, files.summary, files.output], { encoding: 'utf8' });
}

describe('unit test coverage badge', () => {
  test('uses aggregate line counts, not rounded percentages or per-file averages', async (t) => {
    const files = await fixture(t);
    await fs.writeFile(
      files.summary,
      JSON.stringify({
        total: { lines: { covered: 2, total: 3, pct: 66 } },
        'file.ts': { lines: { covered: 1, total: 1, pct: 100 } },
      }),
    );
    const result = run(files);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(
      (await fs.readFile(files.output, 'utf8')).includes(
        '<title>unit test coverage: 66.7%</title>',
      ),
    );
    await fs.writeFile(
      files.summary,
      JSON.stringify({ total: { lines: { covered: 0, total: 3 } } }),
    );
    assert.equal(run(files).status, 0);
    assert.match(await fs.readFile(files.output, 'utf8'), /coverage: 0\.0%/);
  });

  test('rejects empty or invalid totals instead of publishing a misleading badge', async (t) => {
    const files = await fixture(t);
    for (const lines of [
      undefined,
      { covered: 0, total: 0 },
      { covered: -1, total: 10 },
      { covered: 11, total: 10 },
      { covered: '5', total: 10 },
      { covered: 1.5, total: 10 },
    ]) {
      await fs.writeFile(files.summary, JSON.stringify({ total: { lines } }));
      const result = run(files);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /valid, nonempty total line counts/);
      await assert.rejects(fs.access(files.output), { code: 'ENOENT' });
    }
  });

  test('fails if the coverage report is missing or malformed', async (t) => {
    const files = await fixture(t);
    assert.equal(run(files).status, 1);
    await fs.writeFile(files.summary, 'not json');
    assert.equal(run(files).status, 1);
    await assert.rejects(fs.access(files.output), { code: 'ENOENT' });
  });
});
