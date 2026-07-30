import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import RulesPanel from './RulesPanel';
import { DAY_AND_NIGHT_RULESET, DEFAULT_RULES, HIGHLIFE_RULESET } from '@game-of-life/core';

describe('RulesPanel', () => {
  test('renders all rules', () => {
    const mockOnRulesChange = vi.fn();
    render(<RulesPanel rules={DEFAULT_RULES} onRulesChange={mockOnRulesChange} />);
    
    expect(screen.getByText('Game Rules')).toBeInTheDocument();
    expect(screen.getByText('Standard Rules (B3/S23)')).toBeInTheDocument();
    expect(screen.getByText('Underpopulation')).toBeInTheDocument();
    expect(screen.getByText('Survival')).toBeInTheDocument();
    expect(screen.getByText('Reproduction')).toBeInTheDocument();
    expect(screen.getByText('S0-1')).toBeInTheDocument();
    expect(screen.getByText('S2-3')).toBeInTheDocument();
    expect(screen.getByText('B3')).toBeInTheDocument();
    expect(screen.queryByText('HighLife Reproduction (B6)')).not.toBeInTheDocument();
    expect(screen.getByText('Competition Birth')).toBeInTheDocument();
    expect(screen.getByText('Competition Dominant Birth')).toBeInTheDocument();
    expect(screen.getByText('Competition Tie-Break Birth')).toBeInTheDocument();
    expect(screen.getByText('Overpopulation')).toBeInTheDocument();
    expect(screen.getByText('S4-8')).toBeInTheDocument();
  });

  test('applies a selected ruleset preset', () => {
    const mockOnRulesChange = vi.fn();
    const mockOnRulesetChange = vi.fn();
    render(
      <RulesPanel
        rules={DEFAULT_RULES}
        onRulesChange={mockOnRulesChange}
        onRulesetChange={mockOnRulesetChange}
      />,
    );

    fireEvent.change(screen.getByRole('combobox', { name: 'Active ruleset' }), { target: { value: 'highlife' } });
    expect(mockOnRulesetChange).toHaveBeenCalledWith('highlife');
  });

  test('offers and displays generalized Life-like presets', () => {
    const mockOnRulesChange = vi.fn();
    render(
      <RulesPanel
        rules={DAY_AND_NIGHT_RULESET.rules}
        onRulesChange={mockOnRulesChange}
        selectedRulesetId="day-and-night"
        activeRulesetClassification="B3678/S34678"
      />,
    );

    expect(screen.getByRole('option', { name: 'Day & Night' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Life without Death' })).toBeInTheDocument();
    expect(screen.getByText('B3678')).toBeInTheDocument();
    expect(screen.getByText('S34678')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /Underpopulation/i })).not.toBeInTheDocument();
  });

  test('updates reproduction info for HighLife', () => {
    const mockOnRulesChange = vi.fn();
    render(
      <RulesPanel
        rules={HIGHLIFE_RULESET.rules}
        onRulesChange={mockOnRulesChange}
        selectedRulesetId="highlife"
        activeRulesetClassification="B36/S23"
      />,
    );

    expect(screen.getByText('B36')).toBeInTheDocument();
    expect(screen.getByLabelText('Dead cells with exactly three or six live neighbors become live cells (HighLife B36 reproduction).')).toBeInTheDocument();
    expect(screen.queryByLabelText('Dead cells with exactly three live neighbors become live cells, as if by reproduction.')).not.toBeInTheDocument();
  });

  test('toggles rule when clicked', () => {
    const mockOnRulesChange = vi.fn();
    render(<RulesPanel rules={DEFAULT_RULES} onRulesChange={mockOnRulesChange} />);
    
    const survival2Switch = screen.getByRole('checkbox', { name: /Underpopulation/i });
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

  test('disables switches when rules are locked', () => {
    const mockOnRulesChange = vi.fn();
    render(
      <RulesPanel
        rules={DEFAULT_RULES}
        onRulesChange={mockOnRulesChange}
        rulesLocked={true}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  test('exposes rule descriptions on info icons', () => {
    const mockOnRulesChange = vi.fn();
    render(<RulesPanel rules={DEFAULT_RULES} onRulesChange={mockOnRulesChange} />);

    expect(screen.getByLabelText('Live cells with fewer than two live neighbors die, as if by underpopulation.')).toBeInTheDocument();
    expect(screen.getByLabelText('Live cells with two or three live neighbors live on to the next generation.')).toBeInTheDocument();
    expect(screen.getByLabelText('Dead cells with exactly three live neighbors become live cells, as if by reproduction.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Dead cells with exactly six live neighbors become live cells (HighLife B6 rule).')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Mixed-species births use competition modifiers instead of default color assignment')).toBeInTheDocument();
    expect(screen.getByLabelText('When mixed-species births occur, the color with the highest neighbor count wins reproduction')).toBeInTheDocument();
    expect(screen.getByLabelText('When species competition ties, births randomly choose among the tied colors instead of failing')).toBeInTheDocument();
    expect(screen.getByLabelText('Live cells with more than three live neighbors die, as if by overpopulation.')).toBeInTheDocument();
  });
});
