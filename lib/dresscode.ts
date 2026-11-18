// Lists from the Figma file ("List สุ่มเอาจับคู่สีกับของ").
export const COLORS = ["Red", "Blue", "Yellow", "Green", "Black", "White", "Grey", "Brown"] as const;
export const ITEMS = ["Book", "Bloom", "Hat", "Wand", "Ring", "Medal", "Cloak", "Globe"] as const;

export type DressCode = {
  color: (typeof COLORS)[number];
  item: (typeof ITEMS)[number];
};

/** Key used by older versions that saved the draw; cleared so it can't linger. */
const LEGACY_STORAGE_KEY = "nortucommu.dresscode.v1";

/** Unbiased random index, using crypto when available. */
function randomIndex(length: number): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / length) * length;
    do crypto.getRandomValues(buf);
    while (buf[0] >= limit);
    return buf[0] % length;
  }
  return Math.floor(Math.random() * length);
}

/**
 * Draws a random color and item. Nothing is saved: every page load gets a
 * fresh foil and a new draw, so guests can scratch again after refreshing.
 */
export function drawDressCode(): DressCode {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* storage blocked — nothing to clean up */
  }
  return {
    color: COLORS[randomIndex(COLORS.length)],
    item: ITEMS[randomIndex(ITEMS.length)],
  };
}
