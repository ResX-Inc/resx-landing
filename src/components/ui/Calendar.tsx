import * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { ArrowLeft, ArrowRight } from "@/icons";
import { cn } from "@/lib/utils";

/**
 * A month calendar on react-day-picker v9, styled for the dark theme. The
 * library's own stylesheet is not imported: every part is styled here through
 * `classNames`, so nothing global leaks onto the rest of the site.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit select-none", className)}
      classNames={{
        root: cn(defaults.root),
        months: "relative flex flex-col",
        month: "flex w-full flex-col gap-3",
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "text-sm leading-5 font-semibold text-white",
        nav: "absolute inset-x-0 top-0 flex h-8 items-center justify-between",
        button_previous: navButtonClass,
        button_next: navButtonClass,
        month_grid: "border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 text-center text-[11px] leading-6 font-medium text-white/45",
        week: "mt-1 flex",
        day: "size-9 p-0 text-center",
        day_button: cn(
          "flex size-9 items-center justify-center rounded-full text-sm leading-5 text-white transition-colors",
          "hover:bg-white/10 focus-visible:ring-sand-storm focus-visible:ring-1 focus-visible:outline-none",
        ),
        selected:
          "[&>button]:bg-sand-storm [&>button]:font-semibold [&>button]:text-black [&>button]:hover:bg-sand-storm",
        today: "[&>button]:ring-1 [&>button]:ring-white/25",
        outside: "[&>button]:text-white/30",
        disabled:
          "[&>button]:cursor-not-allowed [&>button]:text-white/20 [&>button]:hover:bg-transparent",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClass }) =>
          orientation === "left" ? (
            <ArrowLeft className={cn("size-4", chevronClass)} />
          ) : (
            <ArrowRight className={cn("size-4", chevronClass)} />
          ),
      }}
      {...props}
    />
  );
}

const navButtonClass = cn(
  "flex size-8 items-center justify-center rounded-full text-white/70 transition-colors",
  "hover:bg-white/10 hover:text-white focus-visible:ring-sand-storm focus-visible:ring-1 focus-visible:outline-none",
  "disabled:pointer-events-none disabled:opacity-30 aria-disabled:pointer-events-none aria-disabled:opacity-30",
);

export { Calendar };
