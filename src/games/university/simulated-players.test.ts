import { beforeAll, describe, expect, test } from "bun:test";
import { encodePlayRecord, restorePlay } from "@/lib/play-record";
import {
  UNIVERSITIES,
  UNIVERSITY_IDS,
  UNIVERSITY_RULES,
  createUniversityEngine,
  simulatePlay,
  university,
  universityBank,
  type FinishedUniversityPlay,
  type UniversityId,
} from ".";

const PLAYS_PER_UNIVERSITY = 40;

/**
 * Thresholds, set on 2026-11-26 from what this suite measured once the bank
 * was tuned (1440 plays, seeds fixed): exact 0.906, top-3 0.979, right area
 * 0.994, worst university 0.75 (mahanakorn, ubu), mean questions 14.3. The
 * untuned bank measured exact 0.827, top-3 0.951, area 0.992, worst 0.55.
 *
 * Each is the measure less about three standard errors of a binomial rate at
 * this sample size (exact: √(0.906·0.094/1440) ≈ 0.008; one university:
 * √(0.75·0.25/40) ≈ 0.07), so a bank edit that changes which seeds hit doesn't
 * fail the suite by chance, while a real regression does. Never loosen them to make a change pass.
 */
const THRESHOLDS = { exact: 0.88, top3: 0.96, area: 0.98, worstUniversity: 0.5, meanQuestionsAtMost: 17 } as const;

describe("simulated players over the full bank", () => {
  let results: { home: UniversityId; play: FinishedUniversityPlay }[] = [];
  const rate = (f: (r: (typeof results)[number]) => boolean, of = results) => of.filter(f).length / of.length;

  beforeAll(() => {
    results = UNIVERSITY_IDS.flatMap((home, h) =>
      Array.from({ length: PLAYS_PER_UNIVERSITY }, (_, s) => ({ home, play: simulatePlay(home, h * 1000 + s) })),
    );
    const perUniversity = UNIVERSITY_IDS.map((home) => ({ home, rate: rate((r) => r.play.guess.value === home, results.filter((r) => r.home === home)) }));
    const worst = perUniversity.reduce((a, b) => (b.rate < a.rate ? b : a));
    const asked = results.reduce((s, r) => s + r.play.questionsAsked, 0) / results.length;
    console.log(
      `simulated: ${results.length} plays, exact ${rate((r) => r.play.guess.value === r.home).toFixed(3)}, ` +
        `top-3 ${rate((r) => r.play.extras.top.some((c) => c.id === r.home)).toFixed(3)}, ` +
        `area ${rate((r) => UNIVERSITIES[r.play.guess.value].area === UNIVERSITIES[r.home].area).toFixed(3)}, ` +
        `worst ${worst.home} at ${worst.rate.toFixed(2)}, mean questions ${asked.toFixed(1)}`,
    );
  }, 120_000);

  test(`guesses the exact university in at least ${THRESHOLDS.exact * 100}% of plays`, () => {
    expect(rate((r) => r.play.guess.value === r.home)).toBeGreaterThanOrEqual(THRESHOLDS.exact);
  });

  test(`has the true university in its top 3 in at least ${THRESHOLDS.top3 * 100}% of plays`, () => {
    expect(rate((r) => r.play.extras.top.some((c) => c.id === r.home))).toBeGreaterThanOrEqual(THRESHOLDS.top3);
  });

  test(`guesses the right area in at least ${THRESHOLDS.area * 100}% of plays`, () => {
    expect(rate((r) => UNIVERSITIES[r.play.guess.value].area === UNIVERSITIES[r.home].area)).toBeGreaterThanOrEqual(THRESHOLDS.area);
  });

  test("no university is a blind spot", () => {
    for (const home of UNIVERSITY_IDS) {
      const mine = results.filter((r) => r.home === home);
      expect({ home, ok: rate((r) => r.play.guess.value === home, mine) >= THRESHOLDS.worstUniversity }).toEqual({ home, ok: true });
    }
  });

  test("asks between the minimum and maximum, with a short mean", () => {
    for (const { play } of results) {
      expect(play.questionsAsked).toBeGreaterThanOrEqual(UNIVERSITY_RULES.minQuestions);
      expect(play.questionsAsked).toBeLessThanOrEqual(UNIVERSITY_RULES.maxQuestions);
    }
    expect(results.reduce((s, r) => s + r.play.questionsAsked, 0) / results.length).toBeLessThanOrEqual(THRESHOLDS.meanQuestionsAtMost);
  });

  test("asks at most four pick questions, never two in a row, each with 3–4 signatures and no hints", () => {
    for (const { play } of results) {
      const picks = play.answers.map((a) => a.questionId.startsWith("pick:"));
      expect(picks.filter(Boolean).length).toBeLessThanOrEqual(UNIVERSITY_RULES.picksPerPlay);
      picks.forEach((isPick, i) => expect(isPick && picks[i - 1]).toBeFalsy());
    }
    const pickIds = results.flatMap((r) => r.play.answers.filter((a) => a.questionId.startsWith("pick:")).map((a) => a.questionId));
    expect(pickIds.length).toBeGreaterThan(0);
    for (const id of pickIds.slice(0, 200)) {
      const options = university.answerRows(id).options;
      expect(options.length - 2).toBeGreaterThanOrEqual(3);
      expect(options.length - 2).toBeLessThanOrEqual(4);
      expect(options.slice(-2).map((o) => o.label)).toEqual(["ไม่มีอันไหนเลย", "ไม่แน่ใจ"]);
      expect(options.filter((o) => o.hint !== undefined)).toEqual([]);
    }
  });

  test("the result lists the top candidates and the answers that pointed at the guess", () => {
    for (const { play } of results.slice(0, 300)) {
      expect(play.extras.top[0]?.id).toBe(play.guess.value);
      expect(play.extras.top).toHaveLength(UNIVERSITY_RULES.topCandidates);
      expect(play.extras.pointers.length).toBeLessThanOrEqual(UNIVERSITY_RULES.pointers);
      for (const i of play.extras.pointers) expect(play.answers[i]).toBeDefined();
      expect(play.extras.belief.reduce((s, p) => s + p, 0)).toBeCloseTo(1, 9);
    }
  });
});

describe("a play", () => {
  test("is reproducible from its seed and answers, pick questions included", () => {
    expect(simulatePlay("cmu", 42)).toEqual(simulatePlay("cmu", 42));
  });

  test("varies between seeds", () => {
    const firsts = new Set(
      Array.from({ length: 20 }, (_, seed) => {
        const play = university.start({ seed });
        return play.phase === "asking" ? play.question.id : null;
      }),
    );
    expect(firsts.size).toBeGreaterThan(1);
  });

  test("answering never changes the earlier play, and answering it twice gives the same result", () => {
    const start = university.start({ seed: 7 });
    if (start.phase !== "asking") throw new Error("a fresh play asks a question");
    const snapshot = structuredClone(start);
    const key = start.question.options[0]!.key;
    expect(university.answer(start, key)).toEqual(university.answer(start, key));
    expect(start).toEqual(snapshot);
  });

  test("numbers questions from 1 and reports confidence between 0 and 1", () => {
    let play = university.start({ seed: 3 });
    let expected = 1;
    while (play.phase === "asking") {
      expect(play.questionNumber).toBe(expected++);
      expect(play.confidence).toBeGreaterThan(0);
      expect(play.confidence).toBeLessThanOrEqual(1);
      play = university.answer(play, play.question.options[0]!.key);
    }
  });

  test("rejects an answer the question doesn't offer", () => {
    const play = university.start({ seed: 1 });
    if (play.phase !== "asking") throw new Error("a fresh play asks a question");
    expect(() => university.answer(play, "not-an-answer")).toThrow();
  });

  test("a saved play with pick questions in it restores exactly", () => {
    const finished = simulatePlay("chula", 9);
    expect(finished.answers.some((a) => a.questionId.startsWith("pick:"))).toBe(true);
    const parseReveal = (value: unknown) => (value === "right" ? ("right" as const) : null);
    expect(restorePlay(university, encodePlayRecord(finished, "right"), parseReveal)).toEqual({ play: finished, reveal: "right" });
  });

  test("guesses once the bank is used up, even before the minimum", () => {
    const small = createUniversityEngine(universityBank.list.slice(0, 3), { picks: false });
    let play = small.start({ seed: 1 });
    while (play.phase === "asking") play = small.answer(play, play.question.options[0]!.key);
    expect(play.questionsAsked).toBe(3);
  });

  test("names the university in full", () => {
    const play = simulatePlay("cmu", 5);
    expect(play.guess.label).toBe(`คุณเรียนที่${UNIVERSITIES[play.guess.value].name}`);
  });
});
