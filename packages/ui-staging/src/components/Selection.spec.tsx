import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ToggleGroup, LanguageSelector } from '@game-of-life/ui-staging';

afterEach(cleanup);

test('toggle groups expose selection and forward arbitrary values without selecting disabled options', () => {
  const change = vi.fn();
  const options = [
    { value: 'invoices', label: 'Invoices' },
    { value: 'receipts', label: 'Receipts', disabled: true },
  ];
  const { rerender } = render(
    <ToggleGroup
      options={options}
      value="receipts"
      onChange={change}
      label="Documents"
      appearance="outline"
    />,
  );
  expect(screen.getByRole('button', { name: 'Receipts' })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Invoices' }));
  expect(change).toHaveBeenCalledWith('invoices');
  fireEvent.click(screen.getByRole('button', { name: 'Receipts' }));
  expect(change).toHaveBeenCalledOnce();
  rerender(
    <ToggleGroup options={options} value="invoices" onChange={change} label="Documents" disabled />,
  );
  expect(screen.getByRole('button', { name: 'Invoices' })).toBeDisabled();
});

const languages = [
  { value: 'ja', label: 'Japanese' },
  { value: 'sv', label: 'Swedish', disabled: true },
  { value: 'de', label: 'German' },
];

test('native language selection uses supplied choices without en/es assumptions', () => {
  const change = vi.fn();
  render(<LanguageSelector options={languages} value="ja" onChange={change} label="Locale" />);
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'de' } });
  expect(change).toHaveBeenCalledWith('de');
  expect(screen.getByRole('option', { name: 'Swedish' })).toBeDisabled();
});

test('drop-up navigates enabled options, selects, restores focus and dismisses on Escape/outside click', () => {
  const change = vi.fn();
  render(
    <LanguageSelector
      options={languages}
      value="ja"
      onChange={change}
      label="Locale"
      variant="dropup"
    />,
  );
  const trigger = screen.getByRole('button', { name: 'Locale' });
  fireEvent.click(trigger);
  expect(screen.getByRole('option', { name: 'Japanese' })).toHaveFocus();
  fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' });
  expect(screen.getByRole('option', { name: 'German' })).toHaveFocus();
  fireEvent.click(screen.getByRole('option', { name: 'German' }));
  expect(change).toHaveBeenCalledWith('de');
  expect(trigger).toHaveFocus();
  expect(screen.queryByRole('listbox')).toBeNull();
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
  expect(trigger).toHaveFocus();
  fireEvent.click(trigger);
  fireEvent.mouseDown(document.body);
  expect(screen.queryByRole('listbox')).toBeNull();
});
