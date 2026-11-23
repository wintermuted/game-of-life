import { useState } from 'react';
import { patterns, type Pattern } from '@game-of-life/core';
import type { GridControlsProps } from '../components/GridControls.types';
import { getGridSignature } from '../components/stampSearch';

type Props = Pick<GridControlsProps, 'stampPattern' | 'onStampPatternSelect' | 'onEditToolChange'>;

export interface StampPatterns {
  stampSearchQuery: string;
  setStampSearchQuery: (query: string) => void;
  selectedStampCategory: string;
  setSelectedStampCategory: (category: string) => void;
  activeStampSignature: string | null;
  selectedPattern: Pattern | null;
  visibleStampCategoryOptions: string[];
  filteredStampPatterns: Pattern[];
  selectPattern: (event: React.MouseEvent<HTMLButtonElement>, pattern: Pattern) => void;
  closeCategoryMenu: (target: EventTarget | null) => void;
}

export function useStampPatterns({
  stampPattern,
  onStampPatternSelect,
  onEditToolChange,
}: Props): StampPatterns {
  const [stampSearchQuery, setStampSearchQuery] = useState('');
  const [selectedStampCategory, setSelectedStampCategory] = useState<string>('all');
  const activeStampSignature = stampPattern ? getGridSignature(stampPattern) : null;
  const selectedPattern = activeStampSignature
    ? (patterns.find((pattern) => getGridSignature(pattern.grid) === activeStampSignature) ?? null)
    : null;

  function closeClosestStampMenu(target: EventTarget | null): void {
    if (!(target instanceof HTMLElement)) return;
    const menu = target.closest('.grid-controls-stamp-menu') as HTMLDetailsElement | null;
    if (menu) {
      menu.open = false;
    }
  }

  function handleStampPatternSelection(
    event: React.MouseEvent<HTMLButtonElement>,
    pattern: Pattern,
  ): void {
    onStampPatternSelect?.(pattern.grid);
    onEditToolChange?.('stamp');
    setStampSearchQuery('');
    closeClosestStampMenu(event.currentTarget);
  }

  function closeClosestStampCategoryMenu(target: EventTarget | null): void {
    if (!(target instanceof HTMLElement)) return;
    const menu = target.closest(
      '.grid-controls-stamp-category-filter',
    ) as HTMLDetailsElement | null;
    if (menu) {
      menu.open = false;
    }
  }

  const stampCategoryOptions = [
    'all',
    ...Array.from(new Set(patterns.map((pattern) => pattern.category))).sort((a, b) =>
      a.localeCompare(b),
    ),
  ];
  const visibleStampCategoryOptions = stampCategoryOptions.filter(
    (categoryOption) => categoryOption !== selectedStampCategory,
  );
  const normalizedStampSearchQuery = stampSearchQuery.trim().toLowerCase();

  const filteredStampPatterns = patterns.filter((pattern) => {
    const signature = getGridSignature(pattern.grid);
    if (signature === activeStampSignature) {
      return false;
    }

    if (selectedStampCategory !== 'all' && pattern.category !== selectedStampCategory) {
      return false;
    }

    if (!normalizedStampSearchQuery) {
      return true;
    }

    const name = pattern.name.toLowerCase();
    const category = pattern.category.toLowerCase();
    return (
      name.includes(normalizedStampSearchQuery) || category.includes(normalizedStampSearchQuery)
    );
  });

  return {
    stampSearchQuery,
    setStampSearchQuery,
    selectedStampCategory,
    setSelectedStampCategory,
    activeStampSignature,
    selectedPattern,
    visibleStampCategoryOptions,
    filteredStampPatterns,
    selectPattern: handleStampPatternSelection,
    closeCategoryMenu: closeClosestStampCategoryMenu,
  };
}
