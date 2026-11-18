import photo from "@/assets/trend-report/p14/pilates.jpg";

import { Drift, Reveal } from "../Magazine";
import { DATA_DELAY, Ring, RollingNumber } from "../motion";
import { PulseFrame } from "./PulseFrame";
import "./p14.css";

export const label = "7 a.m. is the New 7 p.m.";

/* The ring draws as 62% counts up, both just after the panel lands. */
const RING_DELAY = DATA_DELAY + 4 * 0.08;

/* 14 · 7 a.m. Is the New 7 p.m., from the ResX Pulse Figma file (node 30:52). */
export default function SevenAm() {
  return (
    <PulseFrame label="04 · 7 a.m. is the New 7 p.m." folio="14">
      <div className="p14-photo absolute top-[-47.55cqw] left-[-69.98cqw] h-[211.03cqw] w-[169.98cqw] overflow-hidden">
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
        <h2 className="p14-headline">7 a.m. is the New 7 p.m.</h2>
      </Reveal>

      <Reveal
        order={1}
        className="absolute top-[21.16cqw] left-[6.86cqw] w-[76.1cqw]"
      >
        <p className="p14-subhead">
          The most sought-after plans now start at 7 a.m., as New Yorkers treat
          a reformer class like a prime-time dinner table.
        </p>
      </Reveal>

      <Reveal
        order={2}
        y={0}
        className="absolute top-[31.08cqw] left-[6.86cqw] w-[86.27cqw]"
      >
        <div className="p14-rule" />
      </Reveal>

      <Reveal order={3} className="p14-panel left-[6.86cqw]">
        <p className="p14-eyebrow">Outside of restaurant reservations</p>
        <p className="p14-figure text-sand-storm tracking-[-0.0576em]">
          <RollingNumber value="#2" delay={DATA_DELAY + 3 * 0.08} />
        </p>
        <p className="p14-caption">Fitness category on ResX</p>
      </Reveal>

      <Reveal order={4} className="p14-panel left-[50.98cqw]">
        <p className="p14-eyebrow">Pilates</p>
        <p className="p14-figure tracking-[-0.0772em]">
          <RollingNumber value="62%" delay={RING_DELAY} />
        </p>
        <p className="p14-caption">Of all workout classes</p>
        <Ring
          value={0.62}
          delay={RING_DELAY}
          className="absolute top-[8.99cqw] left-[28.81cqw] size-[11.27cqw]"
        />
      </Reveal>

      <Reveal
        order={5}
        className="absolute top-[70.22cqw] left-[6.86cqw] w-[86.4cqw]"
      >
        <ul className="p14-bullets">
          <li>
            Apparently the city that never sleeps now just goes to bed early so
            it can make its morning workout class. Fitness was the #2 category
            on ResX outside of restaurant reservations.
          </li>
          <li>
            Pilates did most of the heavy lifting (literally), accounting for
            about 62% of all workout classes in 2026. Turns out the most
            competitive bench in New York isn’t at a chef’s counter. It’s on a
            reformer.
          </li>
        </ul>
      </Reveal>
    </PulseFrame>
  );
}
