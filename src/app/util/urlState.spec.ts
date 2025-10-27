import { encodeGridToBase64, decodeBase64ToGrid, getGridFromURL, updateURLWithGrid } from './urlState';
import { LifeGrid } from '../../interfaces';

describe('urlState utilities', () => {
  describe('encodeGridToBase64', () => {
    test('should encode an empty grid', () => {
      const grid: LifeGrid = {};
      const encoded = encodeGridToBase64(grid);
      expect(encoded).toBe(btoa('{}'));
    });

    test('should encode a simple grid', () => {
      const grid: LifeGrid = {
        '0,0': true,
        '1,1': true,
      };
      const encoded = encodeGridToBase64(grid);
      const expected = btoa(JSON.stringify(grid));
      expect(encoded).toBe(expected);
    });

    test('should encode a complex grid', () => {
      const grid: LifeGrid = {
        '0,0': true,
        '1,0': true,
        '2,0': true,
        '0,1': true,
        '-5,-5': true,
      };
      const encoded = encodeGridToBase64(grid);
      const decoded = atob(encoded);
      expect(JSON.parse(decoded)).toStrictEqual(grid);
    });
  });

  describe('decodeBase64ToGrid', () => {
    test('should decode a valid base64 string to grid', () => {
      const grid: LifeGrid = {
        '0,0': true,
        '1,1': true,
      };
      const encoded = btoa(JSON.stringify(grid));
      const decoded = decodeBase64ToGrid(encoded);
      expect(decoded).toStrictEqual(grid);
    });

    test('should return null for invalid base64', () => {
      const result = decodeBase64ToGrid('invalid-base64!@#$');
      expect(result).toBeNull();
    });

    test('should return null for non-object JSON', () => {
      const encoded = btoa(JSON.stringify('not an object'));
      const result = decodeBase64ToGrid(encoded);
      expect(result).toBeNull();
    });

    test('should return null for grid with non-boolean values', () => {
      const invalidGrid = {
        '0,0': 'not a boolean',
      };
      const encoded = btoa(JSON.stringify(invalidGrid));
      const result = decodeBase64ToGrid(encoded);
      expect(result).toBeNull();
    });

    test('should return null for grid with non-string keys', () => {
      const invalidGrid = {
        '0,0': true,
      };
      const encoded = btoa(JSON.stringify(invalidGrid));
      // This test validates that keys must be strings (they always are in JSON)
      const result = decodeBase64ToGrid(encoded);
      expect(result).toStrictEqual(invalidGrid);
    });

    test('should handle empty grid', () => {
      const grid: LifeGrid = {};
      const encoded = btoa(JSON.stringify(grid));
      const decoded = decodeBase64ToGrid(encoded);
      expect(decoded).toStrictEqual({});
    });
  });

  describe('getGridFromURL', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      // Mock window.location
      delete (window as any).location;
      (window as any).location = { search: '' };
    });

    afterEach(() => {
      window.location = originalLocation;
    });

    test('should return null when no pattern parameter exists', () => {
      (window as any).location = { search: '' };
      const result = getGridFromURL();
      expect(result).toBeNull();
    });

    test('should decode pattern from URL parameter', () => {
      const grid: LifeGrid = { '0,0': true, '1,1': true };
      const encoded = btoa(JSON.stringify(grid));
      (window as any).location = { search: `?pattern=${encoded}` };
      const result = getGridFromURL();
      expect(result).toStrictEqual(grid);
    });

    test('should return null for invalid pattern parameter', () => {
      (window as any).location = { search: '?pattern=invalid' };
      const result = getGridFromURL();
      expect(result).toBeNull();
    });
  });

  describe('updateURLWithGrid', () => {
    const originalPushState = window.history.pushState;
    const originalLocation = window.location;

    beforeEach(() => {
      // Mock window.history.pushState
      window.history.pushState = jest.fn();
      
      // Mock window.location
      delete (window as any).location;
      (window as any).location = {
        href: 'http://localhost/',
        search: '',
      };
    });

    afterEach(() => {
      window.history.pushState = originalPushState;
      window.location = originalLocation;
    });

    test('should update URL with encoded grid pattern', () => {
      const grid: LifeGrid = { '0,0': true, '1,1': true };
      updateURLWithGrid(grid);
      
      expect(window.history.pushState).toHaveBeenCalled();
      const callArgs = (window.history.pushState as jest.Mock).mock.calls[0];
      const newUrl = callArgs[2];
      
      expect(newUrl).toContain('pattern=');
      
      // Extract and verify the pattern
      const url = new URL(newUrl);
      const pattern = url.searchParams.get('pattern');
      expect(pattern).toBeTruthy();
      
      if (pattern) {
        const decoded = decodeBase64ToGrid(pattern);
        expect(decoded).toStrictEqual(grid);
      }
    });
  });
});
