import { Button } from "@/components/ui/Button";
import { GiftCheck } from "@/icons";
import {
  defaultGiftPlan,
  findGiftPlan,
  giftBadgeLabel,
  giftCtaLabel,
  type GiftPlan,
} from "@/lib/gift/plans";
import { useSelectedDuration } from "@/lib/gift/planStore";
import { cn } from "@/lib/utils";

interface PlanTileProps {
  plan: GiftPlan;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Leads with what they're getting (the duration), then the total in bold,
 * with the monthly rate as supporting text.
 *
 * Desktop tiles are columns; on phones each tile is a full-width row (duration
 * left, pricing right), since three columns at that width wrap "12 months".
 */
function PlanTile({ plan, selected, onSelect }: PlanTileProps) {
  const badge = giftBadgeLabel(plan);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "relative flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[14px] px-3.5 py-3 text-left transition-colors sm:flex-col sm:items-start sm:gap-2",
        "focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none",
        selected
          ? "bg-sand-storm/10 border-sand-storm border-[1.5px]"
          : "bg-card/30 border border-white/12 hover:border-white/25",
      )}
    >
      {badge && (
        <span className="bg-sand-storm absolute -top-2.5 left-3.5 rounded-full px-2 py-0.5 text-[10px] leading-[14px] font-semibold text-black">
          {badge}
        </span>
      )}

      <span
        aria-hidden="true"
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center rounded-full sm:absolute sm:top-3.5 sm:right-3.5",
          selected ? "bg-sand-storm text-black" : "border-sand-storm border",
        )}
      >
        {selected && <GiftCheck className="size-3" />}
      </span>

      <span
        className={cn(
          "font-display min-w-0 flex-1 text-2xl leading-[30px] font-medium whitespace-nowrap sm:pr-6",
          selected ? "text-sand-storm" : "text-white",
        )}
      >
        {plan.name}
      </span>

      <span className="flex shrink-0 flex-col items-end gap-px sm:items-start">
        <span className="text-base leading-6 font-semibold text-white">
          {plan.price}
        </span>
        <span className="text-[12px] leading-4 text-zinc-300/80">
          {plan.perMonthShort}
        </span>
      </span>
    </button>
  );
}

export function QuickPurchase({ plans }: { plans: GiftPlan[] }) {
  const { durationMonths, select } = useSelectedDuration();
  const plan =
    findGiftPlan(plans, durationMonths ?? undefined) ?? defaultGiftPlan(plans);

  if (!plan) return null;

  return (
    <div className="flex w-full flex-col items-start gap-4 pt-2">
      <div className="flex w-full items-center gap-4">
        <span
          id="gift-quick-purchase-label"
          className="shrink-0 text-sm leading-5 text-zinc-300"
        >
          Choose a gift
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-white/8" />
      </div>

      <div
        role="radiogroup"
        aria-labelledby="gift-quick-purchase-label"
        className="flex w-full items-stretch gap-3 max-sm:flex-col"
      >
        {plans.map((candidate) => (
          <PlanTile
            key={candidate.durationMonths}
            plan={candidate}
            selected={candidate.durationMonths === plan.durationMonths}
            onSelect={() => select(candidate.durationMonths)}
          />
        ))}
      </div>

      <div className="flex w-full flex-wrap items-center gap-5">
        <Button variant="premium" size="xl" asChild>
          <a href={`/gift-cards/buy?plan=${plan.durationMonths}`}>
            {giftCtaLabel(plan)}
          </a>
        </Button>
        <div className="flex flex-col gap-0.5 text-[13px] leading-[18px]">
          <span className="font-medium text-white">
            One-time purchase. Never expires.
          </span>
          <span className="text-zinc-300/80">
            Delivered by text on the day you pick.
          </span>
        </div>
      </div>
    </div>
  );
}
