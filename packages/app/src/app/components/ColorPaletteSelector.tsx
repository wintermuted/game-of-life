import { Box, Typography, Stack, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import { COLOR_PALETTES, ColorPalette } from '../constants/colors';
import { useTranslation } from 'react-i18next';

interface Props {
  selectedPaletteId: string;
  onPaletteChange: (paletteId: string) => void;
  disabled?: boolean;
}

function ColorPaletteSelector({ selectedPaletteId, onPaletteChange, disabled = false }: Props) {
  const { t } = useTranslation();
  
  const handleChange = (_event: React.MouseEvent<HTMLElement>, newPaletteId: string | null) => {
    if (newPaletteId !== null) {
      onPaletteChange(newPaletteId);
    }
  };

  return (
    <Box className="ColorPaletteSelector" sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>{t('colors.title')}</Typography>
      <ToggleButtonGroup
        value={selectedPaletteId}
        exclusive
        onChange={handleChange}
        aria-label="color palette selection"
        disabled={disabled}
        orientation="vertical"
        fullWidth
      >
        {COLOR_PALETTES.map((palette: ColorPalette) => (
          <ToggleButton 
            key={palette.id} 
            value={palette.id}
            aria-label={palette.name}
          >
            <Tooltip title={palette.description || palette.name} placement="right">
              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    backgroundColor: palette.liveCell,
                    border: '1px solid #999',
                    borderRadius: 1
                  }}
                />
                <Typography variant="body2">{palette.name}</Typography>
              </Stack>
            </Tooltip>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}

export default ColorPaletteSelector;
