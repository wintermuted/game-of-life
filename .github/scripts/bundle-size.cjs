const fs = require('node:fs/promises');
const path = require('node:path');
const { gzipSync } = require('node:zlib');
const badge = require('./badge.cjs');

function formatSize(bytes) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(2)} MB`;
  return `${(bytes / 1_000).toFixed(1)} KB`;
}

async function measureDirectory(directory) {
  let raw = 0;
  let gzip = 0;
  let count = 0;
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = await measureDirectory(filename);
      raw += nested.raw;
      gzip += nested.gzip;
      count += nested.count;
    } else if (entry.isFile() && /\.(?:js|css)$/.test(entry.name)) {
      const content = await fs.readFile(filename);
      raw += content.length;
      gzip += gzipSync(content).length;
      count += 1;
    }
  }
  return { raw, gzip, count };
}

async function main() {
  const buildDirectory = path.resolve(process.argv[2] || 'packages/app/build');
  const { raw, gzip, count } = await measureDirectory(path.join(buildDirectory, 'assets'));
  if (count === 0) throw new Error('No JavaScript or CSS assets found in the app build.');

  const outputDirectory = path.join(buildDirectory, 'badges');
  await fs.mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    fs.writeFile(
      path.join(outputDirectory, 'bundle-gzip.svg'),
      badge('JS + CSS (gzip)', formatSize(gzip)),
    ),
    fs.writeFile(
      path.join(outputDirectory, 'bundle-uncompressed.svg'),
      badge('JS + CSS (uncompressed)', formatSize(raw)),
    ),
  ]);
  console.log(
    `Browser bundle (${count} assets): ${formatSize(gzip)} gzip / ${formatSize(raw)} raw`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
