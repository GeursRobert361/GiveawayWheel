import { legalConfig } from "../../config/legal";
import { LegalLayout } from "../../components/layout/LegalLayout";

export function GiveawayRulesPage() {
  return (
    <LegalLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-8 sm:p-12">
        <h1 className="text-4xl font-bold text-white mb-2">Giveaway Rules</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: {legalConfig.lastUpdated.giveawayRules}</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-slate-300 leading-relaxed">
              These Official Giveaway Rules explain how giveaways work when streamers use {legalConfig.siteName} on their Twitch channels. These rules apply to the technical operation of the giveaway tool itself.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              <strong>Important:</strong> Each streamer running a giveaway is responsible for their own prizes, rules, and legal compliance. {legalConfig.siteName} provides the randomization tool only. We are not the sponsor, organizer, or prize provider for individual streamers' giveaways.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How the Tool Works</h2>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.1 Entry Process</h3>
            <p className="text-slate-300 leading-relaxed">
              Viewers enter giveaways by typing a chat command (default: <code className="text-violet-400">!ticket</code>) in the streamer's Twitch chat. The streamer can customize:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Entry command name</li>
              <li>Leave/exit command</li>
              <li>Whether giveaway is open or closed</li>
              <li>Maximum entries per user (if duplicate entries are allowed)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.2 Eligibility Restrictions</h3>
            <p className="text-slate-300 leading-relaxed">
              Streamers may configure the following restrictions:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li><strong>Follower-only mode:</strong> Only followers can enter</li>
              <li><strong>Subscriber-only mode:</strong> Only subscribers can enter</li>
              <li><strong>Minimum account age:</strong> Twitch account must be X days old</li>
              <li><strong>Minimum follow duration:</strong> Must have followed for X days</li>
              <li><strong>Exclude broadcaster:</strong> Streamer cannot enter their own giveaway</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              Entrants who do not meet the configured requirements will be marked as "ineligible" and cannot win.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.3 Role Weighting</h3>
            <p className="text-slate-300 leading-relaxed">
              {legalConfig.features.roleWeighting && (
                <>
                  Streamers may assign different weights to user roles, affecting their chances of winning:
                  <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                    <li><strong>Viewer:</strong> Default weight</li>
                    <li><strong>Follower:</strong> Customizable multiplier</li>
                    <li><strong>Subscriber:</strong> Customizable multiplier</li>
                    <li><strong>VIP:</strong> Customizable multiplier</li>
                    <li><strong>Moderator:</strong> Customizable multiplier</li>
                    <li><strong>Broadcaster:</strong> Customizable multiplier (default 0x = excluded)</li>
                  </ul>
                  <p className="text-slate-300 leading-relaxed mt-4">
                    Higher weights increase the chances of being selected. For example, a subscriber with 2x weight has twice the chance of a regular viewer with 1x weight.
                  </p>
                  <p className="text-slate-300 leading-relaxed mt-4">
                    Streamers may also set <strong>user-specific overrides</strong> to boost certain users or block specific usernames.
                  </p>
                </>
              )}
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.4 Winner Selection</h3>
            <p className="text-slate-300 leading-relaxed">
              Winners are selected using a <strong>weighted random algorithm</strong>:
            </p>
            <ol className="list-decimal list-inside text-slate-300 space-y-2 mt-3">
              <li>All eligible entrants are assigned a weight based on their roles and entry count</li>
              <li>A cryptographically secure random number generator selects a winner</li>
              <li>The wheel spins and visually displays the selection process</li>
              <li>The winner is announced on the dashboard and optionally in chat</li>
            </ol>
            <p className="text-slate-300 leading-relaxed mt-4">
              The selection is <strong>truly random</strong> within the weighted distribution. The visual wheel animation is for entertainment purposes; the winner is determined mathematically before the wheel stops.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.5 Rerolls</h3>
            <p className="text-slate-300 leading-relaxed">
              Streamers can reroll to select a new winner if:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>The original winner does not respond</li>
              <li>The winner is disqualified</li>
              <li>The streamer decides to pick another winner</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              If "Remove winner after draw" is enabled, the previous winner is removed from the pool before rerolling.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Streamer Responsibilities</h2>
            <p className="text-slate-300 leading-relaxed">
              Each streamer using {legalConfig.siteName} is solely responsible for:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li><strong>Prize provision:</strong> Obtaining, purchasing, and delivering any prizes</li>
              <li><strong>Giveaway rules:</strong> Clearly communicating their specific rules to viewers</li>
              <li><strong>Legal compliance:</strong> Following all applicable laws, including promotional and sweepstakes regulations in their jurisdiction</li>
              <li><strong>Winner verification:</strong> Confirming winner eligibility and identity</li>
              <li><strong>Prize fulfillment:</strong> Delivering prizes as promised</li>
              <li><strong>Taxes:</strong> Handling any tax obligations related to prizes</li>
              <li><strong>Disputes:</strong> Resolving any disputes with entrants or winners</li>
              <li><strong>Age restrictions:</strong> Ensuring their giveaway complies with age requirements</li>
              <li><strong>Regional restrictions:</strong> Handling any geographic or legal restrictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Our Role and Limitations</h2>
            <p className="text-slate-300 leading-relaxed">
              {legalConfig.operatorName} provides the software tool for random selection only. We:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li><strong>DO:</strong> Provide a fair and random selection algorithm</li>
              <li><strong>DO:</strong> Store giveaway data (entrants, winners, settings)</li>
              <li><strong>DO:</strong> Integrate with Twitch for real-time entry tracking</li>
              <li><strong>DO NOT:</strong> Sponsor, organize, or manage individual streamers' giveaways</li>
              <li><strong>DO NOT:</strong> Provide prizes or handle prize fulfillment</li>
              <li><strong>DO NOT:</strong> Verify winner identity or eligibility beyond Twitch data</li>
              <li><strong>DO NOT:</strong> Handle disputes between streamers and entrants</li>
              <li><strong>DO NOT:</strong> Guarantee legal compliance for your giveaway</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Viewer/Entrant Responsibilities</h2>
            <p className="text-slate-300 leading-relaxed">
              If you enter a giveaway run using {legalConfig.siteName}, you should:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Read and follow the <strong>streamer's specific giveaway rules</strong></li>
              <li>Ensure you meet any eligibility requirements (age, location, etc.)</li>
              <li>Understand that entering is voluntary and at your own discretion</li>
              <li>Not create multiple accounts or manipulate the system to gain unfair advantage</li>
              <li>Contact the <strong>streamer</strong> (not us) if you win or have questions about prizes</li>
              <li>Comply with Twitch's Terms of Service and Community Guidelines</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Fraud and Manipulation</h2>
            <p className="text-slate-300 leading-relaxed">
              The following behaviors are <strong>prohibited</strong> and may result in disqualification or service termination:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Using bots or automated tools to enter giveaways</li>
              <li>Creating multiple Twitch accounts to enter the same giveaway</li>
              <li>Attempting to manipulate or hack the selection algorithm</li>
              <li>Impersonating other users</li>
              <li>Any other fraudulent or deceptive behavior</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              Streamers may disqualify and block users who violate these rules.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Data and Privacy</h2>
            <p className="text-slate-300 leading-relaxed">
              When you enter a giveaway, we collect:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Your Twitch username and display name</li>
              <li>Your Twitch user ID (if available)</li>
              <li>Role information (follower, subscriber, VIP, moderator)</li>
              <li>Entry count and timestamps</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              This data is stored for the streamer's giveaway management and is governed by our <a href="/legal/privacy" className="text-violet-400 hover:text-violet-300">Privacy Policy</a>. The streamer can see this information in their dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Service Availability</h2>
            <p className="text-slate-300 leading-relaxed">
              {legalConfig.siteName} is provided "as is" and we do not guarantee:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Uninterrupted service availability</li>
              <li>Error-free operation</li>
              <li>Compatibility with all Twitch features or future changes</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              We are not responsible for:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Service outages or technical issues</li>
              <li>Twitch API downtime or changes</li>
              <li>Lost or incomplete giveaway data</li>
              <li>Any losses resulting from service interruptions</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              Streamers should have backup plans and should not rely solely on our service for critical giveaways.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Twitch Affiliation Disclaimer</h2>
            <p className="text-slate-300 leading-relaxed">
              {legalConfig.siteName} is <strong>not affiliated with, endorsed by, sponsored by, or officially connected to Twitch Interactive, Inc.</strong> or any of its subsidiaries or affiliates.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              Twitch is not a sponsor or co-sponsor of any giveaway run using our tool and bears no responsibility for prize fulfillment, eligibility verification, or legal compliance.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              All Twitch-related trademarks and logos are property of Twitch Interactive, Inc.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Legal Compliance</h2>
            <p className="text-slate-300 leading-relaxed">
              <strong>Streamers must comply with all applicable laws</strong> when running giveaways, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Sweepstakes and lottery regulations in their jurisdiction</li>
              <li>Prize disclosure requirements</li>
              <li>Tax reporting and withholding obligations</li>
              <li>Age and geographic restrictions</li>
              <li>Registration requirements (if applicable)</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4 italic">
              <strong>We are not legal advisors.</strong> Consult with a qualified attorney if you have questions about the legality of your giveaway.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed">
              To the maximum extent permitted by law, {legalConfig.operatorName} is not liable for:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>Prize fulfillment or non-delivery</li>
              <li>Disputes between streamers and entrants/winners</li>
              <li>Errors in entrant tracking or winner selection (though we use industry-standard methods)</li>
              <li>Legal or regulatory violations by streamers</li>
              <li>Injuries, damages, or losses related to prizes</li>
              <li>Service interruptions or data loss</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Changes to These Rules</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update these Giveaway Rules from time to time. When we make changes, we will update the "Last updated" date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Questions and Contact</h2>
            <p className="text-slate-300 leading-relaxed">
              <strong>For questions about the tool or these rules:</strong>
            </p>
            <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <p className="text-slate-300"><strong>Email:</strong> <a href={`mailto:${legalConfig.contactEmail}`} className="text-violet-400 hover:text-violet-300">{legalConfig.contactEmail}</a></p>
              <p className="text-slate-300 mt-2"><strong>Website:</strong> <a href={legalConfig.siteUrl} className="text-violet-400 hover:text-violet-300">{legalConfig.siteUrl}</a></p>
            </div>
            <p className="text-slate-300 leading-relaxed mt-4">
              <strong>For questions about a specific streamer's giveaway, prizes, or rules:</strong> Contact the streamer directly. We cannot help with individual giveaway disputes.
            </p>
          </section>
        </div>
      </div>
    </div>
    </LegalLayout>
  );
}
