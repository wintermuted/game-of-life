import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const sourceRoot = path.resolve(import.meta.dirname);
const packageRoot = path.dirname(sourceRoot);
const allowed = new Set(['react', 'react-dom', '@wintermuted/ui-theme']);

function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });
}

function checkSpecifier(specifier: string, file: string): void {
  if (specifier.startsWith('.')) {
    const target = path.resolve(path.dirname(file), specifier);
    expect(path.relative(sourceRoot, target).startsWith('..'), `${file}: ${specifier}`).toBe(false);
  } else {
    expect(
      [...allowed].some((name) => specifier === name || specifier.startsWith(`${name}/`)),
      `${file}: ${specifier}`,
    ).toBe(true);
  }
}

test('production import graph and manifest cannot depend on application context', () => {
  for (const file of files(sourceRoot).filter(
    (file) => /\.tsx?$/.test(file) && !file.includes('.spec.') && !file.endsWith('setupTests.ts'),
  )) {
    const content = readFileSync(file, 'utf8');
    const tree = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
    const visit = (node: ts.Node): void => {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
        expect(ts.isStringLiteral(node.moduleSpecifier)).toBe(true);
        if (ts.isStringLiteral(node.moduleSpecifier))
          checkSpecifier(node.moduleSpecifier.text, file);
      }
      if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
      ) {
        const argument = node.arguments[0];
        expect(argument && ts.isStringLiteral(argument), file).toBe(true);
        if (argument && ts.isStringLiteral(argument)) checkSpecifier(argument.text, file);
      }
      ts.forEachChild(node, visit);
    };
    visit(tree);
    expect(content).not.toMatch(
      /localStorage|sessionStorage|LifeGrid|useTranslation|react-router|game-of-life|diagnostics-|grid-controls-|explore-/,
    );
    expect(content.trimEnd().split('\n').length, file).toBeLessThanOrEqual(500);
  }
  const manifest = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  expect(manifest.private).toBe(true);
  for (const name of [
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
  ]) {
    expect(allowed.has(name), name).toBe(true);
  }
});

test('staged styles contain no app selectors and all stylesheet imports remain portable', () => {
  for (const file of files(path.join(sourceRoot, 'styles'))) {
    const css = readFileSync(file, 'utf8');
    expect(css).not.toMatch(/diagnostics-|grid-controls-|explore-|language-switcher|@game-of-life/);
    for (const match of css.matchAll(/@import\s+['"]([^'"]+)['"]/g)) {
      checkSpecifier(match[1], file);
    }
  }
});
