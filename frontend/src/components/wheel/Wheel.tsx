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
}

const segmentColors = [
  "#47d7ff",
  "#ff725e",
  "#c5ff55",
  "#ffcc4d",
  "#10a4d8",
  "#fc8f4f",
  "#7be5ff",
  "#7dd65a"
];

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}

function describeSegment(index: number, count: number, radius: number) {
  const angle = 360 / count;
  const startAngle = index * angle;
  const endAngle = startAngle + angle;
  const start = polarToCartesian(250, 250, radius, endAngle);
  const end = polarToCartesian(250, 250, radius, startAngle);
  const largeArcFlag = angle > 180 ? 1 : 0;

  return `M 250 250 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

function truncateName(value: string) {
  return value.length > 15 ? `${value.slice(0, 14)}…` : value;
}

export function Wheel({ entrants, lastSpin, winnerLabel, compact = false }: WheelProps) {
  const [rotation, setRotation] = useState(0);
  const [duration, setDuration] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [resolvedWinner, setResolvedWinner] = useState<string | null>(winnerLabel ?? null);
  const handledSpinRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastSpin || handledSpinRef.current === lastSpin.eventId) {
      return;
    }

    handledSpinRef.current = lastSpin.eventId;
    const scheduledAt = new Date(lastSpin.scheduledAt).getTime();
    const completedAt = new Date(lastSpin.completedAt).getTime();
    const now = Date.now();
    const delay = Math.max(0, scheduledAt - now);

    if (completedAt <= now) {
      setDuration(0);
      setRotation(lastSpin.rotationDegrees);
      setResolvedWinner(lastSpin.winnerDisplayName);
      setCelebrating(true);
      setCountdown(null);
      return;
    }

    setResolvedWinner(null);
    setCelebrating(false);
    setCountdown(Math.max(0, Math.ceil(delay / 1000)));

    const countdownInterval = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((scheduledAt - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) {
        window.clearInterval(countdownInterval);
      }
    }, 250);

    const spinTimeout = window.setTimeout(() => {
      setCountdown(null);
      setDuration(lastSpin.durationMs);
      setRotation(lastSpin.rotationDegrees);
    }, delay);

    const celebrationTimeout = window.setTimeout(() => {
      setResolvedWinner(lastSpin.winnerDisplayName);
      setCelebrating(true);
    }, Math.max(0, completedAt - now));

    return () => {
      window.clearInterval(countdownInterval);
      window.clearTimeout(spinTimeout);
      window.clearTimeout(celebrationTimeout);
    };
  }, [lastSpin]);

  const wheelEntrants = useMemo(
    () => (entrants.length > 0 ? entrants : [{ id: "empty", displayName: "Waiting for entrants" }]),
    [entrants]
  );

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 p-4">
      <ConfettiCanvas active={celebrating} />

      <div className="absolute left-1/2 top-4 z-10 h-0 w-0 -translate-x-1/2 border-l-[16px] border-r-[16px] border-t-[30px] border-l-transparent border-r-transparent border-t-white drop-shadow-[0_12px_24px_rgba(255,255,255,0.25)]" />

      <div className={`relative mx-auto ${compact ? "max-w-[520px]" : "max-w-[640px]"}`}>
        <svg
          viewBox="0 0 500 500"
          className="w-full drop-shadow-[0_36px_80px_rgba(0,0,0,0.5)]"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: duration
              ? `transform ${duration}ms cubic-bezier(0.14, 0.92, 0.17, 1)`
              : "none"
          }}
        >
          <circle cx="250" cy="250" r="240" fill="#09111f" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
          {wheelEntrants.map((entrant, index) => {
            const angle = 360 / wheelEntrants.length;
            const textAngle = index * angle + angle / 2;
            const textPoint = polarToCartesian(250, 250, 165, textAngle);

            return (
              <g key={entrant.id}>
                <path
                  d={describeSegment(index, wheelEntrants.length, 232)}
                  fill={segmentColors[index % segmentColors.length]}
                  stroke="rgba(8,17,33,0.45)"
                  strokeWidth="3"
                />
                <text
                  x={textPoint.x}
                  y={textPoint.y}
                  fill="#06111d"
                  fontSize={compact ? "14" : "16"}
                  fontWeight="700"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textAngle + 90} ${textPoint.x} ${textPoint.y})`}
                >
                  {truncateName(entrant.displayName)}
                </text>
              </g>
            );
          })}
          <circle cx="250" cy="250" r="64" fill="#050816" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
          <text x="250" y="244" textAnchor="middle" fill="#d8f8ff" fontSize={compact ? "18" : "20"} fontWeight="700">
            Giveaway
          </text>
          <text x="250" y="270" textAnchor="middle" fill="#7be5ff" fontSize="14" fontWeight="600">
            {wheelEntrants.length} names
          </text>
        </svg>
      </div>

      <div className="mt-4 text-center">
        {countdown != null && countdown > 0 ? (
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">
            Spin begins in {countdown}
          </p>
        ) : resolvedWinner ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-200/70">
              Latest winner
            </p>
            <p className="font-display text-3xl font-bold text-white sm:text-4xl">{resolvedWinner}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Waiting for the next spin.</p>
        )}
      </div>
    </div>
  );
}
