import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  fetchGiftCheckoutStatus,
  GiftApiError,
  type GiftCheckoutStatus,
} from "@/lib/gift/api";
import { giftNoteFrom, type GiftNote, readGiftNote } from "@/lib/gift/checkout";
import { formatGiftSendAt, isSendingNow } from "@/lib/gift/format";
import { formatMoney } from "@/lib/gift/plans";
import { GIFT_SKINS, type SkinAssets } from "@/lib/gift/skins";

import { GiftEnvelope } from "./GiftEnvelope";
import {
  firstNameOf,
  GiftHeadline,
  GiftRow,
  GiftTwoColumn,
} from "./GiftPageParts";
import { GiftTextPreview } from "./GiftTextPreview";
import { type GiftStep, GiftTimeline } from "./GiftTimeline";

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

type Gift = NonNullable<GiftCheckoutStatus["gift"]>;

interface GiftThanksProps {
  sessionId: string;
  /** Skin artwork URLs, sized on the server (`loadLargeSkinAssets`). */
  assets: SkinAssets;
}

export function GiftThanks({ sessionId, assets }: GiftThanksProps) {
  const [status, setStatus] = useState<GiftCheckoutStatus | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [savedNote, setSavedNote] = useState<GiftNote | null>(null);
  const attempts = useRef(0);

  // sessionStorage exists only in the browser, so read it after mount.
  useEffect(() => {
    setSavedNote(readGiftNote(sessionId));
  }, [sessionId]);

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

  const skin =
    GIFT_SKINS.find((candidate) => candidate.id === gift?.cardDesign) ??
    GIFT_SKINS[0];
  // The API's copy wins; this tab's copy covers an API that predates it and
  // the moments before the gift exists, so the card back is never blank.
  const note = (gift && giftNoteFrom(gift)) ?? savedNote;

  return (
    <GiftTwoColumn
      copy={
        gift ? (
          <GiftReady gift={gift} skinName={skin.name} note={note} />
        ) : (
          <GiftWriting stillWorking={attempts.current >= MAX_ATTEMPTS} />
        )
      }
      card={
        <GiftEnvelope
          skin={skin}
          assets={assets}
          open={gift !== null}
          recipientName={gift?.recipientName ?? ""}
          durationMonths={gift?.durationMonths ?? 12}
          note={note}
        />
      }
    />
  );
}

/** The webhook has not landed yet: the envelope stays sealed. */
function GiftWriting({ stillWorking }: { stillWorking: boolean }) {
  return (
    <>
      <GiftHeadline
        title="Sealing your gift"
        lede="Your payment went through. This takes a second or two."
      />
      <GiftTimeline
        steps={[
          {
            label: "Payment received",
            detail: "Setting up the gift, usually a second or two",
            state: "current",
          },
          { label: "The gift text goes out", state: "upcoming" },
          {
            label: "They claim it and Premium starts",
            state: "upcoming",
          },
        ]}
      />
      {stillWorking && (
        <p className="text-sm leading-5 text-zinc-300/85">
          Still working. Your receipt email will arrive either way, with a link
          to manage the gift.
        </p>
      )}
    </>
  );
}

function GiftReady({
  gift,
  skinName,
  note,
}: {
  gift: Gift;
  skinName: string;
  note: GiftNote | null;
}) {
  const firstName = firstNameOf(gift.recipientName);
  const sendsNow = isSendingNow(gift.sendAt);
  const sendTime = `${formatGiftSendAt(gift.sendAt, gift.timeZone)} (${gift.timeZone})`;
  const steps: GiftStep[] = [
    { label: "Payment received", state: "done" },
    {
      label: `Text to ${firstName}`,
      detail: sendsNow ? "In the next few minutes" : sendTime,
      state: "current",
    },
    {
      label: `${firstName} claims it and Premium starts`,
      detail: `${gift.durationMonths} months, from the day ${firstName} claims it in the app`,
      state: "upcoming",
    },
  ];

  return (
    <>
      <GiftHeadline
        title={`Your gift for ${firstName} is ready`}
        lede={`We'll text it to ${gift.recipientPhoneMasked} ${sendsNow ? "in the next few minutes" : `on ${sendTime}`}.`}
      />
      <GiftTimeline steps={steps} />

      <details className="group border-t border-white/8 pt-[18px]">
        <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2 text-[15px] font-medium text-white">
            <span
              aria-hidden="true"
              className="text-white/50 transition-transform duration-200 group-open:rotate-90"
            >
              ›
            </span>
            Receipt
          </span>
          <span className="font-display text-[22px] leading-7 font-medium text-white">
            {formatMoney(gift.amountTotal, gift.currency)}
          </span>
        </summary>
        <dl className="mt-3.5 flex w-full flex-col gap-2.5 text-[15px] leading-[22px]">
          <GiftRow label="Gift">
            {gift.durationMonths} months of ResX Premium
          </GiftRow>
          <GiftRow label="For">
            {gift.recipientName} · {gift.recipientPhoneMasked}
          </GiftRow>
          <GiftRow label="Card">{skinName}</GiftRow>
          <GiftRow label="Subtotal">
            {formatMoney(gift.amountSubtotal, gift.currency)}
          </GiftRow>
          <GiftRow label="Tax">
            {formatMoney(gift.amountTax, gift.currency)}
          </GiftRow>
          <div className="flex w-full items-start justify-between gap-6 border-t border-white/8 pt-2.5 font-semibold text-white">
            <dt>Total paid</dt>
            <dd className="text-right tabular-nums">
              {formatMoney(gift.amountTotal, gift.currency)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-[13px] leading-[18px] text-zinc-300/75">
          We've emailed this receipt to you, with a link to check on the gift or
          resend the text.
        </p>
      </details>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="premium" size="xl" className="px-6 text-sm">
          <a href="/gift-cards/buy">Send another gift</a>
        </Button>
        {note?.buyerName && (
          <GiftTextPreview
            recipientName={gift.recipientName}
            durationMonths={gift.durationMonths}
            note={note}
          />
        )}
      </div>
    </>
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
