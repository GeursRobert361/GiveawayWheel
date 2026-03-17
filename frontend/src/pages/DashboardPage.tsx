import { useMemo, useState } from "react";
import { DisclosurePanel } from "../components/ui/DisclosurePanel";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Wheel } from "../components/wheel/Wheel";
import { apiDownload, apiPost } from "../lib/api";
import type { AuditLogView, DashboardSnapshot, WeightedEntrantView } from "../lib/types";
import { cn, formatPercent, formatRelativeTime } from "../lib/utils";
import { useDashboardStore } from "../store/useDashboardStore";

async function copyToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}

function SummaryCard({
  label,
  value,
  detail,
  accent
}: {
  label: string;
  value: string | number;
  detail?: string | null;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-4">
      <div className={cn("absolute inset-x-6 top-0 h-1 rounded-full blur-sm", accent)} />
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      {detail ? <p className="mt-2 text-sm text-slate-400">{detail}</p> : null}
    </div>
  );
}

function RoleTags({ entrant }: { entrant: WeightedEntrantView }) {
  const labels = [
    entrant.roleFlags.broadcaster && "Broadcaster",
    entrant.roleFlags.moderator && "Mod",
    entrant.roleFlags.vip && "VIP",
    entrant.roleFlags.subscriber && "Sub",
    entrant.roleFlags.follower && "Follower"
  ].filter(Boolean) as string[];

  if (labels.length === 0) {
    return <span className="pill-chip">Viewer</span>;
  }

  return (
    <>
      {labels.map((label) => (
        <span key={label} className="pill-chip">
          {label}
        </span>
      ))}
    </>
  );
}

function ActivityCard({ entry }: { entry: AuditLogView }) {
  const toneClass =
    entry.action.includes("rejected")
      ? "border-amber-400/20 bg-amber-500/10"
      : entry.action.includes("spin") || entry.action.includes("reroll")
        ? "border-brand-300/25 bg-brand-300/10"
        : entry.action.includes("clear") || entry.action.includes("reset")
          ? "border-rose-400/20 bg-rose-500/10"
          : "border-white/10 bg-white/[0.05]";

  return (
    <div className={cn("rounded-[24px] border px-4 py-3 text-sm", toneClass)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{entry.message}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
            {entry.actorType.toLowerCase()} / @{entry.actorLogin}
          </p>
        </div>
        <span className="whitespace-nowrap text-xs text-slate-400">{formatRelativeTime(entry.createdAt)}</span>
      </div>
    </div>
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

  const eligibleEntrants = useMemo(() => getEligibleEntrants(snapshot), [snapshot]);
  const giveaway = snapshot?.giveaway;

  if (!giveaway) {
    return (
      <Card>
        <p className="text-sm text-slate-300">Waiting for giveaway data...</p>
      </Card>
    );
  }

  const latestJoinRejection = giveaway.recentActivity.find((entry) => entry.action === "entrant.chat_join_rejected");

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
        <Card className="border-rose-400/25 bg-rose-500/10 text-rose-100">
          <p className="text-sm">{error}</p>
        </Card>
      ) : null}

      <Card className="relative overflow-hidden px-6 py-6 sm:px-7">
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-brand-300/15 blur-3xl" />
        <div className="pointer-events-none absolute right-8 top-8 h-32 w-32 rounded-full bg-[rgba(255,204,77,0.16)] blur-3xl" />

        <div className="relative grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
          <div className="space-y-5">
            <div>
              <p className="section-kicker">Studio board</p>
              <h2 className="page-title">{giveaway.title}</h2>
              <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
                Collect entries from Twitch chat, run weighted picks, and keep the overlay updated live.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="pill-chip">{giveaway.status === "OPEN" ? "Entry open" : "Entry closed"}</span>
              <span className="pill-chip">Join: {giveaway.entryCommand}</span>
              <span className="pill-chip">Leave: {giveaway.leaveCommand}</span>
              <span className="pill-chip">Countdown: {giveaway.spinCountdownSeconds}s</span>
              <span className="pill-chip">Max entries: {giveaway.maxEntriesPerUser}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <SummaryCard
                label="Eligible to win"
                value={eligibleEntrants.length}
                detail={`${giveaway.entrantCount} total active entrants`}
                accent="bg-brand-300"
              />
              <SummaryCard
                label="Latest winner"
                value={giveaway.winners[0]?.displayName ?? "Waiting"}
                detail={giveaway.winners[0] ? formatRelativeTime(giveaway.winners[0].createdAt) : "Spin to pick a winner"}
                accent="bg-[rgba(255,204,77,0.9)]"
              />
              <SummaryCard
                label="Chat connection"
                value={snapshot?.twitch.status === "connected" ? "Live" : snapshot?.twitch.status ?? "offline"}
                detail={snapshot?.twitch.lastConnectedAt ? formatRelativeTime(snapshot.twitch.lastConnectedAt) : "No recent sync"}
                accent="bg-[rgba(255,114,94,0.9)]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-200/70">Quick checks</p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                  <p className="font-semibold text-white">Need to test !join yourself?</p>
                  <p className="mt-1 text-slate-400">
                    !join only works while the giveaway is open. If you test from the broadcaster account, turn off
                    Exclude Broadcaster in Settings or use a viewer account.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                  <p className="font-semibold text-white">Current gate summary</p>
                  <p className="mt-1 text-slate-400">
                    {giveaway.followerOnlyMode ? "Follower-only on. " : ""}
                    {giveaway.subscriberOnlyMode ? "Subscriber-only on. " : ""}
                    {giveaway.excludeBroadcaster ? "Broadcaster excluded. " : ""}
                    {giveaway.minimumAccountAgeDays > 0
                      ? `Minimum account age ${giveaway.minimumAccountAgeDays} days.`
                      : "No account age restriction."}
                  </p>
                </div>
                {latestJoinRejection ? (
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3">
                    <p className="font-semibold text-amber-100">Latest join rejection</p>
                    <p className="mt-1 text-amber-50/90">{latestJoinRejection.message}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <Card className="px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-kicker">Wheel stage</p>
              <h3 className="mt-2 text-2xl font-bold text-white">Big draw board</h3>
              <p className="mt-2 text-sm text-slate-400">
                A larger live wheel for the stream view, with countdown and winner focus built in.
              </p>
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
                Spin now
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <Wheel
              entrants={eligibleEntrants.map((entrant) => ({ id: entrant.id, displayName: entrant.displayName }))}
              lastSpin={giveaway.lastSpin}
              winnerLabel={giveaway.winners[0]?.displayName ?? null}
            />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div>
              <p className="section-kicker">Live controls</p>
              <h3 className="mt-2 text-xl font-bold text-white">Manual controls</h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
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
                onClick={() => runAction("chatters", () => apiPost("/api/entrants/import-chatters"))}
              >
                Import chatters
              </Button>
              <Button
                variant="secondary"
                disabled={busyAction !== null}
                onClick={() => runAction("clear", () => apiPost("/api/giveaway/clear"))}
              >
                Clear entrants
              </Button>
              <Button
                variant="danger"
                disabled={busyAction !== null}
                onClick={() => runAction("reset", () => apiPost("/api/giveaway/reset"))}
              >
                Reset session
              </Button>
            </div>

            <div className="glow-divider" />

            <div>
              <label className="field-label">Manual add</label>
              <div className="flex flex-col gap-2 sm:flex-row">
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
                  Add entrant
                </Button>
              </div>
              <p className="field-hint">Manual adds still respect the same weighting and restriction logic.</p>
            </div>
          </Card>

          <DisclosurePanel
            kicker="Stream tools"
            title="Overlay, export, and recovery tools"
            description="Keep the wheel scene handy without crowding the main board."
            defaultOpen={false}
          >
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/45 px-4 py-4 text-sm text-slate-300">
                <p className="font-semibold text-white">Overlay URL</p>
                <p className="mt-2 break-all text-slate-400">{snapshot?.overlayUrl ?? "Overlay URL unavailable"}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="secondary"
                  disabled={!snapshot?.overlayUrl}
                  onClick={() => snapshot?.overlayUrl && copyToClipboard(snapshot.overlayUrl)}
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
            </div>
          </DisclosurePanel>

          <Card className="space-y-4">
            <div>
              <p className="section-kicker">Weight snapshot</p>
              <h3 className="mt-2 text-xl font-bold text-white">Role multipliers at a glance</h3>
            </div>

            <div className="space-y-3">
              {(
                [
                  ["Viewer", giveaway.weightSettings.viewerWeight, "bg-brand-300"],
                  ["Follower", giveaway.weightSettings.followerWeight, "bg-[rgba(125,214,90,0.95)]"],
                  ["Subscriber", giveaway.weightSettings.subscriberWeight, "bg-[rgba(255,204,77,0.95)]"],
                  ["VIP", giveaway.weightSettings.vipWeight, "bg-[rgba(255,114,94,0.95)]"],
                  ["Moderator", giveaway.weightSettings.moderatorWeight, "bg-[rgba(185,146,255,0.95)]"],
                  ["Broadcaster", giveaway.weightSettings.broadcasterWeight, "bg-white"]
                ] as const
              ).map(([label, value, tone]) => {
                const maxWeight = Math.max(
                  giveaway.weightSettings.viewerWeight,
                  giveaway.weightSettings.followerWeight,
                  giveaway.weightSettings.subscriberWeight,
                  giveaway.weightSettings.vipWeight,
                  giveaway.weightSettings.moderatorWeight,
                  giveaway.weightSettings.broadcasterWeight,
                  1
                );

                return (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-white">{label}</span>
                      <span className="text-slate-400">{value}x</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/[0.06]">
                      <div
                        className={cn("h-full rounded-full shadow-[0_0_20px_rgba(255,255,255,0.12)]", tone)}
                        style={{ width: `${Math.max((value / maxWeight) * 100, value > 0 ? 10 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr_0.95fr]">
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-kicker">Entrants</p>
              <h3 className="mt-2 text-xl font-bold text-white">Live pool</h3>
            </div>
            <span className="pill-chip">{giveaway.entrantCount} active</span>
          </div>

          <div className="max-h-[34rem] space-y-3 overflow-auto pr-1">
            {giveaway.entrants.length === 0 ? (
              <p className="text-sm text-slate-400">No entrants yet. Open the giveaway to start collecting chat joins.</p>
            ) : (
              giveaway.entrants.map((entrant) => (
                <div
                  key={entrant.id}
                  className={cn(
                    "rounded-[26px] border px-4 py-4",
                    entrant.isEligible ? "border-white/10 bg-white/[0.05]" : "border-amber-400/20 bg-amber-500/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-white">{entrant.displayName}</p>
                        <div className="flex flex-wrap gap-2">
                          <RoleTags entrant={entrant} />
                          {!entrant.isEligible ? <span className="pill-chip">Not eligible</span> : null}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        {entrant.roleLabel} / {entrant.entryCount} entr{entrant.entryCount === 1 ? "y" : "ies"}
                      </p>
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

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
                      <span>Chance preview</span>
                      <span>{formatPercent(entrant.chancePercent)}</span>
                    </div>
                    <div className="mt-2 h-2.5 rounded-full bg-slate-950/70">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          entrant.isEligible ? "bg-brand-300" : "bg-amber-300"
                        )}
                        style={{ width: `${Math.max(Math.min(entrant.chancePercent, 100), entrant.isEligible ? 5 : 0)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{entrant.multiplier}x multiplier</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="section-kicker">Winners</p>
            <h3 className="mt-2 text-xl font-bold text-white">Recent picks</h3>
          </div>

          <div className="space-y-3">
            {giveaway.winners.length === 0 ? (
              <p className="text-sm text-slate-400">No winners recorded yet.</p>
            ) : (
              giveaway.winners.map((winner) => (
                <div key={winner.id} className="rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{winner.displayName}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {winner.source} / {formatRelativeTime(winner.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm font-semibold text-brand-100">
                      {winner.selectedWeight.toFixed(2)} weight
                    </div>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {winner.announcedInChat ? "Announced in chat" : "Not announced in chat"}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="section-kicker">Activity</p>
            <h3 className="mt-2 text-xl font-bold text-white">Recent command log</h3>
          </div>

          <div className="max-h-[34rem] space-y-3 overflow-auto pr-1">
            {giveaway.recentActivity.length === 0 ? (
              <p className="text-sm text-slate-400">No recent activity yet.</p>
            ) : (
              giveaway.recentActivity.map((entry) => <ActivityCard key={entry.id} entry={entry} />)
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
