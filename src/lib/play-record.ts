/**
 * A play saved in the browser, so a refresh doesn't lose it. The record holds
 * only what the engine needs to rebuild the play (its seed and answer keys)
 * plus the result screen's reveal. Everything else is replayed through the
 * engine, so a record can never disagree with the bank it is replayed on.
 */

import type { Engine, Play } from "@/games/engine";

export type GameId = "anime-age" | "province";

export interface PlayRecord<TReveal> {
  readonly v: 1;
  readonly seed: number;
  readonly answerKeys: readonly string[];
  readonly reveal?: TReveal;
}

/** Turns stored JSON into a game's reveal, or null when it isn't one. */
export type RevealParser<TReveal> = (value: unknown) => TReveal | null;

export interface RestoredPlay<TValue, TExtras, TLive, TReveal> {
  readonly play: Play<TValue, TExtras, TLive>;
  readonly reveal: TReveal | undefined;
}

export const playRecordKey = (game: GameId): string => `knowyou:play:${game}`;

export function encodePlayRecord<TReveal>(play: Play<unknown, unknown, unknown>, reveal: TReveal | undefined): string {
  const record: PlayRecord<TReveal> = {
    v: 1,
    seed: play.seed,
    answerKeys: play.answers.map((a) => a.answerKey),
    ...(reveal === undefined ? {} : { reveal }),
  };
  return JSON.stringify(record);
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Rebuilds a saved play, or returns null when the record is missing, corrupt,
 * from another version, or no longer replays on the engine's bank.
 */
export function restorePlay<TValue, TExtras, TLive, TReveal>(
  engine: Engine<TValue, TExtras, TLive>,
  raw: string | null,
  parseReveal: RevealParser<TReveal>,
): RestoredPlay<TValue, TExtras, TLive, TReveal> | null {
  if (raw === null) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(value) || value.v !== 1) return null;
  const { seed, answerKeys } = value;
  if (typeof seed !== "number" || !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) return null;
  if (!Array.isArray(answerKeys) || !answerKeys.every((k): k is string => typeof k === "string")) return null;

  let reveal: TReveal | undefined;
  if (value.reveal !== undefined) {
    const parsed = parseReveal(value.reveal);
    if (parsed === null) return null;
    reveal = parsed;
  }

  let play: Play<TValue, TExtras, TLive>;
  try {
    play = engine.start({ seed });
    for (const key of answerKeys) {
      if (play.phase !== "asking") return null;
      play = engine.answer(play, key);
    }
  } catch {
    return null;
  }
  if (reveal !== undefined && play.phase !== "finished") return null;
  return { play, reveal };
}
