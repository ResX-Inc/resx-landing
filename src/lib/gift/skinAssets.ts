import { getImage } from "astro:assets";

import bowBackdrop from "@/assets/gift/skins/bow-backdrop.png";
import bowCopper from "@/assets/gift/skins/bow-copper.png";
import bowRibbons from "@/assets/gift/skins/bow-ribbons.png";
import citySkyline from "@/assets/gift/skins/city-skyline.png";
import holidayRibbon from "@/assets/gift/skins/holiday-ribbon.png";
import holidayWreath from "@/assets/gift/skins/holiday-wreath.png";
import logotypeBronze from "@/assets/gift/skins/logotype-bronze.png";
import logotypeSand from "@/assets/gift/skins/logotype-sand.png";
import tablePasta from "@/assets/gift/skins/table-pasta.png";

import type { SkinAssets } from "./skins";

const optimize = async (src: ImageMetadata, width: number) =>
  (await getImage({ src, width, format: "webp" })).src;

/**
 * The skin artwork for a full-size card, for server code only (it runs
 * Astro's image pipeline). The art is exported from Figma at full resolution
 * (the city photo alone is 2731x4096), so each layer is resized and the
 * islands receive plain URLs: React has no access to the image pipeline.
 *
 * Widths are each layer's share of a 366px card, doubled for retina. The
 * Thanks page card is a little wider (about 400px), which this still covers.
 */
export async function loadLargeSkinAssets(): Promise<SkinAssets> {
  return {
    holidayWreath: await optimize(holidayWreath, 462),
    holidayRibbon: await optimize(holidayRibbon, 1376),
    tablePasta: await optimize(tablePasta, 1010),
    logotypeSand: await optimize(logotypeSand, 280),
    bowBackdrop: await optimize(bowBackdrop, 750),
    logotypeBronze: await optimize(logotypeBronze, 356),
    bowCopper: await optimize(bowCopper, 396),
    bowRibbons: await optimize(bowRibbons, 408),
    citySkyline: await optimize(citySkyline, 732),
  };
}
