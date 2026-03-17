import { randomInt } from "node:crypto";

export function secureRandomFraction() {
  return randomInt(0, 1_000_000_000) / 1_000_000_000;
}
