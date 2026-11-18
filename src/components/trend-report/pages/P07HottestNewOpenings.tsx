import baseline from "@/assets/trend-report/p07/chart-baseline.svg";
import tick from "@/assets/trend-report/p07/chart-tick.svg";
import legendAll from "@/assets/trend-report/p07/legend-all.svg";
import legendTop from "@/assets/trend-report/p07/legend-top10.svg";
import photo from "@/assets/trend-report/p07/rigatoni.jpg";

import { motion } from "motion/react";

import { Drift, Reveal, usePageOpen, useReduceMotion } from "../Magazine";
import { DATA_DELAY } from "../motion";
import { DOTS, VIEWBOX } from "./p07-dots";
import { PulseFrame } from "./PulseFrame";
import "./p07.css";

export const label = "The Hottest New Openings";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const OPENINGS = [
  ["Cafe Charmant", "Coastal French · West Village", "Sep"],
  ["Ambassadors Clubhouse", "Indian · NoMad", "Feb"],
  ["Strakers", "Modern European · SoHo", "Oct"],
  ["Graciela", "Argentinian · West Village", "Jul"],
  ["Or’esh", "Mediterranean · SoHo", "Feb"],
  ["Humm", "Modern American · West Village", "Oct"],
  ["Romy", "Steakhouse · SoHo", "Sep"],
  ["Faux", "French · Tribeca", "Sep"],
  ["Lady Delilah", "American · Meatpacking", "Nov"],
  ["Keepers", "Pizza & bar · West Village", "Jul"],
] as const;

/* Month ticks sit every 1/12 of the chart, starting half a step in. */
const tickLeft = (i: number) => `${((i + 0.5) / 12) * 100}%`;

/*
 * The dots stack up month by month, left to right, like openings being
 * counted in. Starts once the chart panel (Reveal order 4) has landed.
 */
function Dots() {
  const open = usePageOpen();
  const reduce = useReduceMotion();
  const shown = open || reduce;
  return (
    <svg
      viewBox={VIEWBOX}
      preserveAspectRatio="none"
      overflow="visible"
      className="absolute top-0 left-0 h-[14.71cqw] w-full"
    >
      {DOTS.map(([cx, cy, top], i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r={3}
          fill="#FFD9A1"
          fillOpacity={top ? 1 : 0.22}
          initial={false}
          animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: -14 }}
          transition={
            shown && !reduce
              ? {
                  duration: 0.35,
                  ease: [0.3, 1.4, 0.5, 1],
                  delay:
                    DATA_DELAY +
                    0.32 +
                    (cx / 702) * 0.9 +
                    ((109 - cy) / 8) * 0.05,
                }
              : { duration: 0 }
          }
        />
      ))}
    </svg>
  );
}

/* The "when they opened" dot chart, drawn from the exported Figma vectors. */
function OpeningsChart() {
  return (
    <div className="relative size-full rounded-[1.72cqw] bg-[rgb(20_20_20/0.86)] shadow-[inset_0_0_0_1px_#262626]">
      <p className="p07-caps absolute top-[2.57cqw] left-[2.94cqw]">
        When they opened
      </p>

      <div className="absolute top-[2.7cqw] left-[51.59cqw] flex items-center gap-[0.74cqw]">
        <img src={legendTop.src} alt="" className="size-[0.86cqw]" />
        <p className="p07-caps leading-[1.2]">Top 10</p>
        <span className="w-[1.23cqw]" />
        <img src={legendAll.src} alt="" className="size-[0.86cqw]" />
        <p className="p07-caps leading-[1.2]">All new openings on ResX</p>
      </div>

      <div
        className="absolute top-[4.94cqw] left-0 h-[18.38cqw] w-[86.03cqw] overflow-hidden"
        role="img"
        aria-label="New openings by month in 2026, with the top 10 opening in February, July, September, October and November."
      >
        <Dots />
        <img
          src={baseline.src}
          alt=""
          className="absolute top-[14.4cqw] left-0 h-[0.12cqw] w-full"
        />
        {MONTHS.map((month, i) => (
          <div key={month} aria-hidden>
            <img
              src={tick.src}
              alt=""
              className="absolute top-[13.97cqw] h-[0.98cqw] w-[0.12cqw] -translate-x-1/2"
              style={{ left: tickLeft(i) }}
            />
            <span className="p07-month" style={{ left: tickLeft(i) }}>
              {month.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpeningRow({
  rank,
  name,
  meta,
  month,
  order,
}: {
  rank: number;
  name: string;
  meta: string;
  month: string;
  order: number;
}) {
  return (
    <li className="p07-row">
      <Reveal order={order} className="absolute inset-0">
        <span className="text-sand-storm absolute top-[2.94cqw] left-0 text-[1.838cqw] leading-none font-bold tracking-[-0.028em]">
          {String(rank).padStart(2, "0")}
        </span>
        <p className="absolute top-[1.29cqw] left-[4.9cqw] text-[2.206cqw] leading-[1.15] font-semibold tracking-[-0.043em]">
          {name}
        </p>
        <p className="absolute top-[4.5cqw] left-[4.9cqw] text-[1.348cqw] leading-[1.3] font-medium text-white/60">
          {meta}
        </p>
        <p className="absolute top-[3.25cqw] right-0 text-[1.225cqw] leading-none font-semibold tracking-[0.12em] text-white/40 uppercase">
          {month}
        </p>
      </Reveal>
    </li>
  );
}

/* 07 · Hottest New Openings, from the ResX Pulse Figma file (node 21:24). */
export default function HottestNewOpenings() {
  return (
    <PulseFrame label="02 · The Hottest New Openings" folio="07">
      <div className="absolute top-[-0.98cqw] left-[-1.96cqw] h-[137.75cqw] w-[110.91cqw] overflow-hidden">
        <Drift y={1} scale={[1.04, 1]} className="absolute inset-0">
          <img
            src={photo.src}
            alt=""
            className="size-full object-cover"
            loading="eager"
          />
        </Drift>
        <div className="absolute inset-0 bg-[rgb(0_0_0/0.79)]" />
      </div>

      <Reveal order={0} className="absolute top-[13.42cqw] left-[6.86cqw]">
        <h2 className="text-[6.127cqw] leading-[1.02] font-bold tracking-[-0.0535em] whitespace-nowrap">
          The Hottest New Openings
        </h2>
      </Reveal>

      <Reveal order={1} className="absolute top-[21.14cqw] left-[6.86cqw]">
        <p className="text-[2.574cqw] leading-[1.3] tracking-[-0.0553em] whitespace-nowrap text-white/60">
          in New York in 2026
        </p>
      </Reveal>

      <Reveal
        order={3}
        className="absolute top-[27.36cqw] left-[6.86cqw] w-[78.55cqw]"
      >
        <p className="text-[1.9cqw] leading-[1.55] text-white/82">
          These are the most highly-coveted restaurants that opened in 2026.
        </p>
      </Reveal>

      <Reveal
        order={4}
        className="absolute top-[37.29cqw] left-[6.86cqw] h-[25.29cqw] w-[86.27cqw]"
      >
        <OpeningsChart />
      </Reveal>

      <ol className="absolute top-[66.5cqw] left-[6.86cqw] w-[40.93cqw]">
        {OPENINGS.slice(0, 5).map(([name, meta, month], i) => (
          <OpeningRow
            key={name}
            rank={i + 1}
            name={name}
            meta={meta}
            month={month}
            order={5 + i}
          />
        ))}
      </ol>
      <ol
        start={6}
        className="absolute top-[66.5cqw] left-[52.21cqw] w-[40.93cqw]"
      >
        {OPENINGS.slice(5).map(([name, meta, month], i) => (
          <OpeningRow
            key={name}
            rank={i + 6}
            name={name}
            meta={meta}
            month={month}
            order={Math.min(5 + i, 10)}
          />
        ))}
      </ol>
    </PulseFrame>
  );
}
