import type { CSSProperties, ReactNode } from "react";

import dayBarPeak from "@/assets/trend-report/p06/day-bar-peak.svg";
import dayBar from "@/assets/trend-report/p06/day-bar.svg";
import hourBarPeak from "@/assets/trend-report/p06/hour-bar-peak.svg";
import hourBar from "@/assets/trend-report/p06/hour-bar.svg";
import monthBarFirst from "@/assets/trend-report/p06/month-bar-first.svg";
import monthBarSecond from "@/assets/trend-report/p06/month-bar-second.svg";
import monthBar from "@/assets/trend-report/p06/month-bar.svg";
import peakTick from "@/assets/trend-report/p06/peak-tick.svg";
import photo from "@/assets/trend-report/p06/pepes.jpg";
import stopwatch from "@/assets/trend-report/p06/stopwatch.svg";

import { Drift, Reveal } from "../Magazine";
import { DATA_DELAY, Grow, Pop } from "../motion";
import { PulseFrame } from "./PulseFrame";
import "./p06.css";

export const label = "Amuse-Bouche";

const SAND = "var(--color-sand-storm)";
const DIM = "rgb(255 255 255 / 0.45)";

/* Left edge (cqw) of the nth of the twelve slim bars in the hour and month charts. */
const slot = (i: number) => 0.294 + 3.627 * i;

/* Each row's bars rise left to right just after the row lands (Reveal `order`). */
const barDelay = (order: number, i: number) =>
  DATA_DELAY + order * 0.08 + i * 0.045;

function Bar({
  src,
  box,
  color,
  fontSize,
  delay,
  children,
}: {
  src: string;
  delay: number;
  /** left, top, width, height in cqw */
  box: [number, number, number, number];
  color?: string;
  fontSize?: string;
  children?: ReactNode;
}) {
  const [left, top, width, height] = box;
  const style: CSSProperties = {
    left: `${left}cqw`,
    top: `${top}cqw`,
    width: `${width}cqw`,
    height: `${height}cqw`,
    color,
    fontSize,
  };
  return (
    <Grow
      axis="y"
      delay={delay}
      duration={0.7}
      className="p06-bar"
      style={style}
    >
      <img src={src} alt="" />
      {children && <span>{children}</span>}
    </Grow>
  );
}

/* Days of the week, Friday lit, with the 5–6 p.m. peak marked below. */
function DayChart() {
  return (
    <div className="p06-chart" aria-hidden="true">
      {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
        <Bar
          key={i}
          src={i === 4 ? dayBarPeak.src : dayBar.src}
          box={[0.29 + 6.18 * i, 0, 5.29, 8.53]}
          color={i === 4 ? "#0a0a0a" : "rgb(255 255 255 / 0.5)"}
          fontSize="2.206cqw"
          delay={barDelay(2, i)}
        >
          {day}
        </Bar>
      ))}
      <Pop
        delay={barDelay(2, 7) + 0.25}
        className="absolute top-[9.41cqw] left-[21.62cqw] w-[6.86cqw]"
        style={{ transformOrigin: "50% 0" }}
      >
        <img
          src={peakTick.src}
          alt=""
          className="absolute top-0 left-[3.27cqw] h-[0.88cqw] w-[0.22cqw]"
        />
        <p className="text-sand-storm absolute top-[1.33cqw] left-0 w-full text-center text-[1.618cqw] leading-[1.21] font-bold whitespace-nowrap">
          5–6 p.m.
        </p>
      </Pop>
    </div>
  );
}

/* Hours from noon to midnight, 7 and 8 p.m. lit. */
function HourChart() {
  const ticks: [number, string, string][] = [
    [0, "12 p.m.", DIM],
    [3, "3 p.m.", DIM],
    [6, "6", DIM],
    [7, "7", SAND],
    [9, "9 p.m.", SAND],
    [11, "11", DIM],
  ];
  return (
    <div className="p06-chart" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <Bar
          key={i}
          src={i === 7 || i === 8 ? hourBarPeak.src : hourBar.src}
          box={[slot(i), 1.47, 3.19, 5.88]}
          delay={barDelay(3, i)}
        />
      ))}
      {ticks.map(([i, text, color]) => (
        <p
          key={text}
          className="p06-axis"
          style={{ left: `${slot(i)}cqw`, color }}
        >
          {text}
        </p>
      ))}
    </div>
  );
}

/* Months of the year, May first and October second. */
function MonthChart() {
  return (
    <div className="p06-chart" aria-hidden="true">
      {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map(
        (month, i) => {
          const first = i === 4;
          const second = i === 9;
          return (
            <div key={i}>
              <Bar
                src={
                  first
                    ? monthBarFirst.src
                    : second
                      ? monthBarSecond.src
                      : monthBar.src
                }
                box={[slot(i), 1.47, 3.04, 5.88]}
                color={first ? "#0a0a0a" : "#fff"}
                fontSize="1.765cqw"
                delay={barDelay(4, i)}
              >
                {first ? "1" : second ? "2" : null}
              </Bar>
              <p
                className="p06-axis w-[3.04cqw] text-center"
                style={{
                  left: `${slot(i)}cqw`,
                  color: first || second ? "#fff" : DIM,
                }}
              >
                {month}
              </p>
            </div>
          );
        },
      )}
    </div>
  );
}

function Row({
  order,
  greyRule,
  kicker,
  kickerTop,
  bodyTop,
  body,
  chart,
}: {
  order: number;
  /** The design draws the third row's top rule in grey rather than sand. */
  greyRule?: boolean;
  kicker: string;
  kickerTop: number;
  bodyTop: number;
  body: string;
  chart: ReactNode;
}) {
  return (
    <li>
      <Reveal
        order={order}
        className={greyRule ? "p06-row p06-row-grey" : "p06-row"}
      >
        {chart}
        <h3 className="p06-row-kicker" style={{ top: `${kickerTop}cqw` }}>
          {kicker}
        </h3>
        <p className="p06-row-body" style={{ top: `${bodyTop}cqw` }}>
          {body}
        </p>
      </Reveal>
    </li>
  );
}

/* 06 · Amuse-Bouche, from the ResX Pulse Figma file (node 20:20). */
export default function AmuseBouche() {
  return (
    <PulseFrame label="01 · Amuse-Bouche" folio="06">
      <div className="p06-photo absolute top-0 left-[-2.7cqw] h-[156.5cqw] w-[126.1cqw]">
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
        <h2 className="p06-title">Amuse-Bouche</h2>
      </Reveal>

      <Reveal order={1} className="absolute top-[21.14cqw] left-[6.86cqw]">
        <p className="p06-subhead">
          When and how people planned their reservations
        </p>
      </Reveal>

      <ul className="p06-rows absolute top-[27.45cqw] left-[6.86cqw] w-[86.27cqw]">
        <Row
          order={2}
          kicker="Spontaneous Plans"
          kickerTop={4.41}
          bodyTop={6.77}
          body="People planned their weekends as they were happening. Friday between 5-6 p.m. was the most popular hour to claim a reservation on ResX."
          chart={<DayChart />}
        />
        <Row
          order={3}
          kicker="Prime Time"
          kickerTop={7.23}
          bodyTop={9.56}
          body="46% of all reservations were between 7-9 p.m."
          chart={<HourChart />}
        />
        <Row
          order={4}
          greyRule
          kicker="Peak Season"
          kickerTop={7.23}
          bodyTop={9.59}
          body="May was the biggest month to eat out, with October in 2nd place."
          chart={<MonthChart />}
        />
        <Row
          order={5}
          kicker="Speed Round"
          kickerTop={7.23}
          bodyTop={9.59}
          body="65% of all reservations are claimed in under an hour."
          chart={
            <>
              <Pop
                delay={DATA_DELAY + 5 * 0.08 + 0.1}
                className="absolute top-[4.41cqw] left-0 size-[13.53cqw]"
              >
                <img src={stopwatch.src} alt="" className="size-full" />
              </Pop>
              <p className="p06-stamp absolute top-[9.68cqw] left-[16.23cqw] w-[11.99cqw]">
                Claimed in
                <br />
                under an hour
              </p>
            </>
          }
        />
      </ul>
    </PulseFrame>
  );
}
