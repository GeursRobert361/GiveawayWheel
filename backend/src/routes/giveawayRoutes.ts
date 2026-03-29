import type { FastifyInstance } from "fastify";
import { GiveawayService } from "../services/giveaway/giveawayService";
import { SnapshotService } from "../services/snapshotService";
import { parseWithSchema, requireUserId } from "./helpers";
import { createSessionSchema } from "./schemas";

interface GiveawayRoutesOptions {
  giveawayService: GiveawayService;
  snapshotService: SnapshotService;
}

export async function registerGiveawayRoutes(app: FastifyInstance, options: GiveawayRoutesOptions) {
  app.get("/api/giveaway/current", async (request) => {
    const userId = await requireUserId(request);
    const snapshot = await options.snapshotService.getDashboardSnapshot(userId);
    return snapshot.giveaway;
  });

  app.post("/api/giveaway/create", { config: { rateLimit: { max: 12, timeWindow: 60_000 } } }, async (request) => {
    const userId = await requireUserId(request);
    const input = parseWithSchema(createSessionSchema, request.body);
    await options.giveawayService.createSession(userId, input, {
      type: "DASHBOARD",
      login: "dashboard"
    });
    const snapshot = await options.snapshotService.getDashboardSnapshot(userId);
    return snapshot.giveaway;
  });

  app.post("/api/giveaway/reset", { config: { rateLimit: { max: 12, timeWindow: 60_000 } } }, async (request) => {
    const userId = await requireUserId(request);
    await options.giveawayService.createSession(userId, undefined, {
      type: "DASHBOARD",
      login: "dashboard"
    });
    const snapshot = await options.snapshotService.getDashboardSnapshot(userId);
    return snapshot.giveaway;
  });

  app.post("/api/giveaway/open", { config: { rateLimit: { max: 20, timeWindow: 60_000 } } }, async (request) => {
    const userId = await requireUserId(request);
    await options.giveawayService.openCurrent(userId, { type: "DASHBOARD", login: "dashboard" });
    return options.snapshotService.getDashboardSnapshot(userId);
  });

  app.post("/api/giveaway/close", { config: { rateLimit: { max: 20, timeWindow: 60_000 } } }, async (request) => {
    const userId = await requireUserId(request);
    await options.giveawayService.closeCurrent(userId, { type: "DASHBOARD", login: "dashboard" });
    return options.snapshotService.getDashboardSnapshot(userId);
  });

  app.post("/api/giveaway/spin", { config: { rateLimit: { max: 10, timeWindow: 60_000 } } }, async (request) => {
    const userId = await requireUserId(request);
    const spin = await options.giveawayService.spin(userId, { type: "DASHBOARD", login: "dashboard" }, "draw");
    return { spin };
  });

  app.post("/api/giveaway/reroll", { config: { rateLimit: { max: 10, timeWindow: 60_000 } } }, async (request) => {
    const userId = await requireUserId(request);
    const spin = await options.giveawayService.spin(
      userId,
      { type: "DASHBOARD", login: "dashboard" },
      "reroll"
    );
    return { spin };
  });

  app.post("/api/giveaway/toggle-overlay", { config: { rateLimit: { max: 20, timeWindow: 60_000 } } }, async (request) => {
    const userId = await requireUserId(request);
    await options.giveawayService.toggleOverlayVisibility(userId);
    return options.snapshotService.getDashboardSnapshot(userId);
  });

  app.post("/api/giveaway/clear", { config: { rateLimit: { max: 12, timeWindow: 60_000 } } }, async (request) => {
    const userId = await requireUserId(request);
    await options.giveawayService.clearCurrent(userId, { type: "DASHBOARD", login: "dashboard" });
    return options.snapshotService.getDashboardSnapshot(userId);
  });
}
