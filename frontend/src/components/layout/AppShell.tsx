import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../../lib/api";
import { formatRelativeTime } from "../../lib/utils";
import { useDashboardStore } from "../../store/useDashboardStore";
import { Button } from "../ui/Button";
import { StatusPill } from "../ui/StatusPill";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/settings", label: "Settings" },
  { to: "/history", label: "History" }
];

export function AppShell() {
  const navigate = useNavigate();
  const snapshot = useDashboardStore((state) => state.snapshot);
  const reset = useDashboardStore((state) => state.reset);
  const giveaway = snapshot?.giveaway;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(26,192,245,0.16),_transparent_26%),radial-gradient(circle_at_85%_16%,_rgba(255,114,94,0.12),_transparent_18%),linear-gradient(180deg,_#060916_0%,_#03050c_100%)] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.015)_100%)]" />
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(13,20,37,0.95),rgba(6,10,20,0.9))] px-5 py-5 shadow-soft backdrop-blur-xl">
          <div className="pointer-events-none absolute -left-10 top-0 h-44 w-44 rounded-full bg-brand-400/15 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[rgba(255,114,94,0.1)] blur-3xl" />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-4">
                {snapshot?.broadcaster.profileImageUrl ? (
                  <img
                    src={snapshot.broadcaster.profileImageUrl}
                    alt={snapshot.broadcaster.displayName}
                    className="h-16 w-16 rounded-3xl border border-white/10 object-cover shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-xl font-bold text-brand-100">
                    {(snapshot?.broadcaster.displayName ?? "T").slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="section-kicker">Twitch Giveaway Wheel</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
                      {snapshot?.broadcaster.channelName ?? snapshot?.broadcaster.displayName ?? "Dashboard"}
                    </h1>
                    <StatusPill status={snapshot?.twitch.status ?? "disconnected"} />
                  </div>
                  <p className="mt-2 max-w-3xl text-sm text-slate-300">
                    Stream control room for live entrants, weighted picks, and an OBS-ready wheel overlay.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="metric-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current state</p>
                  <p className="mt-2 text-xl font-bold text-white">{giveaway?.status === "OPEN" ? "Open" : "Closed"}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {giveaway ? `Join with ${giveaway.entryCommand}` : "Waiting for session"}
                  </p>
                </div>
                <div className="metric-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Entrants live</p>
                  <p className="mt-2 text-xl font-bold text-white">{giveaway?.entrantCount ?? 0}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {giveaway ? `${giveaway.winners.length} winners logged` : "No activity yet"}
                  </p>
                </div>
                <div className="metric-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Connection</p>
                  <p className="mt-2 text-xl font-bold text-white">{snapshot?.twitch.status ?? "disconnected"}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {snapshot?.twitch.lastConnectedAt
                      ? `Last sync ${formatRelativeTime(snapshot.twitch.lastConnectedAt)}`
                      : "Waiting for EventSub session"}
                  </p>
                </div>
                <div className="metric-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Overlay</p>
                  <p className="mt-2 text-xl font-bold text-white">{snapshot?.overlayUrl ? "Ready" : "Offline"}</p>
                  <p className="mt-1 truncate text-sm text-slate-400">{snapshot?.overlayUrl ?? "No overlay yet"}</p>
                </div>
              </div>

              {snapshot?.twitch.lastError ? (
                <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  Twitch connection warning: {snapshot.twitch.lastError}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col items-stretch gap-3 xl:items-end">
              <nav className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1.5">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `rounded-full px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-brand-300 text-slate-950 shadow-[0_12px_30px_rgba(71,215,255,0.25)]"
                          : "text-slate-200 hover:bg-white/[0.08]"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              <Button
                variant="secondary"
                className="min-w-[120px]"
                onClick={async () => {
                  await logout();
                  reset();
                  navigate("/");
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
