import { CricketData, CricketMatch, GroundWeather } from "./types";
import { getVenueCoordinates } from "./venueCoordinates";
import { fetchGroundWeather } from "./weather";

interface ESPNMatch {
  id: string;
  slug: string;
  name: string;
  objectId: number;
  teams: Array<{
    team: {
      name: string;
      abbreviation: string;
    };
    score?: string;
    scoreInfo?: string;
  }>;
  ground?: {
    name: string;
    country?: {
      name: string;
    };
  };
  format?: string;
  internationalClassId?: number;
  series?: {
    name: string;
    isTrophy?: boolean;
  };
  isCancelled?: boolean;
  stage?: string;
  state?: string;
  status?: string;
  statusText?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  scags?: {
    matchState?: string;
  };
}

interface ESPNResponse {
  matches?: ESPNMatch[];
  content?: {
    matches?: ESPNMatch[];
  };
}

// Major ICC competitions and events
const MAJOR_COMPETITION_KEYWORDS = [
  "world cup",
  "champions trophy",
  "world test championship",
  "wtc",
  "icc",
  "ashes",
];

function isEnglandMatch(match: ESPNMatch): boolean {
  return match.teams.some((t) => {
    const name = t.team.name.toLowerCase();
    return name === "england" || t.team.abbreviation === "ENG";
  });
}

function isMajorCompetition(match: ESPNMatch): boolean {
  const seriesName = match.series?.name?.toLowerCase() ?? "";
  return MAJOR_COMPETITION_KEYWORDS.some((kw) => seriesName.includes(kw));
}

function isInternational(match: ESPNMatch): boolean {
  // internationalClassId: 1=Test, 2=ODI, 3=T20I
  return (
    match.internationalClassId !== undefined &&
    match.internationalClassId >= 1 &&
    match.internationalClassId <= 3
  );
}

function isInterestingMatch(match: ESPNMatch): boolean {
  if (match.isCancelled) return false;
  if (!isInternational(match)) return false;
  return isEnglandMatch(match) || isMajorCompetition(match);
}

function getFormatName(classId?: number): string {
  switch (classId) {
    case 1:
      return "TEST";
    case 2:
      return "ODI";
    case 3:
      return "T20I";
    default:
      return "INT";
  }
}

function getMatchStatus(match: ESPNMatch): { status: string; statusText: string } {
  const state = match.state?.toLowerCase() ?? "";
  if (state === "live" || state === "inprogress" || state === "in progress") {
    return { status: "live", statusText: match.statusText ?? "Live" };
  }
  if (state === "complete" || state === "finished") {
    return { status: "completed", statusText: match.statusText ?? "Completed" };
  }
  return { status: "upcoming", statusText: match.statusText ?? "Upcoming" };
}

function buildScore(match: ESPNMatch): string | undefined {
  const parts = match.teams
    .filter((t) => t.score)
    .map((t) => `${t.team.abbreviation}: ${t.score}`);
  return parts.length > 0 ? parts.join(" vs ") : undefined;
}

async function enrichWithWeather(
  match: CricketMatch
): Promise<CricketMatch> {
  if (!match.venue) return match;

  const coords = getVenueCoordinates(match.venue);
  if (!coords) return match;

  try {
    const groundWeather = await fetchGroundWeather(coords.lat, coords.lon);
    return { ...match, groundWeather };
  } catch {
    return match;
  }
}

export async function fetchCricket(): Promise<CricketData> {
  const res = await fetch("/api/cricket");
  if (!res.ok) throw new Error(`Cricket API error: ${res.status}`);

  const data: ESPNResponse = await res.json();
  const allMatches = data.matches ?? data.content?.matches ?? [];

  const interesting = allMatches.filter(isInterestingMatch);

  const matches: CricketMatch[] = interesting.map((m) => {
    const { status, statusText } = getMatchStatus(m);
    return {
      id: m.id ?? String(m.objectId),
      teams: m.teams.map((t) => t.team.name),
      format: getFormatName(m.internationalClassId),
      competition: m.series?.name ?? "",
      venue: m.ground?.name ?? "",
      venueCountry: m.ground?.country?.name ?? "",
      status,
      statusText,
      startTime: m.startTime ?? m.startDate ?? "",
      score: buildScore(m),
    };
  });

  // Enrich live/upcoming matches with ground weather
  const enriched = await Promise.all(
    matches.map((m) =>
      m.status !== "completed" ? enrichWithWeather(m) : Promise.resolve(m)
    )
  );

  return {
    matches: enriched,
    lastUpdated: new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
