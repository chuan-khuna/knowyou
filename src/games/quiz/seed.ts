/**
 * Seed codes: a play's seed written as up to 6 base-36 characters (0–9, A–Z),
 * so a player can share it and a friend can type it back in. 36⁶ fits in the
 * 32-bit seed, so a code is just the seed in another base.
 */

export const SEED_CODE_LENGTH = 6;

/** How many seeds a code can name: 36⁶. */
const SEED_CODE_SPACE = 36 ** SEED_CODE_LENGTH;

/** The play's seed for a code, case-insensitive, or null for an empty, too long or malformed code. */
export function seedFromCode(code: string): number | null {
  const trimmed = code.trim();
  if (!new RegExp(`^[0-9a-z]{1,${SEED_CODE_LENGTH}}$`, "i").test(trimmed)) return null;
  return Number.parseInt(trimmed, 36);
}

/** The code for a seed, uppercase and zero-padded to 6. A seed above 36⁶ − 1, from an older saved play, gives a longer code. */
export function seedCode(seed: number): string {
  return seed.toString(36).toUpperCase().padStart(SEED_CODE_LENGTH, "0");
}

/** The query string a share link carries: `?seed=B21X0L&n=20`. */
export function shareQuery(seed: number, count: number): string {
  return `?${new URLSearchParams({ seed: seedCode(seed), n: String(count) })}`;
}

/**
 * The seed and count a share link names, or null when either is missing or
 * malformed. The count is only checked to be a whole number; the quiz checks
 * its range against the bank.
 */
export function readShareQuery(search: string): { seed: number; count: number } | null {
  const params = new URLSearchParams(search);
  const seed = seedFromCode(params.get("seed") ?? "");
  const n = params.get("n");
  const count = n !== null && /^\d+$/.test(n) ? Number(n) : null;
  return seed === null || count === null ? null : { seed, count };
}

/** A uniform random seed that a code of 6 characters can name. */
export function randomSeed(): number {
  // Rejection sampling: the largest multiple of 36⁶ below 2³² keeps every seed equally likely.
  const limit = Math.floor(2 ** 32 / SEED_CODE_SPACE) * SEED_CODE_SPACE;
  for (;;) {
    const value = crypto.getRandomValues(new Uint32Array(1))[0]!;
    if (value < limit) return value % SEED_CODE_SPACE;
  }
}
