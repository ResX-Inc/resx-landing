import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex h-20 w-full resize-y rounded-xl border border-white/12 bg-white/4 px-3.5 py-3 text-[15px] leading-[22px] text-white transition-colors",
      "placeholder:text-white/45",
      "focus-visible:border-sand-storm/60 focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-destructive/70 aria-[invalid=true]:focus-visible:ring-destructive",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
