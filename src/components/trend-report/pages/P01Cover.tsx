import { useEffect, useRef } from "react";

import logo from "@/assets/trend-report/resx-logo-sand.svg";

import { Drift, Reveal, usePageOpen, useReduceMotion } from "../Magazine";

export const label = "Cover";

/*
 * 01 · Cover, from the ResX Pulse Figma file (node 16:2).
 *
 * Pulse pages are print layouts on an 816 × 1056 artboard. Every measurement
 * is the Figma value divided by 8.16, i.e. in cqw of the page, so the page
 * scales as one piece.
 *
 * The background is a night clip of the Empire State Building. The file is
 * already a palindrome (the clip, then the same frames reversed), so a plain
 * `loop` drifts back and forth with no jump at the seam. It only plays while
 * the cover is open, and holds on the first frame for reduced motion.
 */
export default function Cover() {
  const video = useRef<HTMLVideoElement>(null);
  const open = usePageOpen();
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (open && !reduceMotion) {
      // Autoplay can still be refused (e.g. Low Power Mode); the poster stays.
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [open, reduceMotion]);

  return (
    <div className="pulse-page">
      <div className="pulse-cover-photo">
        <Drift y={1} className="absolute inset-0">
          <video
            ref={video}
            src="/video/empire-state.mp4"
            poster="/video/empire-state-poster.jpg"
            className="size-full object-cover object-[50%_30%]"
            aria-label="The Empire State Building lit up at night"
            muted
            loop
            playsInline
            preload="auto"
          />
        </Drift>
      </div>

      <div className="absolute inset-x-[6.86cqw] top-[6.34cqw] flex items-start justify-between">
        <img
          src={logo.src}
          alt="ResX"
          className="mt-[0.09cqw] h-[3.19cqw] w-[11.27cqw]"
        />
        <p className="pulse-label text-right">
          The ResX Pulse
          <br />
          Presented by ResX
        </p>
      </div>

      <div className="absolute top-[21.75cqw] left-[6.86cqw]">
        <Reveal order={0}>
          <p className="pulse-eyebrow">Presented by ResX</p>
        </Reveal>
        <Reveal order={1} className="mt-[3.1cqw]">
          <h1 className="pulse-cover-title">
            The ResX
            <br />
            Pulse
          </h1>
        </Reveal>
        <Reveal order={2} className="mt-[3.2cqw]">
          <p className="pulse-cover-subtitle">
            What New York Couldn’t Get Enough of in 2026
          </p>
        </Reveal>
      </div>

      <div className="absolute inset-x-[6.86cqw] bottom-[5.94cqw] flex items-center justify-between">
        <p className="text-[max(7px,1.593cqw)] leading-[1.108] font-bold tracking-[-0.0096em] text-white">
          2026
        </p>
        <a
          href="https://www.resx.co"
          className="pulse-label mag-link"
          target="_blank"
          rel="noreferrer"
        >
          resx.co
        </a>
      </div>
    </div>
  );
}
