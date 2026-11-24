import { useEffect, useState } from 'react';
import type { GridControlsProps } from '../components/GridControls.types';

export const SYSTEM_DRAW_COLORS = [
  '#22c55e',
  '#39d353',
  '#3b82f6',
  '#f97316',
  '#ef4444',
  '#eab308',
  '#a855f7',
  '#06b6d4',
];
const DEFAULT_CUSTOM_COLORS = ['#ffffff', '#000000', '#f43f5e', '#14b8a6'];
const PALETTE_ID_BY_SYSTEM_COLOR: Record<string, string> = {
  '#22c55e': 'classic',
  '#39d353': 'github',
  '#3b82f6': 'ocean',
  '#f97316': 'sunset',
};

type DrawColorProps = Pick<
  GridControlsProps,
  'selectedDrawColor' | 'onDrawColorChange' | 'onPaletteChange'
>;

export interface DrawColors {
  customHexValue: string;
  setCustomHexValue: (value: string) => void;
  customColorSlots: string[];
  selectColor: (color: string, group: string, index: number) => void;
  changeColor: (color: string) => void;
}

export function useDrawColors({
  selectedDrawColor,
  onDrawColorChange,
  onPaletteChange,
}: DrawColorProps): DrawColors {
  const [customHexValue, setCustomHexValue] = useState(selectedDrawColor);
  const [customColorSlots, setCustomColorSlots] = useState<string[]>(() =>
    [selectedDrawColor, ...DEFAULT_CUSTOM_COLORS].slice(0, 4),
  );
  const [activeCustomSlotIndex, setActiveCustomSlotIndex] = useState(0);
  useEffect(() => {
    setCustomHexValue(selectedDrawColor);
  }, [selectedDrawColor]);
  useEffect(() => {
    setCustomColorSlots((previous) => {
      const lower = selectedDrawColor.toLowerCase();
      if (previous.some((color) => color.toLowerCase() === lower)) {
        return previous;
      }
      const next = [...previous];
      next[activeCustomSlotIndex] = selectedDrawColor;
      return next;
    });
  }, [activeCustomSlotIndex, selectedDrawColor]);

  function selectColor(color: string, group: string, index: number): void {
    if (group === 'system') {
      const paletteId = PALETTE_ID_BY_SYSTEM_COLOR[color.toLowerCase()];
      if (paletteId) onPaletteChange(paletteId);
    } else {
      setActiveCustomSlotIndex(index);
    }
    onDrawColorChange(color);
  }

  function changeColor(value: string): void {
    onDrawColorChange(value);
    setCustomColorSlots((previous) => {
      const next = [...previous];
      next[activeCustomSlotIndex] = value;
      return next;
    });
  }

  return {
    customHexValue,
    setCustomHexValue,
    customColorSlots,
    selectColor,
    changeColor,
  };
}
