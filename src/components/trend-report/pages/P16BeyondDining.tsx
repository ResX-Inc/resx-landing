import "./p16.css";

import pilates from "@/assets/trend-report/p16/icon-pilates.svg";
import soundwave from "@/assets/trend-report/p16/icon-soundwave.svg";
import sun from "@/assets/trend-report/p16/icon-sun.svg";
import photo from "@/assets/trend-report/p16/palms.jpg";

import { Drift, Reveal } from "../Magazine";
import { DATA_DELAY, Loop, Pop, RollingNumber } from "../motion";
import { PulseFrame } from "./PulseFrame";

export const label = "Beyond Dining";

const PANELS = [
  {
    icon: sun,
    iconClass: "top-[4.9cqw] left-[3.92cqw] h-[14.22cqw] w-[14.22cqw]",
    title: "We went to Mykonos & Sardinia,",
    titleTracking: "tracking-[-0.0485em]",
    text: "There were over 3,900 non-restaurant experiences traded in 2026",
    stat: "3,900+",
    /* The sun breathes and turns slightly, like heat haze. */
    motion: {
      keyframes: { scale: [1, 1.06, 1], rotate: [0, 6, 0] },
      duration: 4,
    },
    statTracking: "tracking-[-0.0657em]",
  },
  {
    icon: soundwave,
    iconClass: "top-[7.6cqw] left-[3.06cqw] h-[7.84cqw] w-[15.07cqw]",
    title: "Then we partied with Rufus Du Sol,",
    titleTracking: "tracking-[-0.0478em]",
    text: "From center court at the US Open to the front row at 600+ different concerts.",
    stat: "600+",
    /* The soundwave pulses like a level meter. */
    motion: {
      keyframes: { scaleY: [1, 0.72, 1.08, 0.86, 1] },
      duration: 1.4,
    },
    statTracking: "tracking-[-0.056em]",
  },
  {
    icon: pilates,
    iconClass: "top-[7.11cqw] left-[5.64cqw] h-[10.78cqw] w-[10.54cqw]",
    title: "…Then we locked in and went to Pilates.",
    titleTracking: "tracking-[-0.0533em]",
    text: "Over half of all fitness-related experiences were Pilates classes",
    stat: "Over ½",
    /* The reformer figure eases through a slow stretch. */
    motion: {
      keyframes: { rotate: [0, -4, 0], y: ["0%", "-3%", "0%"] },
      duration: 3,
    },
    statTracking: "tracking-[-0.0668em]",
  },
];

/* 16 · Beyond Dining (Figma node 34:68). */
export default function BeyondDining() {
  return (
    <PulseFrame label="04 · Beyond Dining" folio="16">
      <div className="p16-photo top-[-4.9cqw] left-[-4.9cqw] h-[139.22cqw] w-[109.8cqw]">
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
        <h2 className="p16-headline">Beyond Dining</h2>
      </Reveal>

      <Reveal
        order={1}
        y={0}
        className="absolute top-[22.92cqw] left-[6.86cqw] w-[86.27cqw]"
      >
        <div className="p16-rule" />
      </Reveal>

      <ul className="absolute top-[26.96cqw] left-[6.86cqw] flex w-[86.27cqw] flex-col gap-[2.7cqw]">
        {PANELS.map((panel, i) => (
          <li key={panel.stat} className="h-[25.25cqw]">
            <Reveal order={2 + i} className="h-full">
              <div className="p16-panel">
                <Pop
                  delay={DATA_DELAY + (2 + i) * 0.08}
                  className={`absolute ${panel.iconClass}`}
                >
                  <Loop
                    keyframes={panel.motion.keyframes}
                    duration={panel.motion.duration}
                    delay={DATA_DELAY + 0.6 + i * 0.2}
                    className="size-full"
                  >
                    <img src={panel.icon.src} alt="" className="size-full" />
                  </Loop>
                </Pop>
                <h3 className={`p16-title ${panel.titleTracking}`}>
                  {panel.title}
                </h3>
                <p className="p16-text">{panel.text}</p>
                <p className={`p16-stat ${panel.statTracking}`}>
                  {/\d/.test(panel.stat) ? (
                    <RollingNumber
                      value={panel.stat}
                      delay={DATA_DELAY + (2 + i) * 0.08}
                    />
                  ) : (
                    panel.stat
                  )}
                </p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </PulseFrame>
  );
}
