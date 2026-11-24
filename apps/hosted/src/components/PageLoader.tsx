import { Spinner } from '@var-ui/react';
import { HomeslateMark } from './HomeslateMark';
import { pageLoader as s } from '../ui/shared.styles';

interface PageLoaderProps {
  label?: string;
  /** `public` pins the always-dark marketing look so sign-in pages don't flash light. */
  surface?: 'app' | 'public';
  /** `inline` fills its container (a panel) instead of the viewport. */
  layout?: 'page' | 'inline';
}

/** Route-level loading state (lazy pages, display data): the mark over a spinner. */
export function PageLoader({ label = 'Loading', surface = 'app', layout = 'page' }: PageLoaderProps) {
  return (
    <div
      className={s.root}
      data-layout={layout}
      data-color-mode={surface === 'public' ? 'dark' : undefined}
    >
      <div className={s.stack}>
        {layout === 'page' ? <HomeslateMark size={32} /> : null}
        <Spinner size={layout === 'page' ? 'md' : 'lg'} label={label} />
      </div>
    </div>
  );
}
