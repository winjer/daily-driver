"use client";

import { WeatherData } from "../lib/types";

interface Props {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
}

export default function WeatherSection({ data, loading, error }: Props) {
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
        <h2 className="text-lg font-semibold text-slate-100">York Weather</h2>
        <span className="text-xs text-slate-400">
          {data.minTemp}° / {data.maxTemp}°C
        </span>
      </div>

      {/* Coat & umbrella advice */}
      <div className="flex gap-3 mb-4">
        <Advice
          question="Coat?"
          answer={data.needCoat}
          yesColor="text-blue-400"
          noColor="text-green-400"
        />
        <Advice
          question="Umbrella?"
          answer={data.needUmbrella}
          yesColor="text-blue-400"
          noColor="text-green-400"
        />
        {data.totalRainMm > 0 && (
          <span className="text-xs text-slate-400 self-center ml-auto">
            {data.totalRainMm}mm rain
          </span>
        )}
      </div>

      {/* Period breakdown */}
      <div className="grid grid-cols-3 gap-2">
        {data.periods.map((p) => (
          <div
            key={p.label}
            className="bg-slate-700/50 rounded-lg p-2 text-center"
          >
            <div className="text-xs text-slate-400 mb-1">{p.label}</div>
            <div className="text-2xl mb-1">{p.icon}</div>
            <div className="text-sm font-medium text-slate-200">
              {p.temperature}°C
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {p.description}
            </div>
            {p.precipitationMm > 0 && (
              <div className="text-xs text-blue-400 mt-0.5">
                {p.precipitationMm}mm
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 shadow-lg">{children}</div>
  );
}

function Advice({
  question,
  answer,
  yesColor,
  noColor,
}: {
  question: string;
  answer: boolean;
  yesColor: string;
  noColor: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-slate-300">{question}</span>
      <span className={`text-sm font-bold ${answer ? yesColor : noColor}`}>
        {answer ? "Yes" : "No"}
      </span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-5 bg-slate-700 rounded w-32" />
      <div className="h-4 bg-slate-700 rounded w-48" />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-700 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
