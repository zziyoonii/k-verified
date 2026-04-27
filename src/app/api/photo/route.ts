import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  const w = request.nextUrl.searchParams.get("w") ?? "400";

  if (!ref) {
    return NextResponse.json({ error: "ref is required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  // Places API (New) photo format: places/{placeId}/photos/{photoRef}
  const url = new URL(`https://places.googleapis.com/v1/${ref}/media`);
  url.searchParams.set("maxWidthPx", w);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    return NextResponse.json({ error: "Photo fetch failed" }, { status: 502 });
  }

  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "image/jpeg";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
