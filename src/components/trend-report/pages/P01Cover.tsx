import photo from "@/assets/trend-report/p01/empire-state.png";
import logo from "@/assets/trend-report/resx-logo-sand.svg";

import { Drift, Reveal } from "../Magazine";

export const label = "Cover";

/*
 * 01 · Cover, from the ResX Pulse Figma file (node 16:2).
 *
 * Pulse pages are print layouts on an 816 × 1056 artboard. Every measurement
 * is the Figma value divided by 8.16, i.e. in cqw of the page, so the page
 * scales as one piece.
 */
export default function Cover() {
  return (
    <div className="pulse-page">
      <div className="pulse-cover-photo">
        <Drift y={1} className="absolute inset-0">
          <img
            src={photo.src}
            alt="The Empire State Building lit up at night"
            className="size-full object-cover"
            loading="eager"
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
