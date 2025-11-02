import { useState } from 'react';
import { Button, Slider, Typography, Box, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';

interface Props {
  nextGeneration: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  updateGenerationSpeed: (value: number) => void;
  generationSpeed: number;
  resetBoard: () => void;
  toggleGame: () => void;
  isGameRunning: boolean;
  copyCurrentURL: () => void;
}

function GridControls({ 
  nextGeneration, 
  updateGenerationSpeed, 
  generationSpeed,
  resetBoard,
  toggleGame,
  isGameRunning,
  copyCurrentURL
}: Props) {
  const [showResetModal, setShowResetModal] = useState(false);
  const { t } = useTranslation();

  function onChange(_event: Event, value: number | number[]) {
    if (typeof value === 'number') {
      updateGenerationSpeed(value);
    }
  }

  function confirmReset() {
    resetBoard();
    setShowResetModal(false);
  }

  function cancelReset() {
    setShowResetModal(false);
  }

  return (
    <Box className="GridControls" sx={{ p: 2, pb: 0 }}>
      <form onSubmit={(e) => e.preventDefault()}>

      <Typography variant="h5" gutterBottom>{t('controls.title')}</Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          color={isGameRunning ? "warning" : "success"} 
          startIcon={isGameRunning ? <PauseIcon /> : <PlayArrowIcon />} 
          onClick={toggleGame}
        >
          {isGameRunning ? t('controls.pause') : t('controls.start')}
        </Button>
        <Button variant="contained" startIcon={<SkipNextIcon />} onClick={nextGeneration}>{t('controls.next')}</Button>
        <Button 
          variant="outlined" 
          color="error"
          startIcon={<RestartAltIcon />} 
          onClick={() => setShowResetModal(true)}
          disabled={isGameRunning}
        >
          {t('controls.reset')}
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<ContentCopyIcon />} 
          onClick={copyCurrentURL}
          fullWidth
        >
          {t('controls.copyUrl')}
        </Button>
      </Stack>

      <Typography variant="h5" gutterBottom>{t('controls.variables')}</Typography>

      <Typography gutterBottom>{t('controls.generationSpeed')}: {generationSpeed}</Typography>
      <Slider
        name="generationSpeed"
        min={1}
        max={10}
        step={1}
        value={generationSpeed}
        onChange={onChange}
        marks
        valueLabelDisplay="auto"
        sx={{ width: '100%', maxWidth: 300, mb: 3 }}
      />
      </form>
      
      <Dialog open={showResetModal} onClose={cancelReset}>
        <DialogTitle>{t('dialogs.confirmReset')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('dialogs.resetMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelReset}>{t('dialogs.cancel')}</Button>
          <Button onClick={confirmReset} color="error" variant="contained">
            {t('dialogs.yesReset')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GridControls;