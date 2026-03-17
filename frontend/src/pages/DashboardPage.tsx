import { useEffect, useMemo, useState } from "react";
import { DisclosurePanel } from "../components/ui/DisclosurePanel";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Wheel } from "../components/wheel/Wheel";
import { apiDownload, apiPost } from "../lib/api";
import type { AuditLogView, DashboardSnapshot, GiveawaySnapshot, WeightedEntrantView } from "../lib/types";
import { cn, formatPercent, formatRelativeTime, isSpinInProgress } from "../lib/utils";
import { useDashboardStore } from "../store/useDashboardStore";

type SetupFormState = Pick<
  GiveawaySnapshot,
  | "title"
  | "entryCommand"
  | "leaveCommand"
  | "removeWinnerAfterDraw"
  | "allowDuplicateEntries"
  | "maxEntriesPerUser"
  | "followerOnlyMode"
  | "subscriberOnlyMode"
  | "announceWinnerInChat"
  | "excludeBroadcaster"
  | "minimumAccountAgeDays"
  | "spinCountdownSeconds"
  | "weightSettings"
  | "overrides"
> & {
  weights: GiveawaySnapshot["weightSettings"];
};

async function copyToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}

function buildSetupForm(giveaway: GiveawaySnapshot): SetupFormState {
  return {
    title: giveaway.title,
    entryCommand: giveaway.entryCommand,
    leaveCommand: giveaway.leaveCommand,
    removeWinnerAfterDraw: giveaway.removeWinnerAfterDraw,
    allowDuplicateEntries: giveaway.allowDuplicateEntries,
    maxEntriesPerUser: giveaway.maxEntriesPerUser,
    followerOnlyMode: giveaway.followerOnlyMode,
    subscriberOnlyMode: giveaway.subscriberOnlyMode,
    announceWinnerInChat: giveaway.announceWinnerInChat,
    excludeBroadcaster: giveaway.excludeBroadcaster,
    minimumAccountAgeDays: giveaway.minimumAccountAgeDays,
    spinCountdownSeconds: giveaway.spinCountdownSeconds,
    weightSettings: giveaway.weightSettings,
    overrides: giveaway.overrides,
    weights: giveaway.weightSettings
  };
}

function SummaryCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.05] px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </div>
  );
}

function SetupToggle({
  label,
  checked,
  onChange,
  description
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  description: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4">
      <input type="checkbox" className="mt-1 h-4 w-4" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>
        <span className="block font-semibold text-white">{label}</span>
        <span className="mt-1 block text-sm text-slate-400">{description}</span>
      </span>
    </label>
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
  const tone =
    entry.action.includes("rejected")
      ? "border-amber-400/20 bg-amber-500/10"
      : entry.action.includes("spin") || entry.action.includes("reroll")
        ? "border-brand-300/20 bg-brand-300/10"
        : "border-white/10 bg-white/[0.05]";

  return (
    <div className={cn("rounded-[24px] border px-4 py-3 text-sm", tone)}>
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
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [savingSetup, setSavingSetup] = useState(false);
  const [setupForm, setSetupForm] = useState<SetupFormState | null>(null);

  const eligibleEntrants = useMemo(() => getEligibleEntrants(snapshot), [snapshot]);
  const giveaway = snapshot?.giveaway;

  useEffect(() => {
    if (giveaway) {
      setSetupForm(buildSetupForm(giveaway));
    }
  }, [giveaway]);

  useEffect(() => {
    if (!giveaway) {
      return;
    }

    const key = `tgw:setup-dismissed:${giveaway.id}`;
    if (window.localStorage.getItem(key)) {
      return;
    }
    setShowSetupModal(true);
  }, [giveaway]);

  if (!giveaway || !snapshot) {
    return <Card><p className="text-sm text-slate-300">Waiting for giveaway data...</p></Card>;
  }

  const key = `tgw:setup-dismissed:${giveaway.id}`;
  const latestJoinRejection = giveaway.recentActivity.find((entry) => entry.action === "entrant.chat_join_rejected");
  const spinActive = isSpinInProgress(giveaway.lastSpin);
  const visibleWinners = spinActive ? giveaway.winners.slice(1) : giveaway.winners;

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    setBusyAction(label);
    try {
      await action();
    } finally {
      setBusyAction(null);
    }
  };

  const saveSetup = async () => {
    if (!setupForm) {
      return;
    }
    setSavingSetup(true);
    try {
      await apiPost("/api/settings/update", {
        ...setupForm,
        weights: setupForm.weights,
        overrides: setupForm.overrides.map((override) => ({
          username: override.username,
          weight: override.weight,
          isBlocked: override.isBlocked,
          notes: override.notes
        }))
      });
      window.localStorage.setItem(key, "1");
      setShowSetupModal(false);
    } finally {
      setSavingSetup(false);
    }
  };

  const dismissSetup = () => {
    window.localStorage.setItem(key, "1");
    setShowSetupModal(false);
  };

  return (
    <div className="space-y-6">
      {error ? <Card className="border-rose-400/25 bg-rose-500/10 text-rose-100"><p className="text-sm">{error}</p></Card> : null}

      <Card className="space-y-5 px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-kicker">Studio board</p>
            <h2 className="page-title">{giveaway.title}</h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-300">Current join command: <span className="font-semibold text-white">{giveaway.entryCommand}</span></p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="pill-chip">{giveaway.status === "OPEN" ? "Entry open" : "Entry closed"}</span>
            <span className="pill-chip">Leave: {giveaway.leaveCommand}</span>
            <span className="pill-chip">Countdown: {giveaway.spinCountdownSeconds}s</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Eligible entrants" value={eligibleEntrants.length} detail={`${giveaway.entrantCount} total active`} />
          <SummaryCard
            label="Latest winner"
            value={spinActive ? "Revealing..." : giveaway.winners[0]?.displayName ?? "Waiting"}
            detail={spinActive ? "Winner lands when the wheel stops." : giveaway.winners[0] ? formatRelativeTime(giveaway.winners[0].createdAt) : "Spin to pick a winner"}
          />
          <SummaryCard
            label="Connection"
            value={snapshot.twitch.status === "connected" ? "Live" : snapshot.twitch.status}
            detail={snapshot.twitch.lastConnectedAt ? formatRelativeTime(snapshot.twitch.lastConnectedAt) : "No recent sync"}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.45fr_0.85fr]">
          <div>
            <Wheel
              entrants={eligibleEntrants.map((entrant) => ({ id: entrant.id, displayName: entrant.displayName }))}
              lastSpin={giveaway.lastSpin}
              winnerLabel={spinActive ? null : giveaway.winners[0]?.displayName ?? null}
            />
          </div>

          <div className="space-y-4">
            <Card className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setShowSetupModal(true)}>Setup</Button>
                <Button variant="secondary" disabled={busyAction !== null || spinActive} onClick={() => runAction("open", () => apiPost("/api/giveaway/open"))}>Open</Button>
                <Button variant="secondary" disabled={busyAction !== null || spinActive} onClick={() => runAction("close", () => apiPost("/api/giveaway/close"))}>Close</Button>
                <Button disabled={busyAction !== null || spinActive || eligibleEntrants.length === 0} onClick={() => runAction("spin", () => apiPost("/api/giveaway/spin"))}>Spin</Button>
                <Button variant="secondary" disabled={busyAction !== null || spinActive || eligibleEntrants.length === 0} onClick={() => runAction("reroll", () => apiPost("/api/giveaway/reroll"))}>Reroll</Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="secondary" disabled={busyAction !== null || spinActive} onClick={() => runAction("chatters", () => apiPost("/api/entrants/import-chatters"))}>Import chatters</Button>
                <Button variant="secondary" disabled={busyAction !== null || spinActive} onClick={() => runAction("clear", () => apiPost("/api/giveaway/clear"))}>Clear entrants</Button>
              </div>
              <div>
                <label className="field-label">Manual add</label>
                <div className="flex gap-2">
                  <input className="field-input" placeholder="Add username" value={manualUsername} onChange={(event) => setManualUsername(event.target.value)} />
                  <Button variant="secondary" disabled={busyAction !== null || spinActive || manualUsername.trim().length < 2} onClick={() => runAction("add-entrant", async () => {
                    await apiPost("/api/entrants/add", { username: manualUsername.trim() });
                    setManualUsername("");
                  })}>Add</Button>
                </div>
              </div>
            </Card>

            <DisclosurePanel kicker="Stream tools" title="Overlay and exports" description="Copy the overlay URL or export the current state." defaultOpen={false}>
              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-slate-950/45 px-4 py-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">Overlay URL</p>
                  <p className="mt-2 break-all text-slate-400">{snapshot.overlayUrl ?? "Overlay URL unavailable"}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button variant="secondary" disabled={!snapshot.overlayUrl} onClick={() => snapshot.overlayUrl && copyToClipboard(snapshot.overlayUrl)}>Copy overlay URL</Button>
                  <Button variant="secondary" onClick={() => apiDownload("/api/entrants/export")}>Export entrants CSV</Button>
                  <Button variant="secondary" onClick={() => apiDownload("/api/history/export")}>Export winners CSV</Button>
                </div>
              </div>
            </DisclosurePanel>

            <Card className="space-y-3">
              <p className="section-kicker">Quick checks</p>
              <p className="text-sm text-slate-300">
                {giveaway.entryCommand} only works while the giveaway is open. If you test from the broadcaster account, turn off Exclude Broadcaster in Settings or use a viewer account.
              </p>
              {latestJoinRejection ? <div className="rounded-[22px] border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-50">{latestJoinRejection.message}</div> : null}
              {spinActive ? <div className="rounded-[22px] border border-brand-300/20 bg-brand-300/10 px-4 py-3 text-sm text-brand-50">Spin in progress. Entrants stay visible until the wheel finishes landing.</div> : null}
            </Card>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr_0.95fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-kicker">Entrants</p>
              <h3 className="mt-2 text-xl font-bold text-white">Live pool</h3>
            </div>
            <span className="pill-chip">{giveaway.entrantCount} active</span>
          </div>
          <div className="max-h-[34rem] space-y-3 overflow-auto pr-1">
            {giveaway.entrants.length === 0 ? <p className="text-sm text-slate-400">No entrants yet.</p> : giveaway.entrants.map((entrant) => (
              <div key={entrant.id} className={cn("rounded-[26px] border px-4 py-4", entrant.isEligible ? "border-white/10 bg-white/[0.05]" : "border-amber-400/20 bg-amber-500/10")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{entrant.displayName}</p>
                    <p className="mt-1 text-sm text-slate-400">{entrant.roleLabel} / {entrant.entryCount} entr{entrant.entryCount === 1 ? "y" : "ies"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entrant.entryCount > 1 ? <Button variant="secondary" disabled={busyAction !== null || spinActive} onClick={() => runAction(`remove-one-${entrant.username}`, () => apiPost("/api/entrants/remove", { username: entrant.username, mode: "single" }))}>Remove 1</Button> : null}
                    <Button variant="ghost" disabled={busyAction !== null || spinActive} onClick={() => runAction(`remove-${entrant.username}`, () => apiPost("/api/entrants/remove", { username: entrant.username, mode: "all" }))}>Remove all</Button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2"><RoleTags entrant={entrant} />{!entrant.isEligible ? <span className="pill-chip">Not eligible</span> : null}</div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400"><span>Chance preview</span><span>{formatPercent(entrant.chancePercent)}</span></div>
                  <div className="mt-2 h-2.5 rounded-full bg-slate-950/70">
                    <div className={cn("h-full rounded-full", entrant.isEligible ? "bg-brand-300" : "bg-amber-300")} style={{ width: `${Math.max(Math.min(entrant.chancePercent, 100), entrant.isEligible ? 5 : 0)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="section-kicker">Winners</p>
            <h3 className="mt-2 text-xl font-bold text-white">Recent picks</h3>
          </div>
          <div className="space-y-3">
            {spinActive ? <div className="rounded-[24px] border border-brand-300/20 bg-brand-300/10 px-4 py-4 text-sm text-slate-200">Winner reveal in progress. The newest winner lands here when the wheel stops.</div> : null}
            {visibleWinners.length === 0 ? <p className="text-sm text-slate-400">No winners recorded yet.</p> : visibleWinners.map((winner) => (
              <div key={winner.id} className="rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{winner.displayName}</p>
                    <p className="mt-1 text-sm text-slate-400">{winner.source} / {formatRelativeTime(winner.createdAt)}</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm font-semibold text-brand-100">{winner.selectedWeight.toFixed(2)} weight</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="section-kicker">Activity</p>
            <h3 className="mt-2 text-xl font-bold text-white">Recent command log</h3>
          </div>
          <div className="max-h-[34rem] space-y-3 overflow-auto pr-1">
            {giveaway.recentActivity.length === 0 ? <p className="text-sm text-slate-400">No recent activity yet.</p> : giveaway.recentActivity.map((entry) => <ActivityCard key={entry.id} entry={entry} />)}
          </div>
        </Card>
      </div>

      {showSetupModal && setupForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,20,37,0.98),rgba(4,7,17,0.98))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">Quick setup</p>
                <h3 className="mt-2 text-3xl font-bold text-white">Tune the giveaway before going live</h3>
                <p className="mt-3 text-sm text-slate-300">Set the title, join command, and the core behavior without leaving the dashboard.</p>
              </div>
              <Button variant="ghost" onClick={dismissSetup}>Close</Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div><label className="field-label">Giveaway title</label><input className="field-input" value={setupForm.title} onChange={(event) => setSetupForm((current) => current ? { ...current, title: event.target.value } : current)} /></div>
              <div><label className="field-label">Entry command</label><input className="field-input" value={setupForm.entryCommand} onChange={(event) => setSetupForm((current) => current ? { ...current, entryCommand: event.target.value } : current)} /></div>
              <div><label className="field-label">Leave command</label><input className="field-input" value={setupForm.leaveCommand} onChange={(event) => setSetupForm((current) => current ? { ...current, leaveCommand: event.target.value } : current)} /></div>
              <div><label className="field-label">Max entries per user</label><input className="field-input" type="number" min={1} max={100} value={setupForm.maxEntriesPerUser} onChange={(event) => setSetupForm((current) => current ? { ...current, maxEntriesPerUser: Number(event.target.value) } : current)} /></div>
              <div><label className="field-label">Spin countdown (seconds)</label><input className="field-input" type="number" min={0} max={15} value={setupForm.spinCountdownSeconds} onChange={(event) => setSetupForm((current) => current ? { ...current, spinCountdownSeconds: Number(event.target.value) } : current)} /></div>
              <div><label className="field-label">Minimum account age (days)</label><input className="field-input" type="number" min={0} max={3650} value={setupForm.minimumAccountAgeDays} onChange={(event) => setSetupForm((current) => current ? { ...current, minimumAccountAgeDays: Number(event.target.value) } : current)} /></div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <SetupToggle label="Allow duplicate entries" checked={setupForm.allowDuplicateEntries} onChange={(value) => setSetupForm((current) => current ? { ...current, allowDuplicateEntries: value } : current)} description="Let viewers stack more than one entry, up to the max entry cap." />
              <SetupToggle label="Remove winner after draw" checked={setupForm.removeWinnerAfterDraw} onChange={(value) => setSetupForm((current) => current ? { ...current, removeWinnerAfterDraw: value } : current)} description="Remove the winner from the pool once the reveal finishes." />
              <SetupToggle label="Announce winner in chat" checked={setupForm.announceWinnerInChat} onChange={(value) => setSetupForm((current) => current ? { ...current, announceWinnerInChat: value } : current)} description="Post the winner back into Twitch chat after the spin completes." />
              <SetupToggle label="Exclude broadcaster" checked={setupForm.excludeBroadcaster} onChange={(value) => setSetupForm((current) => current ? { ...current, excludeBroadcaster: value } : current)} description="Disable broadcaster self-entry unless you intentionally want to test the command yourself." />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={dismissSetup}>Later</Button>
              <Button disabled={savingSetup} onClick={saveSetup}>{savingSetup ? "Saving..." : "Save and continue"}</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
