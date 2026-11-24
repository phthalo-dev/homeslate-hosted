import { IconAlertTriangle, IconCloudCheck, IconCloudUpload } from '@tabler/icons-react';
import { saveStatus as s } from './SaveStatus.styles';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const LABELS: Record<SaveState, string> = {
  idle: 'Changes save automatically',
  saving: 'Saving…',
  saved: 'All changes saved',
  error: 'Not saved — check your connection',
};

/**
 * Inline autosave status ("Saving…" → "All changes saved"), announced politely.
 * `compact` hides the text on narrow screens and keeps the icon.
 */
export function SaveStatus({ state, compact = false }: { state: SaveState; compact?: boolean }) {
  const Icon = state === 'saving' ? IconCloudUpload : state === 'error' ? IconAlertTriangle : IconCloudCheck;
  return (
    <span className={s.root} data-state={state} data-compact={compact || undefined} role="status" aria-live="polite">
      <Icon size={16} aria-hidden />
      <span className={s.label} data-compact={compact || undefined}>
        {LABELS[state]}
      </span>
    </span>
  );
}
