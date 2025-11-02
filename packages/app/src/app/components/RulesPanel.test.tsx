import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import RulesPanel from './RulesPanel';
import { DEFAULT_RULES } from '@game-of-life/core';

describe('RulesPanel', () => {
  test('renders all rules', () => {
    const mockOnRulesChange = vi.fn();
    render(<RulesPanel rules={DEFAULT_RULES} onRulesChange={mockOnRulesChange} />);
    
    expect(screen.getByText('Game Rules')).toBeInTheDocument();
    expect(screen.getByText('Survival (2 neighbors)')).toBeInTheDocument();
    expect(screen.getByText('Survival (3 neighbors)')).toBeInTheDocument();
    expect(screen.getByText('Birth (3 neighbors)')).toBeInTheDocument();
    expect(screen.getByText('Death (underpopulation/overpopulation)')).toBeInTheDocument();
  });

  test('toggles rule when clicked', () => {
    const mockOnRulesChange = vi.fn();
    render(<RulesPanel rules={DEFAULT_RULES} onRulesChange={mockOnRulesChange} />);
    
    const survival2Switch = screen.getByRole('checkbox', { name: /Survival \(2 neighbors\)/i });
    fireEvent.click(survival2Switch);
    
    expect(mockOnRulesChange).toHaveBeenCalledTimes(1);
    const updatedRules = mockOnRulesChange.mock.calls[0][0];
    expect(updatedRules.survival2.enabled).toBe(false);
  });

  test('disables switches when disabled prop is true', () => {
    const mockOnRulesChange = vi.fn();
    render(<RulesPanel rules={DEFAULT_RULES} onRulesChange={mockOnRulesChange} disabled={true} />);
    
    const switches = screen.getAllByRole('checkbox');
    switches.forEach(switchElement => {
      expect(switchElement).toBeDisabled();
    });
  });

  test('displays rule descriptions', () => {
    const mockOnRulesChange = vi.fn();
    render(<RulesPanel rules={DEFAULT_RULES} onRulesChange={mockOnRulesChange} />);
    
    expect(screen.getByText('Live cells with 2 neighbors survive')).toBeInTheDocument();
    expect(screen.getByText('Live cells with 3 neighbors survive')).toBeInTheDocument();
    expect(screen.getByText('Dead cells with 3 neighbors become alive')).toBeInTheDocument();
    expect(screen.getByText('Live cells with <2 or >3 neighbors die')).toBeInTheDocument();
  });
});
