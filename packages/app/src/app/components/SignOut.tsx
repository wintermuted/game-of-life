import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function SignOut() {
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: '768px', margin: '0 auto', padding: '2rem 1.25rem' }}>
      <h1>{t('signOut.title')}</h1>
      <p style={{ marginTop: '0.75rem' }}>{t('signOut.stubDescription')}</p>
      <div className="card card-body" style={{ marginTop: '1rem' }}>
        <p style={{ margin: 0 }}>{t('signOut.persistenceNote')}</p>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <Link className="btn btn-sm btn-secondary-neutral" to="/play">
          {t('signOut.returnToPlay')}
        </Link>
      </div>
    </div>
  );
}

export default SignOut;
