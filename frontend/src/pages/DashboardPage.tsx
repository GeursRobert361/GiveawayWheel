import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Wheel } from "../components/wheel/Wheel";
import { apiDownload, apiPost } from "../lib/api";
import type { DashboardSnapshot } from "../lib/types";
import { formatPercent, formatRelativeTime } from "../lib/utils";
import { useDashboardStore } from "../store/useDashboardStore";

async function copyToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}

function SummaryCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string | number;
  detail?: string | null;
}) {
  return (
    <Card className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {detail ? <p className="text-sm text-slate-400">{detail}</p> : null}
    </Card>
  );
}

function getEligibleEntrants(snapshot: DashboardSnapshot | null) {
  return snapshot?.giveaway?.entrants.filter((entrant) => entrant.isEligible) ?? [];
}

export function DashboardPage() {
  const snapshot = useDashboardStore((state) => state.snapshot);
  const error = useDashboardStore((state) => state.error);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [manualUsername, setManualUsername] = useState("");

  if (!snapshot?.giveaway) {
    return (
      <Card>
        <p className="text-sm text-slate-300">Waiting for giveaway data…</p>
      </Card>
    );
  }

  const { giveaway } = snapshot;
  const eligibleEntrants = getEligibleEntrants(snapshot);

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    setBusyAction(label);
    try {
      await action();
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {error ? (
        <Card className="border-rose-500/30 bg-rose-500/10 text-rose-100">
          <p className="text-sm">{error}</p>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          label="Current giveaway"
          value={giveaway.title}
          detail={`${giveaway.status === "OPEN" ? "Open" : "Closed"} • Command ${giveaway.entryCommand}`}
        />
        <SummaryCard label="Entrants" value={giveaway.entrantCount} detail={`${eligibleEntrants.length} eligible to win`} />
        <SummaryCard
          label="Latest winner"
          value={giveaway.winners[0]?.displayName ?? "No winner yet"}
          detail={giveaway.winners[0] ? formatRelativeTime(giveaway.winners[0].createdAt) : null}
        />
        <SummaryCard
          label="Overlay"
          value={snapshot.overlayUrl ? "Ready" : "Unavailable"}
          detail={snapshot.overlayUrl ?? "Create a session to generate an overlay URL"}
        />
      </div>

      <div className="panel-grid">
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200/70">Wheel</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Live draw board</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={busyAction !== null}
                onClick={() => runAction("open", () => apiPost("/api/giveaway/open"))}
              >
                Open
              </Button>
              <Button
                variant="secondary"
                disabled={busyAction !== null}
                onClick={() => runAction("close", () => apiPost("/api/giveaway/close"))}
              >
                Close
              </Button>
              <Button
                disabled={busyAction !== null || eligibleEntrants.length === 0}
                onClick={() => runAction("spin", () => apiPost("/api/giveaway/spin"))}
              >
                Spin
              </Button>
            </div>
          </div>

          <Wheel
            entrants={eligibleEntrants.map((entrant) => ({ id: entrant.id, displayName: entrant.displayName }))}
            lastSpin={giveaway.lastSpin}
            winnerLabel={giveaway.winners[0]?.displayName ?? null}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={busyAction !== null || eligibleEntrants.length === 0}
              onClick={() => runAction("reroll", () => apiPost("/api/giveaway/reroll"))}
            >
              Reroll
            </Button>
            <Button
              variant="secondary"
              disabled={busyAction !== null}
              onClick={() => runAction("clear", () => apiPost("/api/giveaway/clear"))}
            >
              Clear entrants
            </Button>
            <Button
              variant="secondary"
              disabled={busyAction !== null}
              onClick={() => runAction("reset", () => apiPost("/api/giveaway/reset"))}
            >
              Reset session
            </Button>
            <Button
              variant="secondary"
              disabled={busyAction !== null}
              onClick={() => runAction("chatters", () => apiPost("/api/entrants/import-chatters"))}
            >
              Import chatters
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200/70">Stream tools</p>
              <h3 className="mt-2 text-lg font-bold text-white">Overlay and exports</h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-300">
              {snapshot.overlayUrl ?? "Overlay URL unavailable"}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={!snapshot.overlayUrl}
                onClick={() => snapshot.overlayUrl && copyToClipboard(snapshot.overlayUrl)}
              >
                Copy overlay URL
              </Button>
              <Button variant="secondary" onClick={() => apiDownload("/api/entrants/export")}>
                Export entrants CSV
              </Button>
              <Button variant="secondary" onClick={() => apiDownload("/api/history/export")}>
                Export winners CSV
              </Button>
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200/70">Weight summary</p>
              <h3 className="mt-2 text-lg font-bold text-white">Role multipliers</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
              <div className="rounded-2xl bg-white/5 px-4 py-3">Viewer: {giveaway.weightSettings.viewerWeight}x</div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">Follower: {giveaway.weightSettings.followerWeight}x</div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">Subscriber: {giveaway.weightSettings.subscriberWeight}x</div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">VIP: {giveaway.weightSettings.vipWeight}x</div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">Moderator: {giveaway.weightSettings.moderatorWeight}x</div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">Broadcaster: {giveaway.weightSettings.broadcasterWeight}x</div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200/70">Entrants</p>
              <h3 className="mt-2 text-lg font-bold text-white">Live list</h3>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[280px] sm:flex-row">
              <input
                className="field-input"
                placeholder="Add username"
                value={manualUsername}
                onChange={(event) => setManualUsername(event.target.value)}
              />
              <Button
                variant="secondary"
                disabled={busyAction !== null || manualUsername.trim().length < 2}
                onClick={() =>
                  runAction("add-entrant", async () => {
                    await apiPost("/api/entrants/add", { username: manualUsername.trim() });
                    setManualUsername("");
                  })
                }
              >
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {giveaway.entrants.length === 0 ? (
              <p className="text-sm text-slate-400">No entrants yet. Open the giveaway to start collecting chat joins.</p>
            ) : (
              giveaway.entrants.map((entrant) => (
                <div
                  key={entrant.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-white">{entrant.displayName}</p>
                    <p className="text-slate-400">
                      {entrant.roleLabel} • {entrant.entryCount} entries
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand-200">{formatPercent(entrant.chancePercent)}</p>
                    <p className="text-slate-400">{entrant.multiplier}x multiplier</p>
                  </div>
                  <Button
                    variant="ghost"
                    disabled={busyAction !== null}
                    onClick={() =>
                      runAction(`remove-${entrant.username}`, () =>
                        apiPost("/api/entrants/remove", { username: entrant.username })
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200/70">Winners</p>
            <h3 className="mt-2 text-lg font-bold text-white">Recent picks</h3>
          </div>

          <div className="space-y-3">
            {giveaway.winners.length === 0 ? (
              <p className="text-sm text-slate-400">No winners recorded yet.</p>
            ) : (
              giveaway.winners.map((winner) => (
                <div key={winner.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{winner.displayName}</p>
                    <span className="text-brand-200">{winner.selectedWeight.toFixed(2)} weight</span>
                  </div>
                  <p className="mt-1 text-slate-400">
                    {winner.source} • {formatRelativeTime(winner.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200/70">Activity</p>
            <h3 className="mt-2 text-lg font-bold text-white">Recent command log</h3>
          </div>

          <div className="space-y-3">
            {giveaway.recentActivity.length === 0 ? (
              <p className="text-sm text-slate-400">No recent activity yet.</p>
            ) : (
              giveaway.recentActivity.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{entry.message}</p>
                    <span className="text-slate-400">{formatRelativeTime(entry.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-slate-500">
                    {entry.actorType.toLowerCase()} • @{entry.actorLogin}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
