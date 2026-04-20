/**
 * Google AdSense Configuration
 *
 * Publisher ID and enabled flag are read from environment variables.
 * Never hardcode the publisher ID in source — configure via VITE_ADSENSE_CLIENT_ID.
 */

export const adsenseConfig = {
  // Set VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX in your .env
  clientId: import.meta.env.VITE_ADSENSE_CLIENT_ID ?? "",

  enabled: import.meta.env.VITE_ADSENSE_ENABLED !== "false",

  excludedRoutes: [
    "/",        // Login page
    "/setup",   // Setup flow
    "/overlay", // OBS overlay (exact match)
  ] as string[],

  excludedPatterns: [
    /^\/overlay\/.+$/, // /overlay/:overlayKey
  ],
};

/**
 * Returns true only if ads are permitted on the given route.
 * Does NOT check consent — that is handled in AdSenseScript and ConsentContext.
 */
export function isAdsAllowedRoute(pathname: string): boolean {
  if (!adsenseConfig.enabled) return false;
  if (adsenseConfig.excludedRoutes.includes(pathname)) return false;
  for (const pattern of adsenseConfig.excludedPatterns) {
    if (pattern.test(pathname)) return false;
  }
  return true;
}
