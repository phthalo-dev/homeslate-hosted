/** Styles shared by the management shell, loaders, and small app primitives. */
import { recipe, t } from './system';

/** Full-height centred region for route-level loading states. */
export const pageLoader = recipe({
  name: 'page-loader',
  slots: ['root', 'stack'],
  styles: {
    base: {
      root: {
        display: 'grid',
        placeItems: 'center',
        width: '100%',
        height: '100%',
        minHeight: '100dvh',
        background: t.color.background.app.var,
        color: t.color.text.primary.var,
        '&[data-layout="inline"]': { minHeight: '16rem', background: 'transparent' },
      },
      stack: {
        display: 'grid',
        justifyItems: 'center',
        gap: t.space.md.var,
      },
    },
  },
});

/** Width of the management content column (the bar lines up with it). */
const contentMaxWidth = '72rem';

/** Phone layout breakpoint for the management chrome (40rem = 640px). */
const phone = '@media (max-width: 40rem)';

const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;

/**
 * Management app frame: top bar + scrollable main area.
 *
 * Wide screens: one 56px bar — brand · title | section nav | actions · account.
 * Phones (< 40rem): row 1 is brand · title | overflow menu · account; the section nav
 * drops to a full-width, horizontally scrollable second row.
 */
export const managementShell = recipe({
  name: 'management-shell',
  slots: [
    'root',
    'bar',
    'headingGroup',
    'brand',
    'brandMark',
    'brandName',
    'title',
    'titleGroup',
    'nav',
    'actions',
    'wideActions',
    'compactActions',
    'main',
    'content',
  ],
  styles: {
    base: {
      root: {
        height: '100dvh',
        background: t.color.background.app.var,
        color: t.color.text.primary.var,
        // Phones: 44px touch targets for icon-only buttons, 40px for text buttons and tabs.
        [phone]: {
          '& .var-ui-button': { minHeight: '2.5rem' },
          '& .var-ui-button[data-layout="icon"]': { minWidth: '2.75rem', minHeight: '2.75rem' },
          '& .var-ui-top-nav__item': { minHeight: '2.5rem' },
        },
      },
      bar: {
        // The heading slot is `flex-shrink: 0` in Var UI; let the title truncate instead.
        '& > .var-ui-top-nav__heading': { flexShrink: 1, minWidth: 0 },
        '& > .var-ui-top-nav__start': { flexShrink: 0 },
        // Contained pages: line the bar's edges up with the content column below it.
        '&[data-contained]': {
          paddingInline: `max(${t.space.lg.var}, calc((100% - ${contentMaxWidth}) / 2 + ${t.space.lg.var}))`,
        },
        [phone]: {
          flexWrap: 'wrap',
          columnGap: t.space.sm.var,
          rowGap: 0,
          paddingInline: t.space.md.var,
          '&[data-contained]': { paddingInline: t.space.md.var },
          '& > .var-ui-top-nav__heading': { flex: '1 1 0', minHeight: t.size.nav.bar.var },
          '& > .var-ui-top-nav__start': {
            order: 3,
            flex: '1 0 100%',
            minWidth: 0,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            marginInline: `calc(-1 * ${t.space.md.var})`,
            paddingInline: t.space.md.var,
            paddingBlock: t.space.xxs.var,
            borderBlockStart: `1px solid ${t.color.border.subtle.var}`,
          },
        },
      },
      headingGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: t.space.xs.var,
        minWidth: 0,
      },
      brand: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: t.space.xs.var,
        flexShrink: 0,
        [phone]: { minHeight: '2.75rem', minWidth: '2.75rem' },
        color: 'inherit',
        textDecoration: 'none',
        borderRadius: t.radius.md.var,
        '&:focus-visible': {
          outline: `2px solid ${t.color.border.focus.var}`,
          outlineOffset: '2px',
        },
      },
      brandMark: { display: 'block', flexShrink: 0 },
      brandName: {
        fontWeight: t.fontWeight.semibold.var,
        letterSpacing: t.letterSpacing.tight.var,
        // With a page title next to it, the mark alone carries the brand on phones.
        '&[data-compact]': { [phone]: visuallyHidden },
      },
      titleGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: t.space.xs.var,
        minWidth: 0,
        paddingInlineStart: t.space.sm.var,
        marginInlineStart: t.space.xxs.var,
        borderInlineStart: `1px solid ${t.color.border.default.var}`,
      },
      title: {
        margin: 0,
        fontSize: t.fontSize.lg.var,
        fontWeight: t.fontWeight.semibold.var,
        letterSpacing: t.letterSpacing.tight.var,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      nav: {
        display: 'flex',
        alignItems: 'center',
        gap: t.space.xxs.var,
        marginInlineStart: t.space.sm.var,
        [phone]: { marginInlineStart: 0 },
      },
      actions: {
        display: 'flex',
        alignItems: 'center',
        gap: t.space.xs.var,
        flexShrink: 0,
      },
      wideActions: {
        display: 'flex',
        alignItems: 'center',
        gap: t.space.xs.var,
        [phone]: { '&[data-collapsible]': { display: 'none' } },
      },
      compactActions: {
        display: 'none',
        [phone]: { display: 'flex' },
      },
      main: {
        minHeight: 0,
        overflowY: 'auto',
        // Symmetric gutters: pages with and without a scrollbar keep the same centre line as
        // the full-width top bar, so the content column never shifts sideways.
        '&[data-contained]': { '@media (min-width: 40.0625rem)': { scrollbarGutter: 'stable both-edges' } },
      },
      content: {
        width: '100%',
        maxWidth: contentMaxWidth,
        marginInline: 'auto',
        padding: `${t.space.xl.var} ${t.space.lg.var} ${t.space.xxxl.var}`,
        [phone]: {
          padding: `${t.space.lg.var} ${t.space.md.var} ${t.space.xxl.var}`,
        },
      },
    },
  },
});

/** Page header shared by every management page and tab: title + lead on the left, actions right. */
export const pageHeader = recipe({
  name: 'page-header',
  slots: ['root', 'text', 'titleRow', 'title', 'lead', 'actions'],
  styles: {
    base: {
      root: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: t.space.md.var,
        flexWrap: 'wrap',
        marginBlockEnd: t.space.lg.var,
      },
      text: { display: 'grid', gap: t.space.xxs.var, minWidth: 0, flex: '1 1 20rem' },
      titleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: t.space.sm.var,
        flexWrap: 'wrap',
      },
      title: {
        margin: 0,
        fontSize: t.fontSize.xxl.var,
        fontWeight: t.fontWeight.semibold.var,
        letterSpacing: t.letterSpacing.display.var,
        lineHeight: t.lineHeight.tight.var,
      },
      lead: {
        margin: 0,
        maxWidth: '40rem',
        fontSize: t.fontSize.sm.var,
        color: t.color.text.secondary.var,
      },
      actions: {
        display: 'flex',
        alignItems: 'center',
        gap: t.space.xs.var,
        flexWrap: 'wrap',
        '& .var-ui-button': { whiteSpace: 'nowrap' },
        // Phones: the primary (last) action first at full width, the rest in an even grid.
        [phone]: {
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          '& > :last-child': { gridColumn: '1 / -1', order: -1 },
          '& > :first-child:nth-last-child(2)': { gridColumn: '1 / -1' },
        },
      },
    },
  },
});
