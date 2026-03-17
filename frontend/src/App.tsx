import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { useDashboardRealtime } from "./hooks/useDashboardRealtime";
import { useDashboardStore } from "./store/useDashboardStore";
import { DashboardPage } from "./pages/DashboardPage";
import { HistoryPage } from "./pages/HistoryPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OverlayPage } from "./pages/OverlayPage";
import { SettingsPage } from "./pages/SettingsPage";

function ProtectedRoutes() {
  const authState = useDashboardStore((state) => state.authState);

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

  return <AppShell />;
}

export default function App() {
  useDashboardRealtime();
  const authState = useDashboardStore((state) => state.authState);

  return (
    <Routes>
      <Route
        path="/"
        element={authState === "authenticated" ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Route>
      <Route path="/overlay/:overlayKey" element={<OverlayPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
