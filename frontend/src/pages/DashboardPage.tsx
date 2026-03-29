import { useEffect, useMemo, useRef, useState } from "react";
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
  | "minimumFollowageDays"
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
    minimumFollowageDays: giveaway.minimumFollowageDays,
    spinCountdownSeconds: giveaway.spinCountdownSeconds,
    weightSettings: giveaway.weightSettings,
    overrides: giveaway.overrides,
    weights: giveaway.weightSettings
  };
}

function SetupToggle({ label, checked, onChange, description }: {
  label: string; checked: boolean; onChange: (value: boolean) => void; description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.04] px-4 py-4 transition hover:border-violet-400/20 hover:bg-white/[0.06]">
      <input type="checkbox" className="mt-1 h-4 w-4 accent-violet-500" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block font-semibold text-white">{label}</span>
        <span className="mt-1 block text-sm text-slate-400">{description}</span>
      </span>
    </label>
  );
}

function NumberStepper({ label, value, onChange, min, max }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.06] text-slate-100 transition hover:border-violet-400/30 hover:bg-white/[0.1] disabled:opacity-40"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          −
        </button>
        <input
          type="number"
          className="field-input w-20 text-center"
          value={value}
          onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
          min={min}
          max={max}
        />
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.06] text-slate-100 transition hover:border-violet-400/30 hover:bg-white/[0.1] disabled:opacity-40"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}

type TimeUnit = "hours" | "days" | "months" | "years";

function TimeStepper({ label, days, onChange }: {
  label: string;
  days: number;
  onChange: (days: number) => void;
}) {
  const [unit, setUnit] = useState<TimeUnit>("days");
  const [displayValue, setDisplayValue] = useState(days);

  useEffect(() => {
    switch (unit) {
      case "hours":
        setDisplayValue(Math.round(days * 24));
        break;
      case "days":
        setDisplayValue(days);
        break;
      case "months":
        setDisplayValue(Math.round(days / 30));
        break;
      case "years":
        setDisplayValue(Math.round(days / 365));
        break;
    }
  }, [days, unit]);

  const handleValueChange = (newValue: number) => {
    setDisplayValue(newValue);
    let newDays = newValue;
    switch (unit) {
      case "hours":
        newDays = Math.round(newValue / 24);
        break;
      case "days":
        newDays = newValue;
        break;
      case "months":
        newDays = newValue * 30;
        break;
      case "years":
        newDays = newValue * 365;
        break;
    }
    onChange(Math.max(0, Math.min(3650, newDays)));
  };

  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.06] text-slate-100 transition hover:border-violet-400/30 hover:bg-white/[0.1] disabled:opacity-40"
          onClick={() => handleValueChange(Math.max(0, displayValue - 1))}
          disabled={displayValue <= 0}
        >
          −
        </button>
        <input
          type="number"
          className="field-input w-20 text-center"
          value={displayValue}
          onChange={(e) => handleValueChange(Math.max(0, Number(e.target.value) || 0))}
          min={0}
        />
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.06] text-slate-100 transition hover:border-violet-400/30 hover:bg-white/[0.1]"
          onClick={() => handleValueChange(displayValue + 1)}
        >
          +
        </button>
        <select
          className="field-input w-28"
          value={unit}
          onChange={(e) => setUnit(e.target.value as TimeUnit)}
        >
          <option value="hours">Hours</option>
          <option value="days">Days</option>
          <option value="months">Months</option>
          <option value="years">Years</option>
        </select>
      </div>
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
  if (labels.length === 0) return <span className="pill-chip">Viewer</span>;
  return <>{labels.map((l) => <span key={l} className="pill-chip">{l}</span>)}</>;
}

function ActivityCard({ entry }: { entry: AuditLogView }) {
  const tone = entry.action.includes("rejected")
    ? "border-amber-400/20 bg-amber-500/[0.08]"
    : entry.action.includes("spin") || entry.action.includes("reroll")
      ? "border-violet-400/20 bg-violet-500/[0.08]"
      : "border-white/[0.08] bg-white/[0.04]";
  return (
    <div className={cn("rounded-[22px] border px-4 py-3 text-sm", tone)}>
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
  return snapshot?.giveaway?.entrants.filter((e) => e.isEligible) ?? [];
}

export function DashboardPage() {
  const snapshot = useDashboardStore((state) => state.snapshot);
  const error = useDashboardStore((state) => state.error);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [manualUsername, setManualUsername] = useState("");
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [savingSetup, setSavingSetup] = useState(false);
  const [setupForm, setSetupForm] = useState<SetupFormState | null>(null);
  const [winnerPopupName, setWinnerPopupName] = useState<string | null>(null);
  const [expandedEntrantId, setExpandedEntrantId] = useState<string | null>(null);
  const bootstrappedSpinRef = useRef(false);
  const handledWinnerPopupRef = useRef<string | null>(null);

  const eligibleEntrants = useMemo(() => getEligibleEntrants(snapshot), [snapshot]);
  const giveaway = snapshot?.giveaway;

  useEffect(() => {
    if (giveaway) setSetupForm(buildSetupForm(giveaway));
  }, [giveaway]);

  useEffect(() => {
    if (!giveaway) return;
    const key = `tgw:setup-dismissed:${giveaway.id}`;
    if (window.localStorage.getItem(key)) return;
    setShowSetupModal(true);
  }, [giveaway]);

  useEffect(() => {
    const spin = giveaway?.lastSpin;
    if (!spin) return;
    const completedAt = new Date(spin.completedAt).getTime();
    if (!bootstrappedSpinRef.current) {
      bootstrappedSpinRef.current = true;
      if (completedAt <= Date.now()) { handledWinnerPopupRef.current = spin.eventId; return; }
    }
    if (handledWinnerPopupRef.current === spin.eventId) return;
    setWinnerPopupName(null);
    handledWinnerPopupRef.current = spin.eventId;
    const timer = window.setTimeout(
      () => setWinnerPopupName(spin.winnerDisplayName),
      Math.max(0, completedAt - Date.now())
    );
    return () => window.clearTimeout(timer);
  }, [giveaway?.lastSpin]);

  useEffect(() => {
    if (!winnerPopupName) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setWinnerPopupName(null); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [winnerPopupName]);

  if (!giveaway || !snapshot) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-400">Waiting for giveaway data...</p>
      </div>
    );
  }

  const key = `tgw:setup-dismissed:${giveaway.id}`;
  const latestJoinRejection = giveaway.recentActivity.find((e) => e.action === "entrant.chat_join_rejected");
  const spinActive = isSpinInProgress(giveaway.lastSpin);
  const visibleWinners = spinActive ? giveaway.winners.slice(1) : giveaway.winners;

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    setBusyAction(label);
    try { await action(); } finally { setBusyAction(null); }
  };

  const saveSetup = async () => {
    if (!setupForm) return;
    setSavingSetup(true);
    try {
      await apiPost("/api/settings/update", {
        ...setupForm,
        weights: setupForm.weights,
        overrides: setupForm.overrides.map((o) => ({ username: o.username, weight: o.weight, isBlocked: o.isBlocked, notes: o.notes }))
      });
      window.localStorage.setItem(key, "1");
      setShowSetupModal(false);
    } finally { setSavingSetup(false); }
  };

  const dismissSetup = () => { window.localStorage.setItem(key, "1"); setShowSetupModal(false); };

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-200">{error}</div>
      ) : null}

      {/* Control bar */}
      <Card className="px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="section-kicker">Live session</p>
              <h2 className="mt-0.5 text-xl font-bold text-white">{giveaway.title}</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="pill-chip">{giveaway.entryCommand}</span>
              <span className={cn("pill-chip", giveaway.status === "OPEN" && "border-emerald-400/30 bg-emerald-500/[0.1] text-emerald-300")}>
                {giveaway.status === "OPEN" ? "Entry open" : "Entry closed"}
              </span>
              <span className="pill-chip">{eligibleEntrants.length} eligible</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setShowSetupModal(true)}>Setup</Button>
            <Button
              variant="secondary"
              disabled={busyAction !== null || spinActive}
              onClick={() => runAction(giveaway.status === "OPEN" ? "close" : "open", () =>
                apiPost(giveaway.status === "OPEN" ? "/api/giveaway/close" : "/api/giveaway/open")
              )}
              className={giveaway.status === "OPEN"
                ? "!border-red-400/30 !bg-red-500/20 hover:!bg-red-500/30"
                : "!border-emerald-400/30 !bg-emerald-500/20 hover:!bg-emerald-500/30 animate-pulse"}
            >
              {giveaway.status === "OPEN" ? "Close entry" : "Open entry"}
            </Button>
            <Button
              disabled={busyAction !== null || spinActive || eligibleEntrants.length === 0}
              onClick={() => runAction("spin", () => apiPost("/api/giveaway/spin"))}
            >
              Spin now
            </Button>
          </div>
        </div>
      </Card>

      {/* Wheel + side panel */}
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Wheel
          entrants={eligibleEntrants.map((e) => ({ id: e.id, displayName: e.displayName }))}
          lastSpin={giveaway.lastSpin}
          winnerLabel={spinActive ? null : giveaway.winners[0]?.displayName ?? null}
          onSpin={() => runAction("spin", () => apiPost("/api/giveaway/spin"))}
          spinDisabled={busyAction !== null || spinActive || eligibleEntrants.length === 0}
        />

        {/* Side panel */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Entrants</p>
              <p className="mt-2 text-3xl font-bold text-white">{eligibleEntrants.length}</p>
              <p className="mt-1 text-xs text-slate-500">{giveaway.entrantCount} total active</p>
            </div>
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Latest win</p>
              <p className="mt-2 text-lg font-bold leading-tight text-white">
                {spinActive ? "Revealing..." : giveaway.winners[0]?.displayName ?? "—"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {giveaway.winners[0] ? formatRelativeTime(giveaway.winners[0].createdAt) : "No winners yet"}
              </p>
            </div>
          </div>

          {/* Next move */}
          <Card className="space-y-3 px-5 py-5">
            <p className="section-kicker">Next move</p>
            <p className="text-base font-semibold text-white">
              {spinActive
                ? "Winner reveal is running"
                : giveaway.status === "OPEN"
                  ? `Chat can enter with ${giveaway.entryCommand}`
                  : "Open entry when you're ready"}
            </p>
            <p className="text-sm text-slate-400">
              {spinActive
                ? "The winner popup lands when the wheel finishes."
                : `${eligibleEntrants.length} eligible entrant${eligibleEntrants.length === 1 ? "" : "s"} on the wheel.`}
            </p>
            {latestJoinRejection ? (
              <div className="rounded-[18px] border border-amber-400/20 bg-amber-500/[0.08] px-3 py-3 text-sm text-amber-200">
                {latestJoinRejection.message}
              </div>
            ) : null}
          </Card>

          {/* Secondary actions */}
          <DisclosurePanel kicker="More" title="Secondary actions" defaultOpen={false}>
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-3">
                <Button variant="secondary" disabled={busyAction !== null || spinActive || eligibleEntrants.length === 0}
                  onClick={() => runAction("reroll", () => apiPost("/api/giveaway/reroll"))}>Reroll</Button>
                <Button variant="secondary" disabled={busyAction !== null || spinActive}
                  onClick={() => runAction("chatters", () => apiPost("/api/entrants/import-chatters"))}>Import chatters</Button>
                <Button variant="secondary" disabled={busyAction !== null || spinActive}
                  onClick={() => runAction("clear", () => apiPost("/api/giveaway/clear"))}>Clear all</Button>
              </div>

              <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.04] px-4 py-4">
                <label className="field-label">Manual add</label>
                <div className="flex gap-2">
                  <input className="field-input" placeholder="Username" value={manualUsername}
                    onChange={(e) => setManualUsername(e.target.value)} />
                  <Button variant="secondary" disabled={busyAction !== null || spinActive || manualUsername.trim().length < 2}
                    onClick={() => runAction("add-entrant", async () => {
                      await apiPost("/api/entrants/add", { username: manualUsername.trim() });
                      setManualUsername("");
                    })}>Add</Button>
                </div>
              </div>

              <div className="rounded-[20px] border border-white/[0.08] bg-slate-950/40 px-4 py-3 text-xs text-slate-400 break-all">
                {snapshot.overlayUrl ?? "Overlay URL unavailable"}
              </div>

              <div className="grid gap-2 sm:grid-cols-4">
                <Button variant="secondary" disabled={!snapshot.overlayUrl}
                  onClick={() => snapshot.overlayUrl && copyToClipboard(snapshot.overlayUrl)}>Copy overlay URL</Button>
                <Button variant="secondary" disabled={!snapshot.overlayUrl}
                  onClick={() => snapshot.overlayUrl && window.open(snapshot.overlayUrl, "GiveawayOverlay", "width=1920,height=1080")}>Show overlay</Button>
                <Button variant="secondary" onClick={() => apiDownload("/api/entrants/export")}>Export entrants</Button>
                <Button variant="secondary" onClick={() => apiDownload("/api/history/export")}>Export winners</Button>
              </div>
            </div>
          </DisclosurePanel>
        </div>
      </div>

      {/* Bottom grid: entrants | winners | activity */}
      <div className="grid gap-5 xl:grid-cols-3">
        {/* Entrants */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-kicker">Entrants</p>
              <h3 className="mt-1 text-lg font-bold text-white">Live pool</h3>
            </div>
            <span className="pill-chip">{giveaway.entrantCount} active</span>
          </div>
          <div className="max-h-[32rem] space-y-2.5 overflow-auto pr-1">
            {giveaway.entrants.length === 0 ? (
              <p className="text-sm text-slate-400">No entrants yet.</p>
            ) : giveaway.entrants.map((entrant) => (
              <div key={entrant.id} className={cn("rounded-[22px] border px-4 py-3",
                entrant.isEligible ? "border-white/[0.08] bg-white/[0.04]" : "border-amber-400/20 bg-amber-500/[0.07]")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{entrant.displayName}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{entrant.roleLabel} · {entrant.entryCount} entr{entrant.entryCount === 1 ? "y" : "ies"}</p>
                  </div>
                  <Button variant="ghost" disabled={busyAction !== null || spinActive}
                    onClick={() => setExpandedEntrantId((c) => c === entrant.id ? null : entrant.id)}>
                    {expandedEntrantId === entrant.id ? "Hide" : "Manage"}
                  </Button>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <RoleTags entrant={entrant} />
                  {!entrant.isEligible ? <span className="pill-chip">Ineligible</span> : null}
                </div>
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Chance</span><span>{formatPercent(entrant.chancePercent)}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-slate-950/70">
                    <div className={cn("h-full rounded-full", entrant.isEligible ? "bg-brand-300" : "bg-amber-300")}
                      style={{ width: `${Math.max(Math.min(entrant.chancePercent, 100), entrant.isEligible ? 5 : 0)}%` }} />
                  </div>
                </div>
                {expandedEntrantId === entrant.id ? (
                  <div className="mt-3 flex flex-wrap gap-2 rounded-[18px] border border-white/[0.08] bg-slate-950/40 px-4 py-3">
                    {entrant.entryCount > 1 ? (
                      <Button variant="secondary" disabled={busyAction !== null || spinActive}
                        onClick={() => runAction(`remove-one-${entrant.username}`, async () => {
                          await apiPost("/api/entrants/remove", { username: entrant.username, mode: "single" });
                          setExpandedEntrantId(null);
                        })}>Remove 1 entry</Button>
                    ) : null}
                    <Button variant="ghost" disabled={busyAction !== null || spinActive}
                      onClick={() => runAction(`remove-${entrant.username}`, async () => {
                        await apiPost("/api/entrants/remove", { username: entrant.username, mode: "all" });
                        setExpandedEntrantId(null);
                      })}>Remove entrant</Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>

        {/* Winners */}
        <Card className="space-y-4">
          <div>
            <p className="section-kicker">Winners</p>
            <h3 className="mt-1 text-lg font-bold text-white">Recent picks</h3>
          </div>
          <div className="space-y-2.5">
            {spinActive ? (
              <div className="rounded-[20px] border border-violet-400/20 bg-violet-500/[0.08] px-4 py-4 text-sm text-violet-200">
                Reveal in progress — winner appears here when the wheel stops.
              </div>
            ) : null}
            {visibleWinners.length === 0 ? (
              <p className="text-sm text-slate-400">No winners yet.</p>
            ) : visibleWinners.map((w) => (
              <div key={w.id} className="rounded-[20px] border border-white/[0.08] bg-white/[0.04] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{w.displayName}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{w.source} · {formatRelativeTime(w.createdAt)}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-2.5 py-1 text-xs font-semibold text-violet-200">
                    {w.selectedWeight.toFixed(2)}×
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity */}
        <Card className="space-y-4">
          <div>
            <p className="section-kicker">Activity</p>
            <h3 className="mt-1 text-lg font-bold text-white">Command log</h3>
          </div>
          <div className="max-h-[32rem] space-y-2.5 overflow-auto pr-1">
            {giveaway.recentActivity.length === 0 ? (
              <p className="text-sm text-slate-400">No recent activity.</p>
            ) : giveaway.recentActivity.map((e) => <ActivityCard key={e.id} entry={e} />)}
          </div>
        </Card>
      </div>

      {/* Setup modal */}
      {showSetupModal && setupForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[34px] border border-violet-400/15 bg-[linear-gradient(160deg,rgba(15,22,42,0.99),rgba(5,8,18,0.99))] p-6 shadow-[0_32px_100px_rgba(0,0,0,0.55)]">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/35 to-transparent" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">Quick setup</p>
                <h3 className="mt-1.5 text-2xl font-bold text-white">Tune the giveaway</h3>
              </div>
              <Button variant="ghost" onClick={dismissSetup}>Close</Button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="field-label">Title</label><input className="field-input" value={setupForm.title} onChange={(e) => setSetupForm((c) => c ? { ...c, title: e.target.value } : c)} /></div>
                <div><label className="field-label">Entry command</label><input className="field-input" value={setupForm.entryCommand} onChange={(e) => setSetupForm((c) => c ? { ...c, entryCommand: e.target.value } : c)} /></div>
                <div><label className="field-label">Leave command</label><input className="field-input" value={setupForm.leaveCommand} onChange={(e) => setSetupForm((c) => c ? { ...c, leaveCommand: e.target.value } : c)} /></div>
                <NumberStepper
                  label="Max entries per user"
                  value={setupForm.maxEntriesPerUser}
                  onChange={(v) => setSetupForm((c) => c ? { ...c, maxEntriesPerUser: v } : c)}
                  min={1}
                  max={100}
                />
                <NumberStepper
                  label="Spin countdown (s)"
                  value={setupForm.spinCountdownSeconds}
                  onChange={(v) => setSetupForm((c) => c ? { ...c, spinCountdownSeconds: v } : c)}
                  min={0}
                  max={15}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <TimeStepper
                  label="Min account age"
                  days={setupForm.minimumAccountAgeDays}
                  onChange={(v) => setSetupForm((c) => c ? { ...c, minimumAccountAgeDays: v } : c)}
                />
                <TimeStepper
                  label="Min followage"
                  days={setupForm.minimumFollowageDays}
                  onChange={(v) => setSetupForm((c) => c ? { ...c, minimumFollowageDays: v } : c)}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <SetupToggle label="Allow duplicate entries" checked={setupForm.allowDuplicateEntries} onChange={(v) => setSetupForm((c) => c ? { ...c, allowDuplicateEntries: v } : c)} description="Let viewers stack entries up to the per-user cap." />
              <SetupToggle label="Remove winner after draw" checked={setupForm.removeWinnerAfterDraw} onChange={(v) => setSetupForm((c) => c ? { ...c, removeWinnerAfterDraw: v } : c)} description="Remove the winner from the pool once revealed." />
              <SetupToggle label="Announce winner in chat" checked={setupForm.announceWinnerInChat} onChange={(v) => setSetupForm((c) => c ? { ...c, announceWinnerInChat: v } : c)} description="Post the winner into Twitch chat after the spin." />
              <SetupToggle label="Exclude broadcaster" checked={setupForm.excludeBroadcaster} onChange={(v) => setSetupForm((c) => c ? { ...c, excludeBroadcaster: v } : c)} description="Block broadcaster self-entry." />
              <SetupToggle label="Follower-only mode" checked={setupForm.followerOnlyMode} onChange={(v) => setSetupForm((c) => c ? { ...c, followerOnlyMode: v } : c)} description="Require entrants to follow the channel." />
              <SetupToggle label="Subscriber-only mode" checked={setupForm.subscriberOnlyMode} onChange={(v) => setSetupForm((c) => c ? { ...c, subscriberOnlyMode: v } : c)} description="Restrict entry to current subscribers." />
            </div>

            <div className="mt-6 rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-5 py-5">
              <p className="section-kicker">Role multipliers</p>
              <h4 className="mt-1.5 text-lg font-bold text-white">Weight each role</h4>
              <p className="mt-1.5 text-sm text-slate-400">Higher values increase that role's chances of winning.</p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {(
                  [
                    ["viewerWeight", "Viewer"],
                    ["followerWeight", "Follower"],
                    ["subscriberWeight", "Subscriber"],
                    ["vipWeight", "VIP"],
                    ["moderatorWeight", "Moderator"],
                    ["broadcasterWeight", "Broadcaster"]
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between">
                      <label className="field-label">{label}</label>
                      <span className="text-sm font-bold text-violet-300">{setupForm.weights[key].toFixed(2)}×</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.25"
                      value={setupForm.weights[key]}
                      onChange={(e) => setSetupForm((c) => c ? {
                        ...c,
                        weights: { ...c.weights, [key]: Number(e.target.value) }
                      } : c)}
                      className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={dismissSetup}>Later</Button>
              <Button disabled={savingSetup} onClick={saveSetup}>{savingSetup ? "Saving..." : "Save"}</Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Winner popup */}
      {winnerPopupName ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/88 p-4 backdrop-blur-md"
          onClick={() => setWinnerPopupName(null)}>
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[40px] border border-violet-400/25 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.28),transparent_48%),linear-gradient(160deg,rgba(11,16,34,0.99),rgba(6,8,18,0.99))] px-8 py-10 text-center shadow-[0_48px_130px_rgba(0,0,0,0.65)]"
            onClick={(e) => e.stopPropagation()}>
            <div className="pointer-events-none absolute inset-x-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-violet-500/20 blur-[90px]" />
            <div className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-400/35 to-transparent" />

            <p className="section-kicker">Winner locked in</p>
            <h3 className="mt-4 text-xl font-semibold text-slate-200">The wheel landed on</h3>
            <p className="mt-5 font-display text-5xl font-bold tracking-tight text-white sm:text-7xl">
              {winnerPopupName}
            </p>
            <p className="mx-auto mt-5 max-w-xl text-sm text-slate-300">
              Call it out on stream, then use Secondary actions if you need a reroll.
            </p>
            <div className="mt-8 flex justify-center">
              <Button onClick={() => setWinnerPopupName(null)}>Dismiss</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
