/**
 * Builds the Province game's map module from Natural Earth: simplified,
 * projected SVG path data for Thailand's 77 provinces and its four
 * neighbours. The app never ships raw GeoJSON.
 *
 *   bun scripts/build-province-map.ts [--cache <dir>] [--tolerance <units>]
 *
 * Downloads the two GeoJSON files into the cache once (default
 * node_modules/.cache/natural-earth), then writes
 * src/games/province/map/shapes.ts. Rerun it after changing the projection,
 * the tolerance or the Natural Earth release.
 */

import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const RELEASE = "v5.1.2";
const BASE = `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/${RELEASE}/geojson`;
const SOURCES = {
  admin1: "ne_10m_admin_1_states_provinces.geojson",
  admin0: "ne_10m_admin_0_countries.geojson",
} as const;
const OUT = join(import.meta.dir, "../src/games/province/map/shapes.ts");

/** Map units per degree of latitude. One unit is about 1.1 km. */
const SCALE = 100;
/** Equirectangular, with longitude shrunk by cos(13°), Thailand's middle latitude. */
const LNG_FACTOR = Math.cos((13 * Math.PI) / 180);
const LNG0 = 95;
const LAT1 = 23;

const NEIGHBOURS = { MM: "MMR", LA: "LAO", KH: "KHM", MY: "MYS" } as const;
/** Where each neighbour's name sits on the map, in [lng, lat], inside the frame and inside the country. */
const NEIGHBOUR_LABELS: Record<keyof typeof NEIGHBOURS, readonly [number, number]> = {
  MM: [97.05, 15.3],
  LA: [102.5, 19.7],
  KH: [104.5, 13.1],
  MY: [100.75, 5.75],
};
/** The margin around Thailand's extent, in degrees, that shows a strip of each neighbour. */
const FRAME_MARGIN = 0.3;

type Ring = readonly (readonly [number, number])[];
type Geometry = { type: "Polygon"; coordinates: Ring[] } | { type: "MultiPolygon"; coordinates: Ring[][] };
interface Feature {
  properties: Record<string, unknown>;
  geometry: Geometry;
}

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const cache = flag("--cache") ?? join(import.meta.dir, "../node_modules/.cache/natural-earth");
const tolerance = Number(flag("--tolerance") ?? 0.6);

async function load(file: string): Promise<Feature[]> {
  mkdirSync(cache, { recursive: true });
  const path = join(cache, `${RELEASE}-${file}`);
  if (!existsSync(path)) {
    console.log(`downloading ${BASE}/${file}`);
    const response = await fetch(`${BASE}/${file}`);
    if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
    await Bun.write(path, response);
  }
  const parsed: unknown = JSON.parse(await Bun.file(path).text());
  if (typeof parsed !== "object" || parsed === null || !Array.isArray((parsed as { features?: unknown }).features)) {
    throw new Error(`${file} is not a GeoJSON FeatureCollection`);
  }
  return (parsed as { features: Feature[] }).features;
}

const project = ([lng, lat]: readonly [number, number]): [number, number] => [
  (lng - LNG0) * SCALE * LNG_FACTOR,
  (LAT1 - lat) * SCALE,
];

function polygonsOf(geometry: Geometry): Ring[][] {
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
}

/** Douglas–Peucker on one closed ring, in map units. */
function simplify(points: [number, number][], epsilon: number): [number, number][] {
  if (points.length <= 4) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length > 0) {
    const [a, b] = stack.pop()!;
    const [ax, ay] = points[a]!;
    const [bx, by] = points[b]!;
    const dx = bx - ax;
    const dy = by - ay;
    const length = Math.hypot(dx, dy);
    let worst = -1;
    let at = -1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = points[i]!;
      const d = length === 0 ? Math.hypot(px - ax, py - ay) : Math.abs(dy * px - dx * py + bx * ay - by * ax) / length;
      if (d > worst) {
        worst = d;
        at = i;
      }
    }
    if (worst > epsilon) {
      keep[at] = 1;
      stack.push([a, at], [at, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

/** One ring as compact path data: an absolute move, then integer relative lines. */
function ringPath(ring: Ring, clamp?: (p: [number, number]) => [number, number]): string {
  const projected = ring.map((p) => project(clamp ? clamp([p[0], p[1]]) : [p[0], p[1]]));
  const simple = simplify(projected, tolerance).map(([x, y]) => [Math.round(x), Math.round(y)] as const);
  const deduped = simple.filter((p, i) => i === 0 || p[0] !== simple[i - 1]![0] || p[1] !== simple[i - 1]![1]);
  if (deduped.length < 4) return "";
  const [first, ...rest] = deduped;
  let d = `M${first![0]} ${first![1]}l`;
  let [x, y] = first!;
  const steps: string[] = [];
  for (const [px, py] of rest.slice(0, -1)) {
    steps.push(`${px - x} ${py - y}`);
    x = px;
    y = py;
  }
  d += steps.join(" ").replaceAll(" -", "-");
  return `${d}z`;
}

function ringArea(ring: Ring): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += ring[j]![0] * ring[i]![1] - ring[i]![0] * ring[j]![1];
  return Math.abs(a / 2);
}

/** The centre of a province's largest polygon's bounding box, for a label. */
function labelPoint(geometry: Geometry): [number, number] {
  const largest = polygonsOf(geometry).reduce((a, b) => (ringArea(b[0]!) > ringArea(a[0]!) ? b : a))[0]!;
  const xs = largest.map((p) => p[0]);
  const ys = largest.map((p) => p[1]);
  const [x, y] = project([(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]);
  return [Math.round(x), Math.round(y)];
}

const admin1 = await load(SOURCES.admin1);
const admin0 = await load(SOURCES.admin0);

const provinces = admin1
  .filter((f) => f.properties.adm0_a3 === "THA")
  .map((f) => ({ iso: String(f.properties.iso_3166_2), name: String(f.properties.name), geometry: f.geometry }))
  .sort((a, b) => a.iso.localeCompare(b.iso));
if (provinces.length !== 77) throw new Error(`expected 77 Thai provinces in admin-1, found ${provinces.length}`);

/** The map's frame in [lng, lat]: Thailand's extent plus a margin. Neighbour shapes are clamped to it. */
const thaiLngLat = provinces.flatMap((p) => polygonsOf(p.geometry).flatMap((poly) => poly[0]!));
const FRAME = {
  west: Math.min(...thaiLngLat.map((p) => p[0])) - FRAME_MARGIN,
  east: Math.max(...thaiLngLat.map((p) => p[0])) + FRAME_MARGIN,
  south: Math.min(...thaiLngLat.map((p) => p[1])) - FRAME_MARGIN,
  north: Math.max(...thaiLngLat.map((p) => p[1])) + FRAME_MARGIN,
};
const inFrame = (ring: Ring) =>
  ring.some(([lng, lat]) => lng >= FRAME.west && lng <= FRAME.east && lat >= FRAME.south && lat <= FRAME.north);
const clampToFrame = ([lng, lat]: [number, number]): [number, number] => [
  Math.min(FRAME.east, Math.max(FRAME.west, lng)),
  Math.min(FRAME.north, Math.max(FRAME.south, lat)),
];

const provincePaths = provinces.map((p) => ({
  ...p,
  d: polygonsOf(p.geometry)
    .flatMap((polygon) => polygon.map((ring) => ringPath(ring)))
    .join(""),
  at: labelPoint(p.geometry),
}));

const neighbourPaths = Object.entries(NEIGHBOURS).map(([code, a3]) => {
  const feature = admin0.find((f) => f.properties.ADM0_A3 === a3);
  if (!feature) throw new Error(`admin-0 has no ${a3}`);
  const d = polygonsOf(feature.geometry)
    .filter((polygon) => inFrame(polygon[0]!))
    .flatMap((polygon) => polygon.map((ring) => ringPath(ring, clampToFrame)))
    .join("");
  const [x, y] = project(NEIGHBOUR_LABELS[code as keyof typeof NEIGHBOURS]);
  return { code, d, at: [Math.round(x), Math.round(y)] as const };
});

const [x0, y0] = project([FRAME.west, FRAME.north]).map(Math.floor) as [number, number];
const [x1, y1] = project([FRAME.east, FRAME.south]).map(Math.ceil) as [number, number];

const source = `/**
 * GENERATED by scripts/build-province-map.ts. Do not edit; rerun the script.
 *
 * Source: Natural Earth ${RELEASE}, 1:10m Cultural Vectors, admin-1 states and
 * provinces (Thailand's 77 provinces, keyed by ISO 3166-2) and admin-0
 * countries (Myanmar, Laos, Cambodia, Malaysia), from
 * ${BASE}/
 * Licence: public domain (https://www.naturalearthdata.com/about/terms-of-use/).
 *
 * Projection: equirectangular, longitude scaled by cos(13°), ${SCALE} units per
 * degree, origin at ${LNG0}°E ${LAT1}°N. Simplified with Douglas–Peucker at
 * ${tolerance} units (about ${(tolerance * 1.1).toFixed(1)} km), rounded to whole units.
 */

export type NeighbourCode = ${Object.keys(NEIGHBOURS).map((c) => JSON.stringify(c)).join(" | ")};

/** The map's viewBox: Thailand with a ${FRAME_MARGIN}° strip of its neighbours around it. */
export const MAP_VIEWBOX = ${JSON.stringify(`${x0} ${y0} ${x1 - x0} ${y1 - y0}`)};

/** Each province's outline and label point, keyed by ISO 3166-2 code. */
export const PROVINCE_SHAPES: Readonly<Record<string, { readonly d: string; readonly at: readonly [number, number] }>> = {
${provincePaths.map((p) => `  ${JSON.stringify(p.iso)}: { at: [${p.at[0]}, ${p.at[1]}], d: ${JSON.stringify(p.d)} }, // ${p.name}`).join("\n")}
};

/** Each neighbour's outline, clamped to the map's frame, and its label point. */
export const NEIGHBOUR_SHAPES: Readonly<Record<NeighbourCode, { readonly d: string; readonly at: readonly [number, number] }>> = {
${neighbourPaths.map((n) => `  ${n.code}: { at: [${n.at[0]}, ${n.at[1]}], d: ${JSON.stringify(n.d)} },`).join("\n")}
};
`;

mkdirSync(join(OUT, ".."), { recursive: true });
await Bun.write(OUT, source);
const pathBytes = [...provincePaths, ...neighbourPaths].reduce((s, p) => s + p.d.length, 0);
console.log(`wrote ${OUT}: ${(source.length / 1024).toFixed(1)} KB, ${(pathBytes / 1024).toFixed(1)} KB of path data`);
