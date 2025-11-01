import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemText,
  Chip
} from '@mui/material';
import { patterns, Pattern, LifeGrid } from '@game-of-life/core';
import PatternPreview from './PatternPreview';

interface Props {
  onSelectPattern: (grid: LifeGrid) => void;
  disabled?: boolean;
}

function PatternSelector({ onSelectPattern, disabled = false }: Props) {
  function handlePatternClick(pattern: Pattern) {
    if (!disabled) {
      onSelectPattern(pattern.grid);
    }
  }

  return (
    <Box>
      <List sx={{ 
        maxHeight: 400, 
        overflow: 'auto',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1
      }}>
        {patterns.map((pattern, index) => (
          <ListItem 
            key={pattern.name} 
            disablePadding
            divider={index < patterns.length - 1}
          >
            <ListItemButton 
              onClick={() => handlePatternClick(pattern)}
              disabled={disabled}
              sx={{ py: 1.5 }}
            >
              <Box sx={{ mr: 2 }}>
                <PatternPreview grid={pattern.grid} size={60} />
              </Box>
              <ListItemText 
                primary={pattern.name}
                secondary={
                  <Chip 
                    label={pattern.category} 
                    size="small" 
                    sx={{ mt: 0.5 }}
                  />
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default PatternSelector;
