import { randomBytes } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { authCookieName, authStateCookieName, env } from "./env";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.COOKIE_SECURE,
  path: "/",
  signed: true
};

export function createOAuthState() {
  return randomBytes(24).toString("hex");
}

export function setSessionCookie(reply: FastifyReply, userId: string) {
  reply.setCookie(authCookieName, userId, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 30
  });
}

export function setOAuthStateCookie(reply: FastifyReply, state: string) {
  reply.setCookie(authStateCookieName, state, {
    ...cookieOptions,
    maxAge: 60 * 10
  });
}

export function clearAuthCookies(reply: FastifyReply) {
  reply.clearCookie(authCookieName, { path: "/" });
  reply.clearCookie(authStateCookieName, { path: "/" });
}

export function getSignedCookie(request: FastifyRequest, cookieName: string) {
  const rawCookie = request.cookies[cookieName];

  if (!rawCookie) {
    return null;
  }

  const unsigned = request.unsignCookie(rawCookie);
  return unsigned.valid ? unsigned.value : null;
}

export function getSessionUserId(request: FastifyRequest) {
  return getSignedCookie(request, authCookieName);
}

export function getOAuthState(request: FastifyRequest) {
  return getSignedCookie(request, authStateCookieName);
}
