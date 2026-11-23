import type { LifeGrid } from '@game-of-life/core';

export interface GridControlsProps {
  variant?: 'play' | 'edit';
  nextGeneration: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  updateGenerationSpeed: (value: number) => void;
  generationSpeed: number;
  hoveredCoordinate?: string | null;
  onResetRequested: () => void;
  toggleGame: () => void;
  isGameRunning: boolean;
  copyCurrentURL: () => void;
  selectedPaletteId: string;
  selectedDrawColor: string;
  onPaletteChange: (paletteId: string) => void;
  onDrawColorChange: (color: string) => void;
  onCustomColorCommitted?: (color: string) => void;
  isEditMode?: boolean;
  onEnterEditMode?: () => void;
  onEnterPlayMode?: () => void;
  onUndoBoardChange?: () => void;
  canUndoBoardChange?: boolean;
  isSystemPattern?: boolean;
  activeEditTool?: 'pencil' | 'eraser' | 'selection' | 'grab' | 'stamp';
  onEditToolChange?: (tool: 'pencil' | 'eraser' | 'selection' | 'grab' | 'stamp') => void;
  selectionCount?: number;
  onFillSelectionColor?: () => void;
  stampPattern?: LifeGrid | null;
  stampPreviewPattern?: LifeGrid | null;
  stampPatternName?: string;
  stampRotation?: 0 | 90 | 180 | 270;
  rotateStampKeyPressToken?: number;
  onRotateStamp?: () => void;
  onStampPatternSelect?: (grid: LifeGrid) => void;
}
