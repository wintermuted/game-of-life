import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ColorPicker, NumberStepper } from '@game-of-life/ui-staging';
import { normalizeHex } from './colorValue';

afterEach(cleanup);

const colorProps = {
  value: '#123456',
  label: 'Ink',
  inputLabel: 'Pick ink',
  hexLabel: 'Ink hex',
  invalidLabel: 'Use six hexadecimal digits',
  groups: [{ id: 'brand', label: 'Brand', choices: [{ value: '#abcdef', label: 'Ocean ink' }] }],
};

test.each([
  [' AABBCC ', '#aabbcc'],
  ['#123456', '#123456'],
  ['#abc', null],
  ['#12345g', null],
  ['', null],
])('normalizes six-digit input %s', (input, expected) => {
  expect(normalizeHex(input)).toBe(expected);
});

test('color picker separates blur and Enter commits, rejects invalid drafts, and forwards group metadata', () => {
  const change = vi.fn();
  const commit = vi.fn();
  const select = vi.fn();
  const { container } = render(
    <ColorPicker {...colorProps} onChange={change} onCommit={commit} onSelect={select} />,
  );
  const details = container.querySelector('details')!;
  details.open = true;
  const hex = screen.getByRole('textbox', { name: 'Ink hex' });
  fireEvent.change(hex, { target: { value: 'bad' } });
  fireEvent.keyDown(hex, { key: 'Enter' });
  expect(change).not.toHaveBeenCalled();
  expect(hex).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByRole('alert')).toHaveTextContent('Use six hexadecimal digits');
  fireEvent.change(hex, { target: { value: ' AABBCC ' } });
  fireEvent.blur(hex);
  expect(change).toHaveBeenLastCalledWith('#aabbcc');
  expect(commit).not.toHaveBeenCalled();
  hex.focus();
  fireEvent.keyDown(hex, { key: 'Enter' });
  expect(commit).toHaveBeenCalledWith('#aabbcc');
  expect(details.open).toBe(false);
  expect(details.querySelector('summary')).toHaveFocus();
  details.open = true;
  fireEvent.click(screen.getByRole('button', { name: 'Ocean ink' }));
  expect(select).toHaveBeenCalledWith('#abcdef', 'brand', 0);
  expect(details.open).toBe(false);
});

test('multiple color pickers generate distinct IDs and disable every editable control', () => {
  const { container } = render(
    <>
      <ColorPicker {...colorProps} disabled onChange={vi.fn()} onSelect={vi.fn()} />
      <ColorPicker {...colorProps} disabled onChange={vi.fn()} onSelect={vi.fn()} />
    </>,
  );
  container.querySelectorAll('details').forEach((details) => {
    details.open = true;
  });

  const native = screen.getAllByLabelText('Pick ink');
  expect(native[0].id).not.toBe(native[1].id);
  native.forEach((input) => expect(input).toBeDisabled());
  screen.getAllByRole('textbox').forEach((input) => expect(input).toBeDisabled());
  screen
    .getAllByRole('button', { name: 'Ocean ink' })
    .forEach((button) => expect(button).toBeDisabled());
});

test('reselecting the current swatch clears an invalid draft even when the controlled color does not change', () => {
  const { container } = render(
    <ColorPicker
      {...colorProps}
      onChange={vi.fn()}
      onSelect={vi.fn()}
      groups={[
        { id: 'ink', label: 'Ink', choices: [{ value: colorProps.value, label: 'Current ink' }] },
      ]}
    />,
  );
  container.querySelector('details')!.open = true;
  const hex = screen.getByRole('textbox', { name: 'Ink hex' });
  fireEvent.change(hex, { target: { value: 'invalid' } });
  fireEvent.keyDown(hex, { key: 'Enter' });
  fireEvent.click(screen.getByRole('button', { name: 'Current ink' }));
  expect(hex).toHaveValue(colorProps.value);
  expect(hex).toHaveAttribute('aria-invalid', 'false');
});

test('color popup dismisses on Escape and outside click', () => {
  const { container } = render(
    <ColorPicker {...colorProps} onChange={vi.fn()} onSelect={vi.fn()} />,
  );
  const details = container.querySelector('details')!;
  fireEvent.click(details.querySelector('summary')!);
  fireEvent.keyDown(details, { key: 'Escape' });
  expect(details.open).toBe(false);
  fireEvent.click(details.querySelector('summary')!);
  fireEvent(details, new Event('toggle'));
  fireEvent.mouseDown(document.body);
  expect(details.open).toBe(false);
});

const stepperProps = {
  min: 0,
  max: 1,
  step: 0.25,
  label: 'Quantity',
  decreaseLabel: 'Less',
  increaseLabel: 'More',
  valueLabel: 'Current quantity',
  decreaseIcon: '-',
  increaseIcon: '+',
};

test('stepper supports supplied fractional ranges and clamps at endpoints', () => {
  const change = vi.fn();
  const { rerender } = render(<NumberStepper {...stepperProps} value={0.9} onChange={change} />);
  fireEvent.click(screen.getByRole('button', { name: 'More' }));
  expect(change).toHaveBeenLastCalledWith(1);
  rerender(<NumberStepper {...stepperProps} value={0} onChange={change} />);
  expect(screen.getByRole('button', { name: 'Less' })).toBeDisabled();
  rerender(<NumberStepper {...stepperProps} value={1} onChange={change} />);
  expect(screen.getByRole('button', { name: 'More' })).toBeDisabled();
  rerender(<NumberStepper {...stepperProps} value={0.5} disabled onChange={change} />);
  expect(screen.getByRole('button', { name: 'Less' })).toBeDisabled();
});

test('stepper rejects invalid numeric contracts instead of silently substituting a value', () => {
  expect(() => render(<NumberStepper {...stepperProps} value={NaN} onChange={vi.fn()} />)).toThrow(
    RangeError,
  );
});
