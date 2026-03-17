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
        "relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(4,7,17,0.88))] shadow-soft backdrop-blur-xl",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left sm:px-6"
        onClick={() => setOpen((current) => !current)}
      >
        <div>
          {kicker ? (
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-200/70">{kicker}</p>
          ) : null}
          <h3 className="mt-2 text-xl font-bold text-white">{title}</h3>
          {description ? <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p> : null}
        </div>

        <div className="flex items-center gap-3">
          {actions}
          <span
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-slate-200 transition",
              open && "rotate-90 bg-brand-300/10 text-brand-100"
            )}
            aria-hidden="true"
          >
            &gt;
          </span>
        </div>
      </button>

      {open ? <div className="border-t border-white/10 px-5 pb-5 pt-4 sm:px-6">{children}</div> : null}
    </section>
  );
}
