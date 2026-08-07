import { describe, test, expect, beforeEach } from 'vitest';
import { RecentBoardStore } from '../store/recentBoardStore';

describe('RecentBoardStore', () => {
  let store: RecentBoardStore;

  beforeEach(() => {
    store = new RecentBoardStore();
  });

  test('returns empty list for unknown user', () => {
    expect(store.list('user1')).toStrictEqual([]);
  });

  test('tracks a recent board', () => {
    const recent = store.track('user1', {
      boardId: 'b1',
      hash: 'h1',
      title: 'Board',
      openedAt: Date.now(),
    });
    expect(recent.boardId).toBe('b1');
    expect(recent.userId).toBe('user1');
  });

  test('merge: keeps max openedAt per boardId', () => {
    const t1 = Date.now();
    const t2 = t1 + 5000;
    store.track('user1', { boardId: 'b1', hash: 'h1', title: 'Board', openedAt: t1 });
    const updated = store.track('user1', { boardId: 'b1', hash: 'h1', title: 'Board', openedAt: t2 });
    expect(new Date(updated.openedAt).getTime()).toBe(t2);
    expect(store.list('user1')).toHaveLength(1);
  });

  test('merge: rejects older openedAt for same boardId', () => {
    const t1 = Date.now();
    const t0 = t1 - 5000;
    store.track('user1', { boardId: 'b1', hash: 'h1', title: 'Board', openedAt: t1 });
    const result = store.track('user1', { boardId: 'b1', hash: 'h1', title: 'Old', openedAt: t0 });
    expect(result.title).toBe('Board');
    expect(store.list('user1')).toHaveLength(1);
  });

  test('trims to MAX_RECENT_BOARDS (12)', () => {
    const now = Date.now();
    for (let i = 0; i < 14; i++) {
      store.track('user1', {
        boardId: `b${i}`,
        hash: `h${i}`,
        title: `Board ${i}`,
        openedAt: now + i * 1000,
      });
    }
    expect(store.list('user1')).toHaveLength(12);
  });

  test('list returns boards sorted by openedAt descending', () => {
    const t1 = Date.now();
    const t2 = t1 + 5000;
    store.track('user1', { boardId: 'b1', hash: 'h1', title: 'First', openedAt: t1 });
    store.track('user1', { boardId: 'b2', hash: 'h2', title: 'Second', openedAt: t2 });
    const list = store.list('user1');
    expect(list[0].title).toBe('Second');
    expect(list[1].title).toBe('First');
  });
});
