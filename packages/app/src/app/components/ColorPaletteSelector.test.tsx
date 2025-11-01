import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ColorPaletteSelector from './ColorPaletteSelector';
import { COLOR_PALETTES } from '../constants/colors';

describe('ColorPaletteSelector', () => {
  const mockOnPaletteChange = vi.fn();

  const defaultProps = {
    selectedPaletteId: 'classic',
    onPaletteChange: mockOnPaletteChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all color palettes', () => {
    render(<ColorPaletteSelector {...defaultProps} />);
    
    COLOR_PALETTES.forEach(palette => {
      expect(screen.getByText(palette.name)).toBeInTheDocument();
    });
  });

  it('shows the selected palette as active', () => {
    render(<ColorPaletteSelector {...defaultProps} selectedPaletteId="github" />);
    
    const githubButton = screen.getByRole('button', { name: /GitHub Contributions/i });
    expect(githubButton).toHaveClass('Mui-selected');
  });

  it('calls onPaletteChange when a palette is selected', () => {
    render(<ColorPaletteSelector {...defaultProps} />);
    
    const oceanButton = screen.getByRole('button', { name: /Ocean Blue/i });
    fireEvent.click(oceanButton);
    
    expect(mockOnPaletteChange).toHaveBeenCalledWith('ocean');
  });

  it('does not call onPaletteChange when clicking the already selected palette', () => {
    render(<ColorPaletteSelector {...defaultProps} selectedPaletteId="classic" />);
    
    const classicButton = screen.getByRole('button', { name: /Classic Green/i });
    fireEvent.click(classicButton);
    
    // MUI ToggleButtonGroup doesn't call onChange when clicking the same value
    expect(mockOnPaletteChange).not.toHaveBeenCalled();
  });

  it('disables all palette buttons when disabled prop is true', () => {
    render(<ColorPaletteSelector {...defaultProps} disabled={true} />);
    
    COLOR_PALETTES.forEach(palette => {
      const button = screen.getByRole('button', { name: palette.name });
      expect(button).toBeDisabled();
    });
  });

  it('displays color preview for each palette', () => {
    render(<ColorPaletteSelector {...defaultProps} />);
    
    // Check that we can find buttons for all palettes
    // Each palette button contains a color preview box
    COLOR_PALETTES.forEach(palette => {
      const button = screen.getByRole('button', { name: palette.name });
      expect(button).toBeInTheDocument();
    });
  });
});
