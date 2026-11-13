import { Button } from "@/components/ui/Button";
import { GiftCheckLarge } from "@/icons";
import {
  defaultGiftPlan,
  findGiftPlan,
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

function PlanCard({ plan, selected, onSelect }: PlanCardProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-start gap-5 self-stretch rounded-2xl p-6 transition-colors",
        selected
          ? "bg-sand-storm/8 border-sand-storm border-[1.5px]"
          : "bg-card/30 border border-white/12",
      )}
    >
      <div className="flex h-5 w-full items-center justify-between">
        <span className="text-sand-storm text-xs leading-4 font-semibold tracking-[0.96px]">
          {plan.name.toUpperCase()}
        </span>
        {plan.badge && (
          <span className="bg-sand-storm rounded-full px-2 py-0.5 text-[10px] leading-[14px] font-semibold text-black">
            {plan.badge}
          </span>
        )}
      </div>

      <p className="font-display min-h-14 w-full text-2xl leading-7 font-normal text-white">
        {plan.tagline}
      </p>

      <div className="flex w-full flex-col items-start gap-0.5">
        <div className="flex items-end gap-2">
          <span className="font-display text-[40px] leading-[44px] font-medium tracking-[-0.8px] text-white">
            {plan.price}
          </span>
          <span className="pb-1.5 text-[13px] leading-[18px] text-zinc-300/80">
            one-time
          </span>
        </div>
        <span className="text-sm leading-5 text-zinc-300">{plan.perMonth}</span>
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
