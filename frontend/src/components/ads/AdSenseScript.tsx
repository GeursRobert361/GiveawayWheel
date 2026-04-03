import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { adsenseConfig, isAdsAllowedRoute } from "../../config/adsense";

/**
 * AdSense Auto Ads Integration Component
 *
 * Conditionally loads Google AdSense script based on current route.
 * Excludes overlay routes, auth routes, and other specified paths.
 *
 * Usage: Add <AdSenseScript /> once at the app root level
 */
export function AdSenseScript() {
  const location = useLocation();

  useEffect(() => {
    // Check if ads are allowed on current route
    const adsAllowed = isAdsAllowedRoute(location.pathname);

    if (!adsAllowed) {
      // Remove script if navigating to excluded route
      const existingScript = document.querySelector(
        'script[src*="adsbygoogle.js"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
      return;
    }

    // Check if script is already loaded
    const existingScript = document.querySelector(
      'script[src*="adsbygoogle.js"]'
    );
    if (existingScript) {
      return; // Script already loaded
    }

    // Create and inject AdSense script
    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseConfig.clientId}`;
    script.async = true;
    script.crossOrigin = "anonymous";

    // Add error handling
    script.onerror = () => {
      console.warn("AdSense script failed to load");
    };

    // Append to head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Note: We don't remove the script on unmount since it's shared across routes
      // Only remove when navigating to excluded routes (handled above)
    };
  }, [location.pathname]);

  // This component doesn't render anything
  return null;
}
