import { useEffect, useRef, useState } from 'react';
import { applyUpdate, subscribeToPendingUpdate } from '../pwaUpdate';
import { pwaUpdateToast } from './PwaUpdateToast.styles';

const RELOAD_DELAY_MS = 3000;

/**
 * Display-surface notice before a PWA reload. Plain DOM on purpose: the wall
 * viewer has no Var UI `ToastProvider`, and this must render on any theme.
 */
export function PwaUpdateToast() {
  const [visible, setVisible] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    return subscribeToPendingUpdate(() => {
      if (startedRef.current) return;
      startedRef.current = true;
      setVisible(true);
      window.setTimeout(() => {
        applyUpdate(true);
      }, RELOAD_DELAY_MS);
    });
  }, []);

  if (!visible) return null;

  return (
    <div className={pwaUpdateToast} role="status" aria-live="polite">
      Updating…
    </div>
  );
}
