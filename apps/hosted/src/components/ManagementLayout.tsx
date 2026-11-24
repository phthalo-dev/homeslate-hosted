import { useEffect, useRef } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { PageLoader } from './PageLoader';
import { notify } from './AppToasts';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardStore } from '../store/dashboardStore';
import type { RemoteDisplay } from '../store/dashboardStore';
import { apiClient } from '../services/apiClient';

/**
 * Layout for the management UI. Fetches displays from the API and syncs URL
 * params to the dashboard store so navigation and refresh work correctly.
 */
export function ManagementLayout() {
  const { accessToken } = useAuth();
  const { displayId, viewId } = useParams<{ displayId: string; viewId: string }>();
  const navigate = useNavigate();
  const { displays, setDisplays, selectDisplay, selectView } = useDashboardStore();
  // One notice per stale URL (effects can run twice in development).
  const notifiedMissingView = useRef<string | null>(null);

  // Fetch displays when authenticated
  useEffect(() => {
    if (!accessToken) return;
    apiClient
      .get<RemoteDisplay[]>('/api/displays', { token: accessToken })
      .then((rows: RemoteDisplay[]) => setDisplays(rows))
      .catch(console.error);
  }, [accessToken, setDisplays]);

  // Sync URL params to store and validate
  useEffect(() => {
    if (!displayId) {
      selectDisplay(null);
      selectView(null);
      return;
    }

    selectDisplay(displayId);

    if (viewId) {
      const display = displays.find((d) => d.id === displayId);
      const layoutExists = display?.layouts.some((l) => l.id === viewId);
      if (display && !layoutExists) {
        // View doesn't exist, redirect to display detail
        if (notifiedMissingView.current !== viewId) {
          notifiedMissingView.current = viewId;
          notify({ tone: 'info', title: 'That view no longer exists', description: `Showing ${display.name}’s views instead.` });
        }
        navigate(`/displays/${displayId}`, { replace: true });
        selectView(null);
      } else {
        selectView(viewId);
      }
    } else {
      selectView(null);
    }
  }, [displayId, viewId, displays, selectDisplay, selectView, navigate]);

  // Redirect if displayId is invalid (display not in list after fetch)
  useEffect(() => {
    if (!displayId || displays.length === 0) return;
    const display = displays.find((d) => d.id === displayId);
    if (!display) {
      navigate('/displays', { replace: true });
    }
  }, [displayId, displays, navigate]);

  // Show loader while displays are loading and we need display data
  const needsDisplay = !!displayId;
  const isLoading = needsDisplay && displays.length === 0;
  const display = displays.find((d) => d.id === displayId);
  const displayValid = !needsDisplay || !!display;

  if (isLoading || (needsDisplay && !displayValid)) {
    return <PageLoader label="Loading display" />;
  }

  return <Outlet />;
}
