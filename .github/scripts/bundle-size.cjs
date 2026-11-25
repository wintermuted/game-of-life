const fs = require('node:fs/promises');
const path = require('node:path');
const { gzipSync } = require('node:zlib');

function formatSize(bytes) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(2)} MB`;
  return `${(bytes / 1_000).toFixed(1)} KB`;
}

function badge(label, size) {
  const title = `${label}: ${size}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="270" height="20" role="img" aria-label="${title}">
  <title>${title}</title>
  <rect width="270" height="20" rx="3" fill="#555"/>
  <path fill="#007ec6" d="M170 0h97a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3h-97z"/>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="85" y="14">${label}</text>
    <text x="220" y="14">${size}</text>
  </g>
</svg>
`;
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
