import { cn } from "../../lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-slate-800/60", className)}
    />
  );
}

export function SkeletonLine({ className }: { className?: string }) {
  return <Skeleton className={cn("h-3.5 rounded", className)} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-lg border border-slate-700/70 bg-slate-800/40 px-4 py-4",
        className
      )}
    >
      <SkeletonLine className="mb-2.5 w-2/3" />
      <SkeletonLine className="mb-1.5 w-1/2" />
      <SkeletonLine className="w-1/3" />
    </div>
  );
}
