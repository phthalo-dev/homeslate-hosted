/**
 * Colour scheme the *whole page* should use for Mantine while a full-screen display surface is
 * mounted (the wall display, or the in-app preview). Everywhere else Mantine follows the app's
 * own Var UI colour mode, and display-coloured regions (the editor canvas) scope the display's
 * scheme to their own container.
 */
import { useSyncExternalStore } from 'react';
import type { ColorMode } from '@homeslate/schema';

let current: ColorMode | null = null;
const listeners = new Set<() => void>();

export function setDisplaySurfaceScheme(next: ColorMode | null) {
  if (next === current) return;
  current = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useDisplaySurfaceScheme(): ColorMode | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}
