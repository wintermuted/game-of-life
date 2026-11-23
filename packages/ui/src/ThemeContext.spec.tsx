import { ReactElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeModeProvider, useThemeMode } from '@game-of-life/ui';

function ThemeConsumer(): ReactElement {
  const { mode, toggleTheme } = useThemeMode();
  return <button onClick={toggleTheme}>{mode}</button>;
}

describe('controlled component theme', () => {
  test('uses host-provided theme state without persisting preferences in the component library', () => {
    const toggleTheme = vi.fn();
    const persist = vi.spyOn(Storage.prototype, 'setItem');
    const { rerender } = render(
      <ThemeModeProvider mode="light" toggleTheme={toggleTheme}>
        <ThemeConsumer />
      </ThemeModeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'light' }));
    expect(toggleTheme).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'light' })).toBeInTheDocument();

    rerender(
      <ThemeModeProvider mode="dark" toggleTheme={toggleTheme}>
        <ThemeConsumer />
      </ThemeModeProvider>,
    );
    expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument();
    expect(persist).not.toHaveBeenCalled();
    persist.mockRestore();
  });
});
