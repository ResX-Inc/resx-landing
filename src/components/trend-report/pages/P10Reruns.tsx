import photo from "@/assets/trend-report/p10/corner-store.jpg";
import ticket from "@/assets/trend-report/p10/ticket.svg";

import { Drift, Reveal } from "../Magazine";
import { PulseFrame } from "./PulseFrame";
import "./p10.css";

export const label = "New York Doesn’t Do Reruns";

const EXPERIENCES = [
  "The Corner Store: Oli’s Pop Ups",
  "Dominique Ansel Pie Night",
  "Piscator Pop-Ups",
];

/* An "Admit One" ticket for one limited-time experience. */
function Ticket({ title }: { title: string }) {
  return (
    <div className="relative h-[26.96cqw] w-[27.45cqw]">
      <div className="p10-frost" />
      <img src={ticket.src} alt="" className="absolute inset-0 size-full" />

      <p className="p10-caps text-sand-storm absolute top-[3.25cqw] left-[3.06cqw] text-[max(5px,1.164cqw)]">
        Admit One
      </p>
      <p className="p10-caps text-sand-storm absolute top-[3.25cqw] right-[3.06cqw] text-[max(5px,1.164cqw)]">
        2026
      </p>
      <h3 className="absolute bottom-[8.27cqw] left-[3.06cqw] w-[21.45cqw] text-[2.941cqw] leading-[1.15] font-semibold tracking-[-0.049em]">
        {title}
      </h3>
      <div className="absolute top-[20.96cqw] left-[3.06cqw] w-[21.32cqw] border-t border-dashed border-[#3a3a3a]" />
      <p className="absolute top-[22.55cqw] left-[3.06cqw] text-[max(5px,1.103cqw)] leading-none font-semibold tracking-[0.16em] whitespace-nowrap text-white/40 uppercase">
        Limited-time experience
      </p>
    </div>
  );
}

/* 10 · New York Doesn’t Do Reruns, from the ResX Pulse Figma file (node 24:36). */
export default function Reruns() {
  return (
    <PulseFrame label="02 · New York Doesn’t Do Reruns" folio="10">
      <div className="absolute top-[-26.47cqw] left-[-21.81cqw] h-[194.85cqw] w-[156.99cqw] overflow-hidden">
        <Drift y={1} scale={[1.04, 1]} className="absolute inset-0">
          <img
            src={photo.src}
            alt=""
            className="size-full object-cover"
            loading="eager"
          />
        </Drift>
        <div className="absolute inset-0 bg-[rgb(0_0_0/0.8)]" />
      </div>

      <Reveal order={0} className="absolute top-[13.42cqw] left-[6.86cqw]">
        <h2 className="text-[6.127cqw] leading-[1.02] font-bold tracking-[-0.0598em] whitespace-nowrap">
          New York Doesn’t Do Reruns.
        </h2>
      </Reveal>

      <Reveal order={1} className="absolute top-[21.14cqw] left-[6.86cqw]">
        <p className="text-[2.574cqw] leading-[1.3] tracking-[-0.0506em] whitespace-nowrap text-white/60">
          You Just Had to Be There
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
        className="absolute top-[31.78cqw] left-[6.86cqw] w-[86.4cqw]"
      >
        <p className="text-[2.451cqw] leading-[1.5] tracking-[-0.0469em] text-white/82">
          Not every great reservation is at a restaurant you can revisit. These
          were a few of the limited-time experiences that generated buzz on ResX
          this year.
        </p>
      </Reveal>

      <ul className="absolute top-[44.03cqw] left-[6.86cqw] flex gap-[1.96cqw]">
        {EXPERIENCES.map((title, i) => (
          <li key={title}>
            <Reveal order={4 + i}>
              <Ticket title={title} />
            </Reveal>
          </li>
        ))}
      </ul>

      <Reveal
        order={7}
        className="absolute top-[75.86cqw] left-[9.8cqw] w-[83.46cqw]"
      >
        <p className="relative text-[1.777cqw] leading-[1.62] text-white/82">
          <span className="bg-sand-storm absolute top-[1.38cqw] left-[-2.94cqw] h-[0.18cqw] w-[1.23cqw]" />
          New Yorkers love a hard-to-get table, but limited-time dining
          experiences bring a different kind of excitement. This year, pop-up
          dinners, special events, and chef collaborations generated plenty of
          buzz on ResX, offering something beyond the usual restaurant
          reservation. From Oli’s pop-ups at The Corner Store to Dominique
          Ansel’s Pie Night, these experiences gave diners something to look
          forward to that wasn’t always available. And when an experience only
          comes around every so often, getting a reservation becomes that much
          more exciting.
        </p>
      </Reveal>
    </PulseFrame>
  );
}
