"use client";

import { useEffect, useState, useCallback } from "react";
import { WeatherData, BusData, CricketData, SectionState } from "../lib/types";
import { REFRESH_INTERVAL } from "../lib/constants";
import { fetchYorkWeather } from "../lib/weather";
import { fetchBuses } from "../lib/buses";
import { fetchCricket } from "../lib/cricket";
import WeatherSection from "./WeatherSection";
import BusSection from "./BusSection";
import CricketSection from "./CricketSection";

export default function Dashboard() {
  const [weather, setWeather] = useState<SectionState<WeatherData>>({
    data: null,
    loading: true,
    error: null,
  });
  const [buses, setBuses] = useState<SectionState<BusData>>({
    data: null,
    loading: true,
    error: null,
  });
  const [cricket, setCricket] = useState<SectionState<CricketData>>({
    data: null,
    loading: true,
    error: null,
  });

  const refreshAll = useCallback(async () => {
    // Fetch all three in parallel, each with independent error handling
    const weatherPromise = fetchYorkWeather()
      .then((data) => setWeather({ data, loading: false, error: null }))
      .catch((err) =>
        setWeather((prev) => ({
          data: prev.data,
          loading: false,
          error: err.message,
        }))
      );

    const busPromise = fetchBuses()
      .then((data) => setBuses({ data, loading: false, error: null }))
      .catch((err) =>
        setBuses((prev) => ({
          data: prev.data,
          loading: false,
          error: err.message,
        }))
      );

    const cricketPromise = fetchCricket()
      .then((data) => setCricket({ data, loading: false, error: null }))
      .catch((err) =>
        setCricket((prev) => ({
          data: prev.data,
          loading: false,
          error: err.message,
        }))
      );

    await Promise.allSettled([weatherPromise, busPromise, cricketPromise]);
  }, []);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refreshAll]);

  return (
    <div className="space-y-4">
      <WeatherSection
        data={weather.data}
        loading={weather.loading}
        error={weather.error}
      />
      <BusSection
        data={buses.data}
        loading={buses.loading}
        error={buses.error}
      />
      <CricketSection
        data={cricket.data}
        loading={cricket.loading}
        error={cricket.error}
      />
    </div>
  );
}
