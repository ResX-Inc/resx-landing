/**
 * The four gift-card designs offered on /gift-cards/buy.
 *
 * In Figma each skin is a stack of raster layers at hardcoded pixel offsets,
 * specified twice — once for the 366px preview and once for the 85px
 * thumbnail. Those two sets of offsets are the same proportions, so each layer
 * is stored here as a percentage of the card box and the same definition
 * renders at any size. Font sizes use `cqw`, which needs the card to be a
 * container (see CardSkin).
 */

/** Logical asset names; the Astro page maps these to optimized image URLs. */
export type SkinAssetName =
  | "holidayWreath"
  | "holidayRibbon"
  | "tablePasta"
  | "logotypeSand"
  | "bowBackdrop"
  | "logotypeBronze"
  | "bowCopper"
  | "bowRibbons"
  | "citySkyline";

export type SkinAssets = Record<SkinAssetName, string>;

export interface SkinLayer {
  asset: SkinAssetName;
  /** Box position, as a percentage of the card's width/height. */
  left: number;
  top: number;
  width: number;
  height: number;
  /** Flat colour laid over this layer only. */
  overlay?: string;
  /**
   * Some layers crop their image rather than fitting it. These are percentages
   * of the layer box, matching Figma's nested wrapper.
   */
  crop?: { left: number; top: number; width: number; height: number };
}

export interface SkinCaption {
  lines: [string, string];
  left: number;
  top: number;
  width: number;
  /** Font size in `cqw` — 1cqw is 1% of the card's width. */
  fontSize: number;
}

export interface GiftSkin {
  id: string;
  name: string;
  /** Colour behind every layer. */
  background: string;
  layers: SkinLayer[];
  caption?: SkinCaption;
}

/** The ResX wordmark + tagline lockup shared by the Table and City skins. */
const LOGOTYPE_LOCKUP: SkinLayer = {
  asset: "logotypeSand",
  left: 29.68,
  top: 16.45,
  width: 38.14,
  height: 66.75,
};

const CAPTION: SkinCaption = {
  lines: ["GOOD THINGS ", " HAPPEN LAST-MINUTE"],
  left: 6.54,
  top: 73.44,
  width: 153.96,
  fontSize: 3,
};

export const GIFT_SKINS = [
  {
    id: "holiday",
    name: "Holiday",
    background: "#6c2d16",
    layers: [
      {
        asset: "holidayWreath",
        left: 18.16,
        top: -5.73,
        width: 63.0,
        height: 110.25,
      },
      {
        asset: "holidayRibbon",
        left: -20.42,
        top: 6.77,
        width: 188.0,
        height: 27.75,
      },
    ],
  },
  {
    id: "table",
    name: "Table",
    background: "#ffffff",
    layers: [
      {
        asset: "tablePasta",
        left: -20.32,
        top: -26.81,
        width: 138.29,
        height: 161.5,
        overlay: "rgba(0,0,0,0.47)",
      },
      LOGOTYPE_LOCKUP,
    ],
    caption: CAPTION,
  },
  {
    id: "bow",
    name: "Bow",
    // Black, not white: the artwork is a dark card, so any sub-pixel gap at an
    // edge disappears instead of showing as a white line.
    background: "#000000",
    layers: [
      {
        asset: "bowBackdrop",
        left: -2.46,
        top: -3.07,
        width: 102.57,
        // 101 stopped ~2% short of the bottom edge; overhang top and bottom
        // equally. The backdrop is a plain gradient, so the extra crop is safe.
        height: 106.14,
      },
      {
        asset: "logotypeBronze",
        left: 24.4,
        top: 5.19,
        width: 48.71,
        height: 85.25,
      },
      {
        asset: "bowCopper",
        left: -2.46,
        top: -2.06,
        width: 54.14,
        height: 63.25,
      },
      {
        asset: "bowRibbons",
        left: 69.68,
        // Was 47.95, which ended the ribbon ~1.5% above the bottom edge; moved
        // down so it runs off the card like the top-left ribbon does.
        top: 49.95,
        width: 30.43,
        height: 50.5,
        crop: { left: -82.79, top: -28.6, width: 182.89, height: 128.6 },
      },
    ],
  },
  {
    id: "city",
    name: "City",
    background: "#ffffff",
    layers: [
      {
        asset: "citySkyline",
        left: -1.18,
        top: -118.3,
        // 100 left a white sliver on the right edge; overhang both sides equally.
        width: 102.36,
        height: 262.5,
        overlay: "rgba(0,0,0,0.39)",
      },
      LOGOTYPE_LOCKUP,
    ],
    caption: CAPTION,
  },
] as const satisfies readonly GiftSkin[];

export type GiftSkinId = (typeof GIFT_SKINS)[number]["id"];

/** The design shows the Holiday skin selected. */
export const DEFAULT_SKIN_ID: GiftSkinId = "holiday";
