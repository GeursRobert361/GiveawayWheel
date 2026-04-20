import type { PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

export type AlertVariant = "error" | "warning" | "success" | "info";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  className?: string;
}

const styles: Record<AlertVariant, { wrapper: string; icon: string; d: string }> = {
  error: {
    wrapper: "border-rose-400/20 bg-rose-500/[0.08] text-rose-200",
    icon: "text-rose-400",
    d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  },
  warning: {
    wrapper: "border-amber-400/20 bg-amber-500/[0.08] text-amber-200",
    icon: "text-amber-400",
    d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  },
  success: {
    wrapper: "border-emerald-400/20 bg-emerald-500/[0.08] text-emerald-200",
    icon: "text-emerald-400",
    d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  info: {
    wrapper: "border-violet-400/20 bg-violet-500/[0.08] text-violet-200",
    icon: "text-violet-400",
    d: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
  },
};

export function Alert({
  variant = "info",
  title,
  className,
  children,
}: PropsWithChildren<AlertProps>) {
  const s = styles[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
        s.wrapper,
        className
      )}
    >
      <svg
        className={cn("mt-0.5 h-4 w-4 shrink-0", s.icon)}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={s.d} />
      </svg>
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && (
          <p className={title ? "mt-0.5 opacity-85" : ""}>{children}</p>
        )}
      </div>
    </div>
  );
}
