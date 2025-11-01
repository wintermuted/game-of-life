// Color palette definitions for Game of Life cells

export interface ColorPalette {
  id: string;
  name: string;
  liveCell: string;
  deadCell: string;
  centerCell: string;
  description?: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'classic',
    name: 'Classic Green',
    liveCell: '#22c55e',
    deadCell: '#CCCCCC',
    centerCell: '#888888',
    description: 'Traditional green color scheme'
  },
  {
    id: 'github',
    name: 'GitHub Contributions',
    liveCell: '#39d353',
    deadCell: '#ebedf0',
    centerCell: '#9ca3af',
    description: 'GitHub contributions graph inspired palette'
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    liveCell: '#3b82f6',
    deadCell: '#dbeafe',
    centerCell: '#93c5fd',
    description: 'Cool ocean blue theme'
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    liveCell: '#f97316',
    deadCell: '#ffedd5',
    centerCell: '#fdba74',
    description: 'Warm sunset orange theme'
  }
];

export const DEFAULT_PALETTE_ID = 'classic';

export function getPaletteById(id: string): ColorPalette {
  return COLOR_PALETTES.find(p => p.id === id) || COLOR_PALETTES[0];
}
