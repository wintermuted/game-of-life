import { getGridBounds, getSelectionGrid, parseCoordinateKey } from './gridGeometry';
import type { LifeGrid } from '@game-of-life/core';

describe('playground grid geometry', () => {
  const grid: LifeGrid = { '-3,-2': '#ff0000', '-1,2': '#00ff00', '4,0': '#0000ff' };
  test('bounds handle empty grids, negative coordinates, and invalid keys', () => {
    expect(getGridBounds({})).toBeNull();
    expect(getGridBounds(grid)).toStrictEqual({ minX: -3, maxX: 4, minY: -2, maxY: 2 });
    expect(getGridBounds({ invalid: '#ff0000', '-1,2': '#00ff00' })).toStrictEqual({
      minX: -1,
      maxX: -1,
      minY: 2,
      maxY: 2,
    });
    expect(parseCoordinateKey('x,1')).toBeNull();
    expect(parseCoordinateKey('2,-4')).toStrictEqual({ x: 2, y: -4 });
  });
  test('selection includes its reversed endpoints and preserves source cells', () => {
    const snapshot = { ...grid };
    expect(getSelectionGrid(grid, '-1,2', '-3,-2')).toStrictEqual({
      '-3,-2': '#ff0000',
      '-1,2': '#00ff00',
    });
    expect(getSelectionGrid(grid, 'invalid', '-1,2')).toStrictEqual({});
    expect(grid).toStrictEqual(snapshot);
  });
});
