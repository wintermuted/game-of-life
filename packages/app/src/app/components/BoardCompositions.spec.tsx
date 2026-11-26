import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import {
  BoardHeader,
  CellDataInspector,
  SimulationSettingsPanel,
  type BoardHeaderProps,
} from '@game-of-life/ui-controls';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string): string => key }),
}));
afterEach(cleanup);

function headerProps(): BoardHeaderProps {
  return {
    title: 'My board',
    stars: 2,
    forks: 1,
    starred: false,
    isEditMode: false,
    isSystemPattern: false,
    isUnsavedDraftBoard: false,
    isUnsavedEditableBoard: false,
    canSave: true,
    onRename: vi.fn(),
    onSave: vi.fn(),
    onSaveDraft: vi.fn(),
    onToggleStar: vi.fn(),
    onViewForks: vi.fn(),
  };
}

describe('Board compositions', () => {
  test('forwards save-as and star actions and closes the native save menu', () => {
    const props = headerProps();
    const { container, rerender } = render(<BoardHeader {...props} />);
    const menu = container.querySelector('details')!;
    menu.open = true;
    fireEvent.click(screen.getByRole('menuitem', { name: 'playground.saveAs' }));
    expect(props.onRename).toHaveBeenCalledOnce();
    expect(menu.open).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'explore.favorite' }));
    expect(props.onToggleStar).toHaveBeenCalledOnce();
    rerender(<BoardHeader {...props} canSave={false} />);
    expect(screen.getByRole('button', { name: 'playground.save' })).toBeDisabled();
    menu.open = true;
    expect(screen.getByRole('menuitem', { name: 'playground.save' })).toBeDisabled();
    expect(screen.getByRole('menuitem', { name: 'playground.saveAs' })).toBeEnabled();
  });

  test('keeps system patterns read-only and drafts on their own save path', () => {
    const props = headerProps();
    const { rerender } = render(<BoardHeader {...props} isSystemPattern />);
    expect(screen.queryByRole('button', { name: 'playground.editTitle' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'playground.save' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'playground.viewForks' }));
    expect(props.onViewForks).toHaveBeenCalledOnce();
    rerender(<BoardHeader {...props} isUnsavedDraftBoard isUnsavedEditableBoard />);
    expect(screen.queryByRole('button', { name: 'explore.favorite' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'playground.save' }));
    expect(props.onSaveDraft).toHaveBeenCalledOnce();
    expect(props.onSave).not.toHaveBeenCalled();
  });

  test('preserves JSON formatting, coordinate actions, and host-owned copy feedback', () => {
    const onCopy = vi.fn();
    const onCoordinateSelect = vi.fn();
    const props = {
      entries: [
        ['-2,3', '#abcdef'],
        ['0,0', '#123456'],
      ] as const,
      onCopy,
      onCoordinateSelect,
    };
    const { container, rerender } = render(<CellDataInspector {...props} copied={false} />);
    expect(container.querySelector('code')?.textContent).toBe(
      '{\n  "-2,3": "#abcdef",\n  "0,0": "#123456"\n}',
    );
    fireEvent.click(screen.getByRole('button', { name: '"-2,3"' }));
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(onCoordinateSelect).toHaveBeenCalledWith('-2,3');
    expect(onCopy).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Copied!' })).not.toBeInTheDocument();
    rerender(<CellDataInspector {...props} entries={[]} copied />);
    expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument();
    expect(container.querySelector('code')?.textContent).toBe('{\n}');
  });

  test('forwards independent settings and help events to the host', () => {
    const onStabilityOverlayChange = vi.fn();
    const onBirthDeathPreviewChange = vi.fn();
    const onShowHelp = vi.fn();
    const onHideHelp = vi.fn();
    render(
      <SimulationSettingsPanel
        stabilityOverlayEnabled={false}
        birthDeathPreviewEnabled
        onStabilityOverlayChange={onStabilityOverlayChange}
        onBirthDeathPreviewChange={onBirthDeathPreviewChange}
        onShowHelp={onShowHelp}
        onHideHelp={onHideHelp}
      />,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'diagnostics.stabilityOverlayEnabled' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'diagnostics.birthDeathPreviewEnabled' }));
    expect(onStabilityOverlayChange).toHaveBeenCalledWith(true);
    expect(onBirthDeathPreviewChange).toHaveBeenCalledWith(false);
    const help = screen.getByRole('img', { name: 'diagnostics.stabilityOverlayDescription' });
    fireEvent.mouseEnter(help);
    fireEvent.mouseLeave(help);
    expect(onShowHelp).toHaveBeenCalledWith(
      expect.objectContaining({ target: help }),
      'diagnostics.stabilityOverlayDescription',
    );
    expect(onHideHelp).toHaveBeenCalledOnce();
  });
});
