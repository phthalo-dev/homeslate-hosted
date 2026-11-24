import { recipe, t } from '../ui/system';

/**
 * Google identity branding: dark (#131314 fill, #8E918F outline, #E3E3E3 text) or light
 * (#FFFFFF fill, #747775 outline, #1F1F1F text), the four-colour G at 18px with 12px to the
 * label. Fixed colours on purpose: the button must look like Google's in any app theme.
 */
export const googleSignIn = recipe({
  name: 'google-sign-in',
  slots: ['button', 'fullWidth', 'logo', 'rest'],
  styles: {
    base: {
      button: {
        gap: '0.75rem',
        // Phones: a 44px touch target whatever the button size.
        '@media (max-width: 40rem)': { minHeight: '2.75rem' },
        backgroundColor: '#131314',
        color: '#e3e3e3',
        border: '1px solid #8e918f',
        fontWeight: t.fontWeight.medium.var,
        '&:hover': { backgroundColor: '#1f1f21', borderColor: '#a8aaa8' },
        '&[data-pressed], &:active': { backgroundColor: '#2a2a2c' },
        // Light treatment: Google's white button, the page's primary action on the dark hero.
        '&[data-google-variant="light"]': {
          backgroundColor: '#ffffff',
          color: '#1f1f1f',
          borderColor: '#747775',
          boxShadow: '0 1px 2px rgb(0 0 0 / 0.3)',
        },
        '&[data-google-variant="light"]:hover': { backgroundColor: '#f2f2f2', borderColor: '#747775' },
        '&[data-google-variant="light"][data-pressed], &[data-google-variant="light"]:active': {
          backgroundColor: '#e8e8e8',
        },
      },
      fullWidth: { width: '100%' },
      logo: { flexShrink: 0, display: 'block' },
      rest: {
        '&[data-compact]': {
          '@media (max-width: 40rem)': {
            position: 'absolute',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
            whiteSpace: 'nowrap',
          },
        },
      },
    },
  },
});
