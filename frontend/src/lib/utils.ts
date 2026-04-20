import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { LastSpinPayload } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  const deltaSeconds = Math.round((timestamp - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  if (Math.abs(deltaSeconds) < 60) {
    return formatter.format(deltaSeconds, "second");
  }

  const deltaMinutes = Math.round(deltaSeconds / 60);
  if (Math.abs(deltaMinutes) < 60) {
    return formatter.format(deltaMinutes, "minute");
  }

  const deltaHours = Math.round(deltaMinutes / 60);
  if (Math.abs(deltaHours) < 24) {
    return formatter.format(deltaHours, "hour");
  }

  const deltaDays = Math.round(deltaHours / 24);
  return formatter.format(deltaDays, "day");
}

export function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

export function formatConnectionStatus(status: "connected" | "reconnecting" | "disconnected") {
  switch (status) {
    case "connected":
      return "Connected";
    case "reconnecting":
      return "Reconnecting";
    default:
      return "Disconnected";
  }
}

export function isSpinInProgress(spin: LastSpinPayload | null | undefined) {
  if (!spin) {
    return false;
  }

  return new Date(spin.completedAt).getTime() > Date.now();
}
