import { Badge, Button } from '@var-ui/react';
import { entitlementsForPlan } from '../billing/plans';
import { planUsage as s } from './PlanUsageIndicator.styles';

interface Props {
  plan: string | null | undefined;
  /** What is being counted against the plan. */
  kind: 'display' | 'view';
  used: number;
  onUpgradeClick?: () => void;
}

/**
 * Plain-language plan usage ("Free plan · 1 of 1 displays") with a separate
 * Upgrade link once the limit is reached. Renders nothing on unlimited plans.
 */
export function PlanUsageIndicator({ plan, kind, used, onUpgradeClick }: Props) {
  const entitlements = entitlementsForPlan(plan);
  const limit = kind === 'display' ? entitlements.maxDisplays : entitlements.maxViewsPerDisplay;
  if (limit === null) return null;

  const noun = kind === 'display' ? 'displays' : 'views';
  const atLimit = used >= limit;

  return (
    <span className={s.root} data-at-limit={atLimit || undefined}>
      <span className={s.label}>
        Free plan · {used} of {limit} {noun}
      </span>
      {atLimit && onUpgradeClick ? (
        <Button size="xs" appearance="ghost" tone="accent" onClick={onUpgradeClick} className={s.upgrade}>
          Upgrade
        </Button>
      ) : null}
    </span>
  );
}

/** "Pro" marker inside an action that needs the Pro plan (pair it with "(needs Pro)" in the label). */
export function ProBadge() {
  return (
    <Badge tone="neutral" appearance="solid" className={s.proBadge} aria-hidden>
      Pro
    </Badge>
  );
}
