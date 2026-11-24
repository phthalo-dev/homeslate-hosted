import { style, t } from '../ui/system';

export const pwaUpdateToast = style('pwa-update-toast', {
  position: 'fixed',
  left: '50%',
  bottom: t.space.lg.var,
  transform: 'translateX(-50%)',
  zIndex: 10000,
  padding: `${t.space.sm.var} ${t.space.lg.var}`,
  borderRadius: t.radius.lg.var,
  background: 'rgba(20, 22, 28, 0.92)',
  color: '#ffffff',
  fontSize: '1rem',
  fontWeight: 600,
  letterSpacing: '0.01em',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
  pointerEvents: 'none',
});
