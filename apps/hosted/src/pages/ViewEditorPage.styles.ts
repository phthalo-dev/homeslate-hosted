import { keyframes, recipe, t } from '../ui/system';

const placeholderShimmer = keyframes.create('editor-placeholder-shimmer', {
  '0%': { backgroundPosition: '200% 0' },
  '100%': { backgroundPosition: '-200% 0' },
});

export const viewEditor = recipe({
  name: 'view-editor',
  slots: ['shell', 'titleRow', 'frame', 'phoneNote', 'phoneNoteText', 'phoneNoteUrl', 'phoneNoteAction', 'canvas', 'labelLong', 'labelShort'],
  styles: {
    base: {
      shell: {},
      titleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: t.space.xs.var,
        minWidth: 0,
      },
      // Phones: a heads-up above the editor (built for wide screens) with a handoff link.
      phoneNote: {
        display: 'none',
        alignItems: 'center',
        gap: t.space.sm.var,
        padding: `${t.space.xs.var} ${t.space.md.var}`,
        fontSize: t.fontSize.sm.var,
        color: t.color.tone.info.foreground.var,
        background: t.color.tone.info.subtleBackground.var,
        borderBlockEnd: `1px solid ${t.color.border.subtle.var}`,
        '@media (max-width: 40rem)': { display: 'flex' },
      },
      phoneNoteText: { margin: 0, flex: 1, minWidth: 0 },
      phoneNoteUrl: { wordBreak: 'break-all', userSelect: 'all', color: t.color.text.primary.var },
      phoneNoteAction: { flexShrink: 0 },
      // The editor fills everything under the top bar and paints the display's
      // own theme canvas behind the grid.
      // Our toolbar button labels: full on wide screens, short on phones.
      labelLong: { '@media (max-width: 40rem)': { display: 'none' } },
      labelShort: { display: 'none', '@media (max-width: 40rem)': { display: 'inline' } },
      frame: {
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      },
      canvas: {
        flex: '1 1 auto',
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--token-surface-canvas, transparent)',
        '& .Editor_main': { minWidth: 0 },
        // Phones: one-row toolbar, and an expanded widget panel overlays the canvas instead of
        // squeezing it to a sliver.
        '@media (max-width: 40rem)': {
          '& .Editor_pageActions': { paddingInline: t.space.md.var, paddingBlock: t.space.xs.var, overflowX: 'auto' },
          '& .Editor_pageActions > *': { flexWrap: 'nowrap' },
          '& .Editor_pageActions .mantine-Button-root': { height: '2.5rem', minHeight: '2.5rem' },
          // The package's "Background Settings" button: icon only on phones. Its label is
          // visually hidden, not removed, so the button keeps its accessible name.
          '& .Editor_pageActions .mantine-Button-root:has(.mantine-Button-section)': {
            width: '2.75rem',
            paddingInline: 0,
            justifyContent: 'center',
          },
          '& .Editor_pageActions .mantine-Button-root:has(.mantine-Button-section) .mantine-Button-label': {
            position: 'absolute',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
            whiteSpace: 'nowrap',
          },
          '& .Editor_pageActions .mantine-Button-root:has(.mantine-Button-section) .mantine-Button-section': {
            marginInlineEnd: 0,
          },
          '& .Editor_body': { position: 'relative' },
          '& .WidgetPanel_panel': { transition: 'none' },
          '& .WidgetPanel_panel:not(.WidgetPanel_collapsed)': {
            position: 'absolute',
            insetBlock: 0,
            insetInlineStart: 0,
            zIndex: 5,
            width: 'min(16rem, 85vw)',
            boxShadow: t.shadow.lg.var,
          },
        },
        // First layout: hide the grid (and its fly-in transitions) behind a placeholder.
        '&:not([data-interacted]) .react-grid-item': { transition: 'none' },
        '&[data-settling] .DocumentCanvas_container': { visibility: 'hidden' },
        '&[data-settling] .Editor_main::after': {
          content: '""',
          position: 'absolute',
          inset: t.space.md.var,
          borderRadius: t.radius.lg.var,
          background: `linear-gradient(90deg, transparent, color-mix(in oklch, ${t.color.text.primary.var} 6%, transparent), transparent)`,
          backgroundSize: '200% 100%',
          animation: `${placeholderShimmer} 1.4s ease-in-out infinite`,
          border: `1px dashed color-mix(in oklch, ${t.color.text.primary.var} 18%, transparent)`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        },
      },
    },
  },
});
