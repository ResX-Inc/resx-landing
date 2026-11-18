import map from "@/assets/trend-report/p12/heat-map.svg";
import logo from "@/assets/trend-report/resx-logo-sand.svg";

import { motion } from "motion/react";
import { useRef, useState, type PointerEvent } from "react";

import { Reveal, useReduceMotion } from "../Magazine";
import { DATA_DELAY, RollingNumber } from "../motion";
import "./p12.css";

export const label = "The Heat Map";

/* Ranked neighborhoods and their map markers, in the 816 × 1056 page box. */
const neighborhoods: { name: string; x: number; y: number }[] = [
  { name: "West Village", x: 398.35, y: 522.55 },
  { name: "SoHo", x: 419.41, y: 635.52 },
  { name: "Flatiron", x: 496.63, y: 483.67 },
  { name: "Greenwich Village", x: 440.47, y: 564.24 },
  { name: "NoHo", x: 482.59, y: 596.64 },
  { name: "Midtown", x: 542.21, y: 345.75 },
  { name: "NoMad", x: 514.13, y: 439.28 },
  { name: "East Village", x: 549.23, y: 604.09 },
  { name: "Williamsburg", x: 717.6, y: 724.4 },
  { name: "Lower East Side", x: 521.15, y: 705.93 },
];

/*
 * The West Village outline (Figma vector 28:68). It's the only neighborhood
 * the design outlines, as No. 1, so it stays on the map throughout: full
 * strength while it's the focus, quieter while another neighborhood is.
 */
const WEST_VILLAGE =
  "M368.112 461.744L452.46 508.076L420.06 566.396L409.908 591.56L364.332 585.62L365.412 579.032L355.152 577.844L354.18 592.964L350.076 592.64L329.016 590.48L329.34 589.076L331.176 570.392L351.696 572.12L352.344 561.968L352.884 552.896L353.208 548.36L348.132 548.252L331.716 547.928V545.444L353.424 545.768L353.748 543.068L353.964 539.18L345.648 538.64L345.756 536.156L353.964 536.588L355.26 520.28L354.936 519.74L354.72 518.984L354.936 518.228L355.26 517.472L356.448 501.596L352.236 501.38L352.344 499.436L351.912 498.788L356.664 498.896L357.096 491.336L355.908 491.228L354.612 491.336L350.076 491.012L349.428 490.58L348.672 488.528L348.348 487.772L349.104 484.856L348.456 486.368L343.38 486.152L343.812 485.612L343.704 484.64L343.38 483.56L343.92 482.372L348.78 482.264L348.672 483.992L349.536 478.268L344.676 478.052L341.22 477.296L349.428 477.404L350.184 476.972L362.388 477.728L363.36 476.972L363.144 476.216L363.576 475.352L363.9 473.084L362.712 472.868L344.676 469.952L345 467.576L363.144 469.952L363.684 466.172L364.872 466.28L365.736 460.448L368.112 461.744Z";

/* The map area (page units) that responds to the pointer, and how close counts. */
const MAP_TOP = 206;
const MAP_BOTTOM = 854;
const PICK_RADIUS = 80;

const SPRING = {
  type: "spring",
  stiffness: 140,
  damping: 20,
  mass: 0.8,
} as const;

/*
 * The heat: a sand glow, two rings and a pulse sitting on the focused
 * neighborhood. It rests on the West Village (No. 1) and glides to whichever
 * marker or key row is pointed at or focused.
 */
function Heat({ active }: { active: number }) {
  const reduce = useReduceMotion();
  const { x, y } = neighborhoods[active];
  const move = reduce ? { duration: 0 } : SPRING;
  return (
    <svg
      viewBox="0 0 816 1056"
      className="pointer-events-none absolute inset-0 size-full"
      aria-hidden
    >
      <defs>
        <radialGradient id="p12-glow">
          <stop offset="0" stopColor="#FFD9A1" stopOpacity="0.3" />
          <stop offset="1" stopColor="#FFD9A1" stopOpacity="0" />
        </radialGradient>
        <clipPath id="p12-map">
          <rect y={MAP_TOP} width="816" height={MAP_BOTTOM - MAP_TOP} />
        </clipPath>
      </defs>

      <g clipPath="url(#p12-map)">
        <motion.path
          d={WEST_VILLAGE}
          fill="#FFD9A1"
          stroke="#FFD9A1"
          strokeWidth="1.188"
          strokeLinejoin="round"
          initial={false}
          animate={
            active === 0
              ? { fillOpacity: 0.1, strokeOpacity: 0.8 }
              : { fillOpacity: 0.04, strokeOpacity: 0.4 }
          }
          transition={{ duration: reduce ? 0 : 0.5, ease: "easeOut" }}
        />

        <motion.g initial={false} animate={{ x, y }} transition={move}>
          <motion.circle
            r="62.64"
            fill="url(#p12-glow)"
            animate={reduce ? undefined : { scale: [1, 1.12, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          {!reduce && (
            <motion.circle
              key={active}
              r="11"
              fill="none"
              stroke="#FFD9A1"
              strokeWidth="0.864"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 4.2, opacity: 0 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <circle
            r="25.92"
            fill="none"
            stroke="#FFD9A1"
            strokeOpacity="0.3"
            strokeWidth="0.864"
          />
          <circle
            r="17.28"
            fill="none"
            stroke="#FFD9A1"
            strokeOpacity="0.5"
            strokeWidth="0.864"
          />
          <circle r="10.8" fill="#FFD9A1" />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="#0a0a0a"
            fontSize="9"
            fontWeight="700"
            letterSpacing="-0.03em"
          >
            {active + 1}
          </text>
        </motion.g>
      </g>
    </svg>
  );
}

/*
 * 12 · The Heat Map, from the ResX Pulse Figma file (node 28:44).
 *
 * The map is the Figma "Map" frame (28:54) exported as one SVG. Its artwork
 * runs past the frame, so the export is page-sized and sits on the whole
 * page. This page has no running section label, only the small logo, so the
 * header and footer are set here instead of with PulseFrame.
 */
export default function HeatMap() {
  const [active, setActive] = useState(0);
  const page = useRef<HTMLDivElement>(null);

  // Picks the marker nearest the pointer, in page units. The page is flat at
  // rest, so its bounding box maps straight onto the 816 × 1056 artboard.
  const pick = (event: PointerEvent) => {
    const box = page.current?.getBoundingClientRect();
    if (!box) return;
    const px = ((event.clientX - box.left) / box.width) * 816;
    const py = ((event.clientY - box.top) / box.height) * 1056;
    let best = -1;
    let bestDistance = PICK_RADIUS;
    neighborhoods.forEach(({ x, y }, i) => {
      const distance = Math.hypot(px - x, py - y);
      if (distance < bestDistance) {
        best = i;
        bestDistance = distance;
      }
    });
    if (best !== -1) setActive(best);
  };

  return (
    <div className="pulse-page" ref={page}>
      <img
        src={map.src}
        alt="Map of Manhattan and Brooklyn marking the ten neighborhoods with the most ResX activity, with the West Village highlighted as number one"
        className="absolute inset-0 size-full"
        loading="eager"
      />

      <div
        className="absolute inset-x-0 top-[25.25cqw] bottom-[25.25cqw]"
        onPointerMove={pick}
        onPointerDown={pick}
        onPointerLeave={() => setActive(0)}
      />
      <Heat active={active} />

      <img
        src={logo.src}
        alt=""
        className="absolute top-[4.17cqw] left-[6.86cqw] h-[1.23cqw] w-[4.33cqw]"
      />

      <Reveal order={0} className="absolute top-[13.42cqw] left-[6.86cqw]">
        <h2 className="p12-headline">The Heat Map</h2>
      </Reveal>

      <Reveal order={1} className="absolute top-[21.14cqw] left-[6.86cqw]">
        <p className="p12-subhead">The Neighborhoods ResX Diners Got Around</p>
      </Reveal>

      <Reveal
        order={2}
        className="absolute top-[35.05cqw] left-[6.86cqw] w-[21.94cqw]"
      >
        <p className="p12-key-intro">
          The neighborhoods that had the most ResX activity:
        </p>
      </Reveal>

      <ol className="p12-key absolute top-[41.506cqw] left-[6.86cqw] w-[21.81cqw]">
        {neighborhoods.map(({ name }, i) => (
          <li key={name}>
            <Reveal order={3 + i * 0.6} className="p12-key-row">
              <button
                type="button"
                className="p12-key-button"
                data-active={active === i || undefined}
                aria-pressed={active === i}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(0)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(0)}
              >
                <span className="p12-badge">{i + 1}</span>
                <span className="p12-key-name">{name}</span>
              </button>
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal
        order={10}
        className="absolute top-[104.9cqw] left-[6.86cqw] h-[13.88cqw] w-[86.27cqw] border-t border-[rgb(255_217_161/0.35)]"
      >
        <p className="p12-stats-label absolute top-[2.67cqw] left-0 w-[18.5cqw]">
          <span className="text-sand-storm block">West Village</span>
          <span className="block text-white/40">No. 1 neighborhood</span>
        </p>

        <p className="p12-stat absolute top-[2.63cqw] left-[21.81cqw] tracking-[-0.0731em]">
          <RollingNumber value="3.4x" delay={DATA_DELAY + 10 * 0.08} />
        </p>
        <p className="p12-stat-note absolute top-[9.2cqw] left-[21.81cqw] w-[29.53cqw]">
          The West Village had 3.4 times as many completed claims as SoHo
        </p>

        <p className="p12-stat absolute top-[2.63cqw] left-[55.76cqw] tracking-[-0.0654em]">
          <RollingNumber
            value="72,000+"
            delay={DATA_DELAY + 10 * 0.08 + 0.15}
          />
        </p>
        <p className="p12-stat-note absolute top-[9.2cqw] left-[55.76cqw] w-[29.53cqw]">
          Alerts, claims, and submissions in the West Village this year
        </p>
      </Reveal>

      <img
        src={logo.src}
        alt=""
        className="absolute bottom-[3.68cqw] left-[6.86cqw] h-[1.59cqw] w-[5.63cqw]"
      />
      <p className="pulse-folio absolute right-[6.86cqw] bottom-[3.92cqw]">
        12
      </p>
    </div>
  );
}
