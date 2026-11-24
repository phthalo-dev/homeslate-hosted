import { Link } from 'react-router-dom';
import { Text } from '@var-ui/react';
import { HomeslateMark } from '../components/HomeslateMark';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useAuth } from '../contexts/AuthContext';
import { kioskCard as s } from './KioskCard.styles';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function AuthPage() {
  useDocumentTitle('Sign in');
  const { signIn, isLoading } = useAuth();

  return (
    <main className={s.screen} data-color-mode="dark">
      <div className={s.card}>
        <HomeslateMark framed size={64} className={s.mark} />
        <h1 className={s.title}>Sign in to Homeslate</h1>
        <Text tone="secondary" className={s.body}>
          Arrange the displays around your home from any laptop or phone.
        </Text>
        <GoogleSignInButton size="lg" label="Continue with Google" onClick={signIn} loading={isLoading} fullWidth />
        <Text size="xs" tone="secondary" className={s.fine}>
          We only ask for the Google access your widgets need.{' '}
          <Link to="/" className={s.link}>
            Why?
          </Link>
        </Text>
        <nav className={s.footer} aria-label="About Homeslate">
          <Link to="/" className={s.link}>
            About Homeslate
          </Link>
          <Link to="/privacy" className={s.link}>
            Privacy
          </Link>
          <Link to="/terms" className={s.link}>
            Terms
          </Link>
        </nav>
      </div>
    </main>
  );
}
