import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  test('orders summary, lock action and controls, and retains hidden control state', async () => {
    const { container } = render(
      <DisclosureSection title="Rules" headerAction={<button>Lock rules</button>}>
        <input aria-label="Rule draft" defaultValue="draft" />
      </DisclosureSection>,
    );
    const summary = container.querySelector('summary');
    const details = container.querySelector('details');
    const action = screen.getByRole('button', { name: 'Lock rules' });
    const input = screen.getByRole('textbox');
    expect(summary?.compareDocumentPosition(action)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(action.compareDocumentPosition(input)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(details).not.toContainElement(input);
    fireEvent.change(input, { target: { value: 'edited' } });
    details?.removeAttribute('open');
    fireEvent(details!, new Event('toggle'));
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
    expect(action).toBeVisible();
    expect(input).toHaveValue('edited');
    details?.setAttribute('open', '');
    fireEvent(details!, new Event('toggle'));
    await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue('edited'));
  });
});
