import { Link } from "react-router-dom";
import { legalConfig } from "../../config/legal";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-900/60 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">
              {legalConfig.siteName}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              A professional giveaway wheel for Twitch streamers. Run fair and transparent giveaways with ease.
            </p>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/legal/privacy" className="text-sm text-slate-400 hover:text-violet-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/cookies" className="text-sm text-slate-400 hover:text-violet-400 transition">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className="text-sm text-slate-400 hover:text-violet-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal/giveaway-rules" className="text-sm text-slate-400 hover:text-violet-400 transition">
                  Giveaway Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.twitch.tv" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-violet-400 transition">
                  Twitch
                </a>
              </li>
              <li>
                <a href="https://www.twitch.tv/p/legal/community-guidelines/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-violet-400 transition">
                  Twitch Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href={`mailto:${legalConfig.contactEmail}`} className="text-sm text-slate-400 hover:text-violet-400 transition">
                  {legalConfig.contactEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © {currentYear} {legalConfig.operatorName}. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 text-center sm:text-right">
            Not affiliated with Twitch Interactive, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
