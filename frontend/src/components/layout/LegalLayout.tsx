import { Link } from "react-router-dom";
import { legalConfig } from "../../config/legal";
import type { ReactNode } from "react";

interface LegalLayoutProps {
  children: ReactNode;
}

export function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col">
      {/* Simple header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-lg font-bold text-white hover:text-violet-400 transition">
              {legalConfig.siteName}
            </Link>
            <Link to="/" className="text-sm text-slate-400 hover:text-violet-400 transition">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Simple footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 mt-8">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-400">
              <Link to="/legal/privacy" className="hover:text-violet-400 transition">Privacy Policy</Link>
              <Link to="/legal/cookies" className="hover:text-violet-400 transition">Cookie Policy</Link>
              <Link to="/legal/terms" className="hover:text-violet-400 transition">Terms of Service</Link>
              <Link to="/legal/giveaway-rules" className="hover:text-violet-400 transition">Giveaway Rules</Link>
            </div>
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} {legalConfig.operatorName}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
