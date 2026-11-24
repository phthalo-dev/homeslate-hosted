/**
 * Mantine → Var UI bridge.
 *
 * The `@homeslate/*` editor, theme editor and alarm editor are Mantine-based and get the
 * *display's* theme (brand colour, light/dark) from the single `MantineProvider` in `App.tsx`,
 * so the editor canvas previews the display faithfully. Their chrome (panels, inputs, buttons,
 * badges) should look like the rest of the app instead, so this module re-points Mantine's
 * CSS variables at Var UI tokens:
 *
 * - On the document root for every non-display surface (management + marketing). Var UI tokens
 *   follow the *app's* colour mode, so Mantine chrome follows it too whatever scheme Mantine was
 *   forced into.
 * - Re-applied on the editor's own chrome (`.Editor_pageActions`, `.WidgetPanel_panel`), because
 *   `ViewEditorPage` restores the display's Mantine variables on the canvas wrapper.
 *
 * Mantine resolves `var(--mantine-color-dark-6)` etc. where the variable is *defined*, so both the
 * palette steps and the semantic aliases are redefined here, not just the palette.
 */
import { global, t } from './system';
import { SITE_FONT } from './theme';

const accent = t.color.tone.accent;
const surface = t.color.background.surface.var;

/** Ten accent steps, light → dark, built from the theme's accent tokens. */
const accentSteps = [
  `color-mix(in oklch, ${accent.foreground.var} 10%, ${surface})`,
  `color-mix(in oklch, ${accent.foreground.var} 20%, ${surface})`,
  `color-mix(in oklch, ${accent.foreground.var} 35%, ${surface})`,
  `color-mix(in oklch, ${accent.foreground.var} 50%, ${surface})`,
  `color-mix(in oklch, ${accent.foreground.var} 70%, ${surface})`,
  accent.foreground.var,
  accent.background.var,
  `color-mix(in oklch, ${accent.background.var} 88%, ${t.color.text.primary.var})`,
  `color-mix(in oklch, ${accent.background.var} 78%, ${t.color.text.primary.var})`,
  `color-mix(in oklch, ${accent.background.var} 68%, ${t.color.text.primary.var})`,
];

const palette = (name: string, steps: string[]) =>
  Object.fromEntries(steps.map((value, index) => [`--mantine-color-${name}-${index}`, value]));

const accentFamily = (name: string) => ({
  ...palette(name, accentSteps),
  [`--mantine-color-${name}-filled`]: accent.background.var,
  [`--mantine-color-${name}-filled-hover`]: accentSteps[7],
  [`--mantine-color-${name}-light`]: accent.subtleBackground.var,
  [`--mantine-color-${name}-light-hover`]: `color-mix(in oklch, ${accent.foreground.var} 22%, transparent)`,
  [`--mantine-color-${name}-light-color`]: accent.foreground.var,
  [`--mantine-color-${name}-outline`]: accent.foreground.var,
  [`--mantine-color-${name}-outline-hover`]: accent.subtleBackground.var,
  [`--mantine-color-${name}-text`]: accent.foreground.var,
});

/** Placeholder text: quieter than `text.tertiary` so empty fields never read as filled in. */
export const placeholderColor = `color-mix(in oklch, ${t.color.text.tertiary.var} 72%, ${surface})`;

/** Mantine variables mapped to Var UI tokens. Exported for scoped re-application. */
export const mantineChromeVars: Record<string, string> = {
  // The display packages use `primaryColor: 'brand'`; chrome gets the app accent instead.
  ...accentFamily('brand'),
  ...Object.fromEntries(accentSteps.map((value, index) => [`--mantine-primary-color-${index}`, value])),
  '--mantine-primary-color-filled': accent.background.var,
  '--mantine-primary-color-filled-hover': accentSteps[7],
  '--mantine-primary-color-light': accent.subtleBackground.var,
  '--mantine-primary-color-light-hover': `color-mix(in oklch, ${accent.foreground.var} 22%, transparent)`,
  '--mantine-primary-color-light-color': accent.foreground.var,
  '--mantine-primary-color-contrast': accent.foregroundOnBackground.var,

  // Neutral palettes Mantine reads directly (dark scheme → `dark-*`, light scheme → `gray-*`).
  ...palette('dark', [
    t.color.text.primary.var,
    t.color.text.secondary.var,
    t.color.text.secondary.var,
    t.color.text.tertiary.var,
    t.color.border.default.var,
    t.color.background.subtle.var,
    surface,
    t.color.background.app.var,
    t.color.background.app.var,
    t.color.background.app.var,
  ]),
  ...palette('gray', [
    t.color.background.subtle.var,
    t.color.background.secondary.var,
    t.color.background.secondary.var,
    t.color.border.default.var,
    t.color.border.default.var,
    t.color.text.tertiary.var,
    t.color.text.secondary.var,
    t.color.text.secondary.var,
    t.color.text.primary.var,
    t.color.text.primary.var,
  ]),
  // White is the surface (light inputs, popovers) and the text on filled accent buttons.
  '--mantine-color-white': surface,
  '--mantine-color-black': t.color.text.primary.var,

  // Semantic aliases (Mantine defines these per scheme on :root, so they must be redefined).
  '--mantine-color-body': surface,
  '--mantine-color-text': t.color.text.primary.var,
  '--mantine-color-bright': t.color.text.primary.var,
  '--mantine-color-dimmed': t.color.text.secondary.var,
  '--mantine-color-placeholder': placeholderColor,
  '--mantine-color-anchor': accent.foreground.var,
  '--mantine-color-error': t.color.tone.danger.foreground.var,
  '--mantine-color-default': surface,
  '--mantine-color-default-hover': t.color.background.subtle.var,
  '--mantine-color-default-color': t.color.text.primary.var,
  '--mantine-color-default-border': t.color.border.default.var,
  '--mantine-color-disabled': t.color.background.subtle.var,
  '--mantine-color-disabled-color': t.color.text.tertiary.var,
  '--mantine-color-disabled-border': t.color.border.subtle.var,

  '--mantine-radius-default': t.radius.md.var,
  '--mantine-radius-xs': t.radius.sm.var,
  '--mantine-radius-sm': t.radius.sm.var,
  '--mantine-radius-md': t.radius.md.var,
  '--mantine-radius-lg': t.radius.lg.var,
  '--mantine-radius-xl': t.radius.xl.var,
  '--mantine-font-family': SITE_FONT,
  '--mantine-font-family-headings': SITE_FONT,
};

/**
 * The packages' own CSS reads the display theme's `--token-*` variables first (panel and
 * toolbar backgrounds, borders, text). Inside app chrome those must be app tokens too.
 */
const chromeTokenVars: Record<string, string> = {
  '--token-surface-card': surface,
  '--token-border-default': t.color.border.default.var,
  '--token-text-primary': t.color.text.primary.var,
  '--token-text-muted': t.color.text.secondary.var,
  '--token-text-inverse': accent.foregroundOnBackground.var,
  '--token-color-brand-500': accent.foreground.var,
  '--token-glow': accent.subtleBackground.var,
  '--token-font-base': SITE_FONT,
};

global.rules({
  // `html:root` outranks Mantine's own `:root[data-mantine-color-scheme]` rules, which are
  // injected after this stylesheet. The wall display keeps Mantine's display theme untouched.
  'html:root:not([data-hs-surface="display"])': mantineChromeVars,
  // Package chrome hosted by the app: the editor's toolbar and widget sidebar (inside the
  // canvas wrapper that restores the display's variables), and any `[data-hs-chrome]` host
  // (the Theme tab, the alarm editor).
  '[data-hs-chrome], .hs-view-editor__canvas :is(.Editor_pageActions, .WidgetPanel_panel)': {
    ...mantineChromeVars,
    ...chromeTokenVars,
  },
  // The editor toolbar mixes the package's Mantine "Background settings" button with our Var UI
  // actions: give the Mantine one Var UI's md outline-button metrics so the pair matches.
  // (Mantine sets its size variables inline, so the resolved properties are overridden instead.)
  '.hs-view-editor__canvas .Editor_pageActions .mantine-Button-root': {
    height: t.size.control.md.var,
    minHeight: t.size.control.md.var,
    paddingInline: t.space.md.var,
    fontSize: t.fontSize.md.var,
    fontWeight: t.fontWeight.medium.var,
    borderRadius: t.radius.md.var,
    backgroundColor: 'transparent',
    // Var UI's neutral outline paint (semanticTone `outline`): text mixed into the border.
    border: `1px solid color-mix(in srgb, ${t.color.text.primary.var} 38%, ${t.color.border.default.var})`,
    color: t.color.text.primary.var,
  },
  '.hs-view-editor__canvas .Editor_pageActions .mantine-Button-root:hover': {
    backgroundColor: `color-mix(in srgb, ${t.color.text.primary.var} 18%, ${t.color.background.surface.var})`,
    borderColor: t.color.text.primary.var,
  },
  '.hs-view-editor__canvas .Editor_pageActions .mantine-Button-label': { fontWeight: 'inherit' },
  '.hs-view-editor__canvas .Editor_pageActions .mantine-Button-section[data-position="left"]': {
    marginInlineEnd: t.space.xs.var,
  },
});
