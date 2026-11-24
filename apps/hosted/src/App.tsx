import { MantineProvider } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { lazy, Suspense, useLayoutEffect, useMemo, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useHref, useLocation, useNavigate } from 'react-router-dom';
import { RouterProvider } from 'react-aria-components';
import { DesignSystemProvider, IconButton, IconProvider, useColorMode } from '@var-ui/react';
import { defaultIcons } from '@var-ui/icons';
import { useWakeLock } from './hooks/useWakeLock';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { useDashboardStore } from './store/dashboardStore';
import { ManagementLayout } from './components/ManagementLayout';
import { HostGoogleRuntime } from './host/HostGoogleRuntime';
import { PageLoader } from './components/PageLoader';
import { Hint } from './components/Hint';
import { AppToastHost } from './components/AppToasts';
import { COLOR_MODE_STORAGE_KEY, homeslateTheme } from './ui/theme';
import { buildDisplayMantineTheme } from './ui/mantineTheme';
import { useDisplaySurfaceScheme } from './ui/displaySurfaceScheme';
import { previewExit } from './App.styles';
// Mantine stays only for the @homeslate/* editor, display, and widget packages.
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

// Lazy-load heavy page bundles so they are only fetched when first needed.
// DisplayViewer is used on the always-on tablet so keep it eager to avoid
// a loading flash on every hard refresh of the display URL.
import { DisplayViewer } from './components/DisplayViewer';
import {
  clearSessionDisplayId,
  persistDisplayId,
  resolveDisplayId,
} from './displayPersistence';
import { resolveAppSurface, type AppSurface } from './appSurface';
import { setDisplaySession } from './pwaUpdate';

const AuthPage = lazy(() => import('./pages/AuthPage').then((m) => ({ default: m.AuthPage })));
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const DisplayListPage = lazy(() => import('./pages/DisplayListPage').then((m) => ({ default: m.DisplayListPage })));
const DisplayDetailPage = lazy(() => import('./pages/DisplayDetailPage').then((m) => ({ default: m.DisplayDetailPage })));
const ViewEditorPage = lazy(() => import('./pages/ViewEditorPage').then((m) => ({ default: m.ViewEditorPage })));
const PairPage = lazy(() => import('./pages/PairPage').then((m) => ({ default: m.PairPage })));

/**
 * Var UI (app chrome) + Mantine (the @homeslate/* editor and display packages).
 *
 * The chrome follows the user's preference (OS by default, or a stored light/dark pin from the
 * account menu), independent of any display. Mantine gets the selected display's *theme*
 * (brand colour, radii) but the app's colour scheme; `ui/mantineBridge.styles.ts` maps Mantine's
 * variables onto Var UI tokens for package chrome.
 */
function UiProviders({ children }: { children: ReactNode }) {
  return (
    <DesignSystemProvider
      applyToDocument
      customTheme={homeslateTheme}
      defaultColorMode="system"
      storageKey={COLOR_MODE_STORAGE_KEY}
    >
      <IconProvider icons={defaultIcons}>
        <MantineLayer>{children}</MantineLayer>
        <AppToastHost />
      </IconProvider>
    </DesignSystemProvider>
  );
}

/**
 * Mantine's `forceColorScheme` lands on `<html>` (`data-mantine-color-scheme`, and Mantine's
 * `:root { color-scheme }`, which Var UI's `light-dark()` tokens also read). So it must follow
 * the *app's* colour mode, never a display's — otherwise a light display turns the whole app
 * light. Display-coloured regions scope the display's scheme themselves (the editor canvas in
 * `ViewEditorPage`); full-screen display surfaces take over the page via `displaySurfaceScheme`.
 */
function MantineLayer({ children }: { children: ReactNode }) {
  const { resolved } = useTheme();
  const { resolvedColorMode } = useColorMode();
  const displaySurfaceScheme = useDisplaySurfaceScheme();
  const mantineTheme = useMemo(() => buildDisplayMantineTheme(resolved), [resolved]);
  return (
    <MantineProvider theme={mantineTheme} forceColorScheme={displaySurfaceScheme ?? resolvedColorMode}>
      {children}
    </MantineProvider>
  );
}

/**
 * Marks the document with the active surface (`display` | `public` | `app`). Global styles key
 * off it: the wall display keeps Mantine's display theme and canvas background, everything else
 * gets the Var UI surfaces.
 */
function useSurfaceAttribute(surface: AppSurface) {
  const value = surface === 'display' || surface === 'preview' ? 'display' : surface === 'app' ? 'app' : 'public';
  useLayoutEffect(() => {
    document.documentElement.dataset.hsSurface = value;
  }, [value]);
}

/** Lets Var UI links (`Button href`, `TopNav.Item`, `Link`) navigate client-side. */
function RouterBridge({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <RouterProvider navigate={(href) => void navigate(href)} useHref={useHref}>
      {children}
    </RouterProvider>
  );
}

// If the URL has ?display=<uuid>, persist it so it survives OAuth redirects
// (sessionStorage) and Android Chrome PWA relaunches that open start_url "/"
// (localStorage, restored only in standalone/fullscreen display-mode).
// Module load time so we catch the first navigation before any component mounts.
const _initialDisplayParam = new URLSearchParams(window.location.search).get('display');
if (_initialDisplayParam) {
  persistDisplayId(_initialDisplayParam);
}

if (resolveDisplayId()) {
  setDisplaySession(true);
}

function AppInner() {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const { preview, closePreview } = useDashboardStore();
  useWakeLock();

  // Display device mode: ?display=<uuid> → fullscreen viewer, no auth needed.
  // Falls back to sessionStorage (OAuth) and localStorage (installed PWA).
  const displayParam = resolveDisplayId();
  const surface = resolveAppSurface({
    pathname,
    isAuthenticated,
    displayId: displayParam,
    preview: !!preview,
  });
  useSurfaceAttribute(surface);

  // No display for this tab — clear the short-lived session copy so the
  // management UI is reachable. Keep localStorage so the installed app still
  // reopens the pinned display on next standalone launch.
  if (surface !== 'display' && surface !== 'pair') {
    clearSessionDisplayId();
  }

  if (surface === 'pair') {
    setDisplaySession(false);
    return (
      <Suspense fallback={<PageLoader surface="public" />}>
        <PairPage />
      </Suspense>
    );
  }

  if (surface === 'display' && displayParam) {
    setDisplaySession(true);
    return <DisplayViewer displayId={displayParam} />;
  }

  if (surface === 'home') {
    setDisplaySession(false);
    return <Suspense fallback={<PageLoader surface="public" />}><HomePage /></Suspense>;
  }

  if (surface === 'privacy') {
    setDisplaySession(false);
    return <Suspense fallback={<PageLoader surface="public" />}><PrivacyPage /></Suspense>;
  }

  if (surface === 'terms') {
    setDisplaySession(false);
    return <Suspense fallback={<PageLoader surface="public" />}><TermsPage /></Suspense>;
  }

  if (surface === 'auth') {
    setDisplaySession(false);
    return <Suspense fallback={<PageLoader surface="public" />}><AuthPage /></Suspense>;
  }

  // In-app preview mode: render the viewer with an exit button overlay
  if (surface === 'preview' && preview) {
    setDisplaySession(true);
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <DisplayViewer
          displayId={preview.displayId}
          isPreview
          previewLayoutId={preview.layoutId}
          forceRotation={preview.forceRotation}
          colorMode={preview.colorMode}
        />
        <div className={previewExit}>
          <Hint label="Exit preview">
            <IconButton
              icon={<IconX size={18} />}
              aria-label="Exit preview"
              size="lg"
              pill
              elevated
              tone="neutral"
              appearance="solid"
              onClick={closePreview}
            />
          </Hint>
        </div>
      </div>
    );
  }

  setDisplaySession(false);
  return (
    <Routes>
      <Route path="/displays" element={<ManagementLayout />}>
        <Route index element={<Suspense fallback={<PageLoader />}><DisplayListPage /></Suspense>} />
        <Route path=":displayId" element={<Suspense fallback={<PageLoader />}><DisplayDetailPage /></Suspense>} />
        <Route path=":displayId/views/:viewId" element={<Suspense fallback={<PageLoader />}><ViewEditorPage /></Suspense>} />
      </Route>
      <Route path="*" element={<Navigate to="/displays" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <HostGoogleRuntime>
        <ThemeProvider>
          <UiProviders>
            <BrowserRouter>
              <RouterBridge>
                <AppInner />
              </RouterBridge>
            </BrowserRouter>
          </UiProviders>
        </ThemeProvider>
      </HostGoogleRuntime>
    </AuthProvider>
  );
}

export default App;
