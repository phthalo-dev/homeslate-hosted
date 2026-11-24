/**
 * Homeslate's Var UI theme.
 *
 * Built on Var UI's default token tree with three changes:
 * - **Slate surfaces** — cool blue-grey neutrals in dark mode (the product is
 *   "the slate on the wall"), instead of Var UI's warm defaults.
 * - **Teal accent** — taken from the Homeslate mark (`#22aec2`).
 * - **Public Sans** for body and display type (loaded in `index.html`).
 *
 * Plus a `brand` namespace for marketing-only colours (the warm "lamp" glow).
 */
import { defaultTheme } from '@var-ui/core';

export const SITE_FONT = '"Public Sans", "Helvetica Neue", Arial, sans-serif';

/**
 * `localStorage` key for the app's light/dark/system preference (`DesignSystemProvider`).
 * `index.html` reads the same key before first paint.
 */
export const COLOR_MODE_STORAGE_KEY = 'homeslate-color-mode';

/** Accent hue, sampled from the Homeslate mark. */
const ACCENT_LIGHT = 'oklch(0.52 0.095 214)';
const ACCENT_DARK = 'oklch(0.8 0.105 207)';

// `defaultTheme.override` (not `createDesignTheme`): the child theme carries the
// full token tree, so it can replace `theme-var-ui-default` on <html>.
export const homeslateTheme = defaultTheme.override({
  name: 'homeslate',
  tokens: {
    fontFamily: {
      body: SITE_FONT,
      display: SITE_FONT,
    },
    size: {
      // Var UI's fields keep a hard 15rem floor (var-ui#293), which pushes them out of
      // narrow dialogs and phone layouts. Keep the floor, but never wider than the container.
      field: {
        minWidth: 'min(15rem, 100%)',
        minWidthCompact: 'min(10rem, 100%)',
      },
    },
    color: {
      background: {
        app: { light: 'oklch(0.985 0.003 250)', dark: 'oklch(0.155 0.01 262)' },
        surface: { light: 'oklch(1 0 0)', dark: 'oklch(0.185 0.011 262)' },
        subtle: { light: 'oklch(0.965 0.005 250)', dark: 'oklch(0.215 0.012 262)' },
        elevated: { light: 'oklch(1 0 0)', dark: 'oklch(0.235 0.013 262)' },
        secondary: { light: 'oklch(0.94 0.007 250)', dark: 'oklch(0.27 0.014 262)' },
        tertiary: { light: 'oklch(0.9 0.009 250)', dark: 'oklch(0.33 0.015 262)' },
      },
      text: {
        primary: { light: 'oklch(0.2 0.015 260)', dark: 'oklch(0.955 0.005 250)' },
        secondary: { light: 'oklch(0.47 0.018 258)', dark: 'oklch(0.74 0.016 255)' },
      },
      border: {
        default: { light: 'oklch(0.9 0.008 255)', dark: 'oklch(0.29 0.014 262)' },
        strong: { light: 'oklch(0.83 0.01 255)', dark: 'oklch(0.38 0.016 262)' },
        subtle: { light: 'oklch(0.94 0.006 255)', dark: 'oklch(0.245 0.012 262)' },
      },
      link: {
        hover: { light: 'oklch(0.44 0.09 214)', dark: 'oklch(0.88 0.08 207)' },
      },
      tone: {
        accent: {
          foreground: { light: ACCENT_LIGHT, dark: ACCENT_DARK },
          background: { light: 'oklch(0.5 0.095 214)', dark: 'oklch(0.76 0.11 207)' },
          subtleBackground: {
            light: `color-mix(in oklch, ${ACCENT_LIGHT} 11%, transparent)`,
            dark: `color-mix(in oklch, ${ACCENT_DARK} 13%, transparent)`,
          },
          border: {
            light: `color-mix(in oklch, ${ACCENT_LIGHT} 38%, transparent)`,
            dark: `color-mix(in oklch, ${ACCENT_DARK} 36%, transparent)`,
          },
          foregroundOnBackground: { light: 'oklch(0.99 0 0)', dark: 'oklch(0.18 0.03 225)' },
        },
      },
    },
  },
  extend: {
    brand: {
      lamp: '#d4a574',
      lampGlow: 'rgba(212, 165, 116, 0.18)',
      ink: '#09090d',
      mark: { light: '#11181d', dark: '#f4f5f6' },
      markAccent: { light: '#0b9cae', dark: '#22aec2' },
      /** Tile behind the framed mark (app icon look). */
      markFrame: { light: '#ffffff', dark: '#11181d' },
    },
  },
});

/** `homeslateTheme.tokens.brand.*` refs (`brand.lamp.var` → `var(--var-ui-brand-lamp)`). */
export const brand = homeslateTheme.tokens.brand;
