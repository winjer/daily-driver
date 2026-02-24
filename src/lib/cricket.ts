import { CricketData, CricketMatch } from "./types";

interface RSSMatch {
  title: string;
  matchId: string;
  link: string;
}

// Parse the RSS title format: "Team A 123/4 * v Team B 456/7"
// The * indicates which team is batting. No * means upcoming/result.
function parseRSSTitle(title: string): {
  teams: string[];
  score: string | undefined;
  isLive: boolean;
} {
  const isLive = title.includes("*");

  // Split on " v " to get two sides
  const parts = title.split(" v ");
  if (parts.length < 2) {
    return { teams: [title.trim()], score: undefined, isLive };
  }

  // Each side may contain: "Team Name 123/4 & 234/5 *"
  // Extract team name by removing score portions
  const extractTeam = (s: string) =>
    s
      .replace(/\d+\/\d+/g, "")  // remove "123/4"
      .replace(/\d+/g, "")       // remove standalone numbers
      .replace(/[*&]/g, "")      // remove * and &
      .replace(/\(.*?\)/g, "")   // remove parenthesized content like "(f/o)"
      .trim();

  const teams = parts.map(extractTeam).filter(Boolean);
  const score = isLive ? title.replace(/\s*\*\s*/g, " *") : undefined;

  return { teams, score, isLive };
}

// Check if a match involves England (including Lions, Women)
function isEnglandMatch(teams: string[]): boolean {
  return teams.some((t) => {
    const lower = t.toLowerCase();
    return lower.includes("england");
  });
}

export async function fetchCricket(): Promise<CricketData> {
  const res = await fetch("/api/cricket");
  if (!res.ok) throw new Error(`Cricket API error: ${res.status}`);

  const data: { matches: RSSMatch[] } = await res.json();

  const matches: CricketMatch[] = data.matches
    .map((m) => {
      const { teams, score, isLive } = parseRSSTitle(m.title);

      return {
        id: m.matchId,
        teams,
        format: "",
        competition: "",
        venue: "",
        venueCountry: "",
        status: isLive ? "live" : "upcoming",
        statusText: isLive ? "In progress" : "",
        startTime: "",
        score,
      };
    })
    .filter((m) => isEnglandMatch(m.teams));

  return {
    matches,
    lastUpdated: new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
