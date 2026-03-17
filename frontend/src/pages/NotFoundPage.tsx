import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="rounded-[28px] border border-white/10 bg-slate-900/80 px-8 py-7 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-200/70">404</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Page not found</h1>
        <Link
          to="/"
          className="mt-5 inline-flex rounded-2xl bg-brand-400 px-4 py-2 text-sm font-semibold text-slate-950"
        >
          Back to app
        </Link>
      </div>
    </div>
  );
}
