import { recipe, t } from '../ui/system';

export const registerDevice = recipe({
  name: 'register-device',
  slots: ['steps', 'codeField'],
  styles: {
    base: {
      steps: {
        margin: 0,
        paddingInlineStart: t.space.lg.var,
        display: 'grid',
        gap: t.space.xs.var,
        color: t.color.text.secondary.var,
        '& li::marker': { color: t.color.tone.accent.foreground.var, fontWeight: t.fontWeight.semibold.var },
      },
      codeField: {
        '& input': {
          fontFamily: t.fontFamily.mono.var,
          fontSize: t.fontSize.lg.var,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        },
      },
    },
  },
});
