import { resolve } from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: resolve(process.cwd(), "../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  TWITCH_CLIENT_ID: z.string().min(1),
  TWITCH_CLIENT_SECRET: z.string().min(1),
  TWITCH_REDIRECT_URI: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  FRONTEND_URL: z.string().url(),
  BACKEND_URL: z.string().url(),
  VITE_API_BASE_URL: z.string().url().optional(),
  COOKIE_SECURE: z
    .union([z.literal("true"), z.literal("false")])
    .default("false")
    .transform((value) => value === "true"),
  EVENTSUB_WS_URL: z.string().url().default("wss://eventsub.wss.twitch.tv/ws")
});

export const env = envSchema.parse(process.env);

export const twitchScopes = [
  "user:read:chat",
  "user:write:chat",
  "moderator:read:chatters",
  "moderator:read:followers",
  "moderation:read",
  "channel:read:vips",
  "channel:read:subscriptions"
] as const;

export const authCookieName = "tgw_session";
export const authStateCookieName = "tgw_oauth_state";
