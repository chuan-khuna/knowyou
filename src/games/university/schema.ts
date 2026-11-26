/**
 * University facts and question facts: what an author writes about the
 * universities. Never 36-row tables of probabilities, except an explicit
 * `override` row.
 *
 * Every question is a "lean": each option leans toward some areas, public or
 * private, field groups, campus settings or university tags, and derive.ts
 * turns that into P(option | university).
 */

import type { AnswerOption } from "../engine";
import type { UniversityId } from "./ids";

export type Area = "bangkok" | "north" | "northeast" | "south" | "east";

/** The five areas in the order the university picker lists them. */
export const AREA_NAMES: Readonly<Record<Area, string>> = {
  bangkok: "กรุงเทพและปริมณฑล",
  north: "ภาคเหนือ",
  northeast: "ภาคอีสาน",
  south: "ภาคใต้",
  east: "ภาคตะวันออก",
};

export type Control = "public" | "private";

/**
 * Field groups: health; tech (science, engineering, IT, agriculture);
 * business; arts (communication, fine arts, design, architecture); social
 * (humanities, social science, education, law).
 */
export type Field = "health" | "tech" | "business" | "arts" | "social";
export const FIELDS: readonly Field[] = ["health", "tech", "business", "arts", "social"];

/** downtown: a big city's centre; suburb: a city's edge; town: a provincial town; countryside: out of town. */
export type Setting = "downtown" | "suburb" | "town" | "countryside";
export const SETTINGS: readonly Setting[] = ["downtown", "suburb", "town", "countryside"];

/** Campus traits that cut across area and type. A lean option can favour universities with a tag. */
export type Tag =
  /** ห้องเชียร์ and ว้าก: a strict SOTUS welcome. */
  | "sotus"
  /** ฟุตบอลประเพณี against a rival university. */
  | "football-classic"
  /** A free bus or tram around campus. */
  | "shuttle"
  /** A BTS, MRT or Airport Rail Link station at the gate. */
  | "rail"
  /** Most first years live in campus dorms. */
  | "first-year-dorm"
  /** A working farm on campus that sells its milk or produce. */
  | "farm"
  /** A lake or reservoir on campus. */
  | "lake"
  /** Hills or a mountain right by campus. */
  | "hill"
  /** The sea within a short ride. */
  | "sea"
  /** Most programmes teach in English. */
  | "english"
  /** Chinese taught to everyone, or a large Chinese community on campus. */
  | "chinese"
  /** Japanese taught to everyone. */
  | "japanese"
  /** A Christian foundation, with chapel and Christmas on campus. */
  | "christian"
  /** Open admission: no entrance exam. */
  | "open-admission"
  /** Work-based study: terms alternate with paid work placements. */
  | "work-based"
  /** Three terms a year. */
  | "trimester"
  /** The uniform is checked every day. */
  | "uniform"
  /** The Rangsit cluster, by Future Park Rangsit. */
  | "rangsit";

export type Topic = "life" | "study" | "place";

/** Something a student there recognises as theirs: a tradition, a campus place, a food or a song. Never just the university's name. */
export interface Signature {
  readonly label: string;
  readonly kind: "tradition" | "place" | "food" | "song";
}

export type UniversityFact = "control" | "fields" | "setting" | "tags" | "signatures";

export interface UniversityFacts {
  /** The full Thai name, as the guess says it. */
  readonly name: string;
  /** What players call it, such as จุฬาฯ or มช. */
  readonly short: string;
  readonly area: Area;
  readonly control: Control;
  /** Share of undergraduates in each field group. Sums to 1. */
  readonly fields: Partial<Record<Field, number>>;
  /** Share of undergraduates at a campus in each setting. Sums to 1. */
  readonly setting: Partial<Record<Setting, number>>;
  readonly tags?: readonly Tag[];
  /** At least two, for pick questions. */
  readonly signatures: readonly [Signature, Signature, ...Signature[]];
  /** Facts the author doubts. A persona that misses on this university points here first. */
  readonly unsure?: readonly UniversityFact[];
}

/** Relative weights, one per option key, that replace one university's derived row. */
export type Override<K extends string> = { readonly [U in UniversityId]?: { readonly [O in K]?: number } };

/**
 * One option of a lean question. Its weight for a university is the product
 * of the dimensions the question uses: the option's weight for the
 * university's area, its weight for public or private (a missing weight
 * counts 0), the university's field and setting shares times this option's
 * weights, times `base`, times 1 + the option's `tags` boost for every tag
 * the university has. A boost of 9 makes the option ten times likelier;
 * −0.8 cuts it to a fifth.
 */
export interface LeanOption<K extends string> extends AnswerOption {
  readonly key: K;
  readonly area?: Partial<Record<Area, number>>;
  readonly control?: Partial<Record<Control, number>>;
  readonly fields?: Partial<Record<Field, number>>;
  readonly setting?: Partial<Record<Setting, number>>;
  readonly tags?: Partial<Record<Tag, number>>;
  readonly base?: number;
}

export interface LeanFacts<K extends string = string> {
  readonly kind: "lean";
  readonly topic: Topic;
  readonly prompt: string;
  readonly aside?: string;
  /** 3–5 options; "ไม่แน่ใจ" is added last. */
  readonly options: readonly LeanOption<K>[];
  readonly override?: Override<K>;
  /** Weights the author doubts, by option key. */
  readonly unsure?: readonly K[];
}

export type Facts = LeanFacts;
export type Question = Facts & { readonly id: string };

export type UnsureKey = "unsure";
export const UNSURE_OPTION = { key: "unsure", label: "ไม่แน่ใจ" } as const;

export type AnswerKeyOf<F extends Facts> = F extends LeanFacts<infer K> ? K | UnsureKey : never;

export function lean<const K extends string>(facts: Omit<LeanFacts<K>, "kind">): LeanFacts<K> {
  return { kind: "lean", ...facts };
}

/** The answers a question offers, in display order, "ไม่แน่ใจ" last. */
export function answerOptions(facts: Facts): readonly AnswerOption[] {
  return [...facts.options.map(({ key, label, hint }) => ({ key, label, ...(hint ? { hint } : {}) })), UNSURE_OPTION];
}

export type BankPart = { readonly [id: string]: Facts };

type Merge<P extends readonly BankPart[]> = P extends readonly [
  infer H extends BankPart,
  ...infer T extends readonly BankPart[],
]
  ? H & Merge<T>
  : unknown;

export interface Bank<B> {
  readonly facts: B;
  readonly list: readonly Question[];
}

export class BankError extends Error {
  constructor(readonly issues: readonly string[]) {
    super(`invalid university question bank:\n  ${issues.join("\n  ")}`);
    this.name = "BankError";
  }
}

const MAX_PLACE = 5;

function factIssues(id: string, facts: Facts): string[] {
  const issues: string[] = [];
  const options = answerOptions(facts);
  if (options.length < 4 || options.length > 6) issues.push(`${id}: ${options.length} options; keep 4–6 with ไม่แน่ใจ`);
  if (new Set(options.map((o) => o.label)).size !== options.length) issues.push(`${id}: two options share a label`);
  if (new Set(options.map((o) => o.key)).size !== options.length) issues.push(`${id}: two options share a key`);
  for (const option of facts.options) {
    const weights = [option.area, option.control, option.fields, option.setting].flatMap((w) => Object.values(w ?? {}));
    if ([...weights, option.base ?? 1].some((w) => !(w >= 0))) issues.push(`${id}: option ${option.key} has a negative weight`);
    if (Object.values(option.tags ?? {}).some((w) => !(w >= -1))) issues.push(`${id}: option ${option.key} has a tag boost below −1`);
  }
  return issues;
}

/** Merges bank parts and checks them once. Throws a BankError listing every issue. */
export function defineBank<const P extends readonly BankPart[]>(...parts: P): Bank<Merge<P>> {
  const seen = new Set<string>();
  const issues: string[] = [];
  const list: Question[] = [];
  for (const part of parts) {
    for (const [id, facts] of Object.entries(part)) {
      if (seen.has(id)) issues.push(`${id}: duplicate question id`);
      if (id.startsWith("pick:")) issues.push(`${id}: ids starting "pick:" are reserved for pick questions`);
      seen.add(id);
      issues.push(...factIssues(id, facts));
      list.push({ ...facts, id });
    }
  }
  const place = list.filter((q) => q.topic === "place").length;
  if (place > MAX_PLACE) issues.push(`${place} place questions; keep ${MAX_PLACE} or fewer`);
  if (issues.length > 0) throw new BankError(issues);
  return { facts: Object.assign({}, ...parts) as Merge<P>, list: Object.freeze(list) };
}

export type QuestionIdOf<B> = keyof B & string;
export type AnswerOfId<B, Id extends keyof B> = B[Id] extends Facts ? AnswerKeyOf<B[Id]> : never;
/** A recorded set of answers, each one checked against its own question's answer keys. */
export type AnswersFor<B> = { readonly [Id in QuestionIdOf<B>]?: AnswerOfId<B, Id> };
