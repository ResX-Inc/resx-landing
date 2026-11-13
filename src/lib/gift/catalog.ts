import { fetchGiftCatalog, type GiftCatalog } from "./api";

/**
 * Server-side catalog cache.
 *
 * The catalog limit is 120/min per IP, and under SSR every visitor's request
 * leaves from the same server IP — so fetching per page render would pool all
 * traffic against one bucket. A short TTL keeps that to at most one call a
 * minute while still picking up operator price changes quickly.
 *
 * Caching here is safe in a way the plan-selection store was not: this is
 * public, non-personal data that is identical for every visitor.
 */
const TTL_MS = 60_000;

let cached: { data: GiftCatalog; expiresAt: number } | null = null;
let lastGood: GiftCatalog | null = null;

export async function getGiftCatalog(): Promise<GiftCatalog | null> {
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.data;

  try {
    const data = await fetchGiftCatalog();
    cached = { data, expiresAt: now + TTL_MS };
    lastGood = data;
    return data;
  } catch (error) {
    // Stale pricing beats an empty page; a hard failure only happens on a cold
    // start while the API is down, and the pages render an unavailable state.
    const requestId =
      error && typeof error === "object" && "requestId" in error
        ? (error as { requestId: string | null }).requestId
        : null;
    console.error(
      `[gift] catalog fetch failed${requestId ? ` (X-Request-Id: ${requestId})` : ""}:`,
      error instanceof Error ? error.message : error,
    );
    return lastGood;
  }
}
