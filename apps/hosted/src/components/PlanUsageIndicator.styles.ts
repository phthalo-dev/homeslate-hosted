import { recipe, t } from '../ui/system';

export const planUsage = recipe({
  name: 'plan-usage',
  slots: ['root', 'label', 'upgrade', 'proBadge'],
  styles: {
    base: {
      root: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: t.space.xxs.var,
        whiteSpace: 'nowrap',
        fontSize: t.fontSize.sm.var,
        color: t.color.text.secondary.var,
      },
      label: {
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: t.size.control.xs.var,
        paddingInline: t.space.xs.var,
        borderRadius: t.radius.full.var,
        border: `1px solid ${t.color.border.default.var}`,
        '[data-at-limit] > &': {
          color: t.color.tone.warning.foreground.var,
          borderColor: t.color.tone.warning.border.var,
          background: t.color.tone.warning.subtleBackground.var,
        },
      },
      upgrade: { fontWeight: t.fontWeight.semibold.var },
      proBadge: { marginInlineStart: t.space.xxs.var, flexShrink: 0 },
    },
  },
});
