import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import { apiDownload, getHistory } from "../lib/api";
import type { HistoryItem } from "../lib/types";
import { formatRelativeTime, isSpinInProgress } from "../lib/utils";
import { useDashboardStore } from "../store/useDashboardStore";

function EmptyHistory() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-700/70 bg-slate-800/60">
        <svg
          className="h-7 w-7 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.43 9.71 2.25 12 2.25c2.291 0 4.545.18 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-300">No winners yet</p>
        <p className="mt-1 text-xs text-slate-500">
          Spin your first giveaway on the dashboard to see winners here.
        </p>
      </div>
      <Button variant="secondary" onClick={() => (window.location.href = "/dashboard")}>
        Go to dashboard
      </Button>
    </div>
  );
}

export function HistoryPage() {
  const lastSpinEventId = useDashboardStore(
    (state) => state.snapshot?.giveaway?.lastSpin?.eventId
  );
  const spinActive = useDashboardStore((state) =>
    isSpinInProgress(state.snapshot?.giveaway?.lastSpin)
  );
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
          <h1 className="page-title">Past winners</h1>
          <p className="text-sm text-slate-400">
            Every recorded winner from your recent giveaway sessions.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => apiDownload("/api/history/export")}
          disabled={loading || visibleHistory.length === 0}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </Button>
      </Card>

      <Card className="space-y-3">
        {loading ? (
          <div className="space-y-3" aria-label="Loading history" aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : visibleHistory.length === 0 ? (
          <EmptyHistory />
        ) : (
          visibleHistory.map((winner) => (
            <div
              key={winner.id}
              className="grid gap-2 rounded-lg border border-slate-700/70 bg-slate-800/60 px-4 py-4 transition hover:border-slate-600 hover:bg-slate-700/60 md:grid-cols-[1.1fr_0.9fr_0.6fr]"
            >
              <div>
                <p className="font-semibold text-white">{winner.displayName}</p>
                <p className="mt-1 text-xs text-slate-500">{winner.sessionTitle}</p>
                <p className="mt-1 text-xs text-slate-400">{winner.source}</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="violet">{winner.selectedWeight.toFixed(2)}× weight</Badge>
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
