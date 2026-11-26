import { useState, type ComponentProps, type ReactElement } from 'react';
import { vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { patterns } from '@game-of-life/core';
import { GridControls } from '@game-of-life/ui-controls';

type ControlsProps = ComponentProps<typeof GridControls>;

function createProps(): ControlsProps {
  return {
    variant: 'play',
    nextGeneration: vi.fn(),
    updateGenerationSpeed: vi.fn(),
    generationSpeed: 3,
    onResetRequested: vi.fn(),
    toggleGame: vi.fn(),
    isGameRunning: false,
    copyCurrentURL: vi.fn(),
    selectedPaletteId: 'classic',
    selectedDrawColor: '#22c55e',
    onPaletteChange: vi.fn(),
    onDrawColorChange: vi.fn(),
    onEnterEditMode: vi.fn(),
    onEnterPlayMode: vi.fn(),
    onEditToolChange: vi.fn(),
    onFillSelectionColor: vi.fn(),
    onUndoBoardChange: vi.fn(),
    onCustomColorCommitted: vi.fn(),
    onStampPatternSelect: vi.fn(),
    onRotateStamp: vi.fn(),
  };
}

function ControlledColors({ props }: { props: ControlsProps }): ReactElement {
  const [color, setColor] = useState(props.selectedDrawColor);
  return <GridControls {...props} selectedDrawColor={color} onDrawColorChange={setColor} />;
}

function openColors(container: HTMLElement): HTMLDetailsElement {
  const menu = container.querySelector<HTMLDetailsElement>('.wm-color-picker');
  if (!menu) throw new Error('Color picker missing');
  menu.open = true;
  return menu;
}

describe('GridControls structural regressions', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('retains play-mode color trigger styling without applying toolbar classes to the sidebar', () => {
    const props = createProps();
    const { container, rerender } = render(<GridControls {...props} isEditMode />);
    const trigger = container.querySelector('.wm-color-picker summary');
    expect(trigger).toHaveClass(
      'btn-secondary-neutral',
      'grid-controls-edit-tool-button',
      'grid-controls-edit-tool-button-right',
    );
    rerender(<GridControls {...props} variant="edit" />);
    expect(container.querySelector('.wm-color-picker summary')).not.toHaveClass(
      'grid-controls-edit-tool-button',
    );
  });

  it('preserves slot selection and hex drafts across play, hidden and sidebar placements', () => {
    const props = createProps();
    const { container, rerender } = render(
      <ControlledColors props={{ ...props, isEditMode: true }} />,
    );
    openColors(container);
    fireEvent.click(screen.getByRole('button', { name: 'Custom colors 3 #000000' }));
    const native = screen.getByLabelText('Custom color');
    const firstId = native.id;
    expect(firstId).not.toBe('');
    fireEvent.change(native, { target: { value: '#123456' } });
    fireEvent.change(screen.getByLabelText('Custom color hex'), { target: { value: 'draft' } });
    rerender(<ControlledColors props={{ ...props, isEditMode: false }} />);
    expect(container.querySelector('.wm-color-picker')).toBeNull();
    rerender(<ControlledColors props={{ ...props, variant: 'edit', isEditMode: false }} />);
    openColors(container);
    expect(screen.getByLabelText('Custom color').id).not.toBe(firstId);
    expect(screen.getByLabelText('Custom color hex')).toHaveValue('draft');
    expect(screen.getByRole('button', { name: 'Custom colors 3 #123456' })).toBeInTheDocument();
  });

  it('keeps separate color input labels for multiple catalog instances', () => {
    const props = { ...createProps(), variant: 'edit' as const };
    render(
      <>
        <GridControls {...props} />
        <GridControls {...props} />
      </>,
    );
    const inputs = screen.getAllByLabelText('Custom color');
    expect(new Set(inputs.map((input) => input.id)).size).toBe(2);
  });

  it('retains stamp search and category when leaving and returning to edit mode', () => {
    const props = createProps();
    const { container, rerender } = render(<GridControls {...props} isEditMode />);
    const categoryMenu = container.querySelector<HTMLDetailsElement>(
      '.grid-controls-stamp-category-filter',
    )!;
    categoryMenu.open = true;
    fireEvent.click(within(categoryMenu).getByRole('menuitem', { name: patterns[0].category }));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'glider' } });
    rerender(<GridControls {...props} />);
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    rerender(<GridControls {...props} isEditMode />);
    expect(screen.getByRole('searchbox')).toHaveValue('glider');
    expect(container.querySelector('.grid-controls-stamp-category-filter summary')).toHaveClass(
      'is-active',
    );
  });

  it.each(['play', 'edit'] as const)(
    'keeps valid blur separate from Enter commits and rejects invalid hex in %s',
    (variant) => {
      const props = { ...createProps(), variant, isEditMode: true };
      const { container } = render(<GridControls {...props} />);
      const menu = openColors(container);
      const hex = screen.getByLabelText('Custom color hex');
      fireEvent.change(hex, { target: { value: 'invalid' } });
      fireEvent.keyDown(hex, { key: 'Enter' });
      expect(props.onDrawColorChange).not.toHaveBeenCalled();
      expect(props.onCustomColorCommitted).not.toHaveBeenCalled();
      expect(menu.open).toBe(true);
      fireEvent.change(hex, { target: { value: ' AABBCC ' } });
      fireEvent.blur(hex);
      expect(props.onDrawColorChange).toHaveBeenLastCalledWith('#aabbcc');
      expect(props.onCustomColorCommitted).not.toHaveBeenCalled();
      expect(menu.open).toBe(true);
      fireEvent.keyDown(hex, { key: 'Enter' });
      expect(props.onCustomColorCommitted).toHaveBeenCalledWith('#aabbcc');
      expect(menu.open).toBe(false);
    },
  );

  it('maps system palettes, closes selections, and disables every color input while running', () => {
    const props = { ...createProps(), variant: 'edit' as const };
    const { container, rerender } = render(<GridControls {...props} />);
    const menu = openColors(container);
    fireEvent.click(screen.getByRole('button', { name: 'System colors #3b82f6' }));
    expect(props.onPaletteChange).toHaveBeenCalledWith('ocean');
    expect(props.onDrawColorChange).toHaveBeenCalledWith('#3b82f6');
    expect(menu.open).toBe(false);
    rerender(<GridControls {...props} isGameRunning />);
    openColors(container);
    within(menu)
      .getAllByRole('button')
      .forEach((button) => expect(button).toBeDisabled());
    expect(screen.getByLabelText('Custom color')).toBeDisabled();
    expect(screen.getByLabelText('Custom color hex')).toBeDisabled();
  });

  it('retains speed endpoints, selection transition order, edit tools and undo availability', () => {
    const props = createProps();
    const calls: string[] = [];
    props.onEnterEditMode = vi.fn(() => calls.push('edit'));
    props.onEditToolChange = vi.fn((tool) => calls.push(tool));
    const { rerender } = render(<GridControls {...props} generationSpeed={1} />);
    expect(screen.getByRole('button', { name: 'Decrease generation speed' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Select cells' }));
    expect(calls).toStrictEqual(['edit', 'selection']);
    rerender(<GridControls {...props} generationSpeed={10} isSystemPattern />);
    expect(screen.getByRole('button', { name: 'Increase generation speed' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Select cells' })).toBeDisabled();
    rerender(<GridControls {...props} isEditMode />);
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument();
    for (const [label, tool] of [
      ['Grab pan', 'grab'],
      ['Select cells', 'selection'],
      ['Pencil', 'pencil'],
      ['Eraser', 'eraser'],
    ]) {
      fireEvent.click(screen.getByRole('button', { name: label }));
      expect(props.onEditToolChange).toHaveBeenLastCalledWith(tool);
    }
    fireEvent.click(screen.getByRole('button', { name: 'Fill selected cells' }));
    expect(props.onFillSelectionColor).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    rerender(<GridControls {...props} isEditMode canUndoBoardChange />);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(props.onUndoBoardChange).toHaveBeenCalledOnce();
  });

  it('filters stamps, excludes active grids, resets search but retains category on selection', () => {
    const props = { ...createProps(), isEditMode: true, stampPattern: patterns[0].grid };
    const { container } = render(<GridControls {...props} />);
    const menu = container.querySelector<HTMLDetailsElement>('.grid-controls-stamp-menu')!;
    const list = container.querySelector<HTMLElement>('.grid-controls-stamp-menu-list')!;
    menu.open = true;
    fireEvent(menu, new Event('toggle'));
    expect(list.querySelectorAll('button')).toHaveLength(patterns.length - 1);
    expect(container.querySelector('.grid-controls-stamp-menu-current')).toBeInTheDocument();
    const target = patterns.find((pattern) => pattern.category !== patterns[0].category)!;
    const categoryMenu = container.querySelector<HTMLDetailsElement>(
      '.grid-controls-stamp-category-filter',
    )!;
    categoryMenu.open = true;
    fireEvent.click(within(categoryMenu).getByRole('menuitem', { name: target.category }));
    expect(categoryMenu.open).toBe(false);
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: target.name.toUpperCase() },
    });
    expect(list.querySelector('mark')).toBeInTheDocument();
    fireEvent.click(within(list).getAllByRole('menuitem')[0]);
    expect(props.onStampPatternSelect).toHaveBeenCalledWith(target.grid);
    expect(props.onEditToolChange).toHaveBeenLastCalledWith('stamp');
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(menu.open).toBe(false);
    expect(categoryMenu.querySelector('summary')).toHaveClass('is-active');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'not-a-real-pattern' } });
    expect(list.querySelectorAll('button')).toHaveLength(0);
    expect(list.querySelector('.grid-controls-stamp-search-empty')).toBeInTheDocument();
  });

  it('preserves stamp filters and rotation feedback across conditional edit controls', () => {
    vi.useFakeTimers();
    const props = {
      ...createProps(),
      isEditMode: true,
      stampPattern: patterns[0].grid,
      stampPreviewPattern: patterns[0].grid,
      stampPatternName: 'selected preview',
      stampRotation: 90 as const,
    };
    const { container, rerender } = render(<GridControls {...props} />);
    const categoryMenu = container.querySelector<HTMLDetailsElement>(
      '.grid-controls-stamp-category-filter',
    )!;
    categoryMenu.open = true;
    fireEvent.click(within(categoryMenu).getByRole('menuitem', { name: patterns[0].category }));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'still' } });
    rerender(<GridControls {...props} isEditMode={false} rotateStampKeyPressToken={1} />);
    expect(container.querySelector('.grid-controls-stamp-menu')).toBeNull();
    rerender(<GridControls {...props} rotateStampKeyPressToken={1} />);
    expect(screen.getByRole('searchbox')).toHaveValue('still');
    expect(container.querySelector('.grid-controls-stamp-category-filter-trigger')).toHaveClass(
      'is-active',
    );
    expect(container.querySelector('.grid-controls-stamp-preview-popover-title')).toHaveTextContent(
      'selected preview',
    );
    expect(
      container.querySelector('.grid-controls-stamp-preview-popover-rotation'),
    ).toHaveTextContent('90 deg');
    expect(container.querySelector('.grid-controls-stamp-selected-preview canvas')).toHaveAttribute(
      'width',
      '22',
    );
    const rotate = screen.getByRole('button', { name: 'Rotate stamp' });
    expect(rotate).toHaveClass('is-key-pressed');
    act(() => vi.advanceTimersByTime(100));
    rerender(<GridControls {...props} rotateStampKeyPressToken={2} />);
    act(() => vi.advanceTimersByTime(100));
    expect(rotate).toHaveClass('is-key-pressed');
    act(() => vi.advanceTimersByTime(40));
    expect(rotate).not.toHaveClass('is-key-pressed');
  });

  it('removes open-menu listeners and cancels scheduled measurements when unmounted', () => {
    vi.useFakeTimers();
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame');
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame');
    const addListener = vi.spyOn(window, 'addEventListener');
    const removeListener = vi.spyOn(window, 'removeEventListener');
    const { container, unmount } = render(
      <GridControls {...createProps()} isEditMode rotateStampKeyPressToken={1} />,
    );
    const menu = container.querySelector<HTMLDetailsElement>('.grid-controls-stamp-menu')!;
    menu.open = true;
    fireEvent(menu, new Event('toggle'));
    const resizeHandler = addListener.mock.calls.find(([type]) => type === 'resize')?.[1];
    const frames = requestFrame.mock.results.map((result) => result.value as number);
    unmount();
    expect(removeListener).toHaveBeenCalledWith('resize', resizeHandler);
    for (const frame of frames) expect(cancelFrame).toHaveBeenCalledWith(frame);
    act(() => vi.runOnlyPendingTimers());
  });

  it('measures the stamp menu against the board, resets on close and cleans resize/key feedback', () => {
    vi.useFakeTimers();
    const addListener = vi.spyOn(window, 'addEventListener');
    const removeListener = vi.spyOn(window, 'removeEventListener');
    const props = { ...createProps(), isEditMode: true };
    const { container, rerender, unmount } = render(
      <div className="grid-stage">
        <GridControls {...props} />
      </div>,
    );
    const board = container.querySelector<HTMLElement>('.grid-stage')!;
    const panel = container.querySelector<HTMLElement>('.grid-controls-stamp-menu-panel')!;
    const menu = container.querySelector<HTMLDetailsElement>('.grid-controls-stamp-menu')!;
    vi.spyOn(board, 'getBoundingClientRect').mockReturnValue({
      ...new DOMRect(),
      bottom: 600,
    });
    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({
      ...new DOMRect(),
      top: 100,
    });
    menu.open = true;
    fireEvent(menu, new Event('toggle'));
    act(() => vi.advanceTimersByTime(20));
    expect(panel).toHaveStyle({ maxHeight: '490px' });
    vi.mocked(board.getBoundingClientRect).mockReturnValue({ ...new DOMRect(), bottom: 400 });
    fireEvent.resize(window);
    expect(panel).toHaveStyle({ maxHeight: '290px' });
    menu.open = false;
    fireEvent(menu, new Event('toggle'));
    expect(panel.style.maxHeight).toBe('');
    const resizeHandler = addListener.mock.calls.find(([type]) => type === 'resize')?.[1];
    expect(removeListener).toHaveBeenCalledWith('resize', resizeHandler);
    rerender(
      <div className="grid-stage">
        <GridControls {...props} rotateStampKeyPressToken={1} />
      </div>,
    );
    const rotate = screen.getByRole('button', { name: 'Rotate stamp' });
    expect(rotate).toHaveClass('is-key-pressed');
    fireEvent.click(rotate);
    expect(props.onRotateStamp).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(140));
    expect(rotate).not.toHaveClass('is-key-pressed');
    rerender(
      <div className="grid-stage">
        <GridControls {...props} rotateStampKeyPressToken={2} />
      </div>,
    );
    unmount();
    act(() => vi.runOnlyPendingTimers());
  });
});
