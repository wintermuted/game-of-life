// Color palette definitions for Game of Life cells

export interface ColorPalette {
  id: string;
  name: string;
  liveCell: string;
  deadCell: string;
  centerCell: string;
  deadCellDark: string;
  centerCellDark: string;
  description?: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'classic',
    name: 'Classic Green',
    liveCell: '#22c55e',
    deadCell: '#CCCCCC',
    centerCell: '#888888',
    deadCellDark: '#1a1a1a',
    centerCellDark: '#2e2e2e',
    description: 'Traditional green color scheme'
  },
  {
    id: 'github',
    name: 'GitHub Contributions',
    liveCell: '#39d353',
    deadCell: '#ebedf0',
    centerCell: '#9ca3af',
    deadCellDark: '#161b22',
    centerCellDark: '#21262d',
    description: 'GitHub contributions graph inspired palette'
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    liveCell: '#3b82f6',
    deadCell: '#dbeafe',
    centerCell: '#93c5fd',
    deadCellDark: '#0a1628',
    centerCellDark: '#0f2040',
    description: 'Cool ocean blue theme'
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    liveCell: '#f97316',
    deadCell: '#ffedd5',
    centerCell: '#fdba74',
    deadCellDark: '#1c0a00',
    centerCellDark: '#2d1500',
    description: 'Warm sunset orange theme'
  }
];

export const DEFAULT_PALETTE_ID = 'classic';

export function getPaletteById(id: string): ColorPalette {
  return COLOR_PALETTES.find(p => p.id === id) || COLOR_PALETTES[0];
}
