/**
 * The drawn-effects core: one fixed canvas over the page, one clock, and the
 * effects drawn on it. Forked from Sakuga VFX `core.js`
 * (https://github.com/finktheartist/sakuga-vfx, commit
 * c3dabb173928a3ad2372183103caf2e6f50953d0).
 *
 * MIT License. Copyright (c) 2026 Justin Finkelman. Permission is hereby
 * granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions: The above copyright notice and this
 * permission notice shall be included in all copies or substantial portions of
 * the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
 * EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
 * OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * Changes from upstream: an ES module in TypeScript; each effect takes its
 * palette when it starts instead of reading one shared palette every frame;
 * the words are byou's Thai words (`words.ts`); the custom-element base, the
 * `--sk-*` styles, the back layers and the effects no moment uses are gone.
 *
 * The rules the effects keep: a flat light tone, a flat shadow tone and an
 * outline, no gradients; things leave by shrinking or thinning, never by
 * fading; nothing loops. Coordinates are page coordinates, so an effect
 * scrolls with what it belongs to.
 */

import { WORDS, type WordId } from "@/lib/anime-fx/words";

/** The colours one effect draws in, as canvas colour strings. */
export interface Palette {
  fill: string;
  shade: string;
  line: string;
  accent: string;
}

type Draw = (k: number, t: number) => void;
interface Live {
  t: number;
  life: number;
  draw: Draw;
}

const TAU = Math.PI * 2;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const out = (t: number) => 1 - (1 - t) ** 3;
const inn = (t: number) => t * t * t;
const back = (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;

/** A spring: what makes a word overshoot and settle instead of stopping dead. */
class Spring {
  v = 0;
  to: number;
  constructor(
    public x: number,
    private k: number,
    private d: number,
  ) {
    this.to = x;
  }
  step(dt: number): number {
    if (!(dt > 0)) return this.x;
    for (let n = Math.ceil(dt / 0.008), h = dt / n; n--; ) {
      this.v += (-this.k * (this.x - this.to) - this.d * this.v) * h;
      this.x += this.v * h;
    }
    return this.x;
  }
}

// ───────── the layer and the clock ─────────

let canvas: HTMLCanvasElement | null = null;
let g: CanvasRenderingContext2D;
let dpr = 1;
let live: Live[] = [];
let dirty = false;
let running = false;
let last = 0;

function size(): void {
  dpr = Math.min(2.5, devicePixelRatio || 1);
  if (!canvas) return;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
}

function ensureCanvas(): void {
  if (canvas) return;
  canvas = document.createElement("canvas");
  canvas.className = "anime-fx";
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);
  g = canvas.getContext("2d")!;
  size();
  addEventListener("resize", size);
}

function add(life: number, draw: Draw): void {
  ensureCanvas();
  live.push({ t: 0, life, draw });
  if (running) return;
  running = true;
  last = performance.now();
  requestAnimationFrame(loop);
}

function loop(ms: number): void {
  // A frame's timestamp can be earlier than the moment the loop started.
  const dt = clamp((ms - last) / 1000, 0, 0.034);
  last = ms;
  if (canvas && (live.length || dirty)) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    g.translate(-scrollX, -scrollY);
    g.lineJoin = g.lineCap = "round";
    live = live.filter((p) => (p.t += dt) < p.life);
    for (const p of live) {
      g.save();
      p.draw(p.t / p.life, p.t);
      g.restore();
    }
    dirty = live.length > 0;
  }
  if (!live.length && !dirty) {
    running = false;
    return;
  }
  requestAnimationFrame(loop);
}

// ───────── drawing ─────────

/** Circles drawn as one shape: outline, shadow tone, then the light side slid up and to the left. */
function blob(P: Palette, cs: [number, number, number][], lw: number, { lx = -1, arcs = false, deep = 1 } = {}): void {
  const u = new Path2D();
  for (const [x, y, r] of cs) {
    if (r > 0.3) {
      u.moveTo(x + r, y);
      u.arc(x, y, r, 0, TAU);
    }
  }
  g.save();
  g.lineWidth = lw * 2;
  g.strokeStyle = P.line;
  g.stroke(u);
  g.restore();
  g.save();
  g.clip(u);
  g.fillStyle = P.shade;
  g.fillRect(-1e4, -1e4, 2e4, 2e4);
  const r = cs[0] ? cs[0][2] : 8;
  g.save();
  g.translate(lx * r * 0.2 * deep, -r * 0.26 * deep);
  g.fillStyle = P.fill;
  g.fill(u);
  g.restore();
  if (arcs) {
    // the cumulus lines inside the cloud
    g.strokeStyle = P.line;
    g.lineWidth = lw * 0.75;
    g.beginPath();
    for (const [x, y, rr] of cs) {
      if (rr > 3) {
        g.moveTo(x + Math.cos(-2.7) * rr, y + Math.sin(-2.7) * rr);
        g.arc(x, y, rr, -2.7, -0.5);
      }
    }
    g.stroke();
  }
  g.restore();
}

/** A path drawn as outline, shadow tone, and the light tone slid up and to the left. */
function shape(P: Palette, path: Path2D, lw: number, off: number): void {
  g.save();
  g.lineWidth = lw * 2;
  g.strokeStyle = P.line;
  g.stroke(path);
  g.restore();
  g.save();
  g.clip(path);
  g.fillStyle = P.shade;
  g.fillRect(-1e4, -1e4, 2e4, 2e4);
  g.translate(-off * 0.7, -off);
  g.fillStyle = P.fill;
  g.fill(path);
  g.restore();
}

// ───────── the effects ─────────

/** A puff of smoke: lobes swell out with a little overshoot, roll, and shrink away. */
export function puff(P: Palette, x: number, y: number, { n = 5, size = 13, vx = 0, vy = -18, life = 0.8, spread = 1 } = {}): void {
  const lobes = Array.from({ length: n }, (_, i) => ({
    a: (i / n) * TAU + rnd(0, 0.6),
    d: rnd(0.25, 0.9) * size * spread,
    r: rnd(0.55, 1) * size,
    ph: rnd(0, TAU),
    sp: rnd(0.6, 1.3),
  }));
  lobes.unshift({ a: 0, d: 0, r: size, ph: 0, sp: 1 });
  add(life, (k, t) => {
    const grow = back(clamp(t / 0.22));
    const die = 1 - inn(clamp((k - 0.55) / 0.45));
    const px = x + vx * out(k) * life;
    const py = y + vy * out(k) * life;
    const spreadNow = 0.5 + out(k) * 0.9;
    blob(
      P,
      lobes.map((l) => [
        px + Math.cos(l.a + t * 0.9 * l.sp) * l.d * spreadNow,
        py + Math.sin(l.a + t * 0.9 * l.sp) * l.d * spreadNow - out(k) * 5 * l.sp,
        l.r * grow * die * (1 + Math.sin(t * 9 + l.ph) * 0.05),
      ]),
      1.5,
      { lx: 0.5, arcs: size > 6.5, deep: 1.5 },
    );
  });
}

/** The impact: accent needles, a star in the shadow tone, and a light star on top; it leaves by its points thinning to nothing. */
export function burst(P: Palette, x: number, y: number, { r = 44, spikes = 13, life = 0.34 } = {}): void {
  const jag = Array.from({ length: spikes * 2 }, (_, i) => (i % 2 ? rnd(0.34, 0.5) : rnd(0.75, 1.15)));
  const rot = rnd(0, TAU);
  const pins = Array.from({ length: 8 }, (_, i) => ({ a: (i / 8) * TAU + rnd(0, 0.5), l: rnd(1.25, 1.75), w: rnd(0.03, 0.055) }));
  const star = (R: number, turn: number, inner: number) => {
    const p = new Path2D();
    jag.forEach((m, i) => {
      const a = rot + turn + (i / jag.length) * TAU;
      const rr = R * (i % 2 ? m * inner : m);
      if (i) p.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      else p.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    });
    p.closePath();
    return p;
  };
  add(life, (k) => {
    const R = r * out(clamp(k / 0.3));
    const hollow = 1 + inn(clamp((k - 0.35) / 0.65)) * 1.3;
    const r0 = R * 0.6 * Math.min(1.9, hollow);
    g.save();
    g.fillStyle = P.accent;
    g.beginPath();
    for (const pin of pins) {
      const l = R * pin.l;
      if (l <= r0) continue;
      g.moveTo(x + Math.cos(pin.a - pin.w) * r0, y + Math.sin(pin.a - pin.w) * r0);
      g.lineTo(x + Math.cos(pin.a) * l, y + Math.sin(pin.a) * l);
      g.lineTo(x + Math.cos(pin.a + pin.w) * r0, y + Math.sin(pin.a + pin.w) * r0);
    }
    g.fill();
    g.restore();
    const big = star(R * 1.16, 0.19, hollow);
    g.save();
    g.fillStyle = P.shade;
    g.fill(big);
    g.strokeStyle = P.line;
    g.lineWidth = 1.2;
    g.stroke(big);
    g.restore();
    shape(P, star(R * 0.84, 0, hollow), 1.4, 3);
  });
}

/** Accent ticks: little wedges that point at something and fly off it. */
export function ticks(P: Palette, x: number, y: number, { n = 3, r = 16, len = 9, dir = -0.9, life = 0.4, fan = 0.42 } = {}): void {
  add(life, (k) => {
    const a = out(clamp(k / 0.5));
    const b = inn(clamp((k - 0.4) / 0.6));
    g.fillStyle = P.accent;
    g.beginPath();
    for (let i = 0; i < n; i++) {
      const an = dir + (i - (n - 1) / 2) * fan;
      const r0 = r + len * b * 1.25;
      const r1 = r + len * a * 1.25;
      const hw = 0.07 + 2.2 / (r1 + 8);
      if (r1 - r0 < 0.6) continue;
      g.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0);
      g.lineTo(x + Math.cos(an - hw) * r1, y + Math.sin(an - hw) * r1);
      g.lineTo(x + Math.cos(an + hw) * r1, y + Math.sin(an + hw) * r1);
      g.closePath();
    }
    g.fill();
  });
}

/** A glint: a four-pointed sparkle that opens and closes. */
export function kira(P: Palette, x: number, y: number, { r = 9, life = 0.6 } = {}): void {
  add(life, (k, t) => {
    const s = r * Math.sin(k * Math.PI) ** 0.6;
    const q = s * 0.16;
    const p = new Path2D();
    g.translate(x, y);
    g.rotate(Math.sin(t * 3) * 0.2);
    p.moveTo(0, -s);
    p.quadraticCurveTo(q, -q, s * 0.7, 0);
    p.quadraticCurveTo(q, q, 0, s);
    p.quadraticCurveTo(-q, q, -s * 0.7, 0);
    p.quadraticCurveTo(-q, -q, 0, -s);
    g.fillStyle = P.fill;
    g.fill(p);
    g.strokeStyle = P.accent;
    g.lineWidth = 2;
    g.stroke(p);
  });
}

// ───────── the lettering ─────────

const shapes = new Map<WordId, Path2D>();
const baked = new Map<string, HTMLCanvasElement>();

/** The outline and fill are painted once per word and colour, so a word on screen costs one drawImage a frame. */
function bake(id: WordId, fill: string, edge: string): HTMLCanvasElement {
  const key = `${id} ${fill} ${edge}`;
  const hit = baked.get(key);
  if (hit) return hit;
  const [w, h, d] = WORDS[id];
  let path = shapes.get(id);
  if (!path) shapes.set(id, (path = new Path2D(d)));
  const pad = 24;
  const c = document.createElement("canvas");
  c.width = w + pad * 2;
  c.height = h + pad * 2;
  const x = c.getContext("2d")!;
  x.translate(pad, pad);
  x.lineJoin = "round";
  x.strokeStyle = x.fillStyle = edge;
  x.lineWidth = w * 0.035 * 2;
  x.stroke(path);
  x.fill(path);
  x.fillStyle = fill;
  x.fill(path);
  baked.set(key, c);
  return c;
}

/**
 * A sound word, `size` pixels wide: it lands a size too big, wobbles while it stays, and leaves by shrinking.
 * Solid letters are the line colour edged in the fill colour; hollow letters are the reverse.
 */
export function word(P: Palette, id: WordId, x: number, y: number, { size = 64, rot = -0.14, life = 0.95, hollow = false } = {}): void {
  const spring = new Spring(0.2, 520, 17);
  spring.to = 1;
  let lastT = 0;
  const c = hollow ? bake(id, P.fill, P.line) : bake(id, P.line, P.fill);
  const k0 = size / WORDS[id][0];
  add(life, (k, t) => {
    const sc = spring.step(t - lastT) * (1 - inn(clamp((k - 0.86) / 0.14))) * k0;
    lastT = t;
    g.translate(x + Math.sin(t * 31) * 0.8, y + Math.cos(t * 27) * 0.8);
    g.rotate(rot + Math.sin(t * 6) * 0.03);
    g.drawImage(c, (-c.width / 2) * sc, (-c.height / 2) * sc, c.width * sc, c.height * sc);
  });
}
