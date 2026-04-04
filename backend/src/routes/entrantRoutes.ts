import type { FastifyInstance } from "fastify";
import { prisma } from "../db/prisma";
import { buildCsv } from "../lib/csv";
import { GiveawayService } from "../services/giveaway/giveawayService";
import { SnapshotService } from "../services/snapshotService";
import { parseWithSchema, requireUserId } from "./helpers";
import { entrantRemovalSchema, manualEntrantSchema } from "./schemas";

interface EntrantRoutesOptions {
  giveawayService: GiveawayService;
  snapshotService: SnapshotService;
}

export async function registerEntrantRoutes(app: FastifyInstance, options: EntrantRoutesOptions) {
  app.get("/api/entrants/list", async (request) => {
    const userId = await requireUserId(request);
    const snapshot = await options.snapshotService.getDashboardSnapshot(userId);
    return snapshot.giveaway?.entrants ?? [];
  });

  app.post("/api/entrants/add", { config: { rateLimit: { max: 30, timeWindow: 60_000 } } }, async (request) => {
    const userId = await requireUserId(request);
    const input = parseWithSchema(manualEntrantSchema, request.body);
    await options.giveawayService.addManualEntrant(userId, input);
    const snapshot = await options.snapshotService.getDashboardSnapshot(userId);
    return snapshot.giveaway?.entrants ?? [];
  });

  app.post("/api/entrants/remove", { config: { rateLimit: { max: 30, timeWindow: 60_000 } } }, async (request) => {
    const userId = await requireUserId(request);
    const input = parseWithSchema(entrantRemovalSchema, request.body);
    await options.giveawayService.removeEntrant(userId, input.username, { mode: input.mode });
    const snapshot = await options.snapshotService.getDashboardSnapshot(userId);
    return snapshot.giveaway?.entrants ?? [];
  });

  app.post("/api/entrants/clear", { config: { rateLimit: { max: 5, timeWindow: 60_000 } } }, async (request) => {
    const userId = await requireUserId(request);
    await options.giveawayService.clearCurrent(userId);
    const snapshot = await options.snapshotService.getDashboardSnapshot(userId);
    return snapshot.giveaway?.entrants ?? [];
  });

  app.post(
    "/api/entrants/import-chatters",
    { config: { rateLimit: { max: 5, timeWindow: 60_000 } } },
    async (request) => {
      const userId = await requireUserId(request);
      return options.giveawayService.importChatters(userId);
    }
  );

  app.get("/api/entrants/export", async (request, reply) => {
    const userId = await requireUserId(request);
    const session = await prisma.giveawaySession.findFirst({
      where: { broadcasterId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        entrants: {
          where: { isActive: true },
          orderBy: [{ createdAt: "asc" }, { username: "asc" }]
        }
      }
    });

    const csv = buildCsv(
      (session?.entrants ?? []).map((entrant) => ({
        username: entrant.username,
        displayName: entrant.displayName,
        entryCount: entrant.entryCount,
        isFollower: entrant.isFollower,
        isSubscriber: entrant.isSubscriber,
        isVip: entrant.isVip,
        isModerator: entrant.isModerator,
        isBroadcaster: entrant.isBroadcaster,
        createdAt: entrant.createdAt.toISOString()
      })),
      [
        "username",
        "displayName",
        "entryCount",
        "isFollower",
        "isSubscriber",
        "isVip",
        "isModerator",
        "isBroadcaster",
        "createdAt"
      ]
    );

    reply.header("Content-Type", "text/csv; charset=utf-8");
    reply.header("Content-Disposition", 'attachment; filename="entrants.csv"');
    return csv;
  });
}
