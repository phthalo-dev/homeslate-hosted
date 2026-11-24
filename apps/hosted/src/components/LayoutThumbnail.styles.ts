import { recipe, t } from '../ui/system';

export const layoutThumbnail = recipe({
  name: 'layout-thumbnail',
  slots: ['frame', 'tile', 'empty'],
  styles: {
    base: {
      // A little wall tablet: 16:10 screen, the view's grid inside.
      frame: {
        position: 'relative',
        display: 'grid',
        aspectRatio: '16 / 10',
        gap: '2px',
        padding: '3px',
        borderRadius: t.radius.md.var,
        background: t.color.background.app.var,
        border: `1px solid ${t.color.border.default.var}`,
        overflow: 'hidden',
        '&[data-size="sm"]': { gap: '1px', padding: '2px', borderRadius: t.radius.sm.var },
        '&[data-hidden]': { opacity: 0.55, borderStyle: 'dashed' },
      },
      tile: {
        display: 'grid',
        placeItems: 'center',
        minWidth: 0,
        minHeight: 0,
        borderRadius: '2px',
        color: t.color.tone.accent.foreground.var,
        background: `color-mix(in oklch, ${t.color.tone.accent.foreground.var} 20%, ${t.color.background.surface.var})`,
        border: `1px solid color-mix(in oklch, ${t.color.tone.accent.foreground.var} 34%, transparent)`,
        '& svg': { display: 'block', opacity: 0.85 },
      },
      empty: {
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        fontSize: t.fontSize.xs.var,
        color: t.color.text.tertiary.var,
      },
    },
  },
});
