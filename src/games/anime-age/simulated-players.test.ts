import { beforeAll, describe, expect, test } from "bun:test";
import { AGES, ANIME_AGE_RULES, ERA_BANDS, animeAge, animeAgeBank, createAnimeAgeEngine, isHit, type Age, type FinishedAnimeAgePlay } from ".";
import { simulatePlay } from "./testing/simulated-player";

const PLAYS_PER_AGE = 40;

describe("simulated players over the full bank", () => {
  let results: { age: Age; play: FinishedAnimeAgePlay }[] = [];

  beforeAll(() => {
    results = AGES.flatMap((age) =>
      Array.from({ length: PLAYS_PER_AGE }, (_, s) => ({ age, play: simulatePlay(age, age * 1000 + s) })),
    );
    const hits = results.filter((r) => isHit(r.play.guess.value, r.age)).length;
    const rates = AGES.map((age) => {
      const mine = results.filter((r) => r.age === age);
      return { age, rate: mine.filter((r) => isHit(r.play.guess.value, age)).length / mine.length };
    });
    const worst = rates.reduce((a, b) => (b.rate < a.rate ? b : a));
    const asked = results.reduce((s, r) => s + r.play.questionsAsked, 0) / results.length;
    console.log(
      `simulated: ${results.length} plays, hit rate ${(hits / results.length).toFixed(3)}, ` +
        `worst age ${worst.age} at ${worst.rate.toFixed(3)}, mean questions ${asked.toFixed(1)}`,
    );
  }, 120_000);

  test("hit within ±1 year in at least 80% of plays", () => {
    const hits = results.filter((r) => isHit(r.play.guess.value, r.age)).length;
    expect(hits / results.length).toBeGreaterThanOrEqual(0.8);
  });

  test("no age is a blind spot: every age hits in at least half its plays", () => {
    for (const age of AGES) {
      const mine = results.filter((r) => r.age === age);
      const rate = mine.filter((r) => isHit(r.play.guess.value, age)).length / mine.length;
      expect({ age, ok: rate >= 0.5 }).toEqual({ age, ok: true });
    }
  });

  test("every play stops by the maximum and never guesses before the minimum", () => {
    for (const { play } of results) {
      expect(play.questionsAsked).toBeLessThanOrEqual(ANIME_AGE_RULES.maxQuestions);
      expect(play.questionsAsked).toBeGreaterThanOrEqual(ANIME_AGE_RULES.minQuestions);
      expect(play.answers).toHaveLength(play.questionsAsked);
    }
  });

  test("the result names a deciding answer and one memory stratum per era band", () => {
    for (const { play } of results.slice(0, 200)) {
      if (play.decidingAnswer !== null) expect(play.answers[play.decidingAnswer]).toBeDefined();
      expect(play.extras.strata.map((s) => s.band)).toEqual([...ERA_BANDS]);
      for (const s of play.extras.strata) {
        expect(s.knowledge).toBeGreaterThanOrEqual(0);
        expect(s.knowledge).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("a play", () => {
  test("is reproducible from its seed and answers", () => {
    expect(simulatePlay(27, 42)).toEqual(simulatePlay(27, 42));
  });

  test("varies between seeds", () => {
    const firsts = new Set(
      Array.from({ length: 20 }, (_, seed) => {
        const play = animeAge.start({ seed });
        return play.phase === "asking" ? play.question.id : null;
      }),
    );
    expect(firsts.size).toBeGreaterThan(1);
  });

  test("answering never changes the earlier play, and answering it twice gives the same result", () => {
    const start = animeAge.start({ seed: 7 });
    if (start.phase !== "asking") throw new Error("a fresh play asks a question");
    const snapshot = structuredClone(start);
    const key = start.question.options[0]!.key;
    expect(animeAge.answer(start, key)).toEqual(animeAge.answer(start, key));
    expect(start).toEqual(snapshot);
  });

  test("numbers questions from 1 and reports confidence between 0 and 1", () => {
    let play = animeAge.start({ seed: 3 });
    let expected = 1;
    while (play.phase === "asking") {
      expect(play.questionNumber).toBe(expected++);
      expect(play.confidence).toBeGreaterThan(0);
      expect(play.confidence).toBeLessThanOrEqual(1);
      play = animeAge.answer(play, play.question.options.at(-1)!.key);
    }
  });

  test("rejects an answer the question doesn't offer", () => {
    const play = animeAge.start({ seed: 1 });
    if (play.phase !== "asking") throw new Error("a fresh play asks a question");
    expect(() => animeAge.answer(play, "not-an-answer")).toThrow();
  });

  test("guesses once the bank is used up, even before the minimum", () => {
    const small = createAnimeAgeEngine(animeAgeBank.list.slice(0, 5));
    let play = small.start({ seed: 1 });
    while (play.phase === "asking") play = small.answer(play, play.question.options[0]!.key);
    expect(play.questionsAsked).toBe(5);
  });

  test("a cue question shows its cue, quoted for a song or a line, and the answer log keeps it", () => {
    for (const [type, quoted] of [["song", true], ["quote", true], ["character", false]] as const) {
      const question = animeAgeBank.list.find((q) => q.kind === "cue" && q.type === type);
      if (question?.kind !== "cue") throw new Error(`the bank has a ${type} cue`);
      const engine = createAnimeAgeEngine([question]);
      const play = engine.start({ seed: 1 });
      if (play.phase !== "asking") throw new Error("a fresh play asks a question");
      expect(play.question.cue).toEqual({ text: question.text, quoted });
      expect(play.question.options.at(-1)?.label).toBe("ไม่รู้ / นึกไม่ออก");
      const after = engine.answer(play, play.question.options[0]!.key);
      expect(after.answers[0]?.cue).toBe(question.text);
    }
  });

  test("an edge guess hits every age on its side", () => {
    expect(isHit({ kind: "atMost", age: 10 }, 7)).toBe(true);
    expect(isHit({ kind: "atMost", age: 10 }, 12)).toBe(false);
    expect(isHit({ kind: "atLeast", age: 50 }, 63)).toBe(true);
    expect(isHit({ kind: "exact", age: 30 }, 31)).toBe(true);
    expect(isHit({ kind: "exact", age: 30 }, 32)).toBe(false);
  });
});
