import { describe, expect, test } from "bun:test";
import { WORDS, type WordId } from "@/lib/anime-fx/words";

/** Every word a moment or a mock ad names. */
const USED: WordId[] = ["pang", "ting", "fiw", "pok", "tueng"];

describe("sound words", () => {
  test("every word a moment uses has been drawn", () => {
    for (const id of USED) expect(WORDS[id]).toBeDefined();
  });

  for (const [id, [width, height, path]] of Object.entries(WORDS)) {
    test(`${id} is a closed path inside its box`, () => {
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
      expect(path).toMatch(/^M/);
      expect(path).toMatch(/Z$/);
      expect(path).toMatch(/^[MLQCZ0-9 .-]+$/);
      const numbers = path.match(/-?\d+(\.\d+)?/g)!.map(Number);
      const xs = numbers.filter((_, i) => i % 2 === 0);
      const ys = numbers.filter((_, i) => i % 2 === 1);
      // Bezier control points may poke a little past the outline's box.
      expect(Math.min(...xs)).toBeGreaterThanOrEqual(-20);
      expect(Math.max(...xs)).toBeLessThanOrEqual(width + 20);
      expect(Math.min(...ys)).toBeGreaterThanOrEqual(-20);
      expect(Math.max(...ys)).toBeLessThanOrEqual(height + 20);
    });
  }
});
