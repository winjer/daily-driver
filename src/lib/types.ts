// Weather types
export interface WeatherPeriod {
  label: "Morning" | "Afternoon" | "Evening";
  temperature: number;
  weatherCode: number;
  description: string;
  icon: string;
  precipitationMm: number;
  windSpeedKmh: number;
}

export interface WeatherData {
  periods: WeatherPeriod[];
  minTemp: number;
  maxTemp: number;
  totalRainMm: number;
  needCoat: boolean;
  needUmbrella: boolean;
}

// Bus types
export interface BusDeparture {
  route: string;
  destination: string;
  expectedTime: string; // HH:MM
  minutesAway: number | null;
  status: "on-time" | "late" | "due" | "unknown";
}

export interface BusStop {
  name: string;
  atcoCode: string;
  direction: string;
  departures: BusDeparture[];
}

export interface BusData {
  stops: BusStop[];
  lastUpdated: string;
}

// Cricket types
export interface CricketMatch {
  id: string;
  teams: string[];
  format: string; // "TEST", "ODI", "T20I"
  competition: string;
  venue: string;
  venueCountry: string;
  status: string; // "live", "upcoming", "completed"
  statusText: string; // e.g. "Day 2, Session 1" or "Starts at 14:00"
  startTime: string;
  endTime?: string;
  score?: string;
  groundWeather?: GroundWeather;
}

export interface GroundWeather {
  temperature: number;
  description: string;
  icon: string;
  precipitationMm: number;
}

export interface CricketData {
  matches: CricketMatch[];
  lastUpdated: string;
}

// Dashboard state
export interface SectionState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
