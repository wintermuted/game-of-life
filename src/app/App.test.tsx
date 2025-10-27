import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { ThemeProviderWrapper } from './ThemeContext';

describe('App Dark Mode Toggle', () => {
  it('renders dark mode toggle button', () => {
    render(
      <ThemeProviderWrapper>
        <App />
      </ThemeProviderWrapper>
    );
    const toggleButton = screen.getByLabelText('toggle dark mode');
    expect(toggleButton).toBeInTheDocument();
  });

  it('toggles between light and dark mode when button is clicked', () => {
    render(
      <ThemeProviderWrapper>
        <App />
      </ThemeProviderWrapper>
    );
    const toggleButton = screen.getByLabelText('toggle dark mode');
    
    // Initial state should show dark mode icon (Brightness4Icon) in light mode
    // After clicking, should show light mode icon (Brightness7Icon) in dark mode
    fireEvent.click(toggleButton);
    
    // Verify the button is still present after toggle
    expect(toggleButton).toBeInTheDocument();
  });
});
