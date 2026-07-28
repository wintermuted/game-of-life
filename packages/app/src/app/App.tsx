import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, CircleUserRound, ChevronDown } from 'lucide-react';
import Home from "./components/Home";
import About from "./components/About";
import Landing from "./components/Landing";
import Explore from "./components/Explore";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import SignOut from "./components/SignOut";
import PlayStart from "./components/PlayStart";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useThemeMode } from './ThemeContext';
import { useTranslation } from 'react-i18next';
import './styles/App.css';

type PlayMode = 'edit' | 'play';
type ShortcutContext = 'play-edit' | 'play-run';

interface ShortcutDefinition {
  keyCombo: string;
  description: string;
  controlLabel?: string;
  contexts: ShortcutContext[];
}

function getPlayModeFromSearch(search: string): PlayMode {
  const params = new URLSearchParams(search);
  return params.get('mode') === 'edit' ? 'edit' : 'play';
}

function App() {
  const { mode, toggleTheme } = useThemeMode();
  const { t } = useTranslation();
  const location = useLocation();
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>(() => getPlayModeFromSearch(window.location.search));

  useEffect(() => {
    if (location.pathname !== '/play') return;
    setPlayMode(getPlayModeFromSearch(location.search));
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleModeChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ mode?: PlayMode }>).detail;
      if (detail?.mode === 'edit' || detail?.mode === 'play') {
        setPlayMode(detail.mode);
      }
    };

    window.addEventListener('gol-play-mode-changed', handleModeChanged as EventListener);
    return () => {
      window.removeEventListener('gol-play-mode-changed', handleModeChanged as EventListener);
    };
  }, []);

  const shortcutDefinitions = useMemo<ShortcutDefinition[]>(() => [
    {
      keyCombo: 'W / A / S / D',
      description: t('footer.shortcuts.actions.panBoard'),
      controlLabel: t('footer.shortcuts.controls.panControls'),
      contexts: ['play-edit', 'play-run'],
    },
    {
      keyCombo: 'Q / E',
      description: t('footer.shortcuts.actions.zoomBoard'),
      controlLabel: t('footer.shortcuts.controls.zoomControls'),
      contexts: ['play-edit', 'play-run'],
    },
    {
      keyCombo: 'R',
      description: t('footer.shortcuts.actions.centerView'),
      controlLabel: t('footer.shortcuts.controls.centerView'),
      contexts: ['play-edit', 'play-run'],
    },
    {
      keyCombo: 'Space',
      description: t('footer.shortcuts.actions.toggleSimulation'),
      controlLabel: t('footer.shortcuts.controls.startPause'),
      contexts: ['play-run'],
    },
    {
      keyCombo: 'X / Shift+= / Numpad +',
      description: t('footer.shortcuts.actions.increaseSpeed'),
      controlLabel: t('footer.shortcuts.controls.increaseSpeed'),
      contexts: ['play-run'],
    },
    {
      keyCombo: 'Z / - / Numpad -',
      description: t('footer.shortcuts.actions.decreaseSpeed'),
      controlLabel: t('footer.shortcuts.controls.decreaseSpeed'),
      contexts: ['play-run'],
    },
  ], [t]);

  const activeShortcutContext: ShortcutContext | null = location.pathname === '/play'
    ? (playMode === 'edit' ? 'play-edit' : 'play-run')
    : null;

  const availableNow = activeShortcutContext
    ? shortcutDefinitions.filter((entry) => entry.contexts.includes(activeShortcutContext))
    : [];
  const playEditShortcuts = shortcutDefinitions.filter((entry) => entry.contexts.includes('play-edit'));
  const playRunShortcuts = shortcutDefinitions.filter((entry) => entry.contexts.includes('play-run'));

  const currentContextLabel = location.pathname === '/play'
    ? playMode === 'edit'
      ? t('footer.shortcuts.contextPlayEdit')
      : t('footer.shortcuts.contextPlayRun')
    : location.pathname === '/play/select'
      ? t('footer.shortcuts.contextPlaySelect')
      : location.pathname === '/explore'
        ? t('footer.shortcuts.contextExplore')
        : location.pathname === '/about'
          ? t('footer.shortcuts.contextAbout')
          : location.pathname === '/profile'
            ? t('footer.shortcuts.contextProfile')
            : location.pathname === '/settings'
              ? t('footer.shortcuts.contextSettings')
              : t('footer.shortcuts.contextLanding');

  function closeShortcutsModal() {
    setIsShortcutsModalOpen(false);
  }

  return (
    <div className="app-layout">
      <header className="docs-topbar">
        <div className="docs-topbar-inner">
          <Link className="docs-topbar-brand" to="/" aria-label={t('nav.home')}>
            <img src={`${import.meta.env.BASE_URL}gol-mark.svg`} alt="" aria-hidden="true" className="docs-topbar-brand-icon" width="28" height="28" />
            <span className="docs-topbar-brand-title-wrap">
              <h1>{t('app.title')}</h1>
              <span className="wm-badge wm-badge-neutral docs-topbar-alpha-badge">Alpha</span>
            </span>
          </Link>
          <nav className="docs-topbar-nav wm-app-nav-nowrap" aria-label="Primary navigation">
          <NavLink
            to="/play/select"
            className={({ isActive }) => `docs-topbar-link-devdocs${isActive ? ' is-active' : ''}`}
            aria-label={t('nav.play')}
          >
            {t('nav.play')}
          </NavLink>
          <NavLink
            to="/explore"
            className={({ isActive }) => `docs-topbar-link-devdocs${isActive ? ' is-active' : ''}`}
            aria-label={t('nav.explore')}
          >
            {t('nav.explore')}
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
          <details className="header-user-menu">
            <summary className="header-user-menu-trigger" aria-label={t('nav.userMenu')} title={t('nav.userMenu')}>
              <CircleUserRound size={16} aria-hidden="true" />
              <span>{t('nav.user')}</span>
              <ChevronDown size={14} aria-hidden="true" />
            </summary>
            <div className="header-user-menu-panel" role="menu" aria-label={t('nav.userMenu')}>
              <NavLink
                to="/profile"
                className="header-user-menu-item"
                role="menuitem"
                onClick={(event) => (event.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open')}
              >
                {t('nav.profile')}
              </NavLink>
              <NavLink
                to="/settings"
                className="header-user-menu-item"
                role="menuitem"
                onClick={(event) => (event.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open')}
              >
                {t('nav.settings')}
              </NavLink>
              <NavLink
                to="/sign-out"
                className="header-user-menu-item"
                role="menuitem"
                onClick={(event) => (event.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open')}
              >
                {t('nav.signOut')}
              </NavLink>
            </div>
          </details>
        </div>
        </div>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/play/select" element={<PlayStart />} />
          <Route path="/play" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/sign-out" element={<SignOut />} />
        </Routes>
      </main>
      <footer className="global-footer">
        <div className="global-footer-shell">
          <nav className="site-footer-nav" aria-label={t('footer.label')}>
            <span className="site-footer-primary">
              <span className="site-footer-source">
                <a
                  className="docs-topbar-github global-footer-github"
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
                <a href="https://github.com/wintermuted/game-of-life" target="_blank" rel="noopener noreferrer">{t('footer.sourceLink')}</a>
                <a href="https://github.com/wintermuted/game-of-life/releases/latest" target="_blank" rel="noopener noreferrer">{t('footer.releaseLink')}</a>
              </span>
              <button
                className="site-footer-shortcuts-btn"
                type="button"
                onClick={() => setIsShortcutsModalOpen(true)}
              >
                {t('footer.shortcuts.menuLabel')}
              </button>
            </span>
            <span className="site-footer-controls">
              <LanguageSwitcher className="global-footer-language" dropUp />
              <button
                className="docs-topbar-toggle"
                onClick={toggleTheme}
                aria-label={t('nav.toggleDarkMode')}
                title={t('nav.toggleDarkMode')}
                type="button"
              >
                {mode === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
                <span>{mode === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </span>
          </nav>
        </div>
      </footer>

      {isShortcutsModalOpen && (
        <div className="wm-modal-overlay" onClick={closeShortcutsModal}>
          <div
            className="wm-modal-panel shortcuts-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="keyboard-shortcuts-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="wm-modal-header">
              <h3 id="keyboard-shortcuts-title" className="wm-modal-title">{t('footer.shortcuts.title')}</h3>
            </div>
            <div className="wm-modal-body shortcuts-modal-body">
              <p className="shortcuts-context-line">
                {t('footer.shortcuts.currentContext', { context: currentContextLabel })}
              </p>
              <p className="shortcuts-hint">{t('footer.shortcuts.focusHint')}</p>

              <section className="shortcuts-section">
                <h4 className="shortcuts-section-title">{t('footer.shortcuts.availableNow')}</h4>
                {availableNow.length > 0 ? (
                  <ul className="shortcuts-list">
                    {availableNow.map((shortcut) => (
                      <li key={`available-${shortcut.keyCombo}-${shortcut.description}`} className="shortcuts-list-item">
                        <kbd>{shortcut.keyCombo}</kbd>
                        <span className="shortcuts-item-copy">
                          <span>{shortcut.description}</span>
                          {shortcut.controlLabel ? (
                            <span className="shortcuts-item-control">{t('footer.shortcuts.controlPrefix', { control: shortcut.controlLabel })}</span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="shortcuts-empty">{t('footer.shortcuts.noShortcutsHere')}</p>
                )}
              </section>

              <section className="shortcuts-section">
                <h4 className="shortcuts-section-title">{t('footer.shortcuts.allShortcuts')}</h4>
                <div className="shortcuts-context-grid">
                  <article className={`shortcuts-context-card${activeShortcutContext === 'play-edit' ? ' is-current' : ''}`}>
                    <header className="shortcuts-context-card-header">
                      <span>{t('footer.shortcuts.contextPlayEdit')}</span>
                      {activeShortcutContext === 'play-edit' ? <span className="shortcuts-current-badge">{t('footer.shortcuts.currentBadge')}</span> : null}
                    </header>
                    <ul className="shortcuts-list">
                      {playEditShortcuts.map((shortcut) => (
                        <li key={`edit-${shortcut.keyCombo}-${shortcut.description}`} className="shortcuts-list-item">
                          <kbd>{shortcut.keyCombo}</kbd>
                          <span className="shortcuts-item-copy">
                            <span>{shortcut.description}</span>
                            {shortcut.controlLabel ? (
                              <span className="shortcuts-item-control">{t('footer.shortcuts.controlPrefix', { control: shortcut.controlLabel })}</span>
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>

                  <article className={`shortcuts-context-card${activeShortcutContext === 'play-run' ? ' is-current' : ''}`}>
                    <header className="shortcuts-context-card-header">
                      <span>{t('footer.shortcuts.contextPlayRun')}</span>
                      {activeShortcutContext === 'play-run' ? <span className="shortcuts-current-badge">{t('footer.shortcuts.currentBadge')}</span> : null}
                    </header>
                    <ul className="shortcuts-list">
                      {playRunShortcuts.map((shortcut) => (
                        <li key={`play-${shortcut.keyCombo}-${shortcut.description}`} className="shortcuts-list-item">
                          <kbd>{shortcut.keyCombo}</kbd>
                          <span className="shortcuts-item-copy">
                            <span>{shortcut.description}</span>
                            {shortcut.controlLabel ? (
                              <span className="shortcuts-item-control">{t('footer.shortcuts.controlPrefix', { control: shortcut.controlLabel })}</span>
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </div>
              </section>
            </div>
            <div className="wm-modal-footer">
              <button className="btn btn-primary" type="button" onClick={closeShortcutsModal}>
                {t('dialogs.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
