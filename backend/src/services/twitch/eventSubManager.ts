import type { FastifyBaseLogger } from "fastify";
import WebSocket from "ws";
import { prisma } from "../../db/prisma";
import { env } from "../../lib/env";
import { GiveawayService } from "../giveaway/giveawayService";
import { SyncService } from "../syncService";
import type { ChatMessageEvent } from "./twitchService";
import { TwitchService } from "./twitchService";

interface ManagedConnection {
  socket: WebSocket;
  reconnectAttempts: number;
  intentionalClose: boolean;
  reuseSubscriptions: boolean;
  pendingPreviousSocket?: WebSocket;
}

interface EventSubEnvelope {
  metadata?: {
    message_type?: string;
    subscription_type?: string;
  };
  payload?: {
    session?: {
      id?: string;
      reconnect_url?: string;
    };
    subscription?: {
      type?: string;
    };
    event?: ChatMessageEvent;
  };
}

export class EventSubManager {
  private readonly connections = new Map<string, ManagedConnection>();

  constructor(
    private readonly twitchService: TwitchService,
    private readonly giveawayService: GiveawayService,
    private readonly syncService: SyncService,
    private readonly logger: FastifyBaseLogger
  ) {}

  async bootstrap() {
    const connections = await prisma.twitchConnection.findMany({
      select: { userId: true }
    });

    await Promise.allSettled(connections.map((connection) => this.connectForUser(connection.userId)));
  }

  async connectForUser(
    userId: string,
    url = env.EVENTSUB_WS_URL,
    reuseSubscriptions = false,
    pendingPreviousSocket?: WebSocket
  ) {
    const current = this.connections.get(userId);
    if (current && current.socket.readyState === WebSocket.OPEN && !pendingPreviousSocket) {
      current.intentionalClose = true;
      current.socket.close();
    }

    await this.twitchService.updateConnectionStatus(userId, "RECONNECTING", {
      lastError: null
    });
    await this.syncService.broadcastForUser(userId).catch(() => undefined);

    const socket = new WebSocket(url);
    const connection: ManagedConnection = {
      socket,
      reconnectAttempts: pendingPreviousSocket ? current?.reconnectAttempts ?? 0 : 0,
      intentionalClose: false,
      reuseSubscriptions,
      pendingPreviousSocket
    };

    this.connections.set(userId, connection);

    socket.on("message", async (data) => {
      const currentConnection = this.connections.get(userId);
      if (currentConnection !== connection) {
        return;
      }

      try {
        await this.handleMessage(userId, connection, data.toString());
      } catch (error) {
        this.logger.error({ error, userId }, "Failed to handle EventSub message");
      }
    });

    socket.on("close", (code, reason) => {
      void this.handleClose(userId, connection, code, reason.toString());
    });

    socket.on("error", (error) => {
      this.logger.warn({ error, userId }, "EventSub socket error");
    });
  }

  async disconnectForUser(userId: string) {
    const connection = this.connections.get(userId);
    if (connection) {
      connection.intentionalClose = true;
      connection.socket.close();
      this.connections.delete(userId);
    }

    await this.twitchService.updateConnectionStatus(userId, "DISCONNECTED", {
      eventSubSessionId: null
    });
    await this.syncService.broadcastForUser(userId).catch(() => undefined);
  }

  async closeAll() {
    await Promise.allSettled([...this.connections.keys()].map((userId) => this.disconnectForUser(userId)));
  }

  private async handleMessage(userId: string, connection: ManagedConnection, rawMessage: string) {
    const envelope = JSON.parse(rawMessage) as EventSubEnvelope;
    const messageType = envelope.metadata?.message_type;

    if (messageType === "session_welcome") {
      const sessionId = envelope.payload?.session?.id ?? null;
      await this.twitchService.updateConnectionStatus(userId, "CONNECTED", {
        eventSubSessionId: sessionId,
        lastConnectedAt: new Date(),
        lastError: null
      });

      if (!connection.reuseSubscriptions && sessionId) {
        await this.twitchService.createChatSubscription(userId, sessionId);
      }

      connection.reconnectAttempts = 0;

      if (connection.pendingPreviousSocket) {
        connection.pendingPreviousSocket.close();
        connection.pendingPreviousSocket = undefined;
      }

      await this.syncService.broadcastForUser(userId);
      return;
    }

    if (messageType === "session_reconnect") {
      const reconnectUrl = envelope.payload?.session?.reconnect_url;
      if (reconnectUrl) {
        await this.connectForUser(userId, reconnectUrl, true, connection.socket);
      }
      return;
    }

    if (messageType === "revocation") {
      await this.twitchService.updateConnectionStatus(userId, "DISCONNECTED", {
        lastError: "EventSub subscription revoked"
      });
      await this.syncService.broadcastForUser(userId).catch(() => undefined);
      return;
    }

    const subscriptionType =
      envelope.payload?.subscription?.type ?? envelope.metadata?.subscription_type ?? null;

    if (messageType === "notification" && subscriptionType === "channel.chat.message" && envelope.payload?.event) {
      await this.giveawayService.handleChatMessage(userId, envelope.payload.event);
    }
  }

  private async handleClose(
    userId: string,
    connection: ManagedConnection,
    code: number,
    reason: string
  ) {
    const current = this.connections.get(userId);
    if (current !== connection) {
      return;
    }

    if (connection.intentionalClose) {
      return;
    }

    connection.reconnectAttempts += 1;
    const delayMs = Math.min(30_000, 1_000 * 2 ** Math.min(connection.reconnectAttempts, 4));

    await this.twitchService.updateConnectionStatus(userId, "RECONNECTING", {
      lastError: `EventSub socket closed (${code}${reason ? `: ${reason}` : ""})`
    });
    await this.syncService.broadcastForUser(userId).catch(() => undefined);

    setTimeout(() => {
      void this.connectForUser(userId).catch((error) => {
        this.logger.error({ error, userId }, "Failed to reconnect EventSub");
      });
    }, delayMs);
  }
}
