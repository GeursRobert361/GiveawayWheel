/**
 * GDPR Consent Banner
 *
 * Shown once when a user visits a page where ads are displayed and no prior
 * consent decision has been recorded. Implements opt-in (not implied consent),
 * as required by GDPR Article 7 and the ePrivacy Directive for advertising cookies.
 *
 * The banner is intentionally minimal — it does not block access to the site.
 * Users can decline and continue using the service without personalized ads.
 */

import { useLocation } from "react-router-dom";
import { useConsent } from "../../contexts/ConsentContext";
import { isAdsAllowedRoute } from "../../config/adsense";

export function ConsentBanner() {
  const { status, grantConsent, denyConsent } = useConsent();
  const { pathname } = useLocation();

  // Only show on routes where ads appear and when no decision has been made yet
  if (status !== "pending") return null;
  if (!isAdsAllowedRoute(pathname)) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-sm sm:flex sm:items-center sm:gap-4">
        <p className="flex-1 text-sm leading-relaxed text-slate-300">
          We use{" "}
          <a href="/legal/cookies" className="text-violet-400 underline hover:text-violet-300">
            advertising cookies
          </a>{" "}
          (Google AdSense) to keep this service free. You can decline and still use all features.
        </p>
        <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
          <button
            onClick={denyConsent}
            className="rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500"
          >
            Decline
          </button>
          <button
            onClick={grantConsent}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
