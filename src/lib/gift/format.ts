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

const GIFT_STATUS_COPY: Record<string, { label: string; detail: string }> = {
  scheduled: {
    label: "Scheduled",
    detail: "We'll text it at the time below.",
  },
  sent: {
    label: "Sent",
    detail: "The text has gone out.",
  },
  claimed: {
    label: "Claimed",
    detail: "They've opened the link.",
  },
  redeemed: {
    label: "Redeemed",
    detail: "Premium is active on their account.",
  },
  voided: {
    label: "Voided",
    detail: "This gift was refunded and will not be sent.",
  },
};

export function giftStatusCopy(status: string) {
  return GIFT_STATUS_COPY[status] ?? { label: status, detail: "" };
}
