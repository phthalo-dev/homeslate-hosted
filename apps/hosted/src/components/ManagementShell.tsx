import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AppShell, Menu, TopNav } from '@var-ui/react';
import { AccountMenu } from './AccountMenu';
import { HomeslateMark } from './HomeslateMark';
import { managementShell as s } from '../ui/shared.styles';
import { cx } from '../ui/system';

export interface ShellOverflowAction {
  id: string;
  label: string;
  onAction: () => void;
}

interface ManagementShellProps {
  /**
   * Page title shown after the brand. A string renders as the page `<h1>`; pass
   * a node to supply your own heading (e.g. an `EditableText` around an `<h1>`).
   */
  title?: ReactNode;
  /** Inline controls next to the title (rename button, plan badge). */
  titleAccessory?: ReactNode;
  /**
   * Section navigation (`TopNav.Item` list). Sits in the bar on wide screens and
   * becomes a full-width, scrollable second row on phones.
   */
  nav?: ReactNode;
  /** Accessible name for the section navigation group. */
  navLabel?: string;
  /** Page actions, rendered before the account menu on wide screens. */
  actions?: ReactNode;
  /**
   * The same actions as menu items. On phones they replace `actions` with one
   * overflow menu so the bar keeps to a single row.
   */
  overflowActions?: ShellOverflowAction[];
  children: ReactNode;
  /**
   * `contained` (default) centres children in a max-width column with page
   * padding; `bleed` hands the full main area to children (editors, canvases).
   */
  layout?: 'contained' | 'bleed';
  className?: string;
}

/**
 * Chrome for every signed-in page: Var UI `AppShell` + `TopNav` with the
 * Homeslate brand, an optional page title, section nav, actions and the
 * account menu (which also holds the app's light/dark/system setting).
 */
export function ManagementShell({
  title,
  titleAccessory,
  nav,
  navLabel = 'Sections',
  actions,
  overflowActions,
  children,
  layout = 'contained',
  className,
}: ManagementShellProps) {
  const hasOverflow = !!overflowActions && overflowActions.length > 0;
  return (
    <AppShell
      className={cx(s.root, className)}
      variant="surface"
      topNav={
        <TopNav
          label="Homeslate"
          className={s.bar}
          data-has-nav={nav ? '' : undefined}
          data-contained={layout === 'contained' ? '' : undefined}
          heading={
            <div className={s.headingGroup}>
              <Link to="/displays" className={s.brand} aria-label="Homeslate — your displays">
                <HomeslateMark size={22} className={s.brandMark} />
                <span className={s.brandName} data-compact={title ? '' : undefined}>
                  Homeslate
                </span>
              </Link>
              {title ? (
                <div className={s.titleGroup}>
                  {typeof title === 'string' ? <h1 className={s.title}>{title}</h1> : title}
                  {titleAccessory}
                </div>
              ) : null}
            </div>
          }
          startContent={
            nav ? (
              <div className={s.nav} role="group" aria-label={navLabel}>
                {nav}
              </div>
            ) : undefined
          }
          endContent={
            <div className={s.actions}>
              {actions ? (
                <div className={s.wideActions} data-collapsible={hasOverflow ? '' : undefined}>
                  {actions}
                </div>
              ) : null}
              {hasOverflow ? (
                <div className={s.compactActions}>
                  <Menu.Overflow
                    aria-label="More actions"
                    placement="bottom end"
                    sections={[
                      {
                        items: overflowActions.map((action) => ({
                          id: action.id,
                          label: action.label,
                          onAction: action.onAction,
                        })),
                      },
                    ]}
                  />
                </div>
              ) : null}
              <AccountMenu />
            </div>
          }
        />
      }
    >
      <div className={s.main} data-contained={layout === 'contained' ? '' : undefined}>
        {layout === 'contained' ? <div className={s.content}>{children}</div> : children}
      </div>
    </AppShell>
  );
}
