import { describe, expect, test } from "bun:test";
import {
  QUESTIONS_PER_PLAY,
  TIERS,
  bandFor,
  createQuiz,
  encodeQuizRecord,
  quizRecordKey,
  restoreQuiz,
  type AskingQuizPlay,
  type Gloss,
  type Quiz,
  type QuizPlay,
} from ".";
import { fixtureContent } from "./testing/fixture-bank";

const quiz = createQuiz(fixtureContent(8));

const rightKey = (play: AskingQuizPlay) => play.question.options.find((o) => o.label.startsWith("right "))!.key;
const wrongKey = (play: AskingQuizPlay) => play.question.options.find((o) => o.label.startsWith("wrong "))!.key;

/** Answers `count` questions, right where `isRight(i)` holds. */
function playThrough(q: Quiz, seed: number, count: number, isRight: (i: number) => boolean = () => true): QuizPlay {
  let play: QuizPlay = q.start(seed);
  for (let i = 0; i < count && play.phase === "asking"; i++) {
    play = q.answer(play, isRight(i) ? rightKey(play) : wrongKey(play));
  }
  return play;
}

describe("a play", () => {
  test("the same seed and answers give the same play", () => {
    const isRight = (i: number) => i % 3 !== 0;
    expect(playThrough(quiz, 42, 12, isRight)).toEqual(playThrough(quiz, 42, 12, isRight));
    expect(playThrough(quiz, 42, 20, isRight)).toEqual(playThrough(quiz, 42, 20, isRight));
  });

  test("asks 20 distinct questions, 5 per tier, easiest tier first", () => {
    for (const seed of [0, 1, 7, 99, 0xffffffff]) {
      const play = playThrough(quiz, seed, QUESTIONS_PER_PLAY);
      expect(play.phase).toBe("finished");
      const questions = play.answered.map((a) => a.question);
      expect(questions.map((q) => q.number)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
      expect(new Set(questions.map((q) => q.id)).size).toBe(20);
      expect(questions.map((q) => q.tier)).toEqual(TIERS.flatMap((tier) => Array(5).fill(tier)));
    }
  });

  test("every question shows its answer and three decoys", () => {
    const play = quiz.start(3);
    const labels = play.question.options.map((o) => o.label).sort();
    const id = play.question.id;
    expect(labels).toEqual([`right ${id}`, `wrong ${id} 1`, `wrong ${id} 2`, `wrong ${id} 3`]);
  });

  test("different seeds draw different questions", () => {
    const drawn = new Set<string>();
    for (let seed = 0; seed < 20; seed++) {
      drawn.add(playThrough(quiz, seed, 20).answered.map((a) => a.question.id).join());
    }
    expect(drawn.size).toBeGreaterThan(15);
  });

  test("over many seeds, the right answer lands in each of the four positions", () => {
    const positions = [0, 0, 0, 0];
    for (let seed = 0; seed < 200; seed++) {
      const play = quiz.start(seed);
      positions[play.question.options.findIndex((o) => o.label.startsWith("right "))]!++;
    }
    for (const count of positions) expect(count).toBeGreaterThan(25);
  });

  test("the score counts right answers, and each answer says whether it was right", () => {
    const isRight = (i: number) => i < 7 || i === 19;
    const play = playThrough(quiz, 5, 20, isRight);
    expect(play.score).toBe(8);
    expect(play.answered.map((a) => a.correct)).toEqual(Array.from({ length: 20 }, (_, i) => isRight(i)));
    const missed = play.answered[10]!;
    expect(missed.chosenKey).not.toBe(missed.rightKey);
    expect(missed.question.options.find((o) => o.key === missed.rightKey)?.label).toBe(`right ${missed.question.id}`);
  });

  test("the running score shows while asking", () => {
    const play = playThrough(quiz, 5, 4, (i) => i !== 1);
    expect(play.phase === "asking" && play.question.number).toBe(5);
    expect(play.score).toBe(3);
    expect(play.answered.at(-1)?.correct).toBe(true);
  });

  test("a finished play carries its band", () => {
    const play = playThrough(quiz, 8, 20, (i) => i < 14);
    expect(play.phase === "finished" && play.band).toEqual({ min: 13, max: 16, title: "band 13-16", line: "line 13-16" });
  });

  test("rejects an answer key that isn't one of the current options", () => {
    const play = quiz.start(1);
    expect(() => quiz.answer(play, "nope")).toThrow();
    const later = playThrough(quiz, 1, 1) as AskingQuizPlay;
    expect(() => quiz.answer(later, play.question.options[0]!.key)).toThrow();
  });

  test("nothing can be answered after question 20", () => {
    const play = playThrough(quiz, 2, 20);
    expect(play.phase).toBe("finished");
    expect(() => quiz.answer(play as unknown as AskingQuizPlay, "a")).toThrow();
  });

  test("a bank with fewer than 5 questions in a tier can't make a play", () => {
    expect(() => createQuiz(fixtureContent(4))).toThrow();
  });

  test("an option with a gloss carries it, wherever the label appears", () => {
    const gloss: Gloss = { romaji: "Waza", kanji: "技", english: "Technique" };
    const glossed = createQuiz(fixtureContent(5, { glosses: { "right easy-0": gloss, "wrong easy-1 2": gloss } }));
    let seen = 0;
    let play: QuizPlay = glossed.start(0, "all");
    while (play.phase === "asking") {
      for (const option of play.question.options) {
        const expected = option.label === "right easy-0" || option.label === "wrong easy-1 2" ? gloss : undefined;
        expect(option.gloss).toEqual(expected);
        if (expected) seen++;
      }
      play = glossed.answer(play, play.question.options[0]!.key);
    }
    expect(seen).toBe(2);
  });
});

describe("an all-questions play", () => {
  const all = (seed: number, count = Infinity, isRight?: (i: number) => boolean) => {
    let play: QuizPlay = quiz.start(seed, "all");
    for (let i = 0; i < count && play.phase === "asking"; i++) {
      play = quiz.answer(play, (isRight?.(i) ?? true) ? rightKey(play) : wrongKey(play));
    }
    return play;
  };

  test("asks every question in the bank once, easiest tier first", () => {
    const play = all(11);
    expect(play.phase).toBe("finished");
    expect(play.total).toBe(32);
    const questions = play.answered.map((a) => a.question);
    expect(questions.map((q) => q.number)).toEqual(Array.from({ length: 32 }, (_, i) => i + 1));
    expect(new Set(questions.map((q) => q.id)).size).toBe(32);
    expect(questions.map((q) => q.tier)).toEqual(TIERS.flatMap((tier) => Array(8).fill(tier)));
  });

  test("ends with the score out of the whole bank and no fan title", () => {
    const play = all(12, Infinity, (i) => i % 2 === 0);
    expect(play.phase === "finished" && play.band).toBeNull();
    expect(play.score).toBe(16);
  });

  test("a standard play still asks 20 and carries its mode", () => {
    expect(quiz.start(1).mode).toBe("standard");
    expect(quiz.start(1).total).toBe(QUESTIONS_PER_PLAY);
  });

  test("a saved all-questions play comes back in the same mode", () => {
    const play = all(13, 25);
    expect(JSON.parse(encodeQuizRecord(play)).mode).toBe("all");
    expect(restoreQuiz(quiz, encodeQuizRecord(play))).toEqual(play);
  });

  test("a saved record with an unknown mode is dropped", () => {
    expect(restoreQuiz(quiz, JSON.stringify({ v: 1, mode: "blitz", seed: 1, answerKeys: [] }))).toBeNull();
  });
});

describe("score bands", () => {
  test("bandFor finds the band that holds the score, ends included", () => {
    expect(bandFor(quiz.bands, 0).title).toBe("band 0-4");
    expect(bandFor(quiz.bands, 4).title).toBe("band 0-4");
    expect(bandFor(quiz.bands, 5).title).toBe("band 5-8");
    expect(bandFor(quiz.bands, 20).title).toBe("band 17-20");
    expect(() => bandFor(quiz.bands, 21)).toThrow();
  });
});

describe("a saved play", () => {
  test("is stored under a key named for the title", () => {
    expect(quizRecordKey(quiz)).toBe("knowyou:play:fixture");
    expect(quizRecordKey(createQuiz(fixtureContent(5, { id: "naruto" })))).toBe("knowyou:play:naruto");
  });

  test("an unfinished play comes back at the same question", () => {
    const play = playThrough(quiz, 9, 7, (i) => i % 2 === 0);
    expect(restoreQuiz(quiz, encodeQuizRecord(play))).toEqual(play);
  });

  test("a finished play comes back finished", () => {
    const play = playThrough(quiz, 9, 20, (i) => i % 2 === 0);
    expect(restoreQuiz(quiz, encodeQuizRecord(play))).toEqual(play);
  });

  test.each([
    ["missing", null],
    ["not JSON", "{oops"],
    ["not an object", "[1,2]"],
    ["another version", JSON.stringify({ v: 2, seed: 1, answerKeys: [] })],
    ["a seed that isn't a 32-bit integer", JSON.stringify({ v: 1, seed: -1, answerKeys: [] })],
    ["answer keys that aren't strings", JSON.stringify({ v: 1, seed: 1, answerKeys: [1] })],
    ["an answer key the play doesn't offer", JSON.stringify({ v: 1, seed: 1, answerKeys: ["nope"] })],
  ])("is dropped when %s", (_, raw) => {
    expect(restoreQuiz(quiz, raw)).toBeNull();
  });

  test("is dropped when it holds more answers than the play asks", () => {
    const play = playThrough(quiz, 4, 20);
    const raw = JSON.stringify({ v: 1, seed: 4, answerKeys: [...play.answerKeys, play.answerKeys[0]] });
    expect(restoreQuiz(quiz, raw)).toBeNull();
  });

  test("is dropped when the bank changed and the saved answers belong to other questions", () => {
    const raw = encodeQuizRecord(playThrough(quiz, 6, 10));
    expect(restoreQuiz(createQuiz(fixtureContent(9)), raw)).toBeNull();
  });
});
