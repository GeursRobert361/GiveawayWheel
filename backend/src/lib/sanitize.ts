const usernamePattern = /^[a-z0-9_]{2,25}$/;

export function normalizeUsername(value: string) {
  const normalized = value.trim().toLowerCase().replace(/^@+/, "");
  if (!usernamePattern.test(normalized)) {
    return null;
  }
  return normalized;
}

export function sanitizeDisplayName(value: string) {
  return value.replace(/[^\p{L}\p{N}_\-\s]/gu, "").trim().slice(0, 50) || "Viewer";
}

export function sanitizeTitle(value: string) {
  return value.replace(/[^\p{L}\p{N}\p{P}\s]/gu, "").trim().slice(0, 80);
}

export function normalizeCommand(value: string, fallback: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return fallback;
  }
  return trimmed.startsWith("!") ? trimmed : `!${trimmed}`;
}

export function getPrimaryCommandToken(message: string) {
  return message.trim().split(/\s+/u)[0]?.toLowerCase() ?? "";
}
