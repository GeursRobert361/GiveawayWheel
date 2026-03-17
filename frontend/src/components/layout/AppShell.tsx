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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,164,216,0.18),_transparent_34%),linear-gradient(180deg,_#081121_0%,_#04060f_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-white/10 bg-slate-900/70 px-5 py-4 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-200/70">
                Twitch Giveaway Wheel
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-bold text-white">
                  {snapshot?.broadcaster.channelName ?? snapshot?.broadcaster.displayName ?? "Dashboard"}
                </h1>
                <StatusPill status={snapshot?.twitch.status ?? "disconnected"} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <nav className="flex flex-wrap gap-2">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `rounded-2xl px-4 py-2 text-sm font-medium transition ${
                        isActive ? "bg-brand-400 text-slate-950" : "bg-white/5 text-slate-200 hover:bg-white/10"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              <Button
                variant="secondary"
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
