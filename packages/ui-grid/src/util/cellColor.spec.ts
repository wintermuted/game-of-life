import { getCellFillColor } from './cellColor';

describe('cell rendering colors', () => {
  test('preserves stored live colors and light/dark dead-cell backgrounds after extraction', () => {
    expect(getCellFillColor('#ff0000', undefined, false)).toBe('#ff0000');
    expect(getCellFillColor('#ff0000', undefined, true)).toBe('#ff0000');
    expect(getCellFillColor(undefined)).toBe('#ebedf0');
    expect(getCellFillColor(undefined, undefined, true)).toBe('#161b22');
  });
});
