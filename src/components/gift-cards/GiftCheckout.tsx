import {
  BillingAddressElement,
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useMemo, useState } from "react";

import { ArrowLeft } from "@/icons";
import {
  GIFT_CHECKOUT_APPEARANCE,
  GIFT_CHECKOUT_HANDOFF,
} from "@/lib/gift/checkout";
import { GIFT_SKINS, type SkinAssets } from "@/lib/gift/skins";

import { CardSkin } from "./CardSkin";

interface Handoff {
  clientSecret: string;
  checkoutSessionId: string;
  cardDesign?: string;
}

function readHandoff(): Handoff | null {
  try {
    const raw = sessionStorage.getItem(GIFT_CHECKOUT_HANDOFF);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Handoff;
    return parsed.clientSecret ? parsed : null;
  } catch {
    return null;
  }
}

export function GiftCheckout({
  publishableKey,
  assets,
}: {
  publishableKey: string;
  assets: SkinAssets;
}) {
  // Read once on mount. This island is client:only, so there is no server pass.
  const [handoff] = useState<Handoff | null>(readHandoff);

  const stripe = useMemo<Promise<Stripe | null> | null>(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey],
  );

  if (!handoff) {
    return (
      <Centered>
        <h1 className="font-display text-[34px] leading-[38px] font-normal text-white">
          Your checkout session has expired
        </h1>
        <p className="text-base leading-6 text-white/80">
          Nothing has been charged. Start again and your details will carry
          through to payment.
        </p>
        <a
          href="/gift-cards/buy"
          className="text-sand-storm text-sm leading-5 font-semibold underline-offset-4 hover:underline"
        >
          Back to the gift form
        </a>
      </Centered>
    );
  }

  if (!stripe) {
    return (
      <Centered>
        <h1 className="font-display text-[34px] leading-[38px] font-normal text-white">
          Payment isn't configured
        </h1>
        <p className="text-base leading-6 text-white/80">
          PUBLIC_STRIPE_PUBLISHABLE_KEY is missing, so the payment form can't
          load.
        </p>
      </Centered>
    );
  }

  return (
    <CheckoutElementsProvider
      stripe={stripe}
      options={{
        clientSecret: handoff.clientSecret,
        elementsOptions: { appearance: GIFT_CHECKOUT_APPEARANCE },
      }}
    >
      <CheckoutPanels cardDesign={handoff.cardDesign} assets={assets} />
    </CheckoutElementsProvider>
  );
}

function CheckoutPanels({
  cardDesign,
  assets,
}: {
  cardDesign?: string;
  assets: SkinAssets;
}) {
  const result = useCheckoutElements();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (result.type === "loading") {
    return (
      <Centered>
        <p className="text-base leading-6 text-white/80">Loading checkout…</p>
      </Centered>
    );
  }

  if (result.type === "error") {
    return (
      <Centered>
        <h1 className="font-display text-[34px] leading-[38px] font-normal text-white">
          We couldn't load checkout
        </h1>
        <p className="text-base leading-6 text-white/80">
          {result.error.message}
        </p>
        <a
          href="/gift-cards/buy"
          className="text-sand-storm text-sm leading-5 font-semibold underline-offset-4 hover:underline"
        >
          Back to the gift form
        </a>
      </Centered>
    );
  }

  const checkout = result.checkout;
  const lineItem = checkout.lineItems[0];
  const skin =
    GIFT_SKINS.find((candidate) => candidate.id === cardDesign) ??
    GIFT_SKINS[0];

  const onPay = async () => {
    setConfirming(true);
    setError(null);
    // return_url is set server-side in GIFT_CHECKOUT_RETURN_URL, so it is not
    // passed here; Stripe redirects to /gift-cards/thanks on success.
    const confirmation = await checkout.confirm();
    if (confirmation.type === "error") {
      setError(confirmation.error.message ?? "Your payment couldn't be taken.");
      setConfirming(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Summary */}
      <section className="bg-background flex justify-start px-6 pt-10 pb-10 lg:justify-end lg:px-20 lg:pt-22">
        <div className="flex w-full max-w-95 flex-col justify-between gap-10">
          <div className="flex w-full flex-col gap-8">
            <div className="flex w-full items-center gap-2.5">
              <a
                href="/gift-cards/buy"
                aria-label="Back to the gift form"
                className="text-white/70 transition-colors hover:text-white"
              >
                <ArrowLeft className="size-4" />
              </a>
              <span className="bg-umbra text-sand-storm flex size-7 items-center justify-center rounded-[14px] text-[13px] font-semibold">
                R
              </span>
              <span className="text-sm font-medium text-white">
                {checkout.businessName ?? "ResX"}
              </span>
              {!checkout.livemode && (
                <span className="rounded bg-[#ffb86b]/16 px-1.5 py-0.5 text-[11px] font-semibold text-[#ffb86b]">
                  Sandbox
                </span>
              )}
            </div>

            <div className="flex w-full flex-col gap-1">
              <span className="text-base font-medium text-[#a3a3a3]">
                Pay {checkout.businessName ?? "ResX"}
              </span>
              <span className="text-4xl font-semibold text-white">
                {checkout.total.total.amount}
              </span>
            </div>

            <div className="flex w-full flex-col gap-4">
              <div className="flex w-full items-center gap-3">
                <CardSkin
                  skin={skin}
                  assets={assets}
                  className="h-[36.571px] w-16 shrink-0 rounded-md"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium text-white">
                    {lineItem?.name ?? "ResX Premium gift"}
                  </span>
                  <span className="text-xs text-[#a3a3a3]">
                    One-time gift · Delivered by text
                  </span>
                </div>
                <span className="text-sm font-medium text-white">
                  {lineItem?.total.amount ?? checkout.total.subtotal.amount}
                </span>
              </div>

              <div aria-hidden="true" className="h-px w-full bg-white/10" />

              <div className="flex w-full items-center justify-between text-sm text-[#a3a3a3]">
                <span>Subtotal</span>
                <span>{checkout.total.subtotal.amount}</span>
              </div>
              {checkout.total.taxExclusive.minorUnitsAmount > 0 && (
                <div className="flex w-full items-center justify-between text-sm text-[#a3a3a3]">
                  <span>Tax</span>
                  <span>{checkout.total.taxExclusive.amount}</span>
                </div>
              )}
              <div className="flex w-full items-center justify-between text-sm font-semibold text-white">
                <span>Total due</span>
                <span>{checkout.total.total.amount}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#7c7c7c]">
            <span className="flex items-center gap-1">
              Powered by
              <span className="text-[13px] font-bold text-[#a3a3a3]">
                stripe
              </span>
            </span>
            <span aria-hidden="true" className="h-3.5 w-px bg-white/14" />
            <a
              href="https://stripe.com/legal/consumer"
              className="hover:text-white/80"
            >
              Terms
            </a>
            <a
              href="https://stripe.com/privacy"
              className="hover:text-white/80"
            >
              Privacy
            </a>
          </div>
        </div>
      </section>

      {/* Payment */}
      <section className="flex justify-start bg-[#212121] px-6 pt-10 pb-16 lg:px-20 lg:pt-22">
        <div className="flex w-full max-w-95 flex-col gap-5">
          <h1 className="text-base leading-[22px] font-semibold text-white">
            Pay with card
          </h1>

          {/*
            `wallets` is belt and braces next to the server's card-only
            payment_method_types: it stops Apple Pay / Google Pay being offered
            inside the card form, so this stays the one card form the design
            calls for. Dropping it (or re-adding a wallet server-side) means
            restoring an ExpressCheckoutElement with an onConfirm that hands the
            wallet's event back to checkout.confirm — without that the buttons
            render but paying silently does nothing.
          */}
          <PaymentElement
            options={{
              // "tabs", not "accordion": with a single payment method the tabs
              // layout renders the card fields bare, while the accordion layout
              // still draws a collapsible "Card" item header above them, which
              // the Figma frame (node 7:1292) does not have.
              layout: "tabs",
              wallets: { applePay: "never", googlePay: "never" },
            }}
          />

          {/*
            The session is created with `billing_address_collection: 'required'`
            (web-gift-checkout.service.ts). Until Stripe holds a complete
            billing address `checkout.canConfirm` stays false and the Pay button
            below never enables, however valid the card is — the Payment Element
            alone collects only country and postal code.
          */}
          <BillingAddressElement options={{ display: { name: "full" } }} />

          {error && (
            <p
              role="alert"
              className="border-destructive/50 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm leading-5"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={onPay}
            disabled={confirming || !checkout.canConfirm}
            className="h-[46px] w-full cursor-pointer rounded-md bg-[#B5764D] text-[15px] font-semibold text-white transition-[filter,opacity] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirming ? "Processing…" : "Pay"}
          </button>
        </div>
      </section>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="container flex min-h-screen items-center justify-center py-20">
      <div className="bg-card/30 flex w-full max-w-150 flex-col items-start gap-4 rounded-3xl border border-white/12 p-8">
        {children}
      </div>
    </div>
  );
}
