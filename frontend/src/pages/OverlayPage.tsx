import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Wheel } from "../components/wheel/Wheel";
import { buildWsUrl, getOverlaySnapshot } from "../lib/api";
import type { OverlaySnapshot } from "../lib/types";
import { isSpinInProgress } from "../lib/utils";

function playWinnerTone() {
  const AudioContextCtor = window.AudioContext;
  if (!AudioContextCtor) return;
  const context = new AudioContextCtor();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(440, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.5);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.9);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.95);
}

export function OverlayPage() {
  const { overlayKey = "" } = useParams();
  const [snapshot, setSnapshot] = useState<OverlaySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handledWinnerRef = useRef<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("overlay-mode");
    return () => {
      document.documentElement.classList.remove("overlay-mode");
    };
  }, []);

  useEffect(() => {
    if (!overlayKey) return;
    let active = true;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;

    void getOverlaySnapshot(overlayKey)
      .then((data) => { if (active) setSnapshot(data); })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load overlay");
      });

    const connect = () => {
      const url = new URL(buildWsUrl("/ws"));
      url.searchParams.set("overlayKey", overlayKey);
      socket = new WebSocket(url.toString());

      socket.addEventListener("message", (event) => {
        const payload = JSON.parse(event.data) as
          | { type: "snapshot"; scope: "overlay"; data: OverlaySnapshot }
          | { type: "error"; message: string };
        if (payload.type === "error") {
          setError(payload.message);
          return;
        }
        setError(null);
        setSnapshot(payload.data);
      });

      socket.addEventListener("close", () => {
        if (!active) return;
        reconnectTimer = window.setTimeout(connect, 2000);
      });
    };

    connect();

    return () => {
      active = false;
      if (reconnectTimer != null) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [overlayKey]);

  useEffect(() => {
    const spin = snapshot?.lastSpin;
    if (!spin || handledWinnerRef.current === spin.eventId) return;

    const fireWinner = () => {
      handledWinnerRef.current = spin.eventId;
      window.dispatchEvent(
        new CustomEvent("tgw:winner", {
          detail: { winner: spin.winnerDisplayName, overlayKey }
        })
      );
      playWinnerTone();
    };

    const remaining = new Date(spin.completedAt).getTime() - Date.now();
    if (remaining <= 0) {
      fireWinner();
      return;
    }

    const timer = window.setTimeout(fireWinner, remaining);
    return () => window.clearTimeout(timer);
  }, [overlayKey, snapshot?.lastSpin]);

  const entrants = useMemo(
    () => snapshot?.entrants.map((entrant) => ({ id: entrant.id, displayName: entrant.displayName })) ?? [],
    [snapshot?.entrants]
  );

  if (error) {
    return null;
  }

  if (!snapshot) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Wheel
        entrants={entrants}
        lastSpin={snapshot.lastSpin}
        overlayMode
      />
    </div>
  );
}
