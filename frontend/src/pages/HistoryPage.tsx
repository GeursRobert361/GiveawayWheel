import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { apiDownload, getHistory } from "../lib/api";
import type { HistoryItem } from "../lib/types";
import { formatRelativeTime, isSpinInProgress } from "../lib/utils";
import { useDashboardStore } from "../store/useDashboardStore";

export function HistoryPage() {
  const lastSpinEventId = useDashboardStore((state) => state.snapshot?.giveaway?.lastSpin?.eventId);
  const spinActive = useDashboardStore((state) => isSpinInProgress(state.snapshot?.giveaway?.lastSpin));
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const visibleHistory = spinActive ? history.slice(1) : history;

  useEffect(() => {
    setLoading(true);
    void getHistory()
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [lastSpinEventId]);

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4 px-6 py-6">
        <div className="space-y-2">
          <p className="section-kicker">History</p>
          <h2 className="text-3xl font-bold text-white">Past winners</h2>
          <p className="text-sm text-slate-400">Every recorded winner from your recent giveaway sessions.</p>
        </div>
        <Button variant="secondary" onClick={() => apiDownload("/api/history/export")}>
          Export winners CSV
        </Button>
      </Card>

      <Card className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-400">Loading history...</p>
        ) : visibleHistory.length === 0 ? (
          <p className="text-sm text-slate-400">No winners recorded yet.</p>
        ) : (
          visibleHistory.map((winner) => (
            <div
              key={winner.id}
              className="grid gap-2 rounded-[26px] border border-white/10 bg-white/[0.05] px-4 py-4 md:grid-cols-[1.1fr_0.9fr_0.6fr]"
            >
              <div>
                <p className="font-semibold text-white">{winner.displayName}</p>
                <p className="mt-1 text-sm text-slate-400">{winner.sessionTitle}</p>
              </div>
              <div className="text-sm text-slate-300">
                <p>{winner.selectedWeight.toFixed(2)} effective weight</p>
                <p className="mt-1 text-slate-500">{winner.source}</p>
              </div>
              <div className="text-sm text-slate-400 md:text-right">{formatRelativeTime(winner.createdAt)}</div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
