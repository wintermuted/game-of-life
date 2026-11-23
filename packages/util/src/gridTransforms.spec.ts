import {
  mergeGridAtCoordinate,
  tintGridCells,
  getContiguousLiveRegionByColor,
  rotateGridAroundBoundsCenter,
  rotateStampRotationClockwise,
  rotateStampRotationCounterClockwise,
} from './gridTransforms';
import type { LifeGrid } from '@game-of-life/core';

describe('playground grid transforms', () => {
  const stamp: LifeGrid = { '-2,-1': '#ff0000', '-1,-1': '#00ff00', '-1,0': '#0000ff' };
  test('placement uses the floored bounds center and overwrites only overlapping cells', () => {
    const base: LifeGrid = { '10,10': '#ffffff', '0,0': '#ffffff' };
    expect(mergeGridAtCoordinate(base, stamp, '10,10')).toStrictEqual({
      '0,0': '#ffffff',
      '10,10': '#ff0000',
      '11,10': '#00ff00',
      '11,11': '#0000ff',
    });
    expect(base).toStrictEqual({ '10,10': '#ffffff', '0,0': '#ffffff' });
    expect(mergeGridAtCoordinate(base, {}, '1,1')).toBe(base);
    expect(mergeGridAtCoordinate(base, stamp, 'invalid')).toBe(base);
  });
  test('rotation retains colors and uses the same negative-coordinate center', () => {
    expect(rotateGridAroundBoundsCenter(stamp, 90)).toStrictEqual({
      '-2,-1': '#ff0000',
      '-2,-2': '#00ff00',
      '-1,-2': '#0000ff',
    });
    expect(rotateGridAroundBoundsCenter(stamp, 180)).toStrictEqual({
      '-2,-1': '#ff0000',
      '-3,-1': '#00ff00',
      '-3,-2': '#0000ff',
    });
    expect(rotateGridAroundBoundsCenter(stamp, 270)).toStrictEqual({
      '-2,-1': '#ff0000',
      '-2,0': '#00ff00',
      '-3,0': '#0000ff',
    });
    expect(rotateGridAroundBoundsCenter(stamp, 0)).toBe(stamp);
    expect(rotateGridAroundBoundsCenter({}, 90)).toStrictEqual({});
    expect(rotateStampRotationClockwise(270)).toBe(0);
    expect(rotateStampRotationCounterClockwise(0)).toBe(270);
    expect(stamp['-1,0']).toBe('#0000ff');
  });
  test('tinting and color fill traversal are immutable and include diagonal neighbors', () => {
    const region: LifeGrid = {
      '0,0': '#ff0000',
      '1,1': '#ff0000',
      '2,2': '#00ff00',
      '4,4': '#ff0000',
    };
    expect(getContiguousLiveRegionByColor(region, '0,0')).toStrictEqual(['0,0', '1,1']);
    expect(getContiguousLiveRegionByColor(region, '3,3')).toStrictEqual([]);
    expect(tintGridCells(stamp, '#ffffff')).toStrictEqual({
      '-2,-1': '#ffffff',
      '-1,-1': '#ffffff',
      '-1,0': '#ffffff',
    });
    expect(stamp['-2,-1']).toBe('#ff0000');
    expect(region['2,2']).toBe('#00ff00');
  });
});
