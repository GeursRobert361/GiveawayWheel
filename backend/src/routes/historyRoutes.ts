import type { FastifyInstance } from "fastify";
import { buildCsv } from "../lib/csv";
import { SnapshotService } from "../services/snapshotService";
import { requireUserId } from "./helpers";

export async function registerHistoryRoutes(app: FastifyInstance, snapshotService: SnapshotService) {
  app.get("/api/history/list", async (request) => {
    const userId = await requireUserId(request);
    return snapshotService.getHistory(userId);
  });

  app.get("/api/history/export", async (request, reply) => {
    const userId = await requireUserId(request);
    const history = await snapshotService.getHistory(userId);
    const csv = buildCsv(history, [
      "sessionTitle",
      "displayName",
      "username",
      "selectedWeight",
      "source",
      "announcedInChat",
      "createdAt"
    ]);
    reply.header("Content-Type", "text/csv; charset=utf-8");
    reply.header("Content-Disposition", 'attachment; filename="winners.csv"');
    return csv;
  });
}
