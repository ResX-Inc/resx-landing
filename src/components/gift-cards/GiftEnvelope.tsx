import * as React from "react";
import { MotionConfig, useAnimate, useReducedMotion } from "motion/react";

import type { GiftNote } from "@/lib/gift/checkout";
import type { GiftSkin, SkinAssets } from "@/lib/gift/skins";
import { cn } from "@/lib/utils";

import { GiftFlipCard } from "./GiftFlipCard";
import { firstNameOf } from "./GiftPageParts";

/** Paper grain over the envelope, so the copper reads as stock, not a fill. */
const GRAIN = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
};

/** Where the card rests once it is out: in front of the envelope, tilted. */
const CARD_OUT = { y: "-64%", rotate: -3, scale: 1.04 } as const;
/** Clear of the pocket, the moment it can move in front of the envelope. */
const CARD_LIFTED = { y: "-108%", rotate: -1, scale: 1 } as const;
/**
 * Room above the envelope, as a share of its width, for the open flap and the
 * resting card. None while sealed, so the envelope lines up with the copy;
 * it grows as the envelope opens. The card's lift peaks a little above it,
 * into the page's top padding.
 */
const HEADROOM_OPEN = "40%";

/**
 * The open state as plain styles, for an envelope that is already open when
 * the page loads. They match where the opening animation leaves each part.
 */
const AT_REST_OUT = {
  stage: { paddingTop: HEADROOM_OPEN },
  card: {
    transform: `translateY(${CARD_OUT.y}) rotate(${CARD_OUT.rotate}deg) scale(${CARD_OUT.scale})`,
  },
  flap: { transform: "rotateX(180deg)" },
  seal: { opacity: 0 },
} as const;

type Phase = "sealed" | "opening" | "closing" | "out";

/** Where the card sits in the pocket while the envelope is sealed. */
const CARD_IN = { y: "0%", rotate: 0, scale: 1 } as const;

interface GiftEnvelopeProps {
  skin: GiftSkin;
  assets: SkinAssets;
  /** False while the payment is still being written; true opens it. */
  open: boolean;
  /**
   * `"out"` renders the envelope already open, with no animation: for a page
   * the buyer comes back to, where the reveal has already happened.
   */
  initial?: "sealed" | "out";
  /** Faded and still, for a gift that will never be sent. */
  muted?: boolean;
  /**
   * Starts open, then puts the card back, seals the envelope and sends it
   * off: shown once, right after the buyer resends the text.
   */
  reseal?: boolean;
  recipientName: string;
  durationMonths: number;
  /** The buyer's message and name, when this tab still holds them. */
  note: GiftNote | null;
}

/**
 * The gift card in a sealed envelope. While `open` is false the wax seal
 * glows; when it turns true the seal breaks, the flap opens and the card
 * slides out to rest in front. Once out, the card tilts toward the pointer
 * and flips (click, tap, Enter or Space) to a note on its back.
 *
 * With reduced motion the same steps run with no duration, so the card is
 * simply out.
 */
export function GiftEnvelope({
  skin,
  assets,
  open,
  initial = "sealed",
  muted = false,
  reseal = false,
  recipientName,
  durationMonths,
  note,
}: GiftEnvelopeProps) {
  const startsOut = initial === "out" || reseal;
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduceMotion = useReducedMotion() ?? false;
  const [phase, setPhase] = React.useState<Phase>(startsOut ? "out" : "sealed");
  const [flapOpen, setFlapOpen] = React.useState(startsOut);
  const [cardInFront, setCardInFront] = React.useState(startsOut);
  const [flipped, setFlipped] = React.useState(false);

  React.useEffect(() => {
    if (reseal) return;
    if (!open || startsOut) return;
    let cancelled = false;
    const timing = (options: object) =>
      reduceMotion ? { duration: 0 } : options;

    const run = async () => {
      setPhase("opening");
      void animate(
        scope.current,
        { paddingTop: HEADROOM_OPEN },
        timing({ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }),
      );
      await animate(
        "[data-seal]",
        { scale: [1, 1.18, 0.6], opacity: [1, 1, 0] },
        timing({ duration: 0.38, times: [0, 0.35, 1] }),
      );
      if (cancelled) return;
      await animate(
        "[data-flap]",
        { rotateX: 180 },
        timing({ duration: 0.56, ease: [0.55, 0, 0.25, 1] }),
      );
      if (cancelled) return;
      setFlapOpen(true);
      await animate(
        "[data-card]",
        CARD_LIFTED,
        timing({ duration: 0.76, ease: [0.45, 0, 0.2, 1] }),
      );
      if (cancelled) return;
      setCardInFront(true);
      await animate(
        "[data-card]",
        CARD_OUT,
        timing({ type: "spring", stiffness: 260, damping: 18 }),
      );
      if (cancelled) return;
      setPhase("out");
      if (!reduceMotion) {
        void animate(
          "[data-sheen]",
          { x: ["-120%", "120%"] },
          { duration: 1.1, ease: "easeInOut" },
        );
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [open, startsOut, reseal, animate, reduceMotion]);

  // The opening, in reverse, then a small nudge as it goes.
  React.useEffect(() => {
    if (!reseal) return;
    let cancelled = false;
    const timing = (options: object) =>
      reduceMotion ? { duration: 0 } : options;

    const run = async () => {
      // Hand the at-rest pose to motion first, so it animates from there.
      await Promise.all([
        animate("[data-card]", CARD_OUT, { duration: 0 }),
        animate("[data-flap]", { rotateX: 180 }, { duration: 0 }),
        animate("[data-seal]", { opacity: 0, scale: 0.6 }, { duration: 0 }),
      ]);
      if (cancelled) return;
      setFlipped(false);
      setPhase("closing");
      // Let the page settle on the open card for a beat before it moves.
      await animate(
        "[data-card]",
        CARD_LIFTED,
        timing({ duration: 0.6, delay: 0.5, ease: [0.45, 0, 0.2, 1] }),
      );
      if (cancelled) return;
      setCardInFront(false);
      await animate(
        "[data-card]",
        CARD_IN,
        timing({ duration: 0.6, ease: [0.45, 0, 0.2, 1] }),
      );
      if (cancelled) return;
      setFlapOpen(false);
      void animate(
        scope.current,
        { paddingTop: "0%" },
        timing({ duration: 0.9, ease: [0.4, 0, 0.2, 1] }),
      );
      await animate(
        "[data-flap]",
        { rotateX: 0 },
        timing({ duration: 0.5, ease: [0.55, 0, 0.25, 1] }),
      );
      if (cancelled) return;
      await animate(
        "[data-seal]",
        { scale: [0.6, 1.14, 1], opacity: [0, 1, 1] },
        timing({ duration: 0.42, times: [0, 0.6, 1] }),
      );
      if (cancelled) return;
      if (!reduceMotion) {
        await animate(
          "[data-envelope]",
          { y: [0, -10, 0], rotate: [0, -1.2, 0] },
          { duration: 0.7, ease: "easeInOut" },
        );
      }
      if (cancelled) return;
      setPhase("sealed");
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [reseal, animate, reduceMotion, scope]);

  const isOut = phase === "out";

  const firstName = firstNameOf(recipientName);
  const message = note?.message ?? "";
  const buyerName = note?.buyerName ?? "";

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex w-full flex-col items-center gap-4">
        <div
          ref={scope}
          className="relative w-full max-w-110 pt-0"
          style={startsOut ? AT_REST_OUT.stage : undefined}
          data-phase={phase}
        >
          <div
            data-envelope
            className={cn(
              "relative aspect-[1/0.66] w-full perspective-[1400px]",
              // Safe to filter here only because a muted envelope stays
              // sealed: nothing inside is turned in 3D yet.
              muted && "opacity-45 grayscale-[0.85]",
            )}
          >
            {/* Floor shadow */}
            <div
              aria-hidden="true"
              className="absolute inset-x-[6%] -bottom-[7%] h-[12%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.6),transparent)]"
            />

            {/* Back of the envelope, with the foil liner the open flap shows */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-1 overflow-hidden rounded-xl bg-linear-to-b from-[#4b2011] to-[#34150a]"
            >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(108,45,22,0.18)_0_2px,transparent_2px_9px),linear-gradient(160deg,#f6d6a3,#d7a067_60%,#b77a46)] [clip-path:polygon(4%_3%,96%_3%,50%_48%)]" />
              <Grain />
            </div>

            {/* The card */}
            <div
              data-card
              style={startsOut ? AT_REST_OUT.card : undefined}
              className={cn(
                // A size container, so the card's cqw sizes follow its width.
                "@container absolute top-[9%] left-[6%] aspect-[366/209] w-[88%]",
                cardInFront ? "z-6" : "z-2",
              )}
            >
              <GiftFlipCard
                skin={skin}
                assets={assets}
                flipped={flipped}
                onFlippedChange={setFlipped}
                interactive={isOut}
                firstName={firstName}
                durationMonths={durationMonths}
                message={message}
                buyerName={buyerName}
              />
            </div>

            {/* Front pocket */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-3 drop-shadow-[0_-3px_4px_rgba(0,0,0,0.35)]"
            >
              <div className="absolute inset-0 rounded-b-xl bg-[linear-gradient(200deg,rgba(255,255,255,0.06),transparent_40%),linear-gradient(180deg,#96502a,#6c2d16_85%)] [clip-path:polygon(0_0,50%_52%,100%_0,100%_100%,0_100%)]">
                <Grain />
              </div>
            </div>

            {/* Flap: copper outside, foil inside */}
            <div
              data-flap
              style={startsOut ? AT_REST_OUT.flap : undefined}
              aria-hidden="true"
              className={cn(
                // Its tip reaches below the pocket's V, so nothing inside shows.
                "pointer-events-none absolute inset-x-0 top-0 h-[56%] origin-top transform-3d",
                flapOpen ? "z-1" : "z-4",
              )}
            >
              {/* No filter or opacity here: either flattens the 3D, and the
                  open flap would show its copper side instead of the foil. */}
              <div className="absolute inset-0 transform-3d">
                <div className="absolute inset-0 bg-linear-to-b from-[#b0663a] to-[#7f3d1d] [clip-path:polygon(0_0,100%_0,50%_100%)] backface-hidden">
                  <Grain />
                </div>
                {/* Pre-turned, so its hinge edge is at its own bottom. */}
                <div className="absolute inset-0 rotate-x-180 bg-linear-to-b from-[#e9c18b] to-[#c48a55] [clip-path:polygon(0_100%,100%_100%,50%_0)] backface-hidden" />
              </div>
            </div>

            {/* Wax seal, glowing while the payment is written */}
            <div
              aria-hidden="true"
              className="absolute top-[51%] left-1/2 z-5 aspect-square w-[17%] -translate-x-1/2 -translate-y-1/2"
            >
              {!open && !muted && phase === "sealed" && (
                <span className="bg-sand-storm/20 absolute -inset-[16%] animate-pulse rounded-full blur-md [animation-duration:3s] motion-reduce:animate-none" />
              )}
              <div
                data-seal
                style={startsOut ? AT_REST_OUT.seal : undefined}
                className="relative grid size-full place-items-center rounded-full bg-[radial-gradient(circle_at_34%_30%,#fff1d6,#ffd9a1_30%,#d7a066_66%,#a96f3c)] shadow-[inset_0_0_0_3px_rgba(108,45,22,0.18),inset_0_-4px_8px_rgba(108,45,22,0.35),0_6px_14px_rgba(0,0,0,0.45)]"
              >
                <span className="absolute inset-[14%] rounded-full border-[1.5px] border-[#6c2d16]/35" />
                <span className="font-display text-[clamp(14px,4.4vw,26px)] leading-none font-semibold text-[#6c2d16]/75">
                  R
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Left out until the gift is known, so the sealed envelope sits close
            to the copy. They arrive as it opens, which moves things anyway. */}
        {recipientName && (
          <>
            <div
              className={cn(
                "flex flex-col items-center gap-0.5 text-center",
                muted && "opacity-55",
              )}
            >
              <span className="font-display text-sand-storm text-xl leading-[26px]">
                {durationMonths} months of ResX Premium
              </span>
              <span className="text-[13px] leading-[18px] text-zinc-300/75">
                For {recipientName}
              </span>
            </div>
            <span
              className={cn(
                "min-h-[18px] text-[13px] leading-[18px] text-zinc-300/60 transition-opacity duration-300",
                isOut ? "opacity-100" : "opacity-0",
              )}
            >
              Tap the card to turn it over
            </span>
          </>
        )}
      </div>
    </MotionConfig>
  );
}

function Grain() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
      style={GRAIN}
    />
  );
}
