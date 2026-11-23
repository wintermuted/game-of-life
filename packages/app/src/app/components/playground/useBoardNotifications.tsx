import { useEffect, useRef, useState } from 'react';

export interface BoardNotifications {
  notify: (message: string) => void;
  snackbarOpen: boolean;
  snackbarMessage: string;
  handleSnackbarClose: () => void;
}

export function useBoardNotifications(): BoardNotifications {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState('');

  const toastHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSnackbarClose(): void {
    setSnackbarOpen(false);
    if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
  }

  useEffect(() => {
    if (snackbarOpen) {
      if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
      toastHideTimer.current = setTimeout(() => setSnackbarOpen(false), 3000);
    }
    return () => {
      if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
    };
  }, [snackbarOpen, snackbarMessage]);
  function notify(message: string): void {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  }

  return { notify, snackbarOpen, snackbarMessage, handleSnackbarClose };
}
