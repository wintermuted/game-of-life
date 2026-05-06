import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from './LanguageSwitcher';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/config';

describe('LanguageSwitcher', () => {
  test('renders language switcher dropdown', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );
    expect(screen.getByRole('combobox', { name: /change language/i })).toBeInTheDocument();
  });

  test('renders language options', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
  });

  test('changes language when Spanish is selected', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    const languageSelect = screen.getByRole('combobox', { name: /change language/i });
    fireEvent.change(languageSelect, { target: { value: 'es' } });

    expect(i18n.language).toBe('es');
  });
});
