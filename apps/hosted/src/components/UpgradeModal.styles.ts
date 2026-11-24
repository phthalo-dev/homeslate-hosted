import { recipe, t } from '../ui/system';

export const upgradeModal = recipe({
  name: 'upgrade-modal',
  slots: ['features', 'feature', 'check'],
  styles: {
    base: {
      features: {
        listStyle: 'none',
        margin: 0,
        padding: t.space.md.var,
        display: 'grid',
        gap: t.space.xs.var,
        borderRadius: t.radius.lg.var,
        background: t.color.tone.accent.subtleBackground.var,
        border: `1px solid ${t.color.tone.accent.border.var}`,
      },
      feature: {
        display: 'flex',
        alignItems: 'center',
        gap: t.space.xs.var,
      },
      check: {
        flexShrink: 0,
        color: t.color.tone.accent.foreground.var,
      },
    },
  },
});
