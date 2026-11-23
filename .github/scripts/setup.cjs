const { spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (process.platform === 'win32') {
  run(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm ci']);
} else {
  run('npm', ['ci']);
}
