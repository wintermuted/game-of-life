import { Link } from 'react-router-dom';
import { Toast } from '@game-of-life/ui-staging';
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
    <Toast
      open={toastOpen}
      message={toastMessage}
      onDismiss={closeToast}
      dismissLabel="Dismiss"
      action={
        showFavoritesToastLink ? (
          <Link className="explore-toast-link" to="/profile#favorites" onClick={closeToast}>
            {t('explore.viewFavorites')}
          </Link>
        ) : null
      }
    />
  );
}
