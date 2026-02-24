import { NextResponse } from "next/server";

// Simple in-memory cache
let cache: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  // Check cache
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    // ESPN Cricinfo consumer API - returns current and upcoming matches
    const url =
      "https://hs-consumer-api.espncricinfo.com/v1/pages/matches/current?lang=en";
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`ESPN Cricinfo error ${res.status}:`, text);
      return NextResponse.json(
        { error: `ESPN Cricinfo error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Cache the response
    cache = { data, timestamp: Date.now() };

    return NextResponse.json(data);
  } catch (err) {
    console.error("Cricket API fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch cricket data" },
      { status: 500 }
    );
  }
}
