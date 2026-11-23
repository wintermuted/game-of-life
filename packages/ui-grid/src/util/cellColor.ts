import { getCellColor, isLiveCell } from '@game-of-life/core';
import { ColorPalette } from '@game-of-life/ui';

export function getCellFillColor(
  cellColor: string | undefined,
  _palette?: ColorPalette,
  isDark?: boolean,
): string {
  if (isLiveCell(cellColor)) {
    return getCellColor(cellColor);
  }

  return isDark ? '#161b22' : '#ebedf0';
}
