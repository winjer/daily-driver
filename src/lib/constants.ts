// York coordinates
export const YORK_LAT = 53.958;
export const YORK_LON = -1.080;

// Bus stop ATCO codes
export const BUS_STOPS = [
  {
    name: "Norman Drive",
    atcoCode: "3290YYA00333",
    direction: "Towards city centre",
  },
  {
    name: "Theatre Royal",
    atcoCode: "3290YYA00123",
    direction: "Towards Acomb",
  },
] as const;

// Routes to show
export const BUS_ROUTES = ["5", "5A"];

// Number of departures to show per stop
export const MAX_DEPARTURES = 3;

// Auto-refresh interval (ms)
export const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
