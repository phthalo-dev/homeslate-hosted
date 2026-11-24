import { recipe, t } from '../ui/system';

export const accountMenu = recipe({
  name: 'account-menu',
  slots: ['trigger'],
  styles: {
    base: {
      trigger: {
        position: 'relative',
        display: 'inline-flex',
        // Phones: a real 44px target (the ring moves onto the avatar itself).
        '@media (max-width: 40rem)': {
          padding: '6px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
          '& > .var-ui-avatar': { boxShadow: `0 0 0 1px ${t.color.border.default.var}`, borderRadius: t.radius.full.var },
        },
        borderRadius: t.radius.full.var,
        padding: '2px',
        transition: t.transition.borderShadow.var,
        boxShadow: `0 0 0 1px ${t.color.border.default.var}`,
        '&:hover': { boxShadow: `0 0 0 1px ${t.color.border.strong.var}` },
        '&[data-focus-visible], &:focus-visible': {
          outline: `2px solid ${t.color.border.focus.var}`,
          outlineOffset: '2px',
        },
      },
    },
  },
});
