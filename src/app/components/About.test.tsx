import { render, screen } from '@testing-library/react';
import About from './About';
import { BrowserRouter } from 'react-router-dom';

describe('About', () => {
  test('renders about page title', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/About Conway's Game of Life/i)).toBeInTheDocument();
  });

  test('renders game description', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/What is Conway's Game of Life?/i)).toBeInTheDocument();
    expect(screen.getByText(/cellular automaton/i)).toBeInTheDocument();
  });

  test('renders project information', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/About This Project/i)).toBeInTheDocument();
    expect(screen.getByText(/TypeScript implementation/i)).toBeInTheDocument();
  });

  test('renders GitHub link', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    
    const githubLink = screen.getByText(/View Source Code on GitHub/i);
    expect(githubLink).toBeInTheDocument();
    expect(githubLink.closest('a')).toHaveAttribute('href', 'https://github.com/wintermuted/game-of-life');
  });

  test('renders Wikipedia link', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    
    const wikiLink = screen.getByText(/Conway's Game of Life on Wikipedia/i);
    expect(wikiLink).toBeInTheDocument();
    expect(wikiLink.closest('a')).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life');
  });

  test('renders game rules', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Any live cell with 2-3 live neighbors survives/i)).toBeInTheDocument();
    expect(screen.getByText(/Any dead cell with exactly 3 live neighbors becomes alive/i)).toBeInTheDocument();
  });
});
