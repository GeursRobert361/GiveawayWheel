import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AdSenseScript } from "./components/ads/AdSenseScript";
import { ConsentBanner } from "./components/consent/ConsentBanner";
import { useDashboardRealtime } from "./hooks/useDashboardRealtime";
import { useDashboardStore } from "./store/useDashboardStore";
import { DashboardPage } from "./pages/DashboardPage";
import { HistoryPage } from "./pages/HistoryPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OverlayPage } from "./pages/OverlayPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SetupPage } from "./pages/SetupPage";
import { PrivacyPolicyPage, CookiePolicyPage, TermsOfServicePage, GiveawayRulesPage } from "./pages/legal";

function ProtectedRoutes() {
  const authState = useDashboardStore((state) => state.authState);
  const hasCompletedSetup = useDashboardStore((state) => state.snapshot?.broadcaster.hasCompletedSetup);

  if (authState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-6 py-4 text-sm">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (authState !== "authenticated") {
    return <Navigate to="/" replace />;
  }

  // Redirect to setup if not completed
  if (hasCompletedSetup === false && window.location.pathname !== "/setup") {
    return <Navigate to="/setup" replace />;
  }

  return <AppShell />;
}

export default function App() {
  useDashboardRealtime();
  const authState = useDashboardStore((state) => state.authState);

  const hasCompletedSetup = useDashboardStore((state) => state.snapshot?.broadcaster.hasCompletedSetup);

  return (
    <>
      <AdSenseScript />
      <ConsentBanner />
      <Routes>
      <Route
        path="/"
        element={
          authState === "authenticated"
            ? hasCompletedSetup === false
              ? <Navigate to="/setup" replace />
              : <Navigate to="/dashboard" replace />
            : <LoginPage />
        }
      />
      <Route path="/setup" element={authState === "authenticated" ? <SetupPage /> : <Navigate to="/" replace />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Route>
      <Route path="/overlay/:overlayKey" element={<OverlayPage />} />
      {/* Public legal pages */}
      <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/legal/cookies" element={<CookiePolicyPage />} />
      <Route path="/legal/terms" element={<TermsOfServicePage />} />
      <Route path="/legal/giveaway-rules" element={<GiveawayRulesPage />} />
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
