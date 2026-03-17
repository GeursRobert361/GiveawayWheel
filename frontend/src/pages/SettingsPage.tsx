import { useEffect, useState } from "react";
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
    <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950"
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
        <p className="text-sm text-slate-300">Waiting for settings data…</p>
      </Card>
    );
  }

  const updateForm = <K extends keyof SettingsFormState>(key: K, value: SettingsFormState[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200/70">
            Giveaway setup
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">Current session settings</h2>
        </div>

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
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200/70">
            Restrictions and behavior
          </p>
          <h3 className="mt-2 text-xl font-bold text-white">Entry rules</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Toggle
            label="Remove winner after draw"
            checked={form.removeWinnerAfterDraw}
            onChange={(checked) => updateForm("removeWinnerAfterDraw", checked)}
            description="Automatically remove the winner from the active entrant pool after each spin."
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
            description="Send the final winner message back into Twitch chat after the spin finishes."
          />
          <Toggle
            label="Exclude broadcaster"
            checked={form.excludeBroadcaster}
            onChange={(checked) => updateForm("excludeBroadcaster", checked)}
            description="Keep the broadcaster out of the entrant pool by default."
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200/70">Weighting</p>
          <h3 className="mt-2 text-xl font-bold text-white">Role multipliers</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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
              <label className="field-label">{label}</label>
              <input
                className="field-input"
                type="number"
                step="0.25"
                min={0}
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
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200/70">Custom overrides</p>
            <h3 className="mt-2 text-xl font-bold text-white">User-specific weight or blacklist rules</h3>
          </div>
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

        <div className="space-y-3">
          {form.overrides.length === 0 ? (
            <p className="text-sm text-slate-400">No overrides yet.</p>
          ) : (
            form.overrides.map((override, index) => (
              <div
                key={`${override.username}-${index}`}
                className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1.2fr_0.8fr_1fr_auto]"
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
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
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
      </Card>

      <div className="flex justify-end">
        <Button
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await apiPost("/api/settings/update", form);
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </div>
  );
}
