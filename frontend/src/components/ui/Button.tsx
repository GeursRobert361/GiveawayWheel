import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
  }
>;

const variantMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "border border-violet-500/50 bg-violet-600 text-white hover:bg-violet-500 active:bg-violet-700",
  secondary:
    "border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-750 hover:border-slate-600 active:bg-slate-800",
  ghost: "border border-transparent bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50 active:bg-slate-800/30",
  danger:
    "border border-rose-500/50 bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700"
};

export function Button({ className, variant = "primary", children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        variantMap[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
