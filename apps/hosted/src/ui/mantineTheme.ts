/**
 * The Mantine theme the `@homeslate/*` packages render with: the selected display's theme
 * (brand colour, radii) so widgets preview exactly as they look on the wall.
 *
 * Management chrome maps these variables onto Var UI tokens (`mantineBridge.styles.ts`);
 * `displayMantineVars` restores the display's own values on a subtree (the editor canvas).
 */
import {
  createTheme,
  DEFAULT_THEME,
  defaultCssVariablesResolver,
  mergeMantineTheme,
  type MantineThemeOverride,
} from '@mantine/core';
import { mantineThemeFromResolved, type ResolvedTheme } from '@homeslate/display/canvas';
import type { ColorMode } from '@homeslate/schema';
import { SITE_FONT } from './theme';

export function buildDisplayMantineTheme(resolved: ResolvedTheme): MantineThemeOverride {
  return createTheme({
    ...mantineThemeFromResolved(resolved),
    fontFamily: SITE_FONT,
    headings: { fontFamily: SITE_FONT },
    defaultRadius: 'md',
  });
}

/**
 * Mantine's own CSS variables for `theme` in `colorMode`, as an inline-style object. Set on a
 * wrapper to give its subtree the display's Mantine look back under the Var UI bridge.
 */
export function displayMantineVars(theme: MantineThemeOverride, colorMode: ColorMode): Record<string, string> {
  const { variables, light, dark } = defaultCssVariablesResolver(mergeMantineTheme(DEFAULT_THEME, theme));
  return { ...variables, ...(colorMode === 'dark' ? dark : light) };
}
