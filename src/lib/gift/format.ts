/**
 * A send time at most a minute away, or already past, is a "Now" gift (or one
 * that is due): the next sweep sends it, so a clock time would read as wrong.
 */
const SENDING_NOW_WINDOW_MS = 60_000;

export function isSendingNow(iso: string, now = Date.now()): boolean {
  const at = new Date(iso).getTime();
  return !Number.isNaN(at) && at <= now + SENDING_NOW_WINDOW_MS;
}

/**
 * Renders an instant in the zone the buyer picked, which is what the receipt,
 * the manage page and admin all display — not the viewer's local zone.
 */
export function formatGiftSendAt(iso: string, timeZone: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone,
    }).format(date);
  } catch {
    // An unrecognised IANA zone should not blank the page.
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }
}
