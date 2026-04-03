# Google AdSense Integration

This document explains the AdSense Auto ads implementation for Twitch Giveaway Wheel.

## Configuration

### AdSense Account Details
- **Publisher ID:** `pub-6735227677765546`
- **Client ID:** `ca-pub-6735227677765546`
- **ads.txt:** Located at `/ads.txt` on the live site

### Environment Variables

Add to your `.env` file:
```env
# Set to "false" to disable ads globally (default: enabled)
VITE_ADSENSE_ENABLED=true
```

## Implementation Details

### Files Modified/Created

1. **`frontend/src/config/adsense.ts`** - AdSense configuration and route exclusion logic
2. **`frontend/src/components/ads/AdSenseScript.tsx`** - React component that loads AdSense script
3. **`frontend/src/App.tsx`** - Integrated AdSenseScript component
4. **`frontend/public/ads.txt`** - AdSense verification file
5. **Legal pages updated:**
   - `frontend/src/pages/legal/CookiePolicyPage.tsx`
   - `frontend/src/pages/legal/PrivacyPolicyPage.tsx`

### Route Exclusions

Ads are **NOT** displayed on:
- `/` (login page)
- `/setup` (setup flow)
- `/overlay` (exact match)
- `/overlay/:overlayKey` (any overlay with key)

Ads **ARE** displayed on:
- `/dashboard` (main dashboard)
- `/settings` (settings page)
- `/history` (history page)
- `/legal/*` (all legal pages)

### How It Works

1. **AdSenseScript component** runs on every route change
2. **Route checking:** `isAdsAllowedRoute()` checks if ads are allowed on current route
3. **Script injection:** If allowed, AdSense script is injected into `<head>`
4. **Script removal:** If navigating to excluded route, script is removed
5. **Auto ads:** Google AdSense automatically places ads based on available space

## Customization

### Adding More Excluded Routes

Edit `frontend/src/config/adsense.ts`:

```typescript
excludedRoutes: [
  "/",
  "/setup",
  "/overlay",
  "/your-new-route", // Add here
],
```

### Adding Pattern-Based Exclusions

For dynamic routes, use regex patterns:

```typescript
excludedPatterns: [
  /^\/overlay\/.+$/,
  /^\/your-pattern\/.+$/, // Add here
],
```

### Disabling Ads Globally

Set in `.env`:
```env
VITE_ADSENSE_ENABLED=false
```

Or programmatically in `adsense.ts`:
```typescript
enabled: false,
```

## AdSense Dashboard Setup

After deployment, complete these steps in your Google AdSense account:

1. **Add Your Site:**
   - Go to Sites → Add Site
   - Enter: `wheel.niettegeloven.com`
   - Wait for verification (ads.txt is already in place)

2. **Enable Auto Ads:**
   - Navigate to Ads → Auto ads
   - Select your site
   - Enable "Auto ads"
   - Choose ad formats (recommended: display, in-feed, in-article)
   - **Important:** Enable "Side rail ads" for desktop sidebar ads

3. **Configure Ad Settings:**
   - Ad load: Optimal (or adjust based on UX preference)
   - Ad formats: Enable "Display ads" and "Side rail ads"
   - Ad placement: Let Google optimize automatically

4. **Verify ads.txt:**
   - Check that `https://wheel.niettegeloven.com/ads.txt` is accessible
   - Should show: `google.com, pub-6735227677765546, DIRECT, f08c47fec0942fa0`

## Testing

### Local Testing

AdSense may not load on localhost. To test:
1. Use production build: `npm run build && npm run preview`
2. Or deploy to staging/production server
3. Check browser console for AdSense script load confirmation

### Verification Checklist

- [ ] `ads.txt` accessible at `/ads.txt`
- [ ] AdSense script loads on dashboard (`/dashboard`)
- [ ] AdSense script loads on legal pages (`/legal/*`)
- [ ] AdSense script **does NOT** load on overlay (`/overlay/:key`)
- [ ] AdSense script **does NOT** load on login page (`/`)
- [ ] No console errors related to AdSense
- [ ] Cookie policy updated with AdSense information
- [ ] Privacy policy updated with AdSense information

## Legal Compliance

### Cookie Policy
Updated to include:
- Google AdSense as third-party service
- Advertising cookies explanation
- Opt-out links (Google Ads Settings, aboutads.info)
- Consent requirements note

### Privacy Policy
Updated to include:
- Google AdSense data collection
- Links to Google's privacy policy
- Opt-out instructions

### GDPR Considerations

**Current Status:** Basic consent acknowledgment via continued use

**Recommended (future):** Consider adding a cookie consent banner for EU/UK users:
- Use a library like `react-cookie-consent` or `cookiebot`
- Block AdSense script until consent is given
- Store consent preference in localStorage
- Update `AdSenseScript.tsx` to check consent before loading

## Troubleshooting

### Ads Not Showing

1. **Check if ads are enabled:**
   ```typescript
   // In browser console
   console.log(import.meta.env.VITE_ADSENSE_ENABLED);
   ```

2. **Check current route:**
   ```typescript
   // In browser console
   import { isAdsAllowedRoute } from './config/adsense';
   console.log(isAdsAllowedRoute(window.location.pathname));
   ```

3. **Check script injection:**
   - Open browser DevTools
   - Check `<head>` for script: `script[src*="adsbygoogle.js"]`
   - Look for AdSense console messages

4. **AdSense account status:**
   - Verify site is approved in AdSense dashboard
   - Check for policy violations
   - Ensure ads.txt is verified

### Script Not Loading

- Check browser ad blockers (disable for testing)
- Check Content Security Policy (CSP) settings
- Verify network requests in DevTools Network tab
- Check for JavaScript errors in console

## Maintenance

### Updating AdSense Settings

All AdSense configuration is centralized in:
```
frontend/src/config/adsense.ts
```

### Updating Legal Pages

After making changes to ad behavior, update:
- `frontend/src/pages/legal/CookiePolicyPage.tsx`
- `frontend/src/pages/legal/PrivacyPolicyPage.tsx`

### Monitoring Ad Performance

Track in Google AdSense dashboard:
- Page RPM (revenue per 1000 impressions)
- CTR (click-through rate)
- Coverage (% of pages showing ads)
- Ad requests vs impressions

## Support

- **AdSense Help:** https://support.google.com/adsense
- **Policy Guidelines:** https://support.google.com/adsense/answer/48182
- **Optimization Tips:** https://support.google.com/adsense/topic/9183242
