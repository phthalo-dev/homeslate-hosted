import { recipe, t } from '../ui/system';

export const iconPicker = recipe({
  name: 'icon-picker',
  slots: ['scroller', 'grid', 'option', 'empty'],
  styles: {
    base: {
      scroller: {
        height: '22rem',
        overflowY: 'auto',
        marginInline: `calc(${t.space.xs.var} * -1)`,
        paddingInline: t.space.xs.var,
        overscrollBehavior: 'contain',
      },
      grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(2.75rem, 1fr))',
        gap: t.space.xxs.var,
      },
      option: {
        display: 'grid',
        placeItems: 'center',
        aspectRatio: '1',
        borderRadius: t.radius.md.var,
        color: t.color.text.secondary.var,
        transition: t.transition.chrome.var,
        '&:hover': {
          background: t.color.overlay.hover.var,
          color: t.color.text.primary.var,
        },
        '&[data-focus-visible], &:focus-visible': {
          outline: `2px solid ${t.color.border.focus.var}`,
          outlineOffset: '1px',
        },
        '&[data-active]': {
          background: t.color.tone.accent.subtleBackground.var,
          color: t.color.tone.accent.foreground.var,
          boxShadow: `inset 0 0 0 1px ${t.color.tone.accent.border.var}`,
        },
      },
      empty: { textAlign: 'center', paddingBlock: t.space.xxl.var },
    },
  },
});
