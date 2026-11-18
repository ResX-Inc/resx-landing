import photo from "@/assets/trend-report/p02/polo-steak-frites.jpg";

import { Drift, Reveal } from "../Magazine";
import { PulseFrame } from "./PulseFrame";

export const label = "Introduction";

/* 02 · Intro, from the ResX Pulse Figma file (node 16:15). */
export default function Intro() {
  return (
    <PulseFrame label="Introduction" folio="02">
      <div className="pulse-backdrop absolute top-0 left-[-5.39cqw] h-[130.76cqw] w-[105.39cqw]">
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
        className="absolute top-[23.28cqw] left-[6.86cqw] w-[86.4cqw]"
      >
        <h2 className="pulse-intro-headline">
          New York had one philosophy in 2026:{" "}
          <span className="pulse-intro-accent">
            if it’s hard to get, we want it more.
          </span>
        </h2>
      </Reveal>

      <Reveal
        order={1}
        y={0}
        className="absolute top-[48.04cqw] left-[6.86cqw] w-[86.27cqw]"
      >
        <div className="pulse-rule" />
      </Reveal>

      <Reveal
        order={2}
        className="pulse-intro-body absolute top-[52.57cqw] left-[6.86cqw] w-[78.55cqw]"
      >
        <p>
          The lines for soft serve, froyo, and homemade ice cream wrapped around
          corners. The $60 rye bread sold out anyway. Steak frites showed up on
          every table worth sitting at. The 7 a.m. Pilates class became as
          coveted as the 8 p.m. reservation, the US Open turned into the city’s
          chicest runway, and the entire city decided to be die-hard Knicks
          fans.
        </p>
        <p className="mt-[3.2em]">
          And New York’s most impossible tables, tickets, and classes?
          <br />
          Traded, claimed, and coveted on ResX.
        </p>
        <p className="mt-[1.6em]">
          Here’s what our data says about how New Yorkers experienced their
          city.
        </p>
      </Reveal>
    </PulseFrame>
  );
}
