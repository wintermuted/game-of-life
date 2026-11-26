import { act, fireEvent, render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import type { ComponentProps } from 'react';
import { encodeGridToBase64, getGenerationSpeed } from '@game-of-life/util';
import { DEFAULT_RULES, patterns, type LifeGrid } from '@game-of-life/core';
import {
  getSavedBoards,
  upsertSavedBoard,
  getFavoriteBoards,
  getForkOrigins,
} from '@game-of-life/api';
import Home from './Home';

const captures = vi.hoisted(() => ({
  grid: null as ComponentProps<typeof import('@game-of-life/ui-grid').Grid> | null,
  controls: null as ComponentProps<typeof import('@game-of-life/ui-controls').GridControls> | null,
  rules: null as ComponentProps<typeof import('@game-of-life/ui-controls').RulesPanel> | null,
  patternInput: null as ComponentProps<
    typeof import('@game-of-life/ui-patterns').PatternInput
  > | null,
  selector: null as ComponentProps<
    typeof import('@game-of-life/ui-patterns').PatternSelector
  > | null,
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string): string => key }),
}));
vi.mock('@game-of-life/ui-grid', () => ({
  Grid: (props: NonNullable<typeof captures.grid>) => {
    props.game.getStatus();
    captures.grid = props;
    return <div>{props.playOverlayContent}</div>;
  },
}));
vi.mock('@game-of-life/ui-controls', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@game-of-life/ui-controls')>()),
  GridControls: (props: NonNullable<typeof captures.controls>) => {
    captures.controls = props;
    return <button onClick={props.toggleGame}>toggle</button>;
  },
  RulesPanel: (props: NonNullable<typeof captures.rules>) => {
    captures.rules = props;
    return null;
  },
}));
vi.mock('@game-of-life/ui-patterns', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@game-of-life/ui-patterns')>()),
  PatternInput: (props: NonNullable<typeof captures.patternInput>) => {
    captures.patternInput = props;
    return null;
  },
  PatternSelector: (props: NonNullable<typeof captures.selector>) => {
    captures.selector = props;
    return null;
  },
  PatternPreview: () => null,
}));

const oscillator: LifeGrid = { '-1,0': '#ff0000', '0,0': '#ff0000', '1,0': '#ff0000' };
const block: LifeGrid = {
  '0,0': '#ff0000',
  '1,0': '#ff0000',
  '0,1': '#ff0000',
  '1,1': '#ff0000',
};
function mount(grid: LifeGrid = oscillator, query = ''): ReturnType<typeof render> {
  window.history.replaceState({}, '', `/play?pattern=${encodeGridToBase64(grid)}${query}`);
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}
function gridProps(): NonNullable<typeof captures.grid> {
  if (!captures.grid) throw new Error('Grid not mounted');
  return captures.grid;
}
function controls(): NonNullable<typeof captures.controls> {
  if (!captures.controls) throw new Error('Controls not mounted');
  return captures.controls;
}
function advance(generations: number): void {
  for (let index = 0; index < generations; index += 1) {
    act(() => vi.advanceTimersByTime(getGenerationSpeed(controls().generationSpeed)));
  }
}
describe('Home board transitions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    captures.grid = null;
    captures.controls = null;
    captures.rules = null;
    captures.patternInput = null;
    captures.selector = null;
  });
  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  test('pausing shares the running grid but resetting restores the selected pattern', () => {
    mount();
    fireEvent.click(screen.getByText('toggle'));
    advance(1);
    expect(gridProps().game.getStatus()).not.toStrictEqual(oscillator);
    fireEvent.click(screen.getByText('toggle'));
    expect(new URLSearchParams(window.location.search).get('pattern')).toBe(
      encodeGridToBase64(gridProps().game.getStatus()),
    );
    act(() => controls().onResetRequested?.());
    fireEvent.click(screen.getByText('dialogs.yesReset'));
    expect(gridProps().game.getStatus()).toStrictEqual(oscillator);
  });
  test('the two stability effects pause a stable board after ten generations', () => {
    mount(block);
    fireEvent.click(screen.getByText('toggle'));
    advance(9);
    expect(controls().isGameRunning).toBe(true);
    advance(1);
    expect(controls().isGameRunning).toBe(false);
    expect(screen.getByText('messages.stabilityDetectedTitle')).toBeTruthy();
    fireEvent.click(screen.getByText('messages.continuePlaying'));
    advance(12);
    expect(controls().isGameRunning).toBe(true);
    expect(screen.queryByText('messages.stabilityDetectedTitle')).toBeNull();
  });
  test('board IDs resolve saved rules independently of the route content hash', () => {
    const savedRules = {
      ...DEFAULT_RULES,
      survival2: { ...DEFAULT_RULES.survival2, enabled: false },
    };
    upsertSavedBoard(
      encodeGridToBase64(block),
      'Saved board',
      'board-identity',
      undefined,
      undefined,
      undefined,
      undefined,
      savedRules,
      false,
    );
    mount(oscillator, '&board=board-identity');
    expect(gridProps().game.getStatus()).toStrictEqual(oscillator);
    expect(captures.rules?.rulesLocked).toBe(false);
    expect(captures.rules?.rules.survival2.enabled).toBe(false);
    act(() => captures.rules?.onRulesChange(DEFAULT_RULES));
    expect(
      getSavedBoards().find((board) => board.boardId === 'board-identity')?.rules,
    ).toStrictEqual(DEFAULT_RULES);
  });
  test('paint and undo restore an edit snapshot and keyboard actions use the latest mode', () => {
    mount(oscillator, '&mode=edit');
    act(() => controls().onEditToolChange?.('pencil'));
    act(() => gridProps().onPaintStart?.());
    act(() => gridProps().onCellPaint?.('10,10', '#00ff00'));
    expect(gridProps().game.getStatus()['10,10']).toBe('#00ff00');
    act(() => controls().onUndoBoardChange?.());
    expect(gridProps().game.getStatus()).toStrictEqual(oscillator);
    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    expect(controls().isEditMode).toBe(false);
    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    expect(controls().isGameRunning).toBe(true);
  });
  test('cold mounting supplies a real Game and unmount cleans playback and keyboard listeners', () => {
    const first = mount();
    const firstGame = gridProps().game;
    const next = vi.spyOn(firstGame, 'next');
    fireEvent.click(screen.getByText('toggle'));
    advance(1);
    expect(next).toHaveBeenCalledTimes(1);
    first.unmount();
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    act(() => vi.advanceTimersByTime(5000));
    expect(next).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    mount();
    expect(gridProps().game).not.toBe(firstGame);
    expect(gridProps().game.getStatus()).toStrictEqual(oscillator);
  });
  test('reset while running advances the replacement Game rather than the retired instance', () => {
    mount();
    fireEvent.click(screen.getByText('toggle'));
    advance(1);
    const oldGame = gridProps().game;
    act(() => controls().onResetRequested?.());
    fireEvent.click(screen.getByText('dialogs.yesReset'));
    const replacement = gridProps().game;
    expect(replacement).not.toBe(oldGame);
    expect(replacement.getStatus()).toStrictEqual(oscillator);
    const oldGeneration = oldGame.getGenerations();
    advance(1);
    expect(replacement.getGenerations()).toBe(1);
    expect(oldGame.getGenerations()).toBe(oldGeneration);
  });
  test('concurrent Home instances own independent engines and playback intervals', () => {
    const first = mount();
    const firstGame = gridProps().game;
    const firstControls = controls();
    const second = mount(block);
    const secondGame = gridProps().game;
    const secondControls = controls();
    expect(firstGame).not.toBe(secondGame);
    act(() => {
      firstControls.toggleGame();
      secondControls.toggleGame();
    });
    act(() => vi.advanceTimersByTime(getGenerationSpeed(5)));
    expect(firstGame.getGenerations()).toBe(1);
    expect(secondGame.getGenerations()).toBe(1);
    first.unmount();
    act(() => vi.advanceTimersByTime(getGenerationSpeed(5)));
    expect(firstGame.getGenerations()).toBe(1);
    expect(secondGame.getGenerations()).toBe(2);
    second.unmount();
  });
  test('selection fill, undo, rotation and stamping keep colors and snapshot boundaries', () => {
    mount(oscillator, '&mode=edit');
    act(() => controls().onEditToolChange?.('selection'));
    act(() => gridProps().onSelectionStart?.('-1,0'));
    act(() => gridProps().onSelectionChange?.('0,0'));
    act(() => gridProps().onSelectionEnd?.());
    expect(gridProps().selectionCount).toBe(2);
    act(() => controls().onDrawColorChange?.('#00ff00'));
    act(() => controls().onFillSelectionColor?.());
    expect(gridProps().game.getStatus()).toStrictEqual({
      '-1,0': '#00ff00',
      '0,0': '#00ff00',
      '1,0': '#ff0000',
    });
    act(() => controls().onUndoBoardChange?.());
    expect(gridProps().game.getStatus()).toStrictEqual(oscillator);
    act(() => controls().onEditToolChange?.('stamp'));
    act(() => controls().onStampPatternSelect?.({ '0,0': '#ff0000', '1,0': '#ff0000' }));
    act(() => controls().onRotateStamp?.());
    act(() => gridProps().onPaintStart?.());
    act(() => gridProps().onStampPatternAtCoordinate?.('10,10'));
    expect(gridProps().game.getStatus()['10,10']).toBe('#00ff00');
    expect(gridProps().game.getStatus()['10,11']).toBe('#00ff00');
    act(() => controls().onUndoBoardChange?.());
    expect(gridProps().game.getStatus()).toStrictEqual(oscillator);
  });
  test('context insertion and pattern input distinguish replacement from stamp selection', () => {
    mount(oscillator, '&mode=edit');
    act(() => gridProps().onContextCoordinateRequest?.('10,10'));
    act(() => captures.selector?.onSelectPattern(block));
    expect(gridProps().game.getStatus()['10,10']).toBe('#ff0000');
    act(() => controls().onUndoBoardChange?.());
    expect(gridProps().game.getStatus()).toStrictEqual(oscillator);
    fireEvent.click(screen.getByText('Patterns'));
    act(() => controls().onEditToolChange?.('stamp'));
    act(() => captures.patternInput?.onLoadPattern(block));
    expect(gridProps().game.getStatus()).toStrictEqual(oscillator);
    expect(controls().stampPattern).toStrictEqual(block);
    act(() => controls().onEditToolChange?.('pencil'));
    act(() => captures.patternInput?.onLoadPattern(block, 'highlife'));
    expect(gridProps().game.getStatus()).toStrictEqual(block);
    expect(captures.rules?.selectedRulesetId).toBe('highlife');
  });
  test('system catalog identity remains read-only after generations update the route hash', () => {
    const system = patterns[0];
    mount(system.grid, `&catalog=${encodeURIComponent(system.name)}&mode=edit`);
    expect(controls().isSystemPattern).toBe(true);
    expect(controls().isEditMode).toBe(false);
    act(() => controls().onEnterEditMode?.());
    expect(controls().isEditMode).toBe(false);
    const initial = { ...gridProps().game.getStatus() };
    act(() => gridProps().onCellPaint?.('100,100', '#00ff00'));
    expect(gridProps().game.getStatus()).toStrictEqual(initial);
    fireEvent.click(screen.getByText('toggle'));
    advance(1);
    if (controls().isGameRunning) fireEvent.click(screen.getByText('toggle'));
    expect(new URLSearchParams(window.location.search).get('catalog')).toBe(system.name);
    expect(controls().isSystemPattern).toBe(true);
  });
  test('locked saved rules ignore edits until confirmation and persist the unlock', () => {
    upsertSavedBoard(
      encodeGridToBase64(oscillator),
      'Locked',
      'locked-board',
      undefined,
      undefined,
      undefined,
      undefined,
      DEFAULT_RULES,
      true,
    );
    mount(oscillator, '&board=locked-board');
    const modified = {
      ...DEFAULT_RULES,
      survival2: { ...DEFAULT_RULES.survival2, enabled: false },
    };
    act(() => captures.rules?.onRulesChange(modified));
    expect(captures.rules?.rules.survival2.enabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'rules.unlockButton' }));
    expect(captures.rules?.rulesLocked).toBe(true);
    fireEvent.click(screen.getByText('rules.unlockConfirmAction'));
    expect(captures.rules?.rulesLocked).toBe(false);
    act(() => captures.rules?.onRulesChange(modified));
    expect(getSavedBoards().find((board) => board.boardId === 'locked-board')?.rulesLocked).toBe(
      false,
    );
    expect(captures.rules?.rules.survival2.enabled).toBe(false);
  });
  test('saving a draft locks its rules and favorites require confirmation before removal', () => {
    mount(oscillator);
    fireEvent.click(screen.getByRole('button', { name: 'playground.save' }));
    fireEvent.change(screen.getByLabelText('playground.patternName'), {
      target: { value: 'My board' },
    });
    fireEvent.change(screen.getByLabelText('playground.confirmDraftSaveTagsLabel'), {
      target: { value: 'custom, CUSTOM, playground.categoryUncategorized' },
    });
    fireEvent.click(screen.getByText('playground.confirmDraftSaveAction'));
    const saved = getSavedBoards().find((board) => board.title === 'My board');
    expect(saved?.hash).toBe(encodeGridToBase64(oscillator));
    expect(saved?.tags).toStrictEqual(['custom']);
    expect(saved?.rulesLocked).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'explore.favorite' }));
    expect(getFavoriteBoards().some((board) => board.title === 'My board')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'explore.favorited' }));
    expect(getFavoriteBoards().some((board) => board.title === 'My board')).toBe(true);
    fireEvent.click(screen.getByText('playground.removeStarConfirmAction'));
    expect(getFavoriteBoards().some((board) => board.title === 'My board')).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'playground.editTitle' }));
    fireEvent.change(screen.getByLabelText('playground.patternName'), {
      target: { value: 'Renamed' },
    });
    const saveButtons = screen.getAllByText('playground.save');
    fireEvent.click(saveButtons[saveButtons.length - 1]);
    expect(getSavedBoards().find((board) => board.title === 'Renamed')?.boardId).toBe(
      saved?.boardId,
    );
  });
  test('forks have distinct board IDs while preserving their parent and content hash', () => {
    const parent = patterns[0];
    const parentHash = encodeGridToBase64(parent.grid);
    mount(parent.grid, `&catalog=${encodeURIComponent(parent.name)}`);
    fireEvent.click(screen.getAllByRole('button', { name: 'playground.viewForks' })[0]);
    fireEvent.click(screen.getByText('playground.fork'));
    fireEvent.change(screen.getByLabelText('playground.patternName'), {
      target: { value: 'Child' },
    });
    fireEvent.click(screen.getByText('playground.createFork'));
    const child = getSavedBoards().find((board) => board.title === 'Child');
    expect(child?.boardId).toMatch(/^fork-/);
    expect(child?.hash).toBe(parentHash);
    expect(getForkOrigins().find((origin) => origin.hash === child?.boardId)?.parentHash).toBe(
      parentHash,
    );
  });
  test('keyboard ignores interactive targets and repeats, and clamps speed using latest state', () => {
    mount();
    fireEvent.keyDown(screen.getByText('toggle'), { code: 'Space', key: ' ' });
    fireEvent.keyDown(window, { code: 'Space', key: ' ', repeat: true });
    expect(controls().isGameRunning).toBe(false);
    act(() => controls().updateGenerationSpeed(100));
    expect(controls().generationSpeed).toBe(10);
    fireEvent.keyDown(window, { code: 'KeyZ', key: 'z' });
    expect(controls().generationSpeed).toBe(9);
    fireEvent.keyDown(window, { code: 'KeyX', key: 'x' });
    expect(controls().generationSpeed).toBe(10);
  });
  test('maximized and cell-copy timers are cleaned up with the presentation owner', async () => {
    const schedule = vi.spyOn(globalThis, 'setTimeout');
    const cancel = vi.spyOn(globalThis, 'clearTimeout');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const view = mount();
    act(() => gridProps().toggleBoardMaximized?.());
    expect(document.body.classList.contains('gol-board-maximized')).toBe(true);
    await act(async () => {
      fireEvent.click(screen.getByText('Copy'));
    });
    expect(screen.getByText('Copied!')).toBeTruthy();
    view.unmount();
    expect(document.body.classList.contains('gol-board-maximized')).toBe(false);
    const ownedTimers = schedule.mock.calls.flatMap((call, index) =>
      call[1] === 1500 || call[1] === 1600 ? [schedule.mock.results[index].value] : [],
    );
    expect(ownedTimers).toHaveLength(2);
    for (const timer of ownedTimers) expect(cancel).toHaveBeenCalledWith(timer);
  });
});
