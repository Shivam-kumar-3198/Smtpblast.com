import { NextResponse, type NextRequest } from "next/server";
import { getServices } from "@/lib/public-data";

/**
 * GET /api/public/services
 *
 * Feeds the Solutions dropdown in the Nav (a client component mounted on
 * every page). Replaces a per-visitor Firestore listener on the whole
 * `services` collection with one small, CDN-cacheable response that carries
 * only the three fields the menu renders.
 *
 * Takes no query parameters. Unknown ones are rejected with 400 so that
 * `?cachebust=<random>` can't be used to bypass the CDN cache.
 */

const CACHE_CONTROL = "public, max-age=60, s-maxage=300, stale-while-revalidate=600";

export async function GET(request: NextRequest) {
  const unknown = Array.from(request.nextUrl.searchParams.keys());
  if (unknown.length > 0) {
    return NextResponse.json(
      { error: `Unsupported query parameter: ${unknown[0].slice(0, 40)}` },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const services = await getServices();
    return NextResponse.json(
      services.map(({ slug, name, summary }) => ({ slug, name, summary })),
      { headers: { "Cache-Control": CACHE_CONTROL } }
    );
  } catch (err) {
    console.error("[api/public/services] failed:", err);
    return NextResponse.json(
      { error: "Service list temporarily unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
