import {
  GIFT_DURATIONS,
  type GiftCatalog,
  type GiftDurationMonths,
} from "./api";

/**
 * Marketing copy for each duration. Prices deliberately live only in
 * `/api/gifts/catalog` — they are operator-editable and change without a
 * deploy, so nothing here may hardcode an amount.
 */
export interface GiftPlanCopy {
  durationMonths: GiftDurationMonths;
  /** Sentence-case duration, e.g. "6 months". */
  name: string;
  badge: string | null;
}

export const GIFT_PLAN_COPY: Record<GiftDurationMonths, GiftPlanCopy> = {
  3: { durationMonths: 3, name: "3 months", badge: null },
  6: { durationMonths: 6, name: "6 months", badge: null },
  12: { durationMonths: 12, name: "12 months", badge: "Best value" },
};

export interface GiftPlan extends GiftPlanCopy {
  /** Minor units, pre-tax, straight from the catalog. */
  unitAmount: number;
  currency: string;
  /** Pre-tax price. Tax is added at checkout from the billing address. */
  price: string;
  perMonth: string;
  perMonthShort: string;
  /**
   * Monthly saving against the shortest plan, e.g. `{ percent: 21, versus:
   * "3 months" }`. Null for the baseline itself and for any saving under
   * MIN_SAVINGS_PERCENT, so a small or stale discount is never advertised.
   */
  savings: { percent: number; versus: string } | null;
}

/** Below this, a "Save N%" claim reads as stingy rather than persuasive. */
const MIN_SAVINGS_PERCENT = 10;

export function formatMoney(minorUnits: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(minorUnits / 100);
  } catch {
    // An unexpected currency code should not blank the page.
    return `${(minorUnits / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

/** Joins catalog pricing to local copy, dropping durations we have no copy for. */
export function buildGiftPlans(catalog: GiftCatalog): GiftPlan[] {
  const options = catalog.options
    .filter((option) => GIFT_DURATIONS.includes(option.durationMonths))
    .sort((a, b) => a.durationMonths - b.durationMonths);

  // Savings are measured against the shortest plan's monthly rate. Prices come
  // from the catalog at runtime, so this is recomputed rather than hardcoded.
  const baseline = options[0];
  const baselineRate = baseline
    ? baseline.unitAmount / baseline.durationMonths
    : 0;

  return options.map((option) => {
    const copy = GIFT_PLAN_COPY[option.durationMonths];
    const rate = option.unitAmount / option.durationMonths;
    const perMonthFormatted = formatMoney(Math.round(rate), catalog.currency);
    const percent =
      baselineRate > 0 ? Math.floor((1 - rate / baselineRate) * 100) : 0;
    return {
      ...copy,
      unitAmount: option.unitAmount,
      currency: catalog.currency,
      price: formatMoney(option.unitAmount, catalog.currency),
      perMonth: `${perMonthFormatted} / month`,
      perMonthShort: `${perMonthFormatted}/mo`,
      savings:
        baseline && option !== baseline && percent >= MIN_SAVINGS_PERCENT
          ? { percent, versus: GIFT_PLAN_COPY[baseline.durationMonths].name }
          : null,
    };
  });
}

/**
 * Pre-selects twelve months, the best-value plan; fall back if the catalog
 * omits it.
 */
export function defaultGiftPlan(plans: GiftPlan[]): GiftPlan | undefined {
  return plans.find((plan) => plan.durationMonths === 12) ?? plans[0];
}

export function findGiftPlan(
  plans: GiftPlan[],
  durationMonths: number | undefined,
): GiftPlan | undefined {
  return plans.find((plan) => plan.durationMonths === durationMonths);
}

/** Parses the `?plan=` the landing-page call-to-action passes to /buy. */
export function parseDurationMonths(
  raw: string | null | undefined,
): GiftDurationMonths | undefined {
  const value = Number(raw);
  return GIFT_DURATIONS.find((duration) => duration === value);
}

/**
 * The pill shown on a plan, e.g. "Best value · 21% off" — the saving backs up
 * the badge. Null when the plan has neither.
 */
export function giftBadgeLabel(plan: GiftPlan): string | null {
  const parts = [plan.badge, plan.savings && `${plan.savings.percent}% off`];
  return parts.filter(Boolean).join(" · ") || null;
}

/** The label shared by every "Gift ..." call-to-action on the site. */
export function giftCtaLabel(plan: GiftPlan): string {
  return `Gift ${plan.name} · ${plan.price}`;
}
