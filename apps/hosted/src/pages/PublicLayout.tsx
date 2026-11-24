import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@var-ui/react';
import { HomeslateMark } from '../components/HomeslateMark';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useAuth } from '../contexts/AuthContext';
import { publicLayout as s } from './PublicLayout.styles';

/** Sign-in or "open app" call to action, shared by the header and hero. */
export function PrimaryCta({
  size = 'md',
  placement = 'hero',
}: {
  size?: 'md' | 'lg';
  /** In the header the sign-in label shortens to "Sign in" on phones. */
  placement?: 'header' | 'hero';
}) {
  const { isAuthenticated, signIn, isLoading } = useAuth();
  if (isAuthenticated) {
    return (
      <Button href="/displays" tone="accent" appearance="solid" size={size}>
        Open your displays
      </Button>
    );
  }
  return (
    <GoogleSignInButton
      size={size}
      onClick={signIn}
      loading={isLoading}
      variant={placement === 'hero' ? 'light' : 'dark'}
      compactOnPhone={placement === 'header'}
    />
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add('public-site');
    return () => {
      document.documentElement.classList.remove('public-site');
    };
  }, []);

  return (
    // The marketing site is always dark, whatever colour mode a display uses.
    <div className={s.shell} data-color-mode="dark">
      <header className={s.header}>
        <Link to="/" className={s.brand} aria-label="Homeslate home">
          <HomeslateMark size={28} />
          <span className={s.brandName}>Homeslate</span>
        </Link>
        <nav className={s.nav} aria-label="Site">
          <Link to="/privacy" className={s.navLink}>
            Privacy
          </Link>
          <Link to="/terms" className={s.navLink}>
            Terms
          </Link>
          <PrimaryCta placement="header" />
        </nav>
      </header>
      <main className={s.main}>{children}</main>
      <footer className={s.footer}>
        <p>Homeslate&nbsp;— home displays you arrange yourself.</p>
        <nav className={s.footerLinks} aria-label="Legal">
          <Link to="/privacy" className={s.footerLink}>
            Privacy Policy
          </Link>
          <Link to="/terms" className={s.footerLink}>
            Terms of Service
          </Link>
          <a href="mailto:support@homeslate.dev" className={s.footerLink}>
            support@homeslate.dev
          </a>
        </nav>
      </footer>
    </div>
  );
}
