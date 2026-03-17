import type { ConnectionStatus, TwitchConnection, User } from "@prisma/client";
import type { FastifyBaseLogger } from "fastify";
import { prisma } from "../../db/prisma";
import { decryptSecret, encryptSecret } from "../../lib/crypto";
import { env, twitchScopes } from "../../lib/env";
import { AppError } from "../../lib/errors";
import { normalizeUsername, sanitizeDisplayName } from "../../lib/sanitize";

const twitchAuthBaseUrl = "https://id.twitch.tv/oauth2";
const twitchHelixBaseUrl = "https://api.twitch.tv/helix";

interface TwitchTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope?: string[];
  token_type: string;
}

interface TwitchUsersResponse {
  data: Array<{
    id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type: string;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    email?: string;
    created_at?: string;
  }>;
}

interface TwitchListResponse<T> {
  data: T[];
  pagination?: {
    cursor?: string;
  };
  total?: number;
}

type StoredConnection = TwitchConnection & { user: User };

interface DecryptedConnection {
  record: StoredConnection;
  accessToken: string;
  refreshToken: string;
}

export interface ChatBadge {
  set_id: string;
  id: string;
  info?: string;
}

export interface ChatMessageEvent {
  broadcaster_user_id: string;
  chatter_user_id: string;
  chatter_user_login: string;
  chatter_user_name: string;
  message: {
    text: string;
  };
  badges?: ChatBadge[];
}

export interface ViewerLookup {
  viewerId?: string | null;
  login: string;
  displayName: string;
  badges?: ChatBadge[];
}

export interface ViewerRoleResult {
  twitchUserId: string | null;
  username: string;
  displayName: string;
  isFollower: boolean;
  isSubscriber: boolean;
  isVip: boolean;
  isModerator: boolean;
  isBroadcaster: boolean;
  accountCreatedAt: Date | null;
}

export interface TwitchChatter {
  userId: string;
  login: string;
  displayName: string;
}

function isConnectionStatus(value: ConnectionStatus | "CONNECTED" | "RECONNECTING" | "DISCONNECTED") {
  return value;
}

export class TwitchService {
  private readonly refreshInFlight = new Map<string, Promise<DecryptedConnection>>();

  private readonly roleCache = new Map<string, { expiresAt: number; value: ViewerRoleResult }>();

  constructor(private readonly logger: FastifyBaseLogger) {}

  getAuthorizationUrl(state: string) {
    const url = new URL(`${twitchAuthBaseUrl}/authorize`);
    url.searchParams.set("client_id", env.TWITCH_CLIENT_ID);
    url.searchParams.set("redirect_uri", env.TWITCH_REDIRECT_URI);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", twitchScopes.join(" "));
    url.searchParams.set("state", state);
    url.searchParams.set("force_verify", "true");
    return url.toString();
  }

  async handleOAuthCallback(code: string) {
    const tokenResponse = await this.fetchToken({
      grant_type: "authorization_code",
      code,
      redirect_uri: env.TWITCH_REDIRECT_URI
    });

    const profile = await this.fetchAuthenticatedUser(tokenResponse.access_token);

    const user = await prisma.$transaction(async (tx) => {
      const upsertedUser = await tx.user.upsert({
        where: { twitchUserId: profile.id },
        update: {
          login: profile.login,
          displayName: sanitizeDisplayName(profile.display_name),
          profileImageUrl: profile.profile_image_url || null,
          broadcasterType: profile.broadcaster_type || null,
          email: profile.email || null
        },
        create: {
          twitchUserId: profile.id,
          login: profile.login,
          displayName: sanitizeDisplayName(profile.display_name),
          profileImageUrl: profile.profile_image_url || null,
          broadcasterType: profile.broadcaster_type || null,
          email: profile.email || null
        }
      });

      await tx.twitchConnection.upsert({
        where: { userId: upsertedUser.id },
        update: {
          encryptedAccessToken: encryptSecret(tokenResponse.access_token),
          encryptedRefreshToken: encryptSecret(tokenResponse.refresh_token),
          tokenExpiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
          scopeText: (tokenResponse.scope ?? twitchScopes).join(" "),
          channelId: profile.id,
          channelLogin: profile.login,
          channelName: sanitizeDisplayName(profile.display_name),
          status: "RECONNECTING",
          lastError: null
        },
        create: {
          userId: upsertedUser.id,
          encryptedAccessToken: encryptSecret(tokenResponse.access_token),
          encryptedRefreshToken: encryptSecret(tokenResponse.refresh_token),
          tokenExpiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
          scopeText: (tokenResponse.scope ?? twitchScopes).join(" "),
          channelId: profile.id,
          channelLogin: profile.login,
          channelName: sanitizeDisplayName(profile.display_name),
          status: "RECONNECTING"
        }
      });

      await tx.roleWeightSettings.upsert({
        where: { broadcasterId: upsertedUser.id },
        update: {},
        create: {
          broadcasterId: upsertedUser.id
        }
      });

      const existingSession = await tx.giveawaySession.findFirst({
        where: { broadcasterId: upsertedUser.id },
        orderBy: { createdAt: "desc" },
        select: { id: true }
      });

      if (!existingSession) {
        await tx.giveawaySession.create({
          data: {
            broadcasterId: upsertedUser.id,
            title: `${sanitizeDisplayName(profile.display_name)} Giveaway`
          }
        });
      }

      return upsertedUser;
    });

    return user;
  }

  async deleteConnection(userId: string) {
    await prisma.twitchConnection.deleteMany({
      where: { userId }
    });
  }

  async updateConnectionStatus(
    userId: string,
    status: ConnectionStatus,
    options: {
      lastError?: string | null;
      eventSubSessionId?: string | null;
      lastConnectedAt?: Date | null;
    } = {}
  ) {
    await prisma.twitchConnection.updateMany({
      where: { userId },
      data: {
        status: isConnectionStatus(status),
        lastError: options.lastError ?? undefined,
        eventSubSessionId: options.eventSubSessionId ?? undefined,
        lastConnectedAt: options.lastConnectedAt ?? undefined
      }
    });
  }

  async helix<T>(userId: string, path: string, init: RequestInit = {}, retry = true): Promise<T> {
    const connection = await this.ensureValidConnection(userId);
    const response = await fetch(`${twitchHelixBaseUrl}${path}`, {
      ...init,
      headers: {
        "Client-Id": env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${connection.accessToken}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {})
      }
    });

    if (response.status === 401 && retry) {
      await this.refreshTokens(userId, connection);
      return this.helix<T>(userId, path, init, false);
    }

    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new AppError(response.status, payload?.message ?? "Twitch API request failed", "TWITCH_API");
    }

    return payload as T;
  }

  async fetchAuthenticatedUser(accessToken: string) {
    const response = await fetch(`${twitchHelixBaseUrl}/users`, {
      headers: {
        "Client-Id": env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`
      }
    });

    const payload = (await response.json()) as TwitchUsersResponse;

    if (!response.ok || payload.data.length === 0) {
      throw new AppError(502, "Failed to fetch Twitch user profile", "TWITCH_AUTH");
    }

    const profile = payload.data[0];
    if (!profile) {
      throw new AppError(502, "Failed to fetch Twitch user profile", "TWITCH_AUTH");
    }

    return profile;
  }

  async createChatSubscription(userId: string, sessionId: string) {
    const connection = await this.ensureValidConnection(userId);

    await this.helix(userId, "/eventsub/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        type: "channel.chat.message",
        version: "1",
        condition: {
          broadcaster_user_id: connection.record.channelId,
          user_id: connection.record.channelId
        },
        transport: {
          method: "websocket",
          session_id: sessionId
        }
      })
    });
  }

  async sendChatMessage(userId: string, message: string) {
    const connection = await this.ensureValidConnection(userId);

    await this.helix(userId, "/chat/messages", {
      method: "POST",
      body: JSON.stringify({
        broadcaster_id: connection.record.channelId,
        sender_id: connection.record.channelId,
        message
      })
    });
  }

  async getChatters(userId: string) {
    const connection = await this.ensureValidConnection(userId);
    const chatters: TwitchChatter[] = [];
    let cursor: string | undefined;

    do {
      const query = new URLSearchParams({
        broadcaster_id: connection.record.channelId,
        moderator_id: connection.record.channelId,
        first: "100"
      });

      if (cursor) {
        query.set("after", cursor);
      }

      const response = await this.helix<
        TwitchListResponse<{ user_id: string; user_login: string; user_name: string }>
      >(userId, `/chat/chatters?${query.toString()}`);

      chatters.push(
        ...response.data.map((entry) => ({
          userId: entry.user_id,
          login: entry.user_login,
          displayName: sanitizeDisplayName(entry.user_name)
        }))
      );

      cursor = response.pagination?.cursor;
    } while (cursor);

    return chatters;
  }

  async lookupUserByLogin(userId: string, login: string) {
    const normalized = normalizeUsername(login);
    if (!normalized) {
      return null;
    }

    const payload = await this.helix<TwitchUsersResponse>(
      userId,
      `/users?login=${encodeURIComponent(normalized)}`
    );

    return payload.data[0] ?? null;
  }

  async getViewerRoles(userId: string, viewer: ViewerLookup): Promise<ViewerRoleResult> {
    const normalized = normalizeUsername(viewer.login);
    if (!normalized) {
      throw new AppError(400, "Invalid Twitch username", "INVALID_USERNAME");
    }

    const cacheKey = `${userId}:${viewer.viewerId ?? normalized}`;
    const cached = this.roleCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const connection = await this.ensureValidConnection(userId);
    const profile =
      viewer.viewerId != null
        ? await this.getUserById(userId, viewer.viewerId).catch(() => null)
        : await this.lookupUserByLogin(userId, normalized).catch(() => null);
    const resolvedViewerId = profile?.id ?? viewer.viewerId ?? null;

    const hasBadge = (badgeName: string) =>
      viewer.badges?.some((badge) => badge.set_id === badgeName) ?? false;

    const isBroadcaster = resolvedViewerId === connection.record.channelId || hasBadge("broadcaster");
    const badgeModerator = hasBadge("moderator");
    const badgeVip = hasBadge("vip");
    const badgeSubscriber = hasBadge("subscriber") || hasBadge("founder");

    const [
      followerResult,
      moderatorResult,
      vipResult,
      subscriberResult
    ] = await Promise.allSettled([
      resolvedViewerId ? this.checkFollower(userId, resolvedViewerId) : Promise.resolve(false),
      resolvedViewerId && !badgeModerator
        ? this.checkModerator(userId, resolvedViewerId)
        : Promise.resolve(false),
      resolvedViewerId && !badgeVip ? this.checkVip(userId, resolvedViewerId) : Promise.resolve(false),
      resolvedViewerId && !badgeSubscriber
        ? this.checkSubscriber(userId, resolvedViewerId)
        : Promise.resolve(false)
    ]);

    const value: ViewerRoleResult = {
      twitchUserId: resolvedViewerId,
      username: normalized,
      displayName: sanitizeDisplayName(profile?.display_name ?? viewer.displayName ?? viewer.login),
      isFollower: followerResult.status === "fulfilled" ? followerResult.value : false,
      isSubscriber:
        badgeSubscriber || (subscriberResult.status === "fulfilled" ? subscriberResult.value : false),
      isVip: badgeVip || (vipResult.status === "fulfilled" ? vipResult.value : false),
      isModerator:
        badgeModerator || (moderatorResult.status === "fulfilled" ? moderatorResult.value : false),
      isBroadcaster,
      accountCreatedAt: profile?.created_at ? new Date(profile.created_at) : null
    };

    this.roleCache.set(cacheKey, {
      expiresAt: Date.now() + 60_000,
      value
    });

    return value;
  }

  private async checkFollower(userId: string, viewerId: string) {
    const connection = await this.ensureValidConnection(userId);
    const query = new URLSearchParams({
      broadcaster_id: connection.record.channelId,
      user_id: viewerId,
      first: "1"
    });
    const payload = await this.helix<TwitchListResponse<unknown>>(userId, `/channels/followers?${query}`);
    return payload.data.length > 0;
  }

  private async checkModerator(userId: string, viewerId: string) {
    const connection = await this.ensureValidConnection(userId);
    const query = new URLSearchParams({
      broadcaster_id: connection.record.channelId,
      user_id: viewerId,
      first: "1"
    });
    const payload = await this.helix<TwitchListResponse<unknown>>(
      userId,
      `/moderation/moderators?${query}`
    );
    return payload.data.length > 0;
  }

  private async checkVip(userId: string, viewerId: string) {
    const connection = await this.ensureValidConnection(userId);
    const query = new URLSearchParams({
      broadcaster_id: connection.record.channelId,
      user_id: viewerId,
      first: "1"
    });
    const payload = await this.helix<TwitchListResponse<unknown>>(userId, `/channels/vips?${query}`);
    return payload.data.length > 0;
  }

  private async checkSubscriber(userId: string, viewerId: string) {
    const connection = await this.ensureValidConnection(userId);
    const query = new URLSearchParams({
      broadcaster_id: connection.record.channelId,
      user_id: viewerId
    });
    const payload = await this.helix<TwitchListResponse<unknown>>(userId, `/subscriptions?${query}`);
    return payload.data.length > 0;
  }

  private async getUserById(userId: string, viewerId: string) {
    const payload = await this.helix<TwitchUsersResponse>(
      userId,
      `/users?id=${encodeURIComponent(viewerId)}`
    );
    return payload.data[0] ?? null;
  }

  private async ensureValidConnection(userId: string): Promise<DecryptedConnection> {
    const connection = await this.getConnection(userId);
    if (connection.record.tokenExpiresAt.getTime() <= Date.now() + 60_000) {
      return this.refreshTokens(userId, connection);
    }
    return connection;
  }

  private async getConnection(userId: string): Promise<DecryptedConnection> {
    const connection = await prisma.twitchConnection.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!connection) {
      throw new AppError(401, "Twitch connection not found. Log in again.", "TWITCH_CONNECTION");
    }

    return {
      record: connection,
      accessToken: decryptSecret(connection.encryptedAccessToken),
      refreshToken: decryptSecret(connection.encryptedRefreshToken)
    };
  }

  private async refreshTokens(userId: string, existing?: DecryptedConnection) {
    const inFlight = this.refreshInFlight.get(userId);
    if (inFlight) {
      return inFlight;
    }

    const promise = this.refreshTokensInternal(userId, existing);
    this.refreshInFlight.set(userId, promise);

    try {
      return await promise;
    } finally {
      this.refreshInFlight.delete(userId);
    }
  }

  private async refreshTokensInternal(userId: string, existing?: DecryptedConnection) {
    const connection = existing ?? (await this.getConnection(userId));
    const tokenResponse = await this.fetchToken({
      grant_type: "refresh_token",
      refresh_token: connection.refreshToken
    });

    await prisma.twitchConnection.update({
      where: { userId },
      data: {
        encryptedAccessToken: encryptSecret(tokenResponse.access_token),
        encryptedRefreshToken: encryptSecret(tokenResponse.refresh_token ?? connection.refreshToken),
        tokenExpiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
        scopeText: (tokenResponse.scope ?? twitchScopes).join(" "),
        lastError: null
      }
    });

    return this.getConnection(userId);
  }

  private async fetchToken(parameters: Record<string, string>) {
    const response = await fetch(`${twitchAuthBaseUrl}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: env.TWITCH_CLIENT_ID,
        client_secret: env.TWITCH_CLIENT_SECRET,
        ...parameters
      })
    });

    const payload = (await response.json()) as TwitchTokenResponse & { message?: string };

    if (!response.ok) {
      throw new AppError(502, payload.message ?? "Failed to exchange Twitch token", "TWITCH_AUTH");
    }

    return payload;
  }
}
