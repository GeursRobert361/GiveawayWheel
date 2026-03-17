import type { FastifyInstance } from "fastify";
import { GiveawayService } from "../services/giveaway/giveawayService";
import { SnapshotService } from "../services/snapshotService";
import { parseWithSchema, requireUserId } from "./helpers";
import { settingsUpdateSchema } from "./schemas";

interface SettingsRoutesOptions {
  giveawayService: GiveawayService;
  snapshotService: SnapshotService;
}

export async function registerSettingsRoutes(app: FastifyInstance, options: SettingsRoutesOptions) {
  app.get("/api/settings/get", async (request) => {
    const userId = await requireUserId(request);
    const snapshot = await options.snapshotService.getDashboardSnapshot(userId);
    return snapshot.giveaway;
  });

  app.post("/api/settings/update", { config: { rateLimit: { max: 20, timeWindow: 60_000 } } }, async (request) => {
    const userId = await requireUserId(request);
    const input = parseWithSchema(settingsUpdateSchema, request.body);
    await options.giveawayService.updateSettings(userId, input, {
      type: "DASHBOARD",
      login: "dashboard"
    });
    const snapshot = await options.snapshotService.getDashboardSnapshot(userId);
    return snapshot.giveaway;
  });
}
