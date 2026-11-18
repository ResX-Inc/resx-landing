import photo from "@/assets/trend-report/p03/steak-martini.jpg";

import { Drift, Reveal, useMagazineNav } from "../Magazine";
import { PulseFrame } from "./PulseFrame";
import "./p03.css";

export const label = "Contents";

interface Entry {
  title: string;
  /** Printed page number, e.g. "04". */
  page: string;
  /** Letter-spacing from the design, in em. */
  tracking: number;
}

interface Chapter {
  number: string;
  name?: string;
  tracking: number;
  entries: Entry[];
}

const intro: Entry = { title: "Introduction", page: "02", tracking: -0.0351 };

const chapters: Chapter[] = [
  {
    number: "01",
    name: "The Numbers",
    tracking: -0.0527,
    entries: [
      { title: "The Want Ratio", page: "04", tracking: -0.0319 },
      { title: "Top Bites", page: "05", tracking: -0.0368 },
      { title: "Amuse-Bouche", page: "06", tracking: -0.0386 },
    ],
  },
  {
    number: "02",
    name: "The Tables",
    tracking: -0.0476,
    entries: [
      { title: "The Hottest New Openings", page: "07", tracking: -0.0366 },
      { title: "Red Meat Isn’t Over", page: "08", tracking: -0.037 },
      {
        title: "Hillstone Is New York’s Chili’s",
        page: "09",
        tracking: -0.0402,
      },
      { title: "New York Doesn’t Do Reruns", page: "10", tracking: -0.0414 },
      {
        title: "The Most Popular Restaurants in New York in 2026",
        page: "11",
        tracking: -0.0372,
      },
    ],
  },
  {
    number: "03",
    name: "The Map",
    tracking: -0.0449,
    entries: [
      { title: "The Heat Map", page: "12", tracking: -0.0357 },
      {
        title: "It Must Be Nice to Have a West Village Reservation",
        page: "13",
        tracking: -0.035,
      },
    ],
  },
  {
    number: "04",
    name: "The Lifestyle",
    tracking: -0.0417,
    entries: [
      { title: "7 a.m. is the New 7 p.m.", page: "14", tracking: -0.0427 },
      {
        title: "The Summer New York Became a Stadium",
        page: "15",
        tracking: -0.0368,
      },
      { title: "Beyond Dining", page: "16", tracking: -0.0375 },
      { title: "Last Call for the Nightclub", page: "17", tracking: -0.033 },
    ],
  },
  {
    number: "—",
    tracking: -0.02,
    entries: [{ title: "Final Thoughts", page: "18", tracking: -0.0363 }],
  },
];

/* One line of the contents: title, dotted leader, page number. Turns to that page. */
function EntryButton({ entry }: { entry: Entry }) {
  const { goToPage } = useMagazineNav();
  return (
    <button
      type="button"
      className="p03-entry mag-link"
      onClick={() => goToPage(Number(entry.page) - 1)}
      aria-label={`${entry.title}, page ${Number(entry.page)}`}
    >
      <span
        className="p03-entry-title"
        style={{ letterSpacing: `${entry.tracking}em` }}
      >
        {entry.title}
      </span>
      <span className="p03-entry-leader" aria-hidden="true" />
      <span className="p03-entry-page">{entry.page}</span>
    </button>
  );
}

/* 03 · Contents, from the ResX Pulse Figma file (node 17:8). */
export default function Contents() {
  return (
    <PulseFrame label="Contents" folio="03">
      <div className="pulse-backdrop absolute top-[-1.1cqw] left-[-2.94cqw] h-[131.37cqw] w-[105.88cqw]">
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
        <h2 className="p03-title">Table of Contents</h2>
      </Reveal>

      <nav aria-label="Table of contents">
        <Reveal
          order={1}
          className="absolute top-[24.57cqw] left-[22.55cqw] w-[70.59cqw]"
        >
          <EntryButton entry={intro} />
        </Reveal>

        <ol className="p03-chapters absolute top-[30.02cqw] left-[6.86cqw] w-[86.27cqw]">
          {chapters.map((chapter, i) => (
            <li key={chapter.number}>
              <Reveal order={2 + i} className="p03-chapter">
                <p
                  className="p03-chapter-number"
                  style={{ letterSpacing: `${chapter.tracking}em` }}
                >
                  {chapter.number}
                </p>
                {chapter.name && (
                  <p className="p03-chapter-name">{chapter.name}</p>
                )}
                <ul className="p03-entries">
                  {chapter.entries.map((entry) => (
                    <li key={entry.page}>
                      <EntryButton entry={entry} />
                    </li>
                  ))}
                </ul>
              </Reveal>
            </li>
          ))}
        </ol>
      </nav>
    </PulseFrame>
  );
}
