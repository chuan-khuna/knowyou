/**
 * Turns question facts and university facts into answer probabilities:
 * one Float64Array per option, P(option | university), in UNIVERSITY_IDS order.
 */

import { UNIVERSITY_COUNT, UNIVERSITY_IDS, type UniversityId } from "./ids";
import { UNIVERSITIES } from "./universities";
import { FIELDS, SETTINGS, answerOptions, type LeanOption, type Question, type UniversityFacts } from "./schema";

/** Every question's "ไม่แน่ใจ" gets this share in every university, so it never moves belief. */
export const UNSURE_SHARE = 0.05;
/**
 * Each answer's probabilities are mixed with this uniform share. One careless
 * answer lowers the true university's probability but never rules it out.
 */
export const FLOOR = 0.06;

export type Rows = readonly Float64Array[];

const FACTS: readonly UniversityFacts[] = UNIVERSITY_IDS.map((id) => UNIVERSITIES[id]);

/** P(option | university) for a question, "ไม่แน่ใจ" last. */
export function rowsFor(question: Question): Rows {
  return finish(
    FACTS.map((u, i) => leanWeights(question, u, UNIVERSITY_IDS[i]!)),
    answerOptions(question).length,
  );
}

/**
 * Normalizes each university's own-option weights, mixes in the floor, and
 * appends "ไม่แน่ใจ". `weights[u]` holds every option but "ไม่แน่ใจ".
 */
export function finish(weights: readonly (readonly number[])[], optionCount: number): Rows {
  const own = optionCount - 1;
  const rows = Array.from({ length: optionCount }, () => new Float64Array(UNIVERSITY_COUNT));
  weights.forEach((w, u) => {
    const total = w.reduce((s, x) => s + x, 0);
    for (let o = 0; o < own; o++) {
      const share = total > 0 ? w[o]! / total : 1 / own;
      rows[o]![u] = (1 - UNSURE_SHARE) * ((1 - FLOOR) * share + FLOOR / own);
    }
    rows[own]![u] = UNSURE_SHARE;
  });
  return rows;
}

function leanWeights(question: Question, university: UniversityFacts, id: UniversityId): number[] {
  const override = question.override?.[id];
  if (override) return question.options.map((o) => (override as Record<string, number | undefined>)[o.key] ?? 0);
  const uses = (dimension: "area" | "control" | "fields" | "setting") => question.options.some((o) => o[dimension] !== undefined);
  const area = uses("area");
  const control = uses("control");
  const fields = uses("fields");
  const setting = uses("setting");
  return question.options.map((option: LeanOption<string>) => {
    let w = option.base ?? 1;
    if (area) w *= option.area?.[university.area] ?? 0;
    if (control) w *= option.control?.[university.control] ?? 0;
    if (fields) w *= FIELDS.reduce((s, f) => s + (university.fields[f] ?? 0) * (option.fields?.[f] ?? 0), 0);
    if (setting) w *= SETTINGS.reduce((s, x) => s + (university.setting[x] ?? 0) * (option.setting?.[x] ?? 0), 0);
    for (const tag of university.tags ?? []) w *= 1 + (option.tags?.[tag] ?? 0);
    return w;
  });
}

/**
 * The pick question's model: a student picks their own university's item;
 * a student elsewhere in the same area knows it more often than one further away.
 */
export const PICK_WEIGHTS = { own: 10, sameArea: 1.5, otherArea: 0.3, none: 3 } as const;

/**
 * P(option | university) for a pick question naming `owners`' signatures,
 * then "ไม่มีอันไหนเลย", then "ไม่แน่ใจ".
 */
export function pickRows(owners: readonly number[]): Rows {
  const { own, sameArea, otherArea, none } = PICK_WEIGHTS;
  const weights = FACTS.map((u, p) => [
    ...owners.map((o) => (o === p ? own : FACTS[o]!.area === u.area ? sameArea : otherArea)),
    none,
  ]);
  return finish(weights, owners.length + 2);
}
