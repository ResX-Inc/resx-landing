import "./p15.css";

import axis from "@/assets/trend-report/p15/chart-axis.svg";
import bracket from "@/assets/trend-report/p15/chart-bracket.svg";
import baseball from "@/assets/trend-report/p15/icon-baseball.svg";
import basketball from "@/assets/trend-report/p15/icon-basketball.svg";
import soccerBall from "@/assets/trend-report/p15/icon-soccer-ball.svg";
import tennisBall from "@/assets/trend-report/p15/icon-tennis-ball.svg";
import photo from "@/assets/trend-report/p15/us-open.jpg";

import { Drift, Reveal } from "../Magazine";
import { DATA_DELAY, Pop, RollingNumber, Wipe } from "../motion";
import { PulseFrame } from "./PulseFrame";

export const label = "The Summer New York Became a Stadium";

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

/* Sport icons between Memorial Day and Labor Day: left edge in % of the chart. */
const SPORTS = [
  { icon: tennisBall, left: "40.55%" },
  { icon: soccerBall, left: "46.33%" },
  { icon: basketball, left: "52.11%" },
  { icon: baseball, left: "57.91%" },
  { icon: tennisBall, left: "63.69%" },
];

/*
 * The year axis with the summer bracketed (Figma "Chart", 640 × 82). Once the
 * panel lands (Reveal order 3) the axis draws across, the summer bracket
 * opens, and the balls drop in one game at a time.
 */
const CHART_DELAY = DATA_DELAY + 3 * 0.08;

function SummerChart() {
  return (
    <div
      role="img"
      aria-label="Sports submissions by month, clustered between Memorial Day and Labor Day"
      className="absolute top-[15.06cqw] left-[3.43cqw] h-[10.05cqw] w-[78.43cqw] overflow-hidden"
    >
      <Wipe
        delay={CHART_DELAY}
        duration={1.1}
        className="absolute top-[34.15%] left-0 h-[2.44%] w-full"
      >
        <img src={axis.src} alt="" className="block size-full" />
      </Wipe>
      <Wipe
        direction="right"
        delay={CHART_DELAY + 0.45}
        duration={0.6}
        className="absolute top-[18.29%] left-[39.34%] h-[34.15%] w-[28.98%]"
      >
        <img src={bracket.src} alt="" className="block size-full" />
      </Wipe>
      {SPORTS.map(({ icon, left }, i) => (
        <Pop
          key={left}
          delay={CHART_DELAY + 0.75 + i * 0.12}
          className="absolute top-[21.95%] h-[26.83%] w-[3.44%]"
          style={{ left }}
        >
          <img src={icon.src} alt="" className="block size-full" />
        </Pop>
      ))}
      {MONTHS.map((month, i) => (
        <span
          key={i}
          className="p15-month"
          style={{ left: `${((i + 0.5) * 100) / 12}%` }}
        >
          {month}
        </span>
      ))}
      <span className="p15-day left-[39.45%]">MEMORIAL DAY</span>
      <span className="p15-day right-[31.78%] text-right">LABOR DAY</span>
    </div>
  );
}

/* 15 · The Summer New York Became a Stadium (Figma node 31:56). */
export default function Stadium() {
  return (
    <PulseFrame label="04 · The Summer New York Became a Stadium" folio="15">
      <div className="p15-photo top-[-4.9cqw] left-[-4.9cqw] h-[139.22cqw] w-[109.8cqw]">
        <Drift y={1} scale={[1.04, 1]} className="absolute inset-0">
          <img
            src={photo.src}
            alt=""
            className="size-full object-cover"
            loading="eager"
          />
        </Drift>
      </div>

      <Reveal
        order={0}
        className="absolute top-[13.42cqw] left-[6.86cqw] w-[86.4cqw]"
      >
        <h2 className="p15-headline">The Summer New York Became a Stadium</h2>
      </Reveal>

      <Reveal
        order={1}
        className="absolute top-[27.43cqw] left-[6.86cqw] w-[76.1cqw]"
      >
        <p className="p15-subhead">
          Between the World Cup, the Knicks’ title run, and the US Open, 2026
          was the summer every New Yorker became a sports fan, or at least
          dressed like one.
        </p>
      </Reveal>

      <Reveal
        order={2}
        y={0}
        className="absolute top-[40.67cqw] left-[6.86cqw] w-[86.27cqw]"
      >
        <div className="p15-rule" />
      </Reveal>

      <Reveal
        order={3}
        className="absolute top-[44.72cqw] left-[6.86cqw] h-[28.05cqw] w-[86.27cqw]"
      >
        <section className="p15-panel">
          <h3 className="p15-eyebrow absolute top-[2.94cqw] left-[3.43cqw]">
            Sports submissions
          </h3>
          <p className="p15-stat absolute top-[5.76cqw] left-[3.43cqw] tracking-[-0.0707em]">
            <RollingNumber value="55%" delay={CHART_DELAY} />
          </p>
          <p className="p15-caption absolute top-[9.97cqw] right-[3.55cqw] w-[27.08cqw] text-right">
            Happened between Memorial and Labor Day
          </p>
          <SummerChart />
        </section>
      </Reveal>

      <Reveal
        order={4}
        className="absolute top-[74.73cqw] left-[6.86cqw] h-[15.35cqw] w-[86.27cqw]"
      >
        <section className="p15-panel">
          <h3 className="p15-eyebrow absolute top-[5.69cqw] left-[3.43cqw]">
            The US Open
          </h3>
          <p className="p15-caption absolute top-[7.77cqw] left-[3.43cqw] whitespace-nowrap">
            Single most-submitted experience on ResX
          </p>
          <p className="p15-stat absolute top-[2.57cqw] right-[3.68cqw] w-[14.83cqw] text-right tracking-[-0.0625em]">
            <RollingNumber value="160" delay={DATA_DELAY + 4 * 0.08} />
          </p>
          <p className="p15-caption absolute top-[10.77cqw] right-[3.68cqw] w-[14.83cqw] text-right">
            Submissions
          </p>
        </section>
      </Reveal>

      <ul className="p15-body absolute top-[92.95cqw] left-[6.86cqw] flex w-[86.4cqw] flex-col gap-[1.62cqw]">
        <li>
          <Reveal order={5} className="relative pl-[2.94cqw]">
            <span className="p15-dash" aria-hidden="true" />
            <p>
              For one summer, New York sports were the main event. The World Cup
              came to town, the Knicks brought home their first championship in
              53 years, and suddenly every bar, park, and rooftop turned into a
              stadium. 55% of all sports submissions happened between Memorial
              and Labor Day – from the Knicks and Yankees to World Cup matches
              and even watch parties at Bryant Park and Radio City.
            </p>
          </Reveal>
        </li>
        <li>
          <Reveal order={6} className="relative pl-[2.94cqw]">
            <span className="p15-dash" aria-hidden="true" />
            <p>
              But the real champion? The US Open. With 160 submissions, it was
              the single most-submitted experience on ResX this year. Somewhere
              between the Honey Deuces, the Instagram-ready tennis whites, and
              the courtside fit checks, the Open became less a sporting event
              and more New York’s chicest outdoor runway.
            </p>
          </Reveal>
        </li>
      </ul>
    </PulseFrame>
  );
}
