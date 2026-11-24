import { useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { Alert, Button, Dialog, RadioGroup, Stack, Text } from '@var-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { billingEnabled, getCheckoutPriceIds, useBillingActions } from '../billing/useBillingActions';
import { upgradeModal as s } from './UpgradeModal.styles';

interface Props {
  opened: boolean;
  onClose: () => void;
  /** `limit` when a Free plan limit blocked an action; `menu` when opened from the account menu. */
  reason?: 'limit' | 'menu';
}

const PRO_FEATURES = [
  'Unlimited displays for every room',
  'Unlimited views per display',
  'Everything in Free, including sharing and pairing',
];

export function UpgradeModal({ opened, onClose, reason = 'limit' }: Props) {
  const { accessToken } = useAuth();
  const { startCheckout, loading, error } = useBillingActions(accessToken);
  const prices = getCheckoutPriceIds();
  const defaultPrice = prices.monthly ?? prices.annual ?? '';
  const [priceId, setPriceId] = useState(defaultPrice);

  const canUpgrade =
    billingEnabled && Boolean(prices.monthly || prices.annual) && Boolean(accessToken);

  const intervalOptions = [
    ...(prices.monthly ? [{ value: prices.monthly, label: 'Monthly' }] : []),
    ...(prices.annual ? [{ value: prices.annual, label: 'Annual' }] : []),
  ];

  return (
    <Dialog
      open={opened}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Upgrade to Homeslate Pro"
      description={
        reason === 'limit'
          ? "You've reached the Free plan limit. Pro removes it."
          : 'Pro lifts the Free plan limits for the whole house.'
      }
      size="xl"
    >
      <Stack gap="lg">
        <ul className={s.features}>
          {PRO_FEATURES.map((feature) => (
            <li key={feature} className={s.feature}>
              <IconCheck size={16} className={s.check} aria-hidden />
              <Text as="span" size="sm">
                {feature}
              </Text>
            </li>
          ))}
        </ul>
        {canUpgrade && intervalOptions.length > 1 && (
          <RadioGroup
            label="Billing interval"
            options={intervalOptions}
            value={priceId}
            onValueChange={(value) => setPriceId(value ?? defaultPrice)}
            orientation="horizontal"
          />
        )}
        {!canUpgrade && (
          // Only when billing isn't configured (local and preview builds): say so plainly,
          // without a disabled button or a promise we can't keep.
          <Alert tone="info">
            Upgrading isn&apos;t available here yet. Everything on the Free plan keeps working.
          </Alert>
        )}
        {error && (
          <Alert tone="danger" role="alert">
            {error}
          </Alert>
        )}
        <Dialog.Actions>
          {canUpgrade ? (
            <>
              <Button type="button" onClick={onClose} disabled={loading}>
                Not now
              </Button>
              <Button
                type="button"
                tone="accent"
                appearance="solid"
                disabled={!priceId}
                loading={loading}
                onClick={() => {
                  if (priceId) void startCheckout(priceId);
                }}
              >
                Upgrade to Pro
              </Button>
            </>
          ) : (
            <Button type="button" tone="accent" appearance="solid" onClick={onClose}>
              Got it
            </Button>
          )}
        </Dialog.Actions>
      </Stack>
    </Dialog>
  );
}
