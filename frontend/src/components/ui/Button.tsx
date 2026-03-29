import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
  }
>;

const variantMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "border border-violet-400/25 bg-[linear-gradient(135deg,#a78bfa_0%,#7c3aed_55%,#4c1d95_115%)] text-white shadow-[0_16px_40px_rgba(124,58,237,0.35)] hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(124,58,237,0.5)] active:translate-y-0 active:shadow-[0_10px_25px_rgba(124,58,237,0.25)]",
  secondary:
    "border border-white/[0.12] bg-white/[0.06] text-slate-100 hover:-translate-y-0.5 hover:border-white/[0.2] hover:bg-white/[0.1] active:translate-y-0",
  ghost: "border border-transparent bg-transparent text-slate-300 hover:bg-white/[0.07] hover:text-white active:bg-white/[0.04]",
  danger:
    "border border-rose-400/20 bg-[linear-gradient(135deg,rgba(244,63,94,0.9),rgba(190,18,60,0.95))] text-white shadow-[0_14px_35px_rgba(190,18,60,0.25)] hover:-translate-y-0.5 hover:shadow-[0_20px_46px_rgba(190,18,60,0.4)] active:translate-y-0"
};

export function Button({ className, variant = "primary", children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variantMap[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
