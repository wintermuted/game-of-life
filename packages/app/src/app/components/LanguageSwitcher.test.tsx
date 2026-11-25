import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from '@game-of-life/ui';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/config';

describe('LanguageSwitcher', () => {
  test('renders language switcher dropdown', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>,
    );
    expect(screen.getByRole('combobox', { name: /change language/i })).toBeInTheDocument();
  });

  test('renders language options', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>,
    );

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
  });

  test('changes language when Spanish is selected', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>,
    );

    const languageSelect = screen.getByRole('combobox', { name: /change language/i });
    fireEvent.change(languageSelect, { target: { value: 'es' } });

    expect(i18n.language).toBe('es');
  });

  test('drop-up retains keyboard focus and announces the selected language after switching', async () => {
    await i18n.changeLanguage('en');
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher dropUp />
      </I18nextProvider>,
    );
    const trigger = screen.getByRole('button', { name: 'Change language: English' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: 'English' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' });
    const spanish = screen.getByRole('option', { name: 'Español' });
    expect(spanish).toHaveFocus();
    fireEvent.click(spanish);
    expect(i18n.language).toBe('es');
    expect(trigger).toHaveAccessibleName('Change language: Español');
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await i18n.changeLanguage('en');
  });
});
