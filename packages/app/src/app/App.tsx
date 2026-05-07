import { Routes, Route, NavLink } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import Home from "./components/Home";
import About from "./components/About";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useThemeMode } from './ThemeContext';
import { useTranslation } from 'react-i18next';
import './styles/App.css';

function App() {
  const { mode, toggleTheme } = useThemeMode();
  const { t } = useTranslation();

  return (
    <div className="app-layout">
      <header className="docs-topbar">
        <div className="docs-topbar-inner">
          <div className="docs-topbar-brand">
            <img src={`${import.meta.env.BASE_URL}gol-mark.svg`} alt="" aria-hidden="true" className="docs-topbar-brand-icon" width="28" height="28" />
            <h1>{t('app.title')}</h1>
          </div>
          <nav className="docs-topbar-nav wm-app-nav-nowrap" aria-label="Primary navigation">
          <NavLink
            to="/"
            className={({ isActive }) => `docs-topbar-link-devdocs${isActive ? ' is-active' : ''}`}
            aria-label={t('nav.home')}
          >
            {t('nav.home')}
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => `docs-topbar-link-devdocs${isActive ? ' is-active' : ''}`}
            aria-label={t('nav.about')}
          >
            {t('nav.about')}
          </NavLink>
        </nav>
        <div className="docs-topbar-actions">
          <LanguageSwitcher />
          <button
            className="docs-topbar-toggle"
            onClick={toggleTheme}
            aria-label={t('nav.toggleDarkMode')}
            title={t('nav.toggleDarkMode')}
          >
            {mode === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            <span>{mode === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <a
            className="docs-topbar-github"
            href="https://github.com/wintermuted/game-of-life"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('nav.viewSource')}
            title={t('nav.viewSource')}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
          </a>
        </div>
        </div>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
