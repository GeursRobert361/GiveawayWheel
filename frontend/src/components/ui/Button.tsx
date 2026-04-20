import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    loading?: boolean;
  }
>;

const variantMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "border border-violet-500/50 bg-violet-600 text-white hover:bg-violet-500 active:bg-violet-700",
  secondary:
    "border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-750 hover:border-slate-600 active:bg-slate-900",
  ghost:
    "border border-transparent bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50 active:bg-slate-800/30",
  danger:
    "border border-rose-500/50 bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700",
};

export function Button({
  className,
  variant = "primary",
  loading = false,
  disabled,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantMap[variant],
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
