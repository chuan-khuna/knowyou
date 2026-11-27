/**
 * byou's drawn effects: one export per moment. The core (`core.ts`, forked
 * from Sakuga VFX) draws on one fixed canvas that takes no pointer events,
 * and loads on the first effect, so a page that never fires one never
 * downloads it. With a reduced-motion preference nothing loads and nothing
 * draws.
 *
 * Each moment reads its element's colours and box when it is called, while
 * the element is still on the page, and draws once the core is ready. So a
 * button that the press unmounts (an answer, เริ่มเลย) still gets its effect
 * where it was.
 *
 * Colours are the page's tokens plus one tone, the `--fx-tone` of the element
 * an effect belongs to (`controls.css`, `surfaces.css`), read at every effect,
 * so an effect always draws in the theme showing at that moment.
 */

import type { Palette } from "@/lib/anime-fx/core";
import type { WordId } from "@/lib/anime-fx/words";

export type { WordId } from "@/lib/anime-fx/words";

type Core = typeof import("@/lib/anime-fx/core");

/** The effects' palette as CSS colours, resolved inside the element an effect belongs to. */
const PALETTE: Palette = {
  fill: "var(--color-card)",
  shade: "color-mix(in oklch, var(--fx-tone, var(--color-accent-2)) 20%, var(--color-card))",
  line: "color-mix(in oklch, var(--color-ink) 80%, var(--color-paper))",
  accent: "color-mix(in oklch, var(--fx-tone, var(--color-accent-2)) 55%, var(--color-card))",
};
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** Matches the CSS twinkle on a mock ad's art tile, so the sparkle lands as the tile settles. */
const SPARKLE_DELAY_MS = 320;
/** How long after the press that ends a play its result may still land. */
const LANDING_WINDOW_MS = 1500;
/** The result lands just after the press's burst has peaked. */
const LANDING_DELAY_MS = 180;

let core: Promise<Core | null> | null = null;

function calm(): boolean {
  return typeof window === "undefined" || matchMedia(REDUCED_MOTION).matches;
}

function loadCore(): Promise<Core | null> {
  return (core ??= import("@/lib/anime-fx/core").catch(() => {
    core = null;
    return null;
  }));
}

/** Starts fetching the core, for a screen that will fire an effect soon. */
export function warmEffects(): void {
  if (!calm()) void loadCore();
}

/** Resolves PALETTE inside `from` to plain colour strings the canvas takes. */
function paletteOf(from: Element): Palette {
  const probe = document.createElement("span");
  probe.hidden = true;
  from.append(probe);
  const read = (colour: string) => {
    probe.style.color = colour;
    return getComputedStyle(probe).color;
  };
  const palette = { fill: read(PALETTE.fill), shade: read(PALETTE.shade), line: read(PALETTE.line), accent: read(PALETTE.accent) };
  probe.remove();
  return palette;
}

/** `el`'s box in page coordinates, which the core draws in. */
function pageBox(el: Element) {
  const box = el.getBoundingClientRect();
  const left = box.left + scrollX;
  const top = box.top + scrollY;
  return { left, top, right: left + box.width, bottom: top + box.height, cx: left + box.width / 2, cy: top + box.height / 2, width: box.width };
}

type PageBox = ReturnType<typeof pageBox>;

/** Reads `el`'s colours and box now, then draws `effect` once the core is ready. */
function draw(el: Element | null | undefined, effect: (fx: Core, P: Palette, box: PageBox) => void): void {
  if (!el || !el.isConnected || calm()) return;
  const P = paletteOf(el);
  const box = pageBox(el);
  void loadCore().then((fx) => {
    if (fx) effect(fx, P, box);
  });
}

/** A quick spring squash on a button that has no `:active` to show it, as after a double-click or Enter. */
function squash(el: Element): void {
  if (calm()) return;
  el.animate(
    [{ scale: "1" }, { scale: "1.06 0.86", offset: 0.25 }, { scale: "0.97 1.04", offset: 0.6 }, { scale: "1" }],
    { duration: 320, easing: "ease-out" },
  );
}

/** A point in page coordinates. */
export interface PagePoint {
  x: number;
  y: number;
}

/**
 * Where a press landed, from its click event: the pointer for a tap or click,
 * nothing for a key press (Enter, Space), which has no point.
 */
export function pressPoint(event: { pageX: number; pageY: number; detail: number }): PagePoint | undefined {
  return event.detail > 0 ? { x: event.pageX, y: event.pageY } : undefined;
}

// ───────── a play ─────────

/** An answer that moves the play on: a few ticks and one small puff off the press point, or the button's right end for a key. */
export function answerEffect(el: Element | null | undefined, at?: PagePoint): void {
  draw(el, (fx, P, box) => {
    const x = at?.x ?? box.right - 28;
    const y = at?.y ?? box.cy;
    fx.ticks(P, x, y, { n: 3, r: 12, len: 8, dir: -Math.PI / 2, fan: 0.5, life: 0.36 });
    fx.puff(P, x + 10, y - 2, { n: 3, size: 7, vy: -14, life: 0.5 });
  });
}

/** The press that ends a play: a burst and ปัง! where it landed, then the result lands too (`useResultLanding`). */
export function finishEffect(el: Element | null | undefined, at?: PagePoint): void {
  draw(el, (fx, P, box) => {
    const x = at?.x ?? box.cx;
    const y = at?.y ?? box.cy;
    fx.burst(P, x, y, { r: 34, spikes: 11 });
    fx.puff(P, x + 20, y - 6, { n: 4, size: 9, vy: -16, life: 0.7 });
    fx.word(P, "pang", x - 6, y - 40, { size: 64, life: 0.75 });
  });
  expectLanding();
}

/** เริ่มเลย or เล่นอีกครั้ง: the button squashes, a burst goes off where it was pressed, and ปัง! lands above it. */
export function startEffect(el: Element | null | undefined, at?: PagePoint): void {
  if (el) squash(el);
  draw(el, (fx, P, box) => {
    const x = at?.x ?? box.cx;
    const y = at?.y ?? box.cy;
    fx.burst(P, x, y, { r: 40, spikes: 12 });
    fx.puff(P, box.left + 18, box.bottom - 6, { n: 4, size: 9, vx: -18, vy: -10, life: 0.7 });
    fx.puff(P, box.right - 18, box.bottom - 6, { n: 4, size: 9, vx: 18, vy: -10, life: 0.7 });
    fx.word(P, "pang", box.cx, box.top - 26, { size: 72, life: 0.8 });
  });
}

/** ข้อต่อไป after a reveal: the button squashes and throws a few ticks off its right end. */
export function nextEffect(el: Element | null | undefined): void {
  if (el) squash(el);
  draw(el, (fx, P, box) => {
    fx.ticks(P, box.right - 12, box.top + 6, { n: 3, r: 6, len: 10, dir: -0.8, fan: 0.45, life: 0.4 });
  });
}

// ───────── the result landing ─────────

let landingAt = 0;

/** A play just finished: its result heading should land when it shows. */
export function expectLanding(): void {
  landingAt = performance.now();
}

/**
 * The result heading just showed: a larger burst and ตึ้ง!! on it, if a play
 * finished a moment ago. A result restored after a refresh shows no landing.
 */
export function resultLanding(el: Element | null): void {
  if (!el || !landingAt || performance.now() - landingAt > LANDING_WINDOW_MS) return;
  landingAt = 0;
  setTimeout(() => {
    draw(el, (fx, P, box) => {
      const x = Math.min(box.right, box.left + 140);
      fx.burst(P, x, box.cy, { r: 56, spikes: 14, life: 0.4 });
      fx.word(P, "tueng", x + 70, box.top - 18, { size: 104, rot: -0.12, life: 1, hollow: true });
      fx.ticks(P, x - 46, box.top, { n: 4, r: 10, len: 12, dir: -2.3, fan: 0.4, life: 0.45 });
    });
  }, LANDING_DELAY_MS);
}

// ───────── the page chrome ─────────

/** A press on a mock ad at page point (x, y): a small impact, a puff of smoke, and `word` above it. */
export function pressEffect(el: Element, x: number, y: number, word: WordId): void {
  draw(el, (fx, P) => {
    fx.burst(P, x, y, { r: 30, spikes: 11 });
    fx.puff(P, x + 16, y - 4, { n: 4, size: 9, vy: -14, life: 0.7 });
    fx.word(P, word, x - 4, y - 36, { size: 52, life: 0.8 });
  });
}

/** One sparkle on the top-right corner of `el`, once it has settled into place. */
export function entranceSparkle(el: Element): void {
  setTimeout(() => draw(el, (fx, P, box) => fx.kira(P, box.right - 8, box.top + 8, { r: 8 })), SPARKLE_DELAY_MS);
}

/** A successful copy from `el`: it squashes, ติ๊ง! lands just above it, and its right end glints and throws a small fan of ticks. */
export function copyEffect(el: Element): void {
  squash(el);
  draw(el, (fx, P, box) => {
    fx.word(P, "ting", box.cx, box.top - 18, { size: 44, life: 0.8 });
    fx.kira(P, box.right - 4, box.cy, { r: 7 });
    fx.ticks(P, box.right, box.top, { dir: -1, n: 3, r: 5, len: 12, fan: 0.36, life: 0.5 });
  });
}

/** The theme switch once the new theme shows: a few stars for dark, a small sun flare for light. */
export function themeEffect(el: Element, dark: boolean): void {
  draw(el, (fx, P, box) => {
    if (dark) {
      fx.kira(P, box.left + 6, box.top + 8, { r: 6, life: 0.5 });
      fx.kira(P, box.right - 4, box.top + 14, { r: 8, life: 0.55 });
      fx.kira(P, box.cx + 4, box.bottom - 4, { r: 5, life: 0.45 });
    } else {
      fx.burst(P, box.cx, box.cy, { r: 13, spikes: 9, life: 0.28 });
      fx.ticks(P, box.cx, box.cy, { dir: -Math.PI / 2, n: 5, r: 15, len: 9, fan: 0.6, life: 0.45 });
    }
  });
}

/** The sound switch: it squashes; turning on throws sound waves and a small ป๊อก, turning off one small puff. */
export function soundEffect(el: Element, on: boolean): void {
  squash(el);
  draw(el, (fx, P, box) => {
    if (on) {
      fx.ticks(P, box.right - 10, box.cy, { dir: 0, n: 3, r: 8, len: 9, fan: 0.5, life: 0.45 });
      fx.word(P, "pok", box.cx, box.bottom + 10, { size: 36, life: 0.6 });
    } else {
      fx.puff(P, box.cx + 8, box.cy - 4, { n: 3, size: 7, vy: -12, life: 0.5 });
    }
  });
}
