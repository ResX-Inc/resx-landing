/**
 * Date and time rules for scheduling a gift text, shared by the send-time
 * picker. Everything here is in the buyer's own zone: the form posts a local
 * `YYYY-MM-DD` and `HH:mm`, and `buildSendAt` turns them into an instant.
 */

/** The soonest a scheduled gift can go out, and the default. */
export const MIN_LEAD_MINUTES = 30;
/** Times are offered on this grid. */
export const SLOT_MINUTES = 30;
/** Matches the server's limit: "any time up to 12 months out". */
export const MAX_MONTHS_AHEAD = 12;

const pad = (value: number) => String(value).padStart(2, "0");

/** `YYYY-MM-DD` in the browser's zone — the format `sendDate` has always had. */
export const toDateValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** `HH:mm`, 24-hour — the format `sendTime` has always had. */
export const toTimeValue = (date: Date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export const isSameDay = (a: Date, b: Date) =>
  toDateValue(a) === toDateValue(b);

/**
 * Now plus the lead time, rounded up to the next slot, so the default is always
 * one of the offered times. It rounds on the local clock, not the epoch: some
 * UTC offsets (Nepal's +5:45, Eucla's +8:45) are not whole half-hours, so a
 * rounded epoch would land between slots there.
 */
export function earliestSendAt(now = new Date()): Date {
  const soonest = new Date(now.getTime() + MIN_LEAD_MINUTES * 60_000);
  const hasRemainder =
    soonest.getSeconds() > 0 || soonest.getMilliseconds() > 0;
  const minuteOfDay =
    soonest.getHours() * 60 + soonest.getMinutes() + (hasRemainder ? 1 : 0);
  const slotMinute = Math.ceil(minuteOfDay / SLOT_MINUTES) * SLOT_MINUTES;
  // Date rolls 24:00 (or later) over to the next day on its own.
  return new Date(
    soonest.getFullYear(),
    soonest.getMonth(),
    soonest.getDate(),
    0,
    slotMinute,
  );
}

/** The last day a gift can be scheduled for. */
export function latestSendDate(now = new Date()): Date {
  return new Date(
    now.getFullYear(),
    now.getMonth() + MAX_MONTHS_AHEAD,
    now.getDate(),
  );
}

const ALL_SLOTS = Array.from({ length: (24 * 60) / SLOT_MINUTES }, (_, i) => {
  const minutes = i * SLOT_MINUTES;
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
});

/**
 * The `HH:mm` slots offered on `date`: none before the earliest day, only
 * those from the earliest time on that day, and every slot after it. HH:mm
 * strings compare correctly as text.
 */
export function slotsFor(date: Date, earliest: Date): string[] {
  if (date < startOfDay(earliest)) return [];
  if (!isSameDay(date, earliest)) return ALL_SLOTS;
  const floor = toTimeValue(earliest);
  return ALL_SLOTS.filter((slot) => slot >= floor);
}

const slotLabel = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

/** `"14:30"` → `"2:30 PM"` in the buyer's locale. */
export function formatSlot(value: string): string {
  const [hours, minutes] = value.split(":").map(Number);
  return slotLabel.format(new Date(2000, 0, 1, hours, minutes));
}

const shortSlotLabel = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

/**
 * `"14:30"` → `"2:30"`: the time without AM/PM, for the grid inside a part of
 * the day, where the period already says which half it is.
 */
export function formatSlotShort(value: string): string {
  const [hours, minutes] = value.split(":").map(Number);
  return shortSlotLabel
    .formatToParts(new Date(2000, 0, 1, hours, minutes))
    .filter((part) => part.type !== "dayPeriod")
    .map((part) => part.value)
    .join("")
    .trim();
}

/**
 * The parts of the day the time picker is split into, in order. Each holds at
 * most 14 slots, so a whole part fits on screen without scrolling.
 */
export const DAY_PERIODS = [
  { id: "early", label: "Early", from: "00:00", until: "06:00" },
  { id: "morning", label: "Morning", from: "06:00", until: "12:00" },
  { id: "afternoon", label: "Afternoon", from: "12:00", until: "17:00" },
  { id: "evening", label: "Evening", from: "17:00", until: "24:00" },
] as const;

export type DayPeriod = (typeof DAY_PERIODS)[number];

/** The part of the day a `HH:mm` slot falls in. */
export function periodOf(slot: string): DayPeriod {
  return (
    DAY_PERIODS.find((period) => slot >= period.from && slot < period.until) ??
    DAY_PERIODS[1]
  );
}

/** Every slot in a part of the day, offered or not. */
export function slotsInPeriod(period: DayPeriod): string[] {
  return ALL_SLOTS.filter((slot) => slot >= period.from && slot < period.until);
}

/** The buyer's zone as they would say it, e.g. "EST", for the hint line. */
export function timeZoneLabel(at = new Date()): string {
  const parts = new Intl.DateTimeFormat(undefined, {
    timeZoneName: "short",
  }).formatToParts(at);
  return (
    parts.find((part) => part.type === "timeZoneName")?.value ??
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
}
