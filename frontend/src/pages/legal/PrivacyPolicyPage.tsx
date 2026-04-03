import { legalConfig } from "../../config/legal";
import { LegalLayout } from "../../components/layout/LegalLayout";

export function PrivacyPolicyPage() {
  return (
    <LegalLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-8 sm:p-12">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: {legalConfig.lastUpdated.privacy}</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-slate-300 leading-relaxed">
              {legalConfig.siteName} ("<strong>we</strong>", "<strong>us</strong>", or "<strong>our</strong>") is a web-based tool that enables Twitch streamers to run giveaways using an interactive spinning wheel. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our service at <a href={legalConfig.siteUrl} className="text-violet-400 hover:text-violet-300">{legalConfig.siteUrl}</a>.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              We are committed to protecting your privacy and handling your data responsibly. We only collect and process data that is necessary to provide you with our giveaway tool and related features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.1 Information from Twitch</h3>
            <p className="text-slate-300 leading-relaxed">
              When you log in via Twitch OAuth, we receive and store:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Twitch User ID</li>
              <li>Username (login name)</li>
              <li>Display name</li>
              <li>Profile image URL</li>
              <li>Broadcaster type (if applicable)</li>
              <li>Email address (if provided by Twitch)</li>
              <li>Channel information (channel ID, login, name)</li>
              <li>OAuth access and refresh tokens (encrypted)</li>
              <li>OAuth scopes granted</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.2 Giveaway Data</h3>
            <p className="text-slate-300 leading-relaxed">
              When you run giveaways, we collect and store:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li><strong>Giveaway sessions:</strong> Title, entry/leave commands, status (open/closed), configuration settings</li>
              <li><strong>Entrants:</strong> Twitch username, display name, user ID (if available), role information (follower, subscriber, VIP, moderator), account creation date, entry count</li>
              <li><strong>Winners:</strong> Username, display name, Twitch user ID, selected weight, timestamp</li>
              <li><strong>Settings:</strong> Role weight multipliers, user-specific weight overrides, blocklists</li>
              <li><strong>Audit logs:</strong> Actions taken on your giveaway (opens, closes, spins, rerolls) with timestamps</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.3 Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li><strong>Session cookies:</strong> Authentication and security (see Cookie Policy)</li>
              <li><strong>User preferences:</strong> Theme (light/dark mode) and language selection stored in browser local storage</li>
              <li><strong>Connection logs:</strong> Twitch EventSub connection status, reconnection attempts, errors</li>
              <li><strong>Server logs:</strong> HTTP requests for error diagnosis and security (IP addresses may be logged temporarily)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-300 leading-relaxed">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li><strong>Authentication:</strong> To verify your identity and maintain your login session</li>
              <li><strong>Giveaway functionality:</strong> To track entrants, manage weights, select winners, and display results</li>
              <li><strong>Real-time updates:</strong> To listen for chat commands and follower/subscriber events via Twitch EventSub</li>
              <li><strong>Customization:</strong> To apply your preferences (theme, language, giveaway rules)</li>
              <li><strong>Security:</strong> To prevent fraud, abuse, and unauthorized access</li>
              <li><strong>Service improvement:</strong> To troubleshoot issues and maintain service quality</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              <strong>We do not use your data for advertising, marketing, or third-party analytics.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Legal Basis for Processing (GDPR)</h2>
            <p className="text-slate-300 leading-relaxed">
              If you are located in the European Economic Area (EEA), UK, or Switzerland, we process your personal data based on the following legal grounds:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li><strong>Contractual necessity:</strong> Processing is necessary to provide you with the giveaway tool and features you requested</li>
              <li><strong>Legitimate interests:</strong> We have a legitimate interest in maintaining security, preventing fraud, and improving our service</li>
              <li><strong>Consent:</strong> Where required, such as for optional features or communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing and Third Parties</h2>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.1 Twitch</h3>
            <p className="text-slate-300 leading-relaxed">
              We integrate with Twitch using their official OAuth and API. Your Twitch data is obtained directly from Twitch with your explicit authorization. We use Twitch EventSub to receive real-time notifications about chat messages, followers, and subscribers.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.2 Google Fonts</h3>
            <p className="text-slate-300 leading-relaxed">
              We load fonts (Inter and Plus Jakarta Sans) from Google Fonts CDN. When you visit our site, your browser may send requests to <code className="text-violet-400">fonts.googleapis.com</code> and <code className="text-violet-400">fonts.gstatic.com</code>. Google may collect technical information such as IP address and user agent. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Google's Privacy Policy</a>.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.3 No Other Third Parties</h3>
            <p className="text-slate-300 leading-relaxed">
              We do <strong>not</strong> share your personal data with advertisers, data brokers, or analytics companies. We do <strong>not</strong> sell your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
            <p className="text-slate-300 leading-relaxed">
              We retain your data as follows:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li><strong>Account data:</strong> Retained while your account is active</li>
              <li><strong>Session cookies:</strong> {legalConfig.sessionCookieDuration} or until you log out</li>
              <li><strong>OAuth state cookies:</strong> {legalConfig.oauthStateCookieDuration} (temporary security token)</li>
              <li><strong>Giveaway sessions:</strong> Retained until you delete them or delete your account</li>
              <li><strong>Winner history:</strong> Retained until you delete it or delete your account</li>
              <li><strong>Audit logs:</strong> Retained for security and troubleshooting purposes</li>
              <li><strong>User preferences (theme/language):</strong> Stored in your browser until you clear browser data</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              When you delete your account or log out and request data deletion, we will permanently remove your personal data from our systems within a reasonable timeframe, except where we are legally required to retain certain information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights</h2>
            <p className="text-slate-300 leading-relaxed">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
              <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
              <li><strong>Restriction:</strong> Request that we limit how we process your data</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Withdraw consent:</strong> Where processing is based on consent, you may withdraw it at any time</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              To exercise these rights, contact us at <a href={`mailto:${legalConfig.contactEmail}`} className="text-violet-400 hover:text-violet-300">{legalConfig.contactEmail}</a>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Data Security</h2>
            <p className="text-slate-300 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal data:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>OAuth tokens are encrypted at rest in our database</li>
              <li>Session cookies are HTTP-only, signed, and use SameSite protection</li>
              <li>HTTPS encryption for all data in transit</li>
              <li>Access controls and secure authentication</li>
              <li>Regular security updates and monitoring</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              While we strive to protect your data, no method of transmission or storage is 100% secure. You use the service at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. International Transfers</h2>
            <p className="text-slate-300 leading-relaxed">
              Our service is hosted in {legalConfig.operatorCountry}. If you access our service from outside this region, your data may be transferred to and processed in {legalConfig.operatorCountry}. We take appropriate safeguards to ensure your data remains protected in accordance with this Privacy Policy and applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Children's Privacy</h2>
            <p className="text-slate-300 leading-relaxed">
              Our service is not directed to individuals under the age of {legalConfig.minimumAge}. We do not knowingly collect personal information from children. If you believe we have collected data from someone under {legalConfig.minimumAge}, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Policy</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update this Privacy Policy from time to time. When we make significant changes, we will update the "Last updated" date at the top of this page. Continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
            <p className="text-slate-300 leading-relaxed">
              If you have questions about this Privacy Policy or how we handle your data, please contact us:
            </p>
            <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <p className="text-slate-300"><strong>Email:</strong> <a href={`mailto:${legalConfig.contactEmail}`} className="text-violet-400 hover:text-violet-300">{legalConfig.contactEmail}</a></p>
              <p className="text-slate-300 mt-2"><strong>Operator:</strong> {legalConfig.operatorName}</p>
              <p className="text-slate-300 mt-2"><strong>Website:</strong> <a href={legalConfig.siteUrl} className="text-violet-400 hover:text-violet-300">{legalConfig.siteUrl}</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
    </LegalLayout>
  );
}
