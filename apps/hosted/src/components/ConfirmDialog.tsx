import type { ReactNode } from 'react';
import { AlertDialog } from '@var-ui/react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Backdrop press closes it (off by default, like `AlertDialog`). */
  dismissable?: boolean;
}

/**
 * `AlertDialog` assembled from its parts so the popup really is `role="alertdialog"`.
 * (The `title` shorthand on `AlertDialog` renders a plain `Dialog.Popup`, which drops the role.)
 * Mark the safe action with `ref={dialogAutoFocus}` so it has focus when the dialog opens.
 */
export function ConfirmDialog({ open, onOpenChange, title, children, size = 'lg', dismissable }: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange} dismissable={dismissable}>
      <AlertDialog.Popup size={size}>
        <AlertDialog.Header>
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Close />
        </AlertDialog.Header>
        {children}
      </AlertDialog.Popup>
    </AlertDialog>
  );
}
