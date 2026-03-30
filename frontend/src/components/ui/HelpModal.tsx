import { useState } from "react";
import { Button } from "./Button";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<"setup" | "twitch" | "obs" | "usage">("setup");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-lg border border-slate-700/70 bg-slate-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Help & Tutorials</h2>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close help"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex">
          {/* Sidebar navigation */}
          <nav className="w-48 border-r border-slate-800 bg-slate-950/50 p-4">
            <div className="space-y-1">
              {[
                { id: "setup" as const, label: "Getting Started", icon: "🚀" },
                { id: "twitch" as const, label: "Twitch Setup", icon: "💜" },
                { id: "obs" as const, label: "OBS Overlay", icon: "📺" },
                { id: "usage" as const, label: "Live Usage", icon: "🎮" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "bg-violet-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "70vh" }}>
            {activeTab === "setup" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Getting Started with Giveaway Wheel</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Welcome! This tool helps you run fair, weighted giveaways during your Twitch streams.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <h4 className="font-semibold text-white">Step 1: Connect to Twitch</h4>
                    <p className="mt-2 text-sm text-slate-300">
                      The app connects to your Twitch account to read chat messages and (optionally) announce winners. Check the status indicator in the top-right corner to verify your connection.
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <h4 className="font-semibold text-white">Step 2: Configure Your Giveaway</h4>
                    <p className="mt-2 text-sm text-slate-300">
                      Click the <strong>Setup</strong> button on the Dashboard to configure:
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-400">
                      <li>Giveaway title</li>
                      <li>Entry command (e.g., <code className="rounded bg-slate-900 px-1 py-0.5">!join</code>)</li>
                      <li>Leave command (e.g., <code className="rounded bg-slate-900 px-1 py-0.5">!leave</code>)</li>
                      <li>Entry rules (follower-only, subscriber-only, etc.)</li>
                      <li>Role weights (boost chances for subs, VIPs, etc.)</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <h4 className="font-semibold text-white">Step 3: Open Entry</h4>
                    <p className="mt-2 text-sm text-slate-300">
                      When ready, click the <strong className="text-emerald-400">Open entry</strong> button. Your viewers can now type the entry command in chat to join the giveaway.
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <h4 className="font-semibold text-white">Step 4: Spin the Wheel</h4>
                    <p className="mt-2 text-sm text-slate-300">
                      Click <strong className="text-violet-400">Spin now</strong> to randomly select a winner. The wheel will spin with suspense, then display the winner's name.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "twitch" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Twitch Integration</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Connect your Twitch account to enable chat monitoring and winner announcements.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <h4 className="font-semibold text-white">Connection Status</h4>
                    <p className="mt-2 text-sm text-slate-300">
                      Check the status pill in the top-right corner of the navigation bar:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li><span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span> <strong className="text-emerald-400">Connected</strong> - Everything is working</li>
                      <li><span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span> <strong className="text-amber-400">Reconnecting</strong> - Temporary connection issue</li>
                      <li><span className="inline-block h-2 w-2 rounded-full bg-rose-500"></span> <strong className="text-rose-400">Disconnected</strong> - Check your settings</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <h4 className="font-semibold text-white">How It Works</h4>
                    <p className="mt-2 text-sm text-slate-300">
                      The app listens to your Twitch chat for the configured entry command. When a viewer types it, they're automatically added to the giveaway (if eligible based on your rules).
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <h4 className="font-semibold text-white">Winner Announcements</h4>
                    <p className="mt-2 text-sm text-slate-300">
                      Enable <strong>"Announce winner in chat"</strong> in the Setup modal to automatically post the winner's name in your Twitch chat after the spin completes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "obs" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">OBS Overlay Setup</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Display the giveaway wheel on your stream using OBS Browser Source.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-violet-700/50 bg-violet-900/20 p-4">
                    <h4 className="font-semibold text-violet-300">⚠️ Important</h4>
                    <p className="mt-2 text-sm text-slate-300">
                      You must use the OBS overlay to show the wheel on your stream. The dashboard view is for control only.
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <h4 className="font-semibold text-white">Step 1: Get Your Overlay URL</h4>
                    <p className="mt-2 text-sm text-slate-300">
                      On the Dashboard, expand the <strong>"Secondary actions"</strong> panel (under "More"). Your overlay URL is shown in the "OBS Setup" section.
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Click <strong>Copy URL</strong> to copy it to your clipboard.
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <h4 className="font-semibold text-white">Step 2: Add Browser Source in OBS</h4>
                    <ol className="mt-2 list-inside list-decimal space-y-2 text-sm text-slate-300">
                      <li>Open <strong>OBS Studio</strong></li>
                      <li>In the <strong>Sources</strong> panel, click the <strong>+</strong> button</li>
                      <li>Select <strong>Browser</strong></li>
                      <li>Name it "Giveaway Wheel" (or anything you like)</li>
                      <li>Click <strong>OK</strong></li>
                    </ol>
                  </div>

                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <h4 className="font-semibold text-white">Step 3: Configure Browser Source</h4>
                    <p className="mt-2 text-sm text-slate-300">In the Browser Source properties:</p>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li>
                        <strong className="text-white">URL:</strong>{" "}
                        <span className="text-slate-400">Paste your overlay URL from Step 1</span>
                      </li>
                      <li>
                        <strong className="text-white">Width:</strong>{" "}
                        <code className="rounded bg-slate-900 px-1.5 py-0.5 text-violet-300">2500</code>
                      </li>
                      <li>
                        <strong className="text-white">Height:</strong>{" "}
                        <code className="rounded bg-slate-900 px-1.5 py-0.5 text-violet-300">2500</code>
                      </li>
                      <li>
                        <strong className="text-white">Custom CSS:</strong>{" "}
                        <span className="text-slate-400">(leave empty)</span>
                      </li>
                      <li className="text-slate-400">
                        ✓ Check <strong>Shutdown source when not visible</strong> (optional, saves resources)
                      </li>
                      <li className="text-slate-400">
                        ✓ Check <strong>Refresh browser when scene becomes active</strong> (optional)
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <h4 className="font-semibold text-white">Step 4: Position & Test</h4>
                    <p className="mt-2 text-sm text-slate-300">
                      Resize and position the wheel on your stream canvas. Use the <strong>Preview</strong> button in the dashboard to see how it looks before going live.
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Tip: Use the <strong>Show/Hide overlay</strong> button to control visibility without removing the source.
                    </p>
                  </div>

                  <div className="rounded-lg border border-emerald-700/50 bg-emerald-900/20 p-4">
                    <h4 className="font-semibold text-emerald-300">✓ You're Done!</h4>
                    <p className="mt-2 text-sm text-slate-300">
                      The overlay will automatically sync with your dashboard. When you spin the wheel in the dashboard, it spins on stream!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "usage" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Live Usage During Stream</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Quick reference for running giveaways during your stream.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <h4 className="font-semibold text-white">Starting a Giveaway</h4>
                    <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-slate-300">
                      <li>Click <strong className="text-emerald-400">Open entry</strong> on the Dashboard</li>
                      <li>Tell your viewers the entry command (e.g., "Type !join to enter")</li>
                      <li>Watch entrants appear in the Entrants list in real-time</li>
                      <li>When ready, click <strong className="text-violet-400">Spin now</strong></li>
                    </ol>
                  </div>

                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <h4 className="font-semibold text-white">If Winner Doesn't Respond</h4>
                    <p className="mt-2 text-sm text-slate-300">
                      Click the <strong>Reroll</strong> button to spin again with the same entrant pool. You can reroll as many times as needed.
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <h4 className="font-semibold text-white">Managing Entrants</h4>
                    <p className="mt-2 text-sm text-slate-300">Click <strong>Manage</strong> next to any entrant to:</p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-400">
                      <li>Remove one entry (if duplicate entries allowed)</li>
                      <li>Remove the entrant completely</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <h4 className="font-semibold text-white">Manual Entries</h4>
                    <p className="mt-2 text-sm text-slate-300">
                      Expand <strong>"Secondary actions"</strong> to manually add someone by username. Useful for:
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-400">
                      <li>Sponsored giveaway entries</li>
                      <li>Adding someone who had technical issues</li>
                      <li>Testing the wheel</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <h4 className="font-semibold text-white">Between Giveaways</h4>
                    <p className="mt-2 text-sm text-slate-300">
                      Click <strong className="text-rose-400">Close entry</strong> to stop accepting new entries. Use <strong>Clear all</strong> in Secondary actions to reset the entrant pool for the next giveaway.
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <h4 className="font-semibold text-white">Keyboard Shortcuts</h4>
                    <ul className="mt-2 space-y-1 text-sm text-slate-300">
                      <li><kbd className="rounded bg-slate-900 px-2 py-0.5 text-xs">Esc</kbd> - Dismiss winner announcement</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end border-t border-slate-800 pt-6">
              <Button variant="secondary" onClick={onClose}>
                Close Help
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
