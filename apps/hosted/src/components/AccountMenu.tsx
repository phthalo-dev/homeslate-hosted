import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Menu,
  UnstyledButton,
  useColorMode,
  type ColorMode,
  type MenuSectionDefinition,
} from '@var-ui/react';
import { notify } from './AppToasts';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardStore } from '../store/dashboardStore';
import { apiClient } from '../services/apiClient';
import { billingEnabled, useBillingActions } from '../billing/useBillingActions';
import { DeleteAccountModal } from './DeleteAccountModal';
import { UpgradeModal } from './UpgradeModal';
import { accountMenu } from './AccountMenu.styles';

const COLOR_MODES: ColorMode[] = ['light', 'dark', 'system'];
/** Index of the appearance group in `sections` (for the controlled single-choice value). */
const APPEARANCE_SECTION = 1;

export function AccountMenu() {
  const { user, accessToken, signOut } = useAuth();
  const navigate = useNavigate();
  const { colorMode, setColorMode } = useColorMode();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // The dialog opens from a menu item that is gone by the time it closes, so the native
  // focus return would land on <body>: send focus back to the avatar instead.
  const closeDelete = () => {
    setDeleteOpen(false);
    setTimeout(() => triggerRef.current?.focus(), 0);
  };
  const { openPortal, loading: billingLoading, error: billingError } = useBillingActions(accessToken);

  const handleDeleteAccount = async () => {
    if (!accessToken) throw new Error('Not signed in');
    await apiClient.delete('/api/me', { token: accessToken });
    useDashboardStore.persist.clearStorage();
    useDashboardStore.setState({
      displays: [],
      selectedDisplayId: null,
      selectedViewId: null,
      preview: null,
    });
    signOut();
    setDeleteOpen(false);
    navigate('/');
  };

  useEffect(() => {
    if (billingError) notify({ tone: 'danger', title: 'Billing unavailable', description: billingError });
  }, [billingError]);

  if (!user) return null;

  // Identity → app appearance → session → destructive, each its own group.
  const sections: MenuSectionDefinition[] = [
    {
      // Identity is the (non-interactive) group header; the plan row underneath does something.
      label: `${user.name} · ${user.email}`,
      items:
        user.plan === 'pro'
          ? billingEnabled && user.canManageSubscription
            ? [{ id: 'billing', label: 'Pro plan · Manage subscription', disabled: billingLoading, onAction: () => void openPortal() }]
            : []
          : [{ id: 'upgrade', label: 'Free plan · Upgrade to Pro', onAction: () => setUpgradeOpen(true) }],
    },
    {
      // The app's own light/dark setting. A display's look is set on its Settings tab.
      label: 'Appearance',
      defaultValue: colorMode,
      closeOnSelect: false,
      items: [
        { id: 'light', label: 'Light', icon: 'colorModeLight' },
        { id: 'dark', label: 'Dark', icon: 'colorModeDark' },
        { id: 'system', label: 'Match system', icon: 'colorModeSystem' },
      ],
    },
    {
      items: [{ id: 'sign-out', label: 'Sign out', onAction: signOut }],
    },
    {
      items: [{ id: 'delete-account', label: 'Delete account…', danger: true, onAction: () => setDeleteOpen(true) }],
    },
  ];

  return (
    <>
      <Menu>
        <Menu.Trigger>
          <UnstyledButton
            ref={triggerRef}
            className={accountMenu.trigger}
            aria-label={`Account menu for ${user.name}`}
          >
            <Avatar src={user.picture} name={user.name} alt="" size="sm" />
          </UnstyledButton>
        </Menu.Trigger>
        <Menu.Popup placement="bottom end" aria-label="Account">
          <Menu.Content
            sections={sections}
            sectionValues={{ [APPEARANCE_SECTION]: colorMode }}
            onSectionValueChange={(index, value) => {
              if (index === APPEARANCE_SECTION && COLOR_MODES.includes(value as ColorMode)) {
                setColorMode(value as ColorMode);
              }
            }}
          />
        </Menu.Popup>
      </Menu>
      <UpgradeModal opened={upgradeOpen} onClose={() => setUpgradeOpen(false)} reason="menu" />
      <DeleteAccountModal
        opened={deleteOpen}
        onClose={closeDelete}
        email={user.email}
        onConfirm={handleDeleteAccount}
      />
    </>
  );
}
