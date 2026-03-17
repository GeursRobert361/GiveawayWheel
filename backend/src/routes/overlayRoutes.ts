import type { FastifyInstance } from "fastify";
import { SnapshotService } from "../services/snapshotService";
import { parseWithSchema, requireUserId } from "./helpers";
import { overlayParamSchema } from "./schemas";

export async function registerOverlayRoutes(app: FastifyInstance, snapshotService: SnapshotService) {
  app.get("/api/overlay/current", async (request) => {
    const userId = await requireUserId(request);
    const dashboard = await snapshotService.getDashboardSnapshot(userId);
    if (!dashboard.giveaway) {
      return null;
    }

    return {
      overlayUrl: dashboard.overlayUrl,
      overlayKey: dashboard.giveaway.overlayKey,
      snapshot: await snapshotService.getOverlaySnapshotByKey(dashboard.giveaway.overlayKey)
    };
  });

  app.get("/api/overlay/:overlayKey/current", async (request) => {
    const { overlayKey } = parseWithSchema(overlayParamSchema, request.params);
    return snapshotService.getOverlaySnapshotByKey(overlayKey);
  });
}
