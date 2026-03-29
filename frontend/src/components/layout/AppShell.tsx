import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../../lib/api";
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

  return (
    <div className="relative min-h-screen text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">

        {/* Slim sticky header */}
        <header className="sticky top-4 z-40 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-slate-950/85 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          {/* Avatar + channel */}
          <div className="flex shrink-0 items-center gap-3">
            {snapshot?.broadcaster.profileImageUrl ? (
              <img
                src={snapshot.broadcaster.profileImageUrl}
                alt={snapshot.broadcaster.displayName}
                className="h-9 w-9 rounded-xl border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/[0.15] text-sm font-bold text-violet-300">
                {(snapshot?.broadcaster.displayName ?? "T").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-tight text-white">
                {snapshot?.broadcaster.channelName ?? snapshot?.broadcaster.displayName ?? "Giveaway Wheel"}
              </p>
              <p className="text-xs leading-tight text-slate-500">Stream giveaway tool</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden h-6 w-px bg-white/[0.08] sm:block" />

          {/* Nav — centered */}
          <nav className="flex flex-1 justify-center">
            <div className="flex gap-0.5 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-1.5 text-sm font-semibold transition duration-150 ${
                      isActive
                        ? "bg-[linear-gradient(135deg,#7c3aed,#5b21b6)] text-white shadow-[0_4px_14px_rgba(109,40,217,0.45)]"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Right: status + logout */}
          <div className="flex shrink-0 items-center gap-2">
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
              Logout
            </Button>
          </div>
        </header>

        {snapshot?.twitch.lastError ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-200">
            Twitch: {snapshot.twitch.lastError}
          </div>
        ) : null}

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
