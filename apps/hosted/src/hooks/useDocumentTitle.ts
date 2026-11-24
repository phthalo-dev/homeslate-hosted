import { useEffect } from 'react';

const APP_NAME = 'Homeslate';

/**
 * Sets `document.title` to "<title> — Homeslate" while the calling page is mounted
 * (just "Homeslate" without a title), so tabs and history entries are distinguishable.
 */
export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    document.title = title ? `${title} — ${APP_NAME}` : APP_NAME;
  }, [title]);
}
