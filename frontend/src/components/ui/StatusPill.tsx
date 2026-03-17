import { cn, formatConnectionStatus } from "../../lib/utils";

export function StatusPill({ status }: { status: "connected" | "reconnecting" | "disconnected" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]",
        status === "connected" && "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
        status === "reconnecting" && "border-amber-400/25 bg-amber-500/10 text-amber-200",
        status === "disconnected" && "border-rose-400/25 bg-rose-500/10 text-rose-200"
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          status === "connected" && "bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]",
          status === "reconnecting" && "bg-amber-300 shadow-[0_0_16px_rgba(252,211,77,0.8)]",
          status === "disconnected" && "bg-rose-300 shadow-[0_0_16px_rgba(253,164,175,0.8)]"
        )}
      />
      {formatConnectionStatus(status)}
    </span>
  );
}
