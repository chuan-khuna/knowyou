import { describe, expect, test } from "bun:test";
import {
  MIN_QUESTIONS_PER_PLAY,
  QUESTIONS_PER_PLAY,
  TIERS,
  bandFor,
  createQuiz,
  encodeQuizRecord,
  quizRecordKey,
  restoreQuiz,
  termsIn,
  type AskingQuizPlay,
  type Gloss,
  type Quiz,
  type QuizPlay,
} from ".";
import { fixtureBank, fixtureContent } from "./testing/fixture-bank";

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
    let play: QuizPlay = glossed.start(0, glossed.size);
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

describe("terms named in a prompt", () => {
  const sky: Gloss = { romaji: "Ōzora", kanji: "大空", english: "Sky Flame" };
  const big: Gloss = { romaji: "Ōzora no Hono", kanji: "大空の炎", english: "Flame of the Sky" };

  test("a term counts only on Thai word boundaries, longest first, each once", () => {
    const glosses = { นภา: sky, ไฟแห่งนภา: big };
    expect(termsIn("ทำไมแหวนแห่งนภาจึงปฏิเสธซันซัส?", glosses)).toEqual([{ label: "นภา", gloss: sky }]);
    expect(termsIn("ในภาคอนาคต ใครคือผู้นำ?", glosses)).toEqual([]);
    expect(termsIn("ไฟแห่งนภา กับนภา และนภา?", glosses)).toEqual([
      { label: "ไฟแห่งนภา", gloss: big },
      { label: "นภา", gloss: sky },
    ]);
  });

  test("each question card carries the terms its prompt names", () => {
    const gloss: Gloss = { romaji: "Waza", kanji: "技", english: "Technique" };
    const bank = Object.fromEntries(
      Object.entries(fixtureBank(5)).map(([id, q]) => [id, id === "easy-0" ? { ...q, prompt: "who uses right easy-1?" } : q]),
    );
    const titled = createQuiz(fixtureContent(5, { bank, glosses: { "right easy-1": gloss } }));
    let play: QuizPlay = titled.start(0, titled.size);
    const terms: Record<string, unknown> = {};
    while (play.phase === "asking") {
      terms[play.question.id] = play.question.terms;
      play = titled.answer(play, play.question.options[0]!.key);
    }
    expect(terms["easy-0"]).toEqual([{ label: "right easy-1", gloss }]);
    expect(terms["easy-1"]).toEqual([]);
  });
});

describe("a play of any count", () => {
  const playCount = (seed: number, count: number, answers = Infinity, isRight?: (i: number) => boolean) => {
    let play: QuizPlay = quiz.start(seed, count);
    for (let i = 0; i < answers && play.phase === "asking"; i++) {
      play = quiz.answer(play, (isRight?.(i) ?? true) ? rightKey(play) : wrongKey(play));
    }
    return play;
  };
  const tiersOf = (play: QuizPlay) => play.answered.map((a) => a.question.tier);

  test("defaults to 20", () => {
    expect(quiz.start(1).total).toBe(QUESTIONS_PER_PLAY);
    expect(quiz.start(1)).toEqual(quiz.start(1, 20));
  });

  test("the bank's size asks every question once, easiest tier first", () => {
    const play = playCount(11, quiz.size);
    expect(play.phase).toBe("finished");
    expect(play.total).toBe(32);
    expect(new Set(play.answered.map((a) => a.question.id)).size).toBe(32);
    expect(tiersOf(play)).toEqual(TIERS.flatMap((tier) => Array(8).fill(tier)));
  });

  test("deals the count round-robin over the tiers, easiest first", () => {
    const tiers = (counts: number[]) => TIERS.flatMap((tier, i) => Array(counts[i]).fill(tier));
    expect(tiersOf(playCount(3, 5))).toEqual(tiers([2, 1, 1, 1]));
    expect(tiersOf(playCount(3, 23))).toEqual(tiers([6, 6, 6, 5]));
  });

  test("a tier that runs out is skipped and the rest take its share", () => {
    const big = createQuiz(fixtureContent(15));
    let play: QuizPlay = big.start(4, 50);
    while (play.phase === "asking") play = big.answer(play, play.question.options[0]!.key);
    expect(tiersOf(play)).toEqual(TIERS.flatMap((tier, i) => Array([13, 13, 12, 12][i]).fill(tier)));
    const tenEasy = Object.entries(fixtureBank(10)).filter(([id]) => id.startsWith("easy-"));
    const lopsided = createQuiz(fixtureContent(5, { bank: { ...fixtureBank(5), ...Object.fromEntries(tenEasy) } }));
    let all: QuizPlay = lopsided.start(4, 25);
    while (all.phase === "asking") all = lopsided.answer(all, all.question.options[0]!.key);
    expect(tiersOf(all)).toEqual(TIERS.flatMap((tier, i) => Array([10, 5, 5, 5][i]).fill(tier)));
  });

  test.each([MIN_QUESTIONS_PER_PLAY - 1, 33, 7.5, Number.NaN])("refuses a count of %p", (count) => {
    expect(() => quiz.start(1, count)).toThrow();
  });

  test("every finished play has a fan title, for the score scaled to 20", () => {
    // 16 of 32 scales to 10 of 20.
    expect(playCount(12, 32, Infinity, (i) => i % 2 === 0)).toMatchObject({ phase: "finished", score: 16, band: { title: "band 9-12" } });
    // 4 of 5 scales to 16 of 20.
    expect(playCount(12, 5, Infinity, (i) => i > 0)).toMatchObject({ score: 4, band: { title: "band 13-16" } });
    expect(playCount(12, 5, Infinity, () => false)).toMatchObject({ score: 0, band: { title: "band 0-4" } });
    expect(playCount(12, 32)).toMatchObject({ score: 32, band: { title: "band 17-20" } });
  });

  test("a saved play of another count comes back with its count", () => {
    const play = playCount(13, 25, 9);
    expect(JSON.parse(encodeQuizRecord(play)).count).toBe(25);
    expect(restoreQuiz(quiz, encodeQuizRecord(play))).toEqual(play);
    expect(JSON.parse(encodeQuizRecord(quiz.start(13))).count).toBeUndefined();
  });

  test("a record saved before counts, in the old all-questions mode, restores as the whole bank", () => {
    const play = playCount(13, quiz.size, 25);
    const old = JSON.stringify({ v: 1, mode: "all", seed: 13, answerKeys: play.answerKeys });
    expect(restoreQuiz(quiz, old)).toEqual(play);
  });

  test.each([
    ["an unknown mode", { mode: "blitz" }],
    ["a count that isn't a number", { count: "50" }],
    ["a count the bank can't fill", { count: 33 }],
    ["a count under the least", { count: 4 }],
  ])("a saved record with %s is dropped", (_, extra) => {
    expect(restoreQuiz(quiz, JSON.stringify({ v: 1, seed: 1, answerKeys: [], ...extra }))).toBeNull();
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
