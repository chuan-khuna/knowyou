/**
 * Question facts: what an author writes about the world. Never probabilities,
 * except an explicit `override`.
 *
 * The author writes questions with `series(...)`, `film(...)` and `choice(...)`
 * into plain objects keyed by question id, so a duplicate id inside one file is
 * a compile error. `defineBank` merges the files and checks, once at load, the
 * rules the types cannot express.
 */

/** The year the bank's facts are true as of. An age is an age in this year. */
export const BANK_YEAR = 2026;

export type Year =
  | 1960 | 1961 | 1962 | 1963 | 1964 | 1965 | 1966 | 1967 | 1968 | 1969
  | 1970 | 1971 | 1972 | 1973 | 1974 | 1975 | 1976 | 1977 | 1978 | 1979
  | 1980 | 1981 | 1982 | 1983 | 1984 | 1985 | 1986 | 1987 | 1988 | 1989
  | 1990 | 1991 | 1992 | 1993 | 1994 | 1995 | 1996 | 1997 | 1998 | 1999
  | 2000 | 2001 | 2002 | 2003 | 2004 | 2005 | 2006 | 2007 | 2008 | 2009
  | 2010 | 2011 | 2012 | 2013 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019
  | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026;

/** 10 means "10 or younger" and 50 means "50 or older". */
export type Age =
  | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19
  | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29
  | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39
  | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49
  | 50;

export const MIN_AGE = 10;
export const MAX_AGE = 50;
export const AGE_COUNT = MAX_AGE - MIN_AGE + 1;
export const AGES: readonly Age[] = Array.from({ length: AGE_COUNT }, (_, i) => (MIN_AGE + i) as Age);

/** Where Thai viewers could watch, and the years each outlet operated. */
export const OUTLETS = {
  ch3: { label: "ช่อง 3", from: 1970 },
  ch5: { label: "ช่อง 5", from: 1960 },
  ch7: { label: "ช่อง 7", from: 1967 },
  ch9: { label: "ช่อง 9", from: 1960 },
  itv: { label: "ไอทีวี", from: 1996, to: 2007 },
  tpbs: { label: "ไทยพีบีเอส", from: 2008 },
  "digital-tv": { label: "ทีวีดิจิทัล", from: 2014 },
  cable: { label: "เคเบิล / ดาวเทียม", from: 1989 },
  "home-video": { label: "วิดีโอ / วีซีดี / ดีวีดี", from: 1985 },
  web: { label: "ยูทูบ / เว็บ", from: 2006 },
  streaming: { label: "สตรีมมิ่ง", from: 2016 },
} as const satisfies Record<string, { label: string; from: Year; to?: Year }>;

export type Outlet = keyof typeof OUTLETS;

/** Who the title was made for, as Thai viewers received it. */
export type Audience = "kids" | "teens" | "general" | "adults";

/** How big it got in Thailand, not in Japan. */
export type Reach = "phenomenon" | "hit" | "known" | "niche";

/** One stretch of Thai availability. A rerun on another outlet is another run. */
export interface Run {
  readonly on: Outlet;
  readonly from: Year;
  /** Inclusive. "now" means still available in BANK_YEAR. */
  readonly to: Year | "now";
}

/**
 * Probabilities at a few ages, filled in linearly between them and held flat
 * beyond the outermost ones. `{ 10: 0.05, 30: 0.4, 50: 0.1 }` is a full curve.
 */
export type Anchors = { readonly [A in Age]?: number };

/**
 * Replaces the derived probabilities of some answers. Answers left out keep
 * their derived shape, rescaled to fill the rest.
 */
export type Override<K extends string> = { readonly [A in K]?: Anchors };

export type SeriesKey = "lot" | "seen" | "name" | "none";
export type FilmKey = "cinema" | "screen" | "name" | "none";
export type UnsureKey = "unsure";

export type LifeStage = "primary" | "secondary" | "university";

interface TitleFacts<K extends string, OwnFact extends string> {
  /** The Thai name Thai viewers knew. */
  readonly title: string;
  /** A small line under the title: another name or a memory jog. Never a year or a channel. */
  readonly aside?: string;
  readonly audience: Audience;
  readonly reach: Reach;
  /** Titles in one franchise are correlated evidence, so the engine avoids stacking them. */
  readonly franchise?: string;
  /** Facts the author doubts. A persona that misses on this question points here first. */
  readonly unsure?: readonly (OwnFact | "audience" | "reach")[];
  readonly override?: Override<K>;
}

export interface SeriesFacts extends TitleFacts<SeriesKey, "runs"> {
  readonly kind: "series";
  readonly runs: readonly [Run, ...Run[]];
}

export interface FilmFacts extends TitleFacts<FilmKey, "released" | "later"> {
  readonly kind: "film";
  /** Thai cinema release year. */
  readonly released: Year;
  /** Later TV, video or streaming availability. */
  readonly later: readonly Run[];
}

export interface ChoiceSpec {
  readonly label: string;
  /** The years in which this was a common answer for someone at the question's life stage. */
  readonly years: readonly [from: Year, to: Year | "now"];
  /** Relative commonness among choices that overlap in time. Default 1. */
  readonly share?: number;
}

export interface ChoiceFacts<K extends string = string> {
  readonly kind: "choice";
  readonly prompt: string;
  readonly stage: LifeStage;
  /** Shown in key order, followed by the automatic "unsure" answer. */
  readonly choices: { readonly [C in K]: ChoiceSpec };
  readonly unsure?: readonly ("years" | "share")[];
  readonly override?: Override<K | UnsureKey>;
}

export type Facts = SeriesFacts | FilmFacts | ChoiceFacts<string>;

export type Question = Facts & { readonly id: string };

export type AnswerKeyOf<F extends Facts> = F extends SeriesFacts
  ? SeriesKey
  : F extends FilmFacts
    ? FilmKey
    : F extends ChoiceFacts<infer K>
      ? K | UnsureKey
      : never;

export function series(facts: Omit<SeriesFacts, "kind">): SeriesFacts {
  return { kind: "series", ...facts };
}

export function film(facts: Omit<FilmFacts, "kind">): FilmFacts {
  return { kind: "film", ...facts };
}

export function choice<const K extends string>(
  facts: Omit<ChoiceFacts<K>, "kind"> & { readonly choices: { readonly unsure?: never } },
): ChoiceFacts<K> {
  return { kind: "choice", ...facts };
}

export interface AnswerOption {
  readonly key: string;
  readonly label: string;
}

const SERIES_OPTIONS = [
  { key: "lot", label: "ดูประจำ" },
  { key: "seen", label: "เคยดู" },
  { key: "name", label: "รู้จักแค่ชื่อ" },
  { key: "none", label: "ไม่รู้จัก" },
] as const satisfies readonly { key: SeriesKey; label: string }[];

const FILM_OPTIONS = [
  { key: "cinema", label: "ดูในโรงหนัง" },
  { key: "screen", label: "ดูทางทีวีหรือสตรีมมิ่ง" },
  { key: "name", label: "รู้จักแค่ชื่อ" },
  { key: "none", label: "ไม่รู้จัก" },
] as const satisfies readonly { key: FilmKey; label: string }[];

const UNSURE_OPTION = { key: "unsure", label: "ไม่แน่ใจ / จำไม่ได้" } as const;

/** The answers a question offers, in display order. Curves are computed in this order too. */
export function answerOptions(facts: Facts): readonly AnswerOption[] {
  switch (facts.kind) {
    case "series":
      return SERIES_OPTIONS;
    case "film":
      return FILM_OPTIONS;
    case "choice":
      return [
        ...Object.entries(facts.choices).map(([key, spec]) => ({ key, label: spec.label })),
        UNSURE_OPTION,
      ];
  }
}

export function promptOf(facts: Facts): string {
  switch (facts.kind) {
    case "series":
      return `คุณรู้จักการ์ตูนเรื่อง "${facts.title}" ไหม?`;
    case "film":
      return `คุณเคยดูการ์ตูนเรื่อง "${facts.title}" ไหม?`;
    case "choice":
      return facts.prompt;
  }
}

/** Interpolates anchors at one age: linear between anchors, flat beyond the ends. */
export function anchorAt(anchors: Anchors, age: number): number {
  const points = Object.entries(anchors)
    .map(([a, p]) => [Number(a), p as number] as const)
    .sort((x, y) => x[0] - y[0]);
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return 0;
  if (age <= first[0]) return first[1];
  if (age >= last[0]) return last[1];
  for (let i = 1; i < points.length; i++) {
    const [a1, p1] = points[i]!;
    const [a0, p0] = points[i - 1]!;
    if (age <= a1) return p0 + ((p1 - p0) * (age - a0)) / (a1 - a0);
  }
  return last[1];
}

export type BankPart = { readonly [id: string]: Facts };

type Merge<P extends readonly BankPart[]> = P extends readonly [
  infer H extends BankPart,
  ...infer T extends readonly BankPart[],
]
  ? H & Merge<T>
  : unknown;

export interface Bank<B> {
  /** Typed lookup by id, for personas. */
  readonly facts: B;
  /** Every question with its id, in a stable order. Engines are built from this. */
  readonly list: readonly Question[];
}

export class BankError extends Error {
  constructor(readonly issues: readonly string[]) {
    super(`invalid question bank:\n  ${issues.join("\n  ")}`);
    this.name = "BankError";
  }
}

const endYear = (to: Year | "now"): number => (to === "now" ? BANK_YEAR : to);

function runIssues(id: string, run: Run): string[] {
  const issues: string[] = [];
  const end = endYear(run.to);
  if (run.from > end) issues.push(`${id}: run on ${run.on} starts ${run.from}, after it ends ${end}`);
  const outlet: { from: number; to?: number } = OUTLETS[run.on];
  if (run.from < outlet.from || (outlet.to !== undefined && end > outlet.to)) {
    issues.push(
      `${id}: run on ${run.on} ${run.from}–${end} is outside the years ${run.on} operated (${outlet.from}–${outlet.to ?? "now"})`,
    );
  }
  return issues;
}

function factIssues(id: string, facts: Facts): string[] {
  const issues: string[] = [];
  if (facts.kind === "series") for (const run of facts.runs) issues.push(...runIssues(id, run));
  if (facts.kind === "film") for (const run of facts.later) issues.push(...runIssues(id, run));
  if (facts.kind === "choice") {
    for (const [key, spec] of Object.entries(facts.choices)) {
      if (spec.years[0] > endYear(spec.years[1])) issues.push(`${id}.${key}: years run backwards`);
      if (spec.share !== undefined && !(spec.share > 0)) issues.push(`${id}.${key}: share must be above 0`);
    }
    if (Object.keys(facts.choices).length < 2) issues.push(`${id}: a choice question needs at least 2 choices`);
  }
  const override: Readonly<Record<string, Anchors | undefined>> = facts.override ?? {};
  for (const age of AGES) {
    const sum = Object.values(override).reduce((s, anchors) => s + (anchors ? anchorAt(anchors, age) : 0), 0);
    if (sum > 1) issues.push(`${id}: override sums to ${sum.toFixed(3)} at age ${age}, above 1`);
  }
  for (const anchors of Object.values(override)) {
    for (const p of Object.values(anchors ?? {})) {
      if (!(p >= 0 && p <= 1)) issues.push(`${id}: override probability ${p} is outside 0–1`);
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
      seen.add(id);
      issues.push(...factIssues(id, facts));
      list.push({ ...facts, id });
    }
  }
  if (issues.length > 0) throw new BankError(issues);
  return { facts: Object.assign({}, ...parts) as Merge<P>, list: Object.freeze(list) };
}

export type QuestionIdOf<B> = keyof B & string;
export type AnswerOfId<B, Id extends keyof B> = B[Id] extends Facts ? AnswerKeyOf<B[Id]> : never;
/** A recorded set of answers, each one checked against its own question's answer keys. */
export type AnswersFor<B> = { readonly [Id in QuestionIdOf<B>]?: AnswerOfId<B, Id> };
