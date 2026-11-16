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
 * monthly rate is bold (it falls as the plan lengthens, so it carries the
 * saving), and the one-time total is supporting text.
 */
function PlanCard({ plan, selected, onSelect }: PlanCardProps) {
  const badge = giftBadgeLabel(plan);
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-start gap-5 self-stretch rounded-2xl p-6 transition-colors",
        selected
          ? "bg-sand-storm/8 border-sand-storm border-[1.5px]"
          : "bg-card/30 border border-white/12",
      )}
    >
      {/*
        Duration top-left, badge top-right, so every card's duration sits on
        the same line whether or not it has a badge.
      */}
      <div className="flex w-full items-start justify-between gap-2">
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
      </div>

      <div className="flex w-full flex-col items-start gap-0.5">
        <span className="text-2xl leading-8 font-semibold text-white">
          {plan.perMonthShort}
        </span>
        <span className="text-sm leading-5 text-zinc-300/80">
          {plan.price} total
        </span>
      </div>

      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className={cn(
          "flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full text-sm leading-5 font-semibold transition-colors",
          "focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none",
          selected
            ? "bg-sand-storm text-black"
            : "border border-white/20 text-white hover:border-white/40",
        )}
      >
        {selected && <GiftCheckLarge className="size-4" />}
        {selected ? "Selected" : "Select"}
        <span className="sr-only"> {plan.name}</span>
      </button>
    </div>
  );
}

export function PlanPicker({ plans }: { plans: GiftPlan[] }) {
  const { durationMonths, select } = useSelectedDuration();
  const plan =
    findGiftPlan(plans, durationMonths ?? undefined) ?? defaultGiftPlan(plans);

  return (
    <div className="flex w-full flex-col items-start gap-8">
      <div className="flex w-full flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-5xl leading-[52px] font-normal text-white">
          Pick their plan
        </h2>
        <p className="text-base leading-6 text-white/80">
          Every plan includes all of Premium. Pay once.
        </p>
      </div>

      <div className="flex w-full items-stretch gap-4 max-lg:flex-col">
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
