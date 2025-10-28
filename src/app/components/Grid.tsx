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

interface Props {
  game: Game;
  onMouseOver: (e: React.MouseEvent) => void;
}

const PAN_AMOUNT = 10; // Number of cells to pan

function Grid({ game, onMouseOver }: Props) {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

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

  return (
    <div className="Grid">
      <Box sx={{ position: 'relative' }}>
        <CanvasGrid 
          grid={gameStatus} 
          onMouseOver={onMouseOver} 
          gridSize={100} 
          cellSize={7}
          offsetX={offsetX}
          offsetY={offsetY}
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 1,
            padding: 0.5
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Pan Up">
              <IconButton size="small" onClick={handlePanUp} aria-label="pan up">
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
            <Tooltip title="Pan Left">
              <IconButton size="small" onClick={handlePanLeft} aria-label="pan left">
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Center View">
              <IconButton size="small" onClick={handleCenter} aria-label="center view">
                <CenterFocusStrongIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Pan Right">
              <IconButton size="small" onClick={handlePanRight} aria-label="pan right">
                <ArrowForwardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Pan Down">
              <IconButton size="small" onClick={handlePanDown} aria-label="pan down">
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </div>
  );
}

export default Grid;