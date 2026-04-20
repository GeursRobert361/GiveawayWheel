import { legalConfig } from "../../config/legal";
import { LegalLayout } from "../../components/layout/LegalLayout";

export function CookiePolicyPage() {
  return (
    <LegalLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-8 sm:p-12">
        <h1 className="text-4xl font-bold text-white mb-2">Cookie Policy</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: {legalConfig.lastUpdated.cookies}</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-slate-300 leading-relaxed">
              This Cookie Policy explains how {legalConfig.siteName} uses cookies and similar storage technologies when you visit <a href={legalConfig.siteUrl} className="text-violet-400 hover:text-violet-300">{legalConfig.siteUrl}</a>.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              We are committed to transparency about the data we collect and why. This policy provides detailed information about every cookie and storage mechanism our service uses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. What Are Cookies?</h2>
            <p className="text-slate-300 leading-relaxed">
              Cookies are small text files stored on your device (computer, tablet, or mobile) when you visit a website. They help websites remember your preferences, keep you logged in, and provide a personalized experience.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              In addition to cookies, we also use browser local storage to save certain preferences directly in your browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Cookies We Use</h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              We use <strong>strictly necessary</strong> cookies for authentication, <strong>functional</strong> storage for your preferences, and — if you have given consent — <strong>advertising cookies</strong> from Google AdSense. Below is a complete list of all cookies and storage mechanisms used by our service.
            </p>

            <div className="space-y-6">
              {/* Session Cookie */}
              <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">tgw_session</h3>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                    Strictly Necessary
                  </span>
                </div>
                <table className="w-full text-sm">
                  <tbody className="text-slate-300 space-y-2">
                    <tr className="border-b border-slate-700">
                      <td className="py-2 pr-4 font-medium text-slate-400">Provider</td>
                      <td className="py-2">{legalConfig.siteName} (First-party)</td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="py-2 pr-4 font-medium text-slate-400">Purpose</td>
                      <td className="py-2">Maintains your login session and authenticates you across pages</td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="py-2 pr-4 font-medium text-slate-400">Duration</td>
                      <td className="py-2">{legalConfig.sessionCookieDuration} (or until logout)</td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="py-2 pr-4 font-medium text-slate-400">Type</td>
                      <td className="py-2">HTTP-only, Signed, Secure (in production), SameSite=Lax</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium text-slate-400">Consent Required</td>
                      <td className="py-2"><strong className="text-white">No</strong> - Essential for authentication</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* OAuth State Cookie */}
              <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">tgw_oauth_state</h3>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                    Strictly Necessary
                  </span>
                </div>
                <table className="w-full text-sm">
                  <tbody className="text-slate-300 space-y-2">
                    <tr className="border-b border-slate-700">
                      <td className="py-2 pr-4 font-medium text-slate-400">Provider</td>
                      <td className="py-2">{legalConfig.siteName} (First-party)</td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="py-2 pr-4 font-medium text-slate-400">Purpose</td>
                      <td className="py-2">Security token used during Twitch OAuth login to prevent CSRF attacks</td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="py-2 pr-4 font-medium text-slate-400">Duration</td>
                      <td className="py-2">{legalConfig.oauthStateCookieDuration} (temporary, cleared after login)</td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="py-2 pr-4 font-medium text-slate-400">Type</td>
                      <td className="py-2">HTTP-only, Signed, Secure (in production), SameSite=Lax</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium text-slate-400">Consent Required</td>
                      <td className="py-2"><strong className="text-white">No</strong> - Essential for login security</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Browser Local Storage</h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              We use browser local storage to save your preferences. This data stays on your device and is not transmitted to our servers.
            </p>

            <div className="space-y-6">
              {/* Theme Preference */}
              <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">theme</h3>
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/30">
                    Functional
                  </span>
                </div>
                <table className="w-full text-sm">
                  <tbody className="text-slate-300 space-y-2">
                    <tr className="border-b border-slate-700">
                      <td className="py-2 pr-4 font-medium text-slate-400">Provider</td>
                      <td className="py-2">Browser Local Storage (your device only)</td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="py-2 pr-4 font-medium text-slate-400">Purpose</td>
                      <td className="py-2">Remembers whether you prefer light mode or dark mode</td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="py-2 pr-4 font-medium text-slate-400">Duration</td>
                      <td className="py-2">Permanent (until you clear browser data)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium text-slate-400">Consent Required</td>
                      <td className="py-2"><strong className="text-white">No</strong> - User preference you actively set</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Language Preference */}
              <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">i18nextLng</h3>
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/30">
                    Functional
                  </span>
                </div>
                <table className="w-full text-sm">
                  <tbody className="text-slate-300 space-y-2">
                    <tr className="border-b border-slate-700">
                      <td className="py-2 pr-4 font-medium text-slate-400">Provider</td>
                      <td className="py-2">Browser Local Storage (your device only)</td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="py-2 pr-4 font-medium text-slate-400">Purpose</td>
                      <td className="py-2">Remembers your language preference (English, Dutch, Spanish, etc.)</td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="py-2 pr-4 font-medium text-slate-400">Duration</td>
                      <td className="py-2">Permanent (until you clear browser data)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium text-slate-400">Consent Required</td>
                      <td className="py-2"><strong className="text-white">No</strong> - User preference you actively set</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Services</h2>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.1 Google Fonts</h3>
            <p className="text-slate-300 leading-relaxed">
              We load fonts (Inter and Plus Jakarta Sans) from Google Fonts. When your browser requests these fonts, Google may:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Collect your IP address</li>
              <li>Collect browser and device information</li>
              <li>Store font files in your browser cache</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              Google Fonts does not set cookies for tracking purposes. However, font requests are made to <code className="text-violet-400">fonts.googleapis.com</code> and <code className="text-violet-400">fonts.gstatic.com</code>, which are subject to <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Google's Privacy Policy</a>.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.2 Twitch</h3>
            <p className="text-slate-300 leading-relaxed">
              When you authenticate via Twitch OAuth, you are redirected to Twitch's servers. Twitch may set their own cookies during the authentication process. These cookies are controlled by Twitch and subject to <a href="https://www.twitch.tv/p/legal/privacy-notice/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Twitch's Privacy Notice</a>.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.3 Google AdSense</h3>
            <p className="text-slate-300 leading-relaxed">
              We use Google AdSense to display advertisements on certain pages of our service. AdSense may use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Serve ads based on your prior visits to our website or other websites</li>
              <li>Measure ad performance and engagement</li>
              <li>Provide personalized advertising based on your interests</li>
              <li>Prevent the same ads from being shown repeatedly</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              Google's use of advertising cookies enables it and its partners to serve ads based on your visit to this site and/or other sites on the Internet. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Google Ads Settings</a> or <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">aboutads.info</a>.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              For more information about how Google uses data, visit <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Google's Privacy & Terms</a>.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              <strong>Note:</strong> Ads are <strong>not displayed</strong> on overlay pages (OBS browser sources), login pages, or setup pages. Ads only appear on the dashboard, settings, history, and legal pages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Cookie Consent</h2>
            <p className="text-slate-300 leading-relaxed">
              We use two categories of cookies, each with different consent requirements:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li><strong>Strictly necessary &amp; functional cookies</strong> — used without consent (permitted under ePrivacy Directive Article 5(3) and GDPR Recital 47)</li>
              <li><strong>Advertising cookies</strong> from Google AdSense — only placed <strong>after you explicitly accept</strong> via the consent banner shown on ad-enabled pages</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              When you visit a page where ads are displayed, a consent banner will appear. You can:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li><strong>Accept</strong> — advertising cookies are enabled and ads are personalized</li>
              <li><strong>Decline</strong> — no advertising cookies are placed; you can still use all features of the service</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              Your consent choice is stored in your browser's local storage (<code className="text-violet-400">tgw_consent</code>). You can withdraw consent at any time by clearing your browser's local storage or by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Google Ads Settings</a>.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              We implement <strong>Google Consent Mode v2</strong>, which signals your consent decision directly to Google's ad infrastructure, ensuring no personalized ads or ad measurement occurs before consent is granted.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. How to Manage Cookies</h2>
            <p className="text-slate-300 leading-relaxed">
              You can control and delete cookies through your browser settings. However, please note:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Blocking or deleting the <code className="text-violet-400">tgw_session</code> cookie will log you out</li>
              <li>Clearing local storage will reset your theme and language preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">Browser Settings</h3>
            <p className="text-slate-300 leading-relaxed">
              Most browsers allow you to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>View and delete existing cookies</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies (not recommended for our service)</li>
              <li>Clear cookies when you close the browser</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              For instructions on managing cookies in your specific browser, visit:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Edge</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Changes to This Policy</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update this Cookie Policy from time to time. When we make changes, we will update the "Last updated" date at the top of this page. Continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
            <p className="text-slate-300 leading-relaxed">
              If you have questions about this Cookie Policy, please contact us:
            </p>
            <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <p className="text-slate-300"><strong>Email:</strong> <a href={`mailto:${legalConfig.contactEmail}`} className="text-violet-400 hover:text-violet-300">{legalConfig.contactEmail}</a></p>
              <p className="text-slate-300 mt-2"><strong>Website:</strong> <a href={legalConfig.siteUrl} className="text-violet-400 hover:text-violet-300">{legalConfig.siteUrl}</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
    </LegalLayout>
  );
}
