import { handleXCoord, handleYCoord, translateGrid } from './coordinate';
import { LifeGrid } from '../../interfaces';

describe('coordinate utilities', () => {
  describe('handleXCoord', () => {
    const gridSize = 100;

    test('should handle positive x coordinate without offset', () => {
      expect(handleXCoord('10', gridSize)).toBe(60); // 10 + 50
    });

    test('should handle negative x coordinate without offset', () => {
      expect(handleXCoord('-10', gridSize)).toBe(40); // 50 - 10
    });

    test('should handle zero x coordinate without offset', () => {
      expect(handleXCoord('0', gridSize)).toBe(50); // 0 + 50
    });

    test('should apply positive offset to x coordinate', () => {
      expect(handleXCoord('10', gridSize, 5)).toBe(55); // 10 + 50 - 5
    });

    test('should apply negative offset to x coordinate', () => {
      expect(handleXCoord('10', gridSize, -5)).toBe(65); // 10 + 50 - (-5)
    });

    test('should handle negative x coordinate with offset', () => {
      expect(handleXCoord('-10', gridSize, 5)).toBe(35); // 50 - 10 - 5
    });
  });

  describe('handleYCoord', () => {
    const gridSize = 100;

    test('should handle positive y coordinate without offset', () => {
      expect(handleYCoord('10', gridSize)).toBe(39); // 50 - 1 - 10
    });

    test('should handle negative y coordinate without offset', () => {
      expect(handleYCoord('-10', gridSize)).toBe(59); // 50 - 1 - (-10)
    });

    test('should handle zero y coordinate without offset', () => {
      expect(handleYCoord('0', gridSize)).toBe(49); // 50 - 1 - 0
    });

    test('should apply positive offset to y coordinate', () => {
      expect(handleYCoord('10', gridSize, 5)).toBe(34); // 50 - 1 - 10 - 5
    });

    test('should apply negative offset to y coordinate', () => {
      expect(handleYCoord('10', gridSize, -5)).toBe(44); // 50 - 1 - 10 - (-5)
    });

    test('should handle negative y coordinate with offset', () => {
      expect(handleYCoord('-10', gridSize, 5)).toBe(54); // 50 - 1 - (-10) - 5
    });
  });

  describe('translateGrid', () => {
    const gridSize = 100;

    test('should translate grid without offset', () => {
      const grid: LifeGrid = {
        '0,0': true,
        '1,0': true,
        '0,1': true
      };

      const translated = translateGrid(grid, gridSize);

      expect(translated).toStrictEqual({
        '50,49': true,  // (0,0) -> (50, 49)
        '51,49': true,  // (1,0) -> (51, 49)
        '50,48': true   // (0,1) -> (50, 48)
      });
    });

    test('should translate grid with positive x offset', () => {
      const grid: LifeGrid = {
        '0,0': true,
        '10,0': true
      };

      const translated = translateGrid(grid, gridSize, 10, 0);

      expect(translated).toStrictEqual({
        '40,49': true,  // (0,0) with offsetX=10 -> (50-10, 49)
        '50,49': true   // (10,0) with offsetX=10 -> (60-10, 49)
      });
    });

    test('should translate grid with positive y offset', () => {
      const grid: LifeGrid = {
        '0,0': true,
        '0,10': true
      };

      const translated = translateGrid(grid, gridSize, 0, 10);

      expect(translated).toStrictEqual({
        '50,39': true,  // (0,0) with offsetY=10 -> (50, 49-10)
        '50,29': true   // (0,10) with offsetY=10 -> (50, 39-10)
      });
    });

    test('should translate grid with both x and y offsets', () => {
      const grid: LifeGrid = {
        '5,5': true,
        '-5,-5': true
      };

      const translated = translateGrid(grid, gridSize, 10, 10);

      expect(translated).toStrictEqual({
        '45,34': true,  // (5,5) with offsets (10,10) -> (55-10, 44-10)
        '35,44': true   // (-5,-5) with offsets (10,10) -> (45-10, 64-10)
      });
    });

    test('should translate grid with negative offsets', () => {
      const grid: LifeGrid = {
        '0,0': true
      };

      const translated = translateGrid(grid, gridSize, -10, -10);

      expect(translated).toStrictEqual({
        '60,59': true  // (0,0) with offsets (-10,-10) -> (50-(-10), 49-(-10))
      });
    });

    test('should handle empty grid', () => {
      const grid: LifeGrid = {};

      const translated = translateGrid(grid, gridSize, 5, 5);

      expect(translated).toStrictEqual({});
    });
  });
});
