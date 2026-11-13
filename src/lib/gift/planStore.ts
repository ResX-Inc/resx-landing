import { useSyncExternalStore } from "react";

import type { GiftDurationMonths } from "./api";

/**
 * The selected duration is shared between two separate Astro islands on the
 * landing page — the hero's quick-purchase tiles and the detailed plan cards —
 * so it cannot live in either component's local state. Vite bundles this module
 * once per page, so a module-level value is enough; no store library is needed.
 *
 * `null` means "the visitor has not chosen yet", which resolves to the default
 * plan at render time. Keeping the initial value a constant matters: this site
 * renders on the server, where module state is shared across requests, so the
 * server snapshot must never depend on anything visitor-specific.
 */
let selected: GiftDurationMonths | null = null;

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot(): GiftDurationMonths | null {
  return selected;
}

function getServerSnapshot(): GiftDurationMonths | null {
  return null;
}

export function setSelectedDuration(durationMonths: GiftDurationMonths) {
  if (durationMonths === selected) return;
  selected = durationMonths;
  for (const listener of listeners) listener();
}

export function useSelectedDuration() {
  const durationMonths = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return { durationMonths, select: setSelectedDuration };
}
