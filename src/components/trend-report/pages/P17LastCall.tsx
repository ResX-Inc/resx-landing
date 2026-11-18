import "./p17.css";

import photo from "@/assets/trend-report/p17/listening-bar.jpg";
import emptyMonth from "@/assets/trend-report/p17/month-empty.svg";
import musicNote from "@/assets/trend-report/p17/music-note.svg";

import { Drift, Reveal } from "../Magazine";
import { DATA_DELAY, Grow, Loop, Pop, RollingNumber } from "../motion";
import { PulseFrame } from "./PulseFrame";

export const label = "Last Call for the Nightclub";

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

/*
 * One slot per month (Figma "Chart", 300 × 64): a sand note for January to
 * October, an empty tile for November and December. Slots sit every 25px.
 */
function SteadyChart() {
  return (
    <div
      role="img"
      aria-label="Submitted every month from January through October"
      className="absolute top-[2.21cqw] left-[46.32cqw] h-[7.84cqw] w-[36.76cqw] overflow-hidden"
    >
      {MONTHS.map((month, i) => (
        <div key={i}>
          {/* Notes land month by month, then bob in sequence like a melody. */}
          <Pop
            delay={NOTES_DELAY + i * 0.08}
            className="absolute top-[9.38%] h-[37.5%] w-[7%]"
            style={{ left: `${(1 + 25 * i) / 3}%` }}
          >
            {i < 10 ? (
              <Loop
                keyframes={{ y: ["0%", "-14%", "0%", "0%"] }}
                duration={2.4}
                delay={NOTES_DELAY + 1.2 + i * 0.16}
                className="size-full"
              >
                <img src={musicNote.src} alt="" className="block size-full" />
              </Loop>
            ) : (
              <img src={emptyMonth.src} alt="" className="block size-full" />
            )}
          </Pop>
          <span
            className="p17-month"
            style={{ left: `${(11.5 + 25 * i) / 3}%` }}
          >
            {month}
          </span>
        </div>
      ))}
    </div>
  );
}

/* The bars grow once the first panel lands (Reveal order 3); the notes once the second does. */
const BARS_DELAY = DATA_DELAY + 3 * 0.08;
const NOTES_DELAY = DATA_DELAY + 4 * 0.08 + 0.2;

/* 17 · Last Call for the Nightclub (Figma node 32:60). */
export default function LastCall() {
  return (
    <PulseFrame label="04 · Last Call for the Nightclub" folio="17">
      <div className="p17-photo top-0 left-[-10.66cqw] h-[144.85cqw] w-[116.79cqw]">
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
        <h2 className="p17-headline">Last Call for the Nightclub</h2>
      </Reveal>

      <Reveal
        order={1}
        className="absolute top-[21.18cqw] left-[6.86cqw] w-[76.1cqw]"
      >
        <p className="p17-subhead">
          The new night out isn’t about how late you stay. It’s about who’s
          playing, who you’re with, and whether you’ll remember it in the
          morning.
        </p>
      </Reveal>

      <Reveal
        order={2}
        y={0}
        className="absolute top-[34.42cqw] left-[6.86cqw] w-[86.27cqw]"
      >
        <div className="p17-rule" />
      </Reveal>

      <Reveal
        order={3}
        className="absolute top-[38.47cqw] left-[6.86cqw] h-[17.19cqw] w-[86.27cqw]"
      >
        <section className="p17-panel">
          <h3 className="p17-eyebrow absolute top-[2.94cqw] left-[3.19cqw]">
            Submissions
          </h3>
          <p className="p17-stat absolute top-[6cqw] left-[3.19cqw]">
            <RollingNumber value="2x" delay={BARS_DELAY} />
          </p>
          <p className="p17-bar-label top-[5.53cqw]">Funny Bar</p>
          <Grow
            delay={BARS_DELAY}
            synced
            className="p17-bar bg-sand-storm top-[5.41cqw] w-[33.58cqw]"
          />
          <p className="p17-bar-label top-[9.46cqw]">Harry Styles tickets</p>
          <Grow
            delay={BARS_DELAY}
            synced
            className="p17-bar top-[9.33cqw] w-[16.79cqw] bg-white/18"
          />
        </section>
      </Reveal>

      <Reveal
        order={4}
        className="absolute top-[57.61cqw] left-[6.86cqw] h-[12.5cqw] w-[86.27cqw]"
      >
        <section className="p17-panel">
          <p className="p17-caption absolute top-[3.44cqw] left-[2.94cqw]">
            Submitted steadily, January – October
          </p>
          <h3 className="p17-names absolute top-[5.99cqw] left-[2.94cqw]">
            <span className="tracking-[-0.0328em]">Birds Jazz Club </span>
            <span className="text-sand-storm tracking-[-0.0824em]">·</span>
            <span className="tracking-[-0.0338em]"> Saint Tuesday</span>
          </h3>
          <SteadyChart />
        </section>
      </Reveal>

      <ul className="p17-body absolute top-[74cqw] left-[6.86cqw] w-[68.26cqw]">
        <li>
          <Reveal order={5} className="relative pl-[2.94cqw]">
            <span className="p17-dash" aria-hidden="true" />
            <p>
              On ResX, there were double the submissions for Funny Bar, the tiny
              live jazz hotspot in The Lower East Side, than there were Harry
              Styles tickets. And they weren’t one-night-only moments, either.
              Birds Jazz Club and Saint Tuesday were submitted steadily from
              January through October, which tells us something bigger: people
              aren’t chasing a single big night, they’re building a weekly
              ritual.
            </p>
          </Reveal>
        </li>
      </ul>
    </PulseFrame>
  );
}
