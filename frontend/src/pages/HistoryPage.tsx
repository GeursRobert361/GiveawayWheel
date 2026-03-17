import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { apiDownload, getHistory } from "../lib/api";
import type { HistoryItem } from "../lib/types";
import { formatRelativeTime } from "../lib/utils";
import { useDashboardStore } from "../store/useDashboardStore";

export function HistoryPage() {
  const lastSpinEventId = useDashboardStore((state) => state.snapshot?.giveaway?.lastSpin?.eventId);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void getHistory()
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [lastSpinEventId]);

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200/70">History</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Past winners</h2>
        </div>
        <Button variant="secondary" onClick={() => apiDownload("/api/history/export")}>
          Export winners CSV
        </Button>
      </Card>

      <Card className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-400">Loading history…</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-slate-400">No winners recorded yet.</p>
        ) : (
          history.map((winner) => (
            <div
              key={winner.id}
              className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 md:grid-cols-[1.1fr_0.9fr_0.6fr]"
            >
              <div>
                <p className="font-semibold text-white">{winner.displayName}</p>
                <p className="mt-1 text-sm text-slate-400">{winner.sessionTitle}</p>
              </div>
              <div className="text-sm text-slate-300">
                <p>{winner.selectedWeight.toFixed(2)} effective weight</p>
                <p className="mt-1 text-slate-500">{winner.source}</p>
              </div>
              <div className="text-sm text-slate-400 md:text-right">
                {formatRelativeTime(winner.createdAt)}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
