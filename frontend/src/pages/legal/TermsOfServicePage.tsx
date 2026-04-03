import { legalConfig } from "../../config/legal";
import { LegalLayout } from "../../components/layout/LegalLayout";

export function TermsOfServicePage() {
  return (
    <LegalLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-8 sm:p-12">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: {legalConfig.lastUpdated.terms}</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              By accessing or using {legalConfig.siteName} (the "Service") at <a href={legalConfig.siteUrl} className="text-violet-400 hover:text-violet-300">{legalConfig.siteUrl}</a>, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              These Terms constitute a legally binding agreement between you and {legalConfig.operatorName} ("we", "us", "our"). We reserve the right to modify these Terms at any time. Your continued use of the Service after changes are posted constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p className="text-slate-300 leading-relaxed">
              {legalConfig.siteName} is a web-based tool that enables Twitch streamers to run giveaways using an interactive spinning wheel. The Service provides features including:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Authentication via Twitch OAuth</li>
              <li>Chat command integration for giveaway entry and exit</li>
              <li>Automated entrant tracking with role-based weighting</li>
              <li>Random winner selection using a visual spinning wheel</li>
              <li>OBS browser source integration for stream overlays</li>
              <li>Giveaway session management and winner history</li>
              <li>Customizable entry rules and restrictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Eligibility</h2>
            <p className="text-slate-300 leading-relaxed">
              You must be at least {legalConfig.minimumAge} years old to use the Service. By using the Service, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              You must have a valid Twitch account to use the Service. Your use of Twitch is subject to <a href="https://www.twitch.tv/p/legal/terms-of-service/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Twitch's Terms of Service</a> and <a href="https://www.twitch.tv/p/legal/community-guidelines/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Community Guidelines</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Account Responsibilities</h2>
            <p className="text-slate-300 leading-relaxed">
              When you authenticate via Twitch OAuth, you grant us permission to access certain information from your Twitch account as described in our <a href="/legal/privacy" className="text-violet-400 hover:text-violet-300">Privacy Policy</a>.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Maintaining the security of your Twitch account</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Ensuring your use complies with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Acceptable Use</h2>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.1 Permitted Use</h3>
            <p className="text-slate-300 leading-relaxed">
              You may use the Service to run fair and transparent giveaways on your Twitch channel in accordance with these Terms, our Giveaway Rules, and applicable laws.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.2 Prohibited Conduct</h3>
            <p className="text-slate-300 leading-relaxed">
              You agree <strong>NOT</strong> to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Use the Service to run fraudulent, deceptive, or illegal giveaways</li>
              <li>Manipulate giveaway results or interfere with the fairness of draws</li>
              <li>Abuse, harass, or discriminate against other users or entrants</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
              <li>Use automated tools, bots, or scripts to manipulate the Service</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Violate Twitch's Terms of Service or Community Guidelines</li>
              <li>Use the Service in any way that violates applicable laws or regulations</li>
              <li>Impersonate any person or entity, or misrepresent your affiliation</li>
              <li>Transmit viruses, malware, or other harmful code</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Collect or harvest personal data from other users without consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Giveaway Responsibilities</h2>
            <p className="text-slate-300 leading-relaxed">
              As a streamer using our Service to run giveaways, you are solely responsible for:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Complying with all applicable laws, including promotional and sweepstakes laws</li>
              <li>Clearly communicating giveaway rules and eligibility to your viewers</li>
              <li>Providing and delivering any prizes you offer</li>
              <li>Handling winner verification and prize fulfillment</li>
              <li>Obtaining any necessary permissions or licenses for your giveaways</li>
              <li>Complying with Twitch's policies regarding on-platform promotions</li>
              <li>Paying any applicable taxes related to prizes or giveaways</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              We provide the tool for random selection only. We are not responsible for prize fulfillment, disputes, or compliance with promotional laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
            <p className="text-slate-300 leading-relaxed">
              The Service, including its design, code, graphics, logos, and features, is owned by {legalConfig.operatorName} and protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              You may not copy, modify, distribute, sell, or lease any part of our Service without our explicit written permission.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              Twitch and all associated trademarks are the property of Twitch Interactive, Inc. We are not affiliated with, endorsed by, or sponsored by Twitch.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Service Availability</h2>
            <p className="text-slate-300 leading-relaxed">
              We strive to keep the Service available and reliable, but we do not guarantee uninterrupted or error-free operation. The Service is provided "as is" and "as available."
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              We may:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Modify, suspend, or discontinue the Service (or any part of it) at any time</li>
              <li>Perform scheduled or emergency maintenance</li>
              <li>Experience downtime due to technical issues or third-party dependencies (e.g., Twitch API)</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              We are not liable for any loss or damage resulting from service interruptions, downtime, or changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Third-Party Services</h2>
            <p className="text-slate-300 leading-relaxed">
              The Service integrates with Twitch and other third-party services. Your use of these third-party services is subject to their own terms and policies. We are not responsible for the availability, accuracy, or reliability of third-party services.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              If Twitch changes its API, terms, or policies in a way that affects the Service, we may need to modify or discontinue certain features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Data and Privacy</h2>
            <p className="text-slate-300 leading-relaxed">
              Your use of the Service is also governed by our <a href="/legal/privacy" className="text-violet-400 hover:text-violet-300">Privacy Policy</a> and <a href="/legal/cookies" className="text-violet-400 hover:text-violet-300">Cookie Policy</a>, which explain how we collect, use, and protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Termination</h2>
            <p className="text-slate-300 leading-relaxed">
              We reserve the right to suspend or terminate your access to the Service at any time, with or without notice, for:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Violation of these Terms or applicable laws</li>
              <li>Fraudulent, abusive, or harmful behavior</li>
              <li>Extended inactivity</li>
              <li>Any other reason at our sole discretion</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              You may stop using the Service at any time. Upon termination, your right to access and use the Service immediately ceases.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Disclaimers</h2>
            <p className="text-slate-300 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              WE DO NOT WARRANT THAT:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>The Service will be uninterrupted, secure, or error-free</li>
              <li>Results obtained from the Service will be accurate or reliable</li>
              <li>Any errors or defects will be corrected</li>
              <li>The Service will meet your specific requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, {legalConfig.operatorName.toUpperCase()} AND ITS AFFILIATES, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Loss of profits, revenue, data, or use</li>
              <li>Giveaway disputes or prize fulfillment issues</li>
              <li>Service interruptions or errors</li>
              <li>Unauthorized access to your account</li>
              <li>Errors in winner selection (though we use industry-standard randomization)</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS (IF ANY).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">14. Indemnification</h2>
            <p className="text-slate-300 leading-relaxed">
              You agree to indemnify, defend, and hold harmless {legalConfig.operatorName} and its affiliates from any claims, losses, liabilities, damages, costs, and expenses (including reasonable attorney fees) arising from:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your giveaways, including prize fulfillment and legal compliance</li>
              <li>Your violation of any third-party rights</li>
              <li>Your violation of applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">15. Governing Law and Disputes</h2>
            <p className="text-slate-300 leading-relaxed">
              These Terms are governed by the laws of {legalConfig.operatorCountry}, without regard to conflict of law principles.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              Any disputes arising from these Terms or your use of the Service should first be attempted to be resolved informally by contacting us at <a href={`mailto:${legalConfig.contactEmail}`} className="text-violet-400 hover:text-violet-300">{legalConfig.contactEmail}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">16. Severability</h2>
            <p className="text-slate-300 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">17. Changes to Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update these Terms from time to time. When we make significant changes, we will update the "Last updated" date and may notify you via the Service or email.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              Your continued use of the Service after changes are posted constitutes acceptance of the modified Terms. If you do not agree to the changes, you must stop using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">18. Contact Information</h2>
            <p className="text-slate-300 leading-relaxed">
              If you have questions about these Terms, please contact us:
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
