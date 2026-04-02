import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { logout } from "../../lib/api";
import { useDashboardStore } from "../../store/useDashboardStore";
import { Button } from "../ui/Button";
import { StatusPill } from "../ui/StatusPill";
import { HelpModal } from "../ui/HelpModal";
import { PreferencesPanel } from "../ui/PreferencesPanel";

export function AppShell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const snapshot = useDashboardStore((state) => state.snapshot);
  const reset = useDashboardStore((state) => state.reset);
  const [helpOpen, setHelpOpen] = useState(false);

  const links = [
    { to: "/dashboard", label: t('nav.dashboard') },
    { to: "/settings", label: t('nav.settings') },
    { to: "/history", label: t('nav.history') }
  ];

  return (
    <div className="relative min-h-screen text-slate-100">
      {/* Fixed header */}
      <header className="fixed top-0 z-40 w-full border-b border-slate-800 bg-slate-900 shadow-sm">
        <div className="mx-auto flex h-14 max-w-[1920px] items-center gap-3 px-4 sm:px-6">{/* Header content */}
        {/* Version */}
        <div className="shrink-0 text-xs font-mono text-slate-500">
          v{__BUILD_VERSION__}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-800" />

        {/* Avatar + channel */}
        <div className="flex shrink-0 items-center gap-3">
          {snapshot?.broadcaster.profileImageUrl ? (
            <img
              src={snapshot.broadcaster.profileImageUrl}
              alt={snapshot.broadcaster.displayName}
              className="h-8 w-8 rounded-lg border border-slate-700 object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-600/20 text-sm font-bold text-violet-300">
              {(snapshot?.broadcaster.displayName ?? "T").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight text-white">
              {snapshot?.broadcaster.channelName ?? snapshot?.broadcaster.displayName ?? "Giveaway Wheel"}
            </p>
            <p className="text-xs leading-tight text-slate-500">{t('nav.appSubtitle')}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden h-6 w-px bg-slate-800 sm:block" />

        {/* Nav — centered */}
        <nav className="flex flex-1 justify-center">
          <div className="flex gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-md px-4 py-1.5 text-sm font-semibold transition-colors duration-150 ${
                    isActive
                      ? "bg-violet-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Right: help + status + logout */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setHelpOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-750 hover:text-white"
            title={t('nav.helpTitle')}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <StatusPill status={snapshot?.twitch.status ?? "disconnected"} />
          <Button
            variant="ghost"
            className="text-sm"
            onClick={async () => {
              await logout();
              reset();
              navigate("/");
            }}
          >
            {t('nav.logout')}
          </Button>
        </div>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto flex min-h-screen max-w-[1920px] flex-col px-4 pt-16 sm:px-6">
        {snapshot?.twitch.lastError ? (
          <div className="mt-4 rounded-lg border border-rose-400/20 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-200">
            {t('nav.twitchError')}: {snapshot.twitch.lastError}
          </div>
        ) : null}

        <main className="flex-1 py-4">
          <Outlet />
        </main>
      </div>

      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <PreferencesPanel />
    </div>
  );
}
