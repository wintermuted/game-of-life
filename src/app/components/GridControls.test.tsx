import { render, screen, fireEvent } from '@testing-library/react';
import GridControls from './GridControls';

describe('GridControls', () => {
  const mockNextGeneration = jest.fn();
  const mockUpdateGenerationSpeed = jest.fn();
  const mockResetBoard = jest.fn();
  const mockToggleGame = jest.fn();

  const defaultProps = {
    nextGeneration: mockNextGeneration,
    updateGenerationSpeed: mockUpdateGenerationSpeed,
    generationSpeed: 3,
    resetBoard: mockResetBoard,
    toggleGame: mockToggleGame,
    isGameRunning: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows Start button when game is not running', () => {
    render(<GridControls {...defaultProps} />);
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('shows Pause button when game is running', () => {
    render(<GridControls {...defaultProps} isGameRunning={true} />);
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  it('calls toggleGame when Start/Pause button is clicked', () => {
    render(<GridControls {...defaultProps} />);
    const toggleButton = screen.getByText('Start');
    fireEvent.click(toggleButton);
    expect(mockToggleGame).toHaveBeenCalledTimes(1);
  });

  it('disables Reset button when game is running', () => {
    render(<GridControls {...defaultProps} isGameRunning={true} />);
    const resetButton = screen.getByText('Reset');
    expect(resetButton).toBeDisabled();
  });

  it('enables Reset button when game is not running', () => {
    render(<GridControls {...defaultProps} isGameRunning={false} />);
    const resetButton = screen.getByText('Reset');
    expect(resetButton).not.toBeDisabled();
  });

  it('shows confirmation modal when Reset is clicked while game is paused', () => {
    render(<GridControls {...defaultProps} isGameRunning={false} />);
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    expect(screen.getByText('Confirm Reset')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to reset the game? This will clear the current state and start over.')).toBeInTheDocument();
  });

  it('does not show modal when Reset is clicked while game is running', () => {
    render(<GridControls {...defaultProps} isGameRunning={true} />);
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    expect(screen.queryByText('Confirm Reset')).not.toBeInTheDocument();
  });

  it('calls resetBoard when Yes, Reset is clicked in modal', () => {
    render(<GridControls {...defaultProps} isGameRunning={false} />);
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    const confirmButton = screen.getByText('Yes, Reset');
    fireEvent.click(confirmButton);
    
    expect(mockResetBoard).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Confirm Reset')).not.toBeInTheDocument();
  });

  it('closes modal without resetting when Cancel is clicked', () => {
    render(<GridControls {...defaultProps} isGameRunning={false} />);
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockResetBoard).not.toHaveBeenCalled();
    expect(screen.queryByText('Confirm Reset')).not.toBeInTheDocument();
  });

  it('calls nextGeneration when Next button is clicked', () => {
    render(<GridControls {...defaultProps} />);
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    expect(mockNextGeneration).toHaveBeenCalledTimes(1);
  });

  it('calls updateGenerationSpeed when generation speed slider changes', () => {
    render(<GridControls {...defaultProps} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '5' } });
    expect(mockUpdateGenerationSpeed).toHaveBeenCalledWith(5);
  });
});
