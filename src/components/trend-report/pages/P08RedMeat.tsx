import iconDim from "@/assets/trend-report/p08/steak-icon-dim.svg";
import iconLit from "@/assets/trend-report/p08/steak-icon-lit.svg";
import photo from "@/assets/trend-report/p08/steak.jpg";

import { Drift, Reveal } from "../Magazine";
import { DATA_DELAY, Pop, RollingNumber } from "../motion";
import { PulseFrame } from "./PulseFrame";
import "./p08.css";

export const label = "Red Meat Isn’t Over";

const STEAK_ROOMS = [
  "4 Charles",
  "Monkey Bar",
  "The Polo Bar",
  "The Eighty Six",
  "Minetta Tavern",
  "Raoul’s",
  "Chez Fifi",
  "Le Veau d’Or",
  "Cote",
];

const BULLETS = [
  "Every year brings a new prediction about what’s in and what’s out, and this year. Red meat was supposed to be on its way out, but New Yorkers booked a steakhouse anyway.",
  "About 12 of the top 20 most-alerted restaurants were steak-and-martini rooms: 4 Charles, Monkey Bar, The Polo Bar, The Eighty Six, Minetta Tavern, Raoul’s, Chez Fifi, Le Veau d’Or, and Cote.",
];

/* A body paragraph led by a short sand dash. */
function Bullet({ children }: { children: string }) {
  return (
    <li className="relative">
      <span className="bg-sand-storm absolute top-[1.38cqw] left-[-2.94cqw] h-[0.18cqw] w-[1.23cqw]" />
      {children}
    </li>
  );
}

/* "12" rolls in while the twelve steak icons light up one after another. */
const LIT = 12;
const COUNT_DELAY = DATA_DELAY + 4 * 0.08;

/* 08 · Red Meat Isn’t Over, from the ResX Pulse Figma file (node 22:28). */
export default function RedMeat() {
  return (
    <PulseFrame label="02 · Red Meat Isn’t Over" folio="08">
      <div className="absolute top-[-61.89cqw] left-[-4.9cqw] h-[193.38cqw] w-[155.76cqw] overflow-hidden">
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
        <h2 className="text-[6.127cqw] leading-[1.02] font-bold tracking-[-0.0577em] whitespace-nowrap">
          Red Meat Isn’t Over.
        </h2>
      </Reveal>

      <Reveal order={1} className="absolute top-[21.14cqw] left-[6.86cqw]">
        <p className="text-[2.574cqw] leading-[1.3] tracking-[-0.0544em] whitespace-nowrap text-white/60">
          It’s the Most-Wanted Table in New York.
        </p>
      </Reveal>

      <Reveal
        order={2}
        y={0}
        className="absolute top-[27.73cqw] left-[6.86cqw] w-[86.27cqw]"
      >
        <div className="h-px bg-[rgb(255_217_161/0.35)]" />
      </Reveal>

      <Reveal
        order={3}
        className="absolute top-[30.7cqw] left-[6.86cqw] w-[86.4cqw]"
      >
        <p className="text-[2.083cqw] leading-[1.5] tracking-[-0.0479em] text-white/82">
          It felt like every new opening in NYC had a whole chicken on their
          menu, with some sparking viral debate. New Yorkers still preferred red
          meat.
        </p>
      </Reveal>

      <Reveal
        order={4}
        className="absolute top-[39.99cqw] left-[6.86cqw] h-[41.04cqw] w-[86.27cqw]"
      >
        <div className="p08-panel relative size-full">
          <p className="text-sand-storm absolute top-[3.31cqw] left-[3.55cqw] text-[1.225cqw] leading-none font-bold tracking-[0.16em] whitespace-nowrap uppercase">
            Top 20 most-alerted restaurants
          </p>
          <p className="absolute top-[6.37cqw] left-[3.55cqw] text-[7.843cqw] leading-[0.92] font-bold whitespace-nowrap">
            <span className="text-sand-storm tracking-[-0.0617em]">
              <RollingNumber value="12" delay={COUNT_DELAY} />{" "}
            </span>
            <span className="tracking-[-0.0575em]">of 20</span>
          </p>
          <p className="p08-caps absolute top-[12.07cqw] right-[3.55cqw] text-right whitespace-nowrap">
            Steak-and-martini rooms
          </p>

          <div
            role="img"
            aria-label="12 of the top 20 most-alerted restaurants were steak-and-martini rooms"
            className="absolute top-[16.65cqw] left-[3.55cqw] grid grid-cols-[repeat(10,4.9cqw)] gap-x-[3.35cqw] gap-y-[1.47cqw]"
          >
            {Array.from({ length: 20 }, (_, i) => (
              <span key={i} className="relative h-[3.92cqw] w-[4.9cqw]">
                <img src={iconDim.src} alt="" className="size-full" />
                {i < LIT && (
                  <Pop
                    delay={COUNT_DELAY + 0.1 + i * 0.06}
                    className="absolute inset-0"
                  >
                    <img src={iconLit.src} alt="" className="size-full" />
                  </Pop>
                )}
              </span>
            ))}
          </div>

          <ul className="absolute top-[28.91cqw] left-[3.55cqw] flex w-[79.17cqw] flex-wrap gap-x-[0.74cqw] gap-y-[0.98cqw]">
            {STEAK_ROOMS.map((name) => (
              <li key={name} className="p08-chip">
                {name}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal
        order={5}
        className="absolute top-[83.93cqw] left-[9.8cqw] w-[83.46cqw]"
      >
        <ul className="flex flex-col gap-[1.59cqw] text-[1.777cqw] leading-[1.62] text-white/82">
          {BULLETS.map((text) => (
            <Bullet key={text}>{text}</Bullet>
          ))}
        </ul>
      </Reveal>
    </PulseFrame>
  );
}
