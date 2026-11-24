import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ExploreFacetFilter } from './ExploreFacetFilter';
import { buildFacet } from './exploreFacets';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string): string => key }),
}));
afterEach(cleanup);

const identity = (value: string): string => value;
function Harness({
  counts = { all: 3, Alpha: 2, Beta: 1 },
}: {
  counts?: Record<string, number>;
}): React.JSX.Element {
  const [selected, setSelected] = useState(new Set(['Selected zero']));
  const facet = buildFacet(
    ['Alpha', 'Beta', 'Selected zero', 'Disabled zero'],
    counts,
    selected,
    identity,
  );
  return (
    <>
      <ExploreFacetFilter
        label="Category"
        allLabel="All"
        facet={facet}
        selected={selected}
        setSelected={setSelected}
        getLabel={identity}
      />
      <output data-testid="selection">{[...selected].join(',')}</output>
    </>
  );
}

describe('Explore facet option presentation', () => {
  test('shows selected zero-count options as enabled and reveals unselected disabled options with More', () => {
    render(<Harness />);
    const selected = screen.getByRole('checkbox', { name: /Selected zero/ }) as HTMLInputElement;
    expect(selected.checked).toBe(true);
    expect(selected.disabled).toBe(false);
    expect(screen.queryByRole('checkbox', { name: /Disabled zero/ })).toBeNull();
    const alpha = screen.getByRole('checkbox', { name: /Alpha/ }).closest('label');
    expect(alpha?.querySelector('.wm-staged-facet-count')?.textContent).toBe('2');
    fireEvent.click(screen.getByRole('button', { name: 'explore.showMoreFilterOptions' }));
    expect(
      (screen.getByRole('checkbox', { name: /Disabled zero/ }) as HTMLInputElement).disabled,
    ).toBe(true);
    fireEvent.click(selected);
    expect(screen.getByTestId('selection').textContent).toBe('');
    expect(
      (screen.getByRole('checkbox', { name: /Selected zero/ }) as HTMLInputElement).disabled,
    ).toBe(true);
  });

  test('All clears selection only when checked and unchecking All does not select everything', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('checkbox', { name: /All/ }));
    expect(screen.getByTestId('selection').textContent).toBe('');
    expect((screen.getByRole('checkbox', { name: /All/ }) as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', { name: /All/ }));
    expect(screen.getByTestId('selection').textContent).toBe('');
    expect((screen.getByRole('checkbox', { name: /All/ }) as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', { name: /Beta/ }));
    expect(screen.getByTestId('selection').textContent).toBe('Beta');
  });

  test('retains the existing no-available-facets empty state, hiding All and even selected zero options', () => {
    render(<Harness counts={{ all: 0 }} />);
    expect(screen.getByText('explore.noFiltersAvailable')).toBeTruthy();
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByTestId('selection').textContent).toBe('Selected zero');
  });
});
