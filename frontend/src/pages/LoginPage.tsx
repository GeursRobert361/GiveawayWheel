import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { loginWithTwitch } from "../lib/api";

export function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(71,215,255,0.18),_transparent_24%),radial-gradient(circle_at_84%_18%,_rgba(255,114,94,0.12),_transparent_16%),linear-gradient(180deg,_#081121_0%,_#04060f_100%)] px-4 py-8 text-slate-100">
      <div className="pointer-events-none absolute left-10 top-20 h-40 w-40 rounded-full bg-brand-300/15 blur-3xl" />
      <div className="pointer-events-none absolute right-8 top-24 h-36 w-36 rounded-full bg-[rgba(255,204,77,0.15)] blur-3xl" />

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-7">
          <div className="space-y-5">
            <p className="section-kicker">Twitch Giveaway Wheel</p>
            <h1 className="font-display text-5xl font-bold leading-[0.94] text-white sm:text-7xl">
              Stream giveaways that actually look like part of the show.
            </h1>
            <p className="max-w-2xl text-lg text-slate-300">
              Login with Twitch, capture entries from live chat, give roles custom weight, and run a wheel that looks
              good enough to sit on stream full-screen.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="px-7 py-3 text-base" onClick={loginWithTwitch}>
              Login with Twitch
            </Button>
            <a
              href="https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06]"
            >
              Twitch OAuth docs
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Live intake</p>
              <p className="mt-2 text-lg font-bold text-white">EventSub chat entry</p>
            </div>
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Fair odds</p>
              <p className="mt-2 text-lg font-bold text-white">Weighted roles and overrides</p>
            </div>
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Broadcast ready</p>
              <p className="mt-2 text-lg font-bold text-white">OBS overlay and winner hook</p>
            </div>
          </div>
        </div>

        <Card className="space-y-5 px-6 py-6 sm:px-7">
          <div>
            <p className="section-kicker">Included</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Streamer-ready workflow</h2>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-4">
              Moderator chat commands for open, close, spin, reroll, clear, and status.
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-4">
              Weighted odds for followers, subscribers, VIPs, moderators, and custom usernames.
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-4">
              Dashboard controls, entrant management, CSV exports, overlay links, and winner history.
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-4">
              Large animated wheel with countdown, celebration, and browser-source friendly layout.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
