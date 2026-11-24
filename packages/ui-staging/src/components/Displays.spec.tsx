import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { RankedBarList, StatCard, Toast } from '@game-of-life/ui-staging';

afterEach(cleanup);

test('neutral dashboard consumer renders supplied metrics and accurately scaled comparisons', () => {
  const { container } = render(
    <StatCard label="Quarterly orders" value={0} tone="success">
      <RankedBarList
        label="Departments"
        maximum={100}
        minimumWidthPercent={6}
        empty="No departments"
        items={[
          { id: 'a', label: 'Shipping', value: 50, valueLabel: '50 orders', color: '#123456' },
          { id: 'b', label: 'Returns', value: 1, valueLabel: '1 order' },
        ]}
      />
    </StatCard>,
  );
  expect(screen.getByText('0')).toBeInTheDocument();
  const rows = within(screen.getByRole('list', { name: 'Departments' })).getAllByRole('listitem');
  expect(rows[0]).toHaveTextContent('Shipping50 orders');
  const bars = container.querySelectorAll<HTMLElement>('.wm-staged-ranked-fill');
  expect(bars[0].style.width).toBe('50%');
  expect(bars[1].style.width).toBe('6%');
});

test('ranked lists retain empty copy and handle a zero scale without invalid widths', () => {
  const { rerender, container } = render(
    <RankedBarList label="Stock" maximum={0} empty="No stock" items={[]} />,
  );
  expect(screen.getByText('No stock')).toBeInTheDocument();
  rerender(
    <RankedBarList
      label="Stock"
      maximum={0}
      empty="No stock"
      items={[{ id: 'a', label: 'Boxes', value: 0, valueLabel: 'Zero' }]}
    />,
  );
  expect(container.querySelector<HTMLElement>('.wm-staged-ranked-fill')?.style.width).toBe('0%');
});

test('ranked lists reject invalid values', () => {
  expect(() =>
    render(
      <RankedBarList
        label="Stock"
        maximum={10}
        empty="Empty"
        items={[{ id: 'a', label: 'Boxes', value: Infinity, valueLabel: 'Invalid' }]}
      />,
    ),
  ).toThrow(RangeError);
});

test('toast supplies action content and dismissal without owning application timing or routing', () => {
  const dismiss = vi.fn();
  const { rerender, container } = render(
    <Toast
      open
      message="Invoice saved"
      dismissLabel="Close notice"
      onDismiss={dismiss}
      action={<a href="#invoices">View invoices</a>}
    />,
  );
  expect(screen.getByRole('status')).toHaveTextContent('Invoice saved');
  expect(screen.getByRole('link', { name: 'View invoices' })).toHaveAttribute('href', '#invoices');
  fireEvent.click(screen.getByRole('button', { name: 'Close notice' }));
  expect(dismiss).toHaveBeenCalledOnce();
  rerender(
    <Toast open={false} message="Invoice saved" dismissLabel="Close notice" onDismiss={dismiss} />,
  );
  expect(screen.queryByRole('status')).toBeNull();
  expect(container.firstChild).toHaveAttribute('inert');
});
