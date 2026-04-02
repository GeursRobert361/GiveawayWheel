import type { ConnectionStatus, RoleWeightSettings } from "@prisma/client";
import { prisma } from "../db/prisma";
import { env } from "../lib/env";
import { AppError } from "../lib/errors";
import type {
  DashboardSnapshot,
  LastSpinPayload,
  OverlaySnapshot,
  WeightOverrideView
} from "../types/snapshot";
import { buildWeightedPreview } from "./giveaway/weighting";

function mapConnectionStatus(status: ConnectionStatus | undefined | null) {
  switch (status) {
    case "CONNECTED":
      return "connected" as const;
    case "RECONNECTING":
      return "reconnecting" as const;
    default:
      return "disconnected" as const;
  }
}

function parseLastSpin(value: string | null): LastSpinPayload | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as LastSpinPayload;
  } catch {
    return null;
  }
}

function mapWeightSettings(weights: RoleWeightSettings | null) {
  if (!weights) {
    return {
      viewerWeight: 1,
      followerWeight: 1,
      subscriberWeight: 1,
      vipWeight: 1,
      moderatorWeight: 1,
      broadcasterWeight: 0
    };
  }

  return {
    viewerWeight: weights.viewerWeight,
    followerWeight: weights.followerWeight,
    subscriberWeight: weights.subscriberWeight,
    vipWeight: weights.vipWeight,
    moderatorWeight: weights.moderatorWeight,
    broadcasterWeight: weights.broadcasterWeight
  };
}

function mapOverrides(
  overrides: Array<{
    id: string;
    usernameDisplay: string;
    weight: number;
    isBlocked: boolean;
    notes: string | null;
  }>
): WeightOverrideView[] {
  return overrides.map((override) => ({
    id: override.id,
    username: override.usernameDisplay,
    weight: override.weight,
    isBlocked: override.isBlocked,
    notes: override.notes
  }));
}

export class SnapshotService {
  async getDashboardSnapshot(userId: string): Promise<DashboardSnapshot> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        connection: true,
        roleWeightSettings: true,
        userWeightOverrides: {
          orderBy: { usernameLower: "asc" }
        }
      }
    });

    if (!user) {
      throw new AppError(401, "Authentication required", "UNAUTHORIZED");
    }

    const session = await prisma.giveawaySession.findFirst({
      where: { broadcasterId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        entrants: {
          where: { isActive: true },
          orderBy: [{ createdAt: "asc" }, { username: "asc" }]
        },
        winners: {
          orderBy: { createdAt: "desc" },
          take: 20
        }
      }
    });

    const recentActivity = await prisma.auditLog.findMany({
      where: { broadcasterId: userId },
      orderBy: { createdAt: "desc" },
      take: 30
    });

    const overlayUrl = session
      ? `${env.FRONTEND_URL.replace(/\/$/, "")}/overlay/${session.overlayKey}`
      : null;

    return {
      broadcaster: {
        id: user.id,
        login: user.login,
        displayName: user.displayName,
        profileImageUrl: user.profileImageUrl ?? null,
        channelId: user.connection?.channelId ?? null,
        channelLogin: user.connection?.channelLogin ?? null,
        channelName: user.connection?.channelName ?? null,
        hasCompletedSetup: user.hasCompletedSetup
      },
      twitch: {
        status: mapConnectionStatus(user.connection?.status),
        lastError: user.connection?.lastError ?? null,
        eventSubSessionId: user.connection?.eventSubSessionId ?? null,
        lastConnectedAt: user.connection?.lastConnectedAt?.toISOString() ?? null
      },
      giveaway: session
        ? {
            id: session.id,
            overlayKey: session.overlayKey,
            title: session.title,
            entryCommand: session.entryCommand,
            leaveCommand: session.leaveCommand,
            status: session.status,
            removeWinnerAfterDraw: session.removeWinnerAfterDraw,
            allowDuplicateEntries: session.allowDuplicateEntries,
            maxEntriesPerUser: session.maxEntriesPerUser,
            followerOnlyMode: session.followerOnlyMode,
            subscriberOnlyMode: session.subscriberOnlyMode,
            announceWinnerInChat: session.announceWinnerInChat,
            excludeBroadcaster: session.excludeBroadcaster,
            minimumAccountAgeDays: session.minimumAccountAgeDays,
            minimumFollowageDays: session.minimumFollowageDays,
            spinCountdownSeconds: session.spinCountdownSeconds,
            overlayVisible: session.overlayVisible,
            entrants: buildWeightedPreview(
              session,
              session.entrants,
              user.roleWeightSettings,
              user.userWeightOverrides
            ),
            entrantCount: session.entrants.length,
            winners: session.winners.map((winner) => ({
              id: winner.id,
              username: winner.username,
              displayName: winner.displayName,
              selectedWeight: winner.selectedWeight,
              source: winner.source,
              announcedInChat: winner.announcedInChat,
              createdAt: winner.createdAt.toISOString()
            })),
            recentActivity: recentActivity.map((entry) => ({
              id: entry.id,
              actorType: entry.actorType,
              actorLogin: entry.actorLogin,
              action: entry.action,
              message: entry.message,
              createdAt: entry.createdAt.toISOString()
            })),
            weightSettings: mapWeightSettings(user.roleWeightSettings),
            overrides: mapOverrides(user.userWeightOverrides),
            lastSpin: parseLastSpin(session.lastSpinPayloadJson),
            resetCount: session.resetCount,
            createdAt: session.createdAt.toISOString(),
            updatedAt: session.updatedAt.toISOString()
          }
        : null,
      overlayUrl,
      generatedAt: new Date().toISOString()
    };
  }

  async getOverlaySnapshotByKey(overlayKey: string): Promise<OverlaySnapshot> {
    const session = await prisma.giveawaySession.findUnique({
      where: { overlayKey },
      include: {
        broadcaster: {
          include: {
            roleWeightSettings: true,
            userWeightOverrides: {
              orderBy: { usernameLower: "asc" }
            }
          }
        },
        entrants: {
          where: { isActive: true },
          orderBy: [{ createdAt: "asc" }, { username: "asc" }]
        },
        winners: {
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    });

    if (!session) {
      throw new AppError(404, "Overlay not found", "NOT_FOUND");
    }

    const weightedEntrants = buildWeightedPreview(
      session,
      session.entrants,
      session.broadcaster.roleWeightSettings,
      session.broadcaster.userWeightOverrides
    );

    return {
      overlayKey: session.overlayKey,
      title: session.title,
      status: session.status,
      entryCommand: session.entryCommand,
      entrantCount: weightedEntrants.length,
      overlayVisible: session.overlayVisible,
      entrants: weightedEntrants.map((entrant) => ({
        id: entrant.id,
        displayName: entrant.displayName,
        chancePercent: entrant.chancePercent,
        effectiveWeight: entrant.effectiveWeight
      })),
      winners: session.winners.map((winner) => ({
        id: winner.id,
        username: winner.username,
        displayName: winner.displayName,
        selectedWeight: winner.selectedWeight,
        source: winner.source,
        announcedInChat: winner.announcedInChat,
        createdAt: winner.createdAt.toISOString()
      })),
      lastSpin: parseLastSpin(session.lastSpinPayloadJson),
      generatedAt: new Date().toISOString()
    };
  }

  async getOverlaySnapshotByUserId(userId: string) {
    const session = await prisma.giveawaySession.findFirst({
      where: { broadcasterId: userId },
      orderBy: { createdAt: "desc" },
      select: { overlayKey: true }
    });

    if (!session) {
      throw new AppError(404, "No giveaway session found", "NOT_FOUND");
    }

    return this.getOverlaySnapshotByKey(session.overlayKey);
  }

  async getHistory(userId: string) {
    const winners = await prisma.winner.findMany({
      where: {
        giveawaySession: {
          broadcasterId: userId
        }
      },
      include: {
        giveawaySession: {
          select: {
            title: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return winners.map((winner) => ({
      id: winner.id,
      username: winner.username,
      displayName: winner.displayName,
      selectedWeight: winner.selectedWeight,
      source: winner.source,
      announcedInChat: winner.announcedInChat,
      createdAt: winner.createdAt.toISOString(),
      sessionTitle: winner.giveawaySession.title
    }));
  }
}
