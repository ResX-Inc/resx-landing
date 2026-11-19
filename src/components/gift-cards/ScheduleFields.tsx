import * as React from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";

import { Calendar } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Calendar as CalendarIcon, ChevronDown, ClockTimeTwo } from "@/icons";
import {
  addDays,
  DAY_PERIODS,
  type DayPeriod,
  earliestSendAt,
  formatSlot,
  formatSlotShort,
  isSameDay,
  latestSendDate,
  MAX_MONTHS_AHEAD,
  periodOf,
  slotsFor,
  slotsInPeriod,
  startOfDay,
  timeZoneLabel,
  toDateValue,
  toTimeValue,
} from "@/lib/gift/schedule";
import { cn } from "@/lib/utils";

type SendMode = "now" | "later";

/** One spring for every slide here: quick, with no visible bounce. */
const SPRING = {
  type: "spring",
  stiffness: 520,
  damping: 42,
  mass: 0.9,
} as const;

const MODES: { value: SendMode; label: string }[] = [
  { value: "now", label: "Now" },
  { value: "later", label: "Schedule" },
];

const shortDayLabel = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
});
const fullDayLabel = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

/** "Today", "Tomorrow", or "Sat, Dec 19". */
function dayName(date: Date): string {
  const today = startOfDay(new Date());
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, addDays(today, 1))) return "Tomorrow";
  return shortDayLabel.format(date);
}

const focusRing =
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white";

/** The site's field look (Input, the old date button), opening a popover. */
const fieldClass = cn(
  "flex h-11 w-full min-w-0 items-center gap-2.5 rounded-xl border border-white/12 bg-white/4 px-3.5 text-left text-[15px] leading-[22px] text-white transition-colors",
  "hover:border-white/20 focus-visible:border-sand-storm/60 focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none data-[state=open]:border-sand-storm/60",
);

interface ScheduleFieldsProps {
  /**
   * The `sendAt` error slot. It is passed as Astro slot content so it stays
   * static HTML: the page script writes into it, and React never re-renders it.
   */
  children?: React.ReactNode;
}

/**
 * When the gift text goes out: "Now", or a date and a time. The date opens
 * the site calendar and the time opens a grid split into parts of the day,
 * so any choice is two taps and nothing scrolls.
 *
 * The form still receives `sendDate` (YYYY-MM-DD) and `sendTime` (HH:mm). Now
 * posts both empty, which `buildSendAt` sends as the current instant.
 *
 * Scheduling starts `MIN_LEAD_MINUTES` from now. The clock-dependent parts
 * render after mount, never during server rendering: the server's clock and
 * zone are not the buyer's. A once-a-minute tick keeps the floor moving if the
 * page is left open, and pushes a selection that has fallen behind it forward.
 */
export function ScheduleFields({ children }: ScheduleFieldsProps) {
  const id = React.useId();
  const [mode, setMode] = React.useState<SendMode>("now");
  const [earliest, setEarliest] = React.useState<Date | null>(null);
  const [date, setDate] = React.useState<Date | undefined>();
  const [time, setTime] = React.useState("");

  React.useEffect(() => {
    const first = earliestSendAt();
    setEarliest(first);
    setDate(startOfDay(first));
    setTime(toTimeValue(first));

    const tick = window.setInterval(() => {
      const floor = earliestSendAt();
      setEarliest(floor);
      setDate((current) =>
        current && current < startOfDay(floor) ? startOfDay(floor) : current,
      );
    }, 60_000);
    return () => window.clearInterval(tick);
  }, []);

  const slots = React.useMemo(
    () => (earliest && date ? slotsFor(date, earliest) : []),
    [earliest, date],
  );

  // Keep the chosen time valid whenever the floor or the day moves under it.
  React.useEffect(() => {
    if (slots.length > 0 && !slots.includes(time)) setTime(slots[0]);
  }, [slots, time]);

  const scheduled = mode === "later";
  const hint =
    scheduled && earliest
      ? `Your time (${timeZoneLabel(earliest)}). Up to ${MAX_MONTHS_AHEAD} months out.`
      : "We'll text it a few minutes after you pay.";

  return (
    <MotionConfig reducedMotion="user" transition={SPRING}>
      <div className="flex w-full flex-col">
        <div className="flex flex-col gap-1.5">
          <span
            id={`${id}-label`}
            className="block text-[13px] leading-[18px] font-medium text-zinc-300"
          >
            When should it arrive?
          </span>
          <ModeSwitch id={id} mode={mode} onChange={setMode} />
        </div>

        <AnimatePresence initial={false}>
          {scheduled && earliest && date && (
            <motion.div
              key="schedule"
              className="overflow-hidden"
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 12 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
            >
              <div className="grid w-full grid-cols-2 gap-3">
                <DateField earliest={earliest} date={date} onPick={setDate} />
                <TimeField id={id} slots={slots} time={time} onPick={setTime} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 flex flex-col gap-1.5">
          <p className="text-xs leading-4 text-zinc-300/70">{hint}</p>
          {children}
        </div>

        <input
          type="hidden"
          name="sendDate"
          value={scheduled && date ? toDateValue(date) : ""}
        />
        <input type="hidden" name="sendTime" value={scheduled ? time : ""} />
      </div>
    </MotionConfig>
  );
}

interface ModeSwitchProps {
  id: string;
  mode: SendMode;
  onChange: (mode: SendMode) => void;
}

/**
 * Now or Schedule, with a sand thumb that slides to the choice. It carries
 * `id="sendAt"` so the server's `delivery.sendAt` errors mark and focus it.
 */
function ModeSwitch({ id, mode, onChange }: ModeSwitchProps) {
  return (
    <div
      id="sendAt"
      tabIndex={-1}
      role="radiogroup"
      aria-labelledby={`${id}-label`}
      onKeyDown={moveWithArrows}
      className="aria-[invalid=true]:border-destructive/70 grid h-11 w-full grid-cols-2 rounded-xl border border-white/12 bg-white/4 p-[3px] outline-none"
    >
      {MODES.map((option) => {
        const checked = option.value === mode;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative rounded-[9px] text-[15px] leading-[22px] font-medium transition-colors duration-200",
              focusRing,
              checked ? "text-black" : "text-white/70 hover:text-white",
            )}
          >
            {checked && (
              <motion.span
                layoutId={`${id}-mode`}
                aria-hidden="true"
                className="bg-sand-storm absolute inset-0 rounded-[9px] shadow-[0_1px_2px_rgba(0,0,0,0.35),0_8px_20px_-8px_rgba(255,217,161,0.5)]"
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface DateFieldProps {
  earliest: Date;
  date: Date;
  onPick: (date: Date) => void;
}

/** The date, opening the site calendar: any day this year is one click. */
function DateField({ earliest, date, onPick }: DateFieldProps) {
  const [open, setOpen] = React.useState(false);
  const latest = latestSendDate();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger type="button" className={fieldClass}>
        <CalendarIcon className="size-4 shrink-0 text-white/50" />
        <span className="truncate">
          <span className="sr-only">Date: </span>
          {dayName(date)}
          <span className="sr-only">, {fullDayLabel.format(date)}</span>
        </span>
        <ChevronDown className="ml-auto size-4 shrink-0 text-white/50" />
      </PopoverTrigger>
      <PopoverContent align="start">
        <Calendar
          mode="single"
          required
          selected={date}
          defaultMonth={date}
          onSelect={(day) => {
            onPick(day);
            setOpen(false);
          }}
          startMonth={earliest}
          endMonth={latest}
          disabled={[{ before: startOfDay(earliest) }, { after: latest }]}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface TimeFieldProps {
  id: string;
  /** The `HH:mm` slots offered on the chosen date. */
  slots: string[];
  time: string;
  onPick: (time: string) => void;
}

/**
 * The time, opening a grid for one part of the day at a time. It opens on the
 * part holding the current choice; parts with nothing left today are disabled.
 */
function TimeField({ id, slots, time, onPick }: TimeFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [period, setPeriod] = React.useState<DayPeriod>(() => periodOf(time));
  const offered = new Set(slots);

  const onOpenChange = (next: boolean) => {
    if (next) setPeriod(periodOf(time));
    setOpen(next);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger type="button" className={fieldClass}>
        <ClockTimeTwo className="size-4 shrink-0 text-white/50" />
        <span className="truncate tabular-nums">
          <span className="sr-only">Time: </span>
          {formatSlot(time)}
        </span>
        <ChevronDown className="ml-auto size-4 shrink-0 text-white/50" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[296px]">
        <div
          role="radiogroup"
          aria-label="Part of the day"
          onKeyDown={moveWithArrows}
          className="grid grid-cols-4 rounded-lg bg-white/5 p-0.5"
        >
          {DAY_PERIODS.map((option) => {
            const checked = option.id === period.id;
            const empty = !slotsInPeriod(option).some((s) => offered.has(s));
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                disabled={empty}
                onClick={() => setPeriod(option)}
                className={cn(
                  "relative h-8 rounded-md text-xs leading-4 font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:text-white/25",
                  focusRing,
                  checked ? "text-white" : "text-white/60 hover:text-white",
                )}
              >
                {checked && (
                  <motion.span
                    layoutId={`${id}-period`}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-md bg-white/12"
                  />
                )}
                <span className="relative">{option.label}</span>
              </button>
            );
          })}
        </div>

        <div
          role="radiogroup"
          aria-label={`${period.label} times`}
          onKeyDown={moveWithArrows}
          className="mt-3 grid grid-cols-4 gap-1.5"
        >
          {slotsInPeriod(period).map((slot) => {
            const checked = slot === time;
            return (
              <button
                key={slot}
                type="button"
                role="radio"
                aria-checked={checked}
                aria-label={formatSlot(slot)}
                tabIndex={checked ? 0 : -1}
                disabled={!offered.has(slot)}
                onClick={() => {
                  onPick(slot);
                  setOpen(false);
                }}
                className={cn(
                  "h-9 rounded-lg text-sm leading-5 font-medium tabular-nums transition-colors duration-150",
                  "disabled:cursor-not-allowed disabled:text-white/20 disabled:hover:bg-transparent",
                  focusRing,
                  checked
                    ? "bg-sand-storm font-semibold text-black"
                    : "text-white hover:bg-white/10",
                )}
              >
                {formatSlotShort(slot)}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Left and right arrows move the choice within a radio group, as native radios do. */
function moveWithArrows(event: React.KeyboardEvent<HTMLElement>) {
  const step =
    event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
  if (step === 0) return;
  const radios = [
    ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
      '[role="radio"]:not(:disabled)',
    ),
  ];
  const next = radios[radios.indexOf(event.target as HTMLButtonElement) + step];
  if (!next) return;
  event.preventDefault();
  next.click();
  next.focus();
}
