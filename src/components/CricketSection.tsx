"use client";

import { CricketData, CricketMatch } from "../lib/types";

interface Props {
  data: CricketData | null;
  loading: boolean;
  error: string | null;
}

export default function CricketSection({ data, loading, error }: Props) {
  if (loading && !data) {
    return <Card><Skeleton /></Card>;
  }

  if (error && !data) {
    return <Card><p className="text-red-400 text-sm">{error}</p></Card>;
  }

  if (!data) return null;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-100">Cricket</h2>
        <span className="text-xs text-slate-400">
          Updated {data.lastUpdated}
        </span>
      </div>

      {data.matches.length === 0 ? (
        <p className="text-sm text-slate-400">
          No England matches right now
        </p>
      ) : (
        <div className="space-y-3">
          {data.matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </Card>
  );
}

function MatchCard({ match }: { match: CricketMatch }) {
  const isLive = match.status === "live";

  return (
    <div className="bg-slate-700/50 rounded-lg p-3">
      {/* Status badge */}
      <div className="flex items-center gap-2 mb-1.5">
        {isLive && (
          <span className="text-xs rounded px-1.5 py-0.5 bg-red-500/20 text-red-400 font-semibold">
            LIVE
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="text-sm font-medium text-slate-200 mb-1">
        {match.teams.join(" v ")}
      </div>

      {/* Score if live */}
      {match.score && (
        <div className="text-xs text-slate-300 font-mono">{match.score}</div>
      )}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 shadow-lg">{children}</div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-5 bg-slate-700 rounded w-24" />
      <div className="h-24 bg-slate-700 rounded-lg" />
    </div>
  );
}
