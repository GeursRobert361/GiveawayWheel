import type { FastifyInstance } from "fastify";
import { requireUserId } from "./helpers";
import { SnapshotService } from "../services/snapshotService";
import { prisma } from "../db/prisma";

export async function registerMeRoutes(app: FastifyInstance, snapshotService: SnapshotService) {
  app.get("/api/me", async (request) => {
    const userId = await requireUserId(request);
    const snapshot = await snapshotService.getDashboardSnapshot(userId);
    return {
      broadcaster: snapshot.broadcaster,
      twitch: snapshot.twitch,
      overlayUrl: snapshot.overlayUrl,
      hasCompletedSetup: snapshot.broadcaster.hasCompletedSetup
    };
  });

  app.post("/api/me/complete-setup", async (request) => {
    const userId = await requireUserId(request);
    await prisma.user.update({
      where: { id: userId },
      data: { hasCompletedSetup: true }
    });
    return { success: true };
  });
}
