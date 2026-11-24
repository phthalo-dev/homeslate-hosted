/**
 * Document-level rules (formerly App.css).
 *
 * Two audiences share one SPA:
 * - The **wall display** (`@homeslate/display`, Mantine-based) reads `--token-*`
 *   variables. Those defaults live here so the viewer has a sane look before its
 *   theme provider stamps the full namespace.
 * - The **management app + marketing site** use Var UI tokens. Their surfaces
 *   are set per page; `body` only gets the base font and background.
 */
import { textField } from '@var-ui/core';
import { global, keyframes, t } from './system';
import { SITE_FONT } from './theme';
import { placeholderColor } from './mantineBridge.styles';

const COSMOS_CANVAS = [
  'radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
  'radial-gradient(ellipse at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
  'radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)',
  '#0a0a0f',
].join(', ');

/** Display-package defaults (Cosmos theme) — kept so the viewer never flashes unstyled. */
const displayTokenDefaults = {
  '--token-surface-card': 'rgba(30, 30, 40, 0.6)',
  '--token-border-default': 'rgba(255, 255, 255, 0.08)',
  '--token-text-primary': '#e8e8f0',
  '--token-text-muted': '#6c6c7e',
  '--token-color-brand-500': '#6366f1',
  '--token-color-brand-500-rgb': '99, 102, 241',
  '--token-glow': 'rgba(99, 102, 241, 0.3)',
  '--token-font-base': SITE_FONT,
  '--token-spacing-0': '0px',
  '--token-spacing-1': '4px',
  '--token-spacing-2': '8px',
  '--token-spacing-3': '12px',
  '--token-spacing-4': '16px',
  '--token-spacing-6': '24px',
  '--token-spacing-8': '32px',
  '--token-widget-padding': '12px',
  '--token-widget-radius': '12px',
} as const;

global.rules({
  ':root': {
    ...displayTokenDefaults,
    '--token-surface-canvas': COSMOS_CANVAS,
    '--token-color-brand-600': '#a855f7',
  },
  // Boot fallback: auth/pair pages render before the display ThemeProvider mounts.
  ':root[data-theme-fallback]': {
    ...displayTokenDefaults,
    '--token-surface-canvas': '#0a0a0f',
    '--token-surface-overlay': 'rgba(30, 30, 40, 0.6)',
    '--token-focus-ring': 'rgba(99, 102, 241, 0.3)',
    '--token-interactive-primary-bg': '#6366f1',
    '--token-interactive-primary-fg': '#ffffff',
  },
  // Kiosk defaults: tablets on the wall should not select text or double-tap zoom.
  '*': {
    boxSizing: 'border-box',
    touchAction: 'manipulation',
    WebkitUserSelect: 'none',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  'p, span, h1, h2, h3, h4, h5, h6, label, li, td, th, dt, dd, code, input, textarea': {
    WebkitUserSelect: 'text',
    userSelect: 'text',
  },

  html: { overscrollBehavior: 'none' },
  'html, body, #root': {
    height: '100%',
    minHeight: '100dvh',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
  },
  // Marketing and legal pages scroll like a normal website.
  'html.public-site, html.public-site body, html.public-site #root': {
    height: 'auto',
    minHeight: '100dvh',
    overflow: 'auto',
  },

  body: {
    fontFamily: SITE_FONT,
    background: 'var(--token-surface-canvas, #0a0a0f)',
    backgroundAttachment: 'fixed',
    overscrollBehavior: 'none',
  },
  // Management + marketing: the app background, never the display canvas or Mantine's grey
  // body (which is what flashed behind the route spinner).
  'html:not([data-hs-surface="display"]) body': {
    background: t.color.background.app.var,
  },
  // Marketing, sign-in and pairing pages are always dark, whatever the app preference.
  'html[data-hs-surface="public"], html[data-hs-surface="public"] body': {
    background: 'oklch(0.155 0.01 262)',
    colorScheme: 'dark',
  },

  // Token colours, so scrollbars follow pinned and system colour modes alike.
  '::-webkit-scrollbar': { width: '8px', height: '8px' },
  '::-webkit-scrollbar-track': { background: 'transparent', borderRadius: '4px' },
  '::-webkit-scrollbar-thumb': { background: t.color.border.default.var, borderRadius: '4px' },
  '::-webkit-scrollbar-thumb:hover': { background: t.color.border.strong.var },

  '::selection': { background: 'rgba(34, 174, 194, 0.35)', color: 'inherit' },

  // Body copy: no orphans or lines that start with a dangling word.
  'p, li, dd, figcaption': { textWrap: 'pretty' },

  // Placeholders read as hints, not as filled-in values.
  'input::placeholder, textarea::placeholder': { color: placeholderColor, opacity: 1 },
});

/**
 * Var UI `Dialog` workarounds.
 *
 * - The content slot is a grid with an implicit `auto` column, so one wide child (a field's
 *   min-width, a long URL, a nowrap button row) widens the column past the popup: the header's
 *   close button and the actions get clipped. A `minmax(0, 1fr)` column keeps everything inside.
 * - After `close()` the `<dialog>` stays in the top layer for its exit transition; stop it from
 *   taking pointer events meanwhile so the next click lands on the page.
 */
/**
 * Var UI 0.14 fields have no invalid styling: `aria-invalid` / `data-invalid` change nothing,
 * so an errored input keeps the default border and the cyan focus ring. Paint it danger.
 */
const danger = t.color.tone.danger.foreground.var;
global.rules({
  '.var-ui-text-field__input[aria-invalid="true"]': {
    [textField.vars.inputBorder.name]: danger,
    outlineColor: danger,
  },
});

/**
 * Mantine's stylesheet is unlayered, so its globals outrank everything Var UI puts in cascade
 * layers. `input, button, textarea, select { font: inherit }` flattened every Var UI control to
 * the body font (16px / 400). Roll Var UI controls back to their own layered font.
 */
global.rules({
  ':where(button, input, select, textarea)[class*="var-ui-"]': { font: 'revert-layer' },
});

global.rules({
  '.var-ui-dialog__content': { gridTemplateColumns: 'minmax(0, 1fr)' },
  '.var-ui-dialog__header': { minWidth: 0 },
  '.var-ui-dialog__heading': { minWidth: 0, overflowWrap: 'anywhere' },
  'dialog.var-ui-dialog__popup:not([open])': { pointerEvents: 'none' },
});

/** Used by `@homeslate/display` widgets (`.animate-in`, `.shimmer`). */
const fadeIn = keyframes.create('fadeIn', {
  from: { opacity: 0, transform: 'translateY(10px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});
keyframes.create('pulse', {
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
});
const shimmer = keyframes.create('shimmer', {
  '0%': { backgroundPosition: '-200% 0' },
  '100%': { backgroundPosition: '200% 0' },
});

global.rules({
  '.animate-in': { animation: `${fadeIn} 0.3s ease-out forwards` },
  '.shimmer': {
    background:
      'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0) 100%)',
    backgroundSize: '200% 100%',
    animation: `${shimmer} 2s infinite`,
  },
});
