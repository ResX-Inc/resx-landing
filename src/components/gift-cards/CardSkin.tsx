import type { GiftSkin, SkinAssets } from "@/lib/gift/skins";
import { cn } from "@/lib/utils";

interface CardSkinProps {
  skin: GiftSkin;
  assets: SkinAssets;
  className?: string;
  /** Thumbnails are decorative; the big preview describes itself. */
  label?: string;
}

/**
 * Renders a gift-card skin at whatever size the parent gives it. Every offset
 * is a percentage and the caption is sized in `cqw`, so the 85px thumbnail and
 * the 366px preview come from one definition — hence `@container`.
 */
export function CardSkin({ skin, assets, className, label }: CardSkinProps) {
  return (
    <div
      className={cn("@container relative overflow-hidden", className)}
      style={{ background: skin.background }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {skin.layers.map((layer, index) => (
        <div
          key={`${layer.asset}-${index}`}
          className="pointer-events-none absolute overflow-hidden"
          style={{
            left: `${layer.left}%`,
            top: `${layer.top}%`,
            width: `${layer.width}%`,
            height: `${layer.height}%`,
          }}
        >
          <img
            alt=""
            src={assets[layer.asset]}
            className="absolute max-w-none object-cover"
            style={
              layer.crop
                ? {
                    left: `${layer.crop.left}%`,
                    top: `${layer.crop.top}%`,
                    width: `${layer.crop.width}%`,
                    height: `${layer.crop.height}%`,
                  }
                : { inset: 0, width: "100%", height: "100%" }
            }
          />
          {layer.overlay && (
            <div
              className="absolute inset-0"
              style={{ background: layer.overlay }}
            />
          )}
        </div>
      ))}

      {skin.caption && (
        <div
          className="pointer-events-none absolute font-bold tracking-[-0.01em] text-[#fed9a1]"
          style={{
            left: `${skin.caption.left}%`,
            top: `${skin.caption.top}%`,
            width: `${skin.caption.width}%`,
            fontSize: `${skin.caption.fontSize}cqw`,
            lineHeight: 1,
          }}
        >
          <p className="m-0">{skin.caption.lines[0]}</p>
          <p className="m-0">{skin.caption.lines[1]}</p>
        </div>
      )}
    </div>
  );
}
