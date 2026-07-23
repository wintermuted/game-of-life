import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BrowserStorageMode,
  clearActiveBrowserStorageData,
  getBrowserStorageMode,
  getRecentBoards,
  getSavedBoards,
  getSavedTemplateNames,
  getStoredProfileUser,
  getFavoriteBoards,
  setBrowserStorageMode,
} from '../util/browserStorage';

function buildStorageSnapshot(mode: BrowserStorageMode) {
  return {
    mode,
    savedTemplateNames: getSavedTemplateNames(),
    savedBoards: getSavedBoards(),
    recentBoards: getRecentBoards(),
    favoriteBoards: getFavoriteBoards(),
    profileUser: getStoredProfileUser(),
  };
}

function Settings() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<BrowserStorageMode>(() => getBrowserStorageMode());
  const [status, setStatus] = useState('');
  const [snapshot, setSnapshot] = useState(() => buildStorageSnapshot(getBrowserStorageMode()));

  function handleModeChange(nextMode: BrowserStorageMode): void {
    setBrowserStorageMode(nextMode);
    setMode(nextMode);
    setStatus(t('settings.messages.storageSaved'));
    setSnapshot(buildStorageSnapshot(nextMode));
  }

  function handleClearData(): void {
    clearActiveBrowserStorageData();
    setStatus(t('settings.messages.activeDataCleared'));
    setSnapshot(buildStorageSnapshot(mode));
  }

  return (
    <div className="profile-layout">
      <header className="profile-header">
        <div>
          <h1 className="profile-title">{t('settings.title')}</h1>
          <p className="profile-subtitle">{t('settings.stubDescription')}</p>
        </div>
      </header>

      <section className="card card-body profile-card">
        <h2 className="settings-section-title">{t('settings.storage.title')}</h2>
        <p className="profile-persistence-note">{t('settings.storage.description')}</p>

        <div className="settings-options-grid" role="radiogroup" aria-label={t('settings.storage.title')}>
          <label className="settings-option-card">
            <input
              type="radio"
              name="storage-mode"
              value="local"
              checked={mode === 'local'}
              onChange={() => handleModeChange('local')}
            />
            <span className="settings-option-text">
              <strong>{t('settings.storage.local')}</strong>
              <small>{t('settings.storage.localHint')}</small>
            </span>
          </label>
          <label className="settings-option-card">
            <input
              type="radio"
              name="storage-mode"
              value="session"
              checked={mode === 'session'}
              onChange={() => handleModeChange('session')}
            />
            <span className="settings-option-text">
              <strong>{t('settings.storage.session')}</strong>
              <small>{t('settings.storage.sessionHint')}</small>
            </span>
          </label>
        </div>

        <div className="settings-actions-row">
          <button className="btn btn-sm btn-secondary-neutral" type="button" onClick={handleClearData}>
            {t('settings.storage.clearActive')}
          </button>
        </div>

        {status ? <p className="settings-status-line">{status}</p> : null}

        <div className="settings-storage-summary">
          <h3 className="settings-summary-title">{t('settings.storage.summaryTitle')}</h3>
          <pre className="settings-storage-json" aria-label={t('settings.storage.summaryTitle')}>
            <code>{JSON.stringify(snapshot, null, 2)}</code>
          </pre>
        </div>

        <p className="profile-persistence-note">{t('settings.persistenceNote')}</p>
      </section>
    </div>
  );
}

export default Settings;
