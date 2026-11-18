import martini from "@/assets/trend-report/p13/martini.svg";
import photo from "@/assets/trend-report/p13/pizza.jpg";

import { Drift, Reveal } from "../Magazine";
import { DATA_DELAY, Grow, Pop, RollingNumber } from "../motion";
import { PulseFrame } from "./PulseFrame";
import "./p13.css";

export const label = "It Must Be Nice to Have a West Village Reservation";

/* Chip widths are the Figma ones (cqw), so the row breaks where it does there. */
const restaurants = [
  ["4 Charles", 10.21],
  ["Don Angie", 10.73],
  ["The Eighty Six", 13.49],
  ["Via Carota", 10.76],
  ["Wild Cherry", 11.8],
  ["L’Artusi", 8.57],
  ["Emmett’s on Grove", 16.63],
] as const;

/* 13 · West Village, from the ResX Pulse Figma file (node 29:48). */
export default function WestVillage() {
  return (
    <PulseFrame label="03 · West Village" folio="13">
      <div className="p13-photo absolute top-[-0.25cqw] left-0 h-[141.18cqw] w-[113.73cqw] overflow-hidden">
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
        <h2 className="p13-headline">
          It Must Be Nice to Have a West Village Reservation
        </h2>
      </Reveal>

      <Reveal
        order={1}
        className="absolute top-[27.41cqw] left-[6.86cqw] w-[76.1cqw]"
      >
        <p className="p13-subhead">
          The West Village girl isn’t just a TikTok archetype. She’s the most
          active user on ResX.
        </p>
      </Reveal>

      <Reveal
        order={2}
        y={0}
        className="absolute top-[37.33cqw] left-[6.86cqw] w-[86.27cqw]"
      >
        <div className="p13-rule" />
      </Reveal>

      <Reveal order={3} className="p13-panel top-[41.37cqw] left-[6.86cqw]">
        <p className="p13-eyebrow">Completed claims</p>
        <p className="p13-figure text-sand-storm tracking-[-0.0731em]">
          <RollingNumber value="3.4x" delay={DATA_DELAY + 0.24} />
        </p>
        <p className="p13-bar-label top-[16.17cqw]">West Village</p>
        <Grow
          delay={DATA_DELAY + 0.24}
          synced
          className="p13-bar bg-sand-storm top-[16.04cqw] w-[22.06cqw]"
        />
        <p className="p13-bar-label top-[20.09cqw]">SoHo (No. 2)</p>
        <Grow
          delay={DATA_DELAY + 0.24}
          synced
          className="p13-bar top-[19.96cqw] w-[6.48cqw] bg-white/18"
        />
      </Reveal>

      <Reveal order={4} className="p13-panel top-[41.37cqw] left-[50.98cqw]">
        <p className="p13-eyebrow">Top 20 hottest restaurants</p>
        <p className="p13-figure tracking-[-0.057em]">
          <RollingNumber value="7" delay={DATA_DELAY + 0.32} />{" "}
          <span className="text-sand-storm">of 20</span>
        </p>
        <div className="p13-glasses" aria-hidden="true">
          {Array.from({ length: 20 }, (_, i) =>
            i < restaurants.length ? (
              <Pop key={i} delay={DATA_DELAY + 0.4 + i * 0.12}>
                <img src={martini.src} alt="" className="size-full" />
              </Pop>
            ) : (
              <span key={i} className="p13-glass-off" />
            ),
          )}
        </div>
      </Reveal>

      <Reveal
        order={5}
        className="absolute top-[69.42cqw] left-[6.86cqw] w-[86.27cqw]"
      >
        <ul
          className="p13-chips"
          aria-label="West Village restaurants in the top 20"
        >
          {restaurants.map(([name, width]) => (
            <li
              key={name}
              className="p13-chip"
              style={{ width: `${width}cqw` }}
            >
              {name}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal
        order={6}
        className="absolute top-[81.12cqw] left-[6.86cqw] w-[86.4cqw]"
      >
        <ul className="p13-bullets">
          <li>
            The West Village was the center of gravity on ResX this year, with
            over 72,000 alerts, claims, and submissions. Seven of the 20 hottest
            restaurants on ResX are West Village spots: 4 Charles, Don Angie,
            The Eighty Six, Via Carota, Wild Cherry, L’Artusi, and Emmett’s on
            Grove.
          </li>
          <li className="whitespace-nowrap">
            <span className="text-sand-storm font-semibold">3.4x</span> The West
            Village had 3.4 times as many completed claims as SoHo
          </li>
        </ul>
      </Reveal>
    </PulseFrame>
  );
}
