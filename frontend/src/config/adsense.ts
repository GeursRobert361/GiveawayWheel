/**
 * Google AdSense Configuration
 *
 * Centralized settings for AdSense Auto ads integration.
 * Update ADSENSE_ENABLED in .env to enable/disable ads.
 */

export const adsenseConfig = {
  // AdSense publisher/client ID
  clientId: "ca-pub-6735227677765546",

  // Enable/disable ads globally (can be overridden by env variable)
  enabled: import.meta.env.VITE_ADSENSE_ENABLED !== "false",

  // Routes where ads should NOT be displayed
  excludedRoutes: [
    "/", // Login page
    "/setup", // Setup flow
    "/overlay", // OBS overlay (exact match)
  ] as string[],

  // Route patterns where ads should NOT be displayed (regex patterns)
  excludedPatterns: [
    /^\/overlay\/.+$/, // Any overlay with key: /overlay/:overlayKey
  ],
};

/**
 * Check if ads are allowed on the current route
 * @param pathname - Current URL pathname
 * @returns true if ads should be displayed, false otherwise
 */
export function isAdsAllowedRoute(pathname: string): boolean {
  if (!adsenseConfig.enabled) {
    return false;
  }

  // Check exact route exclusions
  if (adsenseConfig.excludedRoutes.includes(pathname)) {
    return false;
  }

  // Check pattern exclusions
  for (const pattern of adsenseConfig.excludedPatterns) {
    if (pattern.test(pathname)) {
      return false;
    }
  }

  // Allow ads on all other routes
  return true;
}
