import { useEffect, useState } from 'react';
import { BookOpen, SkipForward, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RULESETS } from '@game-of-life/core';
import LandingSimulation from './LandingSimulation';
import { encodeGridToBase64 } from '../util/urlState';
import { LANDING_SHOWCASE_PATTERNS } from './landingShowcaseGrid';

const SHOWCASE_ROTATION_MS = 30_000;

function Landing() {
  const { t } = useTranslation();
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const showcase = LANDING_SHOWCASE_PATTERNS[showcaseIndex];
  const showcasePattern = encodeGridToBase64(showcase.grid);
  const ruleset = RULESETS.find((candidate) => candidate.id === showcase.rulesetId);
  const rulesetLabel = ruleset
    ? `${ruleset.id === 'standard' ? 'Conway' : ruleset.name} (${ruleset.classification})`
    : showcase.rulesetId;

  function showNextPattern() {
    setShowcaseIndex((currentIndex) => (currentIndex + 1) % LANDING_SHOWCASE_PATTERNS.length);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowcaseIndex((currentIndex) => (currentIndex + 1) % LANDING_SHOWCASE_PATTERNS.length);
    }, SHOWCASE_ROTATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [showcaseIndex]);

  return (
    <section className="landing-page" aria-label={t('landing.title')}>
      <div className="landing-sim-layer">
        <LandingSimulation initialGrid={showcase.grid} />
      </div>

      <div className="landing-showcase-controls">
        <div className="landing-pattern-meta" aria-live="polite">
          <h2 className="landing-pattern-title">
            <Link
              className="landing-pattern-title-link"
              to={`/play?pattern=${encodeURIComponent(showcasePattern)}&mode=play&ruleset=${encodeURIComponent(showcase.rulesetId)}`}
            >
              {showcase.name}
            </Link>
          </h2>
          <div className="landing-pattern-details">
            <Link to="/profile?creator=system">
              <User size={14} aria-hidden="true" />{showcase.author}
            </Link>
            <Link to={`/explore?ruleset=${encodeURIComponent(showcase.rulesetId)}`}>
              <BookOpen size={14} aria-hidden="true" />{rulesetLabel}
            </Link>
          </div>
        </div>
        <div className="landing-showcase-actions">
          <span className="landing-pattern-count">
            {t('landing.patternCount', { current: showcaseIndex + 1, total: LANDING_SHOWCASE_PATTERNS.length })}
          </span>
          <button
            className="wm-btn wm-btn-secondary landing-next-button"
            type="button"
            aria-label={t('landing.nextPattern')}
            title={t('landing.nextPattern')}
            onClick={showNextPattern}
          >
            <SkipForward size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Landing;