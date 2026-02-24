import { WeatherData, WeatherPeriod, GroundWeather } from "./types";
import { YORK_LAT, YORK_LON } from "./constants";
import { getWeatherInfo } from "./weatherCodes";

interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  weathercode: number[];
  precipitation: number[];
  windspeed_10m: number[];
}

interface OpenMeteoResponse {
  hourly: OpenMeteoHourly;
}

async function fetchOpenMeteo(
  lat: number,
  lon: number,
  date: string
): Promise<OpenMeteoResponse> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode,precipitation,windspeed_10m&start_date=${date}&end_date=${date}&timezone=Europe/London`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
  return res.json();
}

function getPeriodHours(
  label: WeatherPeriod["label"]
): { start: number; end: number } {
  switch (label) {
    case "Morning":
      return { start: 6, end: 12 };
    case "Afternoon":
      return { start: 12, end: 18 };
    case "Evening":
      return { start: 18, end: 23 };
  }
}

function summarizePeriod(
  label: WeatherPeriod["label"],
  hourly: OpenMeteoHourly
): WeatherPeriod {
  const { start, end } = getPeriodHours(label);
  const indices: number[] = [];

  for (let i = 0; i < hourly.time.length; i++) {
    const hour = new Date(hourly.time[i]).getHours();
    if (hour >= start && hour < end) indices.push(i);
  }

  if (indices.length === 0) {
    return {
      label,
      temperature: 0,
      weatherCode: 0,
      description: "No data",
      icon: "❓",
      precipitationMm: 0,
      windSpeedKmh: 0,
    };
  }

  const temps = indices.map((i) => hourly.temperature_2m[i]);
  const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
  const totalPrecip = indices.reduce(
    (sum, i) => sum + hourly.precipitation[i],
    0
  );
  const avgWind = Math.round(
    indices.reduce((sum, i) => sum + hourly.windspeed_10m[i], 0) /
      indices.length
  );

  // Use the most "severe" weather code in the period
  const worstCode = Math.max(...indices.map((i) => hourly.weathercode[i]));
  const info = getWeatherInfo(worstCode);

  return {
    label,
    temperature: avgTemp,
    weatherCode: worstCode,
    description: info.description,
    icon: info.icon,
    precipitationMm: Math.round(totalPrecip * 10) / 10,
    windSpeedKmh: avgWind,
  };
}

export async function fetchYorkWeather(): Promise<WeatherData> {
  const today = new Date()
    .toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  const data = await fetchOpenMeteo(YORK_LAT, YORK_LON, today);

  const periods: WeatherPeriod[] = [
    summarizePeriod("Morning", data.hourly),
    summarizePeriod("Afternoon", data.hourly),
    summarizePeriod("Evening", data.hourly),
  ];

  const allTemps = data.hourly.temperature_2m;
  const minTemp = Math.round(Math.min(...allTemps));
  const maxTemp = Math.round(Math.max(...allTemps));
  const totalRainMm =
    Math.round(
      data.hourly.precipitation.reduce((a, b) => a + b, 0) * 10
    ) / 10;

  const needUmbrella = totalRainMm > 0.5 || periods.some((p) => p.weatherCode >= 51);
  const needCoat = minTemp < 10 || periods.some((p) => p.windSpeedKmh > 30);

  return { periods, minTemp, maxTemp, totalRainMm, needCoat, needUmbrella };
}

export async function fetchGroundWeather(
  lat: number,
  lon: number
): Promise<GroundWeather> {
  const today = new Date()
    .toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  const data = await fetchOpenMeteo(lat, lon, today);

  // Get current-ish weather (nearest hour)
  const now = new Date();
  const currentHour = now.getHours();
  const idx = Math.min(currentHour, data.hourly.time.length - 1);

  const info = getWeatherInfo(data.hourly.weathercode[idx]);
  return {
    temperature: Math.round(data.hourly.temperature_2m[idx]),
    description: info.description,
    icon: info.icon,
    precipitationMm:
      Math.round(
        data.hourly.precipitation.reduce((a, b) => a + b, 0) * 10
      ) / 10,
  };
}
