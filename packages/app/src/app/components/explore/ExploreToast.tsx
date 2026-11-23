import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ExploreActions } from './useExploreActions';
export function ExploreToast({
  toastOpen,
  toastMessage,
  showFavoritesToastLink,
  closeToast,
}: Pick<
  ExploreActions,
  'toastOpen' | 'toastMessage' | 'showFavoritesToastLink' | 'closeToast'
>): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <div
      className={`wm-toast wm-toast-success${toastOpen ? ' wm-toast-visible' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span>{toastMessage}</span>
      {showFavoritesToastLink ? (
        <Link className="explore-toast-link" to="/profile#favorites" onClick={closeToast}>
          {t('explore.viewFavorites')}
        </Link>
      ) : null}
      <button className="wm-toast-dismiss" type="button" aria-label="Dismiss" onClick={closeToast}>
        &#x2715;
      </button>
    </div>
  );
}
