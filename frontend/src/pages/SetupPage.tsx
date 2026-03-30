import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { apiPost } from "../lib/api";
import { useDashboardStore } from "../store/useDashboardStore";

export function SetupPage() {
  const navigate = useNavigate();
  const broadcaster = useDashboardStore((state) => state.snapshot?.broadcaster);
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await apiPost("/api/me/complete-setup");
      // Update local state
      const snapshot = useDashboardStore.getState().snapshot;
      if (snapshot) {
        useDashboardStore.getState().setSnapshot({
          ...snapshot,
          broadcaster: { ...snapshot.broadcaster, hasCompletedSetup: true }
        });
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to complete setup:", error);
      setCompleting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_rgba(109,40,217,0.24),_transparent_38%),radial-gradient(ellipse_at_top_right,_rgba(71,215,255,0.1),_transparent_28%),radial-gradient(circle_at_80%_80%,_rgba(124,58,237,0.1),_transparent_24%),linear-gradient(180deg,_#060916_0%,_#03050c_100%)] px-4 py-8 text-slate-100">
      <div className="pointer-events-none absolute left-8 top-16 h-52 w-52 rounded-full bg-violet-600/[0.12] blur-[80px]" />
      <div className="pointer-events-none absolute right-6 top-20 h-40 w-40 rounded-full bg-brand-300/[0.08] blur-[60px]" />

      <div className="mx-auto max-w-4xl pt-12">
        <div className="mb-8 text-center">
          <h1 className="font-display text-5xl font-bold text-white">
            Welcome, {broadcaster?.displayName}! 🎉
          </h1>
          <p className="mt-3 text-lg text-slate-400">
            You're all set up and ready to run amazing giveaways on your stream
          </p>
        </div>

        <Card className="space-y-6 px-6 py-7 sm:px-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Quick Start Guide</h2>
            <p className="mt-2 text-sm text-slate-400">
              Here's everything you need to know to get started with your first giveaway
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/[0.08] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/30 text-xl">
                  1️⃣
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Create Your First Giveaway</h3>
                  <p className="text-sm text-slate-300">
                    Head to the Dashboard and click "Create new session" to set up your giveaway wheel.
                    Choose a title, customize entry commands, and configure weights for different viewer roles.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-300/20 bg-brand-300/[0.08] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-300/30 text-xl">
                  2️⃣
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Open the Giveaway</h3>
                  <p className="text-sm text-slate-300">
                    Use chat commands like <code className="rounded bg-slate-900/60 px-1.5 py-0.5">!open</code> or
                    click "Open giveaway" on the dashboard. Viewers can join using <code className="rounded bg-slate-900/60 px-1.5 py-0.5">!ticket</code> (or your custom command).
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.08] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/30 text-xl">
                  3️⃣
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Add OBS Overlay (Optional)</h3>
                  <p className="text-sm text-slate-300">
                    Go to Settings to copy your unique overlay URL. Add it as a Browser Source in OBS
                    to show the spinning wheel live on stream with automatic sync.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-green-400/20 bg-green-500/[0.08] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/30 text-xl">
                  4️⃣
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Spin & Pick a Winner!</h3>
                  <p className="text-sm text-slate-300">
                    When you're ready, use <code className="rounded bg-slate-900/60 px-1.5 py-0.5">!spin</code> in
                    chat or click "Spin Now" on the dashboard. The wheel will spin and pick a random winner based on configured weights.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glow-divider" />

          <div className="space-y-4">
            <h3 className="font-semibold text-white">Useful Chat Commands</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-700/70 bg-slate-800/60 px-4 py-3">
                <code className="text-brand-300">!open</code>
                <p className="mt-1 text-xs text-slate-400">Open the giveaway for entries</p>
              </div>
              <div className="rounded-lg border border-slate-700/70 bg-slate-800/60 px-4 py-3">
                <code className="text-brand-300">!close</code>
                <p className="mt-1 text-xs text-slate-400">Close the giveaway</p>
              </div>
              <div className="rounded-lg border border-slate-700/70 bg-slate-800/60 px-4 py-3">
                <code className="text-brand-300">!spin</code>
                <p className="mt-1 text-xs text-slate-400">Spin the wheel and pick a winner</p>
              </div>
              <div className="rounded-lg border border-slate-700/70 bg-slate-800/60 px-4 py-3">
                <code className="text-brand-300">!reroll</code>
                <p className="mt-1 text-xs text-slate-400">Pick a new winner</p>
              </div>
              <div className="rounded-lg border border-slate-700/70 bg-slate-800/60 px-4 py-3">
                <code className="text-brand-300">!clear</code>
                <p className="mt-1 text-xs text-slate-400">Clear all entrants</p>
              </div>
              <div className="rounded-lg border border-slate-700/70 bg-slate-800/60 px-4 py-3">
                <code className="text-brand-300">!status</code>
                <p className="mt-1 text-xs text-slate-400">Check giveaway status</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              className="w-full py-3 text-base"
              onClick={handleComplete}
              disabled={completing}
            >
              {completing ? "Loading..." : "Go to Dashboard →"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
