import type { AnsweredQuestion, AnswerOption, AskingPlay, Engine, FinishedPlay, Guess, Play, QuestionCard } from "../engine";
import { HIGH_EDGE, LOW_EDGE, curve } from "./derive";
import {
  AGE_COUNT,
  BANK_YEAR,
  MAX_AGE,
  MIN_AGE,
  answerOptions,
  promptOf,
  type Age,
  type Question,
  type Reach,
  type TitleQuestionFacts,
  type Year,
} from "./schema";

export type AgeGuessValue =
  | { readonly kind: "exact"; readonly age: Age }
  | { readonly kind: "atMost"; readonly age: 10 }
  | { readonly kind: "atLeast"; readonly age: 50 };

export interface EraBand {
  /** In พ.ศ. */
  readonly label: string;
  readonly from: Year | null;
  readonly to: Year | null;
}

export interface Stratum {
  readonly band: EraBand;
  /** 0 to 1: how much of this era's anime the player knew. */
  readonly knowledge: number;
  /**
   * "answered" comes from the player's own answers, "inferred" from the final
   * belief because none of the band's titles were asked, and "empty" means the
   * bank has no titles for the band.
   */
  readonly basis: "answered" | "inferred" | "empty";
  readonly samples: readonly string[];
}

export interface AnimeAgeExtras {
  /** Oldest band first, one per ERA_BANDS entry. */
  readonly strata: readonly Stratum[];
}

export interface AnswerCurves {
  readonly options: readonly AnswerOption[];
  /** P(each option | age), in option order. */
  at(age: Age): readonly number[];
}

export interface AnimeAgeEngine extends Engine<AgeGuessValue, AnimeAgeExtras> {
  /** The compiled P(answer | age) for one question, overrides included. Throws on an unknown id. */
  answerCurves(questionId: string): AnswerCurves;
}

export type AnimeAgePlay = Play<AgeGuessValue, AnimeAgeExtras>;
export type FinishedAnimeAgePlay = FinishedPlay<AgeGuessValue, AnimeAgeExtras>;

export const ANIME_AGE_RULES = {
  minQuestions: 12,
  maxQuestions: 45,
  confidenceTarget: 0.88,
  /** Best expected information gain, in bits, below which no question is worth asking. */
  minUsefulGain: 0.01,
  /** Gain multiplier per question already asked from the same franchise. */
  franchiseDiscount: 0.5,
  /** Question choice samples among at most this many of the best questions... */
  shortlist: 4,
  /** ...that reach this share of the best gain... */
  shortlistFloor: 0.6,
  /** ...weighted by exp((gain − best) / (temperature × best)). */
  temperature: 0.15,
} as const;

/** The prior over ages: flat with a gentle bump over the likely player base. */
const PRIOR_SHAPE: readonly (readonly [age: number, weight: number])[] = [
  [10, 1], [13, 1], [16, 1.6], [34, 1.6], [38, 1], [50, 1],
];

export const ERA_BANDS: readonly EraBand[] = [
  { label: "ก่อน 2539", from: null, to: 1995 },
  { label: "2539–2545", from: 1996, to: 2002 },
  { label: "2546–2552", from: 2003, to: 2009 },
  { label: "2553–2559", from: 2010, to: 2016 },
  { label: "2560–2564", from: 2017, to: 2021 },
  { label: "2565 ขึ้นไป", from: 2022, to: null },
];

/** Titles shown on air over more years than this carry no era signal for the strata. */
const STRATA_MAX_SPAN = 12;
const STRATA_SAMPLES = 3;

/** How well each answer means the player knew a title, for the memory strata. */
const FAMILIARITY: Readonly<Record<string, number>> = {
  lot: 1,
  cinema: 1,
  seen: 2 / 3,
  screen: 2 / 3,
  name: 1 / 3,
  none: 0,
};

const REACH_RANK: Record<Reach, number> = { phenomenon: 3, hit: 2, known: 1, niche: 0 };

type Belief = Float64Array;

interface Compiled {
  readonly question: Question;
  readonly card: QuestionCard;
  readonly rows: readonly Float64Array[];
  /** Questions about one title or franchise are correlated evidence. Undefined for picks. */
  readonly franchise: string | undefined;
  /** The title whose era a question counts toward: itself, or a cue's own title. */
  readonly era: TitleQuestionFacts | null;
  /** Index into ERA_BANDS, or null for questions outside the strata. */
  readonly band: number | null;
  readonly familiarity: readonly number[] | null;
}

/** A hit is within ±1 year. An edge guess hits every age on its side. */
export function isHit(guess: AgeGuessValue, trueAge: number): boolean {
  switch (guess.kind) {
    case "exact":
      return Math.abs(trueAge - guess.age) <= 1;
    case "atMost":
      return trueAge <= guess.age + 1;
    case "atLeast":
      return trueAge >= guess.age - 1;
  }
}

export function createAnimeAgeEngine(questions: readonly Question[]): AnimeAgeEngine {
  const compiled = questions.map(compile);
  const byId = new Map(compiled.map((c) => [c.question.id, c]));
  const prior = priorBelief();

  const lookup = (id: string): Compiled => {
    const found = byId.get(id);
    if (!found) throw new Error(`unknown question id "${id}"`);
    return found;
  };

  const beliefAfter = (answers: readonly AnsweredQuestion[], upTo = answers.length): Belief => {
    const belief = Float64Array.from(prior);
    for (const entry of answers.slice(0, upTo)) {
      const q = lookup(entry.questionId);
      const row = q.rows[q.card.options.findIndex((o) => o.key === entry.answerKey)]!;
      for (let i = 0; i < AGE_COUNT; i++) belief[i]! *= row[i]!;
      normalize(belief);
    }
    return belief;
  };

  const advance = (seed: number, answers: readonly AnsweredQuestion[]): AnimeAgePlay => {
    const belief = beliefAfter(answers);
    const { center, mass: confidence } = bestWindow(belief);
    const asked = answers.length;
    const askedIds = new Set(answers.map((a) => a.questionId));
    const remaining = compiled.filter((c) => !askedIds.has(c.question.id));
    const rules = ANIME_AGE_RULES;

    const finish = (): FinishedAnimeAgePlay => ({
      phase: "finished",
      seed,
      answers,
      confidence,
      questionsAsked: asked,
      guess: toGuess(center),
      decidingAnswer: decidingAnswer(answers, center, beliefAfter),
      extras: { strata: memoryStrata(compiled, answers, belief) },
    });

    if (asked >= rules.maxQuestions || remaining.length === 0) return finish();
    const franchiseCounts = new Map<string, number>();
    for (const a of answers) {
      const f = lookup(a.questionId).franchise;
      if (f) franchiseCounts.set(f, (franchiseCounts.get(f) ?? 0) + 1);
    }
    const raw = remaining.map((q) => expectedGain(belief, q));
    const bestRaw = Math.max(...raw);
    if (asked >= rules.minQuestions && (confidence >= rules.confidenceTarget || bestRaw < rules.minUsefulGain)) {
      return finish();
    }
    const gains = raw.map(
      (g, i) => g * rules.franchiseDiscount ** (franchiseCounts.get(remaining[i]!.franchise ?? "") ?? 0),
    );
    const next = pickQuestion(remaining, gains, rngFor(seed, asked));
    return { phase: "asking", seed, answers, confidence, questionNumber: asked + 1, question: next.card };
  };

  return {
    start: ({ seed }) => advance(seed, []),
    answer(play: AskingPlay, answerKey: string) {
      const option = play.question.options.find((o) => o.key === answerKey);
      if (!option) throw new Error(`"${answerKey}" is not an answer to ${play.question.id}`);
      const entry: AnsweredQuestion = {
        questionId: play.question.id,
        prompt: play.question.prompt,
        answerKey: option.key,
        answerLabel: option.label,
      };
      return advance(play.seed, [...play.answers, entry]);
    },
    answerCurves(questionId: string): AnswerCurves {
      const q = lookup(questionId);
      return {
        options: q.card.options,
        at: (age: Age) => q.rows.map((row) => row[age - MIN_AGE]!),
      };
    },
  };
}

function compile(question: Question): Compiled {
  const lines = curve(question).answers;
  const options = answerOptions(question);
  const card: QuestionCard = {
    id: question.id,
    prompt: promptOf(question),
    ...("aside" in question && question.aside ? { subtitle: question.aside } : {}),
    options,
  };
  const about = aboutTitle(question);
  return {
    question,
    card,
    rows: lines.map((line) => Float64Array.from(line.p)),
    franchise: about ? (about.facts.franchise ?? about.id) : undefined,
    era: about?.facts ?? null,
    band: about ? strataBand(about.facts) : null,
    familiarity:
      question.kind === "cue"
        ? options.map((o) => (o.key === question.from ? 1 : 0))
        : about
          ? options.map((o) => FAMILIARITY[o.key] ?? 0)
          : null,
  };
}

/** The one title a question is about: a title question itself, or a cue's own title. Picks span three. */
function aboutTitle(question: Question): { id: string; facts: TitleQuestionFacts } | null {
  switch (question.kind) {
    case "series":
    case "film":
      return { id: question.id, facts: question };
    case "cue":
      return { id: question.from, facts: question.sources[question.titles.indexOf(question.from)]! };
    case "pick":
      return null;
  }
}

function strataBand(question: TitleQuestionFacts): number | null {
  const spans =
    question.kind === "series"
      ? question.runs.map((r) => [r.from, r.to === "now" ? BANK_YEAR : r.to] as const)
      : [[question.released, question.released] as const];
  const first = Math.min(...spans.map((s) => s[0]));
  const last = Math.max(...spans.map((s) => s[1]));
  if (last - first + 1 > STRATA_MAX_SPAN) return null;
  return ERA_BANDS.findIndex((b) => (b.from === null || first >= b.from) && (b.to === null || first <= b.to));
}

function priorBelief(): Belief {
  const belief = new Float64Array(AGE_COUNT);
  for (let i = 0; i < AGE_COUNT; i++) {
    const age = MIN_AGE + i;
    const right = PRIOR_SHAPE.findIndex(([a]) => a >= age);
    const [a1, w1] = PRIOR_SHAPE[right]!;
    const [a0, w0] = PRIOR_SHAPE[Math.max(0, right - 1)]!;
    belief[i] = a1 === a0 ? w1 : w0 + ((w1 - w0) * (age - a0)) / (a1 - a0);
  }
  return normalize(belief);
}

function normalize(belief: Belief): Belief {
  let total = 0;
  for (const p of belief) total += p;
  for (let i = 0; i < belief.length; i++) belief[i]! /= total;
  return belief;
}

/**
 * The share of bin `age` that a guess centred on `center` would count as a hit.
 * The edge bins hold several real ages, so an exact guess next to an edge
 * covers only the part of the edge bin within one year of it.
 */
function coverage(center: number, age: number): number {
  if (Math.abs(center - age) > 1) return 0;
  if (age === MIN_AGE && center !== MIN_AGE) return edgeShare(LOW_EDGE, center);
  if (age === MAX_AGE && center !== MAX_AGE) return edgeShare(HIGH_EDGE, center);
  return 1;
}

function edgeShare(edge: readonly (readonly [number, number])[], center: number): number {
  const total = edge.reduce((s, [, w]) => s + w, 0);
  return edge.reduce((s, [a, w]) => s + (Math.abs(a - center) <= 1 ? w : 0), 0) / total;
}

function windowMass(belief: Belief, center: number): number {
  let mass = 0;
  for (let age = Math.max(MIN_AGE, center - 1); age <= Math.min(MAX_AGE, center + 1); age++) {
    mass += belief[age - MIN_AGE]! * coverage(center, age);
  }
  return mass;
}

/** The guess window with the most mass. That mass is the chance of a hit, so it is also the confidence. */
function bestWindow(belief: Belief): { center: Age; mass: number } {
  let center = MIN_AGE;
  let mass = -1;
  for (let c = MIN_AGE; c <= MAX_AGE; c++) {
    const m = windowMass(belief, c);
    if (m > mass) {
      mass = m;
      center = c;
    }
  }
  return { center: center as Age, mass };
}

function toGuess(center: Age): Guess<AgeGuessValue> {
  if (center === MIN_AGE) return { value: { kind: "atMost", age: 10 }, label: "ไม่เกิน 10 ปี" };
  if (center === MAX_AGE) return { value: { kind: "atLeast", age: 50 }, label: "50 ปีขึ้นไป" };
  return { value: { kind: "exact", age: center }, label: `คุณอายุ ${center} ปี` };
}

function entropy(belief: ArrayLike<number>): number {
  let h = 0;
  for (let i = 0; i < belief.length; i++) {
    const p = belief[i]!;
    if (p > 0) h -= p * Math.log2(p);
  }
  return h;
}

/** Expected information gain in bits: H(belief) − Σ P(answer) · H(belief | answer). */
function expectedGain(belief: Belief, q: Compiled): number {
  let after = 0;
  for (const row of q.rows) {
    let pAnswer = 0;
    for (let i = 0; i < AGE_COUNT; i++) pAnswer += belief[i]! * row[i]!;
    let h = 0;
    for (let i = 0; i < AGE_COUNT; i++) {
      const joint = belief[i]! * row[i]!;
      if (joint > 0) h -= joint * Math.log2(joint / pAnswer);
    }
    after += h;
  }
  return entropy(belief) - after;
}

/** Samples among the near-best questions, so plays vary but a clearly weaker question is never asked. */
function pickQuestion(remaining: readonly Compiled[], gains: readonly number[], rng: () => number): Compiled {
  const { shortlist, shortlistFloor, temperature } = ANIME_AGE_RULES;
  const best = Math.max(...gains);
  const ranked = remaining
    .map((q, i) => ({ q, gain: gains[i]! }))
    .filter((c) => c.gain >= shortlistFloor * best)
    .sort((a, b) => b.gain - a.gain || a.q.question.id.localeCompare(b.q.question.id))
    .slice(0, shortlist);
  if (ranked.length === 0) return remaining[0]!;
  const weights = ranked.map((c) => (best > 0 ? Math.exp((c.gain - best) / (temperature * best)) : 1));
  let r = rng() * weights.reduce((s, w) => s + w, 0);
  for (let i = 0; i < ranked.length; i++) {
    r -= weights[i]!;
    if (r < 0) return ranked[i]!.q;
  }
  return ranked[ranked.length - 1]!.q;
}

/** A fresh generator per step, so a play carries no generator state and replays exactly. */
function rngFor(seed: number, step: number): () => number {
  let a = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(step + 1, 0xc2b2ae35);
  a ^= a >>> 16;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The answer that raised the guess window's mass the most: the moment it clicked. */
function decidingAnswer(
  answers: readonly AnsweredQuestion[],
  center: Age,
  beliefAfter: (answers: readonly AnsweredQuestion[], upTo: number) => Belief,
): number | null {
  let best: number | null = null;
  let bestDelta = 0;
  let before = windowMass(beliefAfter(answers, 0), center);
  for (let i = 0; i < answers.length; i++) {
    const after = windowMass(beliefAfter(answers, i + 1), center);
    if (after - before > bestDelta) {
      bestDelta = after - before;
      best = i;
    }
    before = after;
  }
  return best;
}

const titleOf = (q: Compiled): string => q.era!.title;

function memoryStrata(
  compiled: readonly Compiled[],
  answers: readonly AnsweredQuestion[],
  belief: Belief,
): readonly Stratum[] {
  const answered = new Map(answers.map((a) => [a.questionId, a.answerKey]));
  const scoreOf = (q: Compiled, key: string) =>
    q.familiarity![q.card.options.findIndex((o) => o.key === key)] ?? 0;

  return ERA_BANDS.map((band, b) => {
    const titles = compiled.filter((q) => q.band === b);
    if (titles.length === 0) return { band, knowledge: 0, basis: "empty", samples: [] };
    const byReach = [...titles].sort(
      (x, y) => REACH_RANK[y.era!.reach] - REACH_RANK[x.era!.reach],
    );
    const asked = titles.filter((q) => answered.has(q.question.id));
    if (asked.length > 0) {
      const scored = asked
        .map((q) => ({ q, score: scoreOf(q, answered.get(q.question.id)!) }))
        .sort((x, y) => y.score - x.score);
      const knowledge = scored.reduce((s, x) => s + x.score, 0) / scored.length;
      const known = scored.filter((x) => x.score > 0).map((x) => titleOf(x.q));
      const samples = [...new Set([...known, ...byReach.map(titleOf)])].slice(0, STRATA_SAMPLES);
      return { band, knowledge, basis: "answered", samples };
    }
    let knowledge = 0;
    for (const q of titles) {
      for (let i = 0; i < AGE_COUNT; i++) {
        let expected = 0;
        q.rows.forEach((row, o) => (expected += row[i]! * q.familiarity![o]!));
        knowledge += (belief[i]! * expected) / titles.length;
      }
    }
    return { band, knowledge, basis: "inferred", samples: byReach.slice(0, STRATA_SAMPLES).map(titleOf) };
  });
}
