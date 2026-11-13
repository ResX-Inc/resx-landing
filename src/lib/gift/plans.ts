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
  tagline: string;
  badge: string | null;
}

export const GIFT_PLAN_COPY: Record<GiftDurationMonths, GiftPlanCopy> = {
  3: {
    durationMonths: 3,
    name: "3 months",
    tagline: "A taste of first access.",
    badge: null,
  },
  6: {
    durationMonths: 6,
    name: "6 months",
    tagline: "Through spring, sorted.",
    badge: null,
  },
  12: {
    durationMonths: 12,
    name: "12 months",
    tagline: "A year of the city's best.",
    badge: "Best value",
  },
};

export interface GiftPlan extends GiftPlanCopy {
  /** Minor units, pre-tax, straight from the catalog. */
  unitAmount: number;
  currency: string;
  /** Pre-tax price. Tax is added at checkout from the billing address. */
  price: string;
  perMonth: string;
  perMonthShort: string;
}

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
  return catalog.options
    .filter((option) => GIFT_DURATIONS.includes(option.durationMonths))
    .sort((a, b) => a.durationMonths - b.durationMonths)
    .map((option) => {
      const copy = GIFT_PLAN_COPY[option.durationMonths];
      const perMonthMinor = Math.round(
        option.unitAmount / option.durationMonths,
      );
      const perMonthFormatted = formatMoney(perMonthMinor, catalog.currency);
      return {
        ...copy,
        unitAmount: option.unitAmount,
        currency: catalog.currency,
        price: formatMoney(option.unitAmount, catalog.currency),
        perMonth: `${perMonthFormatted} / month`,
        perMonthShort: `${perMonthFormatted}/mo`,
      };
    });
}

/** The design pre-selects six months; fall back if the catalog omits it. */
export function defaultGiftPlan(plans: GiftPlan[]): GiftPlan | undefined {
  return plans.find((plan) => plan.durationMonths === 6) ?? plans[0];
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

/** The label shared by every "Gift ..." call-to-action on the site. */
export function giftCtaLabel(plan: GiftPlan): string {
  return `Gift ${plan.name} · ${plan.price}`;
}
