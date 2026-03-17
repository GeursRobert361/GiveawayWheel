import { z } from "zod";

export const createSessionSchema = z
  .object({
    title: z.string().min(1).max(80).optional(),
    entryCommand: z.string().min(1).max(30).optional(),
    leaveCommand: z.string().min(1).max(30).optional(),
    removeWinnerAfterDraw: z.boolean().optional(),
    allowDuplicateEntries: z.boolean().optional(),
    maxEntriesPerUser: z.coerce.number().int().min(1).max(100).optional(),
    followerOnlyMode: z.boolean().optional(),
    subscriberOnlyMode: z.boolean().optional(),
    announceWinnerInChat: z.boolean().optional(),
    excludeBroadcaster: z.boolean().optional(),
    minimumAccountAgeDays: z.coerce.number().int().min(0).max(3650).optional(),
    spinCountdownSeconds: z.coerce.number().int().min(0).max(15).optional()
  })
  .optional();

export const weightSettingsSchema = z.object({
  viewerWeight: z.coerce.number().min(0).max(1000),
  followerWeight: z.coerce.number().min(0).max(1000),
  subscriberWeight: z.coerce.number().min(0).max(1000),
  vipWeight: z.coerce.number().min(0).max(1000),
  moderatorWeight: z.coerce.number().min(0).max(1000),
  broadcasterWeight: z.coerce.number().min(0).max(1000)
});

export const settingsUpdateSchema = z.object({
  title: z.string().min(1).max(80),
  entryCommand: z.string().min(1).max(30),
  leaveCommand: z.string().min(1).max(30),
  removeWinnerAfterDraw: z.boolean(),
  allowDuplicateEntries: z.boolean(),
  maxEntriesPerUser: z.coerce.number().int().min(1).max(100),
  followerOnlyMode: z.boolean(),
  subscriberOnlyMode: z.boolean(),
  announceWinnerInChat: z.boolean(),
  excludeBroadcaster: z.boolean(),
  minimumAccountAgeDays: z.coerce.number().int().min(0).max(3650),
  spinCountdownSeconds: z.coerce.number().int().min(0).max(15),
  weights: weightSettingsSchema,
  overrides: z
    .array(
      z.object({
        username: z.string().min(2).max(25),
        weight: z.coerce.number().min(0).max(1000),
        isBlocked: z.boolean().default(false),
        notes: z.string().max(120).nullish()
      })
    )
    .default([])
});

export const manualEntrantSchema = z.object({
  username: z.string().min(2).max(25),
  displayName: z.string().max(50).nullish()
});

export const usernameSchema = z.object({
  username: z.string().min(2).max(25)
});

export const entrantRemovalSchema = z.object({
  username: z.string().min(2).max(25),
  mode: z.enum(["single", "all"]).default("all")
});

export const overlayParamSchema = z.object({
  overlayKey: z.string().min(1)
});

export const websocketQuerySchema = z.object({
  overlayKey: z.string().optional()
});
