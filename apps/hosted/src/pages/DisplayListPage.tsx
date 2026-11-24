import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  IconButton,
  Text,
  TextField,
} from '@var-ui/react';
import { notify } from '../components/AppToasts';
import {
  IconDeviceTablet,
  IconLayoutDashboard,
  IconLock,
  IconPencil,
  IconPlus,
  IconQrcode,
  IconUsers,
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardStore } from '../store/dashboardStore';
import { Hint } from '../components/Hint';
import { LayoutThumbnail } from '../components/LayoutThumbnail';
import { GetStarted, markTabletStepDone } from '../components/GetStarted';
import { ManagementShell } from '../components/ManagementShell';
import { ShareDisplayModal } from '../components/ShareDisplayModal';
import { RegisterDeviceModal } from '../components/RegisterDeviceModal';
import { UpgradeModal } from '../components/UpgradeModal';
import { PlanUsageIndicator, ProBadge } from '../components/PlanUsageIndicator';
import { wouldExceedDisplayLimit } from '../billing/entitlements';
import { entitlementsForPlan } from '../billing/plans';
import { shouldContinueUpgradePoll } from '../billing/upgradeReturn';
import { apiClient, ApiError } from '../services/apiClient';
import type { DisplayDto, DisplayRenameRequest } from '../types/api';
import { displayList as s } from './DisplayListPage.styles';
import { pageHeader as ph } from '../ui/shared.styles';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { dialogAutoFocus, dialogAutoFocusSelect } from '../components/dialogFocus';

const UPGRADE_POLL_ATTEMPTS = 8;
const UPGRADE_POLL_MS = 1500;

export function DisplayListPage() {
  const { user, accessToken, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { displays, addDisplay, renameDisplay } = useDashboardStore();
  const [creating, setCreating] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [shareDisplayId, setShareDisplayId] = useState<string | null>(null);
  const [shareDisplayName, setShareDisplayName] = useState<string>('');
  const [renameDisplayId, setRenameDisplayId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const upgradedParam = searchParams.get('upgraded');
  useDocumentTitle('Your displays');
  const [confirmingUpgrade, setConfirmingUpgrade] = useState(() => upgradedParam === '1');

  useEffect(() => {
    if (upgradedParam !== '1' || !accessToken) return;

    let cancelled = false;
    let attempts = 0;

    const run = async () => {
      setConfirmingUpgrade(true);
      while (!cancelled) {
        const next = await refreshUser();
        if (cancelled) return;
        attempts += 1;
        if (!shouldContinueUpgradePoll(next?.plan, attempts, UPGRADE_POLL_ATTEMPTS)) break;
        await new Promise((resolve) => setTimeout(resolve, UPGRADE_POLL_MS));
      }
      if (!cancelled) {
        setConfirmingUpgrade(false);
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('upgraded');
        setSearchParams(nextParams, { replace: true });
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [accessToken, refreshUser, upgradedParam, searchParams, setSearchParams]);

  const ownedDisplayCount = displays.filter((d) => d.isOwner !== false).length;
  const atDisplayLimit = wouldExceedDisplayLimit(ownedDisplayCount, entitlementsForPlan(user?.plan));
  const ownedDisplays = displays.filter((d) => d.isOwner !== false);
  const firstDisplay = ownedDisplays[0] ?? displays[0];
  // The checklist is for brand-new setups only: one display of your own that still has just its
  // starting view. Households already arranging views never see it.
  const isNewSetup = ownedDisplays.length === 1 && ownedDisplays[0].layouts.length <= 1;

  const handleNewDisplay = () => {
    if (atDisplayLimit) {
      setUpgradeOpen(true);
      return;
    }
    setCreateName('');
    setCreateOpen(true);
  };

  const handleCreateDisplay = async () => {
    const name = createName.trim();
    if (!accessToken || !name) return;
    setCreating(true);
    try {
      const row = await apiClient.post<DisplayDto, DisplayRenameRequest>(
        '/api/displays',
        {
          token: accessToken,
          body: { name },
        }
      );
      addDisplay(row.id, row.display_id, row.name);
      setCreateOpen(false);
      navigate(`/displays/${row.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'display_limit') {
        setCreateOpen(false);
        setUpgradeOpen(true);
      } else {
        console.error('Failed to create display:', err);
        notify({ tone: 'danger', title: 'Could not create the display', description: 'Check your connection and try again.' });
      }
    } finally {
      setCreating(false);
    }
  };

  const handleShare = (displayId: string, displayName: string) => {
    setShareDisplayId(displayId);
    setShareDisplayName(displayName);
  };

  const openRenameModal = (displayId: string, currentName: string) => {
    setRenameDisplayId(displayId);
    setRenameValue(currentName);
  };

  const closeRenameModal = () => {
    setRenameDisplayId(null);
    setRenameValue('');
  };

  const handleRenameDisplay = async () => {
    if (!accessToken || !renameDisplayId) return;
    const trimmed = renameValue.trim();
    const current = displays.find((d) => d.id === renameDisplayId);
    if (!trimmed || !current || trimmed === current.name) {
      closeRenameModal();
      return;
    }

    setRenaming(true);
    try {
      await apiClient.patch<unknown, DisplayRenameRequest>('/api/displays', {
        token: accessToken,
        query: { id: renameDisplayId },
        body: { name: trimmed },
      });
      renameDisplay(renameDisplayId, trimmed);
      closeRenameModal();
      notify({ tone: 'success', title: `Renamed to “${trimmed}”`, durationMs: 2500 });
    } catch (err) {
      console.error('Failed to rename display:', err);
      notify({ tone: 'danger', title: 'Could not rename the display', description: 'Check your connection and try again.' });
    } finally {
      setRenaming(false);
    }
  };

  return (
    <>
    {shareDisplayId && (
      <ShareDisplayModal
        opened={!!shareDisplayId}
        onClose={() => setShareDisplayId(null)}
        displayId={shareDisplayId}
        displayName={shareDisplayName}
        passcodeEnabled={displays.find((d) => d.displayId === shareDisplayId)?.passcodeEnabled}
      />
    )}
    <RegisterDeviceModal
      opened={registerModalOpen}
      onClose={() => setRegisterModalOpen(false)}
      onSuccess={markTabletStepDone}
      accessToken={accessToken ?? ''}
      addDisplay={addDisplay}
    />
    <UpgradeModal opened={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    <Dialog
      open={renameDisplayId !== null}
      onOpenChange={(open) => {
        if (!open) closeRenameModal();
      }}
      title="Rename display"
      size="lg"
    >
      <form
        className={s.dialogForm}
        onSubmit={(event) => {
          event.preventDefault();
          if (renameValue.trim()) void handleRenameDisplay();
        }}
      >
        <TextField
          label="Display name"
          value={renameValue}
          onValueChange={setRenameValue}
          ref={dialogAutoFocusSelect}
        />
        <Dialog.Actions>
          <Button type="button" onClick={closeRenameModal}>Cancel</Button>
          <Button type="submit" tone="accent" appearance="solid" loading={renaming} disabled={!renameValue.trim()}>
            Save
          </Button>
        </Dialog.Actions>
      </form>
    </Dialog>
    <Dialog
      open={createOpen}
      onOpenChange={(open) => {
        if (!open) setCreateOpen(false);
      }}
      title="New display"
      description="A display is one screen in your home — a kitchen tablet, a hallway frame."
      size="lg"
    >
      <form
        className={s.dialogForm}
        onSubmit={(event) => {
          event.preventDefault();
          void handleCreateDisplay();
        }}
      >
        <TextField
          label="Name"
          placeholder="Kitchen"
          value={createName}
          onValueChange={setCreateName}
          ref={dialogAutoFocus}
        />
        <Dialog.Actions>
          <Button type="button" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button type="submit" tone="accent" appearance="solid" loading={creating} disabled={!createName.trim()}>
            Create display
          </Button>
        </Dialog.Actions>
      </form>
    </Dialog>
    <ManagementShell>
      <header className={ph.root}>
        <div className={ph.text}>
          <div className={ph.titleRow}>
            <h1 className={ph.title}>Your displays</h1>
            <PlanUsageIndicator
              plan={user?.plan}
              kind="display"
              used={ownedDisplayCount}
              onUpgradeClick={() => setUpgradeOpen(true)}
            />
          </div>
          <p className={ph.lead}>
            Each display is a screen in your home. Open one to arrange its views, or share it to a tablet.
          </p>
          {confirmingUpgrade && user?.plan !== 'pro' && (
            <Text size="sm" tone="secondary" role="status">Confirming your upgrade…</Text>
          )}
        </div>
        <div className={ph.actions}>
          <Button appearance="outline" onClick={() => setRegisterModalOpen(true)}>
            <IconDeviceTablet size={16} aria-hidden />
            Pair a tablet
          </Button>
          <Button
            tone="accent"
            appearance="solid"
            onClick={handleNewDisplay}
            loading={creating && !createOpen}
            aria-label={atDisplayLimit ? 'New display (needs Pro)' : undefined}
          >
            <IconPlus size={16} aria-hidden />
            New display
            {atDisplayLimit ? <ProBadge /> : null}
          </Button>
        </div>
      </header>

      {isNewSetup ? (
        <GetStarted
          steps={[
            {
              id: 'display',
              title: 'Create a display',
              description: 'One for each screen in your home.',
              done: displays.length > 0,
            },
            {
              id: 'views',
              title: 'Add a few views',
              description: 'Starter views give you Morning, Evening and Weekend layouts to edit.',
              done: displays.some((d) => d.layouts.length > 1),
              action: firstDisplay
                ? { label: 'Add views', onPress: () => navigate(`/displays/${firstDisplay.id}`) }
                : undefined,
            },
            {
              id: 'tablet',
              title: 'Put it on a tablet',
              description: 'Scan the QR code with the tablet, or pair one that shows a code.',
              done: false,
              action: firstDisplay
                ? { label: 'Open on a tablet', onPress: () => handleShare(firstDisplay.displayId, firstDisplay.name) }
                : undefined,
            },
          ]}
        />
      ) : null}

      {displays.length === 0 ? (
        <div className={s.empty}>
          <EmptyState
            icon={<IconLayoutDashboard size={40} stroke={1.25} />}
            title="No displays yet"
            description="Create a display, add a few widgets, then open it on a tablet. Or pair a tablet that's already showing a code."
            action={
              <div className={s.emptyActions}>
                <Button tone="accent" appearance="solid" onClick={handleNewDisplay}>
                  <IconPlus size={16} aria-hidden />
                  Create your first display
                </Button>
                <Button onClick={() => setRegisterModalOpen(true)}>Pair a tablet</Button>
              </div>
            }
          />
        </div>
      ) : (
        <ul className={s.grid} aria-label="Displays">
          {displays.map((display) => {
            const isOwner = display.isOwner ?? true;
            const viewCount = display.layouts.length;
            const hiddenCount = display.layouts.filter((l) => l.hidden).length;
            return (
              <li key={display.id} className={s.item}>
                <Card
                  className={s.card}
                  headingLevel={2}
                  title={
                    // The title link stretches over the whole card (see `cardLink`), so the
                    // card opens in a new tab with a middle-click like any other link.
                    <Link to={`/displays/${display.id}`} className={s.cardLink}>
                      {display.name}
                    </Link>
                  }
                  titleEnd={
                    display.passcodeEnabled ? (
                      <Hint label="PIN required to view">
                        <span className={s.lock} tabIndex={0} aria-label="PIN required to view">
                          <IconLock size={14} />
                        </span>
                      </Hint>
                    ) : undefined
                  }
                >
                  {/* The display's first views, drawn from their real widget layouts. */}
                  <ul className={s.preview} aria-label={`Views on ${display.name}`}>
                    {display.layouts.slice(0, 4).map((layout) => (
                      <li key={layout.id} className={s.previewView} data-hidden={layout.hidden || undefined}>
                        <LayoutThumbnail layout={layout} size="sm" />
                        <span className={s.previewName}>
                          {layout.name}
                          {layout.hidden ? <span className={s.visuallyHidden}> (hidden)</span> : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className={s.meta}>
                    <Badge tone="neutral" appearance="subtle">
                      {viewCount} {viewCount === 1 ? 'view' : 'views'}
                      {hiddenCount > 0 ? ` · ${hiddenCount} hidden` : ''}
                    </Badge>
                    {!isOwner && (
                      <Badge tone="info" appearance="subtle">
                        <IconUsers size={12} aria-hidden />
                        Shared with you
                      </Badge>
                    )}
                    <span className={s.cardActions}>
                      {isOwner && (
                        <Hint label="Rename">
                          <IconButton
                            icon={<IconPencil size={16} />}
                            aria-label={`Rename ${display.name}`}
                            size="sm"
                            appearance="ghost"
                            onClick={() => openRenameModal(display.id, display.name)}
                          />
                        </Hint>
                      )}
                      <Hint label="Open on a tablet">
                        <IconButton
                          icon={<IconQrcode size={16} />}
                          aria-label={`Open ${display.name} on a tablet`}
                          size="sm"
                          appearance="ghost"
                          onClick={() => handleShare(display.displayId, display.name)}
                        />
                      </Hint>
                    </span>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </ManagementShell>
    </>
  );
}
