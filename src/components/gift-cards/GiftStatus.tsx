import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import type { GiftManageStatus } from "@/lib/gift/api";
import { giftNoteFrom } from "@/lib/gift/checkout";
import { formatGiftSendAt, isSendingNow } from "@/lib/gift/format";
import { GIFT_SKINS, type SkinAssets } from "@/lib/gift/skins";

import { GiftEnvelope } from "./GiftEnvelope";
import {
  firstNameOf,
  GiftHeadline,
  GiftRow,
  GiftTwoColumn,
} from "./GiftPageParts";
import { type GiftStep, GiftTimeline } from "./GiftTimeline";

/** What `/api/gift/resend` reports back through `?resend=`. */
export type ResendOutcome = "ok" | "conflict" | "limited" | "expired" | "error";

const RESEND_MESSAGES: Record<ResendOutcome, string> = {
  ok: "Resending now. The text goes out again within five minutes.",
  conflict: "This gift can't be resent right now.",
  limited: "You've reached the resend limit for this gift.",
  expired: "Your session timed out. Open the link from your receipt again.",
  error: "Something went wrong. Please try again shortly.",
};

interface GiftStatusProps {
  gift: GiftManageStatus;
  /** Skin artwork URLs, sized on the server (`loadLargeSkinAssets`). */
  assets: SkinAssets;
  resend: ResendOutcome | null;
}

interface StatusView {
  title: string;
  lede: string;
  steps: GiftStep[];
  /** Sealed until the text goes out; muted once it never will. */
  envelope: "sealed" | "out" | "muted";
}

/**
 * The manage page the receipt links to: where the gift is, with the card the
 * buyer picked. The envelope is already open once the text has gone out, so
 * coming back does not replay the reveal from the Thanks page.
 */
export function GiftStatus({ gift, assets, resend }: GiftStatusProps) {
  const skin =
    GIFT_SKINS.find((candidate) => candidate.id === gift.cardDesign) ??
    GIFT_SKINS[0];
  const view = statusView(gift);
  // A resend turns the gift back to scheduled, due now.
  const resealing = resend === "ok" && gift.status === "scheduled";

  // The outcome is shown once: a refresh should not replay it.
  useEffect(() => {
    if (!resend) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("resend");
    window.history.replaceState(window.history.state, "", url);
  }, [resend]);

  return (
    <GiftTwoColumn
      copy={
        <>
          <GiftHeadline title={view.title} lede={view.lede} />
          {resend && (
            <p
              role="status"
              className="border-sand-storm/40 bg-sand-storm/10 text-sand-storm rounded-xl border px-4 py-3 text-sm leading-5"
            >
              {RESEND_MESSAGES[resend]}
            </p>
          )}
          {view.steps.length > 0 && <GiftTimeline steps={view.steps} />}

          <dl className="flex w-full flex-col gap-2.5 border-t border-white/8 pt-[18px] text-[15px] leading-[22px]">
            <GiftRow label="Gift">
              {gift.durationMonths} months of ResX Premium
            </GiftRow>
            <GiftRow label="For">
              {gift.recipientName} · {gift.recipientPhoneMasked}
            </GiftRow>
            <GiftRow label="Card">{skin.name}</GiftRow>
          </dl>

          <GiftActions
            canResend={gift.canResend && resend !== "ok"}
            firstName={firstNameOf(gift.recipientName)}
            phoneMasked={gift.recipientPhoneMasked}
          />
        </>
      }
      card={
        <GiftEnvelope
          skin={skin}
          assets={assets}
          open={view.envelope === "out"}
          initial={view.envelope === "out" ? "out" : "sealed"}
          muted={view.envelope === "muted"}
          reseal={resealing}
          recipientName={gift.recipientName}
          durationMonths={gift.durationMonths}
          note={giftNoteFrom(gift)}
        />
      }
    />
  );
}

function statusView(gift: GiftManageStatus): StatusView {
  const first = firstNameOf(gift.recipientName);
  const months = gift.durationMonths;
  const when = `${formatGiftSendAt(gift.sendAt, gift.timeZone)} (${gift.timeZone})`;
  const paid: GiftStep = { label: "Payment received", state: "done" };
  const texted: GiftStep = {
    label: `Text sent to ${first}`,
    detail: when,
    state: "done",
  };

  switch (gift.status) {
    case "scheduled": {
      // A resend puts the gift back here, due now.
      const soon = isSendingNow(gift.sendAt);
      return {
        title: `${first}'s gift is scheduled`,
        lede: `We'll text it to ${gift.recipientPhoneMasked} ${soon ? "in the next few minutes" : `on ${when}`}.`,
        steps: [
          paid,
          {
            label: `Text to ${first}`,
            detail: soon ? "In the next few minutes" : when,
            state: "current",
          },
          {
            label: `${first} claims it and Premium starts`,
            detail: `${months} months, from the day ${first} claims it in the app`,
            state: "upcoming",
          },
        ],
        envelope: "sealed",
      };
    }
    case "sent":
      return {
        title: `We texted the gift to ${first}`,
        lede: `It went to ${gift.recipientPhoneMasked} on ${when}. Next, ${first} claims it in the app.`,
        steps: [
          paid,
          texted,
          {
            label: `${first} claims it and Premium starts`,
            detail: `Waiting for ${first} to claim it`,
            state: "current",
          },
        ],
        envelope: "out",
      };
    case "claimed":
      // Claimed while already Premium: the gift waits for that plan to end.
      return {
        title: `${first} claimed the gift`,
        lede: `${first} already has Premium, so the ${months} months start when their current plan ends.`,
        steps: [
          paid,
          texted,
          {
            label: `${first} claimed it`,
            detail: "Premium starts when their current plan ends",
            state: "current",
          },
        ],
        envelope: "out",
      };
    case "redeemed":
      return {
        title: `${first}'s Premium is active`,
        lede: `${months} months of ResX Premium are on ${first}'s account.`,
        steps: [
          paid,
          texted,
          { label: `${first} claimed it and Premium started`, state: "done" },
        ],
        envelope: "out",
      };
    case "voided":
      return {
        title: "This gift was refunded",
        lede: `It won't be sent, and ${first} won't get a text.`,
        steps: [],
        envelope: "muted",
      };
  }
}

/**
 * The page's actions in one row: sending another gift, and resending this
 * one's text when it can be. Resending asks first, in place of the row, since
 * each resend texts the recipient again and counts toward the gift's limit.
 * The form posts to the server route, which holds the token in an HttpOnly
 * cookie.
 */
function GiftActions({
  canResend,
  firstName,
  phoneMasked,
}: {
  canResend: boolean;
  firstName: string;
  phoneMasked: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const askRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
    else if (wasConfirming.current) askRef.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  if (confirming) {
    return (
      <form
        method="post"
        action="/api/gift/resend"
        className="animate-in fade-in-0 slide-in-from-bottom-1 flex flex-col gap-4 rounded-2xl border border-white/12 bg-white/[0.03] p-5 duration-300 motion-reduce:animate-none"
      >
        <div className="flex flex-col gap-1">
          <p className="text-[15px] leading-[22px] font-medium text-white">
            Send the text to {firstName} again?
          </p>
          <p className="text-[13px] leading-[18px] text-zinc-300/80">
            It goes to {phoneMasked} within five minutes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <Button
            ref={confirmRef}
            type="submit"
            variant="premium"
            size="xl"
            className="px-6 text-sm"
          >
            Resend the text
          </Button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="focus-visible:outline-sand-storm cursor-pointer rounded-sm text-sm leading-5 font-semibold text-white/70 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button asChild variant="premium" size="xl" className="px-6 text-sm">
        <a href="/gift-cards/buy">Send another gift</a>
      </Button>
      {canResend && (
        <Button
          ref={askRef}
          type="button"
          variant="outline"
          size="xl"
          onClick={() => setConfirming(true)}
          className="border-white/20 bg-transparent px-6 text-sm hover:border-white/40 hover:bg-transparent hover:text-white"
        >
          Resend the text
        </Button>
      )}
    </div>
  );
}
