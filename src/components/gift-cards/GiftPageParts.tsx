import type * as React from "react";

/**
 * Layout and type shared by the Thanks and Status pages, so the two read as
 * one flow.
 */

/** "Jane Ellis" → "Jane". */
export function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

/**
 * Copy on the left, the card on the right; the card goes first on a phone.
 * Both columns have fixed widths and sit together, centred: a stretching copy
 * column would push the card far from text that only fills its left.
 */
export function GiftTwoColumn({
  copy,
  card,
}: {
  copy: React.ReactNode;
  card: React.ReactNode;
}) {
  return (
    <div className="grid w-full items-start gap-9 lg:grid-cols-[minmax(0,520px)_minmax(0,440px)] lg:justify-center lg:gap-16">
      <div className="flex min-w-0 flex-col gap-7" aria-live="polite">
        {copy}
      </div>
      <div className="max-lg:order-first lg:sticky lg:top-28">{card}</div>
    </div>
  );
}

export function GiftHeadline({ title, lede }: { title: string; lede: string }) {
  return (
    <div
      key={title}
      className="animate-in fade-in-0 slide-in-from-bottom-1 flex flex-col gap-2.5 duration-500 motion-reduce:animate-none"
    >
      <h1 className="font-display text-[34px] leading-[38px] font-normal tracking-[-0.68px] text-balance text-white lg:text-5xl lg:leading-[52px]">
        {title}
      </h1>
      <p className="max-w-[34em] text-[17px] leading-[26px] text-white/80">
        {lede}
      </p>
    </div>
  );
}

/** One label and value in a `<dl>`. */
export function GiftRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full items-start justify-between gap-6">
      <dt className="shrink-0 text-zinc-300">{label}</dt>
      <dd className="text-right text-white/90 tabular-nums">{children}</dd>
    </div>
  );
}
