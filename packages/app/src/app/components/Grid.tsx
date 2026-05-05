import { useState } from 'react';
import { Game } from "@game-of-life/core";
import '../styles/Grid.scss';
import CanvasGrid from './CanvasGrid';
import { ColorPalette } from '../constants/colors';

interface Props {
  game: Game;
  onMouseOver: (e: React.MouseEvent) => void;
  palette?: ColorPalette;
  isEditMode?: boolean;
  onCellClick?: (coordinate: string) => void;
}

const PAN_AMOUNT = 10;
const DEFAULT_CELL_SIZE = 7;
const MIN_CELL_SIZE = 2;
const MAX_CELL_SIZE = 20;
const ZOOM_STEP = 1;

// Inline SVG icons for grid controls
const IconUp = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>;
const IconDown = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
const IconLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>;
const IconRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;
const IconCenter = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>;
const IconZoomIn = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;
const IconZoomOut = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;
const IconZoomReset = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>;

const btnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  padding: 0,
  border: '1px solid rgba(0,0,0,0.15)',
  borderRadius: 4,
  background: 'rgba(255,255,255,0.9)',
  color: '#333',
  cursor: 'pointer',
  lineHeight: 1,
};

function Grid({ game, onMouseOver, palette, isEditMode = false, onCellClick }: Props) {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);

  if (!game) return null;

  const gameStatus = game.getStatus ? game.getStatus() : {};

  const handlePanUp = () => setOffsetY(prev => prev + PAN_AMOUNT);
  const handlePanDown = () => setOffsetY(prev => prev - PAN_AMOUNT);
  const handlePanLeft = () => setOffsetX(prev => prev + PAN_AMOUNT);
  const handlePanRight = () => setOffsetX(prev => prev - PAN_AMOUNT);
  const handleCenter = () => { setOffsetX(0); setOffsetY(0); };
  const handleZoomIn = () => setCellSize(prev => Math.min(prev + ZOOM_STEP, MAX_CELL_SIZE));
  const handleZoomOut = () => setCellSize(prev => Math.max(prev - ZOOM_STEP, MIN_CELL_SIZE));
  const handleResetZoom = () => setCellSize(DEFAULT_CELL_SIZE);

  return (
    <div className="Grid">
      <div style={{ position: 'relative' }}>
        <CanvasGrid 
          grid={gameStatus} 
          onMouseOver={onMouseOver} 
          gridSize={100} 
          cellSize={cellSize}
          offsetX={offsetX}
          offsetY={offsetY}
          palette={palette}
          isEditMode={isEditMode}
          onCellClick={onCellClick}
        />
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 6,
            padding: 4,
          }}
        >
          {/* Pan Up */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button style={btnStyle} title="Pan Up" aria-label="pan up" onClick={handlePanUp} type="button"><IconUp /></button>
          </div>
          {/* Pan Left/Center/Right */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
            <button style={btnStyle} title="Pan Left" aria-label="pan left" onClick={handlePanLeft} type="button"><IconLeft /></button>
            <button style={btnStyle} title="Center View" aria-label="center view" onClick={handleCenter} type="button"><IconCenter /></button>
            <button style={btnStyle} title="Pan Right" aria-label="pan right" onClick={handlePanRight} type="button"><IconRight /></button>
          </div>
          {/* Pan Down */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button style={btnStyle} title="Pan Down" aria-label="pan down" onClick={handlePanDown} type="button"><IconDown /></button>
          </div>
          {/* Divider */}
          <div style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.12)', margin: '2px 0' }} />
          {/* Zoom */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
            <button style={{ ...btnStyle, opacity: cellSize <= MIN_CELL_SIZE ? 0.4 : 1 }} title="Zoom Out" aria-label="zoom out" onClick={handleZoomOut} disabled={cellSize <= MIN_CELL_SIZE} type="button"><IconZoomOut /></button>
            <button style={btnStyle} title="Reset Zoom" aria-label="reset zoom" onClick={handleResetZoom} type="button"><IconZoomReset /></button>
            <button style={{ ...btnStyle, opacity: cellSize >= MAX_CELL_SIZE ? 0.4 : 1 }} title="Zoom In" aria-label="zoom in" onClick={handleZoomIn} disabled={cellSize >= MAX_CELL_SIZE} type="button"><IconZoomIn /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Grid;