import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache
let cache: { [key: string]: { data: unknown; timestamp: number } } = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  const stop = request.nextUrl.searchParams.get("stop");
  if (!stop) {
    return NextResponse.json({ error: "Missing stop parameter" }, { status: 400 });
  }

  const appId = process.env.TRANSPORT_API_APP_ID;
  const appKey = process.env.TRANSPORT_API_APP_KEY;

  if (!appId || !appKey) {
    return NextResponse.json(
      { error: "Transport API credentials not configured" },
      { status: 500 }
    );
  }

  // Check cache
  const cacheKey = `buses-${stop}`;
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const url = `https://transportapi.com/v3/uk/bus/stop/${stop}/live.json?app_id=${appId}&app_key=${appKey}&group=no&nextbuses=yes`;
    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      console.error(`TransportAPI error ${res.status}:`, text);
      return NextResponse.json(
        { error: `TransportAPI error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Cache the response
    cache[cacheKey] = { data, timestamp: Date.now() };

    return NextResponse.json(data);
  } catch (err) {
    console.error("Bus API fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch bus data" },
      { status: 500 }
    );
  }
}
