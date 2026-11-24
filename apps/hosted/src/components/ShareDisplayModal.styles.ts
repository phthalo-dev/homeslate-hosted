import { recipe, t } from '../ui/system';

export const shareDisplay = recipe({
  name: 'share-display',
  slots: ['qrFrame', 'qr', 'caption', 'captionLine', 'linkBlock', 'linkActions', 'linkField'],
  styles: {
    base: {
      qrFrame: {
        margin: 0,
        display: 'grid',
        justifyItems: 'center',
        gap: t.space.sm.var,
        padding: t.space.lg.var,
        borderRadius: t.radius.lg.var,
        background: t.color.background.subtle.var,
        border: `1px solid ${t.color.border.subtle.var}`,
      },
      qr: {
        // QR codes need a light quiet zone in either colour mode.
        background: '#ffffff',
        padding: t.space.sm.var,
        borderRadius: t.radius.md.var,
        lineHeight: 0,
        boxShadow: t.shadow.sm.var,
      },
      caption: { textAlign: 'center' },
      captionLine: { display: 'inline-flex', alignItems: 'center', gap: t.space.xxs.var },
      linkBlock: { display: 'grid', gap: t.space.sm.var },
      linkActions: {
        display: 'flex',
        alignItems: 'center',
        gap: t.space.xs.var,
        flexWrap: 'wrap',
      },
      linkField: {
        minWidth: 0,
        '& input': {
          fontFamily: t.fontFamily.mono.var,
          fontSize: t.fontSize.xs.var,
          textOverflow: 'ellipsis',
        },
      },
    },
  },
});
