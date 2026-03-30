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
        "relative overflow-hidden rounded-lg border border-slate-700/70 bg-slate-900/95 shadow-sm",
        className
      )}
    >
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-slate-800/60 sm:px-5"
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
              "inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-sm font-bold text-slate-300 transition-all duration-200",
              open && "rotate-90 border-violet-500/50 bg-violet-600/20 text-violet-300"
            )}
            aria-hidden="true"
          >
            ›
          </span>
        </div>
      </button>

      {open ? <div className="border-t border-slate-800 px-4 pb-4 pt-4 sm:px-5">{children}</div> : null}
    </section>
  );
}
