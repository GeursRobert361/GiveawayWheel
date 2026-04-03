/**
 * Legal Configuration
 *
 * Centralized settings for legal pages and compliance.
 * Update these values as needed for your deployment.
 */

export const legalConfig = {
  // Site Information
  siteName: "Twitch Giveaway Wheel",
  siteUrl: "https://wheel.niettegeloven.com",

  // Operator Information (OWNER REVIEW REQUIRED)
  operatorName: "NIETTEGELOVEN", // Update with legal entity name if different
  operatorCountry: "Netherlands", // Update if different
  contactEmail: "contact@niettegeloven.com", // Update with actual support email

  // Data Retention (based on code analysis)
  sessionCookieDuration: "30 days",
  oauthStateCookieDuration: "10 minutes",

  // Minimum Requirements (OWNER REVIEW REQUIRED)
  minimumAge: 13, // Twitch's minimum age

  // Legal Document Dates (update when making changes)
  lastUpdated: {
    privacy: "2026-04-03",
    cookies: "2026-04-03",
    terms: "2026-04-03",
    giveawayRules: "2026-04-03"
  },

  // Feature Flags
  features: {
    roleWeighting: true,
    duplicateEntries: true,
    followerOnly: true,
    subscriberOnly: true,
    minAccountAge: true,
    minFollowAge: true
  }
} as const;
