import type { PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[30px] border border-white/[0.09] bg-[linear-gradient(160deg,rgba(18,26,50,0.88),rgba(5,8,18,0.92))] p-5 shadow-soft backdrop-blur-xl before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-violet-400/30 before:to-transparent",
        className
      )}
    >
      <div className="relative">{children}</div>
    </section>
  );
}
