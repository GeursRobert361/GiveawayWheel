import { useState, type PropsWithChildren, type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface DisclosurePanelProps {
  kicker?: string;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  actions?: ReactNode;
  className?: string;
}

export function DisclosurePanel({
  kicker,
  title,
  description,
  defaultOpen = false,
  actions,
  className,
  children
}: PropsWithChildren<DisclosurePanelProps>) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[30px] border border-white/[0.09] bg-[linear-gradient(160deg,rgba(18,26,50,0.88),rgba(5,8,18,0.92))] shadow-soft backdrop-blur-xl",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition hover:bg-white/[0.02] sm:px-6"
        onClick={() => setOpen((current) => !current)}
      >
        <div>
          {kicker ? (
            <p className="section-kicker">{kicker}</p>
          ) : null}
          <h3 className="mt-2 text-xl font-bold text-white">{title}</h3>
          {description ? <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p> : null}
        </div>

        <div className="flex items-center gap-3">
          {actions}
          <span
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-sm font-bold text-slate-300 transition duration-200",
              open && "rotate-90 border-violet-400/30 bg-violet-500/[0.12] text-violet-300"
            )}
            aria-hidden="true"
          >
            ›
          </span>
        </div>
      </button>

      {open ? <div className="border-t border-white/[0.08] px-5 pb-5 pt-4 sm:px-6">{children}</div> : null}
    </section>
  );
}
