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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_rgba(109,40,217,0.22),_transparent_38%),radial-gradient(ellipse_at_top_right,_rgba(26,192,245,0.1),_transparent_30%),linear-gradient(180deg,_#060916_0%,_#03050c_100%)] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(109,40,217,0.03)_100%)]" />
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">

        <header className="relative overflow-hidden rounded-[34px] border border-white/[0.09] bg-[linear-gradient(145deg,rgba(15,22,42,0.96),rgba(6,9,20,0.94))] px-5 py-5 shadow-soft backdrop-blur-xl">
          <div className="pointer-events-none absolute -left-12 top-0 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-56 rounded-full bg-brand-400/[0.07] blur-3xl" />
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-4">
                {snapshot?.broadcaster.profileImageUrl ? (
                  <img
                    src={snapshot.broadcaster.profileImageUrl}
                    alt={snapshot.broadcaster.displayName}
                    className="h-14 w-14 rounded-2xl border border-violet-400/20 object-cover shadow-[0_12px_32px_rgba(124,58,237,0.25)]"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/[0.12] text-lg font-bold text-violet-200">
                    {(snapshot?.broadcaster.displayName ?? "T").slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="section-kicker">Twitch Giveaway Wheel</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3">
                    <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
                      {snapshot?.broadcaster.channelName ?? snapshot?.broadcaster.displayName ?? "Dashboard"}
                    </h1>
                    <StatusPill status={snapshot?.twitch.status ?? "disconnected"} />
                  </div>
                  <p className="mt-1.5 max-w-3xl text-sm text-slate-400">
                    Stream control room — weighted picks, live chat entries, OBS-ready overlay.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="metric-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current state</p>
                  <p className="mt-2 text-xl font-bold text-white">{giveaway?.status === "OPEN" ? "Open" : "Closed"}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {giveaway ? `Join with ${giveaway.entryCommand}` : "Waiting for session"}
                  </p>
                </div>
                <div className="metric-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Entrants live</p>
                  <p className="mt-2 text-xl font-bold text-white">{giveaway?.entrantCount ?? 0}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {giveaway ? `${giveaway.winners.length} winners logged` : "No activity yet"}
                  </p>
                </div>
                <div className="metric-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Connection</p>
                  <p className="mt-2 text-xl font-bold capitalize text-white">{snapshot?.twitch.status ?? "disconnected"}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {snapshot?.twitch.lastConnectedAt
                      ? `Last sync ${formatRelativeTime(snapshot.twitch.lastConnectedAt)}`
                      : "Waiting for EventSub session"}
                  </p>
                </div>
                <div className="metric-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Overlay</p>
                  <p className="mt-2 text-xl font-bold text-white">{snapshot?.overlayUrl ? "Ready" : "Offline"}</p>
                  <p className="mt-1 truncate text-sm text-slate-400">{snapshot?.overlayUrl ?? "No overlay yet"}</p>
                </div>
              </div>

              {snapshot?.twitch.lastError ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-200">
                  Twitch connection warning: {snapshot.twitch.lastError}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col items-stretch gap-3 xl:items-end">
              <nav className="flex flex-wrap gap-1.5 rounded-2xl border border-white/[0.09] bg-white/[0.03] p-1.5">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `rounded-xl px-5 py-2 text-sm font-semibold transition duration-200 ${
                        isActive
                          ? "bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] text-white shadow-[0_8px_20px_rgba(109,40,217,0.4)]"
                          : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
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
