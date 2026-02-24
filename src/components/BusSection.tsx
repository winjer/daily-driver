"use client";

import { BusData, BusDeparture } from "../lib/types";

interface Props {
  data: BusData | null;
  loading: boolean;
  error: string | null;
}

export default function BusSection({ data, loading, error }: Props) {
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
        <h2 className="text-lg font-semibold text-slate-100">Buses</h2>
        <span className="text-xs text-slate-400">
          Updated {data.lastUpdated}
        </span>
      </div>

      <div className="space-y-3">
        {data.stops.map((stop) => (
          <div key={stop.atcoCode}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-200">
                {stop.name}
              </span>
              <span className="text-xs text-slate-400">{stop.direction}</span>
            </div>

            {stop.departures.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No upcoming 5/5A buses
              </p>
            ) : (
              <div className="space-y-1">
                {stop.departures.map((dep, i) => (
                  <DepartureRow key={i} departure={dep} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function DepartureRow({ departure }: { departure: BusDeparture }) {
  const statusColor = {
    "on-time": "text-green-400",
    late: "text-amber-400",
    due: "text-blue-400",
    unknown: "text-slate-400",
  }[departure.status];

  return (
    <div className="flex items-center justify-between bg-slate-700/50 rounded px-2.5 py-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold bg-slate-600 text-slate-200 rounded px-1.5 py-0.5 min-w-[2rem] text-center">
          {departure.route}
        </span>
        <span className="text-xs text-slate-300 truncate max-w-[140px]">
          {departure.destination}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-200">
          {departure.expectedTime}
        </span>
        {departure.minutesAway !== null && (
          <span className={`text-xs ${statusColor}`}>
            {departure.minutesAway <= 1
              ? "Due"
              : `${departure.minutesAway} min`}
          </span>
        )}
      </div>
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
      <div className="h-5 bg-slate-700 rounded w-20" />
      {[1, 2].map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-4 bg-slate-700 rounded w-36" />
          <div className="h-8 bg-slate-700 rounded" />
          <div className="h-8 bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}
