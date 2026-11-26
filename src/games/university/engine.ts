import type { AnsweredQuestion, AnswerOption, AskingPlay, Engine, FinishedPlay, Play, QuestionCard } from "../engine";
import { pickRows, rowsFor, type Rows } from "./derive";
import { UNIVERSITY_COUNT, UNIVERSITY_IDS, isUniversityId, type UniversityId } from "./ids";
import { UNIVERSITIES } from "./universities";
import { UNSURE_OPTION, answerOptions, type Question } from "./schema";

export const UNIVERSITY_RULES = {
  minQuestions: 12,
  maxQuestions: 24,
  confidenceTarget: 0.95,
  /** Best expected information gain, in bits, below which no question is worth asking. */
  minUsefulGain: 0.02,
  /** Question choice samples among at most this many of the best questions... */
  shortlist: 3,
  /** ...that reach this share of the best gain... */
  shortlistFloor: 0.7,
  /** ...weighted by exp((gain − best) / (temperature × best)). */
  temperature: 0.15,
  /** Pick questions start once this many answers have narrowed things down. */
  picksAfter: 4,
  picksPerPlay: 4,
  /** A pick question names this many front-runners' signatures. */
  pickOwners: 4,
  /** How many candidates the result lists. */
  topCandidates: 3,
  /** How many answers the result shows as pointing hardest at the guess. */
  pointers: 2,
} as const;

export const PICK_PROMPT = "อันไหนคุ้นที่สุดสำหรับมหาวิทยาลัยของคุณ?";
const NONE_OPTION = { key: "none", label: "ไม่มีอันไหนเลย" } as const;

export interface Candidate {
  readonly id: UniversityId;
  readonly name: string;
  /** 0 to 1. */
  readonly p: number;
}

export interface UniversityExtras {
  /** The final belief, in UNIVERSITY_IDS order. */
  readonly belief: readonly number[];
  /** The likeliest universities, best first. The first is the guess. */
  readonly top: readonly Candidate[];
  /** Indexes into `answers` of the answers that pointed hardest at the guess, strongest first. */
  readonly pointers: readonly number[];
}

export interface AnswerRows {
  readonly options: readonly AnswerOption[];
  /** P(each option | university), in option order. */
  at(university: UniversityId): readonly number[];
}

export interface UniversityEngine extends Engine<UniversityId, UniversityExtras> {
  /** The compiled P(answer | university) for a bank question or a pick question id. Throws on an unknown id. */
  answerRows(questionId: string): AnswerRows;
}

export type UniversityPlay = Play<UniversityId, UniversityExtras>;
export type FinishedUniversityPlay = FinishedPlay<UniversityId, UniversityExtras>;

export interface UniversityEngineOptions {
  /** Pick questions are built in play; a persona replay turns them off. */
  readonly picks?: boolean;
}

interface Compiled {
  readonly card: QuestionCard;
  readonly rows: Rows;
}

type Belief = Float64Array;

export const guessLabel = (id: UniversityId): string => `คุณเรียนที่${UNIVERSITIES[id].name}`;

export function createUniversityEngine(questions: readonly Question[], { picks = true }: UniversityEngineOptions = {}): UniversityEngine {
  const statics = questions.map(compileStatic);
  const byId = new Map(statics.map((c) => [c.card.id, c]));
  const pickCache = new Map<string, Compiled>();

  const lookup = (id: string): Compiled => {
    const found = byId.get(id) ?? (id.startsWith("pick:") ? decodePick(id, pickCache) : undefined);
    if (!found) throw new Error(`unknown question id "${id}"`);
    return found;
  };

  const beliefAfter = (answers: readonly AnsweredQuestion[], upTo = answers.length): Belief => {
    const belief = new Float64Array(UNIVERSITY_COUNT).fill(1 / UNIVERSITY_COUNT);
    for (const entry of answers.slice(0, upTo)) {
      const q = lookup(entry.questionId);
      const row = q.rows[q.card.options.findIndex((o) => o.key === entry.answerKey)]!;
      for (let i = 0; i < UNIVERSITY_COUNT; i++) belief[i]! *= row[i]!;
      normalize(belief);
    }
    return belief;
  };

  const advance = (seed: number, answers: readonly AnsweredQuestion[]): UniversityPlay => {
    const belief = beliefAfter(answers);
    const leader = argmax(belief);
    const confidence = belief[leader]!;
    const asked = answers.length;
    const askedIds = new Set(answers.map((a) => a.questionId));
    const rules = UNIVERSITY_RULES;

    const candidates = statics.filter((c) => !askedIds.has(c.card.id));
    const pickCount = answers.filter((a) => a.questionId.startsWith("pick:")).length;
    const lastWasPick = answers.at(-1)?.questionId.startsWith("pick:") ?? false;
    if (picks && asked >= rules.picksAfter && pickCount < rules.picksPerPlay && !lastWasPick) {
      const pick = buildPick(belief, answers, rngFor(seed ^ 0x2545f491, asked), pickCache);
      if (pick) candidates.push(pick);
    }

    const finish = (): FinishedUniversityPlay => {
      const pointers = pointersTo(leader, answers, lookup, beliefAfter);
      return {
        phase: "finished",
        seed,
        answers,
        confidence,
        questionsAsked: asked,
        guess: { value: UNIVERSITY_IDS[leader]!, label: guessLabel(UNIVERSITY_IDS[leader]!) },
        decidingAnswer: pointers[0] ?? null,
        extras: { belief: Array.from(belief), top: topCandidates(belief), pointers },
      };
    };

    if (asked >= rules.maxQuestions || candidates.length === 0) return finish();
    const gains = candidates.map((q) => expectedGain(belief, q.rows));
    const best = Math.max(...gains);
    if (asked >= rules.minQuestions && (confidence >= rules.confidenceTarget || best < rules.minUsefulGain)) return finish();
    const next = pickQuestion(candidates, gains, rngFor(seed, asked));
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
    answerRows(questionId: string): AnswerRows {
      const q = lookup(questionId);
      return {
        options: q.card.options,
        at: (university: UniversityId) => q.rows.map((row) => row[UNIVERSITY_IDS.indexOf(university)]!),
      };
    },
  };
}

function compileStatic(question: Question): Compiled {
  return {
    card: {
      id: question.id,
      prompt: question.prompt,
      ...(question.aside ? { subtitle: question.aside } : {}),
      options: answerOptions(question),
    },
    rows: rowsFor(question),
  };
}

function pickCard(owners: readonly { university: number; signature: number }[]): Compiled {
  const id = `pick:${owners.map((o) => `${UNIVERSITY_IDS[o.university]}.${o.signature}`).join("+")}`;
  const options: AnswerOption[] = [
    ...owners.map((o) => ({
      key: UNIVERSITY_IDS[o.university]!,
      label: UNIVERSITIES[UNIVERSITY_IDS[o.university]!].signatures[o.signature]!.label,
    })),
    NONE_OPTION,
    UNSURE_OPTION,
  ];
  return { card: { id, prompt: PICK_PROMPT, options }, rows: pickRows(owners.map((o) => o.university)) };
}

/** A pick question's id names its owners and signatures, so the id alone rebuilds it. */
function decodePick(id: string, cache: Map<string, Compiled>): Compiled | undefined {
  const cached = cache.get(id);
  if (cached) return cached;
  const owners: { university: number; signature: number }[] = [];
  for (const part of id.slice("pick:".length).split("+")) {
    const [universityId, index] = part.split(".");
    if (!isUniversityId(universityId)) return undefined;
    const signature = Number(index);
    if (!Number.isInteger(signature) || UNIVERSITIES[universityId].signatures[signature] === undefined) return undefined;
    owners.push({ university: UNIVERSITY_IDS.indexOf(universityId), signature });
  }
  if (owners.length < 2 || new Set(owners.map((o) => o.university)).size !== owners.length) return undefined;
  const compiled = pickCard(owners);
  if (compiled.card.id !== id) return undefined;
  cache.set(id, compiled);
  return compiled;
}

/**
 * A pick question from the front-runners' next unused signatures, in an order
 * shuffled by the play's seed and step, so the play stays reproducible.
 */
function buildPick(
  belief: Belief,
  answers: readonly AnsweredQuestion[],
  rng: () => number,
  cache: Map<string, Compiled>,
): Compiled | null {
  const used = new Array<number>(UNIVERSITY_COUNT).fill(0);
  for (const a of answers) {
    if (!a.questionId.startsWith("pick:")) continue;
    for (const part of a.questionId.slice(5).split("+")) used[UNIVERSITY_IDS.indexOf(part.split(".")[0] as UniversityId)]!++;
  }
  const order = Array.from(belief.keys())
    .sort((a, b) => belief[b]! - belief[a]! || a - b)
    .filter((u) => used[u]! < UNIVERSITIES[UNIVERSITY_IDS[u]!].signatures.length)
    .slice(0, UNIVERSITY_RULES.pickOwners);
  if (order.length < 3) return null;
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  const compiled = pickCard(order.map((university) => ({ university, signature: used[university]! })));
  cache.set(compiled.card.id, compiled);
  return compiled;
}

function normalize(belief: Belief): Belief {
  let total = 0;
  for (const p of belief) total += p;
  for (let i = 0; i < belief.length; i++) belief[i]! /= total;
  return belief;
}

function argmax(belief: Belief): number {
  let best = 0;
  for (let i = 1; i < belief.length; i++) if (belief[i]! > belief[best]!) best = i;
  return best;
}

function topCandidates(belief: Belief): readonly Candidate[] {
  return Array.from(belief.keys())
    .sort((a, b) => belief[b]! - belief[a]! || a - b)
    .slice(0, UNIVERSITY_RULES.topCandidates)
    .map((i) => ({ id: UNIVERSITY_IDS[i]!, name: UNIVERSITIES[UNIVERSITY_IDS[i]!].name, p: belief[i]! }));
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
function expectedGain(belief: Belief, rows: Rows): number {
  let after = 0;
  for (const row of rows) {
    let pAnswer = 0;
    for (let i = 0; i < UNIVERSITY_COUNT; i++) pAnswer += belief[i]! * row[i]!;
    let h = 0;
    for (let i = 0; i < UNIVERSITY_COUNT; i++) {
      const joint = belief[i]! * row[i]!;
      if (joint > 0) h -= joint * Math.log2(joint / pAnswer);
    }
    after += h;
  }
  return entropy(belief) - after;
}

/** Samples among the near-best questions, so plays vary but a clearly weaker question is never asked. */
function pickQuestion(candidates: readonly Compiled[], gains: readonly number[], rng: () => number): Compiled {
  const { shortlist, shortlistFloor, temperature } = UNIVERSITY_RULES;
  const best = Math.max(...gains);
  const ranked = candidates
    .map((q, i) => ({ q, gain: gains[i]! }))
    .filter((c) => c.gain >= shortlistFloor * best)
    .sort((a, b) => b.gain - a.gain || a.q.card.id.localeCompare(b.q.card.id))
    .slice(0, shortlist);
  if (ranked.length === 0) return candidates[0]!;
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

/**
 * The answers that pointed hardest at the guess: how much each one raised the
 * guess's odds against the average university still in the running then.
 */
function pointersTo(
  guess: number,
  answers: readonly AnsweredQuestion[],
  lookup: (id: string) => Compiled,
  beliefAfter: (answers: readonly AnsweredQuestion[], upTo: number) => Belief,
): readonly number[] {
  return answers
    .map((a, i) => {
      const q = lookup(a.questionId);
      const row = q.rows[q.card.options.findIndex((o) => o.key === a.answerKey)]!;
      const before = beliefAfter(answers, i);
      let average = 0;
      for (let u = 0; u < UNIVERSITY_COUNT; u++) average += before[u]! * row[u]!;
      return { i, lift: Math.log(row[guess]! / average) };
    })
    .filter((x) => x.lift > 0)
    .sort((a, b) => b.lift - a.lift || a.i - b.i)
    .slice(0, UNIVERSITY_RULES.pointers)
    .map((x) => x.i);
}
