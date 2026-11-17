import { Button } from "@/components/ui/Button";
import { GiftCheckLarge } from "@/icons";
import {
  defaultGiftPlan,
  findGiftPlan,
  giftBadgeLabel,
  giftCtaLabel,
  type GiftPlan,
} from "@/lib/gift/plans";
import { useSelectedDuration } from "@/lib/gift/planStore";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: GiftPlan;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Same hierarchy as the hero's quick-purchase tiles: the duration leads, the
 * total is bold, and the monthly rate is supporting text.
 */
function PlanCard({ plan, selected, onSelect }: PlanCardProps) {
  const badge = giftBadgeLabel(plan);
  // The whole card is the control, like the hero's quick-purchase tiles. A
  // button only holds phrasing content, so the layout uses spans.
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-5 self-stretch rounded-2xl p-6 text-left transition-colors",
        "focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none",
        selected
          ? "bg-sand-storm/8 border-sand-storm border-[1.5px]"
          : "bg-card/30 border border-white/12 hover:border-white/25",
      )}
    >
      {/*
        Duration top-left, badge top-right, so every card's duration sits on
        the same line whether or not it has a badge.
      */}
      <span className="flex w-full items-start justify-between gap-2">
        <span
          className={cn(
            "font-display text-[40px] leading-[44px] font-medium tracking-[-0.8px] whitespace-nowrap lg:max-xl:text-[34px]",
            selected ? "text-sand-storm" : "text-white",
          )}
        >
          {plan.name}
        </span>
        {badge && (
          <span className="bg-sand-storm mt-1 shrink-0 rounded-full px-2 py-0.5 text-[10px] leading-[14px] font-semibold whitespace-nowrap text-black">
            {badge}
          </span>
        )}
      </span>

      <span className="flex w-full flex-col items-start gap-0.5">
        <span className="text-2xl leading-8 font-semibold text-white">
          {plan.price}
        </span>
        <span className="text-sm leading-5 text-zinc-300/80">
          {plan.perMonthShort}
        </span>
      </span>

      {/* Visual only: the card itself is the radio, and aria-checked says it. */}
      <span
        aria-hidden="true"
        className={cn(
          "flex h-11 w-full items-center justify-center gap-1.5 rounded-full text-sm leading-5 font-semibold transition-colors",
          selected
            ? "bg-sand-storm text-black"
            : "border border-white/20 text-white group-hover:border-white/40",
        )}
      >
        {selected && <GiftCheckLarge className="size-4" />}
        {selected ? "Selected" : "Select"}
      </span>
    </button>
  );
}

export function PlanPicker({ plans }: { plans: GiftPlan[] }) {
  const { durationMonths, select } = useSelectedDuration();
  const plan =
    findGiftPlan(plans, durationMonths ?? undefined) ?? defaultGiftPlan(plans);

  return (
    <div className="flex w-full flex-col items-start gap-8">
      <div className="flex w-full flex-wrap items-end justify-between gap-4">
        <h2
          id="gift-plan-picker-label"
          className="font-display text-5xl leading-[52px] font-normal text-white"
        >
          Pick their plan
        </h2>
        <p className="text-base leading-6 text-white/80">
          Every plan includes all of Premium. Pay once.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-labelledby="gift-plan-picker-label"
        className="flex w-full items-stretch gap-4 max-lg:flex-col"
      >
        {plans.map((candidate) => (
          <PlanCard
            key={candidate.durationMonths}
            plan={candidate}
            selected={candidate.durationMonths === plan?.durationMonths}
            onSelect={() => select(candidate.durationMonths)}
          />
        ))}
      </div>

      {plan && (
        <div className="flex w-full flex-wrap items-center gap-5">
          <Button variant="premium" size="xl" asChild>
            <a href={`/gift-cards/buy?plan=${plan.durationMonths}`}>
              {giftCtaLabel(plan)}
            </a>
          </Button>
          <p className="text-sm leading-5 text-zinc-300/85">
            One-time purchase · Delivered by text · Never expires
          </p>
        </div>
      )}
    </div>
  );
}
