import { dialogAutoFocus } from './dialogFocus';
import { useState } from 'react';
import { Button, Code, Dialog, Stack, Text, TextField } from '@var-ui/react';
import { apiClient, ApiError } from '../services/apiClient';
import type { ClaimDisplayRequest, ClaimDisplayResponse } from '../types/api';
import { registerDevice as s } from './RegisterDeviceModal.styles';

interface Props {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accessToken: string;
  addDisplay: (id: string, displayId: string, name: string) => void;
}

const normalizeCode = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);

export function RegisterDeviceModal({ opened, onClose, onSuccess, accessToken, addDisplay }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setCode('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    const trimmed = normalizeCode(code);
    if (trimmed.length !== 6) {
      setError('Enter the 6-character code shown on the tablet.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await apiClient.post<ClaimDisplayResponse, ClaimDisplayRequest>('/api/claim-display', {
        token: accessToken,
        body: { code: trimmed },
      });
      addDisplay(data.id, data.display_id, data.name);
      setCode('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={opened}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      title="Pair a tablet"
      size="lg"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <Stack gap="lg">
          <ol className={s.steps}>
            <li>
              <Text as="span" size="sm">
                On the tablet, open <Code>homeslate.dev/pair</Code> in the browser.
              </Text>
            </li>
            <li>
              <Text as="span" size="sm">
                Type the 6-character code it shows. The tablet joins your account as a new display.
              </Text>
            </li>
          </ol>
          <TextField
            label="Pairing code"
            placeholder="ABC123"
            value={code}
            onValueChange={(value) => {
              setCode(normalizeCode(value));
              setError(null);
            }}
            maxLength={6}
            errorMessage={error ?? undefined}
            autoComplete="one-time-code"
            autoCapitalize="characters"
            spellCheck={false}
            className={s.codeField}
            ref={dialogAutoFocus}
          />
          <Dialog.Actions>
            <Button type="button" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" tone="accent" appearance="solid" loading={loading} disabled={code.length !== 6}>
              Pair tablet
            </Button>
          </Dialog.Actions>
        </Stack>
      </form>
    </Dialog>
  );
}
