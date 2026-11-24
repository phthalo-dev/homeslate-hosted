import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Dialog,
  IconButton,
  List,
  Spinner,
  Stack,
  Text,
  TextField,
} from '@var-ui/react';
import { notify } from './AppToasts';
import { IconArrowBackUp, IconTrash, IconMail } from '@tabler/icons-react';
import { Hint } from './Hint';
import { dialogAutoFocus } from './dialogFocus';
import { inviteModal as s } from './InviteModal.styles';
import { apiClient, ApiError } from '../services/apiClient';
import type {
  CollaboratorDto,
  InviteCreateRequest,
  InviteCreateResponse,
  InviteListResponse,
  InviteSummaryDto,
} from '../types/api';

/** Something@something.tld — enough to catch typos before the server does. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  opened: boolean;
  onClose: () => void;
  displayId: string;
  displayName: string;
  accessToken: string;
}

/**
 * Two stacked lines inside a `List.Item` label. (Var UI's `label` + `description` sit side by
 * side on one row and each truncate, which cut both the address and the status.)
 */
function PersonLines({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <span className={s.person}>
      <span className={s.personPrimary} title={primary}>
        {primary}
      </span>
      <span className={s.personSecondary}>{secondary}</span>
    </span>
  );
}

export function InviteModal({ opened, onClose, displayId, displayName, accessToken }: Props) {
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [revokedEmail, setRevokedEmail] = useState<string | null>(null);

  const [invites, setInvites] = useState<InviteSummaryDto[]>([]);
  const [collaborators, setCollaborators] = useState<CollaboratorDto[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInvites = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await apiClient.get<InviteListResponse>('/api/invites', {
        token: accessToken,
        query: { displayId },
      });
      setInvites(data.invites);
      setCollaborators(data.collaborators);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [accessToken, displayId]);

  useEffect(() => {
    if (opened) {
      loadInvites();
      setEmail('');
      setInviteError(null);
      setInviteSuccess(null);
      setRevokedEmail(null);
    }
  }, [opened, loadInvites]);

  const emailRef = useRef<HTMLInputElement | null>(null);
  const setEmailInput = useCallback((element: HTMLInputElement | null) => {
    emailRef.current = element;
    dialogAutoFocus(element);
  }, []);

  const handleInvite = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    // Our own check and message on submit, instead of the browser's constraint bubble.
    if (!EMAIL_PATTERN.test(trimmed)) {
      setInviteError('Enter a full email address, like name@gmail.com.');
      emailRef.current?.focus();
      return;
    }
    setInviting(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      const data = await apiClient.post<InviteCreateResponse, InviteCreateRequest>(
        '/api/invites',
        {
          token: accessToken,
          body: { displayId, email: trimmed },
        }
      );
      if (!data.invited_email) {
        setInviteError('Couldn’t send the invite. Try again.');
      } else {
        setEmail('');
        setInviteSuccess(`Invite sent to ${data.invited_email}`);
        await loadInvites();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setInviteError(err.message);
      } else {
        setInviteError('Couldn’t reach Homeslate. Check your connection and try again.');
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRevokeInvite = async (inviteEmail: string) => {
    try {
      await apiClient.delete<unknown>('/api/invites', {
        token: accessToken,
        query: { displayId, email: inviteEmail },
      });
      setInviteSuccess(null);
      setRevokedEmail(inviteEmail);
      await loadInvites();
    } catch {
      notify({ tone: 'danger', title: 'Could not revoke the invite', description: 'Try again in a moment.' });
    }
  };

  // Undo for a revoke: send the same invite again. (Lives inside the dialog: anything outside a
  // modal <dialog> is inert while it is open.)
  // Keep keyboard focus in place: the revoked row's button is gone, so go to Undo; after Undo
  // (which removes itself) go back to the email field.
  const undoRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (revokedEmail) undoRef.current?.focus();
  }, [revokedEmail]);

  const undoRevoke = async () => {
    const restoreEmail = revokedEmail;
    if (!restoreEmail) return;
    setRevokedEmail(null);
    emailRef.current?.focus();
    try {
      await apiClient.post<InviteCreateResponse, InviteCreateRequest>('/api/invites', {
        token: accessToken,
        body: { displayId, email: restoreEmail },
      });
      await loadInvites();
    } catch {
      notify({ tone: 'danger', title: 'Could not restore the invite', description: 'Send it again from the field above.' });
    }
  };

  const handleRemoveCollaborator = async (collaboratorRowId: string) => {
    try {
      await apiClient.delete<unknown>('/api/invites', {
        token: accessToken,
        query: { displayId, collaboratorId: collaboratorRowId },
      });
      await loadInvites();
    } catch {
      notify({ tone: 'danger', title: 'Could not remove access', description: 'Try again in a moment.' });
    }
  };

  const hasPeople = collaborators.length > 0 || invites.length > 0;

  return (
    <Dialog
      open={opened}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={`Share “${displayName}” with your household`}
      description="Invite a Google account. They can edit views and settings once they sign in."
      size="xl"
    >
      <Stack gap="lg">
        <form
          className={s.form}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (email.trim()) void handleInvite();
          }}
        >
          <TextField
            label="Email address"
            type="email"
            placeholder="name@gmail.com"
            value={email}
            onValueChange={(value) => {
              setEmail(value);
              setInviteError(null);
              setInviteSuccess(null);
            }}
            errorMessage={inviteError ?? undefined}
            className={s.emailField}
            autoComplete="email"
            validationBehavior="aria"
            ref={setEmailInput}
          />
          <Button
            type="submit"
            tone="accent"
            appearance="solid"
            loading={inviting}
            disabled={!email.trim()}
            className={s.sendButton}
          >
            Send invite
          </Button>
        </form>
        {inviteSuccess && (
          <Alert tone="success" role="status">
            {inviteSuccess}
          </Alert>
        )}
        {revokedEmail && (
          <div className={s.undoRow} role="status">
            <Text size="sm" className={s.undoText}>
              Invite to {revokedEmail} revoked.
            </Text>
            <Button size="sm" appearance="ghost" tone="accent" onClick={() => void undoRevoke()} ref={undoRef}>
              <IconArrowBackUp size={16} aria-hidden />
              Undo
            </Button>
          </div>
        )}

        {loading && !hasPeople ? (
          <div className={s.loading}>
            <Spinner size="sm" label="Loading people with access" />
          </div>
        ) : null}

        {collaborators.length > 0 && (
          <List header="Has access" hasDividers density="compact">
            {collaborators.map((c) => (
              <List.Item
                key={c.id}
                label={<PersonLines primary={c.name} secondary={c.email} />}
                startContent={<Avatar src={c.picture || undefined} name={c.name} alt="" size="sm" />}
                endContent={
                  <Hint label={`Remove ${c.name}`}>
                    <IconButton
                      icon={<IconTrash size={15} />}
                      aria-label={`Remove access for ${c.name}`}
                      size="sm"
                      appearance="ghost"
                      tone="danger"
                      onClick={() => void handleRemoveCollaborator(c.id)}
                    />
                  </Hint>
                }
              />
            ))}
          </List>
        )}

        {invites.length > 0 && (
          <List header="Waiting to sign in" hasDividers density="compact">
            {invites.map((inv) => (
              <List.Item
                key={inv.id}
                label={<PersonLines primary={inv.invited_email} secondary="Access starts when they next sign in" />}
                startContent={<IconMail size={18} className={s.mailIcon} aria-hidden />}
                endContent={
                  <Hint label="Revoke invite">
                    <IconButton
                      icon={<IconTrash size={15} />}
                      aria-label={`Revoke invite for ${inv.invited_email}`}
                      size="sm"
                      appearance="ghost"
                      tone="danger"
                      onClick={() => void handleRevokeInvite(inv.invited_email)}
                    />
                  </Hint>
                }
              />
            ))}
          </List>
        )}

        {!loading && !hasPeople && (
          <Text size="sm" tone="secondary" className={s.empty}>
            Only you can see and edit this display right now.
          </Text>
        )}
      </Stack>
    </Dialog>
  );
}
