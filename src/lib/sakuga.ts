/**
 * Drawn effects from Sakuga VFX (MIT), vendored unchanged at
 * `public/sakuga-vfx/core.js`. The core is a plain script that sets
 * `window.SakugaFX` and draws on one fixed canvas that takes no pointer
 * events. It loads on the first effect, so a page that never asks for one
 * never fetches it. With a reduced-motion preference nothing loads and
 * nothing draws.
 *
 * Each export is one moment's effect. Colours are the page's tokens plus one
 * tone, the `--fx-tone` of the element an effect belongs to (`.mock-ad` in
 * `surfaces.css`, `.seed-chip` and `.icon-button` in `controls.css`). They are read at every effect, so an effect always draws in
 * the theme showing at that moment.
 */

export type SakugaWord = "don" | "gogo" | "kachi" | "pon" | "shu" | "zuza";

interface SakugaPalette {
  fill: string;
  shade: string;
  line: string;
  accent: string;
  ink: string;
  sfx: [fill: string, edge: string];
}

/** Only the part of the core this site calls. Coordinates are page coordinates. */
interface SakugaFX {
  readonly P: SakugaPalette;
  burst(x: number, y: number, options?: { r?: number; spikes?: number; life?: number }): void;
  puff(x: number, y: number, options?: { n?: number; size?: number; vx?: number; vy?: number; life?: number }): void;
  kira(x: number, y: number, options?: { r?: number; life?: number }): void;
  ticks(x: number, y: number, options?: { n?: number; r?: number; len?: number; dir?: number; life?: number; fan?: number }): void;
  sfx(word: SakugaWord, x: number, y: number, options?: { size?: number; rot?: number; life?: number }): void;
}

declare global {
  interface Window {
    SakugaFX?: SakugaFX;
  }
}

const CORE_SRC = "/sakuga-vfx/core.js";
/** The effects' palette as CSS colours, resolved against the element's `--fx-tone`. */
const PALETTE = {
  fill: "var(--color-card)",
  shade: "color-mix(in oklch, var(--fx-tone) 20%, var(--color-card))",
  line: "color-mix(in oklch, var(--color-ink) 80%, var(--color-paper))",
  accent: "color-mix(in oklch, var(--fx-tone) 55%, var(--color-card))",
};
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** Matches the CSS twinkle on the art tile, so the sparkle lands as the tile settles. */
const SPARKLE_DELAY_MS = 320;

let core: Promise<SakugaFX | null> | null = null;

function loadCore(): Promise<SakugaFX | null> {
  if (typeof window === "undefined" || matchMedia(REDUCED_MOTION).matches) {
    return Promise.resolve(null);
  }
  return (core ??= new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = CORE_SRC;
    script.onload = () => resolve(window.SakugaFX ?? null);
    script.onerror = () => {
      core = null;
      script.remove();
      resolve(null);
    };
    document.head.append(script);
  }));
}

/** Resolves PALETTE inside `from` to plain colour strings and hands them to the core. */
function paint(fx: SakugaFX, from: Element): void {
  const probe = document.createElement("span");
  probe.hidden = true;
  from.append(probe);
  const read = (colour: string) => {
    probe.style.color = colour;
    return getComputedStyle(probe).color;
  };
  const fill = read(PALETTE.fill);
  const line = read(PALETTE.line);
  Object.assign(fx.P, {
    fill,
    shade: read(PALETTE.shade),
    line,
    accent: read(PALETTE.accent),
    ink: line,
    sfx: [line, fill],
  } satisfies SakugaPalette);
  probe.remove();
}

/** `el`'s box in page coordinates, which the core draws in. */
function pageBox(el: Element) {
  const box = el.getBoundingClientRect();
  const left = box.left + scrollX;
  const top = box.top + scrollY;
  return { left, top, right: left + box.width, bottom: top + box.height, cx: left + box.width / 2, cy: top + box.height / 2 };
}

type PageBox = ReturnType<typeof pageBox>;

/** Loads the core if needed, then draws `effect` in `el`'s colours, unless `el` has left the page by then. */
function draw(el: Element, effect: (fx: SakugaFX, box: PageBox) => void): void {
  void loadCore().then((fx) => {
    if (!fx || !el.isConnected) return;
    paint(fx, el);
    effect(fx, pageBox(el));
  });
}

/** A quick spring squash on a button that has no `:active` to show it, as after a double-click or Enter. */
function squash(el: Element): void {
  if (matchMedia(REDUCED_MOTION).matches) return;
  el.animate(
    [{ scale: "1" }, { scale: "1.06 0.86", offset: 0.25 }, { scale: "0.97 1.04", offset: 0.6 }, { scale: "1" }],
    { duration: 320, easing: "ease-out" },
  );
}

/** A press on a mock ad at page point (x, y): a small impact, a puff of smoke, and `word` in manga lettering. */
export function pressEffect(el: Element, x: number, y: number, word: SakugaWord): void {
  draw(el, (fx) => {
    fx.burst(x, y, { r: 30, spikes: 11 });
    fx.puff(x + 16, y - 4, { n: 4, size: 9, vy: -14, life: 0.7 });
    fx.sfx(word, x - 4, y - 36, { size: 46, life: 0.8 });
  });
}

/** One sparkle on the top-right corner of `el`, once it has settled into place. */
export function entranceSparkle(el: Element): void {
  setTimeout(() => draw(el, (fx, box) => fx.kira(box.right - 8, box.top + 8, { r: 8 })), SPARKLE_DELAY_MS);
}

/** A successful copy from `el`: it squashes, a カチッ lands just above it, and its right end glints and throws a small fan of ticks. */
export function copyEffect(el: Element): void {
  squash(el);
  draw(el, (fx, box) => {
    fx.sfx("kachi", box.cx, box.top - 16, { size: 40, life: 0.8 });
    fx.kira(box.right - 4, box.cy, { r: 7 });
    fx.ticks(box.right, box.top, { dir: -1, n: 3, r: 5, len: 12, fan: 0.36, life: 0.5 });
  });
}

/** The theme switch once the new theme shows: a few stars for dark, a small sun flare for light. */
export function themeEffect(el: Element, dark: boolean): void {
  draw(el, (fx, box) => {
    if (dark) {
      fx.kira(box.left + 6, box.top + 8, { r: 6, life: 0.5 });
      fx.kira(box.right - 4, box.top + 14, { r: 8, life: 0.55 });
      fx.kira(box.cx + 4, box.bottom - 4, { r: 5, life: 0.45 });
    } else {
      fx.burst(box.cx, box.cy, { r: 13, spikes: 9, life: 0.28 });
      fx.ticks(box.cx, box.cy, { dir: -Math.PI / 2, n: 5, r: 15, len: 9, fan: 0.6, life: 0.45 });
    }
  });
}

/** The sound switch: it squashes; turning on throws sound waves and a small ポン, turning off one small puff. */
export function soundEffect(el: Element, on: boolean): void {
  squash(el);
  draw(el, (fx, box) => {
    if (on) {
      fx.ticks(box.right - 10, box.cy, { dir: 0, n: 3, r: 8, len: 9, fan: 0.5, life: 0.45 });
      fx.sfx("pon", box.cx, box.bottom + 8, { size: 28, life: 0.6 });
    } else {
      fx.puff(box.cx + 8, box.cy - 4, { n: 3, size: 7, vy: -12, life: 0.5 });
    }
  });
}
