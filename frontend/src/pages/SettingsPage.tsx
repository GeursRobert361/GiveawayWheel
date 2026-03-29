import { useEffect, useState } from "react";
import { DisclosurePanel } from "../components/ui/DisclosurePanel";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { apiPost } from "../lib/api";
import type { GiveawaySnapshot } from "../lib/types";
import { useDashboardStore } from "../store/useDashboardStore";

interface OverrideFormRow {
  username: string;
  weight: number;
  isBlocked: boolean;
  notes?: string | null;
}

interface SettingsFormState {
  title: string;
  entryCommand: string;
  leaveCommand: string;
  removeWinnerAfterDraw: boolean;
  allowDuplicateEntries: boolean;
  maxEntriesPerUser: number;
  followerOnlyMode: boolean;
  subscriberOnlyMode: boolean;
  announceWinnerInChat: boolean;
  excludeBroadcaster: boolean;
  minimumAccountAgeDays: number;
  spinCountdownSeconds: number;
  weights: GiveawaySnapshot["weightSettings"];
  overrides: OverrideFormRow[];
}

function buildForm(giveaway: GiveawaySnapshot): SettingsFormState {
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
    weights: giveaway.weightSettings,
    overrides: giveaway.overrides.map((override) => ({
      username: override.username,
      weight: override.weight,
      isBlocked: override.isBlocked,
      notes: override.notes
    }))
  };
}

function Toggle({
  label,
  checked,
  onChange,
  description
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-[22px] border border-white/[0.08] bg-white/[0.04] px-4 py-4 transition hover:border-violet-400/20 hover:bg-white/[0.06]">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 accent-violet-500"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <span className="block font-semibold text-white">{label}</span>
        <span className="mt-1 block text-sm text-slate-400">{description}</span>
      </span>
    </label>
  );
}

export function SettingsPage() {
  const snapshot = useDashboardStore((state) => state.snapshot);
  const [form, setForm] = useState<SettingsFormState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (snapshot?.giveaway) {
      setForm(buildForm(snapshot.giveaway));
    }
  }, [snapshot?.giveaway]);

  if (!snapshot?.giveaway || !form) {
    return (
      <Card>
        <p className="text-sm text-slate-300">Waiting for settings data...</p>
      </Card>
    );
  }

  const updateForm = <K extends keyof SettingsFormState>(key: K, value: SettingsFormState[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  return (
    <div className="space-y-6">
      <Card className="px-6 py-6 sm:px-7">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="section-kicker">Configuration studio</p>
            <h2 className="page-title">Giveaway settings</h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
              The most-used controls stay up front. Heavier configuration lives behind expandable panels so the page
              stays fast to scan during a stream.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="pill-chip">Join: {form.entryCommand}</span>
              <span className="pill-chip">Leave: {form.leaveCommand}</span>
              <span className="pill-chip">
                {form.allowDuplicateEntries ? `Up to ${form.maxEntriesPerUser} entries` : "Single entry only"}
              </span>
              <span className="pill-chip">{form.spinCountdownSeconds}s countdown</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Audience gate</p>
              <p className="mt-2 text-xl font-bold text-white">
                {form.subscriberOnlyMode ? "Subscribers" : form.followerOnlyMode ? "Followers" : "Everyone"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {form.excludeBroadcaster ? "Broadcaster blocked by default" : `Broadcaster can test ${form.entryCommand}`}
              </p>
            </div>
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Winner behavior</p>
              <p className="mt-2 text-xl font-bold text-white">
                {form.removeWinnerAfterDraw ? "Winner removed" : "Winner stays in pool"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {form.announceWinnerInChat ? "Winner announced in chat" : "Overlay only"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <DisclosurePanel
        kicker="Core setup"
        title="Session identity"
        description="The title and the two chat commands stream viewers actually see."
        defaultOpen
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">Title</label>
            <input className="field-input" value={form.title} onChange={(event) => updateForm("title", event.target.value)} />
          </div>
          <div>
            <label className="field-label">Entry command</label>
            <input
              className="field-input"
              value={form.entryCommand}
              onChange={(event) => updateForm("entryCommand", event.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Leave command</label>
            <input
              className="field-input"
              value={form.leaveCommand}
              onChange={(event) => updateForm("leaveCommand", event.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Spin countdown (seconds)</label>
            <input
              className="field-input"
              type="number"
              min={0}
              max={15}
              value={form.spinCountdownSeconds}
              onChange={(event) => updateForm("spinCountdownSeconds", Number(event.target.value))}
            />
            <p className="field-hint">Controls how long the audience sees the pre-spin suspense countdown.</p>
          </div>
        </div>
      </DisclosurePanel>

      <DisclosurePanel
        kicker="Entry rules"
        title="Eligibility and behavior"
        description="Keep the common stream-time rules available, but out of the way when you do not need them."
        defaultOpen
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">Max entries per user</label>
            <input
              className="field-input"
              type="number"
              min={1}
              max={100}
              value={form.maxEntriesPerUser}
              onChange={(event) => updateForm("maxEntriesPerUser", Number(event.target.value))}
            />
          </div>
          <div>
            <label className="field-label">Minimum account age (days)</label>
            <input
              className="field-input"
              type="number"
              min={0}
              max={3650}
              value={form.minimumAccountAgeDays}
              onChange={(event) => updateForm("minimumAccountAgeDays", Number(event.target.value))}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Toggle
            label="Remove winner after draw"
            checked={form.removeWinnerAfterDraw}
            onChange={(checked) => updateForm("removeWinnerAfterDraw", checked)}
            description="Automatically remove the winner from the live entrant pool after each spin."
          />
          <Toggle
            label="Allow duplicate entries"
            checked={form.allowDuplicateEntries}
            onChange={(checked) => updateForm("allowDuplicateEntries", checked)}
            description="Allow repeated join commands up to the configured per-user entry cap."
          />
          <Toggle
            label="Follower-only mode"
            checked={form.followerOnlyMode}
            onChange={(checked) => updateForm("followerOnlyMode", checked)}
            description="Require the entrant to follow the channel before they can join."
          />
          <Toggle
            label="Subscriber-only mode"
            checked={form.subscriberOnlyMode}
            onChange={(checked) => updateForm("subscriberOnlyMode", checked)}
            description="Restrict the giveaway to current channel subscribers."
          />
          <Toggle
            label="Announce winner in chat"
            checked={form.announceWinnerInChat}
            onChange={(checked) => updateForm("announceWinnerInChat", checked)}
            description="Send the winner message back into Twitch chat after the wheel finishes."
          />
          <Toggle
            label="Exclude broadcaster"
            checked={form.excludeBroadcaster}
            onChange={(checked) => updateForm("excludeBroadcaster", checked)}
            description="Disable broadcaster self-entry unless you intentionally want to test from your own account."
          />
        </div>
      </DisclosurePanel>

      <DisclosurePanel
        kicker="Weight studio"
        title="Role multipliers"
        description="These weights directly shape the chance preview on the dashboard and the final winner selection."
      >
        <div className="grid gap-5 md:grid-cols-2">
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
                <span className="text-sm font-bold text-violet-300">{form.weights[key].toFixed(2)}×</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.25"
                value={form.weights[key]}
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? {
                          ...current,
                          weights: {
                            ...current.weights,
                            [key]: Number(event.target.value)
                          }
                        }
                      : current
                  )
                }
                className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500"
              />
            </div>
          ))}
        </div>
      </DisclosurePanel>

      <DisclosurePanel
        kicker="Per-user rules"
        title="Overrides and blacklist"
        description="Use overrides for sponsor boosts, trusted community members, or permanent blocks."
      >
        <div className="flex justify-end">
          <Button
            variant="secondary"
            onClick={() =>
              setForm((current) =>
                current
                  ? {
                      ...current,
                      overrides: [...current.overrides, { username: "", weight: 1, isBlocked: false, notes: "" }]
                    }
                  : current
              )
            }
          >
            Add override
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {form.overrides.length === 0 ? (
            <p className="text-sm text-slate-400">No overrides yet.</p>
          ) : (
            form.overrides.map((override, index) => (
              <div
                key={`${override.username}-${index}`}
                className="grid gap-3 rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4 md:grid-cols-[1.1fr_0.8fr_1fr_auto]"
              >
                <input
                  className="field-input"
                  placeholder="username"
                  value={override.username}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            overrides: current.overrides.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, username: event.target.value } : item
                            )
                          }
                        : current
                    )
                  }
                />
                <input
                  className="field-input"
                  type="number"
                  min={0}
                  step="0.25"
                  placeholder="weight"
                  value={override.weight}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            overrides: current.overrides.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, weight: Number(event.target.value) } : item
                            )
                          }
                        : current
                    )
                  }
                />
                <label className="flex items-center gap-3 rounded-2xl border border-white/[0.08] px-4 py-3 text-sm transition hover:border-violet-400/20">
                  <input
                    type="checkbox"
                    className="accent-violet-500"
                    checked={override.isBlocked}
                    onChange={(event) =>
                      setForm((current) =>
                        current
                          ? {
                              ...current,
                              overrides: current.overrides.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, isBlocked: event.target.checked } : item
                              )
                            }
                          : current
                      )
                    }
                  />
                  Block user
                </label>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            overrides: current.overrides.filter((_, itemIndex) => itemIndex !== index)
                          }
                        : current
                    )
                  }
                >
                  Remove
                </Button>
                <input
                  className="field-input md:col-span-4"
                  placeholder="Optional notes"
                  value={override.notes ?? ""}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            overrides: current.overrides.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, notes: event.target.value } : item
                            )
                          }
                        : current
                    )
                  }
                />
              </div>
            ))
          )}
        </div>
      </DisclosurePanel>

      <div className="flex justify-end">
        <Button
          disabled={saving}
          className="min-w-[180px]"
          onClick={async () => {
            setSaving(true);
            try {
              await apiPost("/api/settings/update", form);
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </div>
  );
}
