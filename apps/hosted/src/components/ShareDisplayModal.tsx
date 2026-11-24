import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { IconCheck, IconCopy, IconExternalLink, IconLock } from '@tabler/icons-react';
import { Button, CopyButton, Dialog, InputGroup, InputGroupInput, Stack, Text } from '@var-ui/react';
import { shareDisplay as s } from './ShareDisplayModal.styles';
import { markTabletStepDone } from './GetStarted';

interface Props {
  opened: boolean;
  onClose: () => void;
  displayId: string;
  displayName: string;
  /** The display asks for a PIN before showing anything. */
  passcodeEnabled?: boolean;
}

/** How to copy a selected link by hand on this device. */
function manualCopyHint(): string {
  if (typeof window === 'undefined') return 'Copy the selected link.';
  if (window.matchMedia?.('(pointer: coarse)').matches) return 'Long-press the link above to copy it.';
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || navigator.platform || navigator.userAgent;
  return /mac|iphone|ipad/i.test(platform) ? 'The link is selected — press ⌘C to copy it.' : 'The link is selected — press Ctrl+C to copy it.';
}

export function ShareDisplayModal({ opened, onClose, displayId, displayName, passcodeEnabled = false }: Props) {
  const url = `${window.location.origin}/?display=${displayId}`;
  const linkRef = useRef<HTMLInputElement>(null);
  const [copyFailed, setCopyFailed] = useState(false);

  // Opening the link/QR counts as "put it on a tablet" for the getting-started checklist.
  useEffect(() => {
    if (opened) markTabletStepDone();
  }, [opened]);

  // Clipboard access can be blocked (permissions, embedded browsers): fall back to a
  // selected field and the keyboard shortcut.
  const selectLink = () => {
    linkRef.current?.focus();
    linkRef.current?.select();
  };

  return (
    <Dialog
      open={opened}
      onOpenChange={(open) => {
        if (!open) {
          setCopyFailed(false);
          onClose();
        }
      }}
      title={`Open “${displayName}” on a tablet`}
      description="Scan the code with the tablet's camera, or paste the link into its browser."
      size="xl"
    >
      <Stack gap="lg">
        <figure className={s.qrFrame}>
          <div className={s.qr}>
            <QRCodeSVG value={url} size={184} marginSize={0} title={`QR code for ${displayName}`} />
          </div>
          <figcaption className={s.caption}>
            {passcodeEnabled ? (
              <Text as="span" size="xs" tone="secondary" className={s.captionLine}>
                <IconLock size={12} aria-hidden />
                The tablet asks for this display’s PIN before showing it
              </Text>
            ) : (
              <Text as="span" size="xs" tone="secondary">
                Anyone with this link can view the display
              </Text>
            )}
          </figcaption>
        </figure>

        <div className={s.linkBlock}>
          <InputGroup label="Display link" className={s.linkField}>
            <InputGroupInput
              ref={linkRef}
              value={url}
              readOnly
              aria-label="Display link"
              aria-describedby={copyFailed ? 'share-copy-fallback' : undefined}
              onFocus={(event) => event.currentTarget.select()}
            />
          </InputGroup>
          <div className={s.linkActions}>
            <CopyButton
              value={url}
              onCopied={() => setCopyFailed(false)}
              onCopyError={() => {
                setCopyFailed(true);
                selectLink();
              }}
            >
              {({ copied, copy }) => (
                <Button onClick={copy}>
                  {copied ? <IconCheck size={16} aria-hidden /> : <IconCopy size={16} aria-hidden />}
                  {copied ? 'Link copied' : 'Copy link'}
                </Button>
              )}
            </CopyButton>
            <Button appearance="ghost" onClick={() => window.open(url, '_blank', 'noopener')}>
              <IconExternalLink size={16} aria-hidden />
              Open in a new tab
            </Button>
          </div>
          {copyFailed ? (
            <Text id="share-copy-fallback" size="sm" tone="secondary" role="status">
              Couldn’t copy automatically. {manualCopyHint()}
            </Text>
          ) : null}
        </div>
      </Stack>
    </Dialog>
  );
}
