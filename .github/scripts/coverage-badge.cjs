const fs = require('node:fs/promises');
const path = require('node:path');
const badge = require('./badge.cjs');

async function main() {
  const summaryPath = process.argv[2] || 'coverage/coverage-summary.json';
  const outputPath = process.argv[3] || 'packages/app/build/badges/unit-test-coverage.svg';
  const summary = JSON.parse(await fs.readFile(summaryPath, 'utf8'));
  const { covered, total } = summary?.total?.lines || {};
  if (
    !Number.isSafeInteger(covered) ||
    !Number.isSafeInteger(total) ||
    total <= 0 ||
    covered < 0 ||
    covered > total
  ) {
    throw new Error('Coverage summary must contain valid, nonempty total line counts.');
  }
  const percentage = `${((covered / total) * 100).toFixed(1)}%`;
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, badge('unit test coverage', percentage));
  console.log(`Unit test line coverage: ${percentage} (${covered}/${total} lines)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
