import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { loginWithTwitch } from "../lib/api";

export function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_rgba(109,40,217,0.24),_transparent_38%),radial-gradient(ellipse_at_top_right,_rgba(71,215,255,0.1),_transparent_28%),radial-gradient(circle_at_80%_80%,_rgba(124,58,237,0.1),_transparent_24%),linear-gradient(180deg,_#060916_0%,_#03050c_100%)] px-4 py-8 text-slate-100">
      <div className="pointer-events-none absolute left-8 top-16 h-52 w-52 rounded-full bg-violet-600/[0.12] blur-[80px]" />
      <div className="pointer-events-none absolute right-6 top-20 h-40 w-40 rounded-full bg-brand-300/[0.08] blur-[60px]" />
      <div className="pointer-events-none absolute bottom-20 right-20 h-48 w-48 rounded-full bg-violet-500/[0.08] blur-[80px]" />

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="section-kicker">Twitch Giveaway Wheel</p>
            <h1 className="font-display text-5xl font-bold leading-[1.0] text-white sm:text-6xl lg:text-7xl">
              Stream giveaways that look like part of the show.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-slate-400">
              Capture entries from live chat, give roles custom weight, and spin a wheel that looks good enough to go full-screen on stream.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button className="px-7 py-3 text-base" onClick={loginWithTwitch}>
              Login with Twitch
            </Button>
            <a
              href="https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-2xl border border-white/[0.1] px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-white/[0.18] hover:bg-white/[0.05] hover:text-white"
            >
              OAuth docs ↗
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Live intake</p>
              <p className="mt-2 text-base font-bold text-white">EventSub chat entry</p>
              <p className="mt-1 text-xs text-slate-500">Real-time join commands from chat</p>
            </div>
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Fair odds</p>
              <p className="mt-2 text-base font-bold text-white">Weighted roles</p>
              <p className="mt-1 text-xs text-slate-500">Subs, VIPs, mods, custom overrides</p>
            </div>
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Broadcast ready</p>
              <p className="mt-2 text-base font-bold text-white">OBS overlay</p>
              <p className="mt-1 text-xs text-slate-500">Browser source with live sync</p>
            </div>
          </div>
        </div>

        <Card className="space-y-5 px-6 py-7 sm:px-7">
          <div>
            <p className="section-kicker">What's included</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Streamer-ready workflow</h2>
          </div>

          <div className="space-y-2.5 text-sm">
            {[
              { icon: "💬", text: "Moderator chat commands — open, close, spin, reroll, clear, and status." },
              { icon: "⚖️", text: "Weighted odds for followers, subscribers, VIPs, moderators, and custom usernames." },
              { icon: "🎛️", text: "Dashboard controls, entrant management, CSV exports, and winner history." },
              { icon: "🎡", text: "Large animated wheel with countdown, confetti, and a browser-source ready overlay." }
            ].map((item) => (
              <div
                key={item.icon}
                className="flex items-start gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-slate-300 transition hover:border-violet-400/15 hover:bg-white/[0.06]"
              >
                <span className="mt-px text-base">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-1">
            <Button className="w-full py-3 text-base" onClick={loginWithTwitch}>
              Get started with Twitch
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
