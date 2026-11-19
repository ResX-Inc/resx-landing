import * as React from "react";
import { useAnimate, useReducedMotion } from "motion/react";

import type { GiftSkin, SkinAssets } from "@/lib/gift/skins";
import { cn } from "@/lib/utils";

import { CardSkin } from "./CardSkin";

export interface GiftNoteContent {
  /** The recipient's first name; empty until it is known. */
  firstName: string;
  durationMonths: number;
  message: string;
  buyerName: string;
  /**
   * True while the buyer is still filling the note in: the empty spots then
   * show what goes there ("From", a faint message line) instead of hiding.
   */
  editing?: boolean;
}

interface GiftFlipCardProps extends GiftNoteContent {
  skin: GiftSkin;
  assets: SkinAssets;
  flipped: boolean;
  onFlippedChange: (flipped: boolean) => void;
  /** False while the card cannot be handled, e.g. still in the envelope. */
  interactive?: boolean;
  /** A sheen crosses the front whenever this changes, e.g. a new design. */
  sheenKey?: string;
}

/**
 * The gift card itself: the design on the front, the buyer's note on the
 * back. It tilts toward a mouse pointer and turns over on click, tap, Enter
 * or Space. Fills its parent, which must be positioned and a size container
 * (`@container`) with the card's 366:209 shape, since the card sizes in cqw.
 */
export function GiftFlipCard({
  skin,
  assets,
  flipped,
  onFlippedChange,
  interactive = true,
  sheenKey,
  ...note
}: GiftFlipCardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const tiltRef = React.useRef<HTMLDivElement>(null);
  const [scope, animate] = useAnimate<HTMLButtonElement>();
  const firstSheen = React.useRef(true);

  React.useEffect(() => {
    if (firstSheen.current) {
      firstSheen.current = false;
      return;
    }
    if (reduceMotion || sheenKey === undefined) return;
    void animate(
      "[data-sheen]",
      { x: ["-120%", "120%"] },
      { duration: 0.9, ease: "easeInOut" },
    );
  }, [sheenKey, animate, reduceMotion]);

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const tilt = tiltRef.current;
    if (
      !interactive ||
      reduceMotion ||
      event.pointerType !== "mouse" ||
      !tilt
    ) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    tilt.style.transform = `rotateX(${(-y * 14).toFixed(2)}deg) rotateY(${(x * 18).toFixed(2)}deg)`;
    tilt.style.setProperty("--glare-x", `${(x + 0.5) * 100}%`);
    tilt.style.setProperty("--glare-y", `${(y + 0.5) * 100}%`);
    tilt.style.setProperty("--glare", "1");
  };

  const onPointerLeave = () => {
    const tilt = tiltRef.current;
    if (!tilt) return;
    tilt.style.transform = "";
    tilt.style.setProperty("--glare", "0");
  };

  const forWhom = note.firstName ? ` for ${note.firstName}` : "";

  return (
    <button
      ref={scope}
      type="button"
      disabled={!interactive}
      aria-hidden={!interactive}
      aria-pressed={flipped}
      aria-label={
        flipped
          ? "Gift card, showing the note. Press to see the front."
          : `${skin.name} gift card${forWhom}. Press to see the note.`
      }
      onClick={() => onFlippedChange(!flipped)}
      // A mouse press leaves focus where it was, so pressing the card while
      // typing does not blur the field. Keyboard focus is unaffected.
      onMouseDown={(event) => event.preventDefault()}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="focus-visible:outline-sand-storm absolute inset-0 rounded-[4.2cqw] perspective-[1100px] focus-visible:outline-2 focus-visible:outline-offset-4 enabled:cursor-pointer disabled:cursor-default"
    >
      <div
        ref={tiltRef}
        className="absolute inset-0 transition-transform duration-300 ease-out transform-3d"
      >
        <div
          className={cn(
            "absolute inset-0 transition-transform duration-800 ease-[cubic-bezier(0.3,1.25,0.4,1)] transform-3d motion-reduce:duration-0",
            flipped && "rotate-y-180",
          )}
        >
          <CardFront skin={skin} assets={assets} />
          <CardBack {...note} />
        </div>
      </div>
    </button>
  );
}

function CardFront({ skin, assets }: { skin: GiftSkin; assets: SkinAssets }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[4.2cqw] shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_18px_40px_-12px_rgba(0,0,0,0.7)] backface-hidden">
      <CardSkin skin={skin} assets={assets} className="size-full" />
      {/* Glare that follows the pointer, set by the tilt handler */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--glare-x,50%)_var(--glare-y,30%),rgba(255,255,255,0.35),transparent_45%)] opacity-[var(--glare,0)] mix-blend-soft-light transition-opacity duration-300"
      />
      <span
        data-sheen
        aria-hidden="true"
        // A transform, not Tailwind's `translate`: motion animates `x` into
        // the same transform, and the two would otherwise add up.
        style={{ transform: "translateX(-120%)" }}
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_35%,rgba(255,240,215,0.45)_50%,transparent_65%)] mix-blend-overlay"
      />
    </div>
  );
}

/** Where the message's size starts, by length, before it is fitted. */
function startingSize(length: number): number {
  if (length <= 50) return 5.6;
  if (length <= 110) return 4.4;
  if (length <= 190) return 3.7;
  return 3.15;
}

/** Below this the message stops shrinking; the area still never overflows. */
const MIN_MESSAGE_CQW = 2.2;

/**
 * Shrinks the message until it fits the space between the name and the
 * footer. Length alone cannot promise that: wide letters or line breaks take
 * more room than the same count of ordinary text. Sizes are in cqw, so a fit
 * holds as the card scales; it is redone when the card is first laid out
 * (e.g. shown after being hidden) and when the text changes. Line breaks
 * are kept unless keeping them is what stops the note fitting.
 */
function useFittedSize(text: string) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const overflows = () =>
      element.clientHeight > 0 &&
      element.scrollHeight > element.clientHeight + 1;
    const shrink = () => {
      let size = startingSize(text.length);
      element.style.fontSize = `${size}cqw`;
      while (overflows() && size > MIN_MESSAGE_CQW) {
        size = Math.max(MIN_MESSAGE_CQW, size - 0.15);
        element.style.fontSize = `${size}cqw`;
      }
    };
    const fit = () => {
      element.style.whiteSpace = "pre-line";
      shrink();
      // A note that is mostly line breaks can be too tall at any readable
      // size; then its breaks read as spaces, so all of it still shows.
      if (overflows()) {
        element.style.whiteSpace = "normal";
        shrink();
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  return ref;
}

/** The note side. Sized in `cqw`, so it scales with the card. */
function CardBack({
  firstName,
  durationMonths,
  message,
  buyerName,
  editing = false,
}: GiftNoteContent) {
  const text = message.trim();
  const sender = buyerName.trim();
  const placeholder = editing ? "Your message shows here" : "";
  const messageRef = useFittedSize(text || placeholder);
  return (
    <div className="absolute inset-0 flex rotate-y-180 flex-col overflow-hidden rounded-[4.2cqw] bg-[radial-gradient(120%_90%_at_20%_0%,rgba(255,217,161,0.14),transparent_60%),linear-gradient(160deg,#5a2614,#2e1209)] px-[8cqw] py-[7cqw] text-left shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] backface-hidden">
      <span
        aria-hidden="true"
        className="border-sand-storm/35 pointer-events-none absolute inset-[2.6cqw] rounded-[2.6cqw] border"
      />
      {/* The labels stay put; the names fill in after them as they type. */}
      <span className="font-display text-sand-storm shrink-0 text-[5cqw] leading-[1.1]">
        <span className="text-sand-storm/60">A gift for</span>
        {firstName && ` ${firstName}`}
      </span>
      <span
        ref={messageRef}
        className={cn(
          // min-h-0 lets it shrink below its text, so it can never push the
          // footer off the card; the fitting keeps the text inside it.
          "font-display my-[3cqw] min-h-0 flex-1 overflow-hidden leading-[1.24] break-words whitespace-pre-line",
          text ? "text-white/90" : "text-white/35",
        )}
      >
        {text || placeholder}
      </span>
      {/* Always in the same corner, message or not. */}
      <span className="flex shrink-0 items-end justify-between gap-[4cqw] text-[3.3cqw] leading-[1.25] text-white/70">
        <span>
          {durationMonths} months of
          <br />
          ResX Premium
        </span>
        {(sender || editing) && (
          <span className="font-display text-sand-storm text-[3.6cqw] leading-[1.25]">
            <span className="text-sand-storm/60">Sent by</span>
            {sender && ` ${sender}`}
          </span>
        )}
      </span>
    </div>
  );
}
