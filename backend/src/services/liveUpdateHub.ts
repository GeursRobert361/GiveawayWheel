import type { FastifyBaseLogger } from "fastify";
import type WebSocket from "ws";

function removeClient(set: Set<WebSocket>, client: WebSocket) {
  set.delete(client);
}

export class LiveUpdateHub {
  private readonly dashboardClients = new Map<string, Set<WebSocket>>();

  private readonly overlayClients = new Map<string, Set<WebSocket>>();

  constructor(private readonly logger: FastifyBaseLogger) {}

  registerDashboard(userId: string, client: WebSocket) {
    const set = this.dashboardClients.get(userId) ?? new Set<WebSocket>();
    set.add(client);
    this.dashboardClients.set(userId, set);
    this.bindCleanup(set, client);
  }

  registerOverlay(overlayKey: string, client: WebSocket) {
    const set = this.overlayClients.get(overlayKey) ?? new Set<WebSocket>();
    set.add(client);
    this.overlayClients.set(overlayKey, set);
    this.bindCleanup(set, client);
  }

  broadcastDashboard(userId: string, payload: unknown) {
    this.broadcastSet(this.dashboardClients.get(userId), payload);
  }

  broadcastOverlay(overlayKey: string, payload: unknown) {
    this.broadcastSet(this.overlayClients.get(overlayKey), payload);
  }

  private bindCleanup(set: Set<WebSocket>, client: WebSocket) {
    client.once("close", () => removeClient(set, client));
    client.once("error", (error) => {
      this.logger.warn({ error }, "WebSocket client error");
      removeClient(set, client);
    });
  }

  private broadcastSet(clients: Set<WebSocket> | undefined, payload: unknown) {
    if (!clients || clients.size === 0) {
      return;
    }

    const encoded = JSON.stringify(payload);

    for (const client of clients) {
      if (client.readyState !== client.OPEN) {
        clients.delete(client);
        continue;
      }

      client.send(encoded);
    }
  }
}
