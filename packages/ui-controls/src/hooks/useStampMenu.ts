import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { Pattern } from '@game-of-life/core';

const STAMP_MENU_BOTTOM_CLEARANCE_PX = 10;
const STAMP_MENU_SCROLL_OFFSET_PX = 46;

interface Props {
  rotateStampKeyPressToken: number;
  filteredPatternCount: number;
  selectedPattern: Pattern | null;
}

export interface StampMenu {
  stampMenuRef: RefObject<HTMLDetailsElement | null>;
  stampMenuPanelRef: RefObject<HTMLDivElement | null>;
  stampMenuMaxHeight: number | null;
  stampMenuScrollMaxHeight: number | undefined;
  isRotateStampKeyPressed: boolean;
  onToggle: (event: React.SyntheticEvent<HTMLDetailsElement>) => void;
}

export function useStampMenu({
  rotateStampKeyPressToken,
  filteredPatternCount,
  selectedPattern,
}: Props): StampMenu {
  const [isRotateStampKeyPressed, setIsRotateStampKeyPressed] = useState(false);
  const [stampMenuMaxHeight, setStampMenuMaxHeight] = useState<number | null>(null);
  const [isStampMenuOpen, setIsStampMenuOpen] = useState(false);
  const stampMenuRef = useRef<HTMLDetailsElement | null>(null);
  const stampMenuPanelRef = useRef<HTMLDivElement | null>(null);

  const updateStampMenuMaxHeight = useCallback((): void => {
    const stampMenuElement = stampMenuRef.current;
    const stampMenuPanelElement = stampMenuPanelRef.current;
    if (!stampMenuElement || !stampMenuPanelElement || !stampMenuElement.open) return;

    const boardStageElement = stampMenuElement.closest('.grid-stage');
    if (!boardStageElement) return;

    const boardStageRect = boardStageElement.getBoundingClientRect();
    const panelRect = stampMenuPanelElement.getBoundingClientRect();
    const availableHeight = Math.floor(
      boardStageRect.bottom - STAMP_MENU_BOTTOM_CLEARANCE_PX - panelRect.top,
    );
    if (availableHeight <= 0) return;
    setStampMenuMaxHeight(availableHeight);
  }, []);

  useEffect(() => {
    if (!isStampMenuOpen) return;
    const frame = requestAnimationFrame(updateStampMenuMaxHeight);
    window.addEventListener('resize', updateStampMenuMaxHeight);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateStampMenuMaxHeight);
    };
  }, [isStampMenuOpen, updateStampMenuMaxHeight]);

  useEffect(() => {
    if (!isStampMenuOpen) return;
    const frame = requestAnimationFrame(updateStampMenuMaxHeight);
    return () => cancelAnimationFrame(frame);
  }, [filteredPatternCount, isStampMenuOpen, selectedPattern, updateStampMenuMaxHeight]);

  useEffect(() => {
    if (rotateStampKeyPressToken <= 0) return;
    setIsRotateStampKeyPressed(true);
    const timer = setTimeout(() => setIsRotateStampKeyPressed(false), 140);
    return () => clearTimeout(timer);
  }, [rotateStampKeyPressToken]);

  function onToggle(event: React.SyntheticEvent<HTMLDetailsElement>): void {
    const nextOpen = event.currentTarget.open;
    setIsStampMenuOpen(nextOpen);
    if (!nextOpen) setStampMenuMaxHeight(null);
  }

  return {
    stampMenuRef,
    stampMenuPanelRef,
    stampMenuMaxHeight,
    stampMenuScrollMaxHeight:
      stampMenuMaxHeight !== null
        ? Math.max(112, stampMenuMaxHeight - STAMP_MENU_SCROLL_OFFSET_PX)
        : undefined,
    isRotateStampKeyPressed,
    onToggle,
  };
}
