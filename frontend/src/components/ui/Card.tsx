import type { PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-lg border border-slate-700/70 bg-slate-900/95 p-4 shadow-sm",
        className
      )}
    >
      {children}
    </section>
  );
}
