import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { env } from "./env";

const algorithm = "aes-256-gcm";

function getKey() {
  return createHash("sha256").update(env.SESSION_SECRET).digest();
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptSecret(value: string) {
  const [ivText, tagText, encryptedText] = value.split(".");

  if (!ivText || !tagText || !encryptedText) {
    throw new Error("Malformed encrypted value");
  }

  const decipher = createDecipheriv(
    algorithm,
    getKey(),
    Buffer.from(ivText, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64url")),
    decipher.final()
  ]);
  return decrypted.toString("utf8");
}
