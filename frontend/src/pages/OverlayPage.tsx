import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Wheel } from "../components/wheel/Wheel";
import { buildWsUrl, getOverlaySnapshot } from "../lib/api";
import type { OverlaySnapshot } from "../lib/types";

function playWinnerTone() {
  const AudioContextCtor = window.AudioContext;
  if (!AudioContextCtor) {
    return;
  }

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
    if (!overlayKey) {
      return;
    }

    let active = true;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;

    void getOverlaySnapshot(overlayKey)
      .then((data) => {
        if (active) {
          setSnapshot(data);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Unable to load overlay");
        }
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
        if (!active) {
          return;
        }

        reconnectTimer = window.setTimeout(connect, 2000);
      });
    };

    connect();

    return () => {
      active = false;
      if (reconnectTimer != null) {
        window.clearTimeout(reconnectTimer);
      }
      socket?.close();
    };
  }, [overlayKey]);

  useEffect(() => {
    const spin = snapshot?.lastSpin;
    if (!spin || handledWinnerRef.current === spin.eventId) {
      return;
    }

    const fireWinner = () => {
      handledWinnerRef.current = spin.eventId;
      window.dispatchEvent(
        new CustomEvent("tgw:winner", {
          detail: {
            winner: spin.winnerDisplayName,
            overlayKey
          }
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-6 py-4 text-sm">{error}</div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-6 py-4 text-sm">Loading overlay…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(71,215,255,0.16),_transparent_28%),linear-gradient(180deg,_#050816_0%,_#02040b_100%)] px-4 py-8 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center gap-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-200/70">OBS Overlay</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-6xl">{snapshot.title}</h1>
          <p className="mt-3 text-lg text-slate-300">
            {snapshot.status === "OPEN" ? `Chat command: ${snapshot.entryCommand}` : "Giveaway closed until the next round"}
          </p>
        </div>

        <div className="mx-auto w-full max-w-4xl">
          <Wheel
            entrants={entrants}
            lastSpin={snapshot.lastSpin}
            winnerLabel={snapshot.lastSpin?.winnerDisplayName ?? snapshot.winners[0]?.displayName ?? null}
            compact
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 px-5 py-4 text-center shadow-soft backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200/70">Entrants</p>
            <p className="mt-2 text-3xl font-bold text-white">{snapshot.entrantCount}</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 px-5 py-4 text-center shadow-soft backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200/70">Latest winner</p>
            <p className="mt-2 text-3xl font-bold text-white">{snapshot.winners[0]?.displayName ?? "Waiting…"}</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 px-5 py-4 text-center shadow-soft backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200/70">Mode</p>
            <p className="mt-2 text-3xl font-bold text-white">{snapshot.status === "OPEN" ? "Live" : "Closed"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
