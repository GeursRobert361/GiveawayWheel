/**
 * AdSense Auto Ads Integration
 *
 * Loads the Google AdSense script only when:
 *   1. The current route permits ads (excludes overlay, login, setup)
 *   2. The user has granted advertising consent (GDPR requirement for EEA)
 *
 * Uses Auto Ads — Google determines placement automatically.
 * No manual ad-unit markup needed.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { adsenseConfig, isAdsAllowedRoute } from "../../config/adsense";
import { useConsent } from "../../contexts/ConsentContext";

const SCRIPT_SELECTOR = 'script[src*="adsbygoogle.js"]';

export function AdSenseScript() {
  const { pathname } = useLocation();
  const { status } = useConsent();

  useEffect(() => {
    const allowed = isAdsAllowedRoute(pathname) && status === "granted";

    if (!allowed) {
      // Remove script when navigating to an excluded route or when consent is withdrawn
      document.querySelector(SCRIPT_SELECTOR)?.remove();
      return;
    }

    if (document.querySelector(SCRIPT_SELECTOR)) return; // Already loaded

    if (!adsenseConfig.clientId) {
      // Fail loudly in development so missing env var is caught early
      console.warn("[AdSense] VITE_ADSENSE_CLIENT_ID is not set — ads will not load.");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseConfig.clientId}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onerror = () => console.warn("[AdSense] Script failed to load — likely blocked by an ad blocker.");
    document.head.appendChild(script);
  }, [pathname, status]);

  return null;
}
