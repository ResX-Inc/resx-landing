import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { GiftCheck, GiftCheckBadge } from "@/icons";
import {
  defaultGiftPlan,
  findGiftPlan,
  giftBadgeLabel,
  type GiftPlan,
} from "@/lib/gift/plans";
import {
  DEFAULT_SKIN_ID,
  GIFT_SKINS,
  type GiftSkinId,
  type SkinAssets,
} from "@/lib/gift/skins";
import { cn } from "@/lib/utils";

import { CardSkin } from "./CardSkin";
import { GiftFlipCard } from "./GiftFlipCard";
import { firstNameOf } from "./GiftPageParts";

/** The form fields that appear on the card's back. */
const NOTE_FIELDS = ["recipientName", "message", "senderName"] as const;
type NoteField = (typeof NOTE_FIELDS)[number];
type NoteValues = Record<NoteField, string>;

const isNoteField = (target: EventTarget | null): boolean =>
  (target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement) &&
  (NOTE_FIELDS as readonly string[]).includes(target.name);

/**
 * Follows the note fields in the surrounding form, which lives outside this
 * island (GiftForm.astro), and reports whether one of them has focus. Moving
 * between two note fields is one stretch of focus, so the card does not
 * flicker between them.
 */
function useFormNote(
  anchor: React.RefObject<HTMLElement | null>,
  onNoteFocusChange: (focused: boolean) => void,
): NoteValues {
  const [values, setValues] = useState<NoteValues>({
    recipientName: "",
    message: "",
    senderName: "",
  });
  const focusHandler = useRef(onNoteFocusChange);
  focusHandler.current = onNoteFocusChange;

  useEffect(() => {
    const form = anchor.current?.closest("form");
    if (!form) return;
    const read = () => {
      const data = new FormData(form);
      setValues({
        recipientName: String(data.get("recipientName") ?? ""),
        message: String(data.get("message") ?? ""),
        senderName: String(data.get("senderName") ?? ""),
      });
    };
    const onInput = (event: Event) => {
      if (isNoteField(event.target)) read();
    };
    const onFocus = (event: FocusEvent) => {
      if (isNoteField(event.target)) focusHandler.current(true);
    };
    const onBlur = (event: FocusEvent) => {
      if (isNoteField(event.target) && !isNoteField(event.relatedTarget)) {
        focusHandler.current(false);
      }
    };
    // Picks up values the browser restored or autofilled before hydration.
    read();
    form.addEventListener("input", onInput);
    form.addEventListener("focusin", onFocus);
    form.addEventListener("focusout", onBlur);
    return () => {
      form.removeEventListener("input", onInput);
      form.removeEventListener("focusin", onFocus);
      form.removeEventListener("focusout", onBlur);
    };
  }, [anchor]);

  return values;
}

/**
 * Section label. Mobile promotes these to real headings alongside "Who it's
 * for"; desktop demotes them to small labels inside the summary card.
 */
function PickerLabel({ id, children }: { id: string; children: string }) {
  return (
    <span
      id={id}
      className="font-display text-[22px] leading-7 font-medium text-white lg:font-sans lg:text-[13px] lg:leading-[18px] lg:text-zinc-300"
    >
      {children}
    </span>
  );
}

interface CompactPlanTileProps {
  plan: GiftPlan;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Same hierarchy as the landing page's plan tiles: the duration leads, the
 * total is bold, and the monthly rate is supporting text.
 *
 * Below lg each tile is a full-width row with a radio, like the landing page.
 * On desktop the three tiles share a narrow summary card (~116px each), which
 * has no room for a radio beside "12 months" or for the full "Best value ·
 * 21% off" badge — so selection is shown the way the card-design thumbnails
 * show it (border plus a corner check), and the badge shortens to the saving.
 */
function CompactPlanTile({ plan, selected, onSelect }: CompactPlanTileProps) {
  const badge = giftBadgeLabel(plan);
  const shortBadge = plan.savings ? `${plan.savings.percent}% off` : plan.badge;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "relative flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[14px] px-3.5 py-3 text-left transition-colors lg:flex-col lg:items-start lg:gap-1.5 lg:p-3",
        "focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none",
        selected
          ? "bg-sand-storm/10 border-sand-storm border-[1.5px]"
          : "bg-card/30 border border-white/12 hover:border-white/25",
      )}
    >
      {badge && (
        <span className="bg-sand-storm absolute -top-2.5 left-3.5 rounded-full px-2 py-0.5 text-[10px] leading-[14px] font-semibold whitespace-nowrap text-black lg:left-3">
          <span className="lg:hidden">{badge}</span>
          <span className="max-lg:hidden">{shortBadge}</span>
        </span>
      )}

      {/* Radio on mobile rows; on desktop, a check only when selected. */}
      <span
        aria-hidden="true"
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center rounded-full lg:absolute lg:top-1.5 lg:right-1.5 lg:size-[14px]",
          selected
            ? "bg-sand-storm text-black"
            : "border-sand-storm border lg:hidden",
        )}
      >
        {selected && <GiftCheck className="size-3 lg:size-2.5" />}
      </span>

      <span
        className={cn(
          "font-display min-w-0 flex-1 text-2xl leading-[30px] font-medium whitespace-nowrap lg:flex-none lg:text-lg lg:leading-6",
          selected ? "text-sand-storm" : "text-white",
        )}
      >
        {plan.name}
      </span>

      <span className="flex shrink-0 flex-col items-end gap-px lg:items-start">
        <span className="text-base leading-6 font-semibold text-white lg:text-[15px] lg:leading-5">
          {plan.price}
        </span>
        <span className="text-xs leading-4 text-zinc-300/80">
          {plan.perMonthShort}
        </span>
      </span>
    </button>
  );
}

interface OrderSummaryProps {
  assets: SkinAssets;
  plans: GiftPlan[];
  /** Duration preselected from the ?plan= query the landing CTAs pass. */
  initialDurationMonths?: number;
  className?: string;
}

export function OrderSummary({
  assets,
  plans,
  initialDurationMonths,
  className,
}: OrderSummaryProps) {
  // Deliberately local rather than the shared plan store: this page renders on
  // the server, and module-level state would leak one visitor's selection into
  // another visitor's SSR response.
  const [durationMonths, setDurationMonths] = useState<number | undefined>(
    initialDurationMonths,
  );
  const [skinId, setSkinId] = useState<GiftSkinId>(DEFAULT_SKIN_ID);
  // Two sources decide which side shows. `chosenBack` is the side they picked by
  // pressing the card; `peeking` shows the note only while a note field has
  // focus, then hands back to their choice.
  const [chosenBack, setChosenBack] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const flipped = peeking || chosenBack;
  const asideRef = useRef<HTMLElement>(null);
  const note = useFormNote(asideRef, setPeeking);

  // Pressing the card is a deliberate choice: it ends any peek, so pressing
  // it while it peeks turns it to the front and keeps it there.
  const chooseSide = (back: boolean) => {
    setPeeking(false);
    setChosenBack(back);
  };

  const plan = findGiftPlan(plans, durationMonths) ?? defaultGiftPlan(plans);
  const skin = GIFT_SKINS.find((s) => s.id === skinId) ?? GIFT_SKINS[0];

  return (
    <aside
      ref={asideRef}
      className={cn(
        "flex w-full flex-col items-start gap-7",
        // Only desktop wraps the pickers in a card; on mobile they are plain
        // sections in the page flow.
        "lg:bg-card/30 lg:sticky lg:top-28 lg:gap-5 lg:rounded-3xl lg:border lg:border-white/12 lg:p-6",
        className,
      )}
    >
      {plan && (
        <input
          type="hidden"
          name="durationMonths"
          value={plan.durationMonths}
        />
      )}
      {/* Sent to the API as `cardDesign`; the ids are the server's enum. */}
      <input type="hidden" name="cardDesign" value={skinId} />

      {/* The large preview is desktop-only; mobile reads selection off the grid. */}
      <div className="flex w-full flex-col items-center gap-2.5 max-lg:hidden">
        <div className="@container relative aspect-[366/209] w-full">
          <GiftFlipCard
            skin={skin}
            assets={assets}
            flipped={flipped}
            onFlippedChange={chooseSide}
            sheenKey={skinId}
            firstName={firstNameOf(note.recipientName)}
            durationMonths={plan?.durationMonths ?? 12}
            message={note.message}
            buyerName={note.senderName}
            editing
          />
        </div>
        <span className="text-[13px] leading-[18px] text-zinc-300/60">
          {flipped
            ? "Tap the card to see the design"
            : "Tap the card to see your note"}
        </span>
      </div>

      <div className="flex w-full flex-col items-start gap-2.5 max-lg:gap-4">
        <PickerLabel id="gift-card-design-label">Card design</PickerLabel>
        <div
          role="radiogroup"
          aria-labelledby="gift-card-design-label"
          className="grid w-full grid-cols-2 items-start gap-3 lg:flex lg:justify-between lg:gap-2"
        >
          {GIFT_SKINS.map((candidate) => {
            const selected = candidate.id === skinId;
            return (
              <button
                key={candidate.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={candidate.name}
                onClick={() => {
                  setSkinId(candidate.id);
                  chooseSide(false);
                }}
                className={cn(
                  "relative aspect-[85/48.571] w-full min-w-0 cursor-pointer overflow-hidden rounded-lg transition-colors lg:flex-1",
                  "focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none",
                  selected
                    ? "border-sand-storm border-2"
                    : "border border-white/14 hover:border-white/40",
                )}
              >
                <CardSkin
                  skin={candidate}
                  assets={assets}
                  className="size-full"
                />
                {/*
                  The badge is a fixed 18px on mobile and 14px on desktop, inset
                  6px from the top-right corner in both — so it is positioned in
                  pixels rather than as a percentage of the thumbnail.
                */}
                {selected && (
                  <GiftCheckBadge className="absolute top-1.5 right-1.5 size-[18px] lg:size-3.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-2.5 max-lg:gap-4">
        <PickerLabel id="gift-plan-label">Plan</PickerLabel>
        <div
          role="radiogroup"
          aria-labelledby="gift-plan-label"
          className="flex w-full items-stretch gap-3 max-lg:flex-col lg:gap-2"
        >
          {plans.map((candidate) => (
            <CompactPlanTile
              key={candidate.durationMonths}
              plan={candidate}
              selected={candidate.durationMonths === plan?.durationMonths}
              onSelect={() => setDurationMonths(candidate.durationMonths)}
            />
          ))}
        </div>
      </div>

      {plan && (
        <>
          {/* Desktop totals. Mobile shows these in the fixed bar instead. */}
          <div className="flex w-full flex-col items-start gap-2 border-t border-white/8 pt-4 max-lg:hidden">
            <div className="flex w-full items-center justify-between text-[15px] leading-[22px] text-white/90">
              <span>{plan.name} of ResX Premium</span>
              <span>{plan.price}</span>
            </div>
            <div className="flex w-full items-center justify-between text-white">
              <span className="text-base leading-6 font-semibold">
                Total, one-time
              </span>
              <span className="font-display text-2xl leading-[30px] font-medium">
                {plan.price}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            variant="premium"
            size="xl"
            className="w-full max-lg:hidden"
          >
            Continue to checkout
          </Button>

          <p className="w-full text-center text-[13px] leading-[18px] text-zinc-300/80 max-lg:hidden">
            No subscription. The gift never expires.
          </p>

          {/*
            Mobile checkout bar. It stays inside the form, so the button submits
            the fields in the other column exactly as the desktop button does.
          */}
          <div className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-4 border-t border-white/12 bg-[#1f1f1f] px-4 pt-3 pb-5 lg:hidden">
            <div className="flex min-w-0 flex-1 flex-col items-start">
              <span className="text-xs leading-4 whitespace-nowrap text-zinc-300/85">
                {plan.name} · one-time
              </span>
              <span className="font-display text-2xl leading-[30px] font-medium text-white">
                {plan.price}
              </span>
            </div>
            <Button
              type="submit"
              variant="premium"
              size="xl"
              className="shrink-0 px-5.5"
            >
              Continue to checkout
            </Button>
          </div>
        </>
      )}
    </aside>
  );
}
