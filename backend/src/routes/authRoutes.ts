import type { FastifyInstance } from "fastify";
import { authStateCookieName, env } from "../lib/env";
import { clearAuthCookies, createOAuthState, getOAuthState, getSessionUserId, setOAuthStateCookie, setSessionCookie } from "../lib/auth";
import { AppError } from "../lib/errors";
import { EventSubManager } from "../services/twitch/eventSubManager";
import { TwitchService } from "../services/twitch/twitchService";

interface AuthRoutesOptions {
  twitchService: TwitchService;
  eventSubManager: EventSubManager;
}

export async function registerAuthRoutes(app: FastifyInstance, options: AuthRoutesOptions) {
  app.get("/api/auth/login", async (_request, reply) => {
    const state = createOAuthState();
    setOAuthStateCookie(reply, state);
    reply.redirect(options.twitchService.getAuthorizationUrl(state));
  });

  app.get("/api/auth/callback", async (request, reply) => {
    const query = request.query as {
      code?: string;
      state?: string;
      error?: string;
      error_description?: string;
    };

    if (query.error) {
      reply.redirect(`${env.FRONTEND_URL.replace(/\/$/, "")}/?error=${encodeURIComponent(query.error)}`);
      return;
    }

    if (!query.code || !query.state) {
      throw new AppError(400, "Missing OAuth callback parameters", "OAUTH");
    }

    const expectedState = getOAuthState(request);
    if (!expectedState || expectedState !== query.state) {
      throw new AppError(400, "Invalid OAuth state parameter", "OAUTH_STATE");
    }

    const user = await options.twitchService.handleOAuthCallback(query.code);
    setSessionCookie(reply, user.id);
    reply.clearCookie(authStateCookieName, { path: "/" });
    await options.eventSubManager.connectForUser(user.id);
    reply.redirect(`${env.FRONTEND_URL.replace(/\/$/, "")}/dashboard`);
  });

  app.post("/api/auth/logout", async (request, reply) => {
    const userId = getSessionUserId(request);
    if (userId) {
      await options.eventSubManager.disconnectForUser(userId).catch(() => undefined);
      await options.twitchService.deleteConnection(userId).catch(() => undefined);
    }

    clearAuthCookies(reply);
    return { success: true };
  });
}
