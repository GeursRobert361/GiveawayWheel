import { useEffect } from "react";
import { ApiError, buildWsUrl, getMe } from "../lib/api";
import type { DashboardSnapshot } from "../lib/types";
import { useDashboardStore } from "../store/useDashboardStore";

interface SnapshotEnvelope {
  type: "snapshot";
  scope: "dashboard";
  data: DashboardSnapshot;
}

export function useDashboardRealtime() {
  const setAuthState = useDashboardStore((state) => state.setAuthState);
  const setSnapshot = useDashboardStore((state) => state.setSnapshot);
  const setError = useDashboardStore((state) => state.setError);
  const reset = useDashboardStore((state) => state.reset);

  useEffect(() => {
    let cancelled = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;

    const connect = () => {
      socket = new WebSocket(buildWsUrl("/ws"));

      socket.addEventListener("message", (event) => {
        const payload = JSON.parse(event.data) as SnapshotEnvelope | { type: "error"; message: string };

        if (payload.type === "error") {
          setError(payload.message);
          return;
        }

        setSnapshot(payload.data);
      });

      socket.addEventListener("close", () => {
        if (cancelled || useDashboardStore.getState().authState !== "authenticated") {
          return;
        }

        reconnectTimer = window.setTimeout(connect, 2000);
      });
    };

    void getMe()
      .then(() => {
        if (cancelled) {
          return;
        }
        setAuthState("authenticated");
        connect();
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          reset();
          return;
        }

        setAuthState("guest");
        setError(error instanceof Error ? error.message : "Unable to reach the API");
      });

    return () => {
      cancelled = true;
      if (reconnectTimer != null) {
        window.clearTimeout(reconnectTimer);
      }
      socket?.close();
    };
  }, [reset, setAuthState, setError, setSnapshot]);
}
