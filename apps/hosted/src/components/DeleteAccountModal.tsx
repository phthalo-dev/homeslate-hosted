import { dialogAutoFocus } from './dialogFocus';
import { ConfirmDialog } from './ConfirmDialog';
import { useState } from 'react';
import { Alert, AlertDialog, Button, Stack, Text, TextField } from '@var-ui/react';

interface Props {
  opened: boolean;
  onClose: () => void;
  email: string;
  onConfirm: () => Promise<void>;
}

export function DeleteAccountModal({ opened, onClose, email, onConfirm }: Props) {
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matches = confirmEmail.trim().toLowerCase() === email.trim().toLowerCase();

  const handleClose = () => {
    if (deleting) return;
    setConfirmEmail('');
    setError(null);
    onClose();
  };

  const handleDelete = async () => {
    if (!matches) return;
    setDeleting(true);
    setError(null);
    try {
      await onConfirm();
      setConfirmEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      open={opened}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      title="Delete your account?"
      size="xl"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleDelete();
        }}
      >
        <Stack gap="md">
          <Text size="sm" tone="secondary">
            This permanently deletes your Homeslate account, the displays you own, their saved
            views, and stored Google tokens. A paid subscription is canceled and your billing
            details are removed. Displays others shared with you are not affected.
          </Text>
          <Text size="sm" weight="medium">
            This cannot be undone.
          </Text>
          <TextField
            label={
              <>
                Type <strong>{email}</strong> to confirm
              </>
            }
            value={confirmEmail}
            onValueChange={setConfirmEmail}
            disabled={deleting}
            autoComplete="off"
            spellCheck={false}
          />
          {error && (
            <Alert tone="danger" role="alert">
              {error}
            </Alert>
          )}
          <AlertDialog.Actions>
            <Button type="button" onClick={handleClose} disabled={deleting} ref={dialogAutoFocus}>
              Cancel
            </Button>
            <Button type="submit" tone="danger" appearance="solid" loading={deleting} disabled={!matches}>
              Delete account
            </Button>
          </AlertDialog.Actions>
        </Stack>
      </form>
    </ConfirmDialog>
  );
}
