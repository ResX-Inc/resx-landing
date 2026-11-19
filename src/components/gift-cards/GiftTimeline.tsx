import { cn } from "@/lib/utils";

export type GiftStepState = "done" | "current" | "upcoming";

export interface GiftStep {
  label: string;
  detail?: string;
  state: GiftStepState;
}

/**
 * A gift's steps in order (paid, texted, claimed). A real sequence, so it is
 * an ordered list; the current step's marker glows slowly.
 */
export function GiftTimeline({ steps }: { steps: GiftStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        return (
          <li
            key={step.label}
            className={cn(
              "relative grid grid-cols-[22px_1fr] gap-x-3.5",
              !last && "pb-[18px]",
            )}
            aria-current={step.state === "current" ? "step" : undefined}
          >
            {!last && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-[23px] -bottom-0.5 left-2.5 w-0.5",
                  step.state === "done"
                    ? "from-sand-storm to-sand-storm/35 bg-linear-to-b"
                    : "bg-white/12",
                )}
              />
            )}
            <StepMarker state={step.state} />
            <div className="flex min-w-0 flex-col">
              <span
                className={cn(
                  "text-[15px] leading-[22px] font-medium",
                  step.state === "upcoming" ? "text-white/55" : "text-white",
                )}
              >
                {step.label}
                {step.state === "done" && (
                  <span className="sr-only"> (done)</span>
                )}
              </span>
              {step.detail && (
                <span className="text-[13px] leading-[18px] text-zinc-300/75">
                  {step.detail}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StepMarker({ state }: { state: GiftStepState }) {
  if (state === "done") {
    return (
      <span
        aria-hidden="true"
        className="bg-sand-storm relative z-1 mt-px grid size-[22px] place-items-center rounded-full"
      >
        <svg viewBox="0 0 12 12" fill="none" className="size-3">
          <path
            d="M2.5 6.2 5 8.6l4.6-5"
            stroke="#191919"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "bg-background relative z-1 mt-px grid size-[22px] place-items-center rounded-full border-2",
        state === "current" ? "border-sand-storm" : "border-white/12",
      )}
    >
      {state === "current" && (
        <>
          <span className="bg-sand-storm size-2 rounded-full" />
          {/* A slow, soft glow rather than a ping: present, not urgent. */}
          <span className="bg-sand-storm/20 absolute -inset-1.5 animate-pulse rounded-full [animation-duration:3s] motion-reduce:animate-none" />
        </>
      )}
    </span>
  );
}
