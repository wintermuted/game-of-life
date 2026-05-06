import { useTranslation } from 'react-i18next';

function About() {
  const { t } = useTranslation();
  
  return (
    <div style={{ maxWidth: '768px', margin: '0 auto', padding: '2rem 1.25rem' }}>
      <div className="card card-body">
        <h1>{t('about.title')}</h1>

        <h2 style={{ marginTop: '2rem' }}>{t('about.whatIsIt')}</h2>
        <p>{t('about.description1')}</p>
        <p>{t('about.description2')}</p>
        <ul>
          <li><p>{t('about.rule1')}</p></li>
          <li><p>{t('about.rule2')}</p></li>
          <li><p>{t('about.rule3')}</p></li>
          <li><p>{t('about.rule4')}</p></li>
        </ul>
        <p>{t('about.description3')}</p>

        <h2 style={{ marginTop: '2rem' }}>{t('about.projectTitle')}</h2>
        <p>{t('about.projectDescription')}</p>
        <ul>
          <li><p>{t('about.feature1')}</p></li>
          <li><p>{t('about.feature2')}</p></li>
          <li><p>{t('about.feature3')}</p></li>
          <li><p>{t('about.feature4')}</p></li>
          <li><p>{t('about.feature5')}</p></li>
        </ul>

        <h2 style={{ marginTop: '2rem' }}>{t('about.linksTitle')}</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}>
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
      </div>
    </div>
  );
}

export default About;
