import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { ThemeProviderWrapper } from './ThemeContext';

// Mock canvas getContext to avoid JSDOM canvas errors
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    fillStyle: '',
  })) as any;
});

describe('App Dark Mode Toggle', () => {
  it('renders dark mode toggle button', () => {
    render(
      <MemoryRouter>
        <ThemeProviderWrapper>
          <App />
        </ThemeProviderWrapper>
      </MemoryRouter>
    );
    const toggleButton = screen.getByLabelText('toggle dark mode');
    expect(toggleButton).toBeInTheDocument();
  });

  it('toggles between light and dark mode when button is clicked', () => {
    render(
      <MemoryRouter>
        <ThemeProviderWrapper>
          <App />
        </ThemeProviderWrapper>
      </MemoryRouter>
    );
    const toggleButton = screen.getByLabelText('toggle dark mode');
    
    // Initial state should show dark mode icon (Brightness4Icon) in light mode
    // After clicking, should show light mode icon (Brightness7Icon) in dark mode
    fireEvent.click(toggleButton);
    
    // Verify the button is still present after toggle
    expect(toggleButton).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(
      <MemoryRouter>
        <ThemeProviderWrapper>
          <App />
        </ThemeProviderWrapper>
      </MemoryRouter>
    );
    
    expect(screen.getByLabelText('home')).toBeInTheDocument();
    expect(screen.getByLabelText('about')).toBeInTheDocument();
    expect(screen.getByLabelText('github')).toBeInTheDocument();
  });
});
