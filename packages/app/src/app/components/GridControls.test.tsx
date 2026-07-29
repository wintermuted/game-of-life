import { vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import GridControls from './GridControls';

describe('GridControls', () => {
  const mockNextGeneration = vi.fn();
  const mockUpdateGenerationSpeed = vi.fn();
  const mockOnResetRequested = vi.fn();
  const mockToggleGame = vi.fn();
  const mockCopyCurrentURL = vi.fn();
  const mockOnPaletteChange = vi.fn();
  const mockOnDrawColorChange = vi.fn();
  const mockOnEnterEditMode = vi.fn();
  const mockOnEnterPlayMode = vi.fn();

  const defaultProps = {
    variant: 'play' as const,
    nextGeneration: mockNextGeneration,
    updateGenerationSpeed: mockUpdateGenerationSpeed,
    generationSpeed: 3,
    onResetRequested: mockOnResetRequested,
    toggleGame: mockToggleGame,
    isGameRunning: false,
    copyCurrentURL: mockCopyCurrentURL,
    selectedPaletteId: 'classic',
    selectedDrawColor: '#22c55e',
    onPaletteChange: mockOnPaletteChange,
    onDrawColorChange: mockOnDrawColorChange,
    isEditMode: false,
    onEnterEditMode: mockOnEnterEditMode,
    onEnterPlayMode: mockOnEnterPlayMode,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows Start button when game is not running', () => {
    render(<GridControls {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });

  it('shows Pause button when game is running', () => {
    render(<GridControls {...defaultProps} isGameRunning={true} />);
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });

  it('calls toggleGame when Start/Pause button is clicked', () => {
    render(<GridControls {...defaultProps} />);
    const toggleButton = screen.getByRole('button', { name: 'Start' });
    fireEvent.click(toggleButton);
    expect(mockToggleGame).toHaveBeenCalledTimes(1);
  });

  it('disables Reset button when game is running', () => {
    render(<GridControls {...defaultProps} isGameRunning={true} />);
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    expect(resetButton).toBeDisabled();
  });

  it('enables Reset button when game is not running', () => {
    render(<GridControls {...defaultProps} isGameRunning={false} />);
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    expect(resetButton).not.toBeDisabled();
  });

  it('requests reset when Reset is clicked while game is paused', () => {
    render(<GridControls {...defaultProps} isGameRunning={false} />);
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    fireEvent.click(resetButton);
    expect(mockOnResetRequested).toHaveBeenCalledTimes(1);
  });

  it('does not request reset when Reset is clicked while game is running', () => {
    render(<GridControls {...defaultProps} isGameRunning={true} />);
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    fireEvent.click(resetButton);
    expect(mockOnResetRequested).not.toHaveBeenCalled();
  });

  it('calls nextGeneration when Next button is clicked', () => {
    render(<GridControls {...defaultProps} />);
    const nextButton = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);
    expect(mockNextGeneration).toHaveBeenCalledTimes(1);
  });

  it('calls updateGenerationSpeed when generation speed slider changes', () => {
    render(<GridControls {...defaultProps} />);
    const increaseButton = screen.getByRole('button', { name: 'Increase generation speed' });
    fireEvent.click(increaseButton);
    expect(mockUpdateGenerationSpeed).toHaveBeenCalledWith(4);
  });

  it('calls copyCurrentURL when Copy URL button is clicked', () => {
    render(<GridControls {...defaultProps} variant="edit" />);
    const copyButton = screen.getByRole('button', { name: 'Copy URL' });
    fireEvent.click(copyButton);
    expect(mockCopyCurrentURL).toHaveBeenCalledTimes(1);
  });

  it('shows Edit Mode button when toggleEditMode is provided', () => {
    render(<GridControls {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('shows Play mode button label when edit mode is active', () => {
    render(<GridControls {...defaultProps} isEditMode={true} />);
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
  });

  it('calls onEnterEditMode when Edit button is clicked', () => {
    render(<GridControls {...defaultProps} />);
    const editModeButton = screen.getByRole('button', { name: 'Edit' });
    fireEvent.click(editModeButton);
    expect(mockOnEnterEditMode).toHaveBeenCalledTimes(1);
  });

  it('calls onEnterPlayMode when Play button is clicked in edit mode', () => {
    render(<GridControls {...defaultProps} isEditMode={true} />);
    const playModeButton = screen.getByRole('button', { name: 'Play' });
    fireEvent.click(playModeButton);
    expect(mockOnEnterPlayMode).toHaveBeenCalledTimes(1);
  });

  it('disables Edit button for system patterns while in play mode', () => {
    render(<GridControls {...defaultProps} isSystemPattern={true} />);
    const editModeButton = screen.getByRole('button', { name: 'Edit' });
    expect(editModeButton).toBeDisabled();
  });

  it('enables Edit button for non-system patterns', () => {
    render(<GridControls {...defaultProps} isSystemPattern={false} />);
    const editModeButton = screen.getByRole('button', { name: 'Edit' });
    expect(editModeButton).not.toBeDisabled();
  });
});
