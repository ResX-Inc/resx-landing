import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * `[color-scheme:dark]` matters here: without it the native date and time
 * pickers render as dark-on-white against this theme.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-white/12 bg-white/4 px-3.5 text-[15px] leading-[22px] text-white [color-scheme:dark] transition-colors",
        "placeholder:text-white/45",
        "focus-visible:border-sand-storm/60 focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-destructive/70 aria-[invalid=true]:focus-visible:ring-destructive",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
