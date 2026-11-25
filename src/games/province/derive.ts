/**
 * Turns question facts and province facts into answer probabilities:
 * one Float64Array(77) per option, P(option | province), in PROVINCE_IDS order.
 */

import { PROVINCE_COUNT, PROVINCE_IDS, type ProvinceId } from "./ids";
import { PROVINCES } from "./provinces";
import {
  COUNTRIES,
  DIALECTS,
  MEASURES,
  answerOptions,
  type Faith,
  type GeoFacts,
  type LeanFacts,
  type LeanOption,
  type ProvinceFacts,
  type Question,
} from "./schema";

/** Every question's "ไม่แน่ใจ" gets this share in every province, so it never moves belief. */
export const UNSURE_SHARE = 0.05;
/**
 * Each answer's probabilities are mixed with this uniform share. One careless
 * answer lowers the true province's probability but never rules it out.
 */
export const FLOOR = 0.06;

export type Rows = readonly Float64Array[];

const FACTS: readonly ProvinceFacts[] = PROVINCE_IDS.map((id) => PROVINCES[id]);

/** P(option | province) for a question, "ไม่แน่ใจ" last. */
export function rowsFor(question: Question): Rows {
  const weights = question.kind === "lean" ? FACTS.map((p, i) => leanWeights(question, p, PROVINCE_IDS[i]!)) : FACTS.map((p) => geoWeights(question, p));
  return finish(weights, answerOptions(question).length);
}

/**
 * Normalizes each province's own-option weights, mixes in the floor, and
 * appends "ไม่แน่ใจ". `weights[p]` holds every option but "ไม่แน่ใจ".
 */
export function finish(weights: readonly (readonly number[])[], optionCount: number): Rows {
  const own = optionCount - 1;
  const rows = Array.from({ length: optionCount }, () => new Float64Array(PROVINCE_COUNT));
  weights.forEach((w, p) => {
    const total = w.reduce((s, x) => s + x, 0);
    for (let o = 0; o < own; o++) {
      const share = total > 0 ? w[o]! / total : 1 / own;
      rows[o]![p] = (1 - UNSURE_SHARE) * ((1 - FLOOR) * share + FLOOR / own);
    }
    rows[own]![p] = UNSURE_SHARE;
  });
  return rows;
}

const FAITH_SHARE = (p: ProvinceFacts): Record<Faith, number> => ({ buddhist: 1 - p.muslim, muslim: p.muslim });

function leanWeights(question: LeanFacts, province: ProvinceFacts, id: ProvinceId): number[] {
  const override = question.override?.[id];
  if (override) return question.options.map((o) => (override as Record<string, number | undefined>)[o.key] ?? 0);
  const uses = (dimension: "dialect" | "faith" | "region") => question.options.some((o) => o[dimension] !== undefined);
  const dialect = uses("dialect");
  const faith = uses("faith");
  const region = uses("region");
  return question.options.map((option: LeanOption<string>) => {
    let w = option.base ?? 1;
    if (dialect) w *= DIALECTS.reduce((s, d) => s + (province.dialect[d] ?? 0) * (option.dialect?.[d] ?? 0), 0);
    if (faith) {
      const shares = FAITH_SHARE(province);
      w *= (["buddhist", "muslim"] as const).reduce((s, f) => s + shares[f] * (option.faith?.[f] ?? 0), 0);
    }
    if (region) w *= option.region?.[province.region] ?? 0;
    for (const tag of province.tags ?? []) w *= 1 + (option.tags?.[tag] ?? 0);
    return w;
  });
}

// Geography, ported from the prototype archive's geo.ts and questions.ts.

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Straight-line km between every pair of provinces' capitals, in PROVINCE_IDS order. */
export const DISTANCE_KM: readonly (readonly number[])[] = FACTS.map((a) => FACTS.map((b) => haversineKm(a.capital, b.capital)));

/** Rough driving hours from straight-line km: roads wind, about 80 km/h. */
const driveHours = (km: number) => (km * 1.25) / 80;

/** How far the capital sits from the shore, for coastal provinces whose capital is inland. */
const COAST_OFFSET_KM: Partial<Record<ProvinceId, number>> = {
  bangkok: 35,
  chachoengsao: 35,
  "nakhon-si-thammarat": 25,
  "surat-thani": 15,
};

function coastKm(index: number): number {
  const id = PROVINCE_IDS[index]!;
  if (FACTS[index]!.coast) return COAST_OFFSET_KM[id] ?? 10;
  let best = Infinity;
  FACTS.forEach((q, j) => {
    if (q.coast) best = Math.min(best, DISTANCE_KM[index]![j]!);
  });
  return best + 10;
}

/** km to the nearest province on the border with `country`, 0 when on it. */
function countryKm(index: number, country: (typeof COUNTRIES)[number]): number {
  if (FACTS[index]!.border?.includes(country)) return 0;
  let best = Infinity;
  FACTS.forEach((q, j) => {
    if (q.border?.includes(country)) best = Math.min(best, DISTANCE_KM[index]![j]!);
  });
  return best;
}

/** Standard normal CDF (Abramowitz–Stegun). */
function ncdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const q = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - q : q;
}

/** P(a person reports each bin) when their estimate is the true value times log-normal error. */
function softBins(value: number, edges: readonly number[], sigma: number): number[] {
  const lv = Math.log(Math.max(value, 0.05));
  const cdf = edges.map((e) => ncdf((Math.log(e) - lv) / sigma));
  return [cdf[0]!, ...edges.slice(1).map((_, i) => cdf[i + 1]! - cdf[i]!), 1 - cdf[cdf.length - 1]!];
}

const BANGKOK = PROVINCE_IDS.indexOf("bangkok");

function geoWeights(question: GeoFacts, province: ProvinceFacts): number[] {
  const index = FACTS.indexOf(province);
  switch (question.measure) {
    case "sea-hours":
      return softBins(driveHours(coastKm(index)), [0.5, 2, 5], 0.45);
    case "bangkok-hours":
      return softBins(Math.max(driveHours(DISTANCE_KM[index]![BANGKOK]!), 0.3), [1, 3, 6, 10], 0.35);
    case "terrain":
      return [
        [3, 20, 77],
        [20, 55, 25],
        [70, 25, 5],
      ][province.terrain]!;
    case "cold": {
      const c = Math.min(1, Math.max(0, (province.capital.lat - 12.5) / 5.5 + (province.terrain === 2 ? 0.15 : 0)));
      return [c * c, 2 * c * (1 - c) + 0.1, (1 - c) * (1 - c)];
    }
    case "neighbour":
      return MEASURES.neighbour.map((country) => Math.exp(-countryKm(index, country) / 90));
  }
}

/** The pick question's model: a local picks their own province's item; a neighbour often knows it too. */
export const PICK_WEIGHTS = { own: 10, nearby: 3, nearbyKm: 50, none: 1.5 } as const;

/**
 * P(option | province) for a pick question naming `owners`' signatures, then
 * "ไม่มีอันไหนเลย", then "ไม่แน่ใจ".
 */
export function pickRows(owners: readonly number[]): Rows {
  const { own, nearby, nearbyKm, none } = PICK_WEIGHTS;
  const weights = PROVINCE_IDS.map((_, p) => [
    ...owners.map((o) => (o === p ? own : nearby * Math.exp(-DISTANCE_KM[p]![o]! / nearbyKm))),
    none,
  ]);
  return finish(weights, owners.length + 2);
}
