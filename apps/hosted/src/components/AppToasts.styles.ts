import { style, t } from '../ui/system';

/** Action row under a toast's text (e.g. Undo), aligned with the title. */
export const appToasts = {
  actions: style('app-toast-actions', {
    display: 'flex',
    gap: t.space.xs.var,
    marginBlockStart: t.space.xs.var,
  }),
};
