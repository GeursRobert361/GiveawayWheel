import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
  }
>;

const variantMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-brand-400 text-slate-950 hover:bg-brand-300 shadow-[0_12px_32px_rgba(26,192,245,0.35)]",
  secondary: "bg-slate-800 text-white hover:bg-slate-700",
  ghost: "bg-transparent text-slate-200 hover:bg-white/5",
  danger: "bg-rose-500 text-white hover:bg-rose-400"
};

export function Button({ className, variant = "primary", children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variantMap[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
