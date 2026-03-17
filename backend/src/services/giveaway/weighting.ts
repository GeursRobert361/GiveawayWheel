import type { Entrant, GiveawaySession, RoleWeightSettings, UserWeightOverride } from "@prisma/client";
import type { WeightedEntrantView, WeightSettingsView } from "../../types/snapshot";

type EntrantWithRoles = Pick<
  Entrant,
  | "id"
  | "username"
  | "displayName"
  | "entryCount"
  | "isFollower"
  | "isSubscriber"
  | "isVip"
  | "isModerator"
  | "isBroadcaster"
  | "accountCreatedAt"
  | "updatedAt"
>;

type SessionWeightContext = Pick<
  GiveawaySession,
  "followerOnlyMode" | "subscriberOnlyMode" | "excludeBroadcaster" | "minimumAccountAgeDays"
>;

export interface ResolvedWeight {
  multiplier: number;
  effectiveWeight: number;
  roleLabel: string;
  isEligible: boolean;
}

export function getDefaultWeightSettings(): WeightSettingsView {
  return {
    viewerWeight: 1,
    followerWeight: 1.25,
    subscriberWeight: 2,
    vipWeight: 2.5,
    moderatorWeight: 3,
    broadcasterWeight: 0
  };
}

export function resolveEntrantWeight(
  session: SessionWeightContext,
  entrant: EntrantWithRoles,
  weights: RoleWeightSettings | null,
  override: UserWeightOverride | null
): ResolvedWeight {
  const weightSettings = weights
    ? {
        viewerWeight: weights.viewerWeight,
        followerWeight: weights.followerWeight,
        subscriberWeight: weights.subscriberWeight,
        vipWeight: weights.vipWeight,
        moderatorWeight: weights.moderatorWeight,
        broadcasterWeight: weights.broadcasterWeight
      }
    : getDefaultWeightSettings();

  if (override?.isBlocked) {
    return { multiplier: 0, effectiveWeight: 0, roleLabel: "blocked", isEligible: false };
  }

  if (session.excludeBroadcaster && entrant.isBroadcaster) {
    return {
      multiplier: 0,
      effectiveWeight: 0,
      roleLabel: "excluded broadcaster",
      isEligible: false
    };
  }

  if (session.followerOnlyMode && !entrant.isFollower) {
    return { multiplier: 0, effectiveWeight: 0, roleLabel: "follower-only", isEligible: false };
  }

  if (session.subscriberOnlyMode && !entrant.isSubscriber) {
    return {
      multiplier: 0,
      effectiveWeight: 0,
      roleLabel: "subscriber-only",
      isEligible: false
    };
  }

  if (session.minimumAccountAgeDays > 0 && entrant.accountCreatedAt) {
    const ageMs = Date.now() - entrant.accountCreatedAt.getTime();
    const requiredMs = session.minimumAccountAgeDays * 24 * 60 * 60 * 1000;
    if (ageMs < requiredMs) {
      return { multiplier: 0, effectiveWeight: 0, roleLabel: "account age", isEligible: false };
    }
  }

  if (override) {
    const multiplier = Math.max(override.weight, 0);
    return {
      multiplier,
      effectiveWeight: multiplier * entrant.entryCount,
      roleLabel: "custom override",
      isEligible: multiplier > 0
    };
  }

  const candidates = [
    { label: "viewer", value: weightSettings.viewerWeight, enabled: true },
    { label: "follower", value: weightSettings.followerWeight, enabled: entrant.isFollower },
    { label: "subscriber", value: weightSettings.subscriberWeight, enabled: entrant.isSubscriber },
    { label: "vip", value: weightSettings.vipWeight, enabled: entrant.isVip },
    { label: "moderator", value: weightSettings.moderatorWeight, enabled: entrant.isModerator },
    { label: "broadcaster", value: weightSettings.broadcasterWeight, enabled: entrant.isBroadcaster }
  ].filter((candidate) => candidate.enabled);

  const selected = candidates.reduce((best, candidate) =>
    candidate.value >= best.value ? candidate : best
  );
  const multiplier = Math.max(selected.value, 0);

  return {
    multiplier,
    effectiveWeight: multiplier * entrant.entryCount,
    roleLabel: selected.label,
    isEligible: multiplier > 0
  };
}

export function buildWeightedPreview(
  session: SessionWeightContext,
  entrants: EntrantWithRoles[],
  weights: RoleWeightSettings | null,
  overrides: UserWeightOverride[]
) {
  const overrideMap = new Map(overrides.map((override) => [override.usernameLower, override]));
  const resolved = entrants.map((entrant) => ({
    entrant,
    result: resolveEntrantWeight(session, entrant, weights, overrideMap.get(entrant.username) ?? null)
  }));

  const totalEligibleWeight = resolved.reduce(
    (sum, item) => sum + (item.result.isEligible ? item.result.effectiveWeight : 0),
    0
  );

  return resolved.map<WeightedEntrantView>(({ entrant, result }) => ({
    id: entrant.id,
    username: entrant.username,
    displayName: entrant.displayName,
    entryCount: entrant.entryCount,
    effectiveWeight: Number(result.effectiveWeight.toFixed(4)),
    multiplier: Number(result.multiplier.toFixed(4)),
    roleLabel: result.roleLabel,
    chancePercent:
      totalEligibleWeight > 0 && result.isEligible
        ? Number(((result.effectiveWeight / totalEligibleWeight) * 100).toFixed(2))
        : 0,
    isEligible: result.isEligible,
    roleFlags: {
      follower: entrant.isFollower,
      subscriber: entrant.isSubscriber,
      vip: entrant.isVip,
      moderator: entrant.isModerator,
      broadcaster: entrant.isBroadcaster
    },
    accountCreatedAt: entrant.accountCreatedAt?.toISOString() ?? null,
    updatedAt: entrant.updatedAt.toISOString()
  }));
}
