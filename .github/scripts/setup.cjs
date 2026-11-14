const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const themePath = path.resolve(root, '../wintermuted-ui-theme');

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!existsSync(themePath)) {
  run('git', [
    'clone',
    'https://github.com/wintermuted/ui-theme.git',
    themePath,
  ]);
}

if (!existsSync(path.join(themePath, 'package.json'))) {
  throw new Error(`Expected the ui-theme package at ${themePath}`);
}

if (process.platform === 'win32') {
  run(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm ci']);
} else {
  run('npm', ['ci']);
}
