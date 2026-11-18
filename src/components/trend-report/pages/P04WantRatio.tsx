import type { CSSProperties } from "react";

import bell from "@/assets/trend-report/p04/bell.svg";
import charles from "@/assets/trend-report/p04/4-charles.jpg";
import cornerStore from "@/assets/trend-report/p04/corner-store.jpg";
import donAngie from "@/assets/trend-report/p04/don-angie.jpg";
import oresh from "@/assets/trend-report/p04/oresh.jpg";
import poloBar from "@/assets/trend-report/p04/polo-bar.jpg";
import torrisi from "@/assets/trend-report/p04/torrisi.jpg";

import { Reveal } from "../Magazine";
import { DATA_DELAY, RollingNumber } from "../motion";
import { PulseFrame } from "./PulseFrame";
import "./p04.css";

export const label = "The Want Ratio";

/* Flat black plus, on some tiles, a soft vignette (as in Figma). */
const flat = (a: number) =>
  `linear-gradient(rgb(0 0 0 / ${a}), rgb(0 0 0 / ${a}))`;
const vignette = (a: number) =>
  `radial-gradient(38.59% 38.59% at 50% 50%, transparent, rgb(0 0 0 / ${a}))`;

interface Tile {
  name: string;
  odds: string;
  photo: { src: string };
  alt: string;
  /** Photo frame inside the tile, in cqw: left, top, width, height. */
  frame: [number, number, number, number];
  shade: string;
  /** Left edge of the rank number (cqw) and letter-spacing (em) from the design. */
  rankLeft: number;
  rankTracking: number;
  oddsTracking: number;
}

const tiles: Tile[] = [
  {
    name: "4 Charles Prime Rib",
    odds: "99.3%",
    photo: charles,
    alt: "A plated dish at 4 Charles Prime Rib",
    frame: [-0.74, -5.19, 28.31, 35.17],
    shade: `${flat(0.62)}, ${vignette(0.25)}`,
    rankLeft: 22.86,
    rankTracking: -0.0427,
    oddsTracking: -0.085,
  },
  {
    name: "The Polo Bar",
    odds: "98.6%",
    photo: poloBar,
    alt: "The Polo Bar’s dining room, hung with equestrian paintings",
    frame: [0, -7.64, 32.48, 40.32],
    shade: `${flat(0.42)}, ${vignette(0.45)}`,
    rankLeft: 22.3,
    rankTracking: -0.0376,
    oddsTracking: -0.0877,
  },
  {
    name: "The Corner Store",
    odds: "98.5%",
    photo: cornerStore,
    alt: "A plate of food at The Corner Store",
    frame: [0, -1.02, 29.41, 29.41],
    shade: `${flat(0.54)}, ${vignette(0.45)}`,
    rankLeft: 22.24,
    rankTracking: -0.035,
    oddsTracking: -0.0856,
  },
  {
    name: "Torrisi",
    odds: "96.7%",
    photo: torrisi,
    alt: "Pasta dishes on a table at Torrisi",
    frame: [0, -4.58, 29.41, 36.52],
    shade: `${flat(0.51)}, ${flat(0.2)}`,
    rankLeft: 22.14,
    rankTracking: -0.0318,
    oddsTracking: -0.0849,
  },
  {
    name: "Or’esh",
    odds: "96%",
    photo: oresh,
    alt: "Or’esh’s candlelit dining room under a chandelier",
    frame: [0, -7.64, 31, 38.48],
    shade: `${flat(0.46)}, ${flat(0.2)}`,
    rankLeft: 22.29,
    rankTracking: -0.033,
    oddsTracking: -0.0826,
  },
  {
    name: "Don Angie",
    odds: "91.7%",
    photo: donAngie,
    alt: "Pinwheel lasagna at Don Angie",
    frame: [0, -9.85, 27.33, 41.05],
    shade: `${flat(0.54)}, ${flat(0.2)}`,
    rankLeft: 22.25,
    rankTracking: -0.0381,
    oddsTracking: -0.0875,
  },
];

function TileCard({ tile, rank }: { tile: Tile; rank: number }) {
  const [left, top, width, height] = tile.frame;
  return (
    <div className="p04-tile">
      <div
        className="p04-tile-photo"
        style={
          {
            left: `${left}cqw`,
            top: `${top}cqw`,
            width: `${width}cqw`,
            height: `${height}cqw`,
            "--p04-shade": tile.shade,
          } as CSSProperties
        }
      >
        <img
          src={tile.photo.src}
          alt={tile.alt}
          className="size-full object-cover"
          loading="lazy"
        />
      </div>

      <p className="p04-pill">
        <img src={bell.src} alt="" />
        <span className="p04-pill-name">{tile.name}</span>
      </p>
      <p
        className="p04-rank"
        style={{
          left: `${tile.rankLeft}cqw`,
          letterSpacing: `${tile.rankTracking}em`,
        }}
      >
        <span className="sr-only">Rank </span>
        {String(rank).padStart(2, "0")}
      </p>
      <p className="p04-beat">You beat</p>
      <p
        className="p04-odds"
        style={{ letterSpacing: `${tile.oddsTracking}em` }}
      >
        {/* Lands just after the tile's own entrance (Reveal order 5 + index). */}
        <RollingNumber
          value={tile.odds}
          delay={DATA_DELAY + (5 + rank - 1) * 0.08}
        />
      </p>
    </div>
  );
}

/* 04 · The Want Ratio, from the ResX Pulse Figma file (node 18:12). */
export default function WantRatio() {
  return (
    <PulseFrame label="01 · The Want Ratio" folio="04">
      <Reveal order={0} className="absolute top-[13.42cqw] left-[6.86cqw]">
        <h2 className="p04-title">The Want Ratio</h2>
      </Reveal>

      <Reveal order={1} className="absolute top-[21.14cqw] left-[6.86cqw]">
        <p className="p04-subhead">
          Score a table here and you’ve beat the odds. We did the math.
        </p>
      </Reveal>

      <Reveal
        order={2}
        y={0}
        className="absolute top-[27.49cqw] left-[6.86cqw] w-[86.27cqw]"
      >
        <div className="p04-rule" />
      </Reveal>

      <Reveal
        order={3}
        className="absolute top-[30.18cqw] left-[6.86cqw] w-[78.55cqw]"
      >
        <p className="p04-body">
          What does it mean when people say a restaurant is impossible to get
          into? Thanks to ResX alert data, we actually know. Every time a 4
          Charles Prime Rib (for example) reservation is approved on ResX, 149
          people are waiting for that exact reservation.
        </p>
      </Reveal>

      <Reveal order={4} className="absolute top-[41.52cqw] left-[6.86cqw]">
        <h3 className="p04-lead">
          The hardest tables in New York, by Want Ratio:
        </h3>
      </Reveal>

      <ol className="p04-tiles absolute top-[46.37cqw] left-[6.86cqw]">
        {tiles.map((tile, i) => (
          <li key={tile.name}>
            <Reveal order={5 + i}>
              <TileCard tile={tile} rank={i + 1} />
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal order={10} className="absolute top-[105.02cqw] left-[6.99cqw]">
        <p className="p04-caption">
          Get a 4 Charles Prime Rib reservation in 2026 and you beat 99.3% of
          people trying
        </p>
      </Reveal>
    </PulseFrame>
  );
}
