import { useState } from 'react';
import Game from "../../class/Game";
import '../styles/Grid.scss';
import CanvasGrid from './CanvasGrid';
import { Box, IconButton, Tooltip } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import { ColorPalette } from '../constants/colors';
import { useThemeMode } from '../ThemeContext';

interface Props {
  game: Game;
  onMouseOver: (e: React.MouseEvent) => void;
  palette?: ColorPalette;
}

const PAN_AMOUNT = 10; // Number of cells to pan
const DEFAULT_CELL_SIZE = 7;
const MIN_CELL_SIZE = 2;
const MAX_CELL_SIZE = 20;
const ZOOM_STEP = 1;

function Grid({ game, onMouseOver, palette }: Props) {
  const { mode } = useThemeMode();
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);

  // Adaptive styling based on theme mode
  // Use more opaque backgrounds and add borders for better visibility
  const controlPanelBg = mode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)';
  const controlPanelBorder = mode === 'dark' ? '1px solid rgba(0, 0, 0, 0.2)' : '1px solid rgba(255, 255, 255, 0.3)';
  const iconColor = mode === 'dark' ? 'rgba(0, 0, 0, 0.87)' : 'white';
  const dividerColor = mode === 'dark' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.3)';
  const disabledIconColor = mode === 'dark' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)';

  if (!game) {
    return null;
  }

  const gameStatus = game.getStatus ? game.getStatus(): {};

  const handlePanUp = () => setOffsetY(prev => prev + PAN_AMOUNT);
  const handlePanDown = () => setOffsetY(prev => prev - PAN_AMOUNT);
  const handlePanLeft = () => setOffsetX(prev => prev + PAN_AMOUNT);
  const handlePanRight = () => setOffsetX(prev => prev - PAN_AMOUNT);
  const handleCenter = () => {
    setOffsetX(0);
    setOffsetY(0);
  };

  const handleZoomIn = () => setCellSize(prev => Math.min(prev + ZOOM_STEP, MAX_CELL_SIZE));
  const handleZoomOut = () => setCellSize(prev => Math.max(prev - ZOOM_STEP, MIN_CELL_SIZE));
  const handleResetZoom = () => setCellSize(DEFAULT_CELL_SIZE);

  return (
    <div className="Grid">
      <Box sx={{ position: 'relative' }}>
        <CanvasGrid 
          grid={gameStatus} 
          onMouseOver={onMouseOver} 
          gridSize={100} 
          cellSize={cellSize}
          offsetX={offsetX}
          offsetY={offsetY}
          palette={palette}
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            backgroundColor: controlPanelBg,
            border: controlPanelBorder,
            borderRadius: 1,
            padding: 1,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
        >
          {/* Pan Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Pan Up">
              <IconButton size="small" onClick={handlePanUp} aria-label="pan up" sx={{ color: iconColor }}>
                <ArrowUpwardIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
            <Tooltip title="Pan Left">
              <IconButton size="small" onClick={handlePanLeft} aria-label="pan left" sx={{ color: iconColor }}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Center View">
              <IconButton size="small" onClick={handleCenter} aria-label="center view" sx={{ color: iconColor }}>
                <CenterFocusStrongIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Pan Right">
              <IconButton size="small" onClick={handlePanRight} aria-label="pan right" sx={{ color: iconColor }}>
                <ArrowForwardIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Pan Down">
              <IconButton size="small" onClick={handlePanDown} aria-label="pan down" sx={{ color: iconColor }}>
                <ArrowDownwardIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* Divider */}
          <Box sx={{ height: '1px', backgroundColor: dividerColor, my: 0.5 }} />
          
          {/* Zoom Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
            <Tooltip title="Zoom Out">
              <span>
                <IconButton 
                  size="small" 
                  onClick={handleZoomOut} 
                  aria-label="zoom out"
                  disabled={cellSize <= MIN_CELL_SIZE}
                  sx={{ color: iconColor, '&.Mui-disabled': { color: disabledIconColor } }}
                >
                  <ZoomOutIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Reset Zoom">
              <IconButton 
                size="small" 
                onClick={handleResetZoom} 
                aria-label="reset zoom"
                sx={{ color: iconColor }}
              >
                <ZoomOutMapIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom In">
              <span>
                <IconButton 
                  size="small" 
                  onClick={handleZoomIn} 
                  aria-label="zoom in"
                  disabled={cellSize >= MAX_CELL_SIZE}
                  sx={{ color: iconColor, '&.Mui-disabled': { color: disabledIconColor } }}
                >
                  <ZoomInIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </div>
  );
}

export default Grid;