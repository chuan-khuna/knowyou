/**
 * A play saved in the browser, so a refresh doesn't lose it. The same rules as
 * the games' `src/lib/play-record.ts`, without its Engine type: the record is
 * the count, seed and answer keys, and anything that doesn't replay is dropped.
 */

import { QUESTIONS_PER_PLAY, type Quiz, type QuizPlay } from "./quiz";

/** The localStorage key for a title's saved play, such as `knowyou:play:prince-of-tennis`. */
export function quizRecordKey(quiz: Pick<Quiz, "id">): string {
  return `knowyou:play:${quiz.id}`;
}

/**
 * `count` is left out for a play of QUESTIONS_PER_PLAY, so a record saved
 * before counts existed still restores. Such a record may instead hold
 * `mode: "all"`, which meant the whole bank.
 */
interface QuizRecord {
  readonly v: 1;
  readonly count?: number;
  readonly seed: number;
  readonly answerKeys: readonly string[];
}

export function encodeQuizRecord(play: QuizPlay): string {
  const record: QuizRecord = {
    v: 1,
    ...(play.total === QUESTIONS_PER_PLAY ? {} : { count: play.total }),
    seed: play.seed,
    answerKeys: play.answerKeys,
  };
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
  const { v, mode = "standard", count = mode === "all" ? quiz.size : QUESTIONS_PER_PLAY, seed, answerKeys } = value as Record<string, unknown>;
  if (v !== 1) return null;
  if (mode !== "standard" && mode !== "all") return null;
  if (typeof count !== "number") return null;
  if (typeof seed !== "number" || !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) return null;
  if (!Array.isArray(answerKeys) || !answerKeys.every((k): k is string => typeof k === "string")) return null;

  let play: QuizPlay;
  try {
    play = quiz.start(seed, count);
    for (const key of answerKeys) {
      if (play.phase !== "asking") return null;
      play = quiz.answer(play, key);
    }
  } catch {
    return null;
  }
  return play;
}
