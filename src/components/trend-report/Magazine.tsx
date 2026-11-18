import {
  easeInOut,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

import "./magazine.css";

/* -------------------------------------------------------------------------- */
/*                                  Geometry                                  */
/* -------------------------------------------------------------------------- */

/*
 * The scroll is split into alternating "dwell" and "flip" segments:
 *
 *   dwell 0 | flip 0 | dwell 1 | flip 1 | ... | dwell N
 *
 * A dwell is the time a spread sits open (its contents drift in parallax), a
 * flip is one page turning over the spine. Lengths are in "units", one unit
 * being UNIT_VH of scroll.
 */
const DWELL = 0.8;
const FLIP = 1;
const UNIT_VH = 85;

function geometry(flips: number) {
  const total = flips * FLIP + (flips + 1) * DWELL;
  return {
    total,
    flipStart: (i: number) => ((i + 1) * DWELL + i * FLIP) / total,
    flipEnd: (i: number) => ((i + 1) * DWELL + (i + 1) * FLIP) / total,
    /* Centre of the dwell for spread `s`, normalised 0..1. */
    rest: (s: number) => (s * (DWELL + FLIP) + DWELL / 2) / total,
    /* How far either side of rest a spread is still visible. */
    reach: (DWELL / 2 + FLIP) / total,
  };
}

/* -------------------------------------------------------------------------- */
/*                                   Context                                  */
/* -------------------------------------------------------------------------- */

const LocalProgress = createContext<MotionValue<number> | null>(null);
const MagazineNav = createContext<{ goToPage: (page: number) => void }>({
  goToPage: () => {},
});

/*
 * Whether the spread a page sits on is open. Defaults to true so a page
 * rendered on its own (the preview route, the reduced-motion view) shows its
 * content in place.
 */
const PageOpen = createContext(true);

/** Whether the spread this page sits on is open (true outside the magazine). */
export function usePageOpen() {
  return useContext(PageOpen);
}

/** Scroll position relative to the spread a page sits on: -1 → 0 (at rest) → 1. */
export function useLocalProgress() {
  const fallback = useMotionValue(0);
  return useContext(LocalProgress) ?? fallback;
}

export function useMagazineNav() {
  return useContext(MagazineNav);
}

/**
 * Moves its children against the scroll while their spread is open. `y` is in
 * page-height percent (cqh), so the motion scales with the printed page.
 */
export function Drift({
  y = 4,
  scale,
  className,
  children,
}: {
  y?: number;
  scale?: [number, number];
  className?: string;
  children: ReactNode;
}) {
  const local = useLocalProgress();
  const translate = useTransform(local, [-1, 1], [`${y}cqh`, `${-y}cqh`]);
  const s = useTransform(local, [-1, 1], scale ?? [1, 1]);
  return (
    <motion.div className={className} style={{ y: translate, scale: s }}>
      {children}
    </motion.div>
  );
}

/**
 * Fades and lifts its children into place as their spread opens, and hides
 * them again once the spread has turned away, so the entrance replays when the
 * reader comes back. `order` staggers siblings (0, 1, 2…); `y` is the rise
 * in page-height percent. Put a page element's positioning classes on the
 * Reveal itself, since it renders the wrapping div.
 */
export function Reveal({
  order = 0,
  y = 2,
  className,
  children,
}: {
  order?: number;
  y?: number;
  className?: string;
  children: ReactNode;
}) {
  const open = useContext(PageOpen);
  return (
    <motion.div
      className={className}
      initial={false}
      animate={open ? { opacity: 1, y: "0cqh" } : { opacity: 0, y: `${y}cqh` }}
      transition={
        open
          ? {
              duration: 0.7,
              delay: 0.1 + order * 0.08,
              ease: [0.2, 0.7, 0.2, 1],
            }
          : { duration: 0.2 }
      }
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Hooks                                   */
/* -------------------------------------------------------------------------- */

/*
 * Media queries read through useSyncExternalStore, so hydration uses the
 * server snapshot (two-page spread, motion on) and then corrects itself
 * instead of producing a mismatch.
 */
/** Reduced-motion preference, hydration-safe (false on the server and first render). */
export function useReduceMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)", false);
}

function useMediaQuery(query: string, serverValue: boolean) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Magazine                                  */
/* -------------------------------------------------------------------------- */

export interface MagazinePage {
  id: string;
  /** Short name for assistive tech, e.g. "Contents". */
  label: string;
  content: ReactNode;
}

interface MagazineProps {
  pages: MagazinePage[];
}

/**
 * A magazine whose pages turn as you scroll. On wide screens it is a two-page
 * spread that opens from a closed cover; on phones each page turns on its own.
 */
export function Magazine({ pages }: MagazineProps) {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)", false);
  const wide = useMediaQuery("(min-width: 768px)", true);

  if (reduceMotion) return <StaticMagazine pages={pages} wide={wide} />;
  return <TurningMagazine pages={pages} wide={wide} />;
}

/* --------------------------- Scroll-driven version -------------------------- */

interface Leaf {
  front: number;
  back: number | null;
}

/*
 * A leaf is one sheet of paper: its front is a right-hand page, its back the
 * left-hand page of the next spread. On phones every page is its own leaf
 * with a blank reverse.
 */
function buildLeaves(count: number, wide: boolean): Leaf[] {
  if (!wide) {
    return Array.from({ length: count }, (_, i) => ({ front: i, back: null }));
  }
  const leaves: Leaf[] = [];
  for (let i = 0; i < count; i += 2) {
    leaves.push({ front: i, back: i + 1 < count ? i + 1 : null });
  }
  return leaves;
}

/* Which spread (0 = cover) a page is visible on. */
function spreadOf(page: number, wide: boolean) {
  return wide ? Math.floor((page + 1) / 2) : page;
}

function TurningMagazine({
  pages,
  wide,
}: {
  pages: MagazinePage[];
  wide: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const leaves = useMemo(() => buildLeaves(pages.length, wide), [pages, wide]);
  // With an even page count the last page is a left-hand page, so the final
  // sheet turns too and the magazine closes on it.
  const closesOnBack = wide && pages.length % 2 === 0;
  const flips = closesOnBack ? leaves.length : leaves.length - 1;
  const geo = useMemo(() => geometry(flips), [flips]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // A little weight, so the paper settles rather than snapping to the wheel.
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 32,
    mass: 0.5,
  });

  const goToSpread = useCallback(
    (spread: number) => {
      const section = sectionRef.current;
      if (!section) return;
      const clamped = Math.max(0, Math.min(flips, spread));
      const top = section.getBoundingClientRect().top + window.scrollY;
      const travel = section.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: top + geo.rest(clamped) * travel,
        behavior: "smooth",
      });
    },
    [flips, geo],
  );

  const goToPage = useCallback(
    (page: number) => goToSpread(spreadOf(page, wide)),
    [goToSpread, wide],
  );

  // The spread nearest the current scroll position, for the folio readout and
  // arrow-key paging.
  const [current, setCurrent] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    let nearest = 0;
    for (let s = 1; s <= flips; s++) {
      if (Math.abs(geo.rest(s) - v) < Math.abs(geo.rest(nearest) - v)) {
        nearest = s;
      }
    }
    setCurrent(nearest);
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      const rect = sectionRef.current?.getBoundingClientRect();
      // Only while the magazine is pinned on screen.
      if (!rect || rect.top > 1 || rect.bottom < window.innerHeight - 1) return;
      event.preventDefault();
      goToSpread(current + (event.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, goToSpread]);

  // Closed magazine: the cover sits centred. Opening it slides the spine to
  // the middle of the screen. Phones always show the right-hand page only.
  // When the magazine closes on its back page, the spine slides the other
  // way so that last page ends up centred too.
  const bookX = useTransform(progress, (v) => {
    if (!wide) return "-25%";
    const turned = (i: number) =>
      easeInOut(
        clamp01((v - geo.flipStart(i)) / (geo.flipEnd(i) - geo.flipStart(i))),
      );
    const open = -25 * (1 - turned(0));
    const close = closesOnBack ? 25 * turned(flips - 1) : 0;
    return `${open + close}%`;
  });

  // Shadow thrown onto the pages beneath whichever leaf is mid-turn.
  const turning = useTransform(progress, (v) => {
    for (let i = 0; i < flips; i++) {
      if (v > geo.flipStart(i) && v < geo.flipEnd(i)) {
        return easeInOut(
          (v - geo.flipStart(i)) / (geo.flipEnd(i) - geo.flipStart(i)),
        );
      }
    }
    return -1;
  });
  const rightShadow = useTransform(turning, (p) =>
    p < 0 ? 0 : Math.sin(Math.PI * p) * (1 - p) * 1.4,
  );
  const leftShadow = useTransform(turning, (p) =>
    p < 0 ? 0 : Math.sin(Math.PI * p) * p * 1.4,
  );

  const hint = useTransform(progress, [0, geo.flipStart(0) * 0.9], [1, 0]);

  const stageRef = useRef<HTMLDivElement>(null);
  useImmersiveNav(sectionRef, stageRef);

  return (
    <MagazineNav.Provider value={{ goToPage }}>
      <section
        ref={sectionRef}
        className="mag-scroll"
        style={{ height: `calc(${geo.total * UNIT_VH}svh + 100svh)` }}
        aria-label="The ResX Pulse"
      >
        <div ref={stageRef} className="mag-stage">
          <div className="mag-frame">
            <motion.div className="mag-book" style={{ x: bookX }}>
              {leaves.map((leaf, i) => (
                <LeafView
                  key={`${wide}-${i}`}
                  index={i}
                  count={leaves.length}
                  progress={progress}
                  start={i < flips ? geo.flipStart(i) : null}
                  end={i < flips ? geo.flipEnd(i) : null}
                  front={
                    <PageFace
                      page={pages[leaf.front]}
                      number={leaf.front}
                      progress={progress}
                      geo={geo}
                      spread={spreadOf(leaf.front, wide)}
                      onFocusPage={goToPage}
                    />
                  }
                  back={
                    leaf.back === null ? null : (
                      <PageFace
                        page={pages[leaf.back]}
                        number={leaf.back}
                        progress={progress}
                        geo={geo}
                        spread={spreadOf(leaf.back, wide)}
                        onFocusPage={goToPage}
                      />
                    )
                  }
                />
              ))}

              <motion.div
                aria-hidden
                className="mag-cast mag-cast--right"
                style={{ opacity: rightShadow, zIndex: leaves.length + 1 }}
              />
              <motion.div
                aria-hidden
                className="mag-cast mag-cast--left"
                style={{ opacity: leftShadow, zIndex: leaves.length + 1 }}
              />
            </motion.div>
          </div>

          <div className="mag-chrome">
            <motion.p className="mag-hint" style={{ opacity: hint }}>
              Scroll to open
            </motion.p>
            <p className="mag-folio" aria-live="polite">
              {/* Printed page numbers: the cover is page 1. */}
              {folioText(current, wide, pages.length)}
            </p>
          </div>
        </div>
      </section>
    </MagazineNav.Provider>
  );
}

/*
 * While the reader is inside the magazine, the site header slides away and
 * the pages take its space. The header comes back at the very top, after the
 * last page, when the pointer nears the top edge, on a deliberate scroll up,
 * or when it receives keyboard focus (handled in CSS).
 *
 * State lives on <html> as data attributes so the header, which is rendered
 * outside this island, can respond in CSS:
 *   data-mag-immersive  header hidden, pages at full size
 *   data-mag-peek       header shown over the pages, pages keep their size
 */
const NAV_SPACE = 96; // fixed header (16px offset + 70px bar) plus breathing room
const REVEAL_SCROLL_UP = 80;
const PEEK_ZONE = 96;

function useImmersiveNav(
  sectionRef: React.RefObject<HTMLElement | null>,
  stageRef: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const root = document.documentElement;
    let lastY = window.scrollY;
    let upTravel = 0;
    let frame = 0;

    // How far the pages shrink and drop to clear the header when it's shown.
    const fit = () => {
      const stage = stageRef.current;
      const book = stage?.querySelector<HTMLElement>(".mag-book");
      if (!stage || !book) return;
      const style = getComputedStyle(stage);
      const top = parseFloat(style.paddingTop);
      const bottom = parseFloat(style.paddingBottom);
      const room = window.innerHeight - NAV_SPACE - bottom;
      const scale = Math.min(1, room / book.offsetHeight);
      stage.style.setProperty("--mag-fit", String(scale));
      stage.style.setProperty("--mag-drop", `${(NAV_SPACE - top) / 2}px`);
    };

    const update = () => {
      frame = 0;
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      const y = window.scrollY;
      const inside = rect.top < -8 && rect.bottom > window.innerHeight + 8;

      if (y < lastY) upTravel += lastY - y;
      else upTravel = 0;
      lastY = y;

      root.toggleAttribute("data-mag-immersive", inside);
      if (!inside || upTravel === 0) root.removeAttribute("data-mag-peek");
      if (inside && upTravel > REVEAL_SCROLL_UP) {
        root.setAttribute("data-mag-peek", "");
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (!root.hasAttribute("data-mag-immersive")) return;
      root.toggleAttribute("data-mag-peek", event.clientY < PEEK_ZONE);
    };
    const onResize = () => {
      fit();
      onScroll();
    };

    fit();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      root.removeAttribute("data-mag-immersive");
      root.removeAttribute("data-mag-peek");
    };
  }, [sectionRef, stageRef]);
}

function folioText(spread: number, wide: boolean, count: number) {
  if (spread === 0) return "";
  if (!wide) return `Page ${spread + 1} of ${count}`;
  const first = spread * 2;
  const last = Math.min(first + 1, count);
  return first === last
    ? `Page ${first} of ${count}`
    : `Pages ${first}–${last} of ${count}`;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function LeafView({
  index,
  count,
  progress,
  start,
  end,
  front,
  back,
}: {
  index: number;
  count: number;
  progress: MotionValue<number>;
  start: number | null;
  end: number | null;
  front: ReactNode;
  back: ReactNode;
}) {
  const turn = useTransform(progress, (v) => {
    if (start === null || end === null) return 0;
    return easeInOut(clamp01((v - start) / (end - start)));
  });

  const rotateY = useTransform(turn, (p) => p * -180);
  const zIndex = useTransform(turn, (p) =>
    p <= 0 ? count - index : p >= 1 ? index + 1 : count + 2,
  );
  // The face turning away from the light darkens; the one turning towards it
  // brightens as it lands.
  const frontShade = useTransform(turn, [0, 0.5], [0, 0.45]);
  const backShade = useTransform(turn, [0.5, 1], [0.45, 0]);
  // A soft lift: the sheet rises off the stack mid-turn.
  const lift = useTransform(turn, (p) => Math.sin(Math.PI * p));
  const shadow = useTransform(
    lift,
    (l) => `0 ${l * 30}px ${l * 60}px rgba(0,0,0,${0.15 + l * 0.35})`,
  );

  return (
    <motion.div
      className="mag-leaf"
      style={{
        rotateY,
        zIndex,
        // Gentle enough that a large page doesn't bulge off-screen mid-turn.
        transformPerspective: 4200,
      }}
    >
      <motion.div
        className="mag-face mag-face--front"
        style={{ boxShadow: shadow }}
      >
        {front}
        <motion.div
          aria-hidden
          className="mag-shade mag-shade--front"
          style={{ opacity: frontShade }}
        />
      </motion.div>
      <motion.div
        className="mag-face mag-face--back"
        style={{ boxShadow: shadow }}
      >
        {back ?? <div aria-hidden className="mag-page mag-page--reverse" />}
        <motion.div
          aria-hidden
          className="mag-shade mag-shade--back"
          style={{ opacity: backShade }}
        />
      </motion.div>
    </motion.div>
  );
}

function PageFace({
  page,
  number,
  progress,
  geo,
  spread,
  onFocusPage,
}: {
  page: MagazinePage;
  number: number;
  progress: MotionValue<number>;
  geo: ReturnType<typeof geometry>;
  spread: number;
  onFocusPage: (page: number) => void;
}) {
  const rest = geo.rest(spread);
  const local = useTransform(
    progress,
    [rest - geo.reach, rest, rest + geo.reach],
    [-1, 0, 1],
  );

  // Open once the turning sheet is about three-quarters over, closed again
  // once it is well on its way out. The gap stops it flickering at the edge.
  const [open, setOpen] = useState(() => isOpen(local.get(), false));
  useMotionValueEvent(local, "change", (v) => setOpen((was) => isOpen(v, was)));

  return (
    <LocalProgress.Provider value={local}>
      <PageOpen.Provider value={open}>
        <article
          className="mag-page-slot"
          aria-label={page.label}
          // Tabbing into a page that has been turned away brings it back.
          onFocus={(event) => {
            if (event.target.matches(":focus-visible")) onFocusPage(number);
          }}
        >
          {page.content}
        </article>
      </PageOpen.Provider>
    </LocalProgress.Provider>
  );
}

function isOpen(local: number, was: boolean) {
  return was ? local > -0.7 && local < 0.75 : local > -0.45 && local < 0.6;
}

/* ---------------------------- Reduced-motion version ------------------------ */

function StaticMagazine({
  pages,
  wide,
}: {
  pages: MagazinePage[];
  wide: boolean;
}) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const goToPage = useCallback((page: number) => {
    refs.current[page]?.scrollIntoView({ block: "start" });
  }, []);

  const spreads: number[][] = [[0]];
  for (let i = 1; i < pages.length; i += 2) {
    spreads.push(i + 1 < pages.length ? [i, i + 1] : [i]);
  }

  return (
    <MagazineNav.Provider value={{ goToPage }}>
      <section className="mag-static" aria-label="The ResX Pulse">
        {spreads.map((spread) => (
          <div
            key={spread[0]}
            className={cn(
              "mag-static-spread",
              !wide && "mag-static-spread--single",
            )}
          >
            {spread.map((n) => (
              <article
                key={pages[n].id}
                ref={(el) => {
                  refs.current[n] = el;
                }}
                aria-label={pages[n].label}
                className="mag-static-page"
              >
                {pages[n].content}
              </article>
            ))}
          </div>
        ))}
      </section>
    </MagazineNav.Provider>
  );
}
