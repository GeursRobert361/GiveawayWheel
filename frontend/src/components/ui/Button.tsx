import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
  }
>;

const variantMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "border border-brand-200/30 bg-[linear-gradient(135deg,#7be5ff_0%,#1ac0f5_45%,#ffcc4d_120%)] text-slate-950 shadow-[0_18px_45px_rgba(26,192,245,0.3)] hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(26,192,245,0.4)]",
  secondary:
    "border border-white/10 bg-white/[0.07] text-white hover:-translate-y-0.5 hover:border-brand-200/30 hover:bg-white/[0.12]",
  ghost: "border border-transparent bg-transparent text-slate-200 hover:bg-white/5",
  danger:
    "border border-rose-300/20 bg-[linear-gradient(135deg,rgba(251,113,133,0.95),rgba(225,29,72,0.92))] text-white hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(225,29,72,0.35)]"
};

export function Button({ className, variant = "primary", children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variantMap[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
