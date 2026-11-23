import { beforeEach, describe, expect, test, vi } from 'vitest';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import reportWebVitals from './reportWebVitals';

vi.mock('web-vitals', () => ({
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onINP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
}));

describe('reportWebVitals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('does not register metric observers without a callback', async () => {
    reportWebVitals();
    await Promise.resolve();

    for (const observe of [onCLS, onFCP, onINP, onLCP, onTTFB]) {
      expect(observe).not.toHaveBeenCalled();
    }
  });

  test('registers current metrics including INP with the supplied callback', async () => {
    const report = vi.fn();
    reportWebVitals(report);

    await vi.waitFor(() => {
      for (const observe of [onCLS, onFCP, onINP, onLCP, onTTFB]) {
        expect(observe).toHaveBeenCalledExactlyOnceWith(report);
      }
    });
  });
});
