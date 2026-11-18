// Lists from the Figma file ("List สุ่มเอาจับคู่สีกับของ").
export const COLORS = ["Red", "Blue", "Yellow", "Green", "Black", "White", "Grey", "Brown"] as const;
export const ITEMS = ["Book", "Bloom", "Hat", "Wand", "Ring", "Medal", "Cloak", "Globe"] as const;

export type DressCode = {
  color: (typeof COLORS)[number];
  item: (typeof ITEMS)[number];
  revealed: boolean;
};

const STORAGE_KEY = "nortucommu.dresscode.v1";

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

function isValid(value: unknown): value is DressCode {
  const v = value as DressCode | null;
  return !!v && COLORS.includes(v.color) && ITEMS.includes(v.item);
}

export function saveDressCode(code: DressCode) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(code));
  } catch {
    /* private mode / storage blocked */
  }
}

/**
 * Returns this guest's dress code. The first visit draws a random color and
 * item and stores it, so reloading shows the same pair. `reroll` forces a
 * fresh draw.
 */
export function getDressCode(reroll = false): DressCode {
  if (!reroll) {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (isValid(stored)) return stored;
    } catch {
      /* fall through to a new draw */
    }
  }
  const code: DressCode = {
    color: COLORS[randomIndex(COLORS.length)],
    item: ITEMS[randomIndex(ITEMS.length)],
    revealed: false,
  };
  saveDressCode(code);
  return code;
}
