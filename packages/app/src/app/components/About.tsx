import { useTranslation } from 'react-i18next';

function About() {
  const { t } = useTranslation();
  
  return (
    <div style={{ maxWidth: '768px', margin: '0 auto', padding: '2rem 1.25rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>{t('about.title')}</h1>

      <section>
        <h2>{t('about.whatIsIt')}</h2>
        <p style={{ marginTop: '0.75rem' }}>{t('about.description1')}</p>
        <p style={{ marginTop: '0.5rem' }}>{t('about.description2')}</p>
        <ul className="wm-list" style={{ marginTop: '0.75rem' }}>
          <li>{t('about.rule1')}</li>
          <li>{t('about.rule2')}</li>
          <li>{t('about.rule3')}</li>
          <li>{t('about.rule4')}</li>
        </ul>
        <p style={{ marginTop: '0.75rem' }}>{t('about.description3')}</p>
      </section>

      <hr className="wm-separator" style={{ margin: '2rem 0' }} />

      <section>
        <h2>{t('about.projectTitle')}</h2>
        <p style={{ marginTop: '0.75rem' }}>{t('about.projectDescription')}</p>
        <ul className="wm-list" style={{ marginTop: '0.75rem' }}>
          <li>{t('about.feature1')}</li>
          <li>{t('about.feature2')}</li>
          <li>{t('about.feature3')}</li>
          <li>{t('about.feature4')}</li>
          <li>{t('about.feature5')}</li>
        </ul>
      </section>

      <hr className="wm-separator" style={{ margin: '2rem 0' }} />

      <section>
        <h2>{t('about.linksTitle')}</h2>
        <ul className="wm-list" style={{ marginTop: '0.75rem' }}>
          <li>
            <a
              href="https://github.com/wintermuted/game-of-life"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('about.viewSource')} ↗
            </a>
          </li>
          <li>
            <a
              href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('about.wikiLink')} ↗
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}

export default About;
