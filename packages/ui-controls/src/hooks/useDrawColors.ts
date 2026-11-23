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
  customColorSlots: string[];
  setCustomHexValue: (value: string) => void;
  selectSystemColor: (event: React.MouseEvent<HTMLButtonElement>, color: string) => void;
  selectCustomColor: (
    event: React.MouseEvent<HTMLButtonElement>,
    color: string,
    index: number,
  ) => void;
  changeNativeColor: (value: string) => void;
  applyCustomHex: (value: string) => string | null;
  closeMenu: (target: EventTarget | null) => void;
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

  function closeClosestColorMenu(target: EventTarget | null): void {
    if (!(target instanceof HTMLElement)) return;
    const menu = target.closest('.grid-controls-color-picker') as HTMLDetailsElement | null;
    if (menu) {
      menu.open = false;
    }
  }

  function handleSystemColorSelect(
    event: React.MouseEvent<HTMLButtonElement>,
    color: string,
  ): void {
    const matchingPaletteId = PALETTE_ID_BY_SYSTEM_COLOR[color.toLowerCase()];
    if (matchingPaletteId) {
      onPaletteChange(matchingPaletteId);
    }
    onDrawColorChange(color);
    setCustomHexValue(color);
    closeClosestColorMenu(event.currentTarget);
  }

  function handleCustomColorSelect(
    event: React.MouseEvent<HTMLButtonElement>,
    color: string,
    index: number,
  ): void {
    setActiveCustomSlotIndex(index);
    onDrawColorChange(color);
    setCustomHexValue(color);
    closeClosestColorMenu(event.currentTarget);
  }

  function applyCustomHex(rawValue: string): string | null {
    const trimmed = rawValue.trim();
    const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    const validHex = /^#([0-9a-fA-F]{6})$/.test(normalized);
    if (!validHex) return null;

    const formatted = normalized.toLowerCase();
    setCustomHexValue(formatted);
    setCustomColorSlots((previous) => {
      const next = [...previous];
      next[activeCustomSlotIndex] = formatted;
      return next;
    });
    onDrawColorChange(formatted);
    return formatted;
  }

  function changeNativeColor(value: string): void {
    onDrawColorChange(value);
    setCustomHexValue(value);
    setCustomColorSlots((previous) => {
      const next = [...previous];
      next[activeCustomSlotIndex] = value;
      return next;
    });
  }

  return {
    customHexValue,
    customColorSlots,
    setCustomHexValue,
    selectSystemColor: handleSystemColorSelect,
    selectCustomColor: handleCustomColorSelect,
    changeNativeColor,
    applyCustomHex,
    closeMenu: closeClosestColorMenu,
  };
}
