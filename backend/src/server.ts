import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyWebsocket from "@fastify/websocket";
import { ZodError } from "zod";
import { prisma } from "./db/prisma";
import { env } from "./lib/env";
import { AppError } from "./lib/errors";
import { registerAuthRoutes } from "./routes/authRoutes";
import { registerEntrantRoutes } from "./routes/entrantRoutes";
import { registerGiveawayRoutes } from "./routes/giveawayRoutes";
import { registerHistoryRoutes } from "./routes/historyRoutes";
import { registerMeRoutes } from "./routes/meRoutes";
import { registerOverlayRoutes } from "./routes/overlayRoutes";
import { registerSettingsRoutes } from "./routes/settingsRoutes";
import { registerTwitchRoutes } from "./routes/twitchRoutes";
import { registerWebsocketRoutes } from "./routes/websocketRoutes";
import { GiveawayService } from "./services/giveaway/giveawayService";
import { LiveUpdateHub } from "./services/liveUpdateHub";
import { SnapshotService } from "./services/snapshotService";
import { SyncService } from "./services/syncService";
import { EventSubManager } from "./services/twitch/eventSubManager";
import { TwitchService } from "./services/twitch/twitchService";

async function buildServer() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "development" ? "info" : "warn"
    }
  });

  await app.register(fastifyCookie, {
    secret: env.SESSION_SECRET
  });
  await app.register(fastifyCors, {
    origin: env.FRONTEND_URL,
    credentials: true
  });
  await app.register(fastifyRateLimit, {
    global: true,
    max: 120,
    timeWindow: 60_000
  });
  await app.register(fastifyWebsocket);

  const liveUpdateHub = new LiveUpdateHub(app.log);
  const snapshotService = new SnapshotService();
  const syncService = new SyncService(snapshotService, liveUpdateHub);
  const twitchService = new TwitchService(app.log);
  const giveawayService = new GiveawayService(twitchService, syncService, app.log);
  const eventSubManager = new EventSubManager(twitchService, giveawayService, syncService, app.log);

  app.get("/api/health", async () => ({ ok: true }));

  await registerAuthRoutes(app, { twitchService, eventSubManager });
  await registerMeRoutes(app, snapshotService);
  await registerGiveawayRoutes(app, { giveawayService, snapshotService });
  await registerEntrantRoutes(app, { giveawayService, snapshotService });
  await registerSettingsRoutes(app, { giveawayService, snapshotService });
  await registerHistoryRoutes(app, snapshotService);
  await registerOverlayRoutes(app, snapshotService);
  await registerTwitchRoutes(app, snapshotService);
  await registerWebsocketRoutes(app, syncService);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({ error: error.code, message: error.message });
      return;
    }

    if (error instanceof ZodError) {
      reply.status(400).send({ error: "VALIDATION", message: error.issues[0]?.message ?? "Invalid request" });
      return;
    }

    app.log.error({ error }, "Unhandled request error");
    reply.status(500).send({ error: "INTERNAL_SERVER_ERROR", message: "Something went wrong" });
  });

  app.addHook("onClose", async () => {
    await eventSubManager.closeAll().catch(() => undefined);
    await prisma.$disconnect();
  });

  return { app, eventSubManager };
}

async function start() {
  const { app, eventSubManager } = await buildServer();
  await app.listen({
    port: env.PORT,
    host: "0.0.0.0"
  });
  await eventSubManager.bootstrap();
}

void start().catch((error) => {
  console.error(error);
  process.exit(1);
});
