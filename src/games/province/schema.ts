/**
 * Province facts and question facts: what an author writes about the world.
 * Never 77-row tables of probabilities, except an explicit `override` row.
 *
 * Every question becomes P(option | province) through derive.ts. A question
 * about language, food or culture is a "lean": each option leans toward some
 * dialects, faiths, regions or province tags. A geography question reads a
 * province's measured facts (coast, terrain, latitude, distance).
 */

import type { AnswerOption } from "../engine";
import type { ProvinceId } from "./ids";

export type Region = "north" | "northeast" | "central" | "east" | "west" | "south";

/** The six regions in the order the province picker lists them. */
export const REGION_NAMES: Readonly<Record<Region, string>> = {
  north: "ภาคเหนือ",
  northeast: "ภาคตะวันออกเฉียงเหนือ",
  central: "ภาคกลาง",
  east: "ภาคตะวันออก",
  west: "ภาคตะวันตก",
  south: "ภาคใต้",
};

/** The home dialect: กลาง, คำเมือง, อีสาน/ลาว, ใต้, เขมร/กูย, มลายู. */
export type Dialect = "klang" | "muang" | "isan" | "tai" | "khmer" | "malay";
export const DIALECTS: readonly Dialect[] = ["klang", "muang", "isan", "tai", "khmer", "malay"];

export type Faith = "buddhist" | "muslim";

/** Thailand's land neighbours, as on the neighbours map. */
export type Country = "MM" | "LA" | "KH" | "MY";
export const COUNTRIES: readonly Country[] = ["MM", "LA", "KH", "MY"];

/** Local traits that cut across dialect and region. A lean option can favour provinces with a tag. */
export type Tag =
  | "suphan-accent"
  | "eastern-accent"
  | "chinese"
  | "jay-festival"
  | "hill-peoples"
  | "mon"
  | "dimsum-breakfast"
  | "boat-race"
  | "bullfight"
  | "buffalo-race"
  | "dove-contest";

export type Topic = "language" | "food" | "culture" | "geography";

/** Something a local recognises as "ours": a food, a tradition or a souvenir. Never a landmark. */
export interface Signature {
  readonly label: string;
  readonly kind: "food" | "tradition" | "souvenir";
}

export type ProvinceFact = "dialect" | "muslim" | "terrain" | "tags" | "signatures";

export interface ProvinceFacts {
  readonly name: string;
  readonly region: Region;
  /** The provincial capital, roughly. Distances are measured from here. */
  readonly capital: { readonly lat: number; readonly lng: number };
  /** Share of people speaking each dialect at home. Sums to 1. */
  readonly dialect: Partial<Record<Dialect, number>>;
  /** 0 a flat plain, 1 some hills, 2 mountains all around. */
  readonly terrain: 0 | 1 | 2;
  readonly coast?: "gulf" | "andaman";
  readonly border?: readonly Country[];
  /** Share of Muslim households, roughly. */
  readonly muslim: number;
  readonly tags?: readonly Tag[];
  /** At least two, for pick questions. */
  readonly signatures: readonly [Signature, Signature, ...Signature[]];
  /** Facts the author doubts. A persona that misses on this province points here first. */
  readonly unsure?: readonly ProvinceFact[];
}

/** Relative weights, one per option key, that replace one province's derived row. */
export type Override<K extends string> = { readonly [P in ProvinceId]?: { readonly [O in K]?: number } };

/**
 * One option of a lean question. Its weight for a province is the product of
 * the dimensions the question uses, each the province's shares times this
 * option's weights (a missing weight counts 0), times `base`, times
 * 1 + the option's `tags` boost for every tag the province has. A boost of
 * 9 makes the option ten times likelier; −0.8 cuts it to a fifth.
 */
export interface LeanOption<K extends string> extends AnswerOption {
  readonly key: K;
  readonly dialect?: Partial<Record<Dialect, number>>;
  readonly faith?: Partial<Record<Faith, number>>;
  readonly region?: Partial<Record<Region, number>>;
  readonly tags?: Partial<Record<Tag, number>>;
  readonly base?: number;
}

export interface LeanFacts<K extends string = string> {
  readonly kind: "lean";
  readonly topic: Exclude<Topic, "geography">;
  readonly prompt: string;
  readonly aside?: string;
  /** 3–5 options; "ไม่แน่ใจ" is added last. */
  readonly options: readonly LeanOption<K>[];
  readonly override?: Override<K>;
  /** Weights the author doubts, by option key. */
  readonly unsure?: readonly K[];
}

/** What a geography question measures, and the option keys it offers, in order. */
export const MEASURES = {
  "sea-hours": ["sea-30m", "sea-2h", "sea-5h", "sea-far"],
  "bangkok-hours": ["bkk-1h", "bkk-3h", "bkk-6h", "bkk-10h", "bkk-far"],
  terrain: ["mountains", "hills", "plain"],
  cold: ["cold", "cool", "warm"],
  neighbour: ["MM", "LA", "KH", "MY"],
} as const satisfies Record<string, readonly string[]>;

export type Measure = keyof typeof MEASURES;
export type MeasureKey<M extends Measure> = (typeof MEASURES)[M][number];

/** A figure the play screen shows with a question. */
export type Figure = "neighbours";

/** Distributes over measures, so GeoFacts (no argument) is the union of every measure's facts. */
export type GeoFacts<M extends Measure = Measure> = M extends Measure
  ? {
      readonly kind: "geo";
      readonly topic: "geography";
      readonly measure: M;
      readonly prompt: string;
      readonly aside?: string;
      readonly figure?: Figure;
      readonly labels: { readonly [K in MeasureKey<M>]: string };
    }
  : never;

export type Facts = LeanFacts | GeoFacts;
export type Question = Facts & { readonly id: string };

export type UnsureKey = "unsure";
export const UNSURE_OPTION = { key: "unsure", label: "ไม่แน่ใจ" } as const;

export type AnswerKeyOf<F extends Facts> = F extends LeanFacts<infer K>
  ? K | UnsureKey
  : F extends GeoFacts<infer M>
    ? MeasureKey<M> | UnsureKey
    : never;

export function lean<const K extends string>(facts: Omit<LeanFacts<K>, "kind">): LeanFacts<K> {
  return { kind: "lean", ...facts };
}

export function geo<const M extends Measure>(facts: Omit<GeoFacts<M>, "kind" | "topic">): GeoFacts<M> {
  return { kind: "geo", topic: "geography", ...facts } as GeoFacts<M>;
}

/** The answers a question offers, in display order, "ไม่แน่ใจ" last. */
export function answerOptions(facts: Facts): readonly AnswerOption[] {
  const own: AnswerOption[] =
    facts.kind === "lean"
      ? facts.options.map(({ key, label, hint }) => ({ key, label, ...(hint ? { hint } : {}) }))
      : MEASURES[facts.measure].map((key) => ({ key, label: (facts.labels as Record<string, string>)[key]! }));
  return [...own, UNSURE_OPTION];
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
    super(`invalid province question bank:\n  ${issues.join("\n  ")}`);
    this.name = "BankError";
  }
}

const MAX_GEOGRAPHY = 5;

function factIssues(id: string, facts: Facts): string[] {
  const issues: string[] = [];
  const options = answerOptions(facts);
  if (options.length < 4 || options.length > 6) issues.push(`${id}: ${options.length} options; keep 4–6 with ไม่แน่ใจ`);
  if (new Set(options.map((o) => o.label)).size !== options.length) issues.push(`${id}: two options share a label`);
  if (new Set(options.map((o) => o.key)).size !== options.length) issues.push(`${id}: two options share a key`);
  if (facts.kind === "lean") {
    for (const option of facts.options) {
      const weights = [option.dialect, option.faith, option.region].flatMap((w) => Object.values(w ?? {}));
      if ([...weights, option.base ?? 1].some((w) => !(w >= 0))) issues.push(`${id}: option ${option.key} has a negative weight`);
      if (Object.values(option.tags ?? {}).some((w) => !(w >= -1))) issues.push(`${id}: option ${option.key} has a tag boost below −1`);
    }
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
  const geography = list.filter((q) => q.topic === "geography").length;
  if (geography > MAX_GEOGRAPHY) issues.push(`${geography} geography questions; keep ${MAX_GEOGRAPHY} or fewer`);
  if (issues.length > 0) throw new BankError(issues);
  return { facts: Object.assign({}, ...parts) as Merge<P>, list: Object.freeze(list) };
}

export type QuestionIdOf<B> = keyof B & string;
export type AnswerOfId<B, Id extends keyof B> = B[Id] extends Facts ? AnswerKeyOf<B[Id]> : never;
/** A recorded set of answers, each one checked against its own question's answer keys. */
export type AnswersFor<B> = { readonly [Id in QuestionIdOf<B>]?: AnswerOfId<B, Id> };
