import { style, t } from './ui/system';

/** Floating "exit preview" control over the fullscreen viewer. */
export const previewExit = style('preview-exit', {
  position: 'fixed',
  top: t.space.sm.var,
  right: t.space.sm.var,
  zIndex: 9999,
});
