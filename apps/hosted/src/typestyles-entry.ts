/**
 * TypeStyles extraction entry (`@typestyles/vite`).
 *
 * `vite build` executes this module in Node and writes every style it registers
 * to a static CSS asset; the browser bundle then ships no style runtime.
 * Anything not reachable from here has no CSS in production, so import every
 * `*.styles.ts` module below (`typestylesEntry.test.ts` enforces this).
 */
import '@var-ui/core/styles';
import './ui/theme';
import './ui/mantineBridge.styles';
import './ui/global.styles';
import './ui/shared.styles';
import './App.styles';
import './components/AccountMenu.styles';
import './components/AppToasts.styles';
import './components/DisplayViewer.styles';
import './components/GetStarted.styles';
import './components/GoogleSignInButton.styles';
import './components/HomeslateMark.styles';
import './components/IconPickerModal.styles';
import './components/InviteModal.styles';
import './components/LayoutThumbnail.styles';
import './components/PlanUsageIndicator.styles';
import './components/PwaUpdateToast.styles';
import './components/RegisterDeviceModal.styles';
import './components/SaveStatus.styles';
import './components/ShareDisplayModal.styles';
import './components/UpgradeModal.styles';
import './pages/DisplayDetailPage.styles';
import './pages/DisplayListPage.styles';
import './pages/HomePage.styles';
import './pages/KioskCard.styles';
import './pages/PublicLayout.styles';
import './pages/ViewEditorPage.styles';
