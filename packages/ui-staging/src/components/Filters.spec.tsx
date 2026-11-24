import { useState, type ReactElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { FacetFilter, SortableTableHeader } from '@game-of-life/ui-staging';

afterEach(cleanup);

function Filters(): ReactElement {
  const [selected, setSelected] = useState(['all']);
  return (
    <FacetFilter
      label="Departments"
      selected={selected}
      onChange={setSelected}
      available
      emptyLabel="None"
      moreLabel="More"
      fewerLabel="Fewer"
      reset={{
        label: 'Any department',
        count: 4,
        selected: selected.length === 0,
        onSelect: () => setSelected([]),
      }}
      options={[
        {
          value: 'all',
          label: 'All Services',
          count: 0,
          disabled: !selected.includes('all'),
          hidden: !selected.includes('all'),
        },
        { value: 'support', label: 'Support', count: 4 },
        { value: 'closed', label: 'Closed', count: 0, disabled: true, hidden: true },
      ]}
    />
  );
}

test('facet reset is independent of values named all, and selected zero-count options remain removable', () => {
  render(<Filters />);
  expect(screen.getByRole('checkbox', { name: /All Services/ })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: /All Services/ })).not.toBeDisabled();
  expect(screen.queryByRole('checkbox', { name: /Closed/ })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'More' }));
  expect(screen.getByRole('checkbox', { name: /Closed/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('checkbox', { name: /All Services/ }));
  expect(screen.getByRole('checkbox', { name: /Any department/ })).toBeChecked();
  fireEvent.click(screen.getByRole('checkbox', { name: /Any department/ }));
  expect(screen.getByRole('checkbox', { name: /Any department/ })).toBeChecked();
  fireEvent.click(screen.getByRole('checkbox', { name: /Support/ }));
  expect(screen.getByRole('checkbox', { name: /Support/ })).toBeChecked();
});

test('unavailable facet suppresses all options and expansion actions', () => {
  render(
    <FacetFilter
      label="Teams"
      options={[{ value: 'legacy', label: 'Legacy', count: 0 }]}
      selected={['legacy']}
      onChange={vi.fn()}
      available={false}
      emptyLabel="No matching teams"
      moreLabel="More"
      fewerLabel="Fewer"
      reset={{ label: 'Any', count: 0, selected: false, onSelect: vi.fn() }}
    />,
  );
  expect(screen.getByText('No matching teams')).toBeInTheDocument();
  expect(screen.queryByRole('checkbox')).toBeNull();
});

test('sortable headers own aria-sort and keep label and direction actions separate', () => {
  const sort = vi.fn();
  const direction = vi.fn();
  render(
    <table>
      <thead>
        <tr>
          <SortableTableHeader
            column="amount"
            label="Amount"
            active
            direction="asc"
            onSort={sort}
            onDirection={direction}
            directionLabel="Reverse amount"
            directionIcon="↑"
          />
          <SortableTableHeader
            column="vendor"
            label="Vendor"
            active={false}
            direction="asc"
            onSort={sort}
            onDirection={direction}
            directionLabel="Reverse vendor"
            directionIcon="↕"
          />
        </tr>
      </thead>
    </table>,
  );
  expect(screen.getByRole('columnheader', { name: /Amount/ })).toHaveAttribute(
    'aria-sort',
    'ascending',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Vendor' }));
  fireEvent.click(screen.getByRole('button', { name: 'Reverse vendor' }));
  expect(sort).toHaveBeenCalledWith('vendor');
  expect(direction).toHaveBeenCalledWith('vendor');
  expect(screen.getAllByRole('columnheader')).toHaveLength(2);
});
