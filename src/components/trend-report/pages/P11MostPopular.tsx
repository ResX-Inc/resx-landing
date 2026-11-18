import photo from "@/assets/trend-report/p11/monkey-bar.jpg";

import { Drift, Reveal } from "../Magazine";
import { PulseFrame } from "./PulseFrame";
import "./p11.css";

export const label = "The Most Popular Restaurants in New York in 2026";

const restaurants = [
  ["Monkey Bar", "American · Midtown"],
  ["Hillstone", "American · NoMad"],
  ["4 Charles Prime Rib", "Steakhouse · West Village"],
  ["Torrisi", "Italian · Nolita"],
  ["Don Angie", "Italian · West Village"],
  ["The Corner Store", "American · SoHo"],
  ["Ambassadors Clubhouse", "Indian · NoMad"],
  ["Minetta Tavern", "French · Greenwich Village"],
  ["The Polo Bar", "American · Midtown"],
  ["Emmett’s on Grove", "Italian · West Village"],
  ["L’Artusi", "Italian · West Village"],
  ["Carbone", "Italian · Greenwich Village"],
  ["Via Carota", "Italian · West Village"],
  ["The Eighty Six", "Steakhouse · West Village"],
  ["Or’esh", "Mediterrenan · SoHo"],
  ["Raoul’s", "French · SoHo"],
  ["Wild Cherry", "American · West Village"],
  ["Red Hook Tavern", "American · Red Hook"],
  ["I Cavallini", "Italian · Williamsburg"],
  ["Tatiana by Kwame Onwuachi", "Caribbean · Upper West Side"],
] as const;

/* One ranked row; the top five get a sand disc and a sand name. */
function Row({
  rank,
  name,
  meta,
}: {
  rank: number;
  name: string;
  meta: string;
}) {
  const top = rank <= 5;
  const number = String(rank).padStart(2, "0");
  const row = (rank - 1) % 10;
  return (
    <li>
      <Reveal order={2 + row * 0.8 + (rank > 10 ? 0.4 : 0)} className="p11-row">
        <span className={top ? "p11-badge" : "p11-rank"}>{number}</span>
        <p className={`p11-name ${top ? "text-sand-storm" : "text-white"}`}>
          {name}
        </p>
        <p className="p11-meta">{meta}</p>
      </Reveal>
    </li>
  );
}

/* 11 · The Most Popular Restaurants, from the ResX Pulse Figma file (node 26:40). */
export default function MostPopular() {
  return (
    <PulseFrame label="02 · Top 20" folio="11">
      <div className="p11-photo absolute top-0 left-[-30.15cqw] h-[165.69cqw] w-[133.46cqw] overflow-hidden">
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
        className="absolute top-[13.42cqw] left-[6.86cqw] w-[86.4cqw]"
      >
        <h2 className="p11-headline">
          The Most Popular Restaurants in New York in 2026
        </h2>
      </Reveal>

      <Reveal order={1} className="absolute top-[28.8cqw] left-[6.86cqw]">
        <p className="p11-subhead">
          These are the most popular and in-demand restaurants on ResX in 2026
        </p>
      </Reveal>

      <ol className="p11-list absolute top-[35.79cqw] left-[6.86cqw]">
        {restaurants.map(([name, meta], i) => (
          <Row key={name} rank={i + 1} name={name} meta={meta} />
        ))}
      </ol>
    </PulseFrame>
  );
}
