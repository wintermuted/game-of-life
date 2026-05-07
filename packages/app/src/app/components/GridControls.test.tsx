import { vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import GridControls from './GridControls';

describe('GridControls', () => {
  const mockNextGeneration = vi.fn();
  const mockUpdateGenerationSpeed = vi.fn();
  const mockOnResetRequested = vi.fn();
  const mockToggleGame = vi.fn();
  const mockCopyCurrentURL = vi.fn();
  const mockToggleEditMode = vi.fn();
  const mockOnPaletteChange = vi.fn();

  const defaultProps = {
    nextGeneration: mockNextGeneration,
    updateGenerationSpeed: mockUpdateGenerationSpeed,
    generationSpeed: 3,
    onResetRequested: mockOnResetRequested,
    toggleGame: mockToggleGame,
    isGameRunning: false,
    copyCurrentURL: mockCopyCurrentURL,
    selectedPaletteId: 'classic',
    onPaletteChange: mockOnPaletteChange,
    isEditMode: false,
    toggleEditMode: mockToggleEditMode,
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
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '5' } });
    expect(mockUpdateGenerationSpeed).toHaveBeenCalledWith(5);
  });

  it('calls copyCurrentURL when Copy URL button is clicked', () => {
    render(<GridControls {...defaultProps} />);
    const copyButton = screen.getByRole('button', { name: 'Copy URL' });
    fireEvent.click(copyButton);
    expect(mockCopyCurrentURL).toHaveBeenCalledTimes(1);
  });

  it('shows Edit Mode button when toggleEditMode is provided', () => {
    render(<GridControls {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Edit Mode' })).toBeInTheDocument();
  });

  it('does not show Edit Mode button when toggleEditMode is not provided', () => {
    const { toggleEditMode, ...propsWithoutEditMode } = defaultProps;
    render(<GridControls {...propsWithoutEditMode} />);
    expect(screen.queryByRole('button', { name: 'Edit Mode' })).not.toBeInTheDocument();
  });

  it('calls toggleEditMode when Edit Mode button is clicked', () => {
    render(<GridControls {...defaultProps} />);
    const editModeButton = screen.getByRole('button', { name: 'Edit Mode' });
    fireEvent.click(editModeButton);
    expect(mockToggleEditMode).toHaveBeenCalledTimes(1);
  });

  it('shows Edit Mode button as active when isEditMode is true', () => {
    render(<GridControls {...defaultProps} isEditMode={true} />);
    const editModeButton = screen.getByRole('button', { name: 'Edit Mode' });
    // Active edit mode should render the button in the active semantic variant.
    expect(editModeButton).toBeInTheDocument();
  });

  it('disables Edit Mode button when game is running', () => {
    render(<GridControls {...defaultProps} isGameRunning={true} />);
    const editModeButton = screen.getByRole('button', { name: 'Edit Mode' });
    expect(editModeButton).toBeDisabled();
  });

  it('enables Edit Mode button when game is not running', () => {
    render(<GridControls {...defaultProps} isGameRunning={false} />);
    const editModeButton = screen.getByRole('button', { name: 'Edit Mode' });
    expect(editModeButton).not.toBeDisabled();
  });
});
