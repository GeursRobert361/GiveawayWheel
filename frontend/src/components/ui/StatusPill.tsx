import { cn, formatConnectionStatus } from "../../lib/utils";

export function StatusPill({ status }: { status: "connected" | "reconnecting" | "disconnected" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]",
        status === "connected" && "border-emerald-400/25 bg-emerald-500/[0.12] text-emerald-300",
        status === "reconnecting" && "border-amber-400/25 bg-amber-500/[0.12] text-amber-300",
        status === "disconnected" && "border-rose-400/25 bg-rose-500/[0.12] text-rose-300"
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          status === "connected" && "animate-pulse bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]",
          status === "reconnecting" && "animate-pulse bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]",
          status === "disconnected" && "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.7)]"
        )}
      />
      {formatConnectionStatus(status)}
    </span>
  );
}
