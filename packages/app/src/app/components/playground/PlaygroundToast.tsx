import { createPortal } from 'react-dom';
import type * as React from 'react';
import type { BoardNotifications } from './useBoardNotifications';
import type { BoardPresentation } from './useBoardPresentation';

export function PlaygroundToast(props: {
  notifications: Pick<
    BoardNotifications,
    'snackbarOpen' | 'snackbarMessage' | 'handleSnackbarClose'
  >;
  presentation: Pick<BoardPresentation, 'settingsHoverPopover'>;
}): React.JSX.Element {
  const { snackbarOpen, snackbarMessage, handleSnackbarClose } = props.notifications;
  const { settingsHoverPopover } = props.presentation;
  return (
    <>
      <div
        className={`wm-toast wm-toast-success${snackbarOpen ? ' wm-toast-visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        {snackbarMessage}
        <button
          className="wm-toast-dismiss"
          type="button"
          aria-label="Dismiss"
          onClick={handleSnackbarClose}
        >
          &#x2715;
        </button>
      </div>
      {settingsHoverPopover
        ? createPortal(
            <span
              className="rules-popover-floating"
              role="tooltip"
              style={{
                left: `${settingsHoverPopover.left}px`,
                top: `${settingsHoverPopover.top}px`,
              }}
            >
              {settingsHoverPopover.text}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}
