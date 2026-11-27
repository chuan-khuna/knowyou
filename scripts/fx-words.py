# /// script
# requires-python = ">=3.12"
# dependencies = ["fonttools>=4.55", "uharfbuzz>=0.45"]
# ///
"""Draw the drawn effects' Thai sound words as path data.

Reads Playpen Sans Thai (OFL, scripts/fonts/) at weight 800, shapes each word
with HarfBuzz so Thai marks stack on their base, then gives every cluster its
own small tilt, size and bounce, so the word reads as lettering rather than
type. Writes src/lib/anime-fx/words.ts as `[width, height, path]` per word,
in the format the effects core draws.

    uv run scripts/fx-words.py
"""

import io
import math
import random
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "scripts/fonts/PlaypenSansThai[wght].ttf"
OUT = ROOT / "src/lib/anime-fx/words.ts"

WEIGHT = 800
# Font units to word units: the words come out about 180 units tall, close to the
# traced lettering the core was tuned on.
SCALE = 0.2
SLANT = 0.2  # forward lean, as x += SLANT * y
# Per-cluster jitter: degrees of tilt, size change, and baseline bounce in font units.
TILT, GROW, BOUNCE = 7.0, 0.08, 60
# A mark whose top is above ABOVE font units sits over the base; each one is lifted LIFT more than the last.
ABOVE, LIFT = 600, 55
# The height clusters turn about, in font units: about the middle of a Thai consonant.
MIDDLE = 350

# id: (word, seed). The seed fixes each word's jitter, so a rerun is stable.
WORDS = {
    "pang": ("ปัง!", 3),
    "ting": ("ติ๊ง!", 7),
    "fiw": ("ฟิ้ว", 2),
    "pok": ("ป๊อก", 5),
    "kruen": ("ครืน…", 4),
    "tueng": ("ตึ้ง!!", 1),
}


def instance() -> TTFont:
    font = instantiateVariableFont(TTFont(FONT), {"wght": WEIGHT})
    buf = io.BytesIO()
    font.save(buf)
    return TTFont(io.BytesIO(buf.getvalue())), buf.getvalue()


def shape(blob: bytes, text: str):
    font = hb.Font(hb.Face(blob))
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    buf.cluster_level = hb.BufferClusterLevel.MONOTONE_CHARACTERS
    hb.shape(font, buf, {"kern": True, "liga": True})
    return buf.glyph_infos, buf.glyph_positions


def top_of(glyphs, name: str) -> float:
    pen = BoundsPen(glyphs)
    glyphs[name].draw(pen)
    return pen.bounds[3] if pen.bounds else 0


def draw(font: TTFont, blob: bytes, text: str, seed: int) -> list:
    glyphs = font.getGlyphSet()
    order = font.getGlyphOrder()
    infos, positions = shape(blob, text)
    rng = random.Random(seed)
    placed = []  # (glyph name, x, y, cluster) in font units
    x = 0
    marks = font["GDEF"].table.GlyphClassDef.classDefs
    stacked: dict[int, int] = {}  # cluster -> marks above the base so far
    for info, pos in zip(infos, positions):
        name, lift = order[info.codepoint], 0
        if marks.get(name) == 3 and top_of(glyphs, name) > ABOVE:
            # The outline is thick, so each mark above the base sits a little higher than the
            # font puts it, or it fuses with the vowel under it.
            stacked[info.cluster] = stacked.get(info.cluster, 0) + 1
            lift = LIFT * stacked[info.cluster]
        placed.append((name, x + pos.x_offset, pos.y_offset + lift, info.cluster))
        x += pos.x_advance
    # Each cluster (a consonant with its marks, or a sign) turns and grows about its own
    # centre, so the marks stay on their base.
    spans: dict[int, list[float]] = {}
    for name, gx, _, cluster in placed:
        span = spans.setdefault(cluster, [gx, gx])
        span[0], span[1] = min(span[0], gx), max(span[1], gx + glyphs[name].width)
    jitter = {c: (math.radians(rng.uniform(-TILT, TILT)), 1 + rng.uniform(-GROW, GROW), rng.uniform(-BOUNCE, BOUNCE)) for c in sorted(spans)}

    def matrix(gx: float, gy: float, cluster: int, dx: float = 0, dy: float = 0) -> tuple:
        """Glyph point (u, v) -> turned and grown about the cluster centre, bounced, slanted, y flipped, scaled."""
        a, grow, bounce = jitter[cluster]
        c, s = math.cos(a) * grow, math.sin(a) * grow
        cx, ox, oy = sum(spans[cluster]) / 2, gx - sum(spans[cluster]) / 2, gy - MIDDLE
        tx, ty = c * ox - s * oy + cx, s * ox + c * oy + MIDDLE + bounce
        return (
            (c + SLANT * s) * SCALE,
            -s * SCALE,
            (-s + SLANT * c) * SCALE,
            -c * SCALE,
            (tx + SLANT * ty) * SCALE - dx,
            -ty * SCALE - dy,
        )

    bounds = BoundsPen(glyphs)
    for name, gx, gy, cluster in placed:
        glyphs[name].draw(TransformPen(bounds, matrix(gx, gy, cluster)))
    left, top, right, bottom = bounds.bounds
    pen = SVGPathPen(glyphs, ntos=lambda v: str(round(v)))
    for name, gx, gy, cluster in placed:
        glyphs[name].draw(TransformPen(pen, matrix(gx, gy, cluster, left, top)))
    return [round(right - left), round(bottom - top), pen.getCommands()]


def main() -> None:
    font, blob = instance()
    out = {}
    for key, (text, seed) in WORDS.items():
        out[key] = (text, draw(font, blob, text, seed))
    lines = [
        "// Written by scripts/fx-words.py from Playpen Sans Thai (OFL, scripts/fonts/OFL.txt). Do not edit by hand.",
        "// Each word is [width, height, SVG path data], in word units with y down.",
        "",
        "export const WORDS = {",
    ]
    for key, (text, (w, h, d)) in out.items():
        lines.append(f'  /** {text} */ {key}: [{w}, {h}, "{d}"],')
    lines += ["} as const satisfies Record<string, readonly [number, number, string]>;", "", "export type WordId = keyof typeof WORDS;", ""]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines))
    for key, (text, (w, h, d)) in out.items():
        print(f"{key:6} {text:8} {w:4} x {h:4}  {len(d):6} chars")


if __name__ == "__main__":
    main()
