import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Breadcrumbs, Button } from '@var-ui/react';
import { notify } from '../components/AppToasts';
import { IconArrowLeft, IconCheck, IconDeviceLaptop, IconDeviceTv } from '@tabler/icons-react';
import { ManagementShell } from '../components/ManagementShell';
import { Hint } from '../components/Hint';
import { SaveStatus, type SaveState } from '../components/SaveStatus';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { buildDisplayMantineTheme, displayMantineVars } from '../ui/mantineTheme';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardStore } from '../store/dashboardStore';
import { useTheme } from '../contexts/ThemeContext';
import type { DisplayDocument } from '@homeslate/schema';
import { apiClient, ApiError } from '../services/apiClient';
import type { ConfigUpsertRequest } from '../types/api';
import { applyDocumentToDisplay, displayRecordToDocument } from '../displayDocumentBridge';
import { Editor } from '@homeslate/editor';
import { UpgradeModal } from '../components/UpgradeModal';
import { viewEditor as s } from './ViewEditorPage.styles';

function writeEditorDocument(displayId: string, document: DisplayDocument) {
  useDashboardStore.setState((state) => ({
    displays: state.displays.map((display) =>
      display.id === displayId ? applyDocumentToDisplay(display, document) : display,
    ),
  }));
}

/**
 * Phones only: the editor is built for wide screens, so offer to carry on elsewhere by sending
 * this page's link (share sheet where available, else the clipboard).
 */
function EditorHandoff({ url }: { url: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'manual'>('idle');
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const handoff = async () => {
    if (canShare) {
      try {
        await navigator.share({ title: 'Homeslate editor', url });
        return;
      } catch {
        // Cancelled or blocked: fall through to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setState('copied');
    } catch {
      setState('manual');
    }
  };
  return (
    <div className={s.phoneNote}>
      <p className={s.phoneNoteText}>
        {state === 'manual' ? (
          <>
            Open this link on your computer: <span className={s.phoneNoteUrl}>{url}</span>
          </>
        ) : (
          'Editing layouts works best on a tablet or computer.'
        )}
      </p>
      {state !== 'manual' ? (
        <Button size="sm" appearance="outline" onClick={() => void handoff()} className={s.phoneNoteAction}>
          {state === 'copied' ? (
            <>
              <IconCheck size={16} aria-hidden />
              Link copied
            </>
          ) : (
            <>
              <IconDeviceLaptop size={16} aria-hidden />
              {canShare ? 'Send to computer' : 'Copy link'}
            </>
          )}
        </Button>
      ) : null}
    </div>
  );
}

export function ViewEditorPage() {
  const { accessToken } = useAuth();
  const {
    displays,
    selectedDisplayId,
    selectedViewId,
    openPreview,
  } = useDashboardStore();
  const { vars: themeVars, resolved, colorMode } = useTheme();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const display = displays.find((d) => d.id === selectedDisplayId);
  const view = display?.layouts.find((l) => l.id === selectedViewId);

  // Subscribe to store changes and save immediately on each action.
  // We read state directly from the subscription callback so we always
  // save the latest layout rather than a stale closure snapshot.
  useEffect(() => {
    if (!accessToken || !selectedDisplayId) return;
    const unsubscribe = useDashboardStore.subscribe((state, prevState) => {
      const d = state.displays.find((d) => d.id === selectedDisplayId);
      const prev = prevState.displays.find((d) => d.id === selectedDisplayId);
      if (!d || !prev) return;
      if (
        d.layouts !== prev.layouts ||
        d.themes !== prev.themes ||
        d.activeThemeId !== prev.activeThemeId ||
        d.colorMode !== prev.colorMode ||
        d.stickyNotesEnabled !== prev.stickyNotesEnabled ||
        d.voiceEnabled !== prev.voiceEnabled ||
        d.holidayEffectsEnabled !== prev.holidayEffectsEnabled ||
        d.holidayPreviewId !== prev.holidayPreviewId ||
        d.alarms !== prev.alarms
      ) {
        const {
          layouts,
          activeLayoutId,
          rotationEnabled,
          rotationIntervalMs,
          themes,
          activeThemeId,
          colorMode: savedColorMode,
          stickyNotesEnabled,
          voiceEnabled,
          holidayEffectsEnabled,
          holidayPreviewId,
          alarms,
        } = d;
        const payload: ConfigUpsertRequest = {
          layouts,
          activeLayoutId,
          rotationEnabled,
          rotationIntervalMs,
          themes,
          activeThemeId,
          colorMode: savedColorMode,
          stickyNotesEnabled,
          voiceEnabled,
          holidayEffectsEnabled,
          holidayPreviewId,
          alarms,
        };
        setSaveState('saving');
        void apiClient
          .put<unknown, ConfigUpsertRequest>('/api/config', {
            token: accessToken,
            query: { displayId: selectedDisplayId },
            body: payload,
          })
          .then(() => setSaveState('saved'))
          .catch((err) => {
            setSaveState('error');
            if (err instanceof ApiError && err.code === 'view_limit') {
              setUpgradeOpen(true);
              return;
            }
            console.error(err);
            notify({
              tone: 'danger',
              title: 'Layout not saved',
              description: 'Check your connection. Your next change will retry.',
            });
          });
      }
    });
    return () => {
      unsubscribe();
    };
  }, [accessToken, selectedDisplayId]);

  const document = useMemo(
    () =>
      display
        ? displayRecordToDocument({
            name: display.name,
            layouts: display.layouts,
            activeLayoutId: display.activeLayoutId,
            rotationEnabled: display.rotationEnabled,
            rotationIntervalMs: display.rotationIntervalMs,
            themes: display.themes,
            activeThemeId: display.activeThemeId,
            colorMode: display.colorMode,
            stickyNotesEnabled: display.stickyNotesEnabled,
            voiceEnabled: display.voiceEnabled,
            holidayEffectsEnabled: display.holidayEffectsEnabled,
            holidayPreviewId: display.holidayPreviewId,
            alarms: display.alarms,
          })
        : null,
    [display],
  );

  // The canvas previews the display: give it back the display's own Mantine variables (the
  // app maps Mantine onto Var UI tokens everywhere else) on top of its `--token-*` theme.
  const canvasVars = useMemo(
    () => ({ ...themeVars, ...displayMantineVars(buildDisplayMantineTheme(resolved), colorMode) }) as CSSProperties,
    [themeVars, resolved, colorMode],
  );

  useDocumentTitle(display && view ? `${display.name} · ${view.name}` : null);

  // The canvas grid measures its width after mounting and lazy widgets load in, so its first
  // layouts are a squashed guess. Keep the grid hidden behind a placeholder until it has been
  // measured (a ResizeObserver saw a real width) and its DOM has been quiet for a moment.
  // Grid transitions stay off until the user first presses the canvas, so later re-layouts
  // (window resizes, lazy widgets) never fly items across the screen either.
  const canvasRef = useRef<HTMLDivElement>(null);
  const [settledViewId, setSettledViewId] = useState<string | null>(null);
  const [interacted, setInteracted] = useState(false);
  const viewId = view?.id ?? null;
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || !viewId) return;
    let measured = false;
    let quiet: ReturnType<typeof setTimeout> | undefined;
    let resize: ResizeObserver | undefined;
    const done = () => {
      mutations.disconnect();
      resize?.disconnect();
      clearTimeout(quiet);
      clearTimeout(cap);
      setSettledViewId(viewId);
    };
    const settleSoon = () => {
      clearTimeout(quiet);
      if (measured) quiet = setTimeout(done, 250);
    };
    const watchGrid = () => {
      const grid = el.querySelector('.react-grid-layout');
      if (!grid || resize) return;
      resize = new ResizeObserver((entries) => {
        if (entries.some((entry) => entry.contentRect.width > 0)) {
          measured = true;
          settleSoon();
        }
      });
      resize.observe(grid);
    };
    const mutations = new MutationObserver(() => {
      watchGrid();
      settleSoon();
    });
    mutations.observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'class'] });
    watchGrid();
    const cap = setTimeout(done, 4000);
    return () => {
      mutations.disconnect();
      resize?.disconnect();
      clearTimeout(quiet);
      clearTimeout(cap);
    };
  }, [viewId]);
  const settling = settledViewId !== viewId;

  // Phones: `@homeslate/editor` has no option to start its widget panel collapsed, and expanded
  // it takes most of a 390px screen. When the panel first appears, press its own collapse toggle
  // once. A callback ref (the canvas mounts only after the display data loads on a direct visit)
  // plus a MutationObserver (the panel mounts inside the package after that). Once per page
  // mount, so a user who expands the panel keeps it expanded.
  const panelCollapsed = useRef(false);
  const panelObserver = useRef<MutationObserver | null>(null);
  const setCanvasEl = useCallback((el: HTMLDivElement | null) => {
    canvasRef.current = el;
    panelObserver.current?.disconnect();
    panelObserver.current = null;
    if (!el || panelCollapsed.current || !window.matchMedia('(max-width: 40rem)').matches) return;
    const collapseOnce = () => {
      const panel = el.querySelector('.WidgetPanel_panel');
      if (!panel) return false;
      panelCollapsed.current = true;
      if (!panel.classList.contains('WidgetPanel_collapsed')) {
        panel.querySelector<HTMLButtonElement>('.WidgetPanel_toggleBtn')?.click();
      }
      return true;
    };
    if (collapseOnce()) return;
    const observer = new MutationObserver(() => {
      if (collapseOnce()) {
        observer.disconnect();
        panelObserver.current = null;
      }
    });
    observer.observe(el, { childList: true, subtree: true });
    panelObserver.current = observer;
  }, []);
  useEffect(() => () => panelObserver.current?.disconnect(), []);

  // The canvas previews the display in the display's own colour mode, while the editor's
  // toolbar and widget panel follow the app's. Mantine reads the scheme from the nearest
  // `data-mantine-color-scheme`, so scope it to the canvas (`.Editor_main`, rendered by the
  // package) rather than the document.
  useEffect(() => {
    const main = canvasRef.current?.querySelector<HTMLElement>('.Editor_main');
    if (!main) return;
    main.setAttribute('data-mantine-color-scheme', colorMode);
    main.style.colorScheme = colorMode;
  });

  if (!display || !view || !document) return null;

  const displayHref = `/displays/${display.id}`;

  return (
    <>
    <UpgradeModal opened={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    <ManagementShell
      layout="bleed"
      className={s.shell}
      title={
        <div className={s.titleRow}>
          <Hint label={`Back to ${display.name}`}>
            <Button href={displayHref} layout="icon" aria-label={`Back to ${display.name}`} appearance="ghost" size="sm">
              <IconArrowLeft size={18} aria-hidden />
            </Button>
          </Hint>
          <Breadcrumbs
            items={[
              { id: 'display', label: display.name, href: displayHref },
              { id: 'view', label: view.name },
            ]}
          />
        </div>
      }
      actions={<SaveStatus state={saveState} compact />}
    >
      <div className={s.frame}>
      <EditorHandoff url={typeof window === 'undefined' ? '' : window.location.href} />
      <div
        ref={setCanvasEl}
        className={s.canvas}
        style={canvasVars}
        data-settling={settling || undefined}
        data-interacted={interacted || undefined}
        aria-busy={settling || undefined}
        onPointerDownCapture={interacted ? undefined : () => setInteracted(true)}
        onKeyDownCapture={interacted ? undefined : () => setInteracted(true)}
      >
        <Editor
          document={document}
          viewId={view.id}
          onChange={(next) => writeEditorDocument(display.id, next)}
          onUploadBackgroundPhoto={(payload) =>
            apiClient.post<{ key: string; filename: string }, typeof payload>('/api/photo-upload', {
              body: payload,
            })
          }
          actions={
            <Button
              appearance="outline"
              onClick={() => openPreview({ displayId: display.displayId, layoutId: view.id, colorMode })}
            >
              <IconDeviceTv size={16} aria-hidden />
              <span className={s.labelLong}>Preview this view</span>
              <span className={s.labelShort}>Preview</span>
            </Button>
          }
        />
      </div>
      </div>
    </ManagementShell>
    </>
  );
}
