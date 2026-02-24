import { BusData, BusDeparture, BusStop } from "./types";
import { BUS_STOPS, BUS_ROUTES, MAX_DEPARTURES } from "./constants";

interface TransportAPIDeparture {
  line: string;
  line_name: string;
  direction: string;
  aimed_departure_time: string;
  expected_departure_time: string | null;
  best_departure_estimate: string;
  date: string;
}

interface TransportAPIResponse {
  departures?: {
    all?: TransportAPIDeparture[];
  };
}

function parseMinutesAway(timeStr: string): number | null {
  const now = new Date();
  const [hours, minutes] = timeStr.split(":").map(Number);
  const departure = new Date(now);
  departure.setHours(hours, minutes, 0, 0);

  // If departure time is earlier, it might be tomorrow
  if (departure.getTime() < now.getTime() - 60000) {
    return null;
  }

  return Math.round((departure.getTime() - now.getTime()) / 60000);
}

function mapDeparture(dep: TransportAPIDeparture): BusDeparture {
  const expectedTime = dep.best_departure_estimate || dep.aimed_departure_time;
  const minutesAway = parseMinutesAway(expectedTime);

  let status: BusDeparture["status"] = "unknown";
  if (minutesAway !== null) {
    if (minutesAway <= 1) status = "due";
    else if (
      dep.expected_departure_time &&
      dep.expected_departure_time > dep.aimed_departure_time
    )
      status = "late";
    else status = "on-time";
  }

  return {
    route: dep.line_name,
    destination: dep.direction,
    expectedTime,
    minutesAway,
    status,
  };
}

export async function fetchBuses(): Promise<BusData> {
  const stops: BusStop[] = await Promise.all(
    BUS_STOPS.map(async (stop) => {
      try {
        const res = await fetch(`/api/buses?stop=${stop.atcoCode}`);
        if (!res.ok) throw new Error(`Bus API error: ${res.status}`);

        const data: TransportAPIResponse = await res.json();
        const allDeps = data.departures?.all ?? [];

        const filtered = allDeps
          .filter((d) =>
            BUS_ROUTES.some(
              (r) => d.line_name.toUpperCase() === r.toUpperCase()
            )
          )
          .map(mapDeparture)
          .filter((d) => d.minutesAway === null || d.minutesAway >= 0)
          .slice(0, MAX_DEPARTURES);

        return {
          name: stop.name,
          atcoCode: stop.atcoCode,
          direction: stop.direction,
          departures: filtered,
        };
      } catch (err) {
        console.error(`Error fetching buses for ${stop.name}:`, err);
        return {
          name: stop.name,
          atcoCode: stop.atcoCode,
          direction: stop.direction,
          departures: [],
        };
      }
    })
  );

  return {
    stops,
    lastUpdated: new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
