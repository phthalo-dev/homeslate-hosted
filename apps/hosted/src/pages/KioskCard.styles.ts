/** Centered single-card screens: sign-in and tablet pairing. Always dark. */
import { recipe, t } from '../ui/system';
import { brand } from '../ui/theme';

const focusRing = {
  outline: `2px solid ${t.color.border.focus.var}`,
  outlineOffset: '2px',
};

export const kioskCard = recipe({
  name: 'kiosk-card',
  slots: ['screen', 'card', 'mark', 'iconBadge', 'title', 'body', 'fine', 'footer', 'link', 'fullWidth', 'code', 'status'],
  styles: {
    base: {
      screen: {
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: t.space.lg.var,
        color: t.color.text.primary.var,
        background: [
          `radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in oklch, ${brand.lamp.var} 8%, transparent), transparent 60%)`,
          `radial-gradient(ellipse 60% 40% at 50% 100%, color-mix(in oklch, ${t.color.tone.accent.foreground.var} 8%, transparent), transparent 60%)`,
          t.color.background.app.var,
        ].join(', '),
      },
      card: {
        width: 'min(100%, 25rem)',
        '&[data-wide]': { width: 'min(100%, 36rem)' },
        display: 'grid',
        justifyItems: 'center',
        gap: t.space.md.var,
        padding: `${t.space.xxl.var} ${t.space.xl.var} ${t.space.xl.var}`,
        textAlign: 'center',
        borderRadius: t.radius.xl.var,
        background: t.color.background.surface.var,
        border: `1px solid ${t.color.border.default.var}`,
        boxShadow: t.shadow.xl.var,
        '@media (max-width: 30rem)': { paddingInline: t.space.lg.var },
      },
      mark: { borderRadius: '1rem', marginBlockEnd: t.space.xs.var },
      iconBadge: {
        display: 'grid',
        placeItems: 'center',
        width: '4rem',
        height: '4rem',
        marginBlockEnd: t.space.xs.var,
        borderRadius: t.radius.xl.var,
        color: t.color.tone.accent.foreground.var,
        background: t.color.tone.accent.subtleBackground.var,
        border: `1px solid ${t.color.tone.accent.border.var}`,
      },
      title: {
        margin: 0,
        fontSize: t.fontSize.xxl.var,
        fontWeight: t.fontWeight.semibold.var,
        letterSpacing: t.letterSpacing.tight.var,
        lineHeight: t.lineHeight.tight.var,
      },
      body: { maxWidth: '20rem', marginBlockEnd: t.space.xs.var },
      fine: { maxWidth: '20rem' },
      footer: {
        display: 'flex',
        gap: t.space.md.var,
        justifyContent: 'center',
        paddingBlockStart: t.space.md.var,
        marginBlockStart: t.space.xs.var,
        width: '100%',
        borderTop: `1px solid ${t.color.border.subtle.var}`,
        fontSize: t.fontSize.sm.var,
      },
      link: {
        color: t.color.text.secondary.var,
        textUnderlineOffset: '0.2em',
        borderRadius: t.radius.sm.var,
        '&:hover': { color: t.color.text.primary.var },
        '&:focus-visible': focusRing,
      },
      fullWidth: { width: '100%' },
      code: {
        margin: 0,
        padding: `${t.space.md.var} ${t.space.xl.var}`,
        borderRadius: t.radius.xl.var,
        fontFamily: t.fontFamily.mono.var,
        // ~96px tall on a 1024px tablet, legible from across a kitchen.
        fontSize: 'clamp(2.5rem, 7vw, 4rem)',
        lineHeight: 1.1,
        fontWeight: t.fontWeight.bold.var,
        letterSpacing: '0.28em',
        // Keep the visual centre with trailing letter-spacing.
        paddingInlineEnd: `calc(${t.space.xl.var} - 0.28em)`,
        color: t.color.text.primary.var,
        background: t.color.background.subtle.var,
        border: `1px solid ${t.color.border.strong.var}`,
        userSelect: 'all',
      },
      status: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: t.space.xs.var,
        color: t.color.text.secondary.var,
        fontSize: t.fontSize.sm.var,
      },
    },
  },
});
