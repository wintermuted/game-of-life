import { parseCoordinates } from './coordinateParser';
import { LifeGrid } from '../interfaces';

describe('parseCoordinates', () => {
  describe('JSON format', () => {
    test('parses valid JSON format', () => {
      const input = '{ "1,0": true, "0,1": true, "1,1": true }';
      const expected: LifeGrid = {
        "1,0": true,
        "0,1": true,
        "1,1": true
      };
      expect(parseCoordinates(input)).toStrictEqual(expected);
    });

    test('parses JSON with negative coordinates', () => {
      const input = '{ "-1,0": true, "0,-1": true }';
      const expected: LifeGrid = {
        "-1,0": true,
        "0,-1": true
      };
      expect(parseCoordinates(input)).toStrictEqual(expected);
    });

    test('throws error for invalid JSON', () => {
      const input = '{ "1,0": true, "0,1": }';
      expect(() => parseCoordinates(input)).toThrow('Invalid JSON format');
    });

    test('throws error for JSON with invalid coordinate format', () => {
      const input = '{ "1": true, "2": true }';
      expect(() => parseCoordinates(input)).toThrow('Invalid coordinate format');
    });

    test('throws error for empty JSON', () => {
      const input = '{}';
      expect(() => parseCoordinates(input)).toThrow('No valid coordinates found in JSON');
    });
  });

  describe('coordinate list format', () => {
    test('parses space-separated coordinates', () => {
      const input = '1 0 0 1 1 1';
      const expected: LifeGrid = {
        "1,0": true,
        "0,1": true,
        "1,1": true
      };
      expect(parseCoordinates(input)).toStrictEqual(expected);
    });

    test('parses newline-separated coordinates', () => {
      const input = '1 0\n0 1\n1 1';
      const expected: LifeGrid = {
        "1,0": true,
        "0,1": true,
        "1,1": true
      };
      expect(parseCoordinates(input)).toStrictEqual(expected);
    });

    test('parses comma-separated coordinates', () => {
      const input = '1,0,0,1,1,1';
      const expected: LifeGrid = {
        "1,0": true,
        "0,1": true,
        "1,1": true
      };
      expect(parseCoordinates(input)).toStrictEqual(expected);
    });

    test('parses mixed separators', () => {
      const input = '1,0 0,1\n1,1';
      const expected: LifeGrid = {
        "1,0": true,
        "0,1": true,
        "1,1": true
      };
      expect(parseCoordinates(input)).toStrictEqual(expected);
    });

    test('parses negative coordinates', () => {
      const input = '-1 0 0 -1';
      const expected: LifeGrid = {
        "-1,0": true,
        "0,-1": true
      };
      expect(parseCoordinates(input)).toStrictEqual(expected);
    });

    test('throws error for odd number of coordinates', () => {
      const input = '1 0 0';
      expect(() => parseCoordinates(input)).toThrow('Coordinates must come in x,y pairs');
    });

    test('throws error for non-integer coordinates', () => {
      const input = '1.5 0';
      expect(() => parseCoordinates(input)).toThrow('coordinates must be integers');
    });

    test('throws error for non-numeric coordinates', () => {
      const input = 'a b';
      expect(() => parseCoordinates(input)).toThrow('coordinates must be integers');
    });
  });

  describe('edge cases', () => {
    test('throws error for empty input', () => {
      expect(() => parseCoordinates('')).toThrow('Input cannot be empty');
    });

    test('throws error for whitespace-only input', () => {
      expect(() => parseCoordinates('   ')).toThrow('Input cannot be empty');
    });

    test('handles extra whitespace', () => {
      const input = '  1  0   0  1  ';
      const expected: LifeGrid = {
        "1,0": true,
        "0,1": true
      };
      expect(parseCoordinates(input)).toStrictEqual(expected);
    });
  });
});
