import {
  createElement,
  lazy,
  Suspense,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertDialog,
  Badge,
  Button,
  Dialog,
  EditableText,
  IconButton,
  PinInput,
  SegmentedControl,
  Select,
  Skeleton,
  Switch,
  Text,
  TextField,
  TopNav,
} from '@var-ui/react';
import { notify } from '../components/AppToasts';
import * as TablerIcons from '@tabler/icons-react';
import {
  IconDeviceTv,
  IconEye,
  IconEyeOff,
  IconGripVertical,
  IconLayoutGrid,
  IconLock,
  IconLockOpen,
  IconMoodSmile,
  IconMoon,
  IconPalette,
  IconPencil,
  IconPlus,
  IconQrcode,
  IconSettings,
  IconSparkles,
  IconSun,
  IconTrash,
  IconUserPlus,
} from '@tabler/icons-react';
import { IconPickerModal } from '../components/IconPickerModal';
import { AlarmListEditor } from '@homeslate/widgets';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';
import { ShareDisplayModal } from '../components/ShareDisplayModal';
import { InviteModal } from '../components/InviteModal';
import { UpgradeModal } from '../components/UpgradeModal';
import { PlanUsageIndicator, ProBadge } from '../components/PlanUsageIndicator';
import { ManagementShell } from '../components/ManagementShell';
import { Hint } from '../components/Hint';
import { SaveStatus, type SaveState } from '../components/SaveStatus';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LayoutThumbnail } from '../components/LayoutThumbnail';
import { dialogAutoFocus, dialogAutoFocusSelect } from '../components/dialogFocus';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { pageHeader as ph } from '../ui/shared.styles';
import { wouldExceedViewLimit } from '../billing/entitlements';
import { entitlementsForPlan } from '../billing/plans';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardStore } from '../store/dashboardStore';
import { displayRecordToDocument } from '../displayDocumentBridge';
import { HOLIDAY_PREVIEW_OPTIONS } from '@homeslate/display';
import type { ColorMode, HolidayId } from '@homeslate/schema';
import { getWidgetByType } from '@homeslate/widgets';
import type { DashboardLayout, WidgetDefinition } from '../types/widget';
import { apiClient, ApiError } from '../services/apiClient';
import type { ConfigUpsertRequest, DisplayPasscodeRequest, DisplayRenameRequest } from '../types/api';
import { displayDetail as s } from './DisplayDetailPage.styles';

const INTERVAL_OPTIONS = [
  { value: '15000',   label: '15 seconds' },
  { value: '30000',   label: '30 seconds' },
  { value: '60000',   label: '1 minute'   },
  { value: '300000',  label: '5 minutes'  },
  { value: '600000',  label: '10 minutes' },
  { value: '1800000', label: '30 minutes' },
];

const PRESET_VIEW_NAMES = ['Morning', 'Evening', 'Weekend'] as const;
type ManagementPage = 'views' | 'settings' | 'theme';
const MANAGEMENT_PAGES: ManagementPage[] = ['views', 'settings', 'theme'];
const PAGE_TITLES: Record<ManagementPage, string> = { views: 'Views', settings: 'Settings', theme: 'Theme' };

// The theme editor is the heaviest tab: load it on demand, and start loading as soon as
// the pointer or focus reaches its tab so the click rarely waits.
const ThemeEditor = lazy(() => import('@homeslate/editor').then((m) => ({ default: m.ThemeEditor })));
const prefetchThemeEditor = () => {
  void import('@homeslate/editor');
};

/** Plain left clicks only: modified clicks open the tab link in a new tab/window. */
function isPlainClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function cloneConfig<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createPresetWidget(
  type: string,
  x: number,
  y: number,
  overrides: Partial<Pick<WidgetDefinition['layout'], 'w' | 'h'>> = {}
): WidgetDefinition | null {
  const entry = getWidgetByType(type);
  if (!entry) return null;

  return {
    id: uuidv4(),
    type: entry.type,
    title: entry.name,
    config: cloneConfig(entry.defaultConfig),
    layout: {
      x,
      y,
      w: overrides.w ?? entry.defaultLayout.w,
      h: overrides.h ?? entry.defaultLayout.h,
      minW: entry.defaultLayout.minW,
      minH: entry.defaultLayout.minH,
      maxW: entry.defaultLayout.maxW,
      maxH: entry.defaultLayout.maxH,
    },
  };
}

function createPresetLayout(name: (typeof PRESET_VIEW_NAMES)[number]): DashboardLayout {
  const iconByName: Record<(typeof PRESET_VIEW_NAMES)[number], string> = {
    Morning: 'IconSun',
    Evening: 'IconMoon',
    Weekend: 'IconCalendarWeek',
  };

  const widgetSpecs: Record<(typeof PRESET_VIEW_NAMES)[number], Array<{ type: string; x: number; y: number; w?: number; h?: number }>> = {
    Morning: [
      { type: 'clock', x: 0, y: 0 },
      { type: 'weather', x: 3, y: 0 },
      { type: 'google-calendar-day', x: 6, y: 0, w: 3, h: 4 },
      { type: 'todo', x: 9, y: 0, w: 3, h: 4 },
      { type: 'news', x: 0, y: 3, w: 6, h: 4 },
    ],
    Evening: [
      { type: 'clock', x: 0, y: 0 },
      { type: 'todo', x: 3, y: 0, w: 3, h: 4 },
      { type: 'google-calendar-day', x: 6, y: 0, w: 3, h: 4 },
      { type: 'photo', x: 9, y: 0, w: 3, h: 3 },
      { type: 'weather', x: 0, y: 2, w: 3, h: 3 },
    ],
    Weekend: [
      { type: 'clock', x: 0, y: 0 },
      { type: 'google-calendar-month', x: 3, y: 0, w: 5, h: 5 },
      { type: 'todo', x: 8, y: 0, w: 4, h: 4 },
      { type: 'weather', x: 0, y: 2, w: 3, h: 3 },
      { type: 'news', x: 8, y: 4, w: 4, h: 3 },
    ],
  };

  const widgets = widgetSpecs[name]
    .map((spec) => createPresetWidget(spec.type, spec.x, spec.y, { w: spec.w, h: spec.h }))
    .filter((widget): widget is WidgetDefinition => widget !== null);

  return {
    id: uuidv4(),
    name,
    icon: iconByName[name],
    widgets,
    columns: 12,
    rowHeight: 80,
  };
}

// ─── Sortable view row ─────────────────────────────────────────────────────────

type TablerIcon = ComponentType<{ size?: number; stroke?: number }>;

const TABLER_ICONS = TablerIcons as unknown as Record<string, TablerIcon | undefined>;

/** A view's chosen icon (stored by Tabler export name), or a smiley placeholder. */
function ViewIconGlyph({ name }: { name: string | undefined }) {
  const Icon = name ? TABLER_ICONS[name] : undefined;
  return Icon ? createElement(Icon, { size: 18, stroke: 1.6 }) : <IconMoodSmile size={18} stroke={1.4} />;
}

interface ViewRowProps {
  layout: DashboardLayout;
  index: number;
  editHref: string;
  onDelete: () => void;
  onRename: () => void;
  onToggleHidden: () => void;
  onSetIcon: (icon: string | undefined) => void;
}

function SortableViewRow({ layout, index, editHref, onDelete, onRename, onToggleHidden, onSetIcon }: ViewRowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: layout.id,
  });
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const widgetCount = layout.widgets.length;

  return (
    <li
      ref={setNodeRef}
      data-view-row={layout.id}
      className={s.viewRow}
      data-dragging={isDragging || undefined}
      data-hidden={layout.hidden || undefined}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className={s.dragHandle}
        aria-label={`Reorder ${layout.name}`}
        {...attributes}
        {...listeners}
      >
        <IconGripVertical size={16} aria-hidden />
      </button>

      {/* One leading visual: the layout thumbnail with the view's icon (and its picker) in the
          corner. Narrow phones drop the thumbnail and keep the icon. */}
      <div className={s.viewVisual}>
        <Link to={editHref} className={s.viewThumb} tabIndex={-1} aria-hidden>
          <LayoutThumbnail layout={layout} size="sm" />
        </Link>
        <span className={s.viewIcon}>
          <Hint label={layout.icon ? 'Change icon' : 'Add an icon'}>
            <IconButton
              icon={<ViewIconGlyph name={layout.icon} />}
              aria-label={layout.icon ? `Change icon for ${layout.name}` : `Add an icon to ${layout.name}`}
              appearance={layout.icon ? 'subtle' : 'outline'}
              tone={layout.icon ? 'accent' : 'neutral'}
              size="sm"
              onClick={() => setIconPickerOpen(true)}
            />
          </Hint>
        </span>
      </div>

      <div className={s.viewMain}>
        <Link to={editHref} className={s.viewName} data-view-name="">
          {layout.name}
        </Link>
        <span className={s.viewMeta}>
          <span>
            {index === 0 ? 'Shown first' : `View ${index + 1}`}
            <span aria-hidden> · </span>
            {widgetCount} {widgetCount === 1 ? 'widget' : 'widgets'}
          </span>
          {layout.hidden && (
            <Badge tone="warning" appearance="subtle">
              Hidden from display
            </Badge>
          )}
        </span>
      </div>

      <div className={s.viewActions}>
        <Hint label="Rename">
          <IconButton icon={<IconPencil size={16} />} aria-label={`Rename ${layout.name}`} appearance="ghost" onClick={onRename} />
        </Hint>
        <Hint label={layout.hidden ? 'Show on display' : 'Hide from display'}>
          <IconButton
            icon={layout.hidden ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            aria-label={layout.hidden ? `Show ${layout.name} on the display` : `Hide ${layout.name} from the display`}
            aria-pressed={layout.hidden}
            appearance="ghost"
            onClick={onToggleHidden}
          />
        </Hint>
        <Hint label="Delete">
          <IconButton
            icon={<IconTrash size={16} />}
            aria-label={`Delete ${layout.name}`}
            appearance="ghost"
            tone="danger"
            onClick={onDelete}
          />
        </Hint>
        <Button href={editHref} size="sm" className={s.editButton}>
          Edit layout
        </Button>
      </div>

      <IconPickerModal
        opened={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        currentIcon={layout.icon}
        onSelect={onSetIcon}
      />
    </li>
  );
}

// ─── Settings anatomy ──────────────────────────────────────────────────────────

/** A labelled switch row: text on the left, the switch right-aligned, max 560px wide. */
function SwitchSetting({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: ReactNode;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className={s.settingRow} data-disabled={disabled || undefined}>
      <div className={s.settingText}>
        <span id={`${id}-label`} className={s.settingLabel}>
          {label}
        </span>
        <span id={`${id}-description`} className={s.settingDescription}>
          {description}
        </span>
      </div>
      <Switch
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-description`}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
        className={s.settingControl}
      />
    </div>
  );
}

/** One settings group: a titled card whose fields are spaced on a 20px rhythm. */
function SettingsGroup({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  const id = useId();
  return (
    <section className={s.group} aria-labelledby={id}>
      <div className={s.groupHeader}>
        <h3 id={id} className={s.groupTitle}>
          {title}
        </h3>
        {description ? <p className={s.groupDescription}>{description}</p> : null}
      </div>
      <div className={s.groupBody}>{children}</div>
    </section>
  );
}

/** Placeholder while a lazy tab panel loads. */
function PanelSkeleton({ label }: { label: string }) {
  return (
    <div className={s.panelSkeleton} role="status" aria-label={label}>
      <Skeleton className={s.skeletonSide} />
      <Skeleton className={s.skeletonMain} />
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function DisplayDetailPage() {
  const { user, accessToken } = useAuth();
  const {
    displays,
    selectedDisplayId,
    renameDisplay,
    createLayout,
    upsertDisplay,
    deleteLayout,
    renameLayout,
    reorderLayouts,
    toggleLayoutHidden,
    setLayoutIcon,
    setRotationEnabled,
    setRotationIntervalMs,
    setColorMode,
    setPasscodeEnabled,
    setStickyNotesEnabled,
    setVoiceEnabled,
    setHolidayEffectsEnabled,
    setHolidayPreviewId,
    setAlarms,
    openPreview,
  } = useDashboardStore();
  const display = displays.find((d) => d.id === selectedDisplayId);
  const colorMode: ColorMode = display?.colorMode ?? 'dark';
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const saveSeq = useRef(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSaving, setPinSaving] = useState(false);

  // Dialog modals replacing native alert / confirm / prompt
  const [alertOpen, setAlertOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newViewOpen, setNewViewOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('New View');
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [renameViewId, setRenameViewId] = useState<string | null>(null);
  const [renameViewValue, setRenameViewValue] = useState('');
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activePage: ManagementPage = MANAGEMENT_PAGES.includes(tabParam as ManagementPage)
    ? (tabParam as ManagementPage)
    : 'views';
  // Tabs are links (?tab=…), and React Router renders navigations as transitions. Track the
  // clicked tab locally so the highlight and panel switch on the click, not when the
  // transition commits. It is dropped as soon as the URL moves off the page it was set on.
  const [pendingPage, setPendingPage] = useState<{ page: ManagementPage; from: ManagementPage } | null>(null);
  const shownPage = pendingPage && pendingPage.from === activePage ? pendingPage.page : activePage;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const alarmsSaveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const themePreviewViews = useMemo(
    () => (display ? displayRecordToDocument(display).views.filter((v) => !v.hidden) : []),
    [display],
  );

  useDocumentTitle(display ? `${display.name} · ${PAGE_TITLES[shownPage]}` : null);

  if (!display) return null;

  const handleConfigError = (err: unknown) => {
    if (err instanceof ApiError && err.code === 'view_limit') {
      setUpgradeOpen(true);
      return;
    }
    console.error(err);
    notify({ tone: 'danger', title: 'Changes not saved', description: 'Check your connection — your last change may not reach the display.' });
  };

  // Plan-limit hints, from the same entitlement checks that open the Upgrade dialog.
  const viewEntitlements = entitlementsForPlan(display.ownerPlan);
  const existingViewNames = new Set(display.layouts.map((layout) => layout.name.trim().toLowerCase()));
  const missingPresetViews = PRESET_VIEW_NAMES.filter((name) => !existingViewNames.has(name.toLowerCase()));
  const newViewNeedsPro = wouldExceedViewLimit(display.layouts.length, 1, viewEntitlements);
  const allStarterViewsAdded = missingPresetViews.length === 0;
  // Same rule as New view: at the plan limit the action stays visible and leads to Upgrade.
  const starterViewsNeedPro = wouldExceedViewLimit(
    display.layouts.length,
    Math.max(missingPresetViews.length, 1),
    viewEntitlements,
  );

  const wouldBlockNewViews = (additionalCount: number): boolean => {
    const entitlements = entitlementsForPlan(display.ownerPlan);
    if (wouldExceedViewLimit(display.layouts.length, additionalCount, entitlements)) {
      setUpgradeOpen(true);
      return true;
    }
    return false;
  };

  const saveConfig = (overrides: Partial<typeof display> = {}) => {
    if (!accessToken) return;
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
    } = {
      ...display,
      ...overrides,
    };
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
    const seq = ++saveSeq.current;
    setSaveState('saving');
    void apiClient
      .put<unknown, ConfigUpsertRequest>('/api/config', {
        token: accessToken,
        query: { displayId: display.id },
        body: payload,
      })
      .then(() => {
        if (seq === saveSeq.current) setSaveState('saved');
      })
      .catch((err) => {
        if (seq === saveSeq.current) setSaveState('error');
        handleConfigError(err);
      });
  };

  /** Move keyboard focus to a view row's name link (after delete / undo), else the Views heading. */
  const focusViewRow = (viewId: string | null) => {
    setTimeout(() => {
      const target =
        (viewId ? document.querySelector<HTMLElement>(`[data-view-row="${viewId}"] [data-view-name]`) : null) ??
        document.getElementById('views-heading');
      target?.focus();
    }, 0);
  };

  /** After the confirmation: delete, keep the user's place, and offer Undo for a while. */
  const handleConfirmDeleteView = () => {
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    const index = display.layouts.findIndex((l) => l.id === id);
    const removed = display.layouts[index];
    if (!id || !removed) return;
    const displayId = display.id;
    const remaining = display.layouts.filter((l) => l.id !== id);
    deleteLayout(id);
    saveConfig({ layouts: remaining });
    focusViewRow(remaining[index]?.id ?? remaining[index - 1]?.id ?? null);
    notify({
      tone: 'success',
      title: `Deleted “${removed.name}”`,
      action: {
        label: 'Undo',
        onAction: () => {
          const current = useDashboardStore.getState().displays.find((d) => d.id === displayId);
          if (!current || current.layouts.some((l) => l.id === removed.id)) return;
          const layouts = [...current.layouts];
          layouts.splice(Math.min(index, layouts.length), 0, removed);
          upsertDisplay({ ...current, layouts });
          saveConfig({ layouts });
          focusViewRow(removed.id);
          notify({ tone: 'success', title: `Restored “${removed.name}”` });
        },
      },
    });
  };

  const handleSetIcon = (id: string, icon: string | undefined) => {
    setLayoutIcon(id, icon);
    saveConfig({ layouts: display.layouts.map((l) => (l.id === id ? { ...l, icon } : l)) });
  };

  const openRenameView = (id: string, name: string) => {
    setRenameViewId(id);
    setRenameViewValue(name);
  };

  const commitRenameView = () => {
    const trimmed = renameViewValue.trim();
    const current = display.layouts.find((l) => l.id === renameViewId);
    if (renameViewId && trimmed && current && trimmed !== current.name) {
      handleRenameView(renameViewId, trimmed);
    }
    setRenameViewId(null);
  };

  const commitNewView = () => {
    const trimmed = newViewName.trim();
    if (!trimmed) return;
    if (wouldBlockNewViews(1)) {
      setNewViewOpen(false);
      return;
    }
    createLayout(trimmed);
    const updated = useDashboardStore.getState().displays.find((d) => d.id === display.id);
    if (updated) saveConfig({ layouts: updated.layouts });
    setNewViewOpen(false);
  };

  const handleRename = (nextName: string) => {
    const trimmed = nextName.trim();
    if (!trimmed || trimmed === display.name) return;
    const previous = display.name;
    renameDisplay(display.id, trimmed);
    if (accessToken) {
      void apiClient
        .patch<unknown, DisplayRenameRequest>('/api/displays', {
          token: accessToken,
          query: { id: display.id },
          body: { name: trimmed },
        })
        .then(() => notify({ tone: 'success', title: `Renamed to “${trimmed}”`, durationMs: 2500 }))
        .catch((err) => {
          console.error(err);
          renameDisplay(display.id, previous);
          notify({ tone: 'danger', title: 'Could not rename the display', description: 'Your change was undone. Try again.' });
        });
    }
  };

  const handleSavePin = async (pin: string | null) => {
    if (!accessToken) return;
    if (pin !== null && !/^\d{4}$/.test(pin)) {
      setPinError('PIN must be exactly 4 digits');
      return;
    }
    setPinSaving(true);
    setPinError(null);
    try {
      await apiClient.patch<unknown, DisplayPasscodeRequest>('/api/displays', {
        token: accessToken,
        query: { id: display.id },
        body: { passcode: pin },
      });
      setPasscodeEnabled(display.id, pin !== null);
      setPinInput('');
    } catch (err) {
      setPinError(err instanceof ApiError ? err.message : 'Network error');
    } finally {
      setPinSaving(false);
    }
  };

  const handleNewView = () => {
    if (wouldBlockNewViews(1)) return;
    setNewViewName('New View');
    setNewViewOpen(true);
  };

  const handleAddPresetViews = () => {
    const missing = missingPresetViews;
    if (missing.length === 0) {
      if (starterViewsNeedPro) setUpgradeOpen(true);
      return;
    }
    if (wouldBlockNewViews(missing.length)) return;

    const presetLayouts = missing.map((name) => createPresetLayout(name));
    const updatedLayouts = [...display.layouts, ...presetLayouts];

    upsertDisplay({
      ...display,
      layouts: updatedLayouts,
      activeLayoutId: display.activeLayoutId ?? updatedLayouts[0]?.id ?? null,
    });
    saveConfig({ layouts: updatedLayouts });
    notify({
      tone: 'success',
      title: missing.length === 1 ? `Added “${missing[0]}”` : `Added ${missing.slice(0, -1).join(', ')} and ${missing[missing.length - 1]}`,
      description: 'Starter views come with a few widgets to edit.',
    });
  };

  const handleDeleteView = (id: string) => {
    if (display.layouts.length <= 1) {
      setAlertOpen(true);
      return;
    }
    setConfirmDeleteId(id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = display.layouts.map((l) => l.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    const newOrder = arrayMove(ids, oldIndex, newIndex);
    reorderLayouts(newOrder);
    saveConfig({ layouts: arrayMove(display.layouts, oldIndex, newIndex) });
    const moved = display.layouts[oldIndex];
    if (moved) {
      notify({
        tone: 'success',
        title: newIndex === 0 ? `“${moved.name}” now shows first` : `Moved “${moved.name}” to position ${newIndex + 1}`,
        durationMs: 2500,
      });
    }
  };

  const handleRenameView = (id: string, name: string) => {
    renameLayout(id, name);
    // saveConfig will be triggered by the store subscription in ViewEditorPage;
    // here we do it directly since we're on DisplayDetailPage
    const updatedLayouts = display.layouts.map((l) => l.id === id ? { ...l, name } : l);
    saveConfig({ layouts: updatedLayouts });
    notify({ tone: 'success', title: `Renamed to “${name}”`, durationMs: 2500 });
  };

  const handleToggleHidden = (id: string) => {
    const target = display.layouts.find((l) => l.id === id);
    toggleLayoutHidden(id);
    const updatedLayouts = display.layouts.map((l) => l.id === id ? { ...l, hidden: !l.hidden } : l);
    saveConfig({ layouts: updatedLayouts });
    if (target) {
      notify({
        tone: 'success',
        title: target.hidden ? `“${target.name}” is back on the display` : `“${target.name}” is hidden from the display`,
        durationMs: 2500,
      });
    }
  };

  const deleteTarget = display.layouts.find((l) => l.id === confirmDeleteId);
  const isOwner = display.isOwner ?? true;
  const visibleLayoutCount = display.layouts.filter((l) => !l.hidden).length;
  const navItems: Array<{ key: ManagementPage; label: string; icon: ComponentType<{ size?: number }> }> = [
    { key: 'views', label: 'Views', icon: IconLayoutGrid },
    { key: 'settings', label: 'Settings', icon: IconSettings },
    { key: 'theme', label: 'Theme', icon: IconPalette },
  ];
  const basePath = `/displays/${display.id}`;
  const hrefFor = (page: ManagementPage) => (page === 'views' ? basePath : `${basePath}?tab=${page}`);
  const rotationDescription =
    visibleLayoutCount <= 1
      ? display.layouts.length <= 1
        ? 'Add a second view to turn on rotation.'
        : 'Show at least two views to turn on rotation.'
      : 'The display cycles through every visible view.';

  const sectionHeader = (title: string, lead: ReactNode, extra?: { badge?: ReactNode; actions?: ReactNode }) => (
    <header className={ph.root}>
      <div className={ph.text}>
        <div className={ph.titleRow}>
          <h2 className={ph.title}>{title}</h2>
          {extra?.badge}
        </div>
        <p className={ph.lead}>{lead}</p>
      </div>
      {extra?.actions ? <div className={ph.actions}>{extra.actions}</div> : null}
    </header>
  );

  return (
    <>
    <ShareDisplayModal
      opened={shareOpen}
      onClose={() => setShareOpen(false)}
      displayId={display.displayId}
      displayName={display.name}
      passcodeEnabled={display.passcodeEnabled}
    />
    {isOwner && accessToken && (
      <InviteModal
        opened={inviteOpen}
        onClose={() => setInviteOpen(false)}
        displayId={display.id}
        displayName={display.name}
        accessToken={accessToken}
      />
    )}
    <UpgradeModal opened={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

    <ConfirmDialog
      open={alertOpen}
      onOpenChange={(open) => setAlertOpen(open)}
      title="Keep at least one view"
      dismissable
    >
      <Text size="sm" tone="secondary">
        A display needs a view to show. Add another view before deleting this one.
      </Text>
      <AlertDialog.Actions>
        <Button tone="accent" appearance="solid" onClick={() => setAlertOpen(false)} ref={dialogAutoFocus}>
          Got it
        </Button>
      </AlertDialog.Actions>
    </ConfirmDialog>

    <ConfirmDialog
      open={confirmDeleteId !== null}
      onOpenChange={(open) => {
        if (!open) setConfirmDeleteId(null);
      }}
      title={deleteTarget ? `Delete “${deleteTarget.name}”?` : 'Delete view?'}
    >
      <Text size="sm" tone="secondary">
        Its widgets and layout are removed from this display. You can undo this for a few seconds afterwards.
      </Text>
      <AlertDialog.Actions>
        <Button onClick={() => setConfirmDeleteId(null)} ref={dialogAutoFocus}>
          Cancel
        </Button>
        <Button tone="danger" appearance="solid" onClick={handleConfirmDeleteView}>
          Delete view
        </Button>
      </AlertDialog.Actions>
    </ConfirmDialog>


    <Dialog
      open={newViewOpen}
      onOpenChange={(open) => setNewViewOpen(open)}
      title="New view"
      description="Views are full-screen layouts the display can rotate through."
      size="lg"
    >
      <form
        className={s.dialogForm}
        onSubmit={(event) => {
          event.preventDefault();
          commitNewView();
        }}
      >
        <TextField
          label="View name"
          value={newViewName}
          onValueChange={setNewViewName}
          ref={dialogAutoFocusSelect}
        />
        <Dialog.Actions>
          <Button type="button" onClick={() => setNewViewOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" tone="accent" appearance="solid" disabled={!newViewName.trim()}>
            Create view
          </Button>
        </Dialog.Actions>
      </form>
    </Dialog>

    <Dialog
      open={renameViewId !== null}
      onOpenChange={(open) => {
        if (!open) setRenameViewId(null);
      }}
      title="Rename view"
      size="lg"
    >
      <form
        className={s.dialogForm}
        onSubmit={(event) => {
          event.preventDefault();
          commitRenameView();
        }}
      >
        <TextField
          label="View name"
          value={renameViewValue}
          onValueChange={setRenameViewValue}
          ref={dialogAutoFocusSelect}
        />
        <Dialog.Actions>
          <Button type="button" onClick={() => setRenameViewId(null)}>
            Cancel
          </Button>
          <Button type="submit" tone="accent" appearance="solid" disabled={!renameViewValue.trim()}>
            Save
          </Button>
        </Dialog.Actions>
      </form>
    </Dialog>

    <ManagementShell
      title={
        <EditableText
          value={display.name}
          onCommit={handleRename}
          activation="click"
          readOnly={!isOwner}
          aria-label="Display name"
          className={s.titleEditor}
        >
          <h1 className={s.title}>{display.name}</h1>
        </EditableText>
      }
      navLabel="Display sections"
      nav={navItems.map((item) => {
        const Icon = item.icon;
        return (
          <TopNav.Item
            key={item.key}
            label={item.label}
            icon={<Icon size={16} />}
            href={hrefFor(item.key)}
            selected={shownPage === item.key}
            onClick={(event: MouseEvent) => {
              if (isPlainClick(event) && item.key !== shownPage) {
                setPendingPage({ page: item.key, from: activePage });
              }
            }}
            onPointerEnter={item.key === 'theme' ? prefetchThemeEditor : undefined}
            onFocus={item.key === 'theme' ? prefetchThemeEditor : undefined}
          />
        );
      })}
      actions={
        <>
          {isOwner && (
            <Hint label="Invite people">
              <IconButton
                icon={<IconUserPlus size={18} />}
                aria-label="Invite people to this display"
                appearance="ghost"
                onClick={() => setInviteOpen(true)}
              />
            </Hint>
          )}
          <Hint label="Open on a tablet">
            <IconButton
              icon={<IconQrcode size={18} />}
              aria-label="Open this display on a tablet"
              appearance="ghost"
              onClick={() => setShareOpen(true)}
            />
          </Hint>
        </>
      }
      overflowActions={[
        ...(isOwner ? [{ id: 'invite', label: 'Invite people…', onAction: () => setInviteOpen(true) }] : []),
        { id: 'share', label: 'Open on a tablet…', onAction: () => setShareOpen(true) },
      ]}
    >
      {shownPage === 'views' && (
        <section aria-labelledby="views-heading">
          <header className={ph.root}>
            <div className={ph.text}>
              <div className={ph.titleRow}>
                <h2 id="views-heading" className={ph.title} tabIndex={-1}>
                  Views
                </h2>
                <PlanUsageIndicator
                  plan={display.ownerPlan ?? user?.plan}
                  kind="view"
                  used={display.layouts.length}
                  onUpgradeClick={() => setUpgradeOpen(true)}
                />
              </div>
              <p className={ph.lead}>
                The display shows these in order
                {display.rotationEnabled && visibleLayoutCount > 1 ? ' and rotates through the visible ones' : ''}. Drag
                to reorder.
              </p>
            </div>
            <div className={ph.actions}>
              <Button
                appearance="outline"
                onClick={() => openPreview({ displayId: display.displayId, forceRotation: true, colorMode })}
              >
                <IconDeviceTv size={16} aria-hidden />
                Preview
              </Button>
              <Button
                appearance="outline"
                onClick={handleAddPresetViews}
                disabled={allStarterViewsAdded && !starterViewsNeedPro}
                aria-label={starterViewsNeedPro ? 'Add starter views (needs Pro)' : 'Add starter views'}
                title={allStarterViewsAdded && !starterViewsNeedPro ? 'Morning, Evening and Weekend are already here' : undefined}
              >
                <IconSparkles size={16} aria-hidden />
                <span className={s.labelLong}>Add starter views</span>
                <span className={s.labelShort}>Starter views</span>
                {starterViewsNeedPro ? <ProBadge /> : null}
              </Button>
              <Button
                tone="accent"
                appearance="solid"
                onClick={handleNewView}
                aria-label={newViewNeedsPro ? 'New view (needs Pro)' : undefined}
              >
                <IconPlus size={16} aria-hidden />
                New view
                {newViewNeedsPro ? <ProBadge /> : null}
              </Button>
            </div>
          </header>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={display.layouts.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <ol className={s.viewList} aria-label="Views in display order">
                {display.layouts.map((layout, index) => (
                  <SortableViewRow
                    key={layout.id}
                    layout={layout}
                    index={index}
                    editHref={`/displays/${display.id}/views/${layout.id}`}
                    onDelete={() => handleDeleteView(layout.id)}
                    onRename={() => openRenameView(layout.id, layout.name)}
                    onToggleHidden={() => handleToggleHidden(layout.id)}
                    onSetIcon={(icon) => handleSetIcon(layout.id, icon)}
                  />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
        </section>
      )}

      {shownPage === 'settings' && (
        <section aria-label="Settings" className={s.settingsPage}>
          {sectionHeader('Settings', 'How this display looks and behaves on the wall.', {
            actions: <SaveStatus state={saveState} />,
          })}

          <div className={s.settings}>
            <SettingsGroup
              title="Appearance"
              description="The display’s own light or dark look. The editor and preview show it the same way; the app follows your own setting in the account menu."
            >
              <div className={s.field}>
                <span id="display-color-mode-label" className={s.settingLabel}>
                  Display colour mode
                </span>
                <SegmentedControl
                  aria-labelledby="display-color-mode-label"
                  options={[
                    { value: 'light', label: 'Light', icon: <IconSun size={16} aria-hidden /> },
                    { value: 'dark', label: 'Dark', icon: <IconMoon size={16} aria-hidden /> },
                  ]}
                  value={colorMode}
                  onValueChange={(value) => {
                    if (value !== 'light' && value !== 'dark') return;
                    setColorMode(display.id, value);
                    saveConfig({ colorMode: value });
                  }}
                />
              </div>
            </SettingsGroup>

            <SettingsGroup
              title="Viewer PIN"
              description={
                <span className={s.pinStatus}>
                  {display.passcodeEnabled ? <IconLock size={16} aria-hidden /> : <IconLockOpen size={16} aria-hidden />}
                  {display.passcodeEnabled
                    ? 'A PIN is required to view this display.'
                    : 'Anyone with the link can view this display.'}
                </span>
              }
            >
              <form
                className={s.pinForm}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (pinInput.length === 4) void handleSavePin(pinInput);
                }}
              >
                <PinInput
                  label={display.passcodeEnabled ? 'New 4-digit PIN' : '4-digit PIN'}
                  length={4}
                  value={pinInput}
                  onValueChange={(val) => {
                    setPinInput(val);
                    setPinError(null);
                  }}
                  errorMessage={pinError ?? undefined}
                  className={s.pinInput}
                />
                <div className={s.pinActions}>
                  <Button type="submit" tone="accent" appearance="solid" disabled={pinInput.length !== 4} loading={pinSaving}>
                    {display.passcodeEnabled ? 'Change PIN' : 'Require PIN'}
                  </Button>
                  {display.passcodeEnabled && (
                    <Button type="button" tone="danger" appearance="ghost" loading={pinSaving} onClick={() => void handleSavePin(null)}>
                      Remove PIN
                    </Button>
                  )}
                </div>
              </form>
            </SettingsGroup>

            <SettingsGroup title="Rotation">
              <SwitchSetting
                label="Rotate through views"
                description={rotationDescription}
                checked={display.rotationEnabled}
                disabled={visibleLayoutCount <= 1}
                onChange={(checked) => {
                  setRotationEnabled(checked);
                  saveConfig({ rotationEnabled: checked });
                }}
              />
              {display.rotationEnabled && visibleLayoutCount > 1 && (
                <Select
                  label="Show each view for"
                  options={INTERVAL_OPTIONS}
                  value={String(display.rotationIntervalMs)}
                  onValueChange={(v) => {
                    if (!v) return;
                    setRotationIntervalMs(Number(v));
                    saveConfig({ rotationIntervalMs: Number(v) });
                  }}
                  className={s.settingSelect}
                />
              )}
            </SettingsGroup>

            <SettingsGroup
              title="Alarms"
              description="Recurring alarms ring on this display with sound. Snooze for 5, 10, or 15 minutes."
            >
              <div className={s.embeddedEditor} data-hs-chrome="">
                <AlarmListEditor
                  alarms={display.alarms ?? []}
                  onChange={(next) => {
                    setAlarms(display.id, next);
                    setSaveState('saving');
                    if (alarmsSaveDebounceRef.current) clearTimeout(alarmsSaveDebounceRef.current);
                    alarmsSaveDebounceRef.current = setTimeout(() => {
                      saveConfig({ alarms: next });
                    }, 500);
                  }}
                />
              </div>
              <SwitchSetting
                label="Voice commands"
                description="Say “dismiss” or “snooze” when an alarm rings. The display asks for microphone access (Chrome over HTTPS works best)."
                checked={display.voiceEnabled ?? false}
                onChange={(checked) => {
                  setVoiceEnabled(display.id, checked);
                  saveConfig({ voiceEnabled: checked });
                }}
              />
            </SettingsGroup>

            <SettingsGroup title="Extras">
              <SwitchSetting
                label="Sticky notes"
                description="Adds a + button for quick floating notes on every view, in the editor and on the display."
                checked={display.stickyNotesEnabled ?? false}
                onChange={(checked) => {
                  setStickyNotesEnabled(display.id, checked);
                  saveConfig({ stickyNotesEnabled: checked });
                }}
              />
              <SwitchSetting
                label="Holiday touches"
                description="Seasonal visuals on matching dates, like St. Patrick’s Day."
                checked={display.holidayEffectsEnabled ?? false}
                onChange={(checked) => {
                  setHolidayEffectsEnabled(display.id, checked);
                  saveConfig({ holidayEffectsEnabled: checked });
                }}
              />
              {display.holidayEffectsEnabled && (
                <Select
                  label="Preview a holiday"
                  description="Force a holiday look to check it. Auto follows today’s date."
                  options={[{ value: 'auto', label: 'Auto (today)' }, ...HOLIDAY_PREVIEW_OPTIONS]}
                  value={display.holidayPreviewId ?? 'auto'}
                  onValueChange={(value) => {
                    const nextValue: HolidayId | undefined =
                      value && value !== 'auto' ? (value as HolidayId) : undefined;
                    setHolidayPreviewId(display.id, nextValue);
                    saveConfig({ holidayPreviewId: nextValue });
                  }}
                  className={s.settingSelect}
                />
              )}
            </SettingsGroup>
          </div>
        </section>
      )}

      {shownPage === 'theme' && (
        <section aria-label="Theme">
          {sectionHeader(
            'Theme',
            'Colours, fonts and backgrounds for this display. Create a theme from a preset, edit it, then mark it active.',
            { actions: <SaveStatus state={saveState} /> },
          )}
          <div className={s.themeSection} data-hs-chrome="">
            <Suspense fallback={<PanelSkeleton label="Loading the theme editor" />}>
              <ThemeEditor
                documents={display.themes}
                activeThemeDocumentId={display.activeThemeId}
                previewViews={themePreviewViews}
                initialPreviewViewId={display.activeLayoutId}
                onChange={(themes, activeThemeId) => {
                  upsertDisplay({
                    ...display,
                    themes,
                    activeThemeId,
                  });
                  saveConfig({ themes, activeThemeId });
                }}
              />
            </Suspense>
          </div>
        </section>
      )}
    </ManagementShell>
    </>
  );
}
