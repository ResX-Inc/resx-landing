import "./p18.css";

import photo from "@/assets/trend-report/p18/pigeon-pizza.jpg";
import logo from "@/assets/trend-report/resx-logo-sand.svg";

import { Drift, Reveal } from "../Magazine";

export const label = "Final Thoughts";

/*
 * 18 · Final Thoughts (Figma node 32:115), the back page. It keeps the
 * standard running header but closes with a large logo and the site link
 * instead of the usual footer, so it builds its frame itself.
 */
export default function FinalThoughts() {
  return (
    <div className="pulse-page">
      <div className="p18-photo top-0 left-[-26.1cqw] h-[152.08cqw] w-[188.6cqw]">
        <Drift y={1} scale={[1.04, 1]} className="absolute inset-0">
          <img
            src={photo.src}
            alt=""
            className="size-full object-cover"
            loading="eager"
          />
        </Drift>
      </div>

      {/* Running header, as in PulseFrame. */}
      <img
        src={logo.src}
        alt=""
        className="absolute top-[4.17cqw] left-[6.86cqw] h-[1.23cqw] w-[4.33cqw]"
      />
      <p className="pulse-running absolute top-[4.11cqw] right-[6.86cqw]">
        Final Thoughts
      </p>

      <Reveal order={0} className="absolute top-[13.42cqw] left-[6.86cqw]">
        <h2 className="p18-headline">Final Thoughts</h2>
      </Reveal>

      <Reveal
        order={1}
        y={0}
        className="absolute top-[22.43cqw] left-[6.86cqw] w-[86.27cqw]"
      >
        <div className="p18-rule" />
      </Reveal>

      <Reveal
        order={2}
        className="absolute top-[26.37cqw] left-[6.86cqw] w-[76.1cqw]"
      >
        <p className="p18-lead">
          If 2026 proved anything, it’s that New Yorkers don’t plan weeks out
          anymore, whether it’s dinner, a concert, or a 7 a.m. class. They want
          what’s hot right now, not what was hot two weeks ago.
        </p>
      </Reveal>

      <Reveal
        order={3}
        className="absolute top-[45.62cqw] left-[6.86cqw] w-[76.1cqw]"
      >
        <p className="p18-body tracking-[-0.0419em]">
          On average, they claimed reservations just a day ahead and snapped
          them up in under an hour. They traded reformer classes like prime-time
          tables, scrambled for US Open seats, and jumped on one-night-only
          pop-ups the moment they dropped. And they made spots that had just
          opened, like Ambassadors Clubhouse, feel like institutions by spring.
        </p>
      </Reveal>

      <Reveal
        order={4}
        className="absolute top-[64.66cqw] left-[6.86cqw] w-[76.1cqw]"
      >
        <p className="p18-body tracking-[-0.0434em]">
          When plans changed, someone else’s reservation became your Friday
          night, someone else’s class became your Saturday morning, and nobody
          had to eat a cancellation fee. That’s what ResX is for: spontaneity,
          wherever the night (or morning) takes you.
        </p>
      </Reveal>

      <Reveal
        order={5}
        className="absolute top-[98.41cqw] left-[6.86cqw] w-[86.4cqw]"
      >
        <p className="p18-signoff">
          <span className="text-sand-storm tracking-[-0.0629em]">
            See you in 2027.
          </span>
          <br />
          <span className="tracking-[-0.0662em]">We’ll save you a seat.</span>
        </p>
      </Reveal>

      <Reveal
        order={6}
        className="absolute top-[112.13cqw] left-[6.99cqw] h-[4.17cqw] w-[14.73cqw]"
      >
        <img src={logo.src} alt="ResX" className="size-full" />
      </Reveal>

      <a
        href="https://www.resx.co"
        target="_blank"
        rel="noreferrer"
        className="p18-site mag-link absolute top-[122.06cqw] right-[6.86cqw]"
      >
        resx.co
      </a>
    </div>
  );
}
