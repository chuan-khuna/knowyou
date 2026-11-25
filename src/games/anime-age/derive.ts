/**
 * The derivation model: question facts to P(answer | age) for ages 10–50.
 *
 * `curve(question)` is the only source of answer probabilities. The engine
 * compiles it, and simulated players and the curve preview read the engine's
 * compiled copy. Every tuning knob is one named table below; personas exist to
 * correct them.
 */

import {
  AGE_COUNT,
  BANK_YEAR,
  MIN_AGE,
  answerOptions,
  anchorAt,
  type Anchors,
  type Audience,
  type ChoiceFacts,
  type FilmFacts,
  type LifeStage,
  type Outlet,
  type PickFacts,
  type Question,
  type Reach,
  type Run,
  type SeriesFacts,
} from "./schema";

/** One answer's curve. `p[i]` is P(this answer | age MIN_AGE + i). */
export interface AnswerLine {
  readonly key: string;
  readonly label: string;
  readonly p: readonly number[];
}

/** At every age the answers' `p` values sum to 1 and are all above 0. */
export interface AnswerCurve {
  readonly id: string;
  readonly answers: readonly AnswerLine[];
}

type Piecewise = readonly (readonly [x: number, y: number])[];

/** How receptive a person aged t is to a title made for each audience. */
const RECEPTIVITY: Record<Audience, Piecewise> = {
  kids: [[3, 0], [5, 0.7], [6, 1], [11, 1], [13, 0.5], [16, 0.15], [25, 0.06]],
  teens: [[7, 0], [10, 0.4], [13, 1], [20, 1], [25, 0.45], [32, 0.15]],
  general: [[4, 0], [7, 0.6], [10, 1], [28, 1], [40, 0.5]],
  adults: [[12, 0], [16, 0.6], [19, 1], [40, 1]],
};

/** Share of Thai households that could and did watch each outlet, by year. */
const ACCESS: Record<Outlet, Piecewise> = {
  ch3: [[1970, 1]],
  ch5: [[1970, 0.9]],
  ch7: [[1970, 1]],
  ch9: [[1970, 1]],
  tpbs: [[2008, 0.6]],
  itv: [[1996, 0.6], [2000, 0.85]],
  "digital-tv": [[2014, 0.4], [2018, 0.6]],
  cable: [[1995, 0.15], [2005, 0.3], [2015, 0.35], [2022, 0.2]],
  "home-video": [[1988, 0.3], [1998, 0.5], [2008, 0.4], [2014, 0.1]],
  web: [[2006, 0.15], [2012, 0.7], [2020, 0.8]],
  streaming: [[2016, 0.1], [2021, 0.7]],
};

/**
 * Per reach level: C is the share of a receptive cohort that ever watches, D the
 * share of watchers who watched a lot, F name recognition among non-watchers,
 * and T the years a name stays in the culture after its last run. An infinite
 * tail is a classic everyone has heard of.
 */
const REACH: Record<Reach, { C: number; D: number; F: number; T: number }> = {
  phenomenon: { C: 0.92, D: 0.65, F: 0.85, T: Infinity },
  hit: { C: 0.65, D: 0.5, F: 0.45, T: 10 },
  known: { C: 0.35, D: 0.4, F: 0.15, T: 5 },
  niche: { C: 0.12, D: 0.4, F: 0.03, T: 2 },
};

/** Per-year chance that a fully receptive person with full access starts watching. */
const HAZARD = 0.35;

/** Share of people aged t with a child aged about 4–11 at home. */
const PARENTHOOD: Piecewise = [[22, 0], [27, 0.35], [33, 0.55], [42, 0.45], [50, 0.15], [58, 0.05]];
/** How much a title's audience reaches the parents of its viewers. */
const PARENT_PULL: Record<Audience, number> = { kids: 1, general: 0.5, teens: 0.25, adults: 0 };
/** Share of parent awareness that is co-viewing rather than name only. */
const COVIEW = 0.25;
/** How far a film's cinema release reaches parents, compared with a free-TV run. */
const CINEMA_PARENT_ACCESS = 0.5;

/** Chance a person aged t at release went to the cinema for a film aimed at them. */
const CINEMA_GOING: Piecewise = [[4, 0], [6, 0.35], [11, 0.45], [14, 0.7], [30, 0.7], [40, 0.45], [50, 0.3]];

/** The ages each life stage asks about. */
const STAGE_AGES: Record<LifeStage, readonly [from: number, to: number]> = {
  primary: [6, 12],
  secondary: [13, 18],
  university: [18, 22],
};
/** Base "unsure" rate on a choice question, plus memory fade per year of age past 30. */
const UNSURE_BASE = 0.08;
const UNSURE_FADE = 0.004;
/** Prevalence of a choice one year either side of its years. */
const CHOICE_SHOULDER = 0.5;

/** Ages below this leave no memory that survives to answer a question. */
const MEMORY_AGE = 4;
/** Hearing a title's name needs this age at least. */
const FAME_AGE = 8;
/** Years of cultural presence that make a name fully famous. */
const FAME_YEARS = 6;

/**
 * Raw ages folded into the edge bins, with weights. Bin 10 means "10 or
 * younger" and bin 50 means "50 or older".
 */
export const LOW_EDGE: readonly (readonly [age: number, weight: number])[] = [[7, 0.1], [8, 0.2], [9, 0.3], [10, 0.4]];
export const HIGH_EDGE: readonly (readonly [age: number, weight: number])[] = [
  [50, 0.2], [51, 0.17], [52, 0.15], [53, 0.12], [54, 0.1], [55, 0.09], [56, 0.07], [57, 0.06], [58, 0.04],
];

/** Gaussian smoothing across neighbouring ages, in years. */
const SIGMA = 1;
/** Uniform mixture weight: careless or misremembered answers. */
const FLOOR = 0.04;

export function curve(question: Question): AnswerCurve {
  const options = answerOptions(question);
  const rawAt = (x: number): number[] => {
    switch (question.kind) {
      case "series":
        return seriesAt(question, x);
      case "film":
        return filmAt(question, x);
      case "choice":
        return choiceAt(question, x);
      case "pick":
        return pickAt(question, x);
    }
  };
  let rows = edgeBins(rawAt);
  rows = smooth(rows, SIGMA);
  if (question.override) rows = applyOverride(rows, options, question.override);
  rows = floor(rows, FLOOR);
  return {
    id: question.id,
    answers: options.map((option, j) => ({ ...option, p: rows.map((row) => row[j]!) })),
  };
}

function at(curve: Piecewise, x: number): number {
  const first = curve[0]!;
  const last = curve[curve.length - 1]!;
  if (x <= first[0]) return first[1];
  if (x >= last[0]) return last[1];
  for (let i = 1; i < curve.length; i++) {
    const [x1, y1] = curve[i]!;
    const [x0, y0] = curve[i - 1]!;
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return last[1];
}

const endOf = (run: Run): number => (run.to === "now" ? BANK_YEAR : run.to);

/** Calendar years, inclusive. */
type Years = readonly [from: number, to: number];
const ALL_YEARS: Years = [-Infinity, Infinity];

/**
 * Opportunity to watch over some runs, and the strongest single year, for
 * someone born in `born`, counting only the years inside `within`.
 */
function exposure(
  runs: readonly Run[],
  audience: Audience,
  born: number,
  within: Years = ALL_YEARS,
): { opportunity: number; peak: number } {
  const byYear = new Map<number, number>();
  for (const run of runs) {
    const from = Math.max(run.from, born + MEMORY_AGE, within[0]);
    const to = Math.min(endOf(run), BANK_YEAR, within[1]);
    for (let y = from; y <= to; y++) {
      const e = at(ACCESS[run.on], y) * at(RECEPTIVITY[audience], y - born);
      byYear.set(y, Math.max(byYear.get(y) ?? 0, e));
    }
  }
  let miss = 1;
  let peak = 0;
  for (const e of byYear.values()) {
    miss *= 1 - HAZARD * e;
    peak = Math.max(peak, e);
  }
  return { opportunity: 1 - miss, peak };
}

/** Name recognition from cultural presence, and from being the parent of a viewer. */
function awareness(
  spans: readonly { from: number; to: number; access: number }[],
  audience: Audience,
  reach: Reach,
  born: number,
): { fame: number; parent: number } {
  const { C, F, T } = REACH[reach];
  const first = Math.min(...spans.map((s) => s.from));
  const last = Math.min(BANK_YEAR, Math.max(...spans.map((s) => s.to)) + T);
  let presence = 0;
  for (let y = Math.max(first, born + FAME_AGE); y <= last; y++) presence++;
  let parentAccess = 0;
  for (const s of spans) {
    for (let y = s.from; y <= Math.min(s.to, BANK_YEAR); y++) {
      parentAccess = Math.max(parentAccess, s.access * at(PARENTHOOD, y - born));
    }
  }
  return {
    fame: F * Math.min(1, presence / FAME_YEARS),
    parent: C * PARENT_PULL[audience] * parentAccess,
  };
}

const runSpan = (run: Run) => ({ from: run.from, to: endOf(run), access: Math.max(...ACCESS[run.on].map((p) => p[1])) });

/** Chance someone born in `born` watched a series during `within`, and their strongest year. */
function seriesViewing(facts: SeriesFacts, born: number, within: Years = ALL_YEARS): { watched: number; peak: number } {
  const { opportunity, peak } = exposure(facts.runs, facts.audience, born, within);
  return { watched: REACH[facts.reach].C * opportunity, peak };
}

/** Chance someone born in `born` saw a film in the cinema, or later at home, during `within`. */
function filmViewing(facts: FilmFacts, born: number, within: Years = ALL_YEARS): { cinema: number; screen: number } {
  const { C } = REACH[facts.reach];
  const ageAtRelease = facts.released - born;
  const released = facts.released >= within[0] && facts.released <= within[1];
  const cinema = released ? C * at(RECEPTIVITY[facts.audience], ageAtRelease) * at(CINEMA_GOING, ageAtRelease) : 0;
  const screen = (C - cinema) * exposure(facts.later, facts.audience, born, within).opportunity;
  return { cinema, screen };
}

/** Answers in order [lot, seen, name, none]. */
function seriesAt(facts: SeriesFacts, x: number): number[] {
  const born = BANK_YEAR - x;
  const { watched, peak } = seriesViewing(facts, born);
  const { fame, parent } = awareness(facts.runs.map(runSpan), facts.audience, facts.reach, born);
  const lot = watched * REACH[facts.reach].D * peak;
  const know = 1 - (1 - watched) * (1 - fame) * (1 - parent);
  const seen = watched - lot + COVIEW * parent * (1 - watched);
  return [lot, seen, know - lot - seen, 1 - know];
}

/** Answers in order [cinema, screen, name, none]. */
function filmAt(facts: FilmFacts, x: number): number[] {
  const born = BANK_YEAR - x;
  const { cinema, screen } = filmViewing(facts, born);
  const spans = [
    { from: facts.released, to: facts.released, access: CINEMA_PARENT_ACCESS },
    ...facts.later.map(runSpan),
  ];
  const { fame, parent } = awareness(spans, facts.audience, facts.reach, born);
  const watched = cinema + screen;
  const know = 1 - (1 - watched) * (1 - fame) * (1 - parent);
  return [cinema, screen, know - watched, 1 - know];
}

/**
 * The calendar years of a life stage for someone born in `born`, and the chance
 * they answer "unsure": a base rate, memory fade with age, and the part of the
 * stage they haven't lived yet.
 */
function stage(lifeStage: LifeStage, x: number): { years: Years; lived: number; unsure: number } {
  const born = BANK_YEAR - x;
  const [w0, w1] = STAGE_AGES[lifeStage];
  const years: Years = [born + w0, Math.min(born + w1, BANK_YEAR)];
  const lived = Math.max(0, years[1] - years[0] + 1) / (w1 - w0 + 1);
  const base = UNSURE_BASE + UNSURE_FADE * Math.max(0, x - 30);
  return { years, lived, unsure: base + (1 - base) * (1 - lived) };
}

/** Answers in order [...choices, unsure]. */
function choiceAt(facts: ChoiceFacts, x: number): number[] {
  const { years, unsure } = stage(facts.stage, x);
  const span = years[1] - years[0] + 1;
  const weights = Object.values(facts.choices).map((spec) => {
    if (span <= 0) return 0;
    const start = spec.years[0];
    const end = spec.years[1] === "now" ? BANK_YEAR : spec.years[1];
    const prevalence = (y: number) =>
      y >= start && y <= end ? 1 : y === start - 1 || y === end + 1 ? CHOICE_SHOULDER : 0;
    let sum = 0;
    for (let y = years[0]; y <= years[1]; y++) sum += prevalence(y);
    return ((spec.share ?? 1) * sum) / span;
  });
  const total = weights.reduce((s, w) => s + w, 0);
  const known = weights.map((w) => (total > 0 ? ((1 - unsure) * w) / total : (1 - unsure) / weights.length));
  return [...known, unsure];
}

/**
 * Answers in order [...titles, neither, unsure]. Each title's weight is the
 * chance it was watched during the stage, from that title's own facts;
 * "neither" is the chance none of the three was.
 */
function pickAt(facts: PickFacts, x: number): number[] {
  const born = BANK_YEAR - x;
  const { years, unsure } = stage(facts.stage, x);
  const watched = facts.sources.map((source) => {
    if (source.kind === "series") return seriesViewing(source, born, years).watched;
    const { cinema, screen } = filmViewing(source, born, years);
    return cinema + screen;
  });
  const neither = watched.reduce((miss, w) => miss * (1 - w), 1);
  const total = watched.reduce((s, w) => s + w, 0);
  const titles = watched.map((w) => (total > 0 ? ((1 - unsure) * (1 - neither) * w) / total : 0));
  return [...titles, (1 - unsure) * neither, unsure];
}

function mix(rows: readonly (readonly [number[], number])[]): number[] {
  const total = rows.reduce((s, [, w]) => s + w, 0);
  const out = rows[0]![0].map(() => 0);
  for (const [row, w] of rows) row.forEach((p, j) => (out[j]! += (p * w) / total));
  return out;
}

function edgeBins(rawAt: (x: number) => number[]): number[][] {
  return Array.from({ length: AGE_COUNT }, (_, i) => {
    if (i === 0) return mix(LOW_EDGE.map(([age, w]) => [rawAt(age), w] as const));
    if (i === AGE_COUNT - 1) return mix(HIGH_EDGE.map(([age, w]) => [rawAt(age), w] as const));
    return rawAt(MIN_AGE + i);
  });
}

function smooth(rows: readonly number[][], sigma: number): number[][] {
  const reach = Math.ceil(3 * sigma);
  return rows.map((_, i) => {
    const neighbours: (readonly [number[], number])[] = [];
    for (let d = -reach; d <= reach; d++) {
      const row = rows[i + d];
      if (row) neighbours.push([row, Math.exp(-(d * d) / (2 * sigma * sigma))]);
    }
    return mix(neighbours);
  });
}

function applyOverride(
  rows: readonly number[][],
  options: readonly { key: string }[],
  override: Readonly<Record<string, Anchors | undefined>>,
): number[][] {
  return rows.map((row, i) => {
    const age = MIN_AGE + i;
    const fixed = options.map(({ key }) => {
      const anchors = override[key];
      return anchors ? anchorAt(anchors, age) : null;
    });
    const fixedSum = fixed.reduce<number>((s, p) => s + (p ?? 0), 0);
    const freeSum = row.reduce((s, p, j) => s + (fixed[j] === null ? p : 0), 0);
    const freeCount = fixed.filter((p) => p === null).length;
    return row.map((p, j) => {
      const pinned = fixed[j];
      if (pinned !== null && pinned !== undefined) return pinned;
      return freeSum > 0 ? (p * (1 - fixedSum)) / freeSum : (1 - fixedSum) / freeCount;
    });
  });
}

function floor(rows: readonly number[][], epsilon: number): number[][] {
  return rows.map((row) => row.map((p) => (1 - epsilon) * p + epsilon / row.length));
}
