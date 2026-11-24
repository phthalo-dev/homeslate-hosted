import { recipe, t } from '../ui/system';

export const inviteModal = recipe({
  name: 'invite-modal',
  slots: ['form', 'sendButton', 'emailField', 'loading', 'mailIcon', 'empty', 'person', 'personPrimary', 'personSecondary', 'undoRow', 'undoText'],
  styles: {
    base: {
      // Full-width email field with the button under it, so neither has to squeeze.
      form: {
        display: 'grid',
        gap: t.space.sm.var,
      },
      sendButton: { justifySelf: 'end' },
      emailField: { minWidth: 0 },
      loading: { display: 'grid', placeItems: 'center', padding: t.space.md.var },
      mailIcon: { color: t.color.text.secondary.var, flexShrink: 0 },
      undoRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: t.space.sm.var,
        padding: `${t.space.xxs.var} ${t.space.xxs.var} ${t.space.xxs.var} ${t.space.sm.var}`,
        borderRadius: t.radius.md.var,
        background: t.color.background.subtle.var,
      },
      undoText: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      person: { display: 'grid', minWidth: 0 },
      personPrimary: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      personSecondary: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: t.fontSize.sm.var,
        fontWeight: t.fontWeight.normal.var,
        color: t.color.text.secondary.var,
      },
      empty: {
        textAlign: 'center',
        padding: t.space.md.var,
        borderRadius: t.radius.lg.var,
        border: `1px dashed ${t.color.border.default.var}`,
      },
    },
  },
});
