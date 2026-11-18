import doorIcon from "@/assets/trend-report/p05/icon-door.svg";
import pastaIcon from "@/assets/trend-report/p05/icon-pasta.svg";
import repeatIcon from "@/assets/trend-report/p05/icon-repeat.svg";
import tableIcon from "@/assets/trend-report/p05/icon-table-for-two.svg";
import photo from "@/assets/trend-report/p05/spaghetti.jpg";

import { Drift, Reveal } from "../Magazine";
import { DATA_DELAY, Pop, RollingNumber } from "../motion";
import { PulseFrame } from "./PulseFrame";
import "./p05.css";

export const label = "Top Bites";

interface Stat {
  kicker: string;
  figure: string;
  note: string;
  icon: { src: string };
  /** Icon box in cqw: left, top, width, height. */
  iconBox: [number, number, number, number];
  /** Tops of the figure and note (cqw), and letter-spacing (em), from the design. */
  figureTop: number;
  noteTop: number;
  kickerTracking: number;
  figureTracking: number;
}

const stats: Stat[] = [
  {
    kicker: "Welcome",
    figure: "49.7%",
    note: "First-time users claimers & submitters in 2026",
    icon: doorIcon,
    iconBox: [31.86, 2.94, 7.11, 7.11],
    figureTop: 12.13,
    noteTop: 19.95,
    kickerTracking: 0.0656,
    figureTracking: -0.0781,
  },
  {
    kicker: "The Regulars",
    figure: "59%",
    note: "were repeat users in 2026",
    icon: repeatIcon,
    iconBox: [31.86, 2.94, 7.11, 7.11],
    figureTop: 12.13,
    noteTop: 19.92,
    kickerTracking: 0.0693,
    figureTracking: -0.0741,
  },
  {
    kicker: "Mamma Mia",
    figure: "1 in 4",
    note: "NYC reservation claims were for Italian Restaurants",
    icon: pastaIcon,
    iconBox: [31.13, 2.94, 7.84, 6.62],
    figureTop: 11.64,
    noteTop: 19.46,
    kickerTracking: 0.05,
    figureTracking: -0.0581,
  },
  {
    kicker: "Tête-à-Tête",
    figure: "63%",
    note: "of all reservations claimed were for tables of 2",
    icon: tableIcon,
    iconBox: [30.64, 1.71, 8.33, 8.33],
    figureTop: 12.13,
    noteTop: 19.95,
    kickerTracking: 0.0655,
    figureTracking: -0.0754,
  },
];

function StatPanel({ stat, index }: { stat: Stat; index: number }) {
  // Lands just after the panel's own entrance (Reveal order 4 + index).
  const delay = DATA_DELAY + (4 + index) * 0.08;
  const [left, top, width, height] = stat.iconBox;
  return (
    <div className="p05-panel">
      <h3
        className="p05-kicker top-[2.88cqw] left-[2.94cqw]"
        style={{ letterSpacing: `${stat.kickerTracking}em` }}
      >
        {stat.kicker}
      </h3>
      <Pop
        delay={delay + 0.2}
        className="p05-panel-icon"
        style={{
          left: `${left}cqw`,
          top: `${top}cqw`,
          width: `${width}cqw`,
          height: `${height}cqw`,
        }}
      >
        <img src={stat.icon.src} alt="" className="size-full" />
      </Pop>
      <p
        className="p05-panel-figure"
        style={{
          top: `${stat.figureTop}cqw`,
          letterSpacing: `${stat.figureTracking}em`,
        }}
      >
        <RollingNumber value={stat.figure} delay={delay} />
      </p>
      <p className="p05-panel-note" style={{ top: `${stat.noteTop}cqw` }}>
        {stat.note}
      </p>
    </div>
  );
}

/* 05 · Top Bites, from the ResX Pulse Figma file (node 19:16). */
export default function TopBites() {
  return (
    <PulseFrame label="01 · Top Bites" folio="05">
      <div className="p05-photo absolute top-[-12.5cqw] left-[-0.25cqw] h-[159.68cqw] w-[128.68cqw]">
        <Drift y={1} scale={[1.04, 1]} className="absolute inset-0">
          <img
            src={photo.src}
            alt=""
            className="size-full object-cover"
            loading="eager"
          />
        </Drift>
      </div>

      <Reveal order={0} className="absolute top-[13.42cqw] left-[6.86cqw]">
        <h2 className="p05-title">Top Bites</h2>
      </Reveal>

      <Reveal order={1} className="absolute top-[21.14cqw] left-[6.86cqw]">
        <p className="p05-subhead">
          The numbers that defined the hottest tables in 2026
        </p>
      </Reveal>

      <Reveal
        order={2}
        y={0}
        className="absolute top-[27.73cqw] left-[6.86cqw] w-[86.27cqw]"
      >
        <div className="p05-rule" />
      </Reveal>

      <Reveal
        order={3}
        className="absolute top-[31.78cqw] left-[6.86cqw] w-[86.27cqw]"
      >
        <div className="p05-hero">
          <h3
            className="p05-kicker top-[3.98cqw] left-[4.04cqw]"
            style={{ letterSpacing: "0.0576em" }}
          >
            Cha Ching
          </h3>
          <p className="p05-hero-figure">
            <RollingNumber value="$3,124,554" delay={DATA_DELAY + 0.25} />
          </p>
          <p className="p05-hero-note">
            ResX saved diners $3,124,554.42 in cancellation fees in 2026
          </p>
        </div>
      </Reveal>

      <ul className="p05-panels absolute top-[59.14cqw] left-[6.86cqw]">
        {stats.map((stat, i) => (
          <li key={stat.kicker}>
            <Reveal order={4 + i}>
              <StatPanel stat={stat} index={i} />
            </Reveal>
          </li>
        ))}
      </ul>
    </PulseFrame>
  );
}
