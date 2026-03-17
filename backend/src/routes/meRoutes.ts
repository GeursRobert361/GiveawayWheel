import type { FastifyInstance } from "fastify";
import { requireUserId } from "./helpers";
import { SnapshotService } from "../services/snapshotService";

export async function registerMeRoutes(app: FastifyInstance, snapshotService: SnapshotService) {
  app.get("/api/me", async (request) => {
    const userId = await requireUserId(request);
    const snapshot = await snapshotService.getDashboardSnapshot(userId);
    return {
      broadcaster: snapshot.broadcaster,
      twitch: snapshot.twitch,
      overlayUrl: snapshot.overlayUrl
    };
  });
}
