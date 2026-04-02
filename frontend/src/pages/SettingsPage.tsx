import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  minimumFollowageDays: number;
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
    minimumFollowageDays: giveaway.minimumFollowageDays,
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
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-700/70 bg-slate-800/60 px-4 py-4 transition hover:border-slate-600 hover:bg-slate-700/60">
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
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-white/[0.06] text-slate-100 transition hover:border-slate-600 hover:bg-slate-700 disabled:opacity-40"
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
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-white/[0.06] text-slate-100 transition hover:border-slate-600 hover:bg-slate-700 disabled:opacity-40"
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
  const { t } = useTranslation();
  const [unit, setUnit] = useState<TimeUnit>("days");
  const [displayValue, setDisplayValue] = useState(days);

  // Convert days to display value based on unit
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
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-white/[0.06] text-slate-100 transition hover:border-slate-600 hover:bg-slate-700 disabled:opacity-40"
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
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-white/[0.06] text-slate-100 transition hover:border-slate-600 hover:bg-slate-700"
          onClick={() => handleValueChange(displayValue + 1)}
        >
          +
        </button>
        <select
          className="field-input w-28"
          value={unit}
          onChange={(e) => setUnit(e.target.value as TimeUnit)}
        >
          <option value="hours">{t('common.hours')}</option>
          <option value="days">{t('common.days')}</option>
          <option value="months">{t('common.months')}</option>
          <option value="years">{t('common.years')}</option>
        </select>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
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
        <p className="text-sm text-slate-300">{t('common.loading')}</p>
      </Card>
    );
  }

  const updateForm = <K extends keyof SettingsFormState>(key: K, value: SettingsFormState[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  return (
    <div className="space-y-6">
      <Card className="px-6 py-6 sm:px-7">
        <p className="section-kicker">{t('settings.preferences')}</p>
        <h2 className="page-title">{t('settings.giveawaySettings')}</h2>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
          {t('settings.configDescription')}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="pill-chip">{t('settings.joinCommand')}: {form.entryCommand}</span>
          <span className="pill-chip">{t('settings.leaveCommandLabel')}: {form.leaveCommand}</span>
          <span className="pill-chip">
            {form.allowDuplicateEntries ? t('settings.upToEntries', { count: form.maxEntriesPerUser }) : t('settings.singleEntryOnly')}
          </span>
          <span className="pill-chip">{form.spinCountdownSeconds}s {t('settings.countdown')}</span>
        </div>
      </Card>

      <DisclosurePanel
        kicker={t('settings.coreSetup')}
        title={t('settings.sessionIdentity')}
        description={t('settings.sessionIdentityDesc')}
        defaultOpen
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">{t('settings.titleLabel')}</label>
            <input className="field-input" value={form.title} onChange={(event) => updateForm("title", event.target.value)} />
          </div>
          <div>
            <label className="field-label">{t('settings.entryCommandLabel')}</label>
            <input
              className="field-input"
              value={form.entryCommand}
              onChange={(event) => updateForm("entryCommand", event.target.value)}
            />
          </div>
          <div>
            <label className="field-label">{t('settings.leaveCommandInput')}</label>
            <input
              className="field-input"
              value={form.leaveCommand}
              onChange={(event) => updateForm("leaveCommand", event.target.value)}
            />
          </div>
          <div>
            <label className="field-label">{t('settings.spinCountdownLabel')}</label>
            <input
              className="field-input"
              type="number"
              min={0}
              max={15}
              value={form.spinCountdownSeconds}
              onChange={(event) => updateForm("spinCountdownSeconds", Number(event.target.value))}
            />
            <p className="field-hint">{t('settings.spinCountdownHint')}</p>
          </div>
        </div>
      </DisclosurePanel>

      <DisclosurePanel
        kicker={t('settings.entryRulesKicker')}
        title={t('settings.eligibilityAndBehavior')}
        description={t('settings.eligibilityDesc')}
        defaultOpen
      >
        <NumberStepper
          label={t('settings.maxEntriesLabel')}
          value={form.maxEntriesPerUser}
          onChange={(value) => updateForm("maxEntriesPerUser", value)}
          min={1}
          max={100}
        />

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TimeStepper
            label={t('settings.minAccountAgeLabel')}
            days={form.minimumAccountAgeDays}
            onChange={(days) => updateForm("minimumAccountAgeDays", days)}
          />
          <TimeStepper
            label={t('settings.minFollowageLabel')}
            days={form.minimumFollowageDays}
            onChange={(days) => updateForm("minimumFollowageDays", days)}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Toggle
            label={t('settings.removeWinnerLabel')}
            checked={form.removeWinnerAfterDraw}
            onChange={(checked) => updateForm("removeWinnerAfterDraw", checked)}
            description={t('settings.removeWinnerDescription')}
          />
          <Toggle
            label={t('settings.allowDuplicatesLabel')}
            checked={form.allowDuplicateEntries}
            onChange={(checked) => updateForm("allowDuplicateEntries", checked)}
            description={t('settings.allowDuplicatesDescription')}
          />
          <Toggle
            label={t('settings.followerOnlyLabel')}
            checked={form.followerOnlyMode}
            onChange={(checked) => updateForm("followerOnlyMode", checked)}
            description={t('settings.followerOnlyDescription')}
          />
          <Toggle
            label={t('settings.subscriberOnlyLabel')}
            checked={form.subscriberOnlyMode}
            onChange={(checked) => updateForm("subscriberOnlyMode", checked)}
            description={t('settings.subscriberOnlyDescription')}
          />
          <Toggle
            label={t('settings.announceWinnerLabel')}
            checked={form.announceWinnerInChat}
            onChange={(checked) => updateForm("announceWinnerInChat", checked)}
            description={t('settings.announceWinnerDescription')}
          />
          <Toggle
            label={t('settings.excludeBroadcasterLabel')}
            checked={form.excludeBroadcaster}
            onChange={(checked) => updateForm("excludeBroadcaster", checked)}
            description={t('settings.excludeBroadcasterDescription')}
          />
        </div>
      </DisclosurePanel>

      <DisclosurePanel
        kicker={t('settings.weightStudioKicker')}
        title={t('settings.roleMultipliersTitle')}
        description={t('settings.roleMultipliersDesc')}
      >
        <div className="grid gap-5 md:grid-cols-2">
          {(
            [
              ["viewerWeight", t('setup.viewer')],
              ["followerWeight", t('setup.follower')],
              ["subscriberWeight", t('setup.subscriber')],
              ["vipWeight", t('setup.vip')],
              ["moderatorWeight", t('setup.moderator')],
              ["broadcasterWeight", t('setup.broadcaster')]
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
        kicker={t('settings.perUserRulesKicker')}
        title={t('settings.overridesTitle')}
        description={t('settings.overridesDesc')}
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
            {t('settings.addOverride')}
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {form.overrides.length === 0 ? (
            <p className="text-sm text-slate-400">{t('settings.noOverrides')}</p>
          ) : (
            form.overrides.map((override, index) => (
              <div
                key={`${override.username}-${index}`}
                className="grid gap-3 rounded-lg border border-slate-700/70 bg-slate-800/60 p-4 md:grid-cols-[1.1fr_0.8fr_1fr_auto]"
              >
                <input
                  className="field-input"
                  placeholder={t('settings.usernamePlaceholder')}
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
                  placeholder={t('settings.weightPlaceholder')}
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
                <label className="flex items-center gap-3 rounded-lg border border-slate-700/70 px-4 py-3 text-sm transition hover:border-slate-600">
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
                  {t('settings.blockUser')}
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
                  {t('settings.remove')}
                </Button>
                <input
                  className="field-input md:col-span-4"
                  placeholder={t('settings.optionalNotes')}
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

      <DisclosurePanel
        kicker={t('settings.testingKicker')}
        title={t('settings.testUtilities')}
        defaultOpen={false}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            {t('settings.testDescription')}
          </p>
          <div>
            <label className="field-label">{t('settings.numberOfTestEntrants')}</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="field-input w-32"
                min="1"
                max="100"
                defaultValue="10"
                id="test-entrants-count"
              />
              <Button
                variant="secondary"
                onClick={async () => {
                  const input = document.getElementById("test-entrants-count") as HTMLInputElement;
                  const count = Math.min(Math.max(1, parseInt(input?.value || "10")), 100);
                  try {
                    await apiPost("/api/giveaway/add-test-entrants", { count });
                    alert(t('settings.testEntrantsSuccess', { count }));
                  } catch (error) {
                    alert(t('settings.testEntrantsFailed', { error: error instanceof Error ? error.message : t('settings.unknownError') }));
                  }
                }}
              >
                {t('settings.addTestEntrants')}
              </Button>
            </div>
            <p className="field-hint">{t('settings.testEntrantsHint')}</p>
          </div>
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
          {saving ? t('settings.saving') : t('settings.saveSettings')}
        </Button>
      </div>
    </div>
  );
}
