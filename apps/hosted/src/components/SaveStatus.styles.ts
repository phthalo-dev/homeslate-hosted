import { recipe, t } from '../ui/system';

export const saveStatus = recipe({
  name: 'save-status',
  slots: ['root', 'label'],
  styles: {
    base: {
      root: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: t.space.xxs.var,
        fontSize: t.fontSize.sm.var,
        whiteSpace: 'nowrap',
        // One neutral style everywhere; only a failed save takes a tone.
        color: t.color.text.secondary.var,
        '&[data-state="error"]': { color: t.color.tone.danger.foreground.var },
        // In the top bar it sits among buttons and needs their inline padding.
        '&[data-compact]': { paddingInline: t.space.xs.var },
      },
      label: {
        '&[data-compact]': {
          '@media (max-width: 48rem)': {
            position: 'absolute',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
            whiteSpace: 'nowrap',
          },
        },
      },
    },
  },
});
