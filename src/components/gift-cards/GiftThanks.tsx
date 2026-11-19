import { useEffect, useRef, useState } from "react";

import {
  fetchGiftCheckoutStatus,
  GiftApiError,
  type GiftCheckoutStatus,
} from "@/lib/gift/api";
import { formatGiftSendAt, isSendingNow } from "@/lib/gift/format";
import { formatMoney } from "@/lib/gift/plans";

/**
 * Polls the checkout status.
 *
 * This runs in the browser rather than on the server on purpose: the limit is
 * 60/min per IP, and under SSR every visitor would share the server's IP. A
 * 2s interval keeps one visitor at 30/min, comfortably inside the bucket.
 */
const POLL_MS = 2000;
const MAX_ATTEMPTS = 45; // ~90 seconds before we stop and offer the receipt.

type Phase = "loading" | "pending" | "ready" | "expired" | "unpaid" | "error";

export function GiftThanks({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = useState<GiftCheckoutStatus | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const attempts = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();

    const poll = async () => {
      attempts.current += 1;
      try {
        const next = await fetchGiftCheckoutStatus(
          sessionId,
          controller.signal,
        );
        if (cancelled) return;
        setStatus(next);

        if (next.gift) {
          setPhase("ready");
          return;
        }
        if (next.status === "expired") {
          setPhase("expired");
          return;
        }
        // `complete` without a gift means the webhook has not landed yet; the
        // doc is explicit that this is normal for a second or two.
        setPhase(next.status === "open" ? "unpaid" : "pending");
      } catch (error) {
        if (cancelled) return;
        if (error instanceof GiftApiError && error.isNotFound) {
          setPhase("error");
          return;
        }
        if (error instanceof GiftApiError) {
          console.error(
            `[gift] thanks poll failed (X-Request-Id: ${error.requestId ?? "none"}):`,
            error.message,
          );
        }
        setPhase((current) => (current === "loading" ? "error" : current));
      }

      if (!cancelled && attempts.current < MAX_ATTEMPTS) {
        timer = setTimeout(poll, POLL_MS);
      }
    };

    void poll();
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [sessionId]);

  const gift = status?.gift ?? null;

  if (phase === "error") {
    return (
      <Panel title="We couldn't find that order">
        <p className="text-base leading-6 text-white/80">
          This link doesn't match a gift purchase. If you've just paid, check
          your email — the receipt has everything, including a link to manage
          the gift.
        </p>
      </Panel>
    );
  }

  if (phase === "expired") {
    return (
      <Panel title="This checkout expired">
        <p className="text-base leading-6 text-white/80">
          No payment was taken. You can start again whenever you're ready.
        </p>
        <a
          href="/gift-cards/buy"
          className="text-sand-storm text-sm leading-5 font-semibold underline-offset-4 hover:underline"
        >
          Start a new gift
        </a>
      </Panel>
    );
  }

  if (phase === "unpaid") {
    return (
      <Panel title="Your payment hasn't completed">
        <p className="text-base leading-6 text-white/80">
          Nothing has been charged. If you closed the payment step early, you
          can pick up where you left off.
        </p>
        <a
          href="/gift-cards/buy"
          className="text-sand-storm text-sm leading-5 font-semibold underline-offset-4 hover:underline"
        >
          Back to the gift form
        </a>
      </Panel>
    );
  }

  if (!gift) {
    return (
      <Panel title="Finishing up…">
        <p className="text-base leading-6 text-white/80">
          Your payment went through. We're writing the gift now — this usually
          takes a second or two.
        </p>
        <span
          aria-hidden="true"
          className="bg-sand-storm/60 h-1 w-24 animate-pulse rounded-full"
        />
        {attempts.current >= MAX_ATTEMPTS && (
          <p className="text-sm leading-5 text-zinc-300/85">
            Still working. Your receipt email will arrive either way — it has a
            link to manage the gift.
          </p>
        )}
      </Panel>
    );
  }

  return (
    <Panel title="The gift is on its way">
      <p className="text-base leading-6 text-white/80">
        We've emailed your receipt. It includes a link to check on the gift or
        resend the text.
      </p>

      <dl className="flex w-full flex-col gap-3 border-t border-white/8 pt-5 text-[15px] leading-[22px]">
        <Row label="Gift">{gift.durationMonths} months of ResX Premium</Row>
        <Row label="For">
          {gift.recipientName} · {gift.recipientPhoneMasked}
        </Row>
        <Row label="Sends">
          {isSendingNow(gift.sendAt)
            ? "In the next few minutes"
            : `${formatGiftSendAt(gift.sendAt, gift.timeZone)} (${gift.timeZone})`}
        </Row>
        <Row label="Subtotal">
          {formatMoney(gift.amountSubtotal, gift.currency)}
        </Row>
        <Row label="Tax">{formatMoney(gift.amountTax, gift.currency)}</Row>
      </dl>

      <div className="flex w-full items-center justify-between border-t border-white/8 pt-4 text-white">
        <span className="text-base leading-6 font-semibold">Total paid</span>
        <span className="font-display text-2xl leading-[30px] font-medium">
          {formatMoney(gift.amountTotal, gift.currency)}
        </span>
      </div>
    </Panel>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card/30 flex w-full max-w-150 flex-col items-start gap-4 rounded-3xl border border-white/12 p-8">
      <h1 className="font-display text-[34px] leading-[38px] font-normal tracking-[-0.68px] text-white lg:text-5xl lg:leading-[52px]">
        {title}
      </h1>
      {children}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full items-start justify-between gap-6">
      <dt className="shrink-0 text-zinc-300">{label}</dt>
      <dd className="text-right text-white/90">{children}</dd>
    </div>
  );
}
