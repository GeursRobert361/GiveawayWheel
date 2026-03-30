import { useEffect, useMemo, useRef, useState } from "react";
import type { LastSpinPayload } from "../../lib/types";
import { ConfettiCanvas } from "./ConfettiCanvas";

interface WheelEntrant {
  id: string;
  displayName: string;
}

interface WheelProps {
  entrants: WheelEntrant[];
  lastSpin: LastSpinPayload | null;
  winnerLabel?: string | null;
  compact?: boolean;
  onSpin?: () => void;
  spinDisabled?: boolean;
  overlayMode?: boolean;
  onWinnerDismiss?: () => void;
  dismissKey?: number;
}

const segmentColors = [
  "#47d7ff",
  "#ff725e",
  "#c5ff55",
  "#ffcc4d",
  "#7f72ff",
  "#10a4d8",
  "#ff9d52",
  "#65e5b7",
  "#f66ed9",
  "#9ec8ff"
];

function normalizeRotation(value: number) {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}

function describeSegment(index: number, count: number, radius: number, center: number) {
  const angle = 360 / count;
  const startAngle = index * angle;
  const endAngle = startAngle + angle;
  const start = polarToCartesian(center, center, radius, endAngle);
  const end = polarToCartesian(center, center, radius, startAngle);
  const largeArcFlag = angle > 180 ? 1 : 0;

  return `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

function truncateName(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3;
}

export function Wheel({ entrants, lastSpin, winnerLabel, compact = false, onSpin, spinDisabled = false, overlayMode = false, onWinnerDismiss, dismissKey }: WheelProps) {
  const [rotation, setRotation] = useState(0);
  const [duration, setDuration] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [resolvedWinner, setResolvedWinner] = useState<string | null>(winnerLabel ?? null);
  const [idleRotation, setIdleRotation] = useState(0);
  const handledSpinRef = useRef<string | null>(null);
  const rotationRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const stopTickTrackRef = useRef<(() => void) | null>(null);

  const stopTickTrack = () => {
    stopTickTrackRef.current?.();
    stopTickTrackRef.current = null;
  };

  const ensureAudioContext = () => {
    if (typeof window === "undefined") return null;
    if (!audioContextRef.current) {
      const AudioContextConstructor = window.AudioContext ?? (window as Window & typeof globalThis & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;
      if (!AudioContextConstructor) return null;
      audioContextRef.current = new AudioContextConstructor();
    }
    const context = audioContextRef.current;
    if (context.state === "suspended") void context.resume().catch(() => undefined);
    return context;
  };

  const playTick = (context: AudioContext, energy: number) => {
    const tickTime = context.currentTime;
    const gainNode = context.createGain();
    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(980 + energy * 420, tickTime);
    gainNode.gain.setValueAtTime(0.0001, tickTime);
    gainNode.gain.exponentialRampToValueAtTime(0.08 + energy * 0.05, tickTime + 0.004);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, tickTime + 0.045);
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(tickTime);
    oscillator.stop(tickTime + 0.05);
  };

  const startTickTrack = (spinDurationMs: number, totalRotationDegrees: number) => {
    stopTickTrack();
    const context = ensureAudioContext();
    if (!context) return;
    const tickStepDegrees = 28;
    let lastTickAngle = 0;
    let frameId = 0;
    const startedAt = performance.now();
    const frame = (now: number) => {
      const elapsed = Math.min(now - startedAt, spinDurationMs);
      const progress = spinDurationMs <= 0 ? 1 : elapsed / spinDurationMs;
      const travelled = totalRotationDegrees * easeOutCubic(progress);
      while (travelled - lastTickAngle >= tickStepDegrees) {
        const remaining = 1 - progress;
        playTick(context, Math.max(0.2, remaining));
        lastTickAngle += tickStepDegrees;
      }
      if (progress < 1) {
        frameId = window.requestAnimationFrame(frame);
      } else {
        playTick(context, 0.18);
        stopTickTrackRef.current = null;
      }
    };
    frameId = window.requestAnimationFrame(frame);
    stopTickTrackRef.current = () => window.cancelAnimationFrame(frameId);
  };

  useEffect(() => { rotationRef.current = rotation; }, [rotation]);

  // Clear winner when lastSpin becomes null (dismissed from dashboard)
  useEffect(() => {
    if (!lastSpin) {
      setCelebrating(false);
      setResolvedWinner(null);
      handledSpinRef.current = null;
    }
  }, [lastSpin]);

  useEffect(() => {
    if (!lastSpin || handledSpinRef.current === lastSpin.eventId) return;
    handledSpinRef.current = lastSpin.eventId;
    const scheduledAt = new Date(lastSpin.scheduledAt).getTime();
    const completedAt = new Date(lastSpin.completedAt).getTime();
    const now = Date.now();
    const delay = Math.max(0, scheduledAt - now);

    if (completedAt <= now) {
      stopTickTrack();
      setDuration(0);
      setRotation(lastSpin.rotationDegrees);
      setResolvedWinner(overlayMode ? null : lastSpin.winnerDisplayName);
      setCelebrating(false);
      setCountdown(null);
      return;
    }

    setResolvedWinner(null);
    setCelebrating(false);
    setCountdown(Math.max(0, Math.ceil(delay / 1000)));

    const countdownInterval = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((scheduledAt - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) window.clearInterval(countdownInterval);
    }, 250);

    const spinTimeout = window.setTimeout(() => {
      setCountdown(null);
      setIdleRotation(0); // Reset idle rotation when spin starts
      setDuration(lastSpin.durationMs);
      const current = rotationRef.current;
      const currentNormalized = normalizeRotation(current);
      const targetNormalized = normalizeRotation(lastSpin.rotationDegrees);
      let delta = targetNormalized - currentNormalized;
      if (delta <= 0) delta += 360;
      const extraTurns = Math.max(Math.floor(lastSpin.rotationDegrees / 360), 6);
      const totalRotation = extraTurns * 360 + delta;
      startTickTrack(lastSpin.durationMs, totalRotation);
      setRotation(current + totalRotation);
    }, delay);

    const celebrationTimeout = window.setTimeout(() => {
      stopTickTrack();
      setResolvedWinner(lastSpin.winnerDisplayName);
      setCelebrating(true);
    }, Math.max(0, completedAt - now));

    const autoDismissTimeout = overlayMode
      ? window.setTimeout(() => {
          setCelebrating(false);
          setResolvedWinner(null);
        }, Math.max(0, completedAt - now) + 8000)
      : null;

    return () => {
      window.clearInterval(countdownInterval);
      window.clearTimeout(spinTimeout);
      window.clearTimeout(celebrationTimeout);
      if (autoDismissTimeout) window.clearTimeout(autoDismissTimeout);
      stopTickTrack();
    };
  }, [lastSpin, overlayMode]);

  useEffect(() => () => stopTickTrack(), []);

  // Idle spin animation - slow continuous rotation when not actively spinning
  // Disabled in overlay mode to improve OBS performance
  useEffect(() => {
    if (overlayMode) return; // Skip idle rotation in overlay mode for better OBS performance

    const isSpinning = countdown !== null || duration > 0;
    if (isSpinning) return;

    const startTime = Date.now();
    const idleSpinSpeed = 0.015; // degrees per millisecond (very slow)
    let frameId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      setIdleRotation(elapsed * idleSpinSpeed);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [countdown, duration, overlayMode]);

  // Handle winner dismissal callback
  useEffect(() => {
    if (!resolvedWinner || !onWinnerDismiss) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCelebrating(false);
        setResolvedWinner(null);
        onWinnerDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resolvedWinner, onWinnerDismiss]);

  // Watch for dismiss trigger from parent
  useEffect(() => {
    if (dismissKey && dismissKey > 0) {
      setCelebrating(false);
      setResolvedWinner(null);
    }
  }, [dismissKey]);

  const wheelEntrants = useMemo(
    () => (entrants.length > 0 ? entrants : [{ id: "empty", displayName: "Waiting for entrants" }]),
    [entrants]
  );

  const size = compact ? 620 : 760;
  const center = size / 2;
  const outerRadius = compact ? 276 : 338;
  const segmentRadius = outerRadius - 14;
  const innerRadius = compact ? 84 : 100;
  const labelRadius = compact ? 205 : 250;
  const fontSize = compact
    ? wheelEntrants.length > 18 ? 12 : 14
    : wheelEntrants.length > 24 ? 12 : wheelEntrants.length > 16 ? 14 : 16;
  const nameLength = compact ? 16 : 20;
  const anglePerSegment = 360 / wheelEntrants.length;

  const isSpinActive = !celebrating && (countdown !== null || duration > 0);
  const totalRotation = rotation + (isSpinActive ? 0 : idleRotation);

  // Simplified SVG for overlay mode (better OBS performance)
  const svgEl = overlayMode ? (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full"
      style={{
        transform: `rotate(${totalRotation}deg)`,
        transition: duration ? `transform ${duration}ms cubic-bezier(0.12, 0.92, 0.14, 1)` : "none"
      }}
    >
      <defs>
        <radialGradient id="wheelCore" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#12263f" />
          <stop offset="65%" stopColor="#09111f" />
          <stop offset="100%" stopColor="#050816" />
        </radialGradient>
      </defs>

      <circle cx={center} cy={center} r={outerRadius} fill="#06101e" stroke="rgba(255,255,255,0.16)" strokeWidth="8" />

      {wheelEntrants.map((entrant, index) => {
        const textAngle = index * anglePerSegment + anglePerSegment / 2;
        const textPoint = polarToCartesian(center, center, labelRadius, textAngle);
        return (
          <g key={entrant.id}>
            <path d={describeSegment(index, wheelEntrants.length, segmentRadius, center)}
              fill={segmentColors[index % segmentColors.length]} stroke="rgba(8,17,33,0.45)" strokeWidth="4" />
            <line x1={center} y1={center}
              x2={polarToCartesian(center, center, segmentRadius, index * anglePerSegment).x}
              y2={polarToCartesian(center, center, segmentRadius, index * anglePerSegment).y}
              stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" />
            <text x={textPoint.x} y={textPoint.y} fill="#07111d" fontSize={fontSize} fontWeight="800"
              letterSpacing="0.02em" textAnchor="middle" dominantBaseline="middle"
              transform={`rotate(${textAngle + 90} ${textPoint.x} ${textPoint.y})`}>
              {truncateName(entrant.displayName, nameLength)}
            </text>
          </g>
        );
      })}

      <circle cx={center} cy={center} r={innerRadius + 18} fill="url(#wheelCore)" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
      <circle cx={center} cy={center} r={innerRadius} fill="#07101c" stroke="rgba(123,229,255,0.22)" strokeWidth="3" />
      <text x={center} y={center - 12} textAnchor="middle" fill="#ecfbff" fontSize={compact ? "24" : "28"} fontWeight="800">LIVE DRAW</text>
      <text x={center} y={center + 18} textAnchor="middle" fill="#7be5ff" fontSize={compact ? "15" : "18"} fontWeight="700">
        {wheelEntrants.length} names in play
      </text>
    </svg>
  ) : (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full drop-shadow-[0_45px_95px_rgba(0,0,0,0.55)]"
      style={{
        transform: `rotate(${totalRotation}deg)`,
        transition: duration ? `transform ${duration}ms cubic-bezier(0.12, 0.92, 0.14, 1)` : "none"
      }}
    >
      <defs>
        <radialGradient id="wheelCore" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#12263f" />
          <stop offset="65%" stopColor="#09111f" />
          <stop offset="100%" stopColor="#050816" />
        </radialGradient>
        <radialGradient id="wheelHalo" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#7be5ff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7be5ff" stopOpacity="0" />
        </radialGradient>
        <filter id="segmentGlow">
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#ffffff" floodOpacity="0.12" />
        </filter>
      </defs>

      <circle cx={center} cy={center} r={outerRadius + 12} fill="url(#wheelHalo)" />
      <circle cx={center} cy={center} r={outerRadius} fill="#06101e" stroke="rgba(255,255,255,0.16)" strokeWidth="8" />
      <circle cx={center} cy={center} r={outerRadius - 8} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" strokeDasharray="5 14" />

      {Array.from({ length: Math.max(wheelEntrants.length * 2, 28) }).map((_, index, array) => {
        const angle = (360 / array.length) * index;
        const start = polarToCartesian(center, center, outerRadius + 2, angle);
        const end = polarToCartesian(center, center, outerRadius + 16, angle);
        return (
          <line key={`tick-${index}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y}
            stroke="rgba(255,255,255,0.12)" strokeWidth={index % 2 === 0 ? 2.4 : 1.4} />
        );
      })}

      {wheelEntrants.map((entrant, index) => {
        const textAngle = index * anglePerSegment + anglePerSegment / 2;
        const textPoint = polarToCartesian(center, center, labelRadius, textAngle);
        return (
          <g key={entrant.id} filter="url(#segmentGlow)">
            <path d={describeSegment(index, wheelEntrants.length, segmentRadius, center)}
              fill={segmentColors[index % segmentColors.length]} stroke="rgba(8,17,33,0.45)" strokeWidth="4" />
            <line x1={center} y1={center}
              x2={polarToCartesian(center, center, segmentRadius, index * anglePerSegment).x}
              y2={polarToCartesian(center, center, segmentRadius, index * anglePerSegment).y}
              stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" />
            <text x={textPoint.x} y={textPoint.y} fill="#07111d" fontSize={fontSize} fontWeight="800"
              letterSpacing="0.02em" textAnchor="middle" dominantBaseline="middle"
              transform={`rotate(${textAngle + 90} ${textPoint.x} ${textPoint.y})`}>
              {truncateName(entrant.displayName, nameLength)}
            </text>
          </g>
        );
      })}

      <circle cx={center} cy={center} r={innerRadius + 18} fill="url(#wheelCore)" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
      <circle cx={center} cy={center} r={innerRadius} fill="#07101c" stroke="rgba(123,229,255,0.22)" strokeWidth="3" />
      <text x={center} y={center - 12} textAnchor="middle" fill="#ecfbff" fontSize={compact ? "24" : "28"} fontWeight="800">LIVE DRAW</text>
      <text x={center} y={center + 18} textAnchor="middle" fill="#7be5ff" fontSize={compact ? "15" : "18"} fontWeight="700">
        {wheelEntrants.length} names in play
      </text>
    </svg>
  );

  const pointerEl = (
    <div className="flex flex-col items-center">
      <div className="h-5 w-20 rounded-full bg-white/10 blur-md" />
      <div className="relative -mt-1 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-slate-950/90 shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
        <div className="h-0 w-0 border-l-[18px] border-r-[18px] border-t-[34px] border-l-transparent border-r-transparent border-t-white drop-shadow-[0_12px_24px_rgba(255,255,255,0.35)]" />
      </div>
    </div>
  );

  // Overlay mode — just wheel, transparent background (check first so it stays in overlay mode even when spinning)
  if (overlayMode) {
    return (
      <div className="relative w-full">
        <ConfettiCanvas active={celebrating} />

        {/* Pointer arrow */}
        <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2">
          {pointerEl}
        </div>

        {/* Wheel SVG - full width */}
        <div className="w-full">
          {svgEl}
        </div>

        {/* Winner popup when spin completes (only show when celebrating) */}
        {resolvedWinner && celebrating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-in zoom-in duration-500 flex h-full w-full items-center justify-center rounded-full bg-slate-950/95 text-center shadow-[0_32px_90px_rgba(0,0,0,0.9)] backdrop-blur-md border-4 border-violet-400/40">
              <div>
                <p className="text-2xl font-semibold uppercase tracking-[0.4em] text-violet-300">Winner</p>
                <p className="mt-6 font-display text-9xl font-bold text-white break-words px-8">{resolvedWinner}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Normal inline card
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(71,215,255,0.16),_transparent_40%),linear-gradient(180deg,rgba(9,15,29,0.98),rgba(3,5,12,0.94))] p-5 sm:p-7">
      <ConfettiCanvas active={celebrating} />
      <div className="pointer-events-none absolute inset-x-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-300/10 blur-[90px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_52%,rgba(255,255,255,0.02)_100%)]" />

      <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2 sm:top-4">
        {pointerEl}
      </div>

      <div className={compact ? "mx-auto max-w-[680px]" : "mx-auto max-w-[900px]"}>
        <div className="relative">
          {svgEl}

          {/* Countdown overlay */}
          {countdown != null && countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="font-display text-8xl font-bold tabular-nums text-amber-200 drop-shadow-[0_0_40px_rgba(251,191,36,0.6)]">{countdown}</p>
                <p className="mt-2 text-sm text-slate-300">Spin starting...</p>
              </div>
            </div>
          )}

          {/* Spin button overlay in center */}
          {onSpin && !resolvedWinner && !isSpinActive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                type="button"
                disabled={spinDisabled}
                onClick={onSpin}
                className="pointer-events-auto rounded-full border-2 border-violet-400/30 bg-gradient-to-b from-violet-500 to-violet-700 px-8 py-4 text-lg font-bold text-white shadow-[0_20px_60px_rgba(124,58,237,0.5)] transition hover:scale-105 hover:shadow-[0_25px_70px_rgba(124,58,237,0.7)] disabled:opacity-40 disabled:hover:scale-100"
              >
                Spin Now
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.05] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-200/70">Wheel status</p>
          <>
            <p className="mt-3 text-2xl font-bold text-white">{resolvedWinner ? "Winner locked" : "Standing by"}</p>
            <p className="mt-2 text-sm text-slate-400">
              {resolvedWinner ? "Celebrate the result or reroll for another pick." : "Open the giveaway and start collecting chat joins."}
            </p>
          </>
        </div>

        <div className={`rounded-[28px] border px-5 py-4 ${
          resolvedWinner
            ? "border-brand-200/35 bg-[linear-gradient(135deg,rgba(71,215,255,0.18),rgba(255,204,77,0.14),rgba(255,114,94,0.16))] shadow-[0_0_0_1px_rgba(123,229,255,0.08),0_28px_70px_rgba(26,192,245,0.18)]"
            : "border-white/10 bg-[linear-gradient(135deg,rgba(71,215,255,0.12),rgba(255,204,77,0.08),rgba(255,114,94,0.12))]"
        }`}>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-50/80">
            {resolvedWinner ? "Winner confirmed" : "Winner spotlight"}
          </p>
          <p className="mt-3 font-display text-3xl font-bold text-white sm:text-5xl">
            {resolvedWinner ?? winnerLabel ?? "Waiting for the next spin"}
          </p>
          <p className="mt-3 max-w-2xl text-sm text-slate-200/90">
            {resolvedWinner
              ? "Locked in. Call it on stream, or reroll if you need another winner."
              : "Open the giveaway and collect chat joins to populate the wheel."}
          </p>
        </div>
      </div>
    </div>
  );
}
