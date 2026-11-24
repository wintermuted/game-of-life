import { createPortal } from 'react-dom';
import { Toast } from '@game-of-life/ui-staging';
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
      <Toast
        open={snackbarOpen}
        message={snackbarMessage}
        onDismiss={handleSnackbarClose}
        dismissLabel="Dismiss"
      />
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
