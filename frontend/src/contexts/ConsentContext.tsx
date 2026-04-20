/**
 * GDPR Consent Context — manages advertising consent state.
 *
 * Consent is stored in localStorage under STORAGE_KEY.
 * On consent change, Google Consent Mode v2 signals are updated via gtag().
 * The gtag() function is initialized in index.html before React loads.
 *
 * Bump CONSENT_VERSION when the privacy/cookie policy changes significantly
 * to prompt users to re-consent.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ConsentStatus = "pending" | "granted" | "denied";

const STORAGE_KEY = "tgw_consent";
const CONSENT_VERSION = "1";

interface ConsentContextValue {
  status: ConsentStatus;
  grantConsent: () => void;
  denyConsent: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

function readStoredConsent(): ConsentStatus {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return "pending";
    const parsed = JSON.parse(raw) as { status: ConsentStatus; version: string };
    // Re-ask when policy version changes
    if (parsed.version !== CONSENT_VERSION) return "pending";
    return parsed.status;
  } catch {
    return "pending";
  }
}

function pushGtagConsent(granted: boolean) {
  // gtag is defined globally in index.html; guard for SSR/test environments
  if (typeof window === "undefined") return;
  const w = window as Window & { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag !== "function") return;
  w.gtag("consent", "update", {
    ad_storage:         granted ? "granted" : "denied",
    ad_user_data:       granted ? "granted" : "denied",
    ad_personalization: granted ? "granted" : "denied",
  });
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConsentStatus>(readStoredConsent);

  // Sync gtag on mount for returning visitors who already consented/declined
  useEffect(() => {
    if (status !== "pending") {
      pushGtagConsent(status === "granted");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function grantConsent() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: "granted", version: CONSENT_VERSION }));
    pushGtagConsent(true);
    setStatus("granted");
  }

  function denyConsent() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: "denied", version: CONSENT_VERSION }));
    pushGtagConsent(false);
    setStatus("denied");
  }

  return (
    <ConsentContext.Provider value={{ status, grantConsent, denyConsent }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used inside <ConsentProvider>");
  return ctx;
}
