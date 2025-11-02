import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from './LanguageSwitcher';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/config';

describe('LanguageSwitcher', () => {
  test('renders language switcher button', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );
    
    const button = screen.getByRole('button', { name: /change language/i });
    expect(button).toBeInTheDocument();
  });

  test('opens language menu when clicked', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );
    
    const button = screen.getByRole('button', { name: /change language/i });
    fireEvent.click(button);
    
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
  });

  test('changes language when menu item is clicked', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );
    
    // Open menu
    const button = screen.getByRole('button', { name: /change language/i });
    fireEvent.click(button);
    
    // Click Spanish
    const spanishOption = screen.getByText('Español');
    fireEvent.click(spanishOption);
    
    // Language should be changed
    expect(i18n.language).toBe('es');
  });
});
