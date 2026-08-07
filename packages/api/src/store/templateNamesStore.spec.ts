import { describe, test, expect, beforeEach } from 'vitest';
import { TemplateNamesStore } from '../store/templateNamesStore';

describe('TemplateNamesStore', () => {
  let store: TemplateNamesStore;

  beforeEach(() => {
    store = new TemplateNamesStore();
  });

  test('returns null for unknown user', () => {
    expect(store.get('user1')).toBeNull();
  });

  test('getOrCreate initialises empty names', () => {
    const result = store.getOrCreate('user1');
    expect(result.userId).toBe('user1');
    expect(result.names).toStrictEqual({});
  });

  test('update last-write-wins: rejects stale client update', () => {
    store.getOrCreate('user1');
    const updated = store.update('user1', {
      names: { hash1: 'My Name' },
      clientUpdatedAt: 0,
    });
    expect(updated.names).toStrictEqual({});
  });

  test('update last-write-wins: accepts newer client update', () => {
    store.getOrCreate('user1');
    const updated = store.update('user1', {
      names: { hash1: 'Pattern A', hash2: 'Pattern B' },
      clientUpdatedAt: Date.now() + 10000,
    });
    expect(updated.names).toStrictEqual({ hash1: 'Pattern A', hash2: 'Pattern B' });
  });

  test('update replaces entire names map', () => {
    store.getOrCreate('user1');
    store.update('user1', { names: { h1: 'First' }, clientUpdatedAt: Date.now() + 1000 });
    const updated = store.update('user1', { names: { h2: 'Second' }, clientUpdatedAt: Date.now() + 2000 });
    expect(updated.names).toStrictEqual({ h2: 'Second' });
  });
});
