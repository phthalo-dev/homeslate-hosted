import type { ReactElement, ReactNode } from 'react';
import { Tooltip } from '@var-ui/react';

/**
 * One-line tooltip around a single focusable control.
 *
 * `<Hint label="Rename"><IconButton … /></Hint>` instead of the four-part
 * `Tooltip / Tooltip.Trigger / Tooltip.Popup` compound.
 */
export function Hint({ label, children }: { label: ReactNode; children: ReactElement }) {
  return (
    <Tooltip>
      <Tooltip.Trigger>{children}</Tooltip.Trigger>
      <Tooltip.Popup>{label}</Tooltip.Popup>
    </Tooltip>
  );
}
