import { cn, formatConnectionStatus } from "../../lib/utils";

export function StatusPill({ status }: { status: "connected" | "reconnecting" | "disconnected" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        status === "connected" && "bg-emerald-500/15 text-emerald-300",
        status === "reconnecting" && "bg-amber-500/15 text-amber-300",
        status === "disconnected" && "bg-rose-500/15 text-rose-300"
      )}
    >
      {formatConnectionStatus(status)}
    </span>
  );
}
