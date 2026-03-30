import { cn, formatConnectionStatus } from "../../lib/utils";

export function StatusPill({ status }: { status: "connected" | "reconnecting" | "disconnected" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-wide",
        status === "connected" && "border-emerald-500/40 bg-emerald-500/[0.15] text-emerald-300",
        status === "reconnecting" && "border-amber-500/40 bg-amber-500/[0.15] text-amber-300",
        status === "disconnected" && "border-rose-500/40 bg-rose-500/[0.15] text-rose-300"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "connected" && "animate-pulse bg-emerald-400",
          status === "reconnecting" && "animate-pulse bg-amber-400",
          status === "disconnected" && "bg-rose-400"
        )}
      />
      {formatConnectionStatus(status)}
    </span>
  );
}
