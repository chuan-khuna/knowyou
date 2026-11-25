/**
 * A play saved in the browser, so a refresh doesn't lose it. The same rules as
 * the games' `src/lib/play-record.ts`, without its Engine type: the record is
 * the seed and answer keys, and anything that doesn't replay is dropped.
 */

import type { Quiz, QuizPlay } from "./quiz";

export const QUIZ_RECORD_KEY = "knowyou:play:prince-of-tennis";

interface QuizRecord {
  readonly v: 1;
  readonly seed: number;
  readonly answerKeys: readonly string[];
}

export function encodeQuizRecord(play: QuizPlay): string {
  const record: QuizRecord = { v: 1, seed: play.seed, answerKeys: play.answerKeys };
  return JSON.stringify(record);
}

/** Rebuilds a saved play, or returns null when the record is missing, corrupt, or no longer replays on the bank. */
export function restoreQuiz(quiz: Quiz, raw: string | null): QuizPlay | null {
  if (raw === null) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const { v, seed, answerKeys } = value as Record<string, unknown>;
  if (v !== 1) return null;
  if (typeof seed !== "number" || !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) return null;
  if (!Array.isArray(answerKeys) || !answerKeys.every((k): k is string => typeof k === "string")) return null;

  let play: QuizPlay = quiz.start(seed);
  try {
    for (const key of answerKeys) {
      if (play.phase !== "asking") return null;
      play = quiz.answer(play, key);
    }
  } catch {
    return null;
  }
  return play;
}
