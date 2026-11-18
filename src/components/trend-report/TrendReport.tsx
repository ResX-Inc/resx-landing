import type { ComponentType } from "react";

import { Magazine, type MagazinePage } from "./Magazine";

/*
 * The ResX Pulse, built page by page from the Figma file
 * (q3FFmR7CY1jdX07CjkiE81).
 *
 * Every file in ./pages named P<two-digit page number><Name>.tsx is one
 * printed page. It default-exports the page component and exports `label`,
 * the page's name for assistive tech. Pages appear in file-name order, so
 * adding a page is just adding its file.
 */
interface PageModule {
  default: ComponentType;
  label: string;
}

const modules = import.meta.glob<PageModule>("./pages/P[0-9][0-9]*.tsx", {
  eager: true,
});

const pages: MagazinePage[] = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, mod]) => {
    const Page = mod.default;
    return {
      id: path.replace(/^.*\/(P\d\d)[^/]*$/, "$1"),
      label: mod.label,
      content: <Page />,
    };
  });

export function TrendReport() {
  return <Magazine pages={pages} />;
}
