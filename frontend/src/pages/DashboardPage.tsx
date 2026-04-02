import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-700/70 bg-slate-800/60 px-4 py-4 transition hover:border-slate-600 hover:bg-slate-700/60">
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
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-slate-700/60 text-slate-100 transition hover:border-slate-600 hover:bg-slate-700 disabled:opacity-40"
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
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-slate-700/60 text-slate-100 transition hover:border-slate-600 hover:bg-slate-700 disabled:opacity-40"
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
    onChange(newDays);
  };

  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-slate-700/60 text-slate-100 transition hover:border-slate-600 hover:bg-slate-700 disabled:opacity-40"
          onClick={() => handleValueChange(Math.max(0, displayValue - 1))}
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
        <select
          className="field-input"
          value={unit}
          onChange={(e) => setUnit(e.target.value as TimeUnit)}
        >
          <option value="hours">Hours</option>
          <option value="days">Days</option>
          <option value="months">Months</option>
          <option value="years">Years</option>
        </select>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-slate-700/60 text-slate-100 transition hover:border-slate-600 hover:bg-slate-700 disabled:opacity-40"
          onClick={() => handleValueChange(displayValue + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

function RoleTags({ entrant }: { entrant: WeightedEntrantView }) {
  const tags = [];
  if (entrant.roleFlags.follower) tags.push("Follower");
  if (entrant.roleFlags.subscriber) tags.push("Sub");
  if (entrant.roleFlags.vip) tags.push("VIP");
  if (entrant.roleFlags.moderator) tags.push("Mod");
  if (entrant.roleFlags.broadcaster) tags.push("Broadcaster");
  return (
    <>
      {tags.map((tag) => (
        <span key={tag} className="pill-chip">{tag}</span>
      ))}
    </>
  );
}

function ActivityCard({ entry }: { entry: AuditLogView }) {
  return (
    <div className="rounded-lg border border-slate-700/70 bg-slate-800/60 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
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
  const { t } = useTranslation();
  const snapshot = useDashboardStore((state) => state.snapshot);
  const error = useDashboardStore((state) => state.error);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [manualUsername, setManualUsername] = useState("");
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [savingSetup, setSavingSetup] = useState(false);
  const [setupForm, setSetupForm] = useState<SetupFormState | null>(null);
  const [winnerPopupName, setWinnerPopupName] = useState<string | null>(null);
  const [winnerPopupChance, setWinnerPopupChance] = useState<number | null>(null);
  const [expandedEntrantId, setExpandedEntrantId] = useState<string | null>(null);
  const [dismissKey, setDismissKey] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showHotkeys, setShowHotkeys] = useState(false);
  const bootstrappedSpinRef = useRef(false);
  const handledWinnerPopupRef = useRef<string | null>(null);

  const handleDismissWinner = async () => {
    setWinnerPopupName(null);
    setWinnerPopupChance(null);
    setDismissKey((k) => k + 1);
    // Call API to dismiss winner - will broadcast to overlay via WebSocket
    await apiPost("/api/giveaway/dismiss-winner").catch(() => {});
  };

  const toggleFullscreen = () => {
    const wheelFullscreenTarget = document.getElementById("wheel-fullscreen-target");
    if (!wheelFullscreenTarget) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      const originalStyles = wheelFullscreenTarget.getAttribute('style') || '';
      const childOriginalStyles = new Map<Element, string>();

      const applyFullscreenStyles = () => {
        const target = document.getElementById("wheel-fullscreen-target");
        if (target && document.fullscreenElement === target) {
          target.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            padding: 0 !important;
            margin: 0 !important;
            background: radial-gradient(circle at center, rgba(71, 215, 255, 0.16), transparent 40%), linear-gradient(180deg, #09111f 0%, #030509 100%) !important;
            overflow: hidden !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          `;

          const mainContainer = target.children[3] as HTMLElement;
          if (mainContainer) {
            childOriginalStyles.set(mainContainer, mainContainer.getAttribute('style') || '');
            mainContainer.style.cssText = `
              width: 90vmin !important;
              height: 90vmin !important;
              max-width: none !important;
              margin: 0 !important;
            `;

            const innerWrapper = mainContainer.children[1] as HTMLElement;
            if (innerWrapper) {
              childOriginalStyles.set(innerWrapper, innerWrapper.getAttribute('style') || '');
              innerWrapper.style.cssText = `
                width: 100% !important;
                height: 100% !important;
              `;
            }
          }
        }
      };

      const restoreStyles = () => {
        const target = document.getElementById("wheel-fullscreen-target");
        if (target) {
          target.setAttribute('style', originalStyles);
          childOriginalStyles.forEach((style, element) => {
            (element as HTMLElement).setAttribute('style', style);
          });
        }
      };

      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
          restoreStyles();
          wheelFullscreenTarget.removeEventListener("fullscreenchange", handleFullscreenChange);
        } else {
          applyFullscreenStyles();
        }
      };

      wheelFullscreenTarget.addEventListener("fullscreenchange", handleFullscreenChange);
      setTimeout(applyFullscreenStyles, 50);
      wheelFullscreenTarget.requestFullscreen().catch(() => {});
    }
  };

  const eligibleEntrants = useMemo(() => getEligibleEntrants(snapshot), [snapshot]);
  const giveaway = snapshot?.giveaway;

  // Only show lastSpin to wheel if it's fresh (not completed before page load)
  const wheelLastSpin = useMemo(() => {
    if (!giveaway?.lastSpin) return null;
    // If this is handled (either old or already shown), don't pass to wheel
    if (handledWinnerPopupRef.current === giveaway.lastSpin.eventId) return null;
    return giveaway.lastSpin;
  }, [giveaway?.lastSpin]);

  useEffect(() => {
    if (giveaway) setSetupForm(buildSetupForm(giveaway));
  }, [giveaway]);

  useEffect(() => {
    if (!giveaway) return;
    const key = `tgw:setup-dismissed:${giveaway.id}:${giveaway.resetCount}`;
    if (window.localStorage.getItem(key)) return;
    setShowSetupModal(true);
  }, [giveaway]);

  useEffect(() => {
    const spin = giveaway?.lastSpin;
    if (!spin) {
      // Reset when lastSpin is dismissed to allow next spin
      handledWinnerPopupRef.current = null;
      return;
    }
    const completedAt = new Date(spin.completedAt).getTime();
    if (!bootstrappedSpinRef.current) {
      bootstrappedSpinRef.current = true;
      // If spin completed in the past, mark as handled without showing popup
      if (completedAt <= Date.now()) {
        handledWinnerPopupRef.current = spin.eventId;
        return;
      }
    }
    if (handledWinnerPopupRef.current === spin.eventId) return;

    console.log('[POPUP] Scheduling winner popup for:', spin.winnerDisplayName, 'eventId:', spin.eventId);
    setWinnerPopupName(null);
    setWinnerPopupChance(null);
    handledWinnerPopupRef.current = spin.eventId;
    const delay = Math.max(0, completedAt - Date.now());
    console.log('[POPUP] Delay:', delay, 'ms');
    const timer = window.setTimeout(
      () => {
        console.log('[POPUP] Showing winner popup:', spin.winnerDisplayName);
        setWinnerPopupName(spin.winnerDisplayName);
        setWinnerPopupChance(spin.winnerChancePercent);
      },
      delay
    );
    return () => window.clearTimeout(timer);
  }, [giveaway?.lastSpin?.eventId]);

  useEffect(() => {
    if (!winnerPopupName) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") handleDismissWinner(); };
    window.addEventListener("keydown", handleKeyDown);

    // Auto-dismiss after 30 seconds
    const autoDismissTimer = window.setTimeout(() => {
      handleDismissWinner();
    }, 30000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(autoDismissTimer);
    };
  }, [winnerPopupName]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!giveaway) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Don't trigger if modal is open
      if (showSetupModal || showClearConfirm) return;

      const key = e.key.toLowerCase();
      const spinActive = isSpinInProgress(giveaway.lastSpin);

      if (key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (key === ' ') {
        e.preventDefault();
        if (!busyAction && !spinActive && eligibleEntrants.length > 0) {
          apiPost("/api/giveaway/spin");
        }
      } else if (key === 'o') {
        e.preventDefault();
        if (!busyAction && !spinActive) {
          apiPost(giveaway.status === "OPEN" ? "/api/giveaway/close" : "/api/giveaway/open");
        }
      } else if (key === 'r') {
        e.preventDefault();
        if (!busyAction && !spinActive && eligibleEntrants.length > 0) {
          apiPost("/api/giveaway/reroll");
        }
      } else if (key === 's' && e.shiftKey) {
        e.preventDefault();
        if (!busyAction && eligibleEntrants.length > 0) {
          apiPost("/api/giveaway/shuffle");
        }
      } else if (key === 'd' || key === 'escape') {
        if (winnerPopupName) {
          e.preventDefault();
          handleDismissWinner();
        }
      } else if (key === '?') {
        e.preventDefault();
        setShowHotkeys((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [giveaway, busyAction, eligibleEntrants.length, winnerPopupName, showSetupModal, showClearConfirm, showHotkeys]);

  if (!giveaway || !snapshot) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-400">Waiting for giveaway data...</p>
      </div>
    );
  }

  const key = `tgw:setup-dismissed:${giveaway.id}:${giveaway.resetCount}`;
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
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-rose-400/20 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-200">{error}</div>
      ) : null}

      {/* Compact status bar - streamer mission control style */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-700/50 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/80 px-5 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          <span className="font-mono text-sm font-bold uppercase tracking-wider text-white">{giveaway.title}</span>
        </div>
        <div className="h-4 w-px bg-slate-700" />
        <span className="font-mono text-xs text-slate-400">{giveaway.entryCommand}</span>
        <span className={cn(
          "rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
          giveaway.status === "OPEN"
            ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30"
            : "bg-slate-700/50 text-slate-400"
        )}>
          {giveaway.status === "OPEN" ? "● Live" : "Closed"}
        </span>
        <div className="h-4 w-px bg-slate-700" />
        <span className="text-sm text-slate-300">
          <span className="font-bold text-white">{eligibleEntrants.length}</span>
          <span className="text-slate-500"> / {giveaway.entrantCount}</span>
          <span className="ml-1 text-slate-500">eligible</span>
        </span>

        {/* Latest winner inline */}
        {giveaway.winners[0] && !spinActive && (
          <>
            <div className="ml-auto h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-violet-400">Last Win</span>
              <span className="font-semibold text-white">{giveaway.winners[0].displayName}</span>
              <span className="text-xs text-slate-500">{formatRelativeTime(giveaway.winners[0].createdAt)}</span>
            </div>
          </>
        )}
      </div>

      {/* HERO SECTION - Wheel with integrated controls */}
      <div className="relative">
        {/* Background accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-violet-500/5 to-transparent blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Wheel - no card! Let it breathe */}
          <div className="space-y-4">
            {/* Hero action button - ABOVE wheel for visibility */}
            <Button
              variant="secondary"
              disabled={busyAction !== null || spinActive}
              onClick={() => runAction(giveaway.status === "OPEN" ? "close" : "open", () =>
                apiPost(giveaway.status === "OPEN" ? "/api/giveaway/close" : "/api/giveaway/open")
              )}
              className={cn(
                "w-full !h-14 !text-lg !font-bold",
                giveaway.status === "OPEN"
                  ? "!border-red-400/30 !bg-red-500/20 hover:!bg-red-500/30"
                  : "!border-emerald-400/30 !bg-emerald-500/20 hover:!bg-emerald-500/30 animate-pulse"
              )}
            >
              {giveaway.status === "OPEN" ? (
                <>
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  {t('dashboard.closeEntry')}
                </>
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('dashboard.openEntry')}
                </>
              )}
            </Button>

            {/* Secondary action bar */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowSetupModal(true)}
                  className="!border-slate-600/50"
                >
                  <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t('dashboard.setup')}
                </Button>
                <Button
                  variant="secondary"
                  disabled={busyAction !== null || spinActive || eligibleEntrants.length === 0}
                  onClick={() => runAction("reroll", () => apiPost("/api/giveaway/reroll"))}
                  title={t('dashboard.reroll')}
                  className="!border-slate-600/50"
                >
                  <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t('dashboard.reroll')}
                </Button>
              </div>

              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-600/50 bg-slate-800/40 text-slate-300 transition hover:border-slate-500 hover:bg-slate-700/60"
                onClick={toggleFullscreen}
                title="Fullscreen wheel (F)"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>

            {/* Wheel - THE centerpiece */}
            <div id="wheel-container">
              <Wheel
                entrants={eligibleEntrants.map((e) => ({ id: e.id, displayName: e.displayName, weight: e.effectiveWeight }))}
                lastSpin={wheelLastSpin}
                winnerLabel={spinActive ? null : giveaway.winners[0]?.displayName ?? null}
                onSpin={() => runAction("spin", () => apiPost("/api/giveaway/spin"))}
                spinDisabled={busyAction !== null || spinActive || eligibleEntrants.length === 0}
                onWinnerDismiss={() => handleDismissWinner()}
                dismissKey={dismissKey}
              />
            </div>

            {latestJoinRejection && (
              <div className="rounded-lg border border-amber-400/20 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-200">
                <svg className="mr-2 inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {latestJoinRejection.message}
              </div>
            )}
          </div>

          {/* Right panel - OBS SETUP (not hidden!) + quick actions */}
          <div className="space-y-4">
            {/* OBS Setup - PROMINENT! */}
            <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white">{t('dashboard.obsSetup')}</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-violet-300">{t('dashboard.overlayUrl')}</label>
                  {snapshot.overlayUrl ? (
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-lg border border-violet-500/20 bg-slate-900/50 p-2">
                        <p className="font-mono text-xs text-slate-400">••••••••••••••••••••••••••••••••••</p>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => snapshot.overlayUrl && copyToClipboard(snapshot.overlayUrl)}
                        className="!h-auto !border-violet-500/30 !bg-violet-500/10 !px-3 hover:!bg-violet-500/20"
                        title={t('dashboard.copyUrl')}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Configure overlay in Settings</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-violet-300">Size</label>
                  <div className="flex gap-2 text-sm">
                    <div className="flex-1 rounded-lg border border-violet-500/20 bg-slate-900/50 px-3 py-2 text-center">
                      <span className="text-slate-400">Width:</span>{" "}
                      <span className="font-mono font-bold text-white">2500px</span>
                    </div>
                    <div className="flex-1 rounded-lg border border-violet-500/20 bg-slate-900/50 px-3 py-2 text-center">
                      <span className="text-slate-400">Height:</span>{" "}
                      <span className="font-mono font-bold text-white">2500px</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  disabled={!snapshot.overlayUrl}
                  onClick={() => snapshot.overlayUrl && window.open(snapshot.overlayUrl, "GiveawayOverlay", "width=1920,height=1080")}
                  className="w-full !border-violet-500/30 !bg-violet-500/10 hover:!bg-violet-500/20"
                >
                  <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview
                </Button>

                <Button
                  variant="secondary"
                  disabled={!giveaway}
                  onClick={() => runAction("toggle-overlay", () => apiPost("/api/giveaway/toggle-overlay"))}
                  className="w-full !border-slate-600/50"
                >
                  {giveaway?.overlayVisible ? "Hide on Stream" : "Show on Stream"}
                </Button>
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">{t('dashboard.quickActions')}</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    disabled={busyAction !== null || spinActive || eligibleEntrants.length === 0}
                    onClick={() => runAction("shuffle", () => apiPost("/api/giveaway/shuffle"))}
                    className="!border-slate-600/50 !text-sm"
                  >
                    <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                    {t('dashboard.shuffle')}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={busyAction !== null || spinActive}
                    onClick={() => runAction("chatters", () => apiPost("/api/entrants/import-chatters"))}
                    className="!border-slate-600/50 !text-sm"
                  >
                    <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {t('dashboard.importChatters')}
                  </Button>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">{t('dashboard.addManual')}</label>
                  <div className="flex gap-2">
                    <input
                      className="field-input flex-1 !text-sm"
                      placeholder={t('dashboard.username')}
                      value={manualUsername}
                      onChange={(e) => setManualUsername(e.target.value)}
                    />
                    <Button
                      variant="secondary"
                      disabled={busyAction !== null || spinActive || manualUsername.trim().length < 2}
                      onClick={() => runAction("add-entrant", async () => {
                        await apiPost("/api/entrants/add", { username: manualUsername.trim() });
                        setManualUsername("");
                      })}
                      className="!border-slate-600/50"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => apiDownload("/api/entrants/export")}
                    className="!border-slate-600/50 !text-sm"
                  >
                    <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('history.exportCSV')}
                  </Button>
                  <Button
                    variant="danger"
                    disabled={busyAction !== null || spinActive}
                    onClick={() => setShowClearConfirm(true)}
                    className="!text-sm"
                  >
                    <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t('dashboard.clearAll')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom grid - Entrants, Winners, Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Entrants */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">{t('dashboard.entrants')}</h3>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 font-mono text-xs font-bold text-slate-300">
              {giveaway.entrantCount}
            </span>
          </div>
          <div className="max-h-[32rem] space-y-2 overflow-auto pr-1">
            {giveaway.entrants.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">{t('dashboard.noEntrants')}</p>
            ) : giveaway.entrants.map((entrant) => (
              <div
                key={entrant.id}
                className={cn(
                  "rounded-lg border px-3 py-2.5 transition",
                  entrant.isEligible
                    ? "border-slate-700/70 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60"
                    : "border-amber-400/20 bg-amber-500/[0.05]"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{entrant.displayName}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {entrant.roleLabel} · {entrant.entryCount}×
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    disabled={busyAction !== null || spinActive}
                    onClick={() => setExpandedEntrantId((c) => c === entrant.id ? null : entrant.id)}
                    className="!h-7 !px-2 !text-xs"
                  >
                    {expandedEntrantId === entrant.id ? "−" : "+"}
                  </Button>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  <RoleTags entrant={entrant} />
                  {!entrant.isEligible && <span className="pill-chip !bg-amber-500/20 !text-amber-300">{t('dashboard.ineligible')}</span>}
                </div>

                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{t('dashboard.chance')}</span>
                    <span>{formatPercent(entrant.chancePercent)}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-950/70">
                    <div
                      className={cn("h-full rounded-full", entrant.isEligible ? "bg-cyan-400" : "bg-amber-300")}
                      style={{ width: `${Math.max(Math.min(entrant.chancePercent, 100), entrant.isEligible ? 5 : 0)}%` }}
                    />
                  </div>
                </div>

                {expandedEntrantId === entrant.id && (
                  <div className="mt-3 flex flex-wrap gap-2 rounded-md border border-slate-700/50 bg-slate-950/40 px-3 py-2">
                    {entrant.entryCount > 1 && (
                      <Button
                        variant="secondary"
                        disabled={busyAction !== null || spinActive}
                        onClick={() => runAction(`remove-one-${entrant.username}`, async () => {
                          await apiPost("/api/entrants/remove", { username: entrant.username, mode: "single" });
                          setExpandedEntrantId(null);
                        })}
                        className="!h-7 !text-xs"
                      >
                        {t('dashboard.removeOne')}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      disabled={busyAction !== null || spinActive}
                      onClick={() => runAction(`remove-${entrant.username}`, async () => {
                        await apiPost("/api/entrants/remove", { username: entrant.username, mode: "all" });
                        setExpandedEntrantId(null);
                      })}
                      className="!h-7 !text-xs"
                    >
                      {t('dashboard.removeAll')}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Winners */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">{t('dashboard.recentWinners')}</h3>
            <Button
              variant="secondary"
              onClick={() => apiDownload("/api/history/export")}
              className="!h-7 !border-slate-600/50 !px-2 !text-xs"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </Button>
          </div>
          <div className="space-y-2">
            {spinActive && (
              <div className="rounded-lg border border-violet-400/20 bg-violet-500/[0.08] px-4 py-3 text-sm text-violet-200">
                {t('dashboard.spinStarting')}
              </div>
            )}
            {visibleWinners.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">{t('dashboard.noWinners')}</p>
            ) : visibleWinners.map((w) => (
              <div key={w.id} className="rounded-lg border border-slate-700/70 bg-slate-800/40 px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{w.displayName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{giveaway.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{w.source} · {formatRelativeTime(w.createdAt)}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-bold text-violet-300">
                    {w.selectedWeight.toFixed(2)}×
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-5">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">{t('dashboard.activityLog')}</h3>
          <div className="max-h-[32rem] space-y-2 overflow-auto pr-1">
            {giveaway.recentActivity.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">{t('dashboard.noActivity')}</p>
            ) : giveaway.recentActivity.map((e) => (
              <div key={e.id} className="rounded-lg border border-slate-700/70 bg-slate-800/40 px-3 py-2.5">
                <p className="text-sm font-medium text-white">{e.message}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    {e.actorType.toLowerCase()} · @{e.actorLogin}
                  </p>
                  <span className="text-xs text-slate-500">{formatRelativeTime(e.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Setup modal - preserved as-is */}
      {showSetupModal && setupForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-slate-700/70 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{t('setup.title')}</h2>
              <button
                onClick={dismissSetup}
                className="rounded-md p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <label className="field-label">{t('setup.giveawayTitle')}</label>
                  <input
                    className="field-input"
                    value={setupForm.title}
                    onChange={(e) => setSetupForm((c) => c ? { ...c, title: e.target.value } : c)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="field-label">{t('setup.entryCommand')}</label>
                    <input
                      className="field-input"
                      value={setupForm.entryCommand}
                      onChange={(e) => setSetupForm((c) => c ? { ...c, entryCommand: e.target.value } : c)}
                    />
                  </div>
                  <div>
                    <label className="field-label">{t('setup.leaveCommand')}</label>
                    <input
                      className="field-input"
                      value={setupForm.leaveCommand}
                      onChange={(e) => setSetupForm((c) => c ? { ...c, leaveCommand: e.target.value } : c)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">{t('setup.entryRules')}</p>
                  <SetupToggle
                    label={t('setup.followerOnly')}
                    checked={setupForm.followerOnlyMode}
                    onChange={(v) => setSetupForm((c) => c ? { ...c, followerOnlyMode: v } : c)}
                    description={t('setup.followerOnlyDesc')}
                  />
                  <SetupToggle
                    label={t('setup.subscriberOnly')}
                    checked={setupForm.subscriberOnlyMode}
                    onChange={(v) => setSetupForm((c) => c ? { ...c, subscriberOnlyMode: v } : c)}
                    description={t('setup.subscriberOnlyDesc')}
                  />
                  <SetupToggle
                    label={t('setup.excludeBroadcaster')}
                    checked={setupForm.excludeBroadcaster}
                    onChange={(v) => setSetupForm((c) => c ? { ...c, excludeBroadcaster: v } : c)}
                    description={t('setup.excludeBroadcasterDesc')}
                  />
                  <SetupToggle
                    label={t('setup.allowDuplicates')}
                    checked={setupForm.allowDuplicateEntries}
                    onChange={(v) => setSetupForm((c) => c ? { ...c, allowDuplicateEntries: v } : c)}
                    description={t('setup.allowDuplicatesDesc')}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberStepper
                    label={t('setup.maxEntries')}
                    value={setupForm.maxEntriesPerUser}
                    onChange={(v) => setSetupForm((c) => c ? { ...c, maxEntriesPerUser: v } : c)}
                    min={1}
                    max={100}
                  />
                  <NumberStepper
                    label={t('setup.spinCountdown')}
                    value={setupForm.spinCountdownSeconds}
                    onChange={(v) => setSetupForm((c) => c ? { ...c, spinCountdownSeconds: v } : c)}
                    min={0}
                    max={15}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <TimeStepper
                    label={t('setup.minAccountAge')}
                    days={setupForm.minimumAccountAgeDays}
                    onChange={(v) => setSetupForm((c) => c ? { ...c, minimumAccountAgeDays: v } : c)}
                  />
                  <TimeStepper
                    label={t('setup.minFollowDuration')}
                    days={setupForm.minimumFollowageDays}
                    onChange={(v) => setSetupForm((c) => c ? { ...c, minimumFollowageDays: v } : c)}
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">{t('setup.behavior')}</p>
                  <SetupToggle
                    label={t('setup.removeWinner')}
                    checked={setupForm.removeWinnerAfterDraw}
                    onChange={(v) => setSetupForm((c) => c ? { ...c, removeWinnerAfterDraw: v } : c)}
                    description={t('setup.removeWinnerDesc')}
                  />
                  <SetupToggle
                    label={t('setup.announceWinner')}
                    checked={setupForm.announceWinnerInChat}
                    onChange={(v) => setSetupForm((c) => c ? { ...c, announceWinnerInChat: v } : c)}
                    description={t('setup.announceWinnerDesc')}
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{t('setup.roleWeights')}</p>
                  <p className="mb-4 text-sm text-slate-400">{t('setup.roleWeightsDesc')}</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { key: "viewerWeight" as const, label: t('setup.viewer') },
                      { key: "followerWeight" as const, label: t('setup.follower') },
                      { key: "subscriberWeight" as const, label: t('setup.subscriber') },
                      { key: "vipWeight" as const, label: t('setup.vip') },
                      { key: "moderatorWeight" as const, label: t('setup.moderator') },
                      { key: "broadcasterWeight" as const, label: t('setup.broadcaster') }
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-white">{label}</label>
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
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">
              <Button variant="secondary" onClick={dismissSetup}>
                {t('common.cancel')}
              </Button>
              <Button onClick={saveSetup} disabled={savingSetup}>
                {savingSetup ? t('setup.saving') : t('common.save')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Winner popup - preserved as-is */}
      {winnerPopupName ? (
        <>
          {/* Backdrop blur layer */}
          <div className="fixed inset-0 z-[9999] backdrop-blur-md" style={{ margin: 0, padding: 0 }} />
          {/* Content layer */}
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/95 p-4"
            onClick={() => handleDismissWinner()}
            style={{ margin: 0 }}
          >
            <div className="relative w-full max-w-3xl overflow-hidden rounded-lg border border-violet-400/25 bg-slate-900 px-8 py-10 text-center shadow-[0_48px_130px_rgba(0,0,0,0.65)]"
              onClick={(e) => e.stopPropagation()}>
            <div className="pointer-events-none absolute inset-x-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-violet-500/20 blur-[90px]" />
            <div className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-400/35 to-transparent" />

            <p className="section-kicker">{t('dashboard.winnerLockedIn')}</p>
            <h3 className="mt-4 text-xl font-semibold text-slate-200">{t('dashboard.theWheelLandedOn')}</h3>
            <p className="mt-5 font-display text-5xl font-bold tracking-tight text-white sm:text-7xl">
              {winnerPopupName}
            </p>
            {winnerPopupChance !== null && (
              <p className="mt-3 text-lg font-semibold text-violet-300">
                {winnerPopupChance.toFixed(2)}% {t('dashboard.chanceToWin')}
              </p>
            )}
            <div className="mt-8 flex justify-center">
              <Button onClick={() => handleDismissWinner()}>{t('dashboard.dismissWinner')}</Button>
            </div>
          </div>
        </div>
        </>
      ) : null}

      {/* Clear All Confirmation - preserved as-is */}
      {showClearConfirm ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-lg border border-rose-400/30 bg-slate-900 px-6 py-6 shadow-xl">
            <h3 className="text-lg font-bold text-white">{t('dashboard.confirmClear')}</h3>
            <p className="mt-2 text-sm text-slate-300">
              {t('dashboard.confirmClearDesc', { count: giveaway.entrantCount })}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowClearConfirm(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowClearConfirm(false);
                  runAction("clear-all", () => apiPost("/api/entrants/clear"));
                }}
              >
                {t('dashboard.clearAll')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Hotkeys menu */}
      <button
        onClick={() => setShowHotkeys(!showHotkeys)}
        className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 shadow-lg backdrop-blur-sm transition hover:border-violet-400/50 hover:bg-violet-500/20 hover:text-violet-200"
        title={t('dashboard.keyboardShortcuts')}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>

      {showHotkeys && (
        <div className="fixed bottom-20 right-6 z-50 w-80 rounded-xl border border-violet-500/30 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-white">{t('dashboard.keyboardShortcuts')}</h3>
            <button
              onClick={() => setShowHotkeys(false)}
              className="text-slate-400 transition hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2">
              <span className="text-slate-300">{t('dashboard.fullscreenWheel')}</span>
              <kbd className="rounded border border-slate-600 bg-slate-700/60 px-2 py-1 font-mono text-xs font-semibold text-white">F</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2">
              <span className="text-slate-300">{t('dashboard.spinWheel')}</span>
              <kbd className="rounded border border-slate-600 bg-slate-700/60 px-2 py-1 font-mono text-xs font-semibold text-white">Space</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2">
              <span className="text-slate-300">{t('dashboard.openCloseEntry')}</span>
              <kbd className="rounded border border-slate-600 bg-slate-700/60 px-2 py-1 font-mono text-xs font-semibold text-white">O</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2">
              <span className="text-slate-300">{t('dashboard.rerollWinner')}</span>
              <kbd className="rounded border border-slate-600 bg-slate-700/60 px-2 py-1 font-mono text-xs font-semibold text-white">R</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2">
              <span className="text-slate-300">{t('dashboard.shuffleWheel')}</span>
              <kbd className="rounded border border-slate-600 bg-slate-700/60 px-2 py-1 font-mono text-xs font-semibold text-white">Shift + S</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2">
              <span className="text-slate-300">{t('dashboard.dismissWinnerKey')}</span>
              <kbd className="rounded border border-slate-600 bg-slate-700/60 px-2 py-1 font-mono text-xs font-semibold text-white">D</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2">
              <span className="text-slate-300">{t('dashboard.toggleShortcuts')}</span>
              <kbd className="rounded border border-slate-600 bg-slate-700/60 px-2 py-1 font-mono text-xs font-semibold text-white">?</kbd>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            {t('dashboard.shortcutsWork')}
          </p>
        </div>
      )}
    </div>
  );
}
