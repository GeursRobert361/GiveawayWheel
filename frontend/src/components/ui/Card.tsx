import type { PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-soft backdrop-blur",
        className
      )}
    >
      {children}
    </section>
  );
}
