import { describe, expect, test } from "bun:test";
import { animeAge, animeAgeBank, createAnimeAgeEngine, type AnimeAgePlay } from "@/games/anime-age";
import { encodePlayRecord, playRecordKey, restorePlay, type RevealParser } from "./play-record";

type Reveal = { readonly kind: "right" } | { readonly kind: "wrong"; readonly realAge: number };

const parseReveal: RevealParser<Reveal> = (value) => {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (v.kind === "right") return { kind: "right" };
  if (v.kind === "wrong" && typeof v.realAge === "number") return { kind: "wrong", realAge: v.realAge };
  return null;
};

function playFor(engine: typeof animeAge, seed: number, answers: number): AnimeAgePlay {
  let play = engine.start({ seed });
  for (let i = 0; i < answers && play.phase === "asking"; i++) {
    play = engine.answer(play, play.question.options[i % play.question.options.length]!.key);
  }
  return play;
}

function finishedPlay() {
  let play = animeAge.start({ seed: 11 });
  while (play.phase === "asking") play = animeAge.answer(play, play.question.options[1]!.key);
  return play;
}

describe("a saved play", () => {
  test("is stored under a key per game", () => {
    expect(playRecordKey("anime-age")).toBe("knowyou:play:anime-age");
    expect(playRecordKey("province")).toBe("knowyou:play:province");
  });

  test("an unfinished play comes back at the same question", () => {
    const play = playFor(animeAge, 5, 7);
    const restored = restorePlay(animeAge, encodePlayRecord(play, undefined), parseReveal);
    expect(restored?.play).toEqual(play);
    expect(restored?.reveal).toBeUndefined();
    expect(restored?.play.phase === "asking" && restored.play.questionNumber).toBe(8);
  });

  test("a finished play comes back with its reveal", () => {
    const play = finishedPlay();
    const reveal: Reveal = { kind: "wrong", realAge: 33 };
    const restored = restorePlay(animeAge, encodePlayRecord(play, reveal), parseReveal);
    expect(restored).toEqual({ play, reveal });
  });

  test.each([
    ["missing", null],
    ["not JSON", "{oops"],
    ["not an object", "[1,2]"],
    ["another version", JSON.stringify({ v: 2, seed: 1, answerKeys: [] })],
    ["a seed that isn't a 32-bit integer", JSON.stringify({ v: 1, seed: -1, answerKeys: [] })],
    ["answer keys that aren't strings", JSON.stringify({ v: 1, seed: 1, answerKeys: [1] })],
    ["a reveal the game doesn't know", JSON.stringify({ v: 1, seed: 1, answerKeys: [], reveal: { kind: "maybe" } })],
  ])("is dropped when %s", (_, raw) => {
    expect(restorePlay(animeAge, raw, parseReveal)).toBeNull();
  });

  test("is dropped when a reveal sits on an unfinished play", () => {
    const raw = encodePlayRecord(playFor(animeAge, 5, 3), { kind: "right" });
    expect(restorePlay(animeAge, raw, parseReveal)).toBeNull();
  });

  test("is dropped when the bank changed and an answer no longer replays", () => {
    const raw = encodePlayRecord(playFor(animeAge, 5, 6), undefined);
    const smaller = createAnimeAgeEngine(animeAgeBank.list.filter((q) => q.kind === "pick"));
    expect(restorePlay(smaller, raw, parseReveal)).toBeNull();
    expect(restorePlay(animeAge, JSON.stringify({ v: 1, seed: 5, answerKeys: ["no-such-answer"] }), parseReveal)).toBeNull();
  });

  test("is dropped when it holds more answers than the play asks", () => {
    const play = finishedPlay();
    const raw = JSON.stringify({ v: 1, seed: play.seed, answerKeys: [...play.answers.map((a) => a.answerKey), "lot"] });
    expect(restorePlay(animeAge, raw, parseReveal)).toBeNull();
  });
});
