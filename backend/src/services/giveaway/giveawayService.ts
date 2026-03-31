import type {
  AuditActorType,
  GiveawaySession,
  Prisma,
  RoleWeightSettings,
  UserWeightOverride
} from "@prisma/client";
import type { FastifyBaseLogger } from "fastify";
import { prisma } from "../../db/prisma";
import { AppError } from "../../lib/errors";
import { secureRandomFraction } from "../../lib/random";
import {
  getPrimaryCommandToken,
  normalizeCommand,
  normalizeUsername,
  sanitizeDisplayName,
  sanitizeTitle
} from "../../lib/sanitize";
import type { LastSpinPayload } from "../../types/snapshot";
import { SyncService } from "../syncService";
import type { ChatMessageEvent, ViewerRoleResult } from "../twitch/twitchService";
import { TwitchService } from "../twitch/twitchService";
import { buildWeightedPreview, resolveEntrantWeight } from "./weighting";

type DbClient = typeof prisma | Prisma.TransactionClient;

export interface ActionActor {
  type: AuditActorType;
  login: string;
}

export interface SessionSettingsInput {
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
  weights: {
    viewerWeight: number;
    followerWeight: number;
    subscriberWeight: number;
    vipWeight: number;
    moderatorWeight: number;
    broadcasterWeight: number;
  };
  overrides: Array<{
    username: string;
    weight: number;
    isBlocked: boolean;
    notes?: string | null;
  }>;
}

const defaultActor: ActionActor = {
  type: "SYSTEM",
  login: "system"
};

export class GiveawayService {
  constructor(
    private readonly twitchService: TwitchService,
    private readonly syncService: SyncService,
    private readonly logger: FastifyBaseLogger
  ) {}

  async ensureCurrentSession(userId: string) {
    const existing = await prisma.giveawaySession.findFirst({
      where: { broadcasterId: userId },
      orderBy: { createdAt: "desc" }
    });

    if (existing) {
      return existing;
    }

    return prisma.giveawaySession.create({
      data: {
        broadcasterId: userId,
        title: "Community Giveaway",
        entryCommand: "!ticket",
        leaveCommand: "!leave",
        spinCountdownSeconds: 3
      }
    });
  }

  async createSession(
    userId: string,
    input: Partial<SessionSettingsInput> | undefined,
    actor: ActionActor = defaultActor
  ) {
    const previous = await this.ensureCurrentSession(userId);
    const created = await prisma.giveawaySession.create({
      data: {
        broadcasterId: userId,
        title: sanitizeTitle(input?.title ?? previous.title) || previous.title,
        entryCommand: normalizeCommand(input?.entryCommand ?? previous.entryCommand, "!ticket"),
        leaveCommand: normalizeCommand(input?.leaveCommand ?? previous.leaveCommand, "!leave"),
        status: "CLOSED",
        removeWinnerAfterDraw: input?.removeWinnerAfterDraw ?? previous.removeWinnerAfterDraw,
        allowDuplicateEntries: input?.allowDuplicateEntries ?? previous.allowDuplicateEntries,
        maxEntriesPerUser: this.clampInt(input?.maxEntriesPerUser ?? previous.maxEntriesPerUser, 1, 100),
        followerOnlyMode: input?.followerOnlyMode ?? previous.followerOnlyMode,
        subscriberOnlyMode: input?.subscriberOnlyMode ?? previous.subscriberOnlyMode,
        announceWinnerInChat: input?.announceWinnerInChat ?? previous.announceWinnerInChat,
        excludeBroadcaster: input?.excludeBroadcaster ?? previous.excludeBroadcaster,
        minimumAccountAgeDays: this.clampInt(
          input?.minimumAccountAgeDays ?? previous.minimumAccountAgeDays,
          0,
          3650
        ),
        spinCountdownSeconds: this.clampInt(
          input?.spinCountdownSeconds ?? previous.spinCountdownSeconds,
          0,
          15
        )
      }
    });

    await this.recordAudit(
      userId,
      actor,
      "giveaway.create",
      `Created giveaway session "${created.title}".`
    );
    await this.syncService.broadcastForUser(userId);
    return created;
  }

  async updateSettings(userId: string, input: SessionSettingsInput, actor: ActionActor = defaultActor) {
    const current = await this.ensureCurrentSession(userId);
    const overrides = input.overrides
      .map((override) => {
        const username = normalizeUsername(override.username);
        if (!username) {
          return null;
        }

        return {
          usernameLower: username,
          usernameDisplay: override.username.trim(),
          weight: Math.max(Number(override.weight) || 0, 0),
          isBlocked: Boolean(override.isBlocked),
          notes: override.notes?.trim() || null
        };
      })
      .filter((override): override is NonNullable<typeof override> => override !== null);

    await prisma.$transaction(async (tx) => {
      await tx.giveawaySession.update({
        where: { id: current.id },
        data: {
          title: sanitizeTitle(input.title) || current.title,
          entryCommand: normalizeCommand(input.entryCommand, "!ticket"),
          leaveCommand: normalizeCommand(input.leaveCommand, "!leave"),
          removeWinnerAfterDraw: input.removeWinnerAfterDraw,
          allowDuplicateEntries: input.allowDuplicateEntries,
          maxEntriesPerUser: this.clampInt(input.maxEntriesPerUser, 1, 100),
          followerOnlyMode: input.followerOnlyMode,
          subscriberOnlyMode: input.subscriberOnlyMode,
          announceWinnerInChat: input.announceWinnerInChat,
          excludeBroadcaster: input.excludeBroadcaster,
          minimumAccountAgeDays: this.clampInt(input.minimumAccountAgeDays, 0, 3650),
          spinCountdownSeconds: this.clampInt(input.spinCountdownSeconds, 0, 15)
        }
      });

      await tx.roleWeightSettings.upsert({
        where: { broadcasterId: userId },
        update: {
          viewerWeight: Math.max(input.weights.viewerWeight, 0),
          followerWeight: Math.max(input.weights.followerWeight, 0),
          subscriberWeight: Math.max(input.weights.subscriberWeight, 0),
          vipWeight: Math.max(input.weights.vipWeight, 0),
          moderatorWeight: Math.max(input.weights.moderatorWeight, 0),
          broadcasterWeight: Math.max(input.weights.broadcasterWeight, 0)
        },
        create: {
          broadcasterId: userId,
          viewerWeight: Math.max(input.weights.viewerWeight, 0),
          followerWeight: Math.max(input.weights.followerWeight, 0),
          subscriberWeight: Math.max(input.weights.subscriberWeight, 0),
          vipWeight: Math.max(input.weights.vipWeight, 0),
          moderatorWeight: Math.max(input.weights.moderatorWeight, 0),
          broadcasterWeight: Math.max(input.weights.broadcasterWeight, 0)
        }
      });

      await tx.userWeightOverride.deleteMany({
        where: { broadcasterId: userId }
      });

      if (overrides.length > 0) {
        await tx.userWeightOverride.createMany({
          data: overrides.map((override) => ({
            broadcasterId: userId,
            usernameLower: override.usernameLower,
            usernameDisplay: override.usernameDisplay,
            weight: override.weight,
            isBlocked: override.isBlocked,
            notes: override.notes
          }))
        });
      }

      await this.recordAudit(
        userId,
        actor,
        "settings.update",
        "Updated giveaway settings and weight configuration.",
        undefined,
        tx
      );
    });

    await this.syncService.broadcastForUser(userId);
  }

  async openCurrent(userId: string, actor: ActionActor = defaultActor) {
    const session = await this.ensureCurrentSession(userId);
    await prisma.giveawaySession.update({
      where: { id: session.id },
      data: {
        status: "OPEN"
      }
    });
    await this.recordAudit(userId, actor, "giveaway.open", `Opened giveaway "${session.title}".`);
    await this.safeChatAnnounce(
      userId,
      `Giveaway is now open. Type ${session.entryCommand} to enter ${session.title}.`
    );
    await this.syncService.broadcastForUser(userId);
  }

  async closeCurrent(userId: string, actor: ActionActor = defaultActor) {
    const session = await this.ensureCurrentSession(userId);
    await prisma.giveawaySession.update({
      where: { id: session.id },
      data: {
        status: "CLOSED"
      }
    });
    await this.recordAudit(userId, actor, "giveaway.close", `Closed giveaway "${session.title}".`);
    await this.safeChatAnnounce(userId, `Giveaway "${session.title}" is now closed.`);
    await this.syncService.broadcastForUser(userId);
  }

  async clearCurrent(userId: string, actor: ActionActor = defaultActor) {
    const session = await this.ensureCurrentSession(userId);
    await prisma.entrant.updateMany({
      where: {
        giveawaySessionId: session.id,
        isActive: true
      },
      data: {
        isActive: false,
        removedReason: "CLEAR"
      }
    });
    await this.recordAudit(userId, actor, "giveaway.clear", `Cleared entrants for "${session.title}".`);
    await this.safeChatAnnounce(userId, `All entrants were cleared for ${session.title}.`);
    await this.syncService.broadcastForUser(userId);
  }

  async toggleOverlayVisibility(userId: string) {
    const session = await this.ensureCurrentSession(userId);
    await prisma.giveawaySession.update({
      where: { id: session.id },
      data: { overlayVisible: !session.overlayVisible }
    });
    await this.syncService.broadcastForUser(userId);
  }

  async dismissWinner(userId: string) {
    const session = await this.ensureCurrentSession(userId);
    await prisma.giveawaySession.update({
      where: { id: session.id },
      data: { lastSpinPayloadJson: null }
    });
    await this.syncService.broadcastForUser(userId);
  }

  async shuffleEntrants(userId: string, actor: ActionActor = defaultActor) {
    const session = await this.ensureCurrentSession(userId);
    const entrants = await prisma.entrant.findMany({
      where: {
        giveawaySessionId: session.id,
        isActive: true
      },
      orderBy: [{ createdAt: "asc" }, { username: "asc" }]
    });

    if (entrants.length === 0) return;

    // Shuffle using Fisher-Yates algorithm
    const shuffled = [...entrants];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(secureRandomFraction() * (i + 1));
      const temp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }

    // Update createdAt to change order (entrants are sorted by createdAt, username)
    // Sequential updates to ensure proper ordering without race conditions
    const baseTime = Date.now();
    for (let index = 0; index < shuffled.length; index++) {
      await prisma.entrant.update({
        where: { id: shuffled[index]!.id },
        data: { createdAt: new Date(baseTime + index * 2000) }
      });
    }

    await this.recordAudit(userId, actor, "giveaway.shuffle", `Shuffled ${entrants.length} entrants.`);
    await this.syncService.broadcastForUser(userId);
  }

  async addTestEntrants(userId: string, count: number, actor: ActionActor = defaultActor) {
    const session = await this.ensureCurrentSession(userId);
    const adjectives = ["Swift", "Brave", "Mighty", "Silent", "Golden", "Shadow", "Thunder", "Crystal", "Fire", "Ice"];
    const nouns = ["Wolf", "Dragon", "Phoenix", "Tiger", "Falcon", "Bear", "Lion", "Eagle", "Fox", "Hawk"];

    const testEntrants = [];
    const timestamp = Date.now();
    for (let i = 0; i < count; i++) {
      const adj = adjectives[Math.floor(secureRandomFraction() * adjectives.length)];
      const noun = nouns[Math.floor(secureRandomFraction() * nouns.length)];
      const num = Math.floor(secureRandomFraction() * 9999);
      const uniqueSuffix = `${timestamp}_${i}`;
      const username = `${adj}${noun}${num}_${uniqueSuffix}`.toLowerCase();
      const displayName = `${adj}${noun}${num}`;

      testEntrants.push({
        giveawaySessionId: session.id,
        twitchUserId: `test_${username}`,
        username,
        displayName,
        isFollower: secureRandomFraction() > 0.5,
        isSubscriber: secureRandomFraction() > 0.7,
        isVip: secureRandomFraction() > 0.9,
        isModerator: false,
        isBroadcaster: false,
        accountCreatedAt: new Date(Date.now() - Math.floor(secureRandomFraction() * 365 * 24 * 60 * 60 * 1000)),
        isActive: true
      });
    }

    await prisma.entrant.createMany({ data: testEntrants });
    await this.recordAudit(userId, actor, "giveaway.test", `Added ${count} test entrants.`);
    await this.syncService.broadcastForUser(userId);
  }

  async addManualEntrant(
    userId: string,
    input: { username: string; displayName?: string | null },
    actor: ActionActor = { type: "DASHBOARD", login: "dashboard" }
  ) {
    const session = await this.ensureCurrentSession(userId);
    const normalized = normalizeUsername(input.username);

    if (!normalized) {
      throw new AppError(400, "Invalid Twitch username", "INVALID_USERNAME");
    }

    const lookup = await this.twitchService.lookupUserByLogin(userId, normalized).catch(() => null);
    const roles = lookup
      ? await this.twitchService.getViewerRoles(userId, {
          viewerId: lookup.id,
          login: lookup.login,
          displayName: lookup.display_name
        })
      : {
          twitchUserId: null,
          username: normalized,
          displayName: sanitizeDisplayName(input.displayName ?? normalized),
          isFollower: false,
          isSubscriber: false,
          isVip: false,
          isModerator: false,
          isBroadcaster: false,
          accountCreatedAt: null
        };

    const result = await this.addOrIncrementEntrant(userId, session, roles);

    if (!result.changed) {
      throw new AppError(
        400,
        result.reason ?? "Entrant already exists or reached the entry limit",
        "ENTRANT_EXISTS"
      );
    }

    await this.recordAudit(
      userId,
      actor,
      "entrant.add",
      `Added @${roles.username} to "${session.title}".`
    );
    await this.syncService.broadcastForUser(userId);
  }

  async removeEntrant(
    userId: string,
    username: string,
    options: { mode?: "single" | "all" } = {},
    actor: ActionActor = { type: "DASHBOARD", login: "dashboard" }
  ) {
    const session = await this.ensureCurrentSession(userId);
    const normalized = normalizeUsername(username);

    if (!normalized) {
      throw new AppError(400, "Invalid Twitch username", "INVALID_USERNAME");
    }

    const entrant = await prisma.entrant.findUnique({
      where: {
        giveawaySessionId_username: {
          giveawaySessionId: session.id,
          username: normalized
        }
      }
    });

    if (!entrant || !entrant.isActive) {
      return;
    }

    const removeSingleEntry = options.mode === "single" && session.allowDuplicateEntries && entrant.entryCount > 1;

    if (removeSingleEntry) {
      await prisma.entrant.update({
        where: { id: entrant.id },
        data: {
          entryCount: entrant.entryCount - 1,
          lastSeenAt: new Date()
        }
      });
    } else {
      await prisma.entrant.update({
        where: { id: entrant.id },
        data: {
          isActive: false,
          removedReason: "MANUAL"
        }
      });
    }

    await this.recordAudit(
      userId,
      actor,
      removeSingleEntry ? "entrant.remove_single_entry" : "entrant.remove",
      removeSingleEntry
        ? `Removed one entry for @${normalized} from "${session.title}".`
        : `Removed @${normalized} from "${session.title}".`
    );
    await this.syncService.broadcastForUser(userId);
  }

  async importChatters(
    userId: string,
    actor: ActionActor = { type: "DASHBOARD", login: "dashboard" }
  ) {
    const session = await this.ensureCurrentSession(userId);
    const chatters = await this.twitchService.getChatters(userId);
    let imported = 0;

    for (const chatter of chatters) {
      try {
        const roles = await this.twitchService.getViewerRoles(userId, {
          viewerId: chatter.userId,
          login: chatter.login,
          displayName: chatter.displayName
        });
        const result = await this.addOrIncrementEntrant(userId, session, roles);
        if (result.changed) {
          imported += 1;
        }
      } catch (error) {
        this.logger.warn({ error, chatter }, "Skipping chatter import");
      }
    }

    await this.recordAudit(
      userId,
      actor,
      "entrant.import_chatters",
      `Imported ${imported} chatters into "${session.title}".`
    );
    await this.syncService.broadcastForUser(userId);
    return { imported };
  }

  async handleChatMessage(userId: string, event: ChatMessageEvent) {
    const session = await this.ensureCurrentSession(userId);
    const command = getPrimaryCommandToken(event.message.text);

    if (!command) {
      return;
    }

    const actor: ActionActor = {
      type: "CHAT",
      login: normalizeUsername(event.chatter_user_login) ?? event.chatter_user_login.toLowerCase()
    };
    const isPrivileged =
      event.chatter_user_id === event.broadcaster_user_id ||
      (event.badges?.some((badge) => badge.set_id === "moderator" || badge.set_id === "broadcaster") ??
        false);

    if (isPrivileged) {
      switch (command) {
        case "!gopen":
          await this.openCurrent(userId, actor);
          return;
        case "!gclose":
          await this.closeCurrent(userId, actor);
          return;
        case "!gspin":
          await this.spin(userId, actor, "draw");
          return;
        case "!greroll":
          await this.spin(userId, actor, "reroll");
          return;
        case "!gclear":
          await this.clearCurrent(userId, actor);
          return;
        case "!gstatus": {
          const entrantCount = await prisma.entrant.count({
            where: {
              giveawaySessionId: session.id,
              isActive: true
            }
          });
          await this.recordAudit(
            userId,
            actor,
            "giveaway.status",
            `Requested giveaway status in chat for "${session.title}".`
          );
          await this.safeChatAnnounce(
            userId,
            `${session.title}: ${session.status === "OPEN" ? "open" : "closed"}, ${entrantCount} entrants, join with ${session.entryCommand}.`
          );
          return;
        }
        default:
          break;
      }
    }

    if (command === session.entryCommand) {
      if (session.status !== "OPEN") {
        if (event.chatter_user_id === event.broadcaster_user_id) {
          await this.recordAudit(
            userId,
            actor,
            "entrant.chat_join_rejected",
            `Rejected @${actor.login} for "${session.title}" (Giveaway is closed).`
          );
          await this.safeChatAnnounce(
            userId,
            `Open the giveaway before testing ${session.entryCommand}. You can use the dashboard or !gopen.`
          );
          await this.syncService.broadcastForUser(userId);
        }
        return;
      }

      const roles = await this.twitchService.getViewerRoles(userId, {
        viewerId: event.chatter_user_id,
        login: event.chatter_user_login,
        displayName: event.chatter_user_name,
        badges: event.badges
      });

      const result = await this.addOrIncrementEntrant(userId, session, roles);

      if (result.changed) {
        await this.recordAudit(
          userId,
          actor,
          "entrant.chat_join",
          `@${roles.username} entered "${session.title}".`
        );
        await this.syncService.broadcastForUser(userId);
      } else if (result.reason) {
        await this.recordAudit(
          userId,
          actor,
          "entrant.chat_join_rejected",
          `Rejected @${roles.username} for "${session.title}" (${result.reason}).`
        );

        if (roles.isBroadcaster && result.reason === "Broadcaster entry is disabled in this giveaway.") {
          await this.safeChatAnnounce(
            userId,
            `Broadcaster entry is currently disabled. Turn off Exclude Broadcaster in settings if you want to test ${session.entryCommand} from your own account.`
          );
        }

        await this.syncService.broadcastForUser(userId);
      }

      return;
    }

    if (session.leaveCommand && command === session.leaveCommand) {
      const normalized = normalizeUsername(event.chatter_user_login);
      if (!normalized) {
        return;
      }

      const entrant = await prisma.entrant.findUnique({
        where: {
          giveawaySessionId_username: {
            giveawaySessionId: session.id,
            username: normalized
          }
        }
      });

      if (!entrant || !entrant.isActive) {
        return;
      }

      if (session.allowDuplicateEntries && entrant.entryCount > 1) {
        await prisma.entrant.update({
          where: { id: entrant.id },
          data: {
            entryCount: entrant.entryCount - 1,
            lastSeenAt: new Date()
          }
        });
      } else {
        await prisma.entrant.update({
          where: { id: entrant.id },
          data: {
            isActive: false,
            removedReason: "LEAVE"
          }
        });
      }

      await this.recordAudit(
        userId,
        actor,
        "entrant.chat_leave",
        `@${normalized} left "${session.title}".`
      );
      await this.syncService.broadcastForUser(userId);
    }
  }

  async spin(userId: string, actor: ActionActor = defaultActor, source: "draw" | "reroll" = "draw") {
    const session = await this.ensureCurrentSession(userId);
    const activeSpin = this.parseActiveSpin(session.lastSpinPayloadJson);

    if (activeSpin && new Date(activeSpin.completedAt).getTime() > Date.now()) {
      throw new AppError(409, "A spin is already in progress", "SPIN_IN_PROGRESS");
    }

    const [weights, overrides, entrants] = await Promise.all([
      this.getWeightSettings(userId),
      prisma.userWeightOverride.findMany({
        where: { broadcasterId: userId },
        orderBy: { usernameLower: "asc" }
      }),
      prisma.entrant.findMany({
        where: {
          giveawaySessionId: session.id,
          isActive: true
        },
        orderBy: [{ createdAt: "asc" }, { username: "asc" }]
      })
    ]);

    const preview = buildWeightedPreview(session, entrants, weights, overrides).filter(
      (entrant) => entrant.isEligible && entrant.effectiveWeight > 0
    );

    if (preview.length === 0) {
      throw new AppError(400, "No eligible entrants available to spin", "NO_ENTRANTS");
    }

    const totalWeight = preview.reduce((sum, entrant) => sum + entrant.effectiveWeight, 0);
    const targetValue = secureRandomFraction() * totalWeight;
    let cursor = 0;
    let winnerIndex = 0;

    for (let index = 0; index < preview.length; index += 1) {
      const previewEntry = preview[index];
      if (!previewEntry) {
        continue;
      }

      cursor += previewEntry.effectiveWeight;
      if (targetValue <= cursor) {
        winnerIndex = index;
        break;
      }
    }

    const winnerPreview = preview[winnerIndex];
    if (!winnerPreview) {
      throw new AppError(500, "Winner preview could not be determined", "WINNER_RESOLUTION");
    }

    const winnerEntrant = entrants.find((entrant) => entrant.id === winnerPreview.id);

    if (!winnerEntrant) {
      throw new AppError(500, "Winner resolution failed", "WINNER_RESOLUTION");
    }

    const segmentAngle = 360 / preview.length;
    const landingAngle = 360 - (winnerIndex * segmentAngle + segmentAngle / 2);
    const rotationTurns = 9 + Math.floor(secureRandomFraction() * 4);
    const rotationDegrees = rotationTurns * 360 + landingAngle;
    const durationMs = 12_000 + Math.floor(secureRandomFraction() * 3_500);
    const scheduledAt = new Date(Date.now() + session.spinCountdownSeconds * 1000);
    const completedAt = new Date(scheduledAt.getTime() + durationMs);

    const spinPayload: LastSpinPayload = {
      eventId: crypto.randomUUID(),
      winnerEntrantId: winnerEntrant.id,
      winnerUsername: winnerEntrant.username,
      winnerDisplayName: winnerEntrant.displayName,
      winnerChancePercent: winnerPreview.chancePercent,
      targetIndex: winnerIndex,
      entrantCount: preview.length,
      rotationDegrees,
      durationMs,
      countdownSeconds: session.spinCountdownSeconds,
      scheduledAt: scheduledAt.toISOString(),
      completedAt: completedAt.toISOString(),
      source
    };

    const winner = await prisma.$transaction(async (tx) => {
      const createdWinner = await tx.winner.create({
        data: {
          giveawaySessionId: session.id,
          entrantId: winnerEntrant.id,
          username: winnerEntrant.username,
          displayName: winnerEntrant.displayName,
          twitchUserId: winnerEntrant.twitchUserId,
          selectedWeight: winnerPreview.effectiveWeight,
          source
        }
      });

      await tx.giveawaySession.update({
        where: { id: session.id },
        data: {
          lastSpinPayloadJson: JSON.stringify(spinPayload),
          lastWinnerId: createdWinner.id,
          status: "CLOSED"
        }
      });

      await this.recordAudit(
        userId,
        actor,
        source === "reroll" ? "giveaway.reroll" : "giveaway.spin",
        `${source === "reroll" ? "Rerolled" : "Spun"} "${session.title}" and selected ${winnerEntrant.displayName}.`,
        { winner: winnerEntrant.username },
        tx
      );

      return createdWinner;
    });

    await this.syncService.broadcastForUser(userId);

    if (session.removeWinnerAfterDraw || session.announceWinnerInChat) {
      const delayMs = session.spinCountdownSeconds * 1000 + durationMs;
      this.schedulePostSpinWork(userId, session, winner, winnerEntrant.id, delayMs);
    }

    return spinPayload;
  }

  private async addOrIncrementEntrant(
    userId: string,
    session: GiveawaySession,
    roles: ViewerRoleResult
  ) {
    const [weights, override] = await Promise.all([
      this.getWeightSettings(userId),
      prisma.userWeightOverride.findUnique({
        where: {
          broadcasterId_usernameLower: {
            broadcasterId: userId,
            usernameLower: roles.username
          }
        }
      })
    ]);

    const weightResult = resolveEntrantWeight(
      session,
      {
        id: "preview",
        username: roles.username,
        displayName: roles.displayName,
        entryCount: 1,
        isFollower: roles.isFollower,
        isSubscriber: roles.isSubscriber,
        isVip: roles.isVip,
        isModerator: roles.isModerator,
        isBroadcaster: roles.isBroadcaster,
        accountCreatedAt: roles.accountCreatedAt,
        updatedAt: new Date()
      },
      weights,
      override
    );

    if (!weightResult.isEligible) {
      const reasonMap: Record<string, string> = {
        blocked: "This user is blocked by an override.",
        "excluded broadcaster": "Broadcaster entry is disabled in this giveaway.",
        "follower-only": "Follower-only mode is enabled.",
        "subscriber-only": "Subscriber-only mode is enabled.",
        "account age": "This account does not meet the minimum account age."
      };

      return {
        changed: false,
        reason: reasonMap[weightResult.roleLabel] ?? "This user is not eligible for the giveaway."
      };
    }

    const existing = await prisma.entrant.findUnique({
      where: {
        giveawaySessionId_username: {
          giveawaySessionId: session.id,
          username: roles.username
        }
      }
    });

    if (!existing) {
      await prisma.entrant.create({
        data: {
          giveawaySessionId: session.id,
          twitchUserId: roles.twitchUserId,
          username: roles.username,
          displayName: roles.displayName,
          entryCount: 1,
          isFollower: roles.isFollower,
          isSubscriber: roles.isSubscriber,
          isVip: roles.isVip,
          isModerator: roles.isModerator,
          isBroadcaster: roles.isBroadcaster,
          accountCreatedAt: roles.accountCreatedAt,
          isActive: true,
          removedReason: null,
          lastSeenAt: new Date()
        }
      });
      return { changed: true };
    }

    if (existing.isActive && !session.allowDuplicateEntries) {
      return {
        changed: false,
        reason: "Duplicate entries are disabled."
      };
    }

    if (existing.isActive && session.allowDuplicateEntries && existing.entryCount >= session.maxEntriesPerUser) {
      return {
        changed: false,
        reason: "This user already reached the maximum number of entries."
      };
    }

    await prisma.entrant.update({
      where: { id: existing.id },
      data: {
        twitchUserId: roles.twitchUserId,
        displayName: roles.displayName,
        entryCount:
          existing.isActive && session.allowDuplicateEntries
            ? existing.entryCount + 1
            : 1,
        isFollower: roles.isFollower,
        isSubscriber: roles.isSubscriber,
        isVip: roles.isVip,
        isModerator: roles.isModerator,
        isBroadcaster: roles.isBroadcaster,
        accountCreatedAt: roles.accountCreatedAt,
        isActive: true,
        removedReason: null,
        lastSeenAt: new Date()
      }
    });

    return { changed: true, reason: null };
  }

  private async getWeightSettings(userId: string): Promise<RoleWeightSettings | null> {
    return prisma.roleWeightSettings.findUnique({
      where: { broadcasterId: userId }
    });
  }

  private schedulePostSpinWork(
    userId: string,
    session: GiveawaySession,
    winner: { id: string; displayName: string },
    winnerEntrantId: string,
    delayMs: number
  ) {
    setTimeout(() => {
      void (async () => {
        let shouldBroadcast = false;

        if (session.removeWinnerAfterDraw) {
          await prisma.entrant.updateMany({
            where: {
              id: winnerEntrantId,
              giveawaySessionId: session.id,
              isActive: true
            },
            data: {
              isActive: false,
              removedReason: "WINNER_REMOVED"
            }
          });
          shouldBroadcast = true;
        }

        if (session.announceWinnerInChat) {
          await this.safeChatAnnounce(
            userId,
            `Winner: ${winner.displayName}! Congratulations on winning ${session.title}.`
          );

          await prisma.winner.update({
            where: { id: winner.id },
            data: { announcedInChat: true }
          });
          shouldBroadcast = true;
        }

        if (shouldBroadcast) {
          await this.syncService.broadcastForUser(userId);
        }
      })().catch((error) => {
        this.logger.warn({ error, userId, winnerId: winner.id }, "Failed to finalize post-spin work");
      });
    }, delayMs);
  }

  private clampInt(value: number, min: number, max: number) {
    return Math.min(Math.max(Math.round(Number(value) || min), min), max);
  }

  private parseActiveSpin(value: string | null) {
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as LastSpinPayload;
    } catch {
      return null;
    }
  }

  private async safeChatAnnounce(userId: string, message: string) {
    try {
      await this.twitchService.sendChatMessage(userId, message);
    } catch (error) {
      this.logger.warn({ error, message }, "Unable to announce message in Twitch chat");
    }
  }

  private async recordAudit(
    userId: string,
    actor: ActionActor,
    action: string,
    message: string,
    metadata?: Record<string, unknown>,
    db: DbClient = prisma
  ) {
    await db.auditLog.create({
      data: {
        broadcasterId: userId,
        actorType: actor.type,
        actorLogin: actor.login,
        action,
        message,
        metadataJson: metadata ? JSON.stringify(metadata) : null
      }
    });
  }
}
