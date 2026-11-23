import { createLifeGrid, isLiveCell, LifeGrid } from '@game-of-life/core';

/**
 * Encodes a LifeGrid to a base64 string for use in URL parameters
 */
export function encodeGridToBase64(grid: LifeGrid): string {
  const jsonString = JSON.stringify(grid);
  // Use btoa for base64 encoding in the browser
  return btoa(jsonString);
}

/**
 * Decodes a base64 string from URL parameter back to a LifeGrid
 * Returns null if the string is invalid
 */
export function decodeBase64ToGrid(base64String: string): LifeGrid | null {
  try {
    // Use atob for base64 decoding in the browser
    const jsonString = atob(base64String);
    const grid = JSON.parse(jsonString);
    
    // Validate that the decoded object is a valid LifeGrid
    if (typeof grid !== 'object' || grid === null) {
      return null;
    }
    
    const seed: Record<string, boolean | string> = {};

    // Validate all keys are strings and all values are legacy booleans or color strings
    for (const [key, value] of Object.entries(grid)) {
      if (typeof key !== 'string' || (value !== true && !isLiveCell(value))) {
        return null;
      }

      seed[key] = value;
    }
    
    return createLifeGrid(seed);
  } catch (error) {
    console.error('Failed to decode grid from base64:', error);
    return null;
  }
}

/**
 * Gets the current grid pattern from URL query parameter
 */
export function getGridFromURL(): LifeGrid | null {
  const params = new URLSearchParams(window.location.search);
  const patternParam = params.get('pattern');
  
  if (!patternParam) {
    return null;
  }
  
  return decodeBase64ToGrid(patternParam);
}

/**
 * Updates the URL with the current grid pattern without reloading the page
 */
export function updateURLWithGrid(grid: LifeGrid): void {
  const base64Pattern = encodeGridToBase64(grid);
  const url = new URL(window.location.href);
  url.searchParams.set('pattern', base64Pattern);
  window.history.pushState({}, '', url.toString());
}
