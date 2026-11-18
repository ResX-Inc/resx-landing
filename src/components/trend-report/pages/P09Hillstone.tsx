import type { ReactNode } from "react";

import photo from "@/assets/trend-report/p09/hillstone.jpg";

import { Drift, Reveal } from "../Magazine";
import { DATA_DELAY, RollingNumber, Wipe } from "../motion";
import { PulseFrame } from "./PulseFrame";
import "./p09.css";

export const label = "Hillstone Is New York’s Chili’s";

const BEATEN = ["Misi", "Monkey Bar", "Minetta Tavern", "Don Angie"];

/* The second bullet breaks after "restaurant" as in the print layout. */
const BULLETS: ReactNode[] = [
  "Gen Z has a soft spot for chain restaurants. Across the country, the Chili’s revival turned the Triple Dipper into a personality trait. We’re not driving to the strip mall for dinner, so in New York, Gen Z gets that comfortable nostalgia feeling from a different chain: Hillstone.",
  <>
    With over 1,800 completed reservations, it was the most claimed restaurant
    <br />
    on ResX this year, more than Misi, Monkey Bar, Minetta Tavern, and Don Angie
    combined. That’s a chain restaurant beating four of the city’s
    most-talked-about tables at their own game.
  </>,
];

/* A body paragraph led by a short sand dash. */
function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="relative">
      <span className="bg-sand-storm absolute top-[1.38cqw] left-[-2.94cqw] h-[0.18cqw] w-[1.23cqw]" />
      {children}
    </li>
  );
}

/* 09 · Hillstone, from the ResX Pulse Figma file (node 23:32). */
export default function Hillstone() {
  return (
    <PulseFrame label="02 · Hillstone" folio="09">
      <div className="absolute top-[6.37cqw] left-[-12.62cqw] h-[155.27cqw] w-[125.12cqw] overflow-hidden">
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
        <h2 className="text-[6.127cqw] leading-[1.02] font-bold tracking-[-0.0581em] whitespace-nowrap">
          Hillstone Is New York’s Chili’s
        </h2>
      </Reveal>

      <Reveal
        order={1}
        className="absolute top-[21.16cqw] left-[6.86cqw] w-[76.1cqw]"
      >
        <p className="text-[2.574cqw] leading-[1.3] tracking-[-0.0537em] text-white/60">
          Gen Z is falling for the comfort of a chain. In New York, that chain
          comes with a two-week wait.
        </p>
      </Reveal>

      <Reveal
        order={2}
        y={0}
        className="absolute top-[31.08cqw] left-[6.86cqw] w-[86.27cqw]"
      >
        <div className="h-px bg-[rgb(255_217_161/0.35)]" />
      </Reveal>

      <Reveal
        order={4}
        className="absolute top-[35.12cqw] left-[6.86cqw] h-[30.35cqw] w-[86.27cqw]"
      >
        <div className="p09-panel relative size-full">
          <p className="text-sand-storm absolute top-[6.31cqw] left-[3.68cqw] text-[1.225cqw] leading-none font-bold tracking-[0.16em] whitespace-nowrap uppercase">
            Most claimed restaurant on ResX
          </p>
          <p className="text-sand-storm absolute top-[9.68cqw] left-[3.68cqw] text-[11.765cqw] leading-[0.92] font-bold tracking-[-0.0668em] whitespace-nowrap">
            <RollingNumber value="1,800+" delay={DATA_DELAY + 0.32} />
          </p>
          <p className="p09-caps absolute top-[22.41cqw] left-[3.68cqw]">
            Completed reservations
          </p>

          <div className="absolute top-[3.55cqw] left-[46.31cqw] w-[36.04cqw]">
            <p className="p09-caps">Hillstone claimed more than</p>
            <ul className="mt-[1.83cqw] text-[1.838cqw] leading-none font-semibold whitespace-nowrap">
              {BEATEN.map((name, i) => (
                <li key={name} className="p09-row">
                  <Wipe
                    direction="right"
                    delay={DATA_DELAY + 0.5 + i * 0.12}
                    duration={0.6}
                    className="absolute inset-0"
                  >
                    <span
                      aria-hidden
                      className="text-sand-storm absolute top-[1.1cqw] left-0 tracking-[-0.027em]"
                    >
                      +
                    </span>
                    <span className="absolute top-[1.1cqw] left-[3.19cqw] tracking-[-0.037em]">
                      {name}
                    </span>
                  </Wipe>
                </li>
              ))}
            </ul>
            <p className="p09-caps h-[3.11cqw] pt-[1.35cqw] shadow-[inset_0_1px_0_#262626]">
              Combined
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal
        order={5}
        className="absolute top-[69.36cqw] left-[9.8cqw] w-[65.81cqw]"
      >
        <ul className="flex flex-col gap-[1.59cqw] text-[1.777cqw] leading-[1.62] text-white/82">
          {BULLETS.map((text, i) => (
            <Bullet key={i}>{text}</Bullet>
          ))}
        </ul>
      </Reveal>
    </PulseFrame>
  );
}
