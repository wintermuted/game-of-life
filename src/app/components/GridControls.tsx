import { Button, Slider, Typography, Box, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ClearIcon from '@mui/icons-material/Clear';

import { useState } from 'react';
import '../styles/GridControls.scss';

interface Props {
  nextGeneration: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  updateGenerationSpeed: (value: number) => void;
  generationSpeed: number;
  resetBoard: () => void;
  toggleGame: () => void;
  isGameRunning: boolean;
}

function GridControls({ 
  nextGeneration, 
  updateGenerationSpeed, 
  generationSpeed,
  resetBoard,
  toggleGame,
  isGameRunning 
}: Props) {
  const [showResetModal, setShowResetModal] = useState(false);

  function onChange(_event: Event, value: number | number[]) {
    updateGenerationSpeed(value as number)
  }

  function confirmReset() {
    resetBoard();
    setShowResetModal(false);
  }

  function cancelReset() {
    setShowResetModal(false);
  }

  return (
    <Box className="GridControls" sx={{ p: 2 }}>
      <form onSubmit={(e) => e.preventDefault()}>

      <Typography variant="h5" gutterBottom>Game Controls</Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Button variant="contained" color="success" startIcon={<PlayArrowIcon />} onClick={toggleGame}>{isGameRunning ? 'Stop' : 'Start'}</Button>
        <Button variant="contained" startIcon={<SkipNextIcon />} onClick={nextGeneration}>Next</Button>
        <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={() => setShowResetModal(true)} disabled={isGameRunning}>Reset</Button>
      </Stack>

      <Typography variant="h5" gutterBottom>Game Variables</Typography>

      <Typography gutterBottom>Generation Speed: {generationSpeed}</Typography>
      <Slider
        name="generationSpeed"
        min={1}
        max={10}
        step={1}
        value={generationSpeed}
        onChange={onChange}
        marks
        valueLabelDisplay="auto"
        sx={{ width: '100%', maxWidth: 300 }}
      />
      </form>
      
      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Reset</h2>
            <p>Are you sure you want to reset the game? This will clear the current state and start over.</p>
            <div className="modal-buttons">
              <button onClick={confirmReset}>Yes, Reset</button>
              <button onClick={cancelReset}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}

export default GridControls;