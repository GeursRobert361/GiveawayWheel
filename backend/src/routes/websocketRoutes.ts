import type { FastifyInstance } from "fastify";
import { getSessionUserId } from "../lib/auth";
import { SyncService } from "../services/syncService";
import { parseWithSchema } from "./helpers";
import { websocketQuerySchema } from "./schemas";

export async function registerWebsocketRoutes(app: FastifyInstance, syncService: SyncService) {
  app.get("/ws", { websocket: true }, async (connection, request) => {
    try {
      const query = parseWithSchema(websocketQuerySchema, request.query);

      if (query.overlayKey) {
        await syncService.sendOverlaySnapshot(query.overlayKey, connection);
        return;
      }

      const userId = getSessionUserId(request);
      if (!userId) {
        connection.close(4401, "Unauthorized");
        return;
      }

      await syncService.sendDashboardSnapshot(userId, connection);
    } catch (error) {
      connection.send(
        JSON.stringify({
          type: "error",
          message: error instanceof Error ? error.message : "WebSocket setup failed"
        })
      );
      connection.close(1011, "Setup failed");
    }
  });
}
