import type { FastifyRequest } from "fastify";
import { ZodError, type ZodTypeAny } from "zod";
import { prisma } from "../db/prisma";
import { getSessionUserId } from "../lib/auth";
import { AppError } from "../lib/errors";

export async function requireUserId(request: FastifyRequest) {
  const sessionUserId = getSessionUserId(request);

  if (!sessionUserId) {
    throw new AppError(401, "Authentication required", "UNAUTHORIZED");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUserId },
    select: { id: true }
  });

  if (!user) {
    throw new AppError(401, "Authentication required", "UNAUTHORIZED");
  }

  return user.id;
}

export function parseWithSchema<TSchema extends ZodTypeAny>(
  schema: TSchema,
  value: unknown
): import("zod").infer<TSchema> {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError(400, error.issues[0]?.message ?? "Invalid request body", "VALIDATION");
    }

    throw error;
  }
}
