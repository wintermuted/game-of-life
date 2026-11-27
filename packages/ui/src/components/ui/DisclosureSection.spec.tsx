import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { DisclosureSection } from './DisclosureSection';

afterEach(cleanup);

describe('Playground disclosure composition', () => {
  test.each([true, false])('keeps the lock action separate with open=%s', (defaultOpen) => {
    const onLock = vi.fn();
    const { container, rerender } = render(
      <DisclosureSection
        title="Rules"
        defaultOpen={defaultOpen}
        headerAction={<button onClick={onLock}>Lock rules</button>}
      >
        <input aria-label="Rule" />
      </DisclosureSection>,
    );
    const details = container.querySelector('details');
    const action = screen.getByRole('button', { name: 'Lock rules' });
    expect(details).toHaveClass('wm-accordion');
    expect(details?.open).toBe(defaultOpen);
    expect(details?.contains(action)).toBe(false);
    action.focus();
    fireEvent.click(action);
    expect(onLock).toHaveBeenCalledOnce();
    expect(action).toHaveFocus();
    expect(details?.open).toBe(defaultOpen);

    rerender(
      <DisclosureSection
        title="Rules"
        defaultOpen={defaultOpen}
        headerAction={
          <button onClick={onLock} disabled>
            Lock rules
          </button>
        }
      >
        <input aria-label="Rule" />
      </DisclosureSection>,
    );
    expect(screen.getByRole('button', { name: 'Lock rules' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Lock rules' }));
    expect(onLock).toHaveBeenCalledOnce();
    expect(details?.open).toBe(defaultOpen);
  });
});
