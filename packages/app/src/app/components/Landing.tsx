import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { rPentomino, gosperGliderGun, simkinGliderGun } from '@game-of-life/core';
import LandingSimulation from './LandingSimulation';
import { encodeGridToBase64 } from '../util/urlState';
import PatternPreview from './PatternPreview';
import { DEFAULT_PALETTE_ID, getPaletteById } from '../constants/colors';

const presetConfigs = [
  {
    id: 'default',
    titleKey: 'landing.presets.default.title',
    descriptionKey: 'landing.presets.default.description',
    grid: rPentomino,
  },
  {
    id: 'gosper',
    titleKey: 'landing.presets.gosper.title',
    descriptionKey: 'landing.presets.gosper.description',
    grid: gosperGliderGun,
  },
  {
    id: 'simkin',
    titleKey: 'landing.presets.simkin.title',
    descriptionKey: 'landing.presets.simkin.description',
    grid: simkinGliderGun,
  },
];

function Landing() {
  const { t } = useTranslation();
  const previewPalette = getPaletteById(DEFAULT_PALETTE_ID);

  return (
    <section className="landing-page" aria-label={t('landing.title')}>
      <div className="landing-sim-layer">
        <LandingSimulation />
      </div>

      <div className="landing-content">
        <div className="landing-card">
          <p className="landing-eyebrow">{t('landing.eyebrow')}</p>
          <h1 className="landing-title">{t('landing.title')}</h1>
          <p className="landing-description">{t('landing.description')}</p>

          <ul className="landing-features">
            <li>{t('landing.feature1')}</li>
            <li>{t('landing.feature2')}</li>
            <li>{t('landing.feature3')}</li>
          </ul>

          <div className="landing-actions">
            <Link to="/play" className="wm-btn wm-btn-primary" aria-label={t('landing.enter')}>
              {t('landing.enter')}
            </Link>
            <Link to="/about" className="wm-btn wm-btn-secondary" aria-label={t('landing.about')}>
              {t('landing.about')}
            </Link>
          </div>
        </div>

        <div className="landing-card landing-presets-card">
          <h2 className="landing-presets-title">{t('landing.presetsTitle')}</h2>
          <p className="landing-presets-description">{t('landing.presetsDescription')}</p>
          <div className="landing-presets-grid">
            {presetConfigs.map((preset) => (
              <article key={preset.id} className="landing-preset-item">
                <div className="landing-preset-item-preview" aria-hidden="true">
                  <PatternPreview grid={preset.grid} size={92} palette={previewPalette} />
                </div>
                <h3 className="landing-preset-item-title">{t(preset.titleKey)}</h3>
                <p className="landing-preset-item-description">{t(preset.descriptionKey)}</p>
                <Link
                  to={`/play?pattern=${encodeGridToBase64(preset.grid)}`}
                  className="wm-btn wm-btn-secondary landing-preset-item-action"
                  aria-label={`${t('landing.openPreset')} ${t(preset.titleKey)}`}
                >
                  {t('landing.openPreset')}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Landing;