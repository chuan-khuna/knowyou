/**
 * A play of a quiz is an immutable value: its count, its seed and the answer
 * keys so far. Every other field is derived from those by `advance`, so a play
 * replays exactly and a saved record needs nothing else.
 */

import { bandFor, type ScoreBand } from "./bands";
import { termsIn, type Gloss, type PromptTerm } from "./glosses";
import { TIERS, type QuestionBank, type Tier } from "./question";

/** The count a play asks when none is given, and the scale the score bands are written for. */
export const QUESTIONS_PER_PLAY = 20;
/** The fewest questions a play may ask. The most is the bank's size. */
export const MIN_QUESTIONS_PER_PLAY = 5;

const SLOTS = ["a", "b", "c", "d"] as const;

export interface QuizOption {
  /** `<question id>:<slot>`, so a saved key never replays onto a different question. */
  readonly key: string;
  readonly label: string;
  /** The original and English names, shown under a Japanese technique name. */
  readonly gloss?: Gloss;
}

export interface QuizCard {
  readonly id: string;
  readonly tier: Tier;
  /** 1-based. */
  readonly number: number;
  readonly prompt: string;
  /** The glossary terms the prompt names, such as a move, shown with their original names under it. */
  readonly terms: readonly PromptTerm[];
  readonly options: readonly QuizOption[];
}

export interface AnsweredQuizQuestion {
  readonly question: QuizCard;
  readonly rightKey: string;
  readonly chosenKey: string;
  readonly correct: boolean;
  readonly note?: string;
  readonly source: string;
}

interface QuizPlayBase {
  /** How many questions this play asks, from MIN_QUESTIONS_PER_PLAY to the bank's size. */
  readonly total: number;
  readonly seed: number;
  readonly answerKeys: readonly string[];
  /** One entry per answer, in order. The last one is the answer just given. */
  readonly answered: readonly AnsweredQuizQuestion[];
  readonly score: number;
}

export interface AskingQuizPlay extends QuizPlayBase {
  readonly phase: "asking";
  readonly question: QuizCard;
}

export interface FinishedQuizPlay extends QuizPlayBase {
  readonly phase: "finished";
  /** The fan title, for the score scaled to a score out of QUESTIONS_PER_PLAY. */
  readonly band: ScoreBand;
}

export type QuizPlay = AskingQuizPlay | FinishedQuizPlay;

/** One title's quiz as data. A title module builds it from its JSON files and its score bands. */
export interface QuizContent {
  /** The title's route slug, such as "prince-of-tennis". It also names the saved play. */
  readonly id: string;
  readonly bank: QuestionBank;
  /** Keyed by the exact option label. */
  readonly glosses: Readonly<Record<string, Gloss>>;
  /** Lowest first, covering 0 to QUESTIONS_PER_PLAY with no gap or overlap. */
  readonly bands: readonly ScoreBand[];
}

export interface Quiz extends QuizContent {
  /** How many questions the bank holds: the longest play. */
  readonly size: number;
  /** Throws if `count` is not a whole number from MIN_QUESTIONS_PER_PLAY to `size`. Defaults to QUESTIONS_PER_PLAY. */
  start(seed: number, count?: number): AskingQuizPlay;
  /** Throws if `optionKey` is not one of the current question's options. */
  answer(play: AskingQuizPlay, optionKey: string): QuizPlay;
}

interface DrawnQuestion {
  readonly card: QuizCard;
  readonly rightKey: string;
  readonly note?: string;
  readonly source: string;
}

export function createQuiz(content: QuizContent): Quiz {
  const { bank, glosses, bands } = content;
  // Sorted by id, so a seed draws the same play however the bank file is ordered.
  const byTier = TIERS.map((tier) =>
    Object.keys(bank)
      .filter((id) => bank[id]!.tier === tier)
      .sort(),
  );
  const size = byTier.reduce((sum, ids) => sum + ids.length, 0);
  // A default play deals 5 per tier, so every tier needs at least that many.
  const perTier = QUESTIONS_PER_PLAY / TIERS.length;
  for (const [i, ids] of byTier.entries()) {
    if (ids.length < perTier) {
      throw new Error(`tier ${TIERS[i]} has ${ids.length} questions, a play needs ${perTier}`);
    }
  }

  // Segmenting Thai is slow next to a draw, so each prompt is read once.
  const promptTerms = new Map<string, readonly PromptTerm[]>();
  const termsOf = (id: string) => {
    let terms = promptTerms.get(id);
    if (!terms) promptTerms.set(id, (terms = termsIn(bank[id]!.prompt, glosses)));
    return terms;
  };

  const draw = (seed: number, count: number): readonly DrawnQuestion[] => {
    const random = rng(seed);
    const takes = deal(count, byTier.map((ids) => ids.length));
    // Every tier is shuffled whole, so the generator moves on the same way whatever the count.
    const ids = byTier.flatMap((tierIds, i) => shuffle(tierIds, random).slice(0, takes[i]));
    return ids.map((id, i) => {
      const q = bank[id]!;
      const labels = shuffle([q.answer, ...q.decoys], random);
      const options = labels.map((label, slot) => {
        const gloss = glosses[label];
        return { key: `${id}:${SLOTS[slot]}`, label, ...(gloss === undefined ? {} : { gloss }) };
      });
      return {
        card: { id, tier: q.tier, number: i + 1, prompt: q.prompt, terms: termsOf(id), options },
        rightKey: options[labels.indexOf(q.answer)]!.key,
        ...(q.note === undefined ? {} : { note: q.note }),
        source: q.source,
      };
    });
  };

  const advance = (count: number, seed: number, answerKeys: readonly string[]): QuizPlay => {
    const drawn = draw(seed, count);
    const answered = answerKeys.map((chosenKey, i): AnsweredQuizQuestion => {
      const { card, rightKey, note, source } = drawn[i]!;
      return {
        question: card,
        rightKey,
        chosenKey,
        correct: chosenKey === rightKey,
        ...(note === undefined ? {} : { note }),
        source,
      };
    });
    const score = answered.filter((a) => a.correct).length;
    const base = { total: drawn.length, seed, answerKeys, answered, score };
    const next = drawn[answerKeys.length];
    if (next) return { ...base, phase: "asking", question: next.card };
    return { ...base, phase: "finished", band: bandFor(bands, Math.round((score * QUESTIONS_PER_PLAY) / drawn.length)) };
  };

  return {
    id: content.id,
    bank,
    glosses,
    bands,
    size,
    start: (seed, count = QUESTIONS_PER_PLAY) => {
      if (!Number.isInteger(count) || count < MIN_QUESTIONS_PER_PLAY || count > size) {
        throw new Error(`a play asks ${MIN_QUESTIONS_PER_PLAY} to ${size} questions, not ${count}`);
      }
      return advance(count, seed, []) as AskingQuizPlay;
    },
    answer: (play, optionKey) => {
      if (play.phase !== "asking") throw new Error("the quiz is finished");
      if (!play.question.options.some((o) => o.key === optionKey)) {
        throw new Error(`"${optionKey}" is not an option of question ${play.question.number}`);
      }
      return advance(play.total, play.seed, [...play.answerKeys, optionKey]);
    },
  };
}

/**
 * Deals `count` round-robin over the tiers, easiest first, skipping a tier
 * that has run out: 20 gives 5 each, 50 gives 13, 13, 12, 12.
 */
function deal(count: number, sizes: readonly number[]): number[] {
  const takes = sizes.map(() => 0);
  for (let left = count; left > 0; ) {
    for (let i = 0; i < sizes.length && left > 0; i++) {
      if (takes[i]! < sizes[i]!) {
        takes[i]!++;
        left--;
      }
    }
  }
  return takes;
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** mulberry32, seeded through a 32-bit mix so nearby seeds draw unrelated plays. */
function rng(seed: number): () => number {
  let a = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  a ^= a >>> 16;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
