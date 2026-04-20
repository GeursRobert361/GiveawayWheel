import type { PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

export type BadgeVariant = "default" | "violet" | "emerald" | "amber" | "rose" | "brand";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "border-slate-700/70 bg-slate-800/60 text-slate-300",
  violet:  "border-violet-500/30 bg-violet-500/20 text-violet-300",
  emerald: "border-emerald-500/30 bg-emerald-500/20 text-emerald-300",
  amber:   "border-amber-500/30 bg-amber-500/20 text-amber-300",
  rose:    "border-rose-500/30 bg-rose-500/20 text-rose-300",
  brand:   "border-brand-500/30 bg-brand-500/20 text-brand-300",
};

export function Badge({
  variant = "default",
  className,
  children,
}: PropsWithChildren<BadgeProps>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
