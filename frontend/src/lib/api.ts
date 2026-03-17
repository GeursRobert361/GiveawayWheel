import type { HistoryItem, MeResponse, OverlaySnapshot } from "./types";

const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as { message?: string } & T)
    : ((await response.text()) as unknown as T);

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String(payload.message ?? "Request failed")
        : "Request failed";
    throw new ApiError(response.status, message);
  }

  return payload as T;
}

export async function apiGet<T>(path: string) {
  const response = await fetch(`${apiBase}${path}`, {
    credentials: "include"
  });
  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body?: unknown) {
  const hasBody = body !== undefined;
  const response = await fetch(`${apiBase}${path}`, {
    method: "POST",
    credentials: "include",
    headers: hasBody
      ? {
          "Content-Type": "application/json"
        }
      : undefined,
    body: hasBody ? JSON.stringify(body) : undefined
  });
  return handleResponse<T>(response);
}

export async function apiDownload(path: string) {
  const response = await fetch(`${apiBase}${path}`, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Download failed");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download =
    response.headers
      .get("content-disposition")
      ?.match(/filename="(.+)"/)?.[1] ?? "download.csv";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function buildWsUrl(path = "/ws") {
  const url = new URL(apiBase);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = path;
  url.search = "";
  return url.toString();
}

export function loginWithTwitch() {
  window.location.assign(`${apiBase}/api/auth/login`);
}

export async function logout() {
  return apiPost<{ success: boolean }>("/api/auth/logout");
}

export async function getMe() {
  return apiGet<MeResponse>("/api/me");
}

export async function getHistory() {
  return apiGet<HistoryItem[]>("/api/history/list");
}

export async function getOverlaySnapshot(overlayKey: string) {
  return apiGet<OverlaySnapshot>(`/api/overlay/${encodeURIComponent(overlayKey)}/current`);
}

export { apiBase };
