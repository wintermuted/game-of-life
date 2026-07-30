import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Square } from 'lucide-react';
import { patterns } from '@game-of-life/core';
import { encodeGridToBase64 } from '../util/urlState';

function PlayStart() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  function handleCreateEmptyBoard(): void {
    const emptyHash = encodeGridToBase64({});
    navigate(`/play?pattern=${encodeURIComponent(emptyHash)}&mode=edit`);
  }

  function handleCreateRandomBoard(): void {
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    const hash = encodeGridToBase64(randomPattern.grid);
    navigate(`/play?pattern=${encodeURIComponent(hash)}`);
  }

  return (
    <section className="play-start-layout">
      <header className="profile-header">
        <div>
          <h1 className="profile-title">{t('playStart.title')}</h1>
          <p className="profile-subtitle">{t('playStart.subtitle')}</p>
        </div>
      </header>

      <div className="play-start-options">
        <article className="card card-body play-start-card">
          <h2>
            <span className="profile-section-heading-label">
              <Square size={16} aria-hidden="true" />
              <span>{t('playStart.emptyTitle')}</span>
            </span>
          </h2>
          <p>{t('playStart.emptyDescription')}</p>
          <button className="btn btn-sm btn-secondary-neutral" type="button" onClick={handleCreateEmptyBoard}>
            {t('playStart.emptyAction')}
          </button>
        </article>

        <article className="card card-body play-start-card">
          <h2>
            <span className="profile-section-heading-label">
              <Sparkles size={16} aria-hidden="true" />
              <span>{t('playStart.randomTitle')}</span>
            </span>
          </h2>
          <p>{t('playStart.randomDescription')}</p>
          <button className="btn btn-sm btn-secondary-neutral" type="button" onClick={handleCreateRandomBoard}>
            {t('playStart.randomAction')}
          </button>
        </article>
      </div>
    </section>
  );
}

export default PlayStart;