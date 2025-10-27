import { LifeGrid } from '../interfaces';

/**
 * Parses a string of coordinates into a LifeGrid
 * Supports multiple formats:
 * 1. JSON format: { "x,y": true, "x2,y2": true }
 * 2. Coordinate list format: x,y x2,y2 (space or newline separated)
 * 3. Coordinate pairs format: x,y\nx2,y2 (newline separated)
 */
export function parseCoordinates(input: string): LifeGrid {
  const trimmedInput = input.trim();
  
  if (!trimmedInput) {
    throw new Error('Input cannot be empty');
  }

  // Try parsing as JSON first
  if (trimmedInput.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmedInput);
      // Validate that all keys are valid coordinate strings
      const grid: LifeGrid = {};
      for (const key in parsed) {
        if (isValidCoordinate(key)) {
          grid[key] = true;
        } else {
          throw new Error(`Invalid coordinate format: ${key}`);
        }
      }
      if (Object.keys(grid).length === 0) {
        throw new Error('No valid coordinates found in JSON');
      }
      return grid;
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error('Invalid JSON format');
      }
      throw e;
    }
  }

  // Try parsing as coordinate list (space or newline separated)
  const grid: LifeGrid = {};
  const coordinates = trimmedInput.split(/[\s,]+/).filter(s => s.length > 0);
  
  // Process coordinates in pairs (x, y)
  for (let i = 0; i < coordinates.length; i += 2) {
    if (i + 1 >= coordinates.length) {
      throw new Error('Coordinates must come in x,y pairs');
    }
    
    const x = coordinates[i];
    const y = coordinates[i + 1];
    
    // Validate that x and y are integers
    if (!isInteger(x) || !isInteger(y)) {
      throw new Error(`Invalid coordinate: ${x},${y} - coordinates must be integers`);
    }
    
    const coord = `${x},${y}`;
    grid[coord] = true;
  }

  if (Object.keys(grid).length === 0) {
    throw new Error('No valid coordinates found');
  }

  return grid;
}

/**
 * Validates if a string is a valid coordinate in "x,y" format
 */
function isValidCoordinate(coord: string): boolean {
  const parts = coord.split(',');
  if (parts.length !== 2) {
    return false;
  }
  return isInteger(parts[0]) && isInteger(parts[1]);
}

/**
 * Checks if a string represents a valid integer (including negative numbers)
 */
function isInteger(str: string): boolean {
  const trimmed = str.trim();
  if (trimmed.length === 0) {
    return false;
  }
  const num = Number(trimmed);
  return Number.isInteger(num);
}
