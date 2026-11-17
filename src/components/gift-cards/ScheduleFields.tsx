import * as React from "react";

import { Calendar } from "@/components/ui/Calendar";
import { Label } from "@/components/ui/Label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Calendar as CalendarIcon, ChevronDown } from "@/icons";
import { cn } from "@/lib/utils";

/** The soonest a gift can be scheduled, and the default. */
export const MIN_LEAD_MINUTES = 30;
/** Times are offered on this grid. */
const SLOT_MINUTES = 30;
/** Matches the server's limit: "any time up to 12 months out". */
const MAX_MONTHS_AHEAD = 12;

const pad = (value: number) => String(value).padStart(2, "0");

/** `YYYY-MM-DD` in the browser's zone — the format `sendDate` has always had. */
const toDateValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** `HH:mm`, 24-hour — the format `sendTime` has always had. */
const toTimeValue = (date: Date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

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

const ALL_SLOTS = Array.from({ length: (24 * 60) / SLOT_MINUTES }, (_, i) => {
  const minutes = i * SLOT_MINUTES;
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
});

const timeLabel = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});
const formatSlot = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return timeLabel.format(new Date(2000, 0, 1, hours, minutes));
};

function formatDate(date: Date): string {
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

const fieldClass = "flex min-w-0 flex-col gap-1.5";
const controlClass = cn(
  "flex h-11 w-full items-center gap-2.5 rounded-xl border border-white/12 bg-white/4 px-3.5 text-left text-[15px] leading-[22px] text-white transition-colors",
  "hover:border-white/20",
  "focus-visible:border-sand-storm/60 focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none",
  "aria-[invalid=true]:border-destructive/70",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

interface ScheduleFieldsProps {
  /**
   * The `sendDate` error slot. It is passed as Astro slot content so it stays
   * static HTML: the page script writes into it, and React never re-renders it.
   */
  children?: React.ReactNode;
}

/**
 * Date and time for when the gift text goes out. A popover calendar for the
 * date and a select of 30-minute slots for the time.
 *
 * The form still receives the same `sendDate` (YYYY-MM-DD) and `sendTime`
 * (HH:mm) values the native inputs produced, so nothing downstream changes.
 *
 * Nothing before `MIN_LEAD_MINUTES` from now can be picked. The defaults are
 * set after mount, never during server rendering: the server's clock and zone
 * are not the buyer's. A once-a-minute tick keeps the floor moving if the page
 * is left open, and pushes a selection that has fallen behind it forward.
 */
export function ScheduleFields({ children }: ScheduleFieldsProps) {
  const [earliest, setEarliest] = React.useState<Date | null>(null);
  const [date, setDate] = React.useState<Date | undefined>();
  const [time, setTime] = React.useState("");
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const first = earliestSendAt();
    setEarliest(first);
    setDate(startOfDay(first));
    setTime(toTimeValue(first));

    const tick = window.setInterval(() => {
      const floor = earliestSendAt();
      setEarliest(floor);
      setDate((current) => {
        if (current && current < startOfDay(floor)) return startOfDay(floor);
        return current;
      });
    }, 60_000);
    return () => window.clearInterval(tick);
  }, []);

  const latest = React.useMemo(() => {
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth() + MAX_MONTHS_AHEAD,
      now.getDate(),
    );
  }, []);

  const isFirstDay =
    !!earliest && !!date && toDateValue(date) === toDateValue(earliest);
  const floorTime = earliest ? toTimeValue(earliest) : "00:00";

  // On the earliest day only the remaining slots are offered. HH:mm strings
  // compare correctly as text.
  const slots = isFirstDay
    ? ALL_SLOTS.filter((slot) => slot >= floorTime)
    : ALL_SLOTS;

  // Keep the chosen time valid whenever the floor or the day moves under it.
  React.useEffect(() => {
    if (isFirstDay && time && time < floorTime) setTime(floorTime);
  }, [isFirstDay, time, floorTime]);

  const ready = earliest !== null && date !== undefined;

  return (
    <div className="grid w-full grid-cols-2 gap-x-3 gap-y-1.5">
      <div className={fieldClass}>
        <Label htmlFor="sendDate">Delivery date</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            id="sendDate"
            type="button"
            disabled={!ready}
            className={controlClass}
          >
            <CalendarIcon className="size-4 shrink-0 text-white/50" />
            <span className={cn("truncate", !ready && "text-white/45")}>
              {ready && date ? formatDate(date) : "Pick a date"}
            </span>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              required
              selected={date}
              defaultMonth={date}
              onSelect={(day) => {
                setDate(day);
                setOpen(false);
              }}
              startMonth={earliest ?? undefined}
              endMonth={latest}
              disabled={[
                ...(earliest ? [{ before: startOfDay(earliest) }] : []),
                { after: latest },
              ]}
              autoFocus
            />
          </PopoverContent>
        </Popover>
        <input
          type="hidden"
          name="sendDate"
          value={date ? toDateValue(date) : ""}
        />
        {children}
      </div>

      <div className={fieldClass}>
        <Label htmlFor="sendTime">Delivery time</Label>
        <div className="relative">
          <select
            id="sendTime"
            name="sendTime"
            value={time}
            disabled={!ready}
            onChange={(event) => setTime(event.target.value)}
            className={cn(
              controlClass,
              "appearance-none pr-10 [color-scheme:dark]",
            )}
          >
            {!ready && <option value="">Pick a time</option>}
            {slots.map((slot) => (
              <option key={slot} value={slot} className="bg-[#232323]">
                {formatSlot(slot)}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-white/50"
          />
        </div>
      </div>

      <p className="col-span-2 text-xs leading-4 text-zinc-300/70">
        Their local time, any time from {MIN_LEAD_MINUTES} minutes to{" "}
        {MAX_MONTHS_AHEAD} months out.
      </p>
    </div>
  );
}
