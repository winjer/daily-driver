import { NextResponse } from "next/server";

// Simple in-memory cache
let cache: { data: RSSMatch[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface RSSMatch {
  title: string;
  matchId: string;
  link: string;
}

function parseRSS(xml: string): RSSMatch[] {
  const matches: RSSMatch[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let itemMatch;

  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const block = itemMatch[1];
    const title = block.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? "";
    const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "";
    const matchId = link.match(/\/(\d+)\.html/)?.[1] ?? "";

    if (title && matchId) {
      // Decode HTML entities
      const decoded = title
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"');
      matches.push({ title: decoded, matchId, link });
    }
  }

  return matches;
}

export async function GET() {
  // Check cache
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json({ matches: cache.data });
  }

  try {
    const res = await fetch("http://static.cricinfo.com/rss/livescores.xml", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Cricinfo RSS error: ${res.status}` },
        { status: res.status }
      );
    }

    const xml = await res.text();
    const matches = parseRSS(xml);

    cache = { data: matches, timestamp: Date.now() };

    return NextResponse.json({ matches });
  } catch (err) {
    console.error("Cricket RSS fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch cricket data" },
      { status: 500 }
    );
  }
}
