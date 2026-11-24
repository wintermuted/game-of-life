import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const components = await import('@game-of-life/ui-staging');
const names = [
  'ToggleGroup',
  'FacetFilter',
  'SortableTableHeader',
  'StatCard',
  'RankedBarList',
  'Toast',
  'ColorPicker',
  'NumberStepper',
  'LanguageSelector',
];
for (const name of names) assert.equal(typeof components[name], 'function', name);
assert.ok(
  renderToStaticMarkup(
    createElement(components.StatCard, { label: 'Invoices', value: 7 }),
  ).includes('Invoices'),
);
assert.ok(existsSync(new URL('../' + manifest.exports['.'].types, import.meta.url)));
assert.ok(existsSync(new URL('../' + manifest.exports['./style.css'], import.meta.url)));
console.log('Staged runtime, declarations, stylesheet and server consumer passed.');
