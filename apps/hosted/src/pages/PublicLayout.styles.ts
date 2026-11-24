/**
 * Marketing + legal chrome. Always dark (pinned with `data-color-mode`), with
 * the warm "lamp" glow from the brand namespace over slate.
 */
import { recipe, t } from '../ui/system';
import { brand } from '../ui/theme';

const focusRing = {
  outline: `2px solid ${t.color.border.focus.var}`,
  outlineOffset: '3px',
};

export const publicLayout = recipe({
  name: 'public-layout',
  slots: ['shell', 'header', 'brand', 'brandName', 'nav', 'navLink', 'main', 'footer', 'footerLinks', 'footerLink'],
  styles: {
    base: {
      shell: {
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        color: t.color.text.primary.var,
        background: [
          `radial-gradient(ellipse 80% 50% at 10% 0%, color-mix(in oklch, ${brand.lamp.var} 9%, transparent), transparent 55%)`,
          `radial-gradient(ellipse 60% 40% at 90% 10%, color-mix(in oklch, ${t.color.tone.accent.foreground.var} 10%, transparent), transparent 50%)`,
          t.color.background.app.var,
        ].join(', '),
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: t.space.md.var,
        width: '100%',
        maxWidth: '68rem',
        marginInline: 'auto',
        padding: `${t.space.md.var} ${t.space.lg.var}`,
        '@media (max-width: 40rem)': { paddingInline: t.space.md.var },
      },
      brand: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: t.space.xs.var,
        minHeight: '2.75rem',
        color: 'inherit',
        textDecoration: 'none',
        borderRadius: t.radius.md.var,
        '&:focus-visible': focusRing,
      },
      brandName: {
        fontWeight: t.fontWeight.semibold.var,
        fontSize: t.fontSize.lg.var,
        letterSpacing: t.letterSpacing.tight.var,
        '@media (max-width: 40rem)': { fontSize: t.fontSize.md.var },
      },
      nav: {
        display: 'flex',
        alignItems: 'center',
        gap: t.space.lg.var,
        '@media (max-width: 40rem)': { gap: t.space.sm.var },
      },
      navLink: {
        color: t.color.text.secondary.var,
        textDecoration: 'none',
        fontSize: t.fontSize.md.var,
        borderRadius: t.radius.sm.var,
        transition: t.transition.colorShift.var,
        '&:hover': { color: t.color.text.primary.var },
        '&:focus-visible': focusRing,
        '@media (max-width: 40rem)': {
          fontSize: t.fontSize.sm.var,
          display: 'inline-flex',
          alignItems: 'center',
          minHeight: '2.75rem',
        },
      },
      main: {
        flex: 1,
        width: '100%',
        maxWidth: '68rem',
        marginInline: 'auto',
        padding: `${t.space.md.var} ${t.space.lg.var} ${t.space.xxxl.var}`,
        '@media (max-width: 40rem)': { paddingInline: t.space.md.var },
      },
      footer: {
        width: '100%',
        maxWidth: '68rem',
        marginInline: 'auto',
        padding: `${t.space.lg.var} ${t.space.lg.var} ${t.space.xxl.var}`,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: t.space.sm.var,
        color: t.color.text.tertiary.var,
        fontSize: t.fontSize.sm.var,
        borderTop: `1px solid ${t.color.border.subtle.var}`,
        '@media (max-width: 40rem)': { paddingInline: t.space.md.var },
      },
      footerLinks: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: t.space.md.var,
        '@media (max-width: 40rem)': { rowGap: 0 },
      },
      footerLink: {
        color: t.color.text.secondary.var,
        textDecoration: 'none',
        borderRadius: t.radius.sm.var,
        '@media (max-width: 40rem)': { display: 'inline-flex', alignItems: 'center', minHeight: '2.75rem' },
        '&:hover': { color: t.color.text.primary.var, textDecoration: 'underline', textUnderlineOffset: '0.2em' },
        '&:focus-visible': focusRing,
      },
    },
  },
});

/** Legal pages (privacy, terms): one readable column of Var UI `Prose`. */
export const legalPage = recipe({
  name: 'legal-page',
  slots: ['article', 'eyebrow', 'title', 'updated', 'body'],
  styles: {
    base: {
      article: {
        maxWidth: '42rem',
        paddingBlock: `${t.space.xl.var} ${t.space.xxl.var}`,
      },
      eyebrow: { color: brand.lamp.var },
      title: {
        margin: `${t.space.xs.var} 0 ${t.space.xs.var}`,
        fontSize: t.fontSize.display.sm.var,
        letterSpacing: t.letterSpacing.display.var,
        lineHeight: 1.1,
      },
      updated: { marginBlockEnd: t.space.xl.var },
      body: {
        color: t.color.text.secondary.var,
        fontSize: t.fontSize.prose.body.var,
        '& strong': { color: t.color.text.primary.var },
        '& h2': { color: t.color.text.primary.var, letterSpacing: t.letterSpacing.tight.var },
        '& code': { wordBreak: 'break-all' },
      },
    },
  },
});
