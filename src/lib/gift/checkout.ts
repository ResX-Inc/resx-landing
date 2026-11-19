import type { Appearance } from "@stripe/stripe-js";

import type { CreateGiftCheckoutBody, GiftDurationMonths } from "./api";
import { isGiftSkinId } from "./skins";

/**
 * Where the client secret is handed from /gift-cards/buy to
 * /gift-cards/checkout. sessionStorage rather than the URL: it is scoped to
 * the tab, survives the navigation, and never reaches analytics or history.
 */
export const GIFT_CHECKOUT_HANDOFF = "resx.gift.checkout";

export interface GiftCheckoutHandoff {
  clientSecret: string;
  checkoutSessionId: string;
}

export interface GiftFormValues {
  durationMonths: number;
  recipientName: string;
  recipientPhone: string;
  message: string;
  sendDate: string;
  sendTime: string;
  senderName: string;
  senderEmail: string;
  /** The picked skin id, from the order summary's hidden `cardDesign` input. */
  cardDesign: string;
}

/** The zone the gift is scheduled against, shown on the receipt and in admin. */
export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Combines the date and time inputs into an instant.
 *
 * `new Date("YYYY-MM-DDTHH:mm")` is parsed as local time, which is what we
 * want: the buyer picked those numbers in their own zone. Empty fields fall
 * back to now, which is what the contract expects for "send immediately" —
 * there is no sendNow flag, and the server treats a few minutes in the past
 * as now.
 */
export function buildSendAt(sendDate: string, sendTime: string): string {
  if (!sendDate) return new Date().toISOString();
  const local = new Date(`${sendDate}T${sendTime || "00:00"}`);
  if (Number.isNaN(local.getTime())) return new Date().toISOString();
  return local.toISOString();
}

export function buildCheckoutPayload(
  values: GiftFormValues,
): CreateGiftCheckoutBody {
  return {
    durationMonths: values.durationMonths as GiftDurationMonths,
    recipient: {
      name: values.recipientName.trim(),
      phone: values.recipientPhone.trim(),
    },
    message: values.message.trim(),
    delivery: {
      sendAt: buildSendAt(values.sendDate, values.sendTime),
      timeZone: browserTimeZone(),
    },
    buyer: {
      name: values.senderName.trim(),
      email: values.senderEmail.trim(),
    },
    // An unknown value is left out rather than sent, so the server's default
    // applies instead of a 400.
    ...(isGiftSkinId(values.cardDesign)
      ? { cardDesign: values.cardDesign }
      : {}),
  };
}

/**
 * Appearance for the Payment Element, read from the checkout frame in Figma
 * (node 7:1284). The values were sampled from the rendered design rather than
 * estimated: panel #212121, input fill #2A2A2A, border #484848, label #D4D4D4,
 * placeholder #7C7C7C, accent #B5764D, ~6px radius.
 */
export const GIFT_CHECKOUT_APPEARANCE: Appearance = {
  theme: "night",
  labels: "above",
  variables: {
    colorBackground: "#2A2A2A",
    colorText: "#FFFFFF",
    colorTextPlaceholder: "#7C7C7C",
    colorPrimary: "#B5764D",
    colorDanger: "#ef4444",
    borderRadius: "6px",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSizeBase: "15px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      backgroundColor: "#2A2A2A",
      border: "1px solid rgba(255, 255, 255, 0.14)",
      boxShadow: "none",
    },
    ".Input:focus": {
      border: "1px solid #B5764D",
      boxShadow: "none",
    },
    ".Label": {
      color: "#D4D4D4",
      fontSize: "13px",
      fontWeight: "500",
    },
    /*
      Node 7:1292 groups its fields under a plain 13px label with no panel
      around them: the only border in the frame is the one on the field box
      itself. Stripe wraps each payment method in .Block, and under the
      accordion layout in .AccordionItem as well, which is what drew the second
      border and the "Card" strip above the card number. Both are flattened to
      nothing here so the .Input borders are the only ones left.

      .AccordionItem should not render at all now that the Payment Element uses
      the tabs layout with a single payment method, and is neutralised anyway so
      the form cannot regrow a header if a method is ever added server-side.
      There is deliberately no .Tab rule: card-only means no tabs to style.
    */
    ".Block": {
      backgroundColor: "transparent",
      border: "none",
      boxShadow: "none",
    },
    ".AccordionItem": {
      backgroundColor: "transparent",
      border: "none",
      boxShadow: "none",
    },
  },
};
