import type { ReactElement } from 'react';
import { useStampPatterns } from '../hooks/useStampPatterns';
import { useStampMenu } from '../hooks/useStampMenu';
import type { GridControlsProps } from './GridControls.types';
import { StampPickerView } from './StampPickerView';

export interface StampSearchProps {
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export type StampPickerProps = Pick<
  GridControlsProps,
  | 'selectedPaletteId'
  | 'activeEditTool'
  | 'onEditToolChange'
  | 'stampPattern'
  | 'onStampPatternSelect'
  | 'stampPreviewPattern'
  | 'stampPatternName'
  | 'stampRotation'
  | 'onRotateStamp'
  | 'rotateStampKeyPressToken'
> &
  StampSearchProps;

export function StampPicker({
  rotateStampKeyPressToken = 0,
  ...props
}: StampPickerProps): ReactElement {
  const stamps = useStampPatterns(props);
  const menu = useStampMenu({
    rotateStampKeyPressToken,
    filteredPatternCount: stamps.filteredStampPatterns.length,
    selectedPattern: stamps.selectedPattern,
  });
  return <StampPickerView {...props} stamps={stamps} menu={menu} />;
}
