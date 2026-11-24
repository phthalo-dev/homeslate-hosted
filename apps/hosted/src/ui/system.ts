/**
 * App-owned TypeStyles instance. Every hosted-app style (pages, layouts, the
 * marketing site) is authored through these helpers so class names read
 * `hs-<name>` in DevTools and live next to Var UI's `var-ui-*` classes.
 *
 * Styles are unlayered on purpose: they sit above Var UI's
 * `reset → base → tokens → components → overrides → utilities` layers, so an
 * app class on a Var UI component wins without specificity tricks.
 *
 * Every module that calls `style` / `recipe` / `global` must be imported from
 * `src/typestyles-entry.ts` so `@typestyles/vite` extracts it at build time.
 */
import { createTypeStyles, cx, keyframes } from 'typestyles';
import { designTokens } from '@var-ui/core';

export const { style, recipe, global } = createTypeStyles({ scopeId: 'hs' });

export { cx, keyframes };

/** Var UI design token refs (`t.space.md` → `var(--var-ui-space-md)`). */
export const t = designTokens;
