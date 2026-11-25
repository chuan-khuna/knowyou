/**
 * A play of the quiz is an immutable value: its mode, its seed and the answer
 * keys so far. Every other field is derived from those by `advance`, so a play
 * replays exactly and a saved record needs nothing else.
 */

import { bandFor, type ScoreBand } from "./bands";
import { GLOSSES, type Gloss } from "./glosses";
import { TIERS, type QuestionBank, type Tier } from "./question";

export const QUESTIONS_PER_TIER = 5;
export const QUESTIONS_PER_PLAY = QUESTIONS_PER_TIER * TIERS.length;

/** `standard` draws 5 questions per tier; `all` asks the whole bank. Both go easiest tier first. */
export const QUIZ_MODES = ["standard", "all"] as const;
export type QuizMode = (typeof QUIZ_MODES)[number];

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
  readonly mode: QuizMode;
  readonly seed: number;
  /** How many questions this play asks. */
  readonly total: number;
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
  /** The fan title; only a standard play has one. */
  readonly band: ScoreBand | null;
}

export type QuizPlay = AskingQuizPlay | FinishedQuizPlay;

export interface Quiz {
  start(seed: number, mode?: QuizMode): AskingQuizPlay;
  /** Throws if `optionKey` is not one of the current question's options. */
  answer(play: AskingQuizPlay, optionKey: string): QuizPlay;
}

interface DrawnQuestion {
  readonly card: QuizCard;
  readonly rightKey: string;
  readonly note?: string;
  readonly source: string;
}

export function createQuiz(bank: QuestionBank): Quiz {
  // Sorted by id, so a seed draws the same play however the bank file is ordered.
  const byTier = TIERS.map((tier) =>
    Object.keys(bank)
      .filter((id) => bank[id]!.tier === tier)
      .sort(),
  );
  for (const [i, ids] of byTier.entries()) {
    if (ids.length < QUESTIONS_PER_TIER) {
      throw new Error(`tier ${TIERS[i]} has ${ids.length} questions, a play needs ${QUESTIONS_PER_TIER}`);
    }
  }

  const draw = (seed: number, mode: QuizMode): readonly DrawnQuestion[] => {
    const random = rng(seed);
    const take = mode === "all" ? Infinity : QUESTIONS_PER_TIER;
    const ids = byTier.flatMap((tierIds) => shuffle(tierIds, random).slice(0, take));
    return ids.map((id, i) => {
      const q = bank[id]!;
      const labels = shuffle([q.answer, ...q.decoys], random);
      const options = labels.map((label, slot) => {
        const gloss = GLOSSES[label];
        return { key: `${id}:${SLOTS[slot]}`, label, ...(gloss === undefined ? {} : { gloss }) };
      });
      return {
        card: { id, tier: q.tier, number: i + 1, prompt: q.prompt, options },
        rightKey: options[labels.indexOf(q.answer)]!.key,
        ...(q.note === undefined ? {} : { note: q.note }),
        source: q.source,
      };
    });
  };

  const advance = (mode: QuizMode, seed: number, answerKeys: readonly string[]): QuizPlay => {
    const drawn = draw(seed, mode);
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
    const base = { mode, seed, total: drawn.length, answerKeys, answered, score };
    const next = drawn[answerKeys.length];
    if (next) return { ...base, phase: "asking", question: next.card };
    return { ...base, phase: "finished", band: mode === "standard" ? bandFor(score) : null };
  };

  return {
    start: (seed, mode = "standard") => advance(mode, seed, []) as AskingQuizPlay,
    answer: (play, optionKey) => {
      if (play.phase !== "asking") throw new Error("the quiz is finished");
      if (!play.question.options.some((o) => o.key === optionKey)) {
        throw new Error(`"${optionKey}" is not an option of question ${play.question.number}`);
      }
      return advance(play.mode, play.seed, [...play.answerKeys, optionKey]);
    },
  };
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
