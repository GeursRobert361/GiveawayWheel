import type { FastifyInstance } from "fastify";
import { SnapshotService } from "../services/snapshotService";
import { requireUserId } from "./helpers";

export async function registerTwitchRoutes(app: FastifyInstance, snapshotService: SnapshotService) {
  app.get("/api/twitch/status", async (request) => {
    const userId = await requireUserId(request);
    const snapshot = await snapshotService.getDashboardSnapshot(userId);
    return snapshot.twitch;
  });
}
