import { useState } from 'react';
import { 
  Button, 
  TextField, 
  Typography, 
  Box, 
  Alert,
  Collapse 
} from '@mui/material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { parseCoordinates } from '../../core/coordinateParser';
import { LifeGrid } from '../../interfaces';

interface Props {
  onLoadPattern: (grid: LifeGrid) => void;
  disabled?: boolean;
}

function CustomPatternInput({ onLoadPattern, disabled = false }: Props) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  function handleLoad() {
    setError(null);
    
    try {
      const grid = parseCoordinates(input);
      onLoadPattern(grid);
      setInput(''); // Clear input after successful load
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Failed to parse coordinates');
      }
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    if (error) {
      setError(null); // Clear error when user starts typing
    }
  }

  return (
    <Box>
      <TextField
        multiline
        rows={4}
        fullWidth
        placeholder="Paste coordinates here..."
        value={input}
        onChange={handleInputChange}
        disabled={disabled}
        variant="outlined"
        sx={{ mb: 1 }}
        helperText={
          <Box
            component="span"
            role="button"
            tabIndex={0}
            onClick={() => setShowHelp(!showHelp)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowHelp(!showHelp);
              }
            }}
            sx={{ 
              cursor: 'pointer', 
              textDecoration: 'underline',
              '&:hover': {
                opacity: 0.7
              }
            }}
          >
            {showHelp ? 'Hide examples' : 'Show examples'}
          </Box>
        }
      />

      <Collapse in={showHelp}>
        <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="body2" gutterBottom>
            <strong>Supported formats:</strong>
          </Typography>
          <Typography variant="body2" component="div">
            <strong>1. JSON:</strong>
            <Box component="pre" sx={{ fontSize: '0.75rem', m: '4px 0' }}>
              {`{ "1,0": true, "0,1": true, "1,1": true }`}
            </Box>
          </Typography>
          <Typography variant="body2" component="div">
            <strong>2. Space-separated:</strong>
            <Box component="pre" sx={{ fontSize: '0.75rem', m: '4px 0' }}>
              {`1 0 0 1 1 1`}
            </Box>
          </Typography>
          <Typography variant="body2" component="div">
            <strong>3. Line-separated:</strong>
            <Box component="pre" sx={{ fontSize: '0.75rem', m: '4px 0' }}>
              {`1 0\n0 1\n1 1`}
            </Box>
          </Typography>
        </Box>
      </Collapse>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        color="primary"
        startIcon={<ContentPasteIcon />}
        onClick={handleLoad}
        disabled={disabled || !input.trim()}
        fullWidth
      >
        Load Custom Pattern
      </Button>
    </Box>
  );
}

export default CustomPatternInput;
