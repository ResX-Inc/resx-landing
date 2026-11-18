import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type TargetAndTransition,
} from "motion/react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

import { usePageOpen, useReduceMotion } from "./Magazine";

/*
 * Data animations for Pulse pages. Each one plays when its spread opens and
 * resets once the spread has turned away, so it replays on the way back.
 * Outside the magazine (the preview route) and with reduced motion they
 * render their final state.
 *
 * Timing: Reveal brings a block in over ~0.7s, so data animations default to
 * starting a little after (DATA_DELAY) and can be staggered with `delay`.
 */
export const DATA_DELAY = 0.45;
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/*
 * Figures: digits roll into place on a critically damped spring (bounce 0),
 * quick at first and easing to a stop with no overshoot. Anything that
 * accompanies a figure (a ring, a bar) uses the same spring to land with it.
 */
export const COUNT_SPRING = {
  type: "spring",
  bounce: 0,
  visualDuration: 0.9,
} as const;

/** Runs `onOpen` when the page opens (not on first render) and `onClose` when it closes. */
function useOpenTransitions(
  onOpen: () => (() => void) | void,
  onClose: () => void,
) {
  const open = usePageOpen();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (open) return onOpen() ?? undefined;
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return open;
}

/* ------------------------------ RollingNumber ----------------------------- */

/* Vertical pitch of the digit strip (em): wide enough that neighbors stay hidden. */
const CELL = 1.4;
const STRIP = Array.from({ length: 20 }, (_, i) => i % 10);
/* Gap between neighboring digits starting to roll, left to right (s). */
const DIGIT_STAGGER = 0.05;

/**
 * One digit in its own clipped column. The strip holds 0–9 twice; every
 * digit starts on 0 and rolls up through a full turn to its value, so the
 * figure climbs from zero and every column is visibly in motion.
 *
 * The column keeps its final width throughout, so the figure never shifts.
 * Digits roll through centred on the final one, in their true shapes. With
 * "1"s padded (see ONE_STYLE), Inter's digits are close enough in width
 * that a passing digit overhangs its slot by at most ~0.05em.
 */
function RollingDigit({
  digit,
  delay,
  kerned,
  natural,
}: {
  digit: number;
  delay: number;
  /** This digit's advance in the figure, kerning included (em). */
  kerned: number;
  /** Natural advance of each digit 0–9 in this font (em). */
  natural: number[];
}) {
  const open = usePageOpen();
  const reduce = useReduceMotion();
  const target = digit + 10;
  const position = useMotionValue(open ? target : 0);
  const y = useTransform(position, (k) => `${-(k + 0.5) * CELL}em`);

  useOpenTransitions(
    () => {
      if (reduce) return void position.set(target);
      position.set(0);
      const rolling = animate(position, target, {
        ...COUNT_SPRING,
        delay,
        // Motion's defaults for a move this long stop within half a digit
        // and snap the rest; settle precisely so the digit glides home.
        restDelta: 0.001,
        restSpeed: 0.05,
      });
      return () => rolling.stop();
    },
    () => position.set(0),
  );

  return (
    <span
      className="inline-block text-left"
      // A window 1.2em tall centred on the digit, whatever the line height,
      // so only the digit in place shows.
      style={{
        width: `${kerned}em`,
        clipPath: "inset(calc(50% - 0.6em) -50%)",
      }}
    >
      <span
        className="relative inline-block"
        style={{ width: `${natural[digit]}em` }}
      >
        {/* Gives the column its line height and baseline. */}
        <span className="invisible inline-block w-0">{digit}</span>
        <motion.span
          className="absolute inset-x-0 top-1/2 flex flex-col items-center"
          style={{ y }}
        >
          {STRIP.map((n, i) => (
            <span
              key={i}
              style={{
                height: `${CELL}em`,
                lineHeight: `${CELL}em`,
              }}
            >
              {n}
            </span>
          ))}
        </motion.span>
      </span>
    </span>
  );
}

const DIGITS = "0123456789";

/*
 * Inter's "1" (0.43em) is far narrower than its other digits (0.58–0.68em),
 * so a slot sized for it can't fit the digits rolling through. Figures keep
 * Inter's own "1" but pad it out to the width of a "0" (0.674em), centred.
 */
const ONE_STYLE = { display: "inline-block", paddingInline: "0.1215em" };
/** A figure's text with each "1" padded to the width of a "0". */
function FigureText({ value }: { value: string }) {
  return (
    <>
      {Array.from(value).map((char, i) =>
        char === "1" ? (
          <span key={i} style={ONE_STYLE}>
            1
          </span>
        ) : (
          char
        ),
      )}
    </>
  );
}

/*
 * Measures advances (em) for each character of `el` as the browser sets it,
 * kerning and letter-spacing included. Pages sit on 3D leaves (possibly
 * mirrored), so screen positions can't be used directly; prefix widths can,
 * since their ratios survive the flat transforms a page has at rest, and the
 * layout width (offsetWidth) converts them back to untransformed pixels.
 */
function measureAdvances(el: HTMLElement) {
  // Every character's text node and offset (a figure's "1"s sit in spans).
  const chars: [Text, number][] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text;
    for (let i = 0; i < text.length; i++) chars.push([text, i]);
  }
  if (!chars.length) return;
  const range = document.createRange();
  const prefix = (end: number) => {
    if (end === 0) return 0;
    const [node, offset] = chars[end - 1];
    // Start before everything and, for a character in its own span (a
    // padded "1"), end after the span, so its padding counts toward it.
    range.setStart(el, 0);
    if (node.parentNode !== el && offset === node.length - 1) {
      range.setEndAfter(node.parentNode!);
    } else {
      range.setEnd(node, offset + 1);
    }
    return range.getBoundingClientRect().width;
  };
  const total = prefix(chars.length);
  if (!total) return;
  const fontSize = parseFloat(getComputedStyle(el).fontSize);
  const toEm = el.offsetWidth / total / fontSize;
  const widths = Array.from({ length: chars.length + 1 }, (_, i) => prefix(i));
  return chars.map((_, i) => (widths[i + 1] - widths[i]) * toEm);
}

/*
 * Splitting a figure into columns loses the font's kerning ("3," and "1"
 * pairs tighten in Inter), so the columns are sized from the unbroken text.
 * Each digit 0–9 is measured on its own too, for the widths mid-roll.
 */
function useFigureMetrics(value: string) {
  const figureRef = useRef<HTMLSpanElement>(null);
  const digitRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [metrics, setMetrics] = useState<{
    advances: number[];
    natural: number[];
  }>();

  useLayoutEffect(() => {
    const measure = () => {
      const advances = figureRef.current && measureAdvances(figureRef.current);
      const natural = digitRefs.current.map((el) =>
        el ? measureAdvances(el)?.[0] : undefined,
      );
      if (advances && natural.every((n) => n !== undefined)) {
        setMetrics({ advances, natural: natural as number[] });
      }
    };
    measure();
    document.fonts?.ready.then(measure);
  }, [value]);

  return { figureRef, digitRefs, metrics };
}

/**
 * A figure whose digits roll up from zero into place, odometer style,
 * staggered left to right: "$3,124,554", "99.3%", "1 in 4". Only digits move;
 * symbols and words stay put. Screen readers just hear the figure.
 */
export function RollingNumber({
  value,
  delay = DATA_DELAY,
  className,
}: {
  value: string;
  delay?: number;
  className?: string;
}) {
  const { figureRef, digitRefs, metrics } = useFigureMetrics(value);
  let digitIndex = 0;
  return (
    <span className={cn("relative whitespace-nowrap", className)}>
      {/* Measuring copies: the figure as set, and each digit alone. */}
      <span aria-hidden className="invisible absolute top-0 left-0">
        <span ref={figureRef}>
          <FigureText value={value} />
        </span>
        {Array.from(DIGITS, (d, i) => (
          <span
            key={d}
            ref={(el) => {
              digitRefs.current[i] = el;
            }}
            className="absolute top-0 left-0"
          >
            {d === "1" ? <span style={ONE_STYLE}>1</span> : d}
          </span>
        ))}
      </span>
      {/* Plain, kerned text until the columns are measured (and wherever
          the page isn't interactive, like the preview route). */}
      {!metrics ? (
        <span aria-hidden>
          <FigureText value={value} />
        </span>
      ) : (
        <span aria-hidden>
          {Array.from(value).map((char, i) =>
            /\d/.test(char) ? (
              <RollingDigit
                key={i}
                digit={Number(char)}
                delay={delay + digitIndex++ * DIGIT_STAGGER}
                kerned={metrics.advances[i]}
                natural={metrics.natural}
              />
            ) : (
              <span
                key={i}
                className="inline-block text-left whitespace-pre"
                style={{ width: `${metrics.advances[i]}em` }}
              >
                {char}
              </span>
            ),
          )}
        </span>
      )}
      <span className="sr-only">{value}</span>
    </span>
  );
}

/* ---------------------------------- Grow ---------------------------------- */

/**
 * Grows a bar from its base: `axis="x"` from the left (or `from="end"` from
 * the right), `axis="y"` from the bottom (or `from="start"` from the top).
 */
export function Grow({
  axis = "x",
  from,
  delay = DATA_DELAY,
  duration = 1,
  synced = false,
  className,
  style,
  children,
}: {
  axis?: "x" | "y";
  from?: "start" | "end";
  delay?: number;
  duration?: number;
  /** Grows on the count spring, to land with a figure beside it (ignores `duration`). */
  synced?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const open = usePageOpen();
  const reduce = useReduceMotion();
  const shown = open || reduce;
  const origin =
    axis === "x"
      ? { originX: from === "end" ? 1 : 0 }
      : { originY: from === "start" ? 0 : 1 };
  const scale = axis === "x" ? "scaleX" : "scaleY";
  return (
    <motion.div
      className={className}
      style={{ ...style, ...origin }}
      initial={false}
      animate={{ [scale]: shown ? 1 : 0 }}
      transition={
        shown && !reduce
          ? synced
            ? { ...COUNT_SPRING, delay }
            : { duration, delay, ease: EASE_OUT }
          : { duration: 0 }
      }
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------- Wipe ---------------------------------- */

const HIDDEN_CLIP = {
  right: "inset(0% 100% 0% 0%)",
  left: "inset(0% 0% 0% 100%)",
  up: "inset(100% 0% 0% 0%)",
  down: "inset(0% 0% 100% 0%)",
} as const;

/**
 * Reveals artwork (a chart, a line) by wiping a clip across it, in the
 * direction the data reads. The artwork itself is untouched.
 */
export function Wipe({
  direction = "right",
  delay = DATA_DELAY,
  duration = 1.2,
  className,
  style,
  children,
}: {
  direction?: keyof typeof HIDDEN_CLIP;
  delay?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const open = usePageOpen();
  const reduce = useReduceMotion();
  const shown = open || reduce;
  return (
    <motion.div
      className={className}
      style={style}
      initial={false}
      animate={{
        clipPath: shown ? "inset(0% 0% 0% 0%)" : HIDDEN_CLIP[direction],
      }}
      transition={
        shown && !reduce
          ? { duration, delay, ease: [0.65, 0, 0.35, 1] }
          : { duration: 0 }
      }
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------- Pop ----------------------------------- */

/** Pops a small mark (an icon, a dot) into place: scale and fade. */
export function Pop({
  delay = DATA_DELAY,
  className,
  style,
  children,
}: {
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const open = usePageOpen();
  const reduce = useReduceMotion();
  const shown = open || reduce;
  return (
    <motion.div
      className={className}
      style={style}
      initial={false}
      animate={shown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
      transition={
        shown && !reduce
          ? { type: "spring", stiffness: 420, damping: 18, delay }
          : { duration: 0 }
      }
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------- Loop ---------------------------------- */

/**
 * A small ambient movement that runs while the page is open: a soundwave
 * pulsing, a note bobbing, a sun turning. `keyframes` is a motion target with
 * keyframe arrays, e.g. { y: [0, -4, 0] }.
 */
export function Loop({
  keyframes,
  duration = 2,
  delay = DATA_DELAY,
  className,
  style,
  children,
}: {
  keyframes: TargetAndTransition;
  duration?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const open = usePageOpen();
  const reduce = useReduceMotion();
  const running = open && !reduce;
  return (
    <motion.div
      className={className}
      style={style}
      initial={false}
      animate={running ? keyframes : resting(keyframes)}
      transition={
        running
          ? { duration, delay, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3 }
      }
    >
      {children}
    </motion.div>
  );
}

/* The first value of each keyframe array: where a loop rests. */
function resting(keyframes: TargetAndTransition): TargetAndTransition {
  return Object.fromEntries(
    Object.entries(keyframes).map(([key, v]) => [
      key,
      Array.isArray(v) ? v[0] : v,
    ]),
  ) as TargetAndTransition;
}

/* ---------------------------------- Ring ---------------------------------- */

/**
 * A progress ring that draws itself clockwise from 12 o'clock to `value`
 * (0–1). Geometry matches the Figma donuts: a 92-unit box, radius 41,
 * stroke 10, with a faint full track behind the arc.
 */
export function Ring({
  value,
  delay = DATA_DELAY,
  color = "#FFD9A1",
  className,
}: {
  value: number;
  delay?: number;
  color?: string;
  className?: string;
}) {
  const open = usePageOpen();
  const reduce = useReduceMotion();
  const shown = open || reduce;
  return (
    <svg viewBox="0 0 92 92" fill="none" aria-hidden className={className}>
      <circle
        cx="46"
        cy="46"
        r="41"
        strokeWidth="10"
        stroke="white"
        strokeOpacity="0.1"
      />
      <motion.circle
        cx="46"
        cy="46"
        r="41"
        strokeWidth="10"
        strokeLinecap="round"
        stroke={color}
        transform="rotate(-90 46 46)"
        initial={false}
        animate={
          shown
            ? { pathLength: value, opacity: 1 }
            : { pathLength: 0, opacity: 0 }
        }
        transition={
          shown && !reduce
            ? {
                pathLength: { ...COUNT_SPRING, delay },
                opacity: { duration: 0.01, delay },
              }
            : { duration: 0 }
        }
      />
    </svg>
  );
}
