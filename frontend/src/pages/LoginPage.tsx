import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { loginWithTwitch } from "../lib/api";

export function LoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(71,215,255,0.18),_transparent_32%),linear-gradient(180deg,_#081121_0%,_#04060f_100%)] px-4 py-8 text-slate-100">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-200/70">
            Twitch Giveaway Wheel
          </p>
          <h1 className="font-display text-5xl font-bold leading-tight text-white sm:text-6xl">
            Run polished Twitch giveaways with live chat entry and a real spinning wheel.
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Login with Twitch, watch chat join in real time, control the giveaway from the dashboard or
            mod commands, and stream the wheel straight into OBS.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button className="px-6 py-3 text-base" onClick={loginWithTwitch}>
              Login with Twitch
            </Button>
            <a
              href="https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5"
            >
              Twitch OAuth Docs
            </a>
          </div>
        </div>

        <Card className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-200/70">
              Included
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">Streamer-ready workflow</h2>
          </div>

          <ul className="space-y-3 text-sm text-slate-300">
            <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              Live EventSub chat intake with giveaway join, leave, and moderator command parsing
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              Weighted odds for followers, subscribers, VIPs, moderators, and custom usernames
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              Dashboard controls, entrant management, CSV export, overlay URL, and giveaway history
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              OBS-friendly wheel overlay with countdown, celebration, and winner announcement hook
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
