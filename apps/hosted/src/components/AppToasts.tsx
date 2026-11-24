import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { Button, Icon } from '@var-ui/react';
import { toast as toastRecipe } from '@var-ui/core';
import { mergeProps } from 'typestyles';
import { appToasts as s } from './AppToasts.styles';

/**
 * The app's one toast system, drawn with Var UI's own `toast` recipe (same placement, chrome
 * and motion as `ToastProvider`). It exists because Var UI's region:
 * - renders every toast as `role="alertdialog"` + `role="alert"`, so a "Saved" toast interrupts
 *   screen readers like an error would; here only danger toasts are alerts, the rest `status`;
 * - has no action slot, so there is no way to offer Undo.
 */
type Tone = 'success' | 'info' | 'warning' | 'danger';

const TONE_ICON = { success: 'success', info: 'info', warning: 'warning', danger: 'error' } as const;

export interface NotifyInput {
  tone?: Tone;
  title: string;
  description?: string;
  /** Default 4s, or 10s when there is an action. 0 keeps it until dismissed. */
  durationMs?: number;
  action?: { label: string; onAction: () => void };
}

interface Entry extends NotifyInput {
  id: number;
}

const MAX_VISIBLE = 3;
let entries: Entry[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export function notify(input: NotifyInput): number {
  const id = nextId++;
  entries = [...entries, { ...input, id }].slice(-MAX_VISIBLE);
  emit();
  return id;
}

export function dismissToast(id: number) {
  if (!entries.some((entry) => entry.id === id)) return;
  entries = entries.filter((entry) => entry.id !== id);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function ToastItem({ entry }: { entry: Entry }) {
  const tone = entry.tone ?? 'info';
  const t = toastRecipe({ tone, appearance: 'subtle' });
  const paused = useRef(false);
  const duration = entry.durationMs ?? (entry.action ? 10_000 : 4_000);

  useEffect(() => {
    if (duration === 0) return;
    let remaining = duration;
    let last = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      if (!paused.current) remaining -= now - last;
      last = now;
      if (remaining <= 0) dismissToast(entry.id);
    }, 200);
    return () => clearInterval(timer);
  }, [duration, entry.id]);

  return (
    <div
      {...mergeProps(t.item)}
      role={tone === 'danger' ? 'alert' : 'status'}
      aria-atomic="true"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
    >
      <span {...mergeProps(t.icon)}>
        <Icon name={TONE_ICON[tone]} />
      </span>
      <div {...mergeProps(t.body)}>
        <div {...mergeProps(t.title)}>{entry.title}</div>
        {entry.description ? <div {...mergeProps(t.description)}>{entry.description}</div> : null}
        {entry.action ? (
          <div className={s.actions}>
            <Button
              size="sm"
              appearance="outline"
              onClick={() => {
                entry.action?.onAction();
                dismissToast(entry.id);
              }}
            >
              {entry.action.label}
            </Button>
          </div>
        ) : null}
      </div>
      <button type="button" {...mergeProps(t.close)} aria-label="Dismiss" onClick={() => dismissToast(entry.id)}>
        <Icon name="close" size="sm" />
      </button>
    </div>
  );
}

/** Mount once near the root (replaces Var UI's `ToastProvider` region). */
export function AppToastHost() {
  const visible = useSyncExternalStore(subscribe, () => entries, () => entries);
  const region = toastRecipe({ placement: 'bottom-end' });
  // Top layer like Var UI's region, so toasts paint above dialog backdrops.
  const regionRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    el.setAttribute('popover', 'manual');
    if (!el.matches(':popover-open')) el.showPopover();
  }, []);

  if (visible.length === 0) return null;
  return (
    <div ref={regionRef} {...mergeProps(region.region)} role="region" aria-label="Notifications">
      {visible.map((entry) => (
        <ToastItem key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
