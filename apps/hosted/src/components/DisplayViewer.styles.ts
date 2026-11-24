import { recipe, t } from '../ui/system';

/** Kiosk PIN prompt: big targets, readable from arm's length on a wall tablet. */
export const pinScreen = recipe({
  name: 'pin-screen',
  slots: ['screen', 'panel', 'lock', 'title', 'hint', 'pin', 'unlock'],
  styles: {
    base: {
      screen: {
        width: '100vw',
        height: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: t.space.lg.var,
        color: t.color.text.primary.var,
        background: `radial-gradient(ellipse 60% 50% at 50% 30%, color-mix(in oklch, ${t.color.tone.accent.foreground.var} 10%, transparent), transparent 70%), ${t.color.background.app.var}`,
      },
      panel: {
        display: 'grid',
        justifyItems: 'center',
        gap: t.space.md.var,
        width: 'min(100%, 24rem)',
        textAlign: 'center',
      },
      lock: {
        display: 'grid',
        placeItems: 'center',
        width: '4rem',
        height: '4rem',
        borderRadius: t.radius.full.var,
        color: t.color.tone.accent.foreground.var,
        background: t.color.tone.accent.subtleBackground.var,
        border: `1px solid ${t.color.tone.accent.border.var}`,
      },
      title: {
        margin: 0,
        fontSize: t.fontSize.xxl.var,
        fontWeight: t.fontWeight.semibold.var,
        letterSpacing: t.letterSpacing.tight.var,
      },
      hint: { marginBlockEnd: t.space.xs.var },
      pin: { justifySelf: 'center' },
      unlock: { width: '100%', marginBlockStart: t.space.xs.var },
    },
  },
});
